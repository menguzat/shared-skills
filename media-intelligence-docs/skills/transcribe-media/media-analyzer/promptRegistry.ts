import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { AnalysisStyle } from "./schemas.js";
import { normalizeStyle } from "./schemas.js";

export interface AnalysisPrompt {
  id: AnalysisStyle;
  displayName: string;
  description: string;
  expectedMediaTypes: string[];
  outputSchemaId: string;
  defaultModelTier: "fast" | "pro";
  formatter: string;
  version: string;
  body: string;
  filePath: string;
  hash: string;
}

const here = dirname(fileURLToPath(import.meta.url));
export const promptDirectory = resolve(here, "../analysis-prompts");

export async function listPrompts(directory = promptDirectory): Promise<AnalysisPrompt[]> {
  const files = (await readdir(directory)).filter((file) => file.endsWith(".md")).sort();
  const prompts = await Promise.all(files.map((file) => loadPromptFile(join(directory, file))));
  return prompts.sort((a, b) => a.id.localeCompare(b.id));
}

export async function loadPrompt(style: AnalysisStyle, directory = promptDirectory): Promise<AnalysisPrompt> {
  const prompts = await listPrompts(directory);
  const prompt = prompts.find((item) => item.id === style);
  if (!prompt) {
    throw new Error(`Unknown analysis style '${style}'. Available styles: ${prompts.map((item) => item.id).join(", ")}`);
  }
  return prompt;
}

export async function loadCustomPromptFile(filePath: string, schemaId = "custom"): Promise<AnalysisPrompt> {
  const body = await readFile(filePath, "utf8");
  return {
    id: "custom",
    displayName: "Custom Prompt",
    description: `Custom prompt loaded from ${filePath}`,
    expectedMediaTypes: ["audio", "video", "image", "text"],
    outputSchemaId: schemaId,
    defaultModelTier: "pro",
    formatter: "generic",
    version: "custom",
    body,
    filePath,
    hash: hashText(body)
  };
}

async function loadPromptFile(filePath: string): Promise<AnalysisPrompt> {
  const content = await readFile(filePath, "utf8");
  const { metadata, body } = parseFrontmatter(content);
  const id = normalizeStyle(metadata.id, "custom");
  return {
    id,
    displayName: stringValue(metadata.displayName, id),
    description: stringValue(metadata.description),
    expectedMediaTypes: arrayValue(metadata.expectedMediaTypes),
    outputSchemaId: stringValue(metadata.outputSchemaId, id),
    defaultModelTier: metadata.defaultModelTier === "fast" ? "fast" : "pro",
    formatter: stringValue(metadata.formatter, "generic"),
    version: stringValue(metadata.version, "1"),
    body,
    filePath,
    hash: hashText(content)
  };
}

function parseFrontmatter(content: string): { metadata: Record<string, unknown>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { metadata: {}, body: content.trim() };
  return { metadata: parseSimpleYaml(match[1]), body: match[2].trim() };
}

function parseSimpleYaml(source: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const lines = source.split(/\r?\n/);
  let currentKey: string | null = null;
  for (const line of lines) {
    if (!line.trim()) continue;
    const listMatch = line.match(/^\s*-\s+(.+)$/);
    if (listMatch && currentKey) {
      const list = Array.isArray(result[currentKey]) ? result[currentKey] as string[] : [];
      list.push(unquote(listMatch[1].trim()));
      result[currentKey] = list;
      continue;
    }
    const keyValue = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (keyValue) {
      currentKey = keyValue[1];
      result[currentKey] = keyValue[2] ? unquote(keyValue[2].trim()) : [];
    }
  }
  return result;
}

function unquote(value: string): string {
  return value.replace(/^["']|["']$/g, "");
}

function arrayValue(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function hashText(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}
