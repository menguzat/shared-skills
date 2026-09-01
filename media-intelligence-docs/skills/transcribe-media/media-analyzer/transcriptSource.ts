import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import type { AnalyzerOutput, TranscriptQualityReport } from "./schemas.js";
import { transcriptFingerprint } from "./transcriptQuality.js";
import { isTranscriptFidelityReportAcceptable } from "./transcriptVerifier.js";

export interface VerifiedTranscriptSource {
  text: string;
  sidecarPath: string;
  sourceMediaFile: string;
  quality: TranscriptQualityReport;
  output: AnalyzerOutput;
}

export async function loadVerifiedTranscriptSource(filePath: string): Promise<VerifiedTranscriptSource> {
  const sidecarPath = extname(filePath).toLowerCase() === ".json"
    ? filePath
    : filePath.replace(/\.[^.]+$/, ".json");
  let parsed: AnalyzerOutput;
  try {
    parsed = JSON.parse(await readFile(sidecarPath, "utf8")) as AnalyzerOutput;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Verified transcript sidecar is required at '${sidecarPath}': ${message}`);
  }
  if (parsed.metadata?.analysisStyle !== "transcript-only") {
    throw new Error(`Source '${sidecarPath}' is not a transcript-only artifact.`);
  }
  const quality = parsed.metadata.transcriptQuality;
  if (!quality || quality.status !== "passed" || quality.fidelity?.status !== "passed") {
    const failed = quality?.failedChecks?.join(", ") || "missing quality certificate";
    const fidelity = quality?.fidelity?.status || "missing fidelity verification";
    throw new Error(`Transcript quality gate has not passed for '${sidecarPath}': ${failed}; fidelity: ${fidelity}.`);
  }
  if (!isTranscriptFidelityReportAcceptable(quality.fidelity)) {
    throw new Error(`Transcript fidelity certificate is semantically invalid in '${sidecarPath}'.`);
  }
  if (quality.segmentCount !== parsed.transcription.length) {
    throw new Error(`Transcript segment count no longer matches its quality certificate in '${sidecarPath}'.`);
  }
  const fingerprint = transcriptFingerprint(parsed);
  if (quality.transcriptFingerprint !== fingerprint) {
    throw new Error(`Transcript content no longer matches its quality certificate in '${sidecarPath}'.`);
  }
  const canonical = parsed.metadata.canonicalTranscript;
  if (!canonical || canonical.transcriptFingerprint !== fingerprint) {
    throw new Error(`Canonical transcript certificate is missing or does not match '${sidecarPath}'.`);
  }
  const text = parsed.transcription.map((segment) => {
    const range = `${segment.timecode}-${segment.endTimecode}`;
    const confidence = segment.speakerConfidence === undefined ? "" : ` [speaker confidence ${segment.speakerConfidence}]`;
    const notes = segment.notes ? `\nNote: ${segment.notes}` : "";
    return `[${range}] ${segment.speaker}${confidence}: ${segment.content}${notes}`;
  }).join("\n\n");
  return {
    text,
    sidecarPath,
    sourceMediaFile: parsed.metadata.sourceFile,
    quality,
    output: parsed
  };
}
