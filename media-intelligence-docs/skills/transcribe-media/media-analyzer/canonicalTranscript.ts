import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { renderMarkdown } from "./formatter.js";
import type { AnalyzerOutput, CanonicalTranscriptCertificate } from "./schemas.js";
import { isTranscriptFidelityReportAcceptable } from "./transcriptVerifier.js";

export interface CanonicalTranscriptVersion {
  version: number;
  certifiedAt: string;
  transcriptFingerprint: string;
  supersedesFingerprint?: string;
  correctionReason?: string;
  model: string;
  promptHash: string;
  jsonPath: string;
  markdownPath: string;
}

export interface CanonicalTranscriptManifest {
  schemaVersion: "canonical-transcript-manifest-v1";
  source: {
    path: string;
    sha256: string;
    sizeBytes: number;
    mtimeMs: number;
    durationSeconds: number;
  };
  currentVersion: number;
  versions: CanonicalTranscriptVersion[];
}

export interface CanonicalWriteResult {
  markdown: string;
  json: string;
  manifest: string;
  version: number;
  reused: boolean;
  acceptedMarkdown: string;
  acceptedJson: string;
}

export async function writeCanonicalTranscript(sourceFile: string, output: AnalyzerOutput, options: {
  supersedesFingerprint?: string;
  correctionReason?: string;
} = {}): Promise<CanonicalWriteResult> {
  const quality = output.metadata.transcriptQuality;
  if (!quality || quality.status !== "passed" || quality.fidelity?.status !== "passed") {
    throw new Error("Only transcripts that passed structural and fidelity gates can become canonical.");
  }

  const paths = canonicalTranscriptPaths(sourceFile);
  await mkdir(paths.directory, { recursive: true });
  const sourceStat = await stat(sourceFile);
  const existing = await readManifest(paths.manifest);
  const sourceSha256 = existing
    && existing.source.sizeBytes === sourceStat.size
    && existing.source.mtimeMs === sourceStat.mtimeMs
    ? existing.source.sha256
    : await sha256File(sourceFile);

  const current = existing?.versions.find((item) => item.version === existing.currentVersion);
  if (current?.transcriptFingerprint === quality.transcriptFingerprint && await canonicalVersionIsReusable(current.jsonPath)) {
    const canonicalOutput = JSON.parse(await readFile(current.jsonPath, "utf8")) as AnalyzerOutput;
    const accepted = await writeTranscriptSnapshot(sourceFile, canonicalOutput, "accepted");
    return {
      markdown: current.markdownPath,
      json: current.jsonPath,
      manifest: paths.manifest,
      version: current.version,
      reused: true,
      acceptedMarkdown: accepted.markdown,
      acceptedJson: accepted.json
    };
  }

  if (options.supersedesFingerprint && existing && !existing.versions.some((item) => item.transcriptFingerprint === options.supersedesFingerprint)) {
    throw new Error(`Superseded transcript fingerprint '${options.supersedesFingerprint}' is not present in ${paths.manifest}.`);
  }

  const version = existing ? Math.max(...existing.versions.map((item) => item.version), 0) + 1 : 1;
  const versionLabel = `v${String(version).padStart(4, "0")}`;
  const jsonPath = join(paths.directory, `${versionLabel}.transcript.json`);
  const markdownPath = join(paths.directory, `${versionLabel}.transcript.md`);
  const supersedesFingerprint = options.supersedesFingerprint || current?.transcriptFingerprint;
  const certificate: CanonicalTranscriptCertificate = {
    schemaVersion: "canonical-transcript-v1",
    version,
    certifiedAt: new Date().toISOString(),
    sourceMediaSha256: sourceSha256,
    sourceSizeBytes: sourceStat.size,
    sourceMtimeMs: sourceStat.mtimeMs,
    transcriptFingerprint: quality.transcriptFingerprint,
    supersedesFingerprint,
    correctionReason: options.correctionReason,
    manifestPath: paths.manifest
  };
  output.metadata.canonicalTranscript = certificate;

  await atomicWrite(jsonPath, `${JSON.stringify(output, null, 2)}\n`);
  await atomicWrite(markdownPath, renderMarkdown(output));
  const accepted = await writeTranscriptSnapshot(sourceFile, output, "accepted");

  const versionEntry: CanonicalTranscriptVersion = {
    version,
    certifiedAt: certificate.certifiedAt,
    transcriptFingerprint: quality.transcriptFingerprint,
    supersedesFingerprint,
    correctionReason: options.correctionReason,
    model: output.metadata.model,
    promptHash: output.telemetry.promptHash,
    jsonPath,
    markdownPath
  };
  const manifest: CanonicalTranscriptManifest = {
    schemaVersion: "canonical-transcript-manifest-v1",
    source: {
      path: resolve(sourceFile),
      sha256: sourceSha256,
      sizeBytes: sourceStat.size,
      mtimeMs: sourceStat.mtimeMs,
      durationSeconds: quality.sourceDurationSeconds
    },
    currentVersion: version,
    versions: [...(existing?.versions || []), versionEntry]
  };
  await atomicWrite(paths.manifest, `${JSON.stringify(manifest, null, 2)}\n`);
  return { markdown: markdownPath, json: jsonPath, manifest: paths.manifest, version, reused: false, acceptedMarkdown: accepted.markdown, acceptedJson: accepted.json };
}

export async function writeTranscriptSnapshot(sourceFile: string, output: AnalyzerOutput, status: "candidate" | "rejected" | "accepted"): Promise<{ markdown: string; json: string }> {
  const dir = join(canonicalTranscriptPaths(sourceFile).directory, "snapshots");
  await mkdir(dir, { recursive: true });
  const suffix = status === "candidate" ? "latest" : status;
  const paths = {
    markdown: join(dir, `${suffix}.transcript.md`),
    json: join(dir, `${suffix}.transcript.json`)
  };
  await atomicWrite(paths.json, `${JSON.stringify(output, null, 2)}\n`);
  await atomicWrite(paths.markdown, renderMarkdown(output));
  if (status !== "candidate") {
    const latest = { markdown: join(dir, "latest.transcript.md"), json: join(dir, "latest.transcript.json") };
    await atomicWrite(latest.json, `${JSON.stringify(output, null, 2)}\n`);
    await atomicWrite(latest.markdown, renderMarkdown(output));
  }
  return paths;
}

async function canonicalVersionIsReusable(jsonPath: string): Promise<boolean> {
  try {
    const output = JSON.parse(await readFile(jsonPath, "utf8")) as AnalyzerOutput;
    const fidelity = output.metadata.transcriptQuality?.fidelity;
    return Boolean(fidelity && isTranscriptFidelityReportAcceptable(fidelity));
  } catch {
    return false;
  }
}

export function canonicalTranscriptPaths(sourceFile: string): { directory: string; manifest: string } {
  const ext = extname(sourceFile);
  const base = basename(sourceFile, ext);
  const directory = join(dirname(sourceFile), ".transcripts", base);
  return { directory, manifest: join(directory, "manifest.json") };
}

async function readManifest(path: string): Promise<CanonicalTranscriptManifest | undefined> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as CanonicalTranscriptManifest;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

async function sha256File(path: string): Promise<string> {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}

async function atomicWrite(path: string, content: string): Promise<void> {
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporary, content, "utf8");
  await rename(temporary, path);
}
