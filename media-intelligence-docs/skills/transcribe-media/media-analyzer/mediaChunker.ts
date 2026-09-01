import { execFile } from "node:child_process";
import { mkdir, stat } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import type { TranscriptSegment } from "./schemas.js";
import { formatDuration, parseCanonicalTimecode, probeMediaDurationSeconds } from "./transcriptQuality.js";

const execFileAsync = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(here, "..");

export interface MediaChunk {
  index: number;
  path: string;
  offsetSeconds: number;
  durationSeconds: number;
}

export async function createMediaChunks(sourceFile: string, chunkSeconds = 120): Promise<{ directory: string; sourceDurationSeconds: number; chunks: MediaChunk[] }> {
  if (!Number.isInteger(chunkSeconds) || chunkSeconds < 30 || chunkSeconds > 900) {
    throw new Error("Chunk duration must be an integer between 30 and 900 seconds.");
  }
  const sourceDurationSeconds = await probeMediaDurationSeconds(sourceFile);
  const sourceStat = await stat(sourceFile);
  const ext = extname(sourceFile) || ".media";
  const base = basename(sourceFile, ext).replace(/[^a-zA-Z0-9._-]+/g, "-");
  const identity = `${sourceStat.size}-${Math.round(sourceStat.mtimeMs)}`;
  const directory = join(skillRoot, "data/chunks", `${base}-${identity}`, `${chunkSeconds}s`);
  await mkdir(directory, { recursive: true });
  const chunks: MediaChunk[] = [];
  for (let offset = 0, index = 0; offset < sourceDurationSeconds; offset += chunkSeconds, index += 1) {
    const expectedDuration = Math.min(chunkSeconds, sourceDurationSeconds - offset);
    const path = join(directory, `${String(index).padStart(4, "0")}-${String(Math.round(offset)).padStart(6, "0")}${ext}`);
    try {
      await stat(path);
    } catch {
      await execFileAsync("ffmpeg", [
        "-hide_banner", "-loglevel", "error", "-y",
        "-ss", String(offset), "-t", String(expectedDuration),
        "-i", sourceFile, "-c", "copy", path
      ]);
    }
    chunks.push({ index, path, offsetSeconds: offset, durationSeconds: await probeMediaDurationSeconds(path) });
  }
  return { directory, sourceDurationSeconds, chunks };
}

export function offsetTranscriptSegments(segments: TranscriptSegment[], offsetSeconds: number): TranscriptSegment[] {
  return segments.map((segment) => ({
    ...segment,
    timecode: offsetTimecode(segment.timecode, offsetSeconds),
    endTimecode: segment.endTimecode ? offsetTimecode(segment.endTimecode, offsetSeconds) : undefined
  }));
}

export function offsetTimecode(timecode: string, offsetSeconds: number): string {
  const parsed = parseCanonicalTimecode(timecode);
  if (parsed === undefined) throw new Error(`Cannot offset non-canonical timecode '${timecode}'.`);
  return formatDuration(parsed + offsetSeconds);
}
