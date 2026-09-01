import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { renderMarkdown } from "./formatter.js";
import type { AnalyzerOutput, TranscriptAttemptSummary } from "./schemas.js";

const here = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(here, "..");
const workspaceRoot = resolve(here, "../../../..");
const fixtureManifestPath = resolve(skillRoot, "regression/fixtures/manifest.json");

export interface RegressionFixture {
  id: string;
  sourceRepoPath: string;
  expectedDurationSeconds: number;
  durationToleranceSeconds: number;
  expectedLanguage: string;
  minimumSegments: number;
  analysisStyles: string[];
}

export interface RegressionRunContext {
  runId: string;
  runDirectory: string;
  fixture?: RegressionFixture;
  sourceFile: string;
  startedAt: string;
}

export async function startRegressionRun(sourceFile: string, fixtureId?: string): Promise<RegressionRunContext> {
  const fixture = fixtureId ? await loadRegressionFixture(fixtureId) : undefined;
  if (fixture && resolve(workspaceRoot, fixture.sourceRepoPath) !== resolve(sourceFile)) {
    throw new Error(`Regression fixture '${fixture.id}' expects '${resolve(workspaceRoot, fixture.sourceRepoPath)}', not '${resolve(sourceFile)}'.`);
  }
  const startedAt = new Date().toISOString();
  const runId = startedAt.replace(/[:.]/g, "-");
  const resolvedSource = resolve(sourceFile);
  const sourceBase = basename(resolvedSource, extname(resolvedSource));
  const runDirectory = join(dirname(resolvedSource), ".transcripts", sourceBase, "runs", runId);
  await mkdir(runDirectory, { recursive: true });
  return { runId, runDirectory, fixture, sourceFile: resolve(sourceFile), startedAt };
}

export async function startAnalysisRun(transcriptFile: string, style: string): Promise<RegressionRunContext> {
  const startedAt = new Date().toISOString();
  const runId = startedAt.replace(/[:.]/g, "-");
  const runDirectory = join(dirname(resolve(transcriptFile)), "analyses", style, runId);
  await mkdir(runDirectory, { recursive: true });
  return { runId, runDirectory, sourceFile: resolve(transcriptFile), startedAt };
}

export async function persistRegressionAttempt(context: RegressionRunContext, attempt: number, output: AnalyzerOutput): Promise<{ json: string; markdown: string }> {
  const label = `attempt-${String(attempt).padStart(2, "0")}`;
  const json = join(context.runDirectory, `${label}.json`);
  const markdown = join(context.runDirectory, `${label}.md`);
  await writeFile(json, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  await writeFile(markdown, renderMarkdown(output), "utf8");
  return { json, markdown };
}

export async function finishRegressionRun(context: RegressionRunContext, options: {
  status: "passed" | "failed";
  attempts: TranscriptAttemptSummary[];
  finalOutput?: AnalyzerOutput;
  artifacts?: Record<string, string | number | boolean | undefined>;
  error?: string;
}): Promise<string> {
  const fixtureChecks = context.fixture && options.finalOutput
    ? evaluateFixture(context.fixture, options.finalOutput)
    : [];
  const status = options.status === "passed" && fixtureChecks.every((check) => check.passed) ? "passed" : "failed";
  const report = {
    schemaVersion: "transcript-regression-run-v1",
    runId: context.runId,
    fixtureId: context.fixture?.id,
    sourceFile: context.sourceFile,
    startedAt: context.startedAt,
    finishedAt: new Date().toISOString(),
    status,
    attempts: options.attempts,
    fixtureChecks,
    artifacts: options.artifacts || {},
    error: options.error
  };
  const reportPath = join(context.runDirectory, "run.json");
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  const latestPath = join(dirname(context.runDirectory), "latest.json");
  await writeFile(latestPath, `${JSON.stringify({ ...report, reportPath }, null, 2)}\n`, "utf8");
  return reportPath;
}

export async function loadRegressionFixture(id: string): Promise<RegressionFixture> {
  const parsed = JSON.parse(await readFile(fixtureManifestPath, "utf8")) as { fixtures?: RegressionFixture[] };
  const fixture = parsed.fixtures?.find((item) => item.id === id);
  if (!fixture) throw new Error(`Unknown regression fixture '${id}' in ${fixtureManifestPath}.`);
  return fixture;
}

function evaluateFixture(fixture: RegressionFixture, output: AnalyzerOutput): Array<{ id: string; passed: boolean; actual: unknown; expected: unknown }> {
  const quality = output.metadata.transcriptQuality;
  const detectedLanguage = output.metadata.language || quality?.fidelity?.detectedLanguage || "";
  return [
    {
      id: "duration",
      passed: Boolean(quality && Math.abs(quality.sourceDurationSeconds - fixture.expectedDurationSeconds) <= fixture.durationToleranceSeconds),
      actual: quality?.sourceDurationSeconds,
      expected: `${fixture.expectedDurationSeconds} +/- ${fixture.durationToleranceSeconds}`
    },
    {
      id: "language",
      passed: normalizeLanguage(detectedLanguage) === normalizeLanguage(fixture.expectedLanguage),
      actual: detectedLanguage,
      expected: fixture.expectedLanguage
    },
    {
      id: "minimum-segments",
      passed: output.transcription.length >= fixture.minimumSegments,
      actual: output.transcription.length,
      expected: fixture.minimumSegments
    },
    {
      id: "quality-gates",
      passed: quality?.status === "passed" && quality.fidelity?.status === "passed",
      actual: { quality: quality?.status, fidelity: quality?.fidelity?.status },
      expected: { quality: "passed", fidelity: "passed" }
    }
  ];
}

function normalizeLanguage(value: string): string {
  const normalized = value.toLowerCase();
  if (/^(tr|tur|turkish|türkçe)/.test(normalized)) return "tr";
  if (/^(en|eng|english)/.test(normalized)) return "en";
  return normalized;
}
