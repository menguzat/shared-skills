import { mkdir, readFile, stat, symlink, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fileTypeFromBuffer } from "file-type";

export const inlineThresholdBytes = 20 * 1024 * 1024;
const here = dirname(fileURLToPath(import.meta.url));
const fileCachePath = resolve(here, "../data/file-cache.json");

async function uploadMediaFile(ai: any, filePath: string, mimeType: string): Promise<any> {
  const base = basename(filePath);
  const isAsciiSafe = /^[\x20-\x7E]+$/.test(base);
  if (isAsciiSafe) {
    return ai.files.upload({ file: filePath, config: { mimeType } });
  }
  const ext = extname(filePath) || ".media";
  const tempDir = resolve(here, "../data/temp");
  await mkdir(tempDir, { recursive: true });
  const safeName = `media_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
  const tempLink = join(tempDir, safeName);
  try {
    await symlink(resolve(filePath), tempLink);
    return await ai.files.upload({ file: tempLink, config: { mimeType } });
  } finally {
    await unlink(tempLink).catch(() => {});
  }
}

export interface PreparedMedia {
  path: string;
  fileName: string;
  sizeBytes: number;
  mimeType: string;
  mode: "inline" | "file-api";
  inlineData?: { mimeType: string; data: string };
  uploadedFile?: { name?: string; uri: string; mimeType: string; state?: string };
}

export type MediaProgressEvent =
  | { stage: "sniff"; filePath: string }
  | { stage: "inline"; sizeBytes: number; mimeType: string }
  | { stage: "cache-hit"; name?: string; uri?: string; state?: string }
  | { stage: "cache-stale"; reason: string }
  | { stage: "upload-start"; sizeBytes: number; mimeType: string }
  | { stage: "upload-complete"; name?: string; uri?: string; state?: string }
  | { stage: "active-wait"; name?: string; state: string; elapsedMs: number; timeoutMs: number }
  | { stage: "active"; name?: string; uri?: string; state?: string; elapsedMs: number };

export type MediaProgressReporter = (event: MediaProgressEvent) => void;

interface CachedFileEntry {
  path: string;
  sizeBytes: number;
  mtimeMs: number;
  mimeType: string;
  name?: string;
  uri: string;
  state?: string;
  cachedAt: string;
}

type FileCache = Record<string, CachedFileEntry>;

export async function sniffMimeType(filePath: string): Promise<string> {
  const buffer = await readFile(filePath);
  const detected = await fileTypeFromBuffer(buffer);
  return detected?.mime || fallbackMimeType(filePath);
}

export async function prepareMedia(filePath: string, ai?: any, thresholdBytes = inlineThresholdBytes, onProgress?: MediaProgressReporter): Promise<PreparedMedia> {
  const info = await stat(filePath);
  onProgress?.({ stage: "sniff", filePath });
  const mimeType = await sniffMimeType(filePath);
  const fileName = basename(filePath);
  if (info.size < thresholdBytes) {
    onProgress?.({ stage: "inline", sizeBytes: info.size, mimeType });
    const buffer = await readFile(filePath);
    return {
      path: filePath,
      fileName,
      sizeBytes: info.size,
      mimeType,
      mode: "inline",
      inlineData: { mimeType, data: buffer.toString("base64") }
    };
  }
  if (!ai?.files?.upload) {
    throw new Error("Gemini File API client is required for media files >= 20MB.");
  }
  const cacheKey = cacheKeyFor(filePath, info.size, info.mtimeMs);
  const cache = await readFileCache();
  const cached = cache[cacheKey];
  if (cached?.name && ai?.files?.get) {
    try {
      const current = await ai.files.get({ name: cached.name });
      const state = String(current.state || cached.state || "ACTIVE");
      if (state === "ACTIVE" || state === "FILE_STATE_ACTIVE") {
        onProgress?.({ stage: "cache-hit", name: current.name || cached.name, uri: current.uri || cached.uri, state });
        return {
          path: filePath,
          fileName,
          sizeBytes: info.size,
          mimeType: current.mimeType || cached.mimeType || mimeType,
          mode: "file-api",
          uploadedFile: {
            name: current.name || cached.name,
            uri: current.uri || cached.uri,
            mimeType: current.mimeType || cached.mimeType || mimeType,
            state
          }
        };
      }
      onProgress?.({ stage: "cache-stale", reason: `cached file state is ${state}` });
    } catch (error) {
      onProgress?.({ stage: "cache-stale", reason: error instanceof Error ? error.message : String(error) });
    }
  }
  onProgress?.({ stage: "upload-start", sizeBytes: info.size, mimeType });
  const uploaded = await uploadMediaFile(ai, filePath, mimeType);
  onProgress?.({ stage: "upload-complete", name: uploaded.name, uri: uploaded.uri, state: uploaded.state });
  const active = await waitForActiveFile(ai, uploaded, fileApiActiveTimeoutMs, onProgress);
  if (!active.uri) throw new Error("Uploaded Gemini file did not return a URI.");
  cache[cacheKey] = {
    path: filePath,
    sizeBytes: info.size,
    mtimeMs: info.mtimeMs,
    mimeType: active.mimeType || mimeType,
    name: active.name,
    uri: active.uri,
    state: active.state,
    cachedAt: new Date().toISOString()
  };
  await writeFileCache(cache);
  return {
    path: filePath,
    fileName,
    sizeBytes: info.size,
    mimeType: active.mimeType || mimeType,
    mode: "file-api",
    uploadedFile: {
      name: active.name,
      uri: active.uri,
      mimeType: active.mimeType || mimeType,
      state: active.state
    }
  };
}

function cacheKeyFor(filePath: string, sizeBytes: number, mtimeMs: number): string {
  return `${resolve(filePath)}|${sizeBytes}|${Math.round(mtimeMs)}`;
}

async function readFileCache(): Promise<FileCache> {
  try {
    const source = await readFile(fileCachePath, "utf8");
    const parsed = JSON.parse(source) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as FileCache : {};
  } catch {
    return {};
  }
}

async function writeFileCache(cache: FileCache): Promise<void> {
  await mkdir(dirname(fileCachePath), { recursive: true });
  await writeFile(fileCachePath, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
}

export const fileApiActiveTimeoutMs = 360_000;

async function waitForActiveFile(ai: any, uploaded: any, timeoutMs = fileApiActiveTimeoutMs, onProgress?: MediaProgressReporter): Promise<any> {
  const started = Date.now();
  let current = uploaded;
  while (Date.now() - started < timeoutMs) {
    const elapsedMs = Date.now() - started;
    const state = String(current.state || "ACTIVE");
    onProgress?.({ stage: "active-wait", name: current.name, state, elapsedMs, timeoutMs });
    if (state === "ACTIVE" || state === "FILE_STATE_ACTIVE") {
      onProgress?.({ stage: "active", name: current.name, uri: current.uri, state, elapsedMs });
      return current;
    }
    if (state === "FAILED" || state === "FILE_STATE_FAILED") {
      throw new Error(`Gemini File API processing failed for ${current.name || current.uri || "uploaded file"}.`);
    }
    await new Promise((resolve) => setTimeout(resolve, 2500));
    if (!current.name || !ai?.files?.get) continue;
    current = await ai.files.get({ name: current.name });
  }
  throw new Error(`Timed out waiting for Gemini File API ACTIVE state for ${uploaded.name || uploaded.uri || "uploaded file"}.`);
}

function fallbackMimeType(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".aac")) return "audio/aac";
  if (lower.endsWith(".m4a")) return "audio/mp4";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}
