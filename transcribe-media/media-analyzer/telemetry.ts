import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { AnalyzerOutput } from "./schemas.js";

export interface TelemetryRecord {
  sourceFile: string;
  outputMarkdown?: string;
  outputJson?: string;
  status: "success" | "error";
  error?: string;
  rawResponsePath?: string;
  rawResponseChars?: number;
  output?: AnalyzerOutput;
}

export function telemetryPath(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, "../data/telemetry.sqlite");
}

export function recordTelemetry(record: TelemetryRecord, dbPath = telemetryPath()): void {
  try {
    writeTelemetryRecord(record, dbPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[media-analyzer] Telemetry unavailable; continuing without SQLite telemetry: ${message}`);
  }
}

function writeTelemetryRecord(record: TelemetryRecord, dbPath: string): void {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS llm_queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      source_file TEXT NOT NULL,
      output_markdown TEXT,
      output_json TEXT,
      prompt_id TEXT,
      prompt_hash TEXT,
      schema_id TEXT,
      analysis_style TEXT,
      model TEXT,
      tokens_in INTEGER,
      tokens_out INTEGER,
      duration_ms INTEGER,
      parse_attempts INTEGER,
      repair_attempts INTEGER,
      raw_response_path TEXT,
      raw_response_chars INTEGER,
      status TEXT NOT NULL,
      error TEXT
    )
  `);
  const columns = new Set(db.prepare("PRAGMA table_info(llm_queries)").all().map((row: any) => String(row.name)));
  if (!columns.has("raw_response_path")) db.exec("ALTER TABLE llm_queries ADD COLUMN raw_response_path TEXT");
  if (!columns.has("raw_response_chars")) db.exec("ALTER TABLE llm_queries ADD COLUMN raw_response_chars INTEGER");
  const output = record.output;
  db.prepare(`
    INSERT INTO llm_queries (
      created_at, source_file, output_markdown, output_json, prompt_id, prompt_hash, schema_id,
      analysis_style, model, tokens_in, tokens_out, duration_ms, parse_attempts, repair_attempts,
      raw_response_path, raw_response_chars, status, error
    ) VALUES (
      @createdAt, @sourceFile, @outputMarkdown, @outputJson, @promptId, @promptHash, @schemaId,
      @analysisStyle, @model, @tokensIn, @tokensOut, @durationMs, @parseAttempts, @repairAttempts,
      @rawResponsePath, @rawResponseChars, @status, @error
    )
  `).run({
    createdAt: new Date().toISOString(),
    sourceFile: record.sourceFile,
    outputMarkdown: record.outputMarkdown,
    outputJson: record.outputJson,
    promptId: output?.telemetry.promptId,
    promptHash: output?.telemetry.promptHash,
    schemaId: output?.telemetry.schemaId,
    analysisStyle: output?.metadata.analysisStyle,
    model: output?.metadata.model,
    tokensIn: output?.telemetry.tokensIn,
    tokensOut: output?.telemetry.tokensOut,
    durationMs: output?.telemetry.durationMs,
    parseAttempts: output?.telemetry.parseAttempts,
    repairAttempts: output?.telemetry.repairAttempts,
    rawResponsePath: record.rawResponsePath,
    rawResponseChars: record.rawResponseChars,
    status: record.status,
    error: record.error
  });
  db.close();
}
