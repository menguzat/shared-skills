import { GoogleGenAI, createPartFromUri, createUserContent } from "@google/genai";
import { basename } from "node:path";
import type { AnalysisPrompt } from "./promptRegistry.js";
import { responseSchemaForStyle, normalizeOutput, type AnalyzerOutput, type AnalysisStyle, type GeminiResponseSchema } from "./schemas.js";
import type { PreparedMedia } from "./mediaHandler.js";
import { parseJsonObject } from "./structuredJson.js";
import { generateGeminiTextStream } from "./geminiRetry.js";
import { getSpeakerRefPart, type SpeakerProfile } from "./speakerRegistry.js";

export interface GeminiAnalyzeOptions {
  media?: PreparedMedia;
  sourceText?: string;
  sourceFile?: string;
  sourceMimeType?: string;
  prompt: AnalysisPrompt;
  model?: string;
  userPrompt?: string;
  responseSchema?: GeminiResponseSchema;
  schemaId?: string;
  speakers?: SpeakerProfile[];
}

export class GeminiJsonParseError extends Error {
  readonly rawResponse: string;
  readonly parseAttempts: number;
  readonly repairAttempts: number;

  constructor(message: string, rawResponse: string, parseAttempts: number, repairAttempts: number) {
    super(message);
    this.name = "GeminiJsonParseError";
    this.rawResponse = rawResponse;
    this.parseAttempts = parseAttempts;
    this.repairAttempts = repairAttempts;
  }
}

export async function analyzeWithGemini(options: GeminiAnalyzeOptions): Promise<AnalyzerOutput> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY is required for live media analysis.");
  const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 0 } });
  const model = assertAllowedGeminiModel(options.model || defaultModel(options.prompt.defaultModelTier));
  const started = Date.now();
  const parts = await buildParts(options, model);
  const responseSchema = options.responseSchema || responseSchemaForStyle(options.prompt.id);
  let lastText = "";
  let lastParseAttempts = 0;
  let lastRepairAttempts = 0;
  let lastError = "Gemini response was not valid JSON.";
  for (let generationAttempt = 1; generationAttempt <= 1; generationAttempt += 1) {
    const generation = await generateGeminiTextStream(ai, {
      model,
      contents: createUserContent(parts as any),
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as any,
        maxOutputTokens: options.prompt.id === "transcript-only" ? 65_536 : 32_768,
        thinkingConfig: { thinkingLevel: options.prompt.id === "transcript-only" ? "LOW" : "MEDIUM", includeThoughts: false },
        httpOptions: { timeout: 0 }
      } as any
    }, "Gemini generation");
    lastText = generation.text;
    const parsed = parseJsonObject(lastText, (value, stats) => normalizeOutput(value, {
      sourceFile: sourceFileName(options),
      model,
      analysisStyle: options.prompt.id,
      promptId: options.prompt.id,
      promptHash: options.prompt.hash,
      schemaId: options.schemaId || options.prompt.outputSchemaId,
      durationMs: Date.now() - started,
      parseAttempts: stats.parseAttempts,
      repairAttempts: stats.repairAttempts
    }));
    lastParseAttempts += parsed.parseAttempts;
    lastRepairAttempts += parsed.repairAttempts;
    if (parsed.ok && parsed.data) {
      parsed.data.telemetry.tokensIn = generation.usage.promptTokenCount;
      parsed.data.telemetry.tokensOut = generation.usage.candidatesTokenCount;
      parsed.data.telemetry.usage = generation.usage;
      parsed.data.telemetry.usageAttempts = [{
        ...generation.usage,
        stage: options.prompt.id === "transcript-only" ? "transcription" : "analysis",
        model,
        attempt: 1
      }];
      parsed.data.telemetry.parseAttempts = lastParseAttempts;
      parsed.data.telemetry.repairAttempts = lastRepairAttempts;
      return parsed.data;
    }
    lastError = parsed.error || lastError;
  }
  throw new GeminiJsonParseError(lastError, lastText, lastParseAttempts, lastRepairAttempts);
}

async function buildParts(options: GeminiAnalyzeOptions, model: string): Promise<unknown[]> {
  const sourceFile = sourceFileName(options);
  const sourceMimeType = options.media?.mimeType || options.sourceMimeType || "text/plain";
  const speakerInstructions: string[] = [];
  const refParts: unknown[] = [];

  if (options.speakers && options.speakers.length > 0) {
    speakerInstructions.push("Enrolled Speakers for Voice Identification:");
    for (const speaker of options.speakers) {
      const ref = await getSpeakerRefPart(speaker);
      const desc = `- Speaker Name: "${speaker.name}" (Role: ${speaker.role || "Participant"}, Gender: ${speaker.gender || "Unspecified"})`;
      speakerInstructions.push(desc);
      if (ref) {
        refParts.push({ text: `[Voice Sample Attachment for "${speaker.name}"]` });
        refParts.push(ref.inlineData);
      }
    }
    speakerInstructions.push("SPEAKER IDENTIFICATION RULE: Compare the vocal timbre, pitch, cadence, and gender of speakers in the target recording against the reference voice samples above. Assign exact speaker names (e.g., 'Mengü', 'Cem', 'Dilan') to transcription segments instead of generic 'Speaker 1' or 'Speaker 2'. Use descriptive gender/role titles for unknown speakers.");
  }

  const instruction = [
    options.prompt.body,
    `Populate metadata.model exactly as "${model}".`,
    `Populate metadata.analysisStyle exactly as "${options.prompt.id}".`,
    "Do not name or imply any non-Gemini transcription model.",
    "Language rule: unless the user explicitly requests another language, write all analysis, summaries, decisions, action items, risks, open questions, evidence claims, warnings, notes, and localized headings in the detected source/transcript language. Preserve source-language quotations.",
    "If optional localized heading translations are uncertain, omit metadata.localizedHeadings.",
    "",
    speakerInstructions.length > 0 ? speakerInstructions.join("\n") : "",
    "",
    `Source file: ${basename(sourceFile)}`,
    `Detected MIME type: ${sourceMimeType}`,
    options.userPrompt ? `Additional user instruction:\n${options.userPrompt}` : ""
  ].filter(Boolean).join("\n");

  if (options.media) {
    const mediaPart = options.media.mode === "inline"
      ? { inlineData: options.media.inlineData }
      : createPartFromUri(options.media.uploadedFile?.uri || "", options.media.uploadedFile?.mimeType || options.media.mimeType);
    return [...refParts, mediaPart, { text: instruction }];
  }
  if (options.sourceText) {
    return [...refParts, { text: `Transcript or source text:\n\n${options.sourceText}` }, { text: instruction }];
  }
  throw new Error("Either media or sourceText is required for analysis.");
}

function sourceFileName(options: GeminiAnalyzeOptions): string {
  return options.media?.path || options.sourceFile || "transcript.txt";
}

export function defaultModel(tier: "fast" | "pro"): string {
  const configured = tier === "fast" ? process.env.GEMINI_MODEL_FAST : process.env.GEMINI_MODEL_PRO;
  return assertAllowedGeminiModel(configured || (tier === "fast" ? "gemini-flash-latest" : "gemini-3.1-pro-preview"));
}

export const allowedGeminiModels = ["gemini-3.1-pro-preview", "gemini-flash-latest"] as const;

export function assertAllowedGeminiModel(model: string): string {
  if (!(allowedGeminiModels as readonly string[]).includes(model)) {
    throw new Error(`Model '${model}' is not allowed. Use only ${allowedGeminiModels.join(" or ")}; Live/realtime and legacy Gemini models are prohibited.`);
  }
  return model;
}

export function parseStyle(value: string | undefined, fallback: AnalysisStyle = "meeting-analysis"): AnalysisStyle {
  const styles: AnalysisStyle[] = ["transcript-only", "meeting-analysis", "oldskool-operational-analysis", "reconciliation-report", "custom"];
  return styles.includes(value as AnalysisStyle) ? value as AnalysisStyle : fallback;
}
