export async function withGeminiTransportRetry<T>(label: string, operation: () => Promise<T>, maxAttempts = 1): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts || !isTransientGeminiError(error)) throw error;
      const delayMs = attempt * 2_000;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[media-analyzer] ${new Date().toISOString()} ${label} transport attempt ${attempt}/${maxAttempts} failed (${message}); retrying in ${delayMs / 1000}s`);
      await delay(delayMs);
    }
  }
  throw lastError;
}

import type { GeminiUsageMetadata } from "./schemas.js";

export interface GeminiStreamResult {
  text: string;
  usage: GeminiUsageMetadata;
}

export async function generateGeminiTextStream(ai: any, parameters: Record<string, unknown>, label: string): Promise<GeminiStreamResult> {
  return withGeminiTransportRetry(label, async () => {
    const stream = await ai.models.generateContentStream(parameters);
    console.error(`[media-analyzer] ${new Date().toISOString()} ${label} stream opened; receiving response`);
    let text = "";
    let chunks = 0;
    let nextProgressCharacters = 10_000;
    let finishReasons: string[] = [];
    let usageMetadata: Record<string, unknown> | undefined;
    for await (const response of stream) {
      if (response.usageMetadata && typeof response.usageMetadata === "object") usageMetadata = response.usageMetadata as Record<string, unknown>;
      const responseFinishReasons = Array.isArray(response.candidates)
        ? response.candidates.map((candidate: any) => String(candidate?.finishReason || "")).filter(Boolean)
        : [];
      if (responseFinishReasons.length) finishReasons = responseFinishReasons;
      const chunk = typeof response.text === "string" ? response.text : "";
      if (!chunk) continue;
      text += chunk;
      chunks += 1;
      if (text.length >= nextProgressCharacters) {
        console.error(`[media-analyzer] ${new Date().toISOString()} ${label} streaming (${chunks} chunks, ${text.length} characters)`);
        nextProgressCharacters += 10_000;
      }
    }
    if (!text) throw new Error(`${label} returned an empty streamed response.`);
    console.error(`[media-analyzer] ${new Date().toISOString()} ${label} stream complete (${chunks} chunks, ${text.length} characters, finish: ${finishReasons.join(",") || "unknown"}, usage: ${JSON.stringify(usageMetadata || {})})`);
    return { text, usage: normalizeGeminiUsage(usageMetadata) };
  });
}

export function normalizeGeminiUsage(value: Record<string, unknown> | undefined): GeminiUsageMetadata {
  return {
    promptTokenCount: usageNumber(value?.promptTokenCount),
    candidatesTokenCount: usageNumber(value?.candidatesTokenCount),
    thoughtsTokenCount: usageNumber(value?.thoughtsTokenCount),
    cachedContentTokenCount: usageNumber(value?.cachedContentTokenCount),
    totalTokenCount: usageNumber(value?.totalTokenCount)
  };
}

export function sumGeminiUsage(values: Array<GeminiUsageMetadata | undefined>): GeminiUsageMetadata {
  return values.reduce<GeminiUsageMetadata>((total, value) => ({
    promptTokenCount: total.promptTokenCount + (value?.promptTokenCount || 0),
    candidatesTokenCount: total.candidatesTokenCount + (value?.candidatesTokenCount || 0),
    thoughtsTokenCount: total.thoughtsTokenCount + (value?.thoughtsTokenCount || 0),
    cachedContentTokenCount: total.cachedContentTokenCount + (value?.cachedContentTokenCount || 0),
    totalTokenCount: total.totalTokenCount + (value?.totalTokenCount || 0)
  }), normalizeGeminiUsage(undefined));
}

export function isTransientGeminiError(error: unknown): boolean {
  const message = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return /fetch failed|network|socket|ECONN|ETIMEDOUT|EAI_AGAIN|429|RESOURCE_EXHAUSTED|500|502|503|504|internal server|service unavailable/i.test(message);
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function usageNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
