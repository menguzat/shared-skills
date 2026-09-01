export interface ParsedJson<T> {
  ok: boolean;
  data?: T;
  error?: string;
  parseAttempts: number;
  repairAttempts: number;
}

export function parseJsonObject<T>(text: string, normalize: (value: unknown, stats: { parseAttempts: number; repairAttempts: number }) => T): ParsedJson<T> {
  const attempts = candidateJsonStrings(text);
  let parseAttempts = 0;
  let repairAttempts = 0;
  let lastError = "";
  for (const candidate of attempts) {
    parseAttempts += 1;
    try {
      return { ok: true, data: normalize(JSON.parse(candidate), { parseAttempts, repairAttempts }), parseAttempts, repairAttempts };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    const repaired = repairJson(candidate);
    if (repaired !== candidate) {
      repairAttempts += 1;
      parseAttempts += 1;
      try {
        return { ok: true, data: normalize(JSON.parse(repaired), { parseAttempts, repairAttempts }), parseAttempts, repairAttempts };
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
      }
    }
  }
  return { ok: false, error: lastError || "Unable to parse JSON", parseAttempts, repairAttempts };
}

function candidateJsonStrings(text: string): string[] {
  const clean = text.trim();
  const candidates: string[] = [];
  const fence = clean.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) candidates.push(fence[1].trim());
  const balanced = extractFirstJsonValue(clean);
  if (balanced) candidates.push(balanced);
  candidates.push(clean);
  return Array.from(new Set(candidates.filter(Boolean)));
}

function repairJson(text: string): string {
  return text
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/[\u201C\u201D]/g, "\"")
    .replace(/[\u2018\u2019]/g, "'");
}

function extractFirstJsonValue(text: string): string {
  const start = findFirstJsonStart(text);
  if (start < 0) return "";
  const stack: string[] = [];
  let inString = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }
    if (char === "\"") {
      inString = true;
      continue;
    }
    if (char === "{" || char === "[") {
      stack.push(char === "{" ? "}" : "]");
      continue;
    }
    if (char === "}" || char === "]") {
      if (!stack.length || stack[stack.length - 1] !== char) return "";
      stack.pop();
      if (!stack.length) return text.slice(start, index + 1);
    }
  }
  return "";
}

function findFirstJsonStart(text: string): number {
  const objectStart = text.indexOf("{");
  const arrayStart = text.indexOf("[");
  if (objectStart < 0) return arrayStart;
  if (arrayStart < 0) return objectStart;
  return Math.min(objectStart, arrayStart);
}
