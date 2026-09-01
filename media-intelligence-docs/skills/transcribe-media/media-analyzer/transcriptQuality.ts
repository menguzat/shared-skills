import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { promisify } from "node:util";
import type { AnalyzerOutput, TranscriptQualityCheck, TranscriptQualityReport } from "./schemas.js";

const execFileAsync = promisify(execFile);

export const transcriptQualityGateVersion = "transcript-quality-v1";

export interface TranscriptQualityOptions {
  sourceDurationSeconds: number;
  mimeType: string;
}

export async function probeMediaDurationSeconds(filePath: string): Promise<number> {
  let stdout: string;
  try {
    const result = await execFileAsync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      filePath
    ], { encoding: "utf8" });
    stdout = result.stdout;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to measure media duration with ffprobe: ${message}`);
  }
  const duration = Number(stdout.trim());
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error(`ffprobe returned an invalid media duration: ${stdout.trim() || "empty output"}`);
  }
  return duration;
}

export function evaluateTranscriptQuality(output: AnalyzerOutput, options: TranscriptQualityOptions): TranscriptQualityReport {
  const checks: TranscriptQualityCheck[] = [];
  const duration = options.sourceDurationSeconds;
  const segments = output.transcription;
  const startTolerance = clamp(duration * 0.02, 3, 20);
  const endTolerance = clamp(duration * 0.02, 5, 60);
  const internalGapTolerance = clamp(duration * 0.01, 20, 90);

  addCheck(checks, "timed-media", isTimedMedia(options.mimeType), "Source must be audio or video for transcript certification.", { mimeType: options.mimeType });
  addCheck(checks, "source-duration", Number.isFinite(duration) && duration > 0, "Source duration must be measured from the media container.", { sourceDurationSeconds: duration });
  addCheck(checks, "segments-present", segments.length > 0, "Transcript must contain at least one segment.", { segmentCount: segments.length });

  const parsed = segments.map((segment, index) => ({
    index,
    segment,
    start: parseCanonicalTimecode(segment.timecode),
    end: parseCanonicalTimecode(segment.endTimecode)
  }));
  const malformed = parsed.filter((item) => item.start === undefined || item.end === undefined).map((item) => item.index);
  addCheck(checks, "canonical-timecodes", malformed.length === 0, "Every segment must have start and end timecodes in HH:MM:SS or HH:MM:SS.sss format.", { malformedSegmentIndexes: malformed });

  const usable = parsed.filter((item): item is typeof item & { start: number; end: number } => item.start !== undefined && item.end !== undefined);
  const invalidRanges = usable.filter((item) => item.end < item.start).map((item) => item.index);
  const outOfBounds = usable.filter((item) => item.start < 0 || item.end > duration + endTolerance).map((item) => item.index);
  addCheck(checks, "valid-ranges", invalidRanges.length === 0 && outOfBounds.length === 0, "Segment ranges must be ordered and remain inside the source timeline.", { invalidRangeIndexes: invalidRanges, outOfBoundsIndexes: outOfBounds });

  const chronologyIssues: number[] = [];
  const largeGaps: Array<{ afterSegment: number; seconds: number }> = [];
  const largeOverlaps: Array<{ afterSegment: number; seconds: number }> = [];
  for (let index = 1; index < usable.length; index += 1) {
    const previous = usable[index - 1];
    const current = usable[index];
    if (current.start < previous.start) chronologyIssues.push(current.index);
    const delta = current.start - previous.end;
    if (delta > internalGapTolerance) largeGaps.push({ afterSegment: previous.index, seconds: round(delta) });
    if (delta < -5) largeOverlaps.push({ afterSegment: previous.index, seconds: round(Math.abs(delta)) });
  }
  addCheck(checks, "chronology", chronologyIssues.length === 0, "Segment starts must be chronological.", { segmentIndexes: chronologyIssues });
  addCheck(checks, "internal-gaps", largeGaps.length === 0, "Large unrepresented timeline gaps are not allowed; silence and non-speech must also be timecoded.", { toleranceSeconds: round(internalGapTolerance), gaps: largeGaps });
  addCheck(checks, "overlaps", largeOverlaps.length === 0, "Segments may overlap briefly for simultaneous speech, but large overlaps indicate broken timecodes.", { toleranceSeconds: 5, overlaps: largeOverlaps });

  const firstStart = usable.length ? usable[0].start : undefined;
  const lastEnd = usable.length ? Math.max(...usable.map((item) => item.end)) : undefined;
  addCheck(checks, "start-boundary", firstStart !== undefined && firstStart <= startTolerance, "Transcript must account for the beginning of the media.", { firstStartSeconds: firstStart, toleranceSeconds: round(startTolerance) });
  addCheck(checks, "end-boundary", lastEnd !== undefined && duration - lastEnd <= endTolerance, "Transcript must account for the end of the media.", { lastEndSeconds: lastEnd, sourceDurationSeconds: round(duration), missingTailSeconds: lastEnd === undefined ? duration : round(Math.max(0, duration - lastEnd)), toleranceSeconds: round(endTolerance) });

  const oversized = usable
    .filter((item) => item.end - item.start > 600 || item.segment.content.length > 12_000)
    .map((item) => ({ index: item.index, durationSeconds: round(item.end - item.start), characters: item.segment.content.length }));
  const implausibleDensity = usable
    .filter((item) => {
      const span = item.end - item.start;
      const words = wordCount(item.segment.content);
      return span >= 10 && words / span > 8;
    })
    .map((item) => ({ index: item.index, wordsPerSecond: round(wordCount(item.segment.content) / (item.end - item.start)) }));
  addCheck(checks, "segment-shape", oversized.length === 0 && implausibleDensity.length === 0, "Segments must remain reviewable and have plausible speech density.", { oversized, implausibleDensity });

  const placeholders = segments
    .map((segment, index) => ({ index, content: `${segment.content}\n${segment.notes || ""}` }))
    .filter((item) => indicatesTranscriptPlaceholder(item.content))
    .map((item) => ({ index: item.index, excerpt: item.content.slice(0, 240) }));
  addCheck(
    checks,
    "placeholder-content",
    placeholders.length === 0,
    "Transcript segments must contain source content, never summaries, simulated output, omitted-transcript markers, or conversation placeholders.",
    { placeholders }
  );

  const minimumSegments = Math.max(1, Math.floor(duration / 120));
  const nonSpeechDuration = usable
    .filter((item) => indicatesNonSpeech(item.segment.content))
    .reduce((total, item) => total + Math.max(0, item.end - item.start), 0);
  const mostlyNonSpeech = duration > 0 && nonSpeechDuration / duration >= 0.8;
  addCheck(
    checks,
    "segment-granularity",
    mostlyNonSpeech || segments.length >= minimumSegments,
    "Speech-heavy media must contain enough natural timed turns to represent the full recording.",
    { segmentCount: segments.length, minimumSegments, mostlyNonSpeech, nonSpeechRatio: round(nonSpeechDuration / duration, 4) }
  );

  const duplicateMetrics = duplicateContentMetrics(segments.map((segment) => segment.content));
  addCheck(checks, "duplicate-content", duplicateMetrics.duplicateRatio <= 0.08, "Long transcript content must not be repeated across segments.", duplicateMetrics);

  const failedChecks = checks.filter((check) => check.status === "failed").map((check) => check.id);
  return {
    version: transcriptQualityGateVersion,
    status: failedChecks.length ? "failed" : "passed",
    checkedAt: new Date().toISOString(),
    sourceDurationSeconds: round(duration),
    transcriptStartSeconds: firstStart === undefined ? undefined : round(firstStart),
    transcriptEndSeconds: lastEnd === undefined ? undefined : round(lastEnd),
    timelineCoverageRatio: lastEnd === undefined || duration <= 0 ? 0 : round(Math.min(1, lastEnd / duration), 4),
    segmentCount: segments.length,
    transcriptFingerprint: transcriptFingerprint(output),
    failedChecks,
    checks
  };
}

export function transcriptFingerprint(output: Pick<AnalyzerOutput, "transcription">): string {
  const canonical = output.transcription.map((segment) => ({
    timecode: segment.timecode,
    endTimecode: segment.endTimecode || "",
    speaker: segment.speaker,
    speakerConfidence: segment.speakerConfidence ?? null,
    content: segment.content,
    notes: segment.notes || ""
  }));
  return createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
}

export function applyTranscriptQualityReport(output: AnalyzerOutput, report: TranscriptQualityReport): AnalyzerOutput {
  output.metadata.transcriptQuality = report;
  output.metadata.duration = formatDuration(report.sourceDurationSeconds);
  output.metadata.warnings = output.metadata.warnings.filter((warning) =>
    !warning.startsWith("Transcript quality gate failed:")
    && !warning.startsWith("Transcript quality warnings:")
    && warning !== "Transcript fidelity verification failed. This output is rejected and must not be analyzed."
  );
  if (report.status === "failed") {
    output.metadata.warnings = Array.from(new Set([
      ...output.metadata.warnings,
      `Transcript quality gate failed: ${report.failedChecks.join(", ")}. This output is rejected and must not be analyzed.`
    ]));
  }
  return output;
}

export function formatDuration(seconds: number): string {
  const totalMilliseconds = Math.round(seconds * 1000);
  const hours = Math.floor(totalMilliseconds / 3_600_000);
  const minutes = Math.floor((totalMilliseconds % 3_600_000) / 60_000);
  const wholeSeconds = Math.floor((totalMilliseconds % 60_000) / 1000);
  const milliseconds = totalMilliseconds % 1000;
  const base = [hours, minutes, wholeSeconds].map((value) => String(value).padStart(2, "0")).join(":");
  return milliseconds ? `${base}.${String(milliseconds).padStart(3, "0")}` : base;
}

export function parseCanonicalTimecode(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const match = value.trim().match(/^(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?$/);
  if (!match) return undefined;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  if (minutes >= 60 || seconds >= 60) return undefined;
  const milliseconds = match[4] ? Number(match[4]) : 0;
  return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
}

function duplicateContentMetrics(contents: string[]): Record<string, unknown> & { duplicateRatio: number } {
  const normalized = contents.map((content) => content.toLocaleLowerCase().replace(/\s+/g, " ").trim());
  const totalCharacters = normalized.reduce((sum, content) => sum + content.length, 0);
  const seen = new Set<string>();
  let duplicateCharacters = 0;
  let duplicateSegments = 0;
  for (const content of normalized) {
    if (content.length < 80) continue;
    if (seen.has(content)) {
      duplicateCharacters += content.length;
      duplicateSegments += 1;
    } else {
      seen.add(content);
    }
  }
  return {
    duplicateRatio: totalCharacters ? round(duplicateCharacters / totalCharacters, 4) : 0,
    duplicateCharacters,
    totalCharacters,
    duplicateSegments
  };
}

function addCheck(checks: TranscriptQualityCheck[], id: string, passed: boolean, message: string, metrics: Record<string, unknown>): void {
  checks.push({ id, status: passed ? "passed" : "failed", message, metrics });
}

function isTimedMedia(mimeType: string): boolean {
  return mimeType.startsWith("audio/") || mimeType.startsWith("video/");
}

function wordCount(value: string): number {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

function indicatesTranscriptPlaceholder(value: string): boolean {
  const normalized = value.toLocaleLowerCase("tr-TR").replace(/\s+/g, " ");
  return [
    /simüle edilmiş (?:çıktı|transkript)/,
    /eksik transkripsiyon/,
    /transcript(?:ion)? (?:omitted|incomplete|not included)/,
    /(?:uzun|kalan|geri kalan|devam eden).{0,60}(?:konuşma|tartışma|görüşme).{0,60}(?:özet|özetlen|devam|atlan)/,
    /(?:long|remaining|rest of).{0,60}(?:conversation|discussion).{0,60}(?:summary|summarized|continues|omitted)/,
    /\[(?:konuşma|tartışma|conversation|discussion).{0,80}(?:özet|summary|continues|omitted)\]/
  ].some((pattern) => pattern.test(normalized));
}

function indicatesNonSpeech(value: string): boolean {
  return /\[[^\]]*(?:sessizlik|müzik|music|gürültü|hışırtı|arka plan|silence|noise|non-speech|beat|melodi|soundtrack|alkış|kahkaha)[^\]]*\]/i.test(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 3): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
