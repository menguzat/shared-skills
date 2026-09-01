import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import type { VerifiedTranscriptSource } from "./transcriptSource.js";
import type { SpeakerProfile } from "./speakerRegistry.js";

const here = dirname(fileURLToPath(import.meta.url));
export const speakerAttributionScript = join(here, "speaker_attribution.py");

export interface SpeakerAttributionSegment {
  segmentIndex: number;
  timecode: string;
  endTimecode: string | null;
  diarizationSpeaker: string | null;
  speakerId: string | null;
  speakerName: string | null;
  confidence: number | null;
  margin: number | null;
  status: "confirmed" | "needs_review" | "unknown";
}

export interface SpeakerAttributionOutput {
  schemaVersion: "speaker-attribution-v1";
  generatedAt: string;
  sourceTranscriptFingerprint: string;
  sourceTranscriptSidecar: string;
  sourceMediaFile: string;
  models: { diarization: string; embedding: string };
  thresholds: { minScore: number; minMargin: number };
  speakers: SpeakerAttributionSegment[];
}

export function speakerAttributionPath(transcript: VerifiedTranscriptSource): string {
  return join(
    dirname(transcript.sidecarPath),
    "analyses",
    "speaker-attribution",
    "cache",
    `${transcript.quality.transcriptFingerprint}.json`
  );
}

export function validateSpeakerAttribution(value: unknown, fingerprint: string): asserts value is SpeakerAttributionOutput {
  const output = value as Partial<SpeakerAttributionOutput>;
  if (output?.schemaVersion !== "speaker-attribution-v1") throw new Error("Speaker attribution returned an unsupported schema.");
  if (output.sourceTranscriptFingerprint !== fingerprint) throw new Error("Speaker attribution fingerprint does not match the certified transcript.");
  if (!Array.isArray(output.speakers)) throw new Error("Speaker attribution is missing transcript segment results.");
  for (const result of output.speakers) {
    if (!Number.isInteger(result.segmentIndex) || !["confirmed", "needs_review", "unknown"].includes(result.status)) {
      throw new Error("Speaker attribution contains an invalid segment result.");
    }
  }
}

export async function runLocalSpeakerAttribution(input: {
  transcript: VerifiedTranscriptSource;
  sourceFile: string;
  speakers: SpeakerProfile[];
  python?: string;
  minScore: number;
  minMargin: number;
}): Promise<string> {
  const speakers = input.speakers.filter((speaker) => speaker.refAudioPath);
  if (!speakers.length) throw new Error("No enrolled speaker has a reference WAV sample.");
  const outputPath = speakerAttributionPath(input.transcript);
  await mkdir(dirname(outputPath), { recursive: true });
  const tempDirectory = await mkdtemp(join(tmpdir(), "lyflab-speaker-attribution-"));
  const configPath = join(tempDirectory, "input.json");
  try {
    await writeFile(configPath, JSON.stringify({
      transcriptPath: input.transcript.sidecarPath,
      sourceFile: resolve(input.sourceFile),
      outputPath,
      sourceTranscriptFingerprint: input.transcript.quality.transcriptFingerprint,
      minScore: input.minScore,
      minMargin: input.minMargin,
      speakers: speakers.map(({ id, name, refAudioPath }) => ({ id, name, refAudioPath })),
    }), "utf8");
    await runProcess(input.python || process.env.SPEAKER_ATTRIBUTION_PYTHON || join(here, ".venv-speaker-attribution", "bin", "python"), [speakerAttributionScript, configPath]);
    const parsed = JSON.parse(await readFile(outputPath, "utf8"));
    validateSpeakerAttribution(parsed, input.transcript.quality.transcriptFingerprint);
    return outputPath;
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
}

function runProcess(command: string, args: string[]): Promise<void> {
  return new Promise((resolveProcess, reject) => {
    const ffmpegLib = process.platform === "darwin"
      ? ["/opt/homebrew/opt/ffmpeg/lib", "/usr/local/opt/ffmpeg/lib"].find(existsSync)
      : undefined;
    const child = spawn(command, args, {
      stdio: "inherit",
      env: ffmpegLib ? { ...process.env, DYLD_FALLBACK_LIBRARY_PATH: ffmpegLib } : process.env,
    });
    child.on("error", (error) => reject(new Error(`Cannot start local speaker attribution with '${command}': ${error.message}`)));
    child.on("exit", (code) => code === 0 ? resolveProcess() : reject(new Error(`Local speaker attribution exited with code ${code}. Install its dependencies with requirements-speaker-attribution.txt.`)));
  });
}
