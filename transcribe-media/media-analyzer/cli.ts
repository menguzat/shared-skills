#!/usr/bin/env tsx
import { GoogleGenAI } from "@google/genai";
import { Command } from "commander";
import { config as loadEnv } from "dotenv";
import { mkdir, readFile, stat, writeFile, readdir, rm } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeWithGemini, defaultModel, GeminiJsonParseError, parseStyle } from "./geminiCore.js";
import { inlineThresholdBytes, prepareMedia, sniffMimeType, type MediaProgressEvent } from "./mediaHandler.js";
import { listPrompts, loadCustomPromptFile, loadPrompt } from "./promptRegistry.js";
import { recordTelemetry } from "./telemetry.js";
import { rawResponsePath, writeOutputs, writePublishedAnalysis, writeRejectedOutputs } from "./formatter.js";
import type { AnalysisStyle, AnalyzerOutput, GeminiResponseSchema, GeminiUsageAttempt, TranscriptAttemptSummary, TranscriptFidelityReport } from "./schemas.js";
import { sumGeminiUsage } from "./geminiRetry.js";
import { applyTranscriptQualityReport, evaluateTranscriptQuality, parseCanonicalTimecode, probeMediaDurationSeconds } from "./transcriptQuality.js";
import { loadVerifiedTranscriptSource } from "./transcriptSource.js";
import { aggregateChunkFidelityReports, applyTranscriptFidelityReport, verifyTranscriptFidelity } from "./transcriptVerifier.js";
import { writeCanonicalTranscript, writeTranscriptSnapshot } from "./canonicalTranscript.js";
import { finishRegressionRun, persistRegressionAttempt, startAnalysisRun, startRegressionRun, type RegressionRunContext } from "./regressionRun.js";
import { applyConvergentFidelityCorrections, summarizeTranscriptAttempt, transcriptAttemptLimit, transcriptRetryInstruction } from "./transcriptReliability.js";
import { applyAnalysisProvenance, applyAnalysisQualityReport, evaluateAnalysisQuality } from "./analysisQuality.js";
import type { VerifiedTranscriptSource } from "./transcriptSource.js";
import { createMediaChunks, offsetTranscriptSegments } from "./mediaChunker.js";
import { enrollSpeaker, listSpeakers, loadSpeakerProfiles } from "./speakerRegistry.js";
import { bindConversationKnowledgeProvenance, conversationKnowledgeCachePath, conversationKnowledgeQualityCheck } from "./conversationKnowledge.js";
import { runLocalSpeakerAttribution } from "./speakerAttribution.js";

const here = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(here, "..");
loadEnv({ path: join(skillRoot, ".env"), override: false, quiet: true });
loadEnv({ path: join(here, ".env"), override: false, quiet: true });
loadEnv({ path: resolve(process.cwd(), ".env"), override: false, quiet: true });

const program = new Command();

program
  .name("media-analyzer")
  .description("Transcribe and analyze local media with reusable prompt styles.")
  .version("0.1.0");

program
  .command("list-prompts")
  .description("List available analysis prompt styles.")
  .action(async () => {
    const prompts = await listPrompts();
    for (const prompt of prompts) {
      console.log(`${prompt.id}\t${prompt.displayName}\t${prompt.description}`);
    }
  });

program
  .command("list-speakers")
  .description("List enrolled or discovered speaker profiles and reference voice samples.")
  .action(async () => {
    const speakers = await listSpeakers();
    if (speakers.length === 0) {
      console.log("No enrolled speakers found. Use 'enroll-speaker <name>' to add one.");
      return;
    }
    for (const s of speakers) {
      console.log(`${s.id}\t${s.name}\t${s.role || "n/a"}\t${s.gender || "n/a"}\t${s.refAudioPath ? "has-voice-sample" : "no-voice-sample"}`);
    }
  });

program
  .command("studio")
  .description("Launch the interactive Conversation Intelligence React Studio web application.")
  .option("--port <port>", "Port to bind the studio web server to.", "3030")
  .action(async (options: { port: string }) => {
    const studioDir = resolve(skillRoot, "studio");
    const port = options.port || "3030";
    console.log(`Starting React Studio from ${studioDir} on port ${port}...`);
    const { spawn } = await import("node:child_process");
    const child = spawn("npm", ["start"], {
      cwd: studioDir,
      stdio: "inherit",
      env: { ...process.env, PORT: port },
    });
    child.on("exit", (code) => {
      process.exit(code ?? 0);
    });
  });

program
  .command("enroll-speaker")
  .description("Enroll a speaker with name, role, gender, and reference voice sample.")
  .argument("<name>", "Speaker full name or display name.")
  .option("--role <role>", "Speaker role or title.")
  .option("--gender <gender>", "Speaker gender (male, female, etc).")
  .option("--audio <path>", "Path to reference voice sample audio file.")
  .action(async (name: string, options: { role?: string; gender?: string; audio?: string }) => {
    const profile = await enrollSpeaker({
      name,
      role: options.role,
      gender: options.gender,
      refAudioPath: options.audio
    });
    console.log(`Successfully enrolled speaker: ${profile.name} (id: ${profile.id})`);
  });

program
  .command("identify-speakers")
  .description("Locally diarize existing audio and match its anonymous speakers to enrolled reference WAVs. Does not retranscribe or edit transcript text.")
  .argument("<transcript>", "Certified canonical transcript JSON or Markdown path.")
  .requiredOption("--source-file <path>", "Current audio file path.")
  .option("--speakers <names>", "Comma-separated speaker names/ids; defaults to all enrolled reference samples.")
  .option("--min-score <score>", "Minimum cosine similarity for a confirmed identity.", "0.75")
  .option("--min-margin <score>", "Minimum first-vs-second similarity margin for a confirmed identity.", "0.08")
  .option("--python <path>", "Python 3.12 interpreter with local attribution dependencies.")
  .action(async (transcriptFile: string, options: { sourceFile: string; speakers?: string; minScore: string; minMargin: string; python?: string }) => {
    try {
      const transcript = await loadVerifiedTranscriptSource(resolve(transcriptFile));
      const sourceFile = resolve(options.sourceFile);
      await stat(sourceFile);
      const minScore = Number(options.minScore);
      const minMargin = Number(options.minMargin);
      if (!Number.isFinite(minScore) || minScore < -1 || minScore > 1 || !Number.isFinite(minMargin) || minMargin < 0 || minMargin > 2) {
        throw new Error("--min-score must be between -1 and 1 and --min-margin between 0 and 2.");
      }
      const speakers = options.speakers
        ? await loadSpeakerProfiles(options.speakers.split(",").map((speaker) => speaker.trim()))
        : await listSpeakers();
      const outputPath = await runLocalSpeakerAttribution({ transcript, sourceFile, speakers, python: options.python, minScore, minMargin });
      console.log(`Speaker attribution: ${outputPath}`);
      console.log("Only confirmed assignments may be promoted into the conversation person graph.");
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  });

program
  .command("transcribe-chunked")
  .description("Fallback transcription for long media using complete sequential excerpts and one absolute merged timeline.")
  .argument("<file>", "Path to an audio or video file.")
  .option("--chunk-seconds <seconds>", "Excerpt duration between 30 and 900 seconds.", "900")
  .option("--max-chunk-attempts <count>", "Complete generations allowed for each rejected excerpt (maximum 2).", "2")
  .option("--model <model>", "Allowed Gemini 3 model override.")
  .option("--resume-run <path>", "Reuse passed excerpt artifacts and convergent findings from a prior chunked run.")
  .option("--regression-fixture <id>", "Persist and evaluate this run against a registered real-media fixture.")
  .option("--supersedes <fingerprint>", "Explicit prior canonical transcript fingerprint corrected by this version.")
  .option("--correction-reason <text>", "Reason recorded when a new canonical version supersedes another.")
  .option("--speakers <names>", "Comma-separated speaker names/ids to resolve and identify in transcription.")
  .action(transcribeChunkedAction);

async function transcribeChunkedAction(file: string, options: { chunkSeconds: string; maxChunkAttempts: string; model?: string; resumeRun?: string; regressionFixture?: string; supersedes?: string; correctionReason?: string; speakers?: string }) {
    const sourceFile = resolve(file);
    const attemptSummaries: TranscriptAttemptSummary[] = [];
    let run: RegressionRunContext | undefined;
    let outputPaths: { markdown?: string; json?: string } = {};
    try {
      const chunkSeconds = Number(options.chunkSeconds);
      const maxChunkAttempts = chunkAttemptLimit(options.maxChunkAttempts);
      const prompt = await loadPrompt("transcript-only");
      const targetSpeakers = options.speakers
        ? await loadSpeakerProfiles(options.speakers.split(",").map((speaker) => speaker.trim()))
        : await listSpeakers();
      const selectedModel = options.model || defaultModel("pro");
      const apiKey = process.env.GEMINI_API_KEY?.trim();
      const uploadClient = apiKey ? new GoogleGenAI({ apiKey }) : undefined;
      run = await startRegressionRun(sourceFile, options.regressionFixture);
      logProgress(`Regression run: ${run.runDirectory}`);
      logProgress(`Creating ${chunkSeconds}s media excerpts with absolute timeline manifest`);
      const chunkSet = await createMediaChunks(sourceFile, chunkSeconds);
      logProgress(`Created ${chunkSet.chunks.length} excerpts: ${chunkSet.directory}`);
      const mergedSegments: AnalyzerOutput["transcription"] = [];
      let template: AnalyzerOutput | undefined;
      let totalGenerationDurationMs = 0;
      let totalParseAttempts = 0;
      let totalRepairAttempts = 0;
      let sourceMimeType: string | undefined;
      const fidelityParts: Array<{ report: TranscriptFidelityReport; offsetSeconds: number }> = [];
      const workflowUsageAttempts: GeminiUsageAttempt[] = [];

      for (const chunk of chunkSet.chunks) {
        logProgress(`Chunk ${chunk.index + 1}/${chunkSet.chunks.length}: source ${formatSeconds(chunk.offsetSeconds)}-${formatSeconds(Math.min(chunkSet.sourceDurationSeconds, chunk.offsetSeconds + chunk.durationSeconds))}`);
        const priorOutputs = options.resumeRun
          ? await loadChunkAttemptOutputs(resolve(options.resumeRun), chunk.index, maxChunkAttempts)
          : [];
        priorOutputs.forEach((output) => workflowUsageAttempts.push(...(output.telemetry.usageAttempts || [])));
        const resumedAccepted = priorOutputs.find((output) =>
          output.metadata.transcriptQuality?.status === "passed"
          && output.metadata.transcriptQuality.fidelity?.status === "passed"
        );
        if (resumedAccepted) {
          logProgress(`Chunk ${chunk.index + 1}/${chunkSet.chunks.length}: reusing passed excerpt from ${options.resumeRun}`);
          sourceMimeType ||= await sniffMimeType(chunk.path);
          template ||= resumedAccepted;
          mergedSegments.push(...offsetTranscriptSegments(resumedAccepted.transcription, chunk.offsetSeconds));
          totalGenerationDurationMs += resumedAccepted.telemetry.durationMs;
          totalParseAttempts += resumedAccepted.telemetry.parseAttempts;
          totalRepairAttempts += resumedAccepted.telemetry.repairAttempts;
          if (resumedAccepted.metadata.transcriptQuality?.fidelity) {
            fidelityParts.push({ report: resumedAccepted.metadata.transcriptQuality.fidelity, offsetSeconds: chunk.offsetSeconds });
          }
          continue;
        }
        const media = await prepareMedia(chunk.path, uploadClient, undefined, logMediaProgress);
        sourceMimeType ||= media.mimeType;
        let acceptedOutput: AnalyzerOutput | undefined;
        let lastOutput: AnalyzerOutput | undefined;
        let retryFeedback = "";
        const attemptOutputs = [...priorOutputs];
        if (attemptOutputs.length >= 2) {
          const adjudicated = applyConvergentFidelityCorrections(attemptOutputs);
          if (adjudicated) {
            logProgress(`Chunk ${chunk.index + 1}/${chunkSet.chunks.length}: applying convergent local fidelity correction and re-verifying media`);
            applyTranscriptQualityReport(adjudicated, evaluateTranscriptQuality(adjudicated, { sourceDurationSeconds: chunk.durationSeconds, mimeType: media.mimeType }));
            if (adjudicated.metadata.transcriptQuality?.status === "passed") {
              const fidelity = await verifyTranscriptFidelity({ media, transcript: adjudicated, model: defaultModel("pro") });
              applyTranscriptFidelityReport(adjudicated, fidelity);
              const adjudicationUsage: GeminiUsageAttempt[] = [];
              appendFidelityUsage(adjudicationUsage, fidelity, "chunk-adjudication-fidelity", defaultModel("pro"), 1);
              workflowUsageAttempts.push(...adjudicationUsage);
              applyUsageTotals(adjudicated, [...(adjudicated.telemetry.usageAttempts || []), ...adjudicationUsage]);
            }
            await persistRegressionAttempt(run, chunkSet.chunks.length * maxChunkAttempts + chunk.index + 1, adjudicated);
            if (adjudicated.metadata.transcriptQuality?.status === "passed" && adjudicated.metadata.transcriptQuality.fidelity?.status === "passed") {
              acceptedOutput = adjudicated;
              fidelityParts.push({ report: adjudicated.metadata.transcriptQuality.fidelity, offsetSeconds: chunk.offsetSeconds });
            }
          }
        }
        for (let chunkAttempt = 1; !acceptedOutput && attemptOutputs.length < maxChunkAttempts && chunkAttempt <= maxChunkAttempts; chunkAttempt += 1) {
          logProgress(`Chunk ${chunk.index + 1}/${chunkSet.chunks.length}: generation attempt ${chunkAttempt}/${maxChunkAttempts}`);
          const output = await analyzeWithGemini({
            media,
            prompt,
            model: selectedModel,
            speakers: targetSpeakers,
            userPrompt: [
              "This is an explicitly authorized sequential excerpt of one larger source media file.",
              `Excerpt duration measured by ffprobe: ${chunk.durationSeconds.toFixed(3)} seconds.`,
              `Excerpt absolute offset in the original source: ${chunk.offsetSeconds.toFixed(3)} seconds.`,
              `Minimum expected natural transcript turns for this speech-heavy excerpt: ${Math.max(2, Math.floor(chunk.durationSeconds / 30))}.`,
              "Return excerpt-relative timecodes beginning at 00:00:00. The orchestrator will convert them to the original absolute timeline.",
              "Transcribe every audible utterance through the measured end. Do not summarize, simulate, omit, or replace any speech-bearing interval with a placeholder.",
              retryFeedback
            ].filter(Boolean).join("\n\n")
          });
          const attemptUsage: GeminiUsageAttempt[] = [];
          appendOutputUsage(attemptUsage, output, "chunk-transcription", selectedModel, chunkAttempt);
          lastOutput = output;
          attemptOutputs.push(output);
          const quality = evaluateTranscriptQuality(output, { sourceDurationSeconds: chunk.durationSeconds, mimeType: media.mimeType });
          applyTranscriptQualityReport(output, quality);
          let fidelity: TranscriptFidelityReport | undefined;
          if (quality.status === "passed") {
            logProgress(`Chunk ${chunk.index + 1}/${chunkSet.chunks.length}: independent Pro fidelity verification`);
            fidelity = await verifyTranscriptFidelity({ media, transcript: output, model: defaultModel("pro") });
            applyTranscriptFidelityReport(output, fidelity);
            appendFidelityUsage(attemptUsage, fidelity, "chunk-fidelity", defaultModel("pro"), chunkAttempt);
          }
          workflowUsageAttempts.push(...attemptUsage);
          applyUsageTotals(output, attemptUsage);
          const persistedAttempt = chunk.index * maxChunkAttempts + chunkAttempt;
          await persistRegressionAttempt(run, persistedAttempt, output);
          if (output.metadata.transcriptQuality?.status === "passed" && fidelity?.status === "passed") {
            acceptedOutput = output;
            fidelityParts.push({ report: fidelity, offsetSeconds: chunk.offsetSeconds });
            break;
          }
          retryFeedback = buildChunkRetryInstruction(output, chunkAttempt + 1);
          if (output.metadata.warnings && output.metadata.warnings.length > 0) {
            logProgress(`Chunk ${chunk.index + 1}/${chunkSet.chunks.length}: attempt ${chunkAttempt} failed with warnings:\n  - ${output.metadata.warnings.join('\n  - ')}`);
          }
          if (output.metadata.transcriptQuality?.fidelity?.discrepancies) {
            const blocking = output.metadata.transcriptQuality.fidelity.discrepancies.filter(d => d.severity === "critical");
            if (blocking.length > 0) {
               logProgress(`Blocking Fidelity Discrepancies:\n${JSON.stringify(blocking, null, 2)}`);
            }
          }
          logProgress(`Chunk ${chunk.index + 1}/${chunkSet.chunks.length}: attempt ${chunkAttempt} rejected; regenerating the complete excerpt`);
        }
        if (!acceptedOutput && attemptOutputs.length >= 2) {
          const adjudicated = applyConvergentFidelityCorrections(attemptOutputs);
          if (adjudicated) {
            logProgress(`Chunk ${chunk.index + 1}/${chunkSet.chunks.length}: two generations converged on a local correction; re-verifying corrected candidate`);
            applyTranscriptQualityReport(adjudicated, evaluateTranscriptQuality(adjudicated, { sourceDurationSeconds: chunk.durationSeconds, mimeType: media.mimeType }));
            if (adjudicated.metadata.transcriptQuality?.status === "passed") {
              const fidelity = await verifyTranscriptFidelity({ media, transcript: adjudicated, model: defaultModel("pro") });
              applyTranscriptFidelityReport(adjudicated, fidelity);
              const adjudicationUsage: GeminiUsageAttempt[] = [];
              appendFidelityUsage(adjudicationUsage, fidelity, "chunk-adjudication-fidelity", defaultModel("pro"), 1);
              workflowUsageAttempts.push(...adjudicationUsage);
              applyUsageTotals(adjudicated, [...(adjudicated.telemetry.usageAttempts || []), ...adjudicationUsage]);
            }
            await persistRegressionAttempt(run, chunkSet.chunks.length * maxChunkAttempts + chunk.index + 1, adjudicated);
            if (adjudicated.metadata.transcriptQuality?.status === "passed" && adjudicated.metadata.transcriptQuality.fidelity?.status === "passed") {
              acceptedOutput = adjudicated;
              fidelityParts.push({ report: adjudicated.metadata.transcriptQuality.fidelity, offsetSeconds: chunk.offsetSeconds });
            }
          }
        }
        if (!acceptedOutput) {
          lastOutput ||= attemptOutputs.at(-1);
          if (!lastOutput) throw new Error(`Chunk ${chunk.index + 1} produced no candidate.`);
          lastOutput.metadata.warnings.push(`Chunk ${chunk.index + 1} exhausted ${maxChunkAttempts} complete-generation attempts before absolute-timeline assembly.`);
          const rejected = await writeRejectedOutputs(sourceFile, lastOutput);
          outputPaths = rejected;
          const report = await finishRegressionRun(run, { status: "failed", attempts: attemptSummaries, finalOutput: lastOutput, artifacts: rejected, error: `Chunk ${chunk.index + 1} exhausted controlled correction attempts.` });
          console.error(`Rejected JSON: ${rejected.json}`);
          console.error(`Regression report: ${report}`);
          process.exitCode = 1;
          return;
        }
        template ||= acceptedOutput;
        mergedSegments.push(...offsetTranscriptSegments(acceptedOutput.transcription, chunk.offsetSeconds));
        totalGenerationDurationMs += acceptedOutput.telemetry.durationMs;
        totalParseAttempts += acceptedOutput.telemetry.parseAttempts;
        totalRepairAttempts += acceptedOutput.telemetry.repairAttempts;
      }

      if (!template || !sourceMimeType) throw new Error("Chunked transcription produced no excerpt outputs.");
      const combined: AnalyzerOutput = {
        ...template,
        metadata: {
          ...template.metadata,
          sourceFile,
          generatedAt: new Date().toISOString(),
          model: selectedModel,
          warnings: Array.from(new Set([
            ...template.metadata.warnings,
            `Transcript assembled from ${chunkSet.chunks.length} sequential ${chunkSeconds}s excerpts on one absolute timeline.`
          ])),
          transcriptQuality: undefined,
          canonicalTranscript: undefined
        },
        analysis: {
          summary: "Complete transcript candidate assembled from sequential media excerpts.",
          qualityNotes: [`${chunkSet.chunks.length} excerpts; absolute offsets applied locally before certification.`]
        },
        transcription: mergedSegments,
        evidence: [],
        openQuestions: [],
        telemetry: {
          ...template.telemetry,
          durationMs: totalGenerationDurationMs,
          parseAttempts: totalParseAttempts,
          repairAttempts: totalRepairAttempts
        }
      };
      applyUsageTotals(combined, workflowUsageAttempts);
      logProgress("Running structural gate on the merged absolute timeline");
      const mergedQuality = evaluateTranscriptQuality(combined, { sourceDurationSeconds: chunkSet.sourceDurationSeconds, mimeType: sourceMimeType });
      applyTranscriptQualityReport(combined, mergedQuality);
      if (mergedQuality.status === "passed") {
        logProgress("Aggregating independent excerpt fidelity reports on the absolute timeline");
        applyTranscriptFidelityReport(combined, aggregateChunkFidelityReports(fidelityParts, defaultModel("pro")));
      }
      const summary = summarizeTranscriptAttempt(combined, 1);
      attemptSummaries.push(summary);
      combined.metadata.transcriptAttempts = [...attemptSummaries];
      await persistRegressionAttempt(run, chunkSet.chunks.length * maxChunkAttempts + chunkSet.chunks.length + 1, combined);
      if (combined.metadata.transcriptQuality?.status !== "passed" || combined.metadata.transcriptQuality.fidelity?.status !== "passed") {
        const rejected = await writeRejectedOutputs(sourceFile, combined);
        outputPaths = rejected;
        const report = await finishRegressionRun(run, { status: "failed", attempts: attemptSummaries, finalOutput: combined, artifacts: rejected, error: `Merged transcript rejected: ${combined.metadata.transcriptQuality?.failedChecks.join(", ")}` });
        recordTelemetry({ sourceFile, outputMarkdown: rejected.markdown, outputJson: rejected.json, status: "error", error: "Merged chunked transcript rejected", output: combined });
        console.error(`Rejected Markdown: ${rejected.markdown}`);
        console.error(`Rejected JSON: ${rejected.json}`);
        console.error(`Regression report: ${report}`);
        process.exitCode = 1;
        return;
      }

      const written = await writeCanonicalTranscript(sourceFile, combined, { supersedesFingerprint: options.supersedes, correctionReason: options.correctionReason || `Chunked fallback using ${chunkSeconds}s sequential excerpts` });
      outputPaths = written;
      const report = await finishRegressionRun(run, { status: "passed", attempts: attemptSummaries, finalOutput: combined, artifacts: { ...written, chunkDirectory: chunkSet.directory, chunkCount: chunkSet.chunks.length } });
      recordTelemetry({ sourceFile, outputMarkdown: written.markdown, outputJson: written.json, status: "success", output: combined });
      console.log(`Markdown: ${written.markdown}`);
      console.log(`JSON: ${written.json}`);
      console.log(`Manifest: ${written.manifest}`);
      console.log(`Chunks: ${chunkSet.directory}`);
      console.log(`Regression report: ${report}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      let responsePath: string | undefined;
      let responseChars: number | undefined;
      if (error instanceof GeminiJsonParseError) {
        responsePath = rawResponsePath(sourceFile);
        responseChars = error.rawResponse.length;
        await mkdir(dirname(responsePath), { recursive: true });
        await writeFile(responsePath, error.rawResponse, "utf8");
        console.error(`Raw response: ${responsePath}`);
      }
      recordTelemetry({ sourceFile, outputMarkdown: outputPaths.markdown, outputJson: outputPaths.json, status: "error", error: message, rawResponsePath: responsePath, rawResponseChars: responseChars });
      if (run) await finishRegressionRun(run, { status: "failed", attempts: attemptSummaries, error: message, artifacts: outputPaths });
      console.error(message);
      process.exitCode = 1;
    }
}

program
  .command("transcribe")
  .description("Create a faithful transcript from a media file. Use analyze-transcript for analysis.")
  .argument("<file>", "Path to audio, video, image, or document file.")
  .option("--style <prompt-id>", "Transcript prompt style. Only transcript-only is supported for media transcription.", "transcript-only")
  .option("--prompt <text>", "Additional instruction appended to the selected prompt.")
  .option("--prompt-file <path>", "Custom prompt file. Uses custom style unless --style is also meaningful to downstream formatting.")
  .option("--schema-file <path>", "Custom schema file path recorded as schema id metadata.")
  .option("--model <model>", "Gemini model override.")
  .option("--max-attempts <count>", "Complete transcript generations allowed before rejection.", "2")
  .option("--regression-fixture <id>", "Persist and evaluate this run against a registered real-media fixture.")
  .option("--supersedes <fingerprint>", "Explicit prior canonical transcript fingerprint corrected by this version.")
  .option("--correction-reason <text>", "Reason recorded when a new canonical version supersedes another.")
  .option("--seed-candidate <path>", "Prior completed full transcript JSON whose gate findings seed complete regeneration.")
  .option("--resume-run <path>", "Reuse passed excerpt artifacts and convergent findings from a prior chunked run.")
  .option("--speakers <names>", "Comma-separated speaker names/ids to resolve and identify in transcription.")
  .action(async (file: string, options: { style: string; prompt?: string; promptFile?: string; schemaFile?: string; model?: string; maxAttempts: string; regressionFixture?: string; supersedes?: string; correctionReason?: string; seedCandidate?: string; resumeRun?: string; speakers?: string }) => {
    const sourceFile = resolve(file);
    let outputPaths: { markdown?: string; json?: string } = {};
    let run: RegressionRunContext | undefined;
    const attemptSummaries = [];
    try {
      const targetSpeakers = options.speakers
        ? await loadSpeakerProfiles(options.speakers.split(",").map((s) => s.trim()))
        : await listSpeakers();
      if (targetSpeakers.length > 0) {
        logProgress(`Enrolled speakers loaded for identification: ${targetSpeakers.map((s) => s.name).join(", ")}`);
      }
      const style = parseStyle(options.promptFile ? "custom" : options.style);
      if (!options.promptFile && style !== "transcript-only") {
        throw new Error(`Media transcription is transcript-first. Run 'transcribe ${sourceFile} --style transcript-only' first, then run 'analyze-transcript <transcript.md> --style ${style}'.`);
      }
      const prompt = options.promptFile
        ? await loadCustomPromptFile(options.promptFile, options.schemaFile || "custom")
        : await loadPrompt("transcript-only");
      const customSchema = options.schemaFile ? await loadResponseSchema(options.schemaFile) : undefined;
      const apiKey = process.env.GEMINI_API_KEY?.trim();
      const sourceDurationSeconds = await probeMediaDurationSeconds(sourceFile);

      if (sourceDurationSeconds > 900) {
        logProgress(`Media is ${sourceDurationSeconds.toFixed(1)}s long (exceeds 15m threshold). Automatically routing to chunked transcription.`);
        return transcribeChunkedAction(file, { chunkSeconds: "300", maxChunkAttempts: options.maxAttempts, model: options.model, resumeRun: options.resumeRun, regressionFixture: options.regressionFixture, supersedes: options.supersedes, correctionReason: options.correctionReason, speakers: options.speakers });
      }

      logProgress(`Preparing media: ${sourceFile}`);
      const uploadClient = apiKey ? new GoogleGenAI({ apiKey }) : undefined;
      const media = await prepareMedia(sourceFile, uploadClient, undefined, logMediaProgress);
      const schemaInstruction = options.schemaFile ? `Custom schema id: ${basename(options.schemaFile)}` : "";
      const selectedModel = options.model || await defaultTranscriptionModel(sourceFile, prompt.defaultModelTier);

      const authoritativeTimelineInstruction = [
        `Authoritative ffprobe source duration: ${sourceDurationSeconds.toFixed(3)} seconds.`,
        `Minimum expected natural transcript turns for this speech-heavy recording: ${Math.max(2, Math.floor(sourceDurationSeconds / 30))}.`,
        "The transcript timeline must begin at 00:00:00 and the final segment must account for this exact media duration.",
        "Do not compress later speech into an earlier time range, stop early, restart timecodes, or infer duration from the amount of returned text.",
        "A summary, representative excerpt, simulated output, omitted-transcript marker, or placeholder is an invalid response even if its timecodes cover the full duration."
      ].join("\n");
      const maxAttempts = transcriptAttemptLimit(options.maxAttempts);
      run = await startRegressionRun(sourceFile, options.regressionFixture);
      logProgress(`Regression run: ${run.runDirectory}`);
      let previous: Awaited<ReturnType<typeof analyzeWithGemini>> | undefined = options.seedCandidate
        ? JSON.parse(await readFile(resolve(options.seedCandidate), "utf8")) as AnalyzerOutput
        : undefined;
      let accepted: Awaited<ReturnType<typeof analyzeWithGemini>> | undefined;
      const workflowUsageAttempts: GeminiUsageAttempt[] = [];
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const retryInstruction = previous ? transcriptRetryInstruction(previous, attempt) : "";
        logProgress(`Generating complete transcript attempt ${attempt}/${maxAttempts} with ${selectedModel} (${prompt.id})`);
        const output = await analyzeWithGemini({
          media,
          prompt,
          model: selectedModel,
          userPrompt: [authoritativeTimelineInstruction, options.prompt, schemaInstruction, retryInstruction].filter(Boolean).join("\n\n"),
          responseSchema: customSchema,
          schemaId: options.schemaFile ? basename(options.schemaFile) : undefined,
          speakers: targetSpeakers
        });
        const attemptUsage: GeminiUsageAttempt[] = [];
        appendOutputUsage(attemptUsage, output, "transcription", selectedModel, attempt);
        logProgress(`Running structural transcript gate for attempt ${attempt}`);
        const quality = evaluateTranscriptQuality(output, { sourceDurationSeconds, mimeType: media.mimeType });
        applyTranscriptQualityReport(output, quality);
        if (quality.status === "passed") {
          const fidelityModel = defaultModel("pro");
          logProgress(`Running full-media fidelity verification for attempt ${attempt} with ${fidelityModel}`);
          const fidelity = await verifyTranscriptFidelity({ media, transcript: output, model: fidelityModel });
          applyTranscriptFidelityReport(output, fidelity);
          appendFidelityUsage(attemptUsage, fidelity, "fidelity", fidelityModel, attempt);
        }
        workflowUsageAttempts.push(...attemptUsage);
        applyUsageTotals(output, workflowUsageAttempts);
        await writeTranscriptSnapshot(sourceFile, output, "candidate");
        const summary = summarizeTranscriptAttempt(output, attempt);
        attemptSummaries.push(summary);
        output.metadata.transcriptAttempts = [...attemptSummaries];
        const attemptArtifacts = await persistRegressionAttempt(run, attempt, output);
        logProgress(`Persisted attempt ${attempt}: ${attemptArtifacts.json}`);
        if (output.metadata.transcriptQuality?.status === "passed" && output.metadata.transcriptQuality.fidelity?.status === "passed") {
          accepted = output;
          break;
        }
        previous = output;
        logProgress(`Attempt ${attempt} rejected: ${output.metadata.transcriptQuality?.failedChecks.join(", ") || "unknown gate failure"}`);
      }

      if (!accepted) {
        if (!previous) throw new Error("Transcript generation produced no candidate.");
        const rejected = await writeRejectedOutputs(sourceFile, previous);
        await writeTranscriptSnapshot(sourceFile, previous, "rejected");
        outputPaths = rejected;
        const runReport = await finishRegressionRun(run, { status: "failed", attempts: attemptSummaries, finalOutput: previous, artifacts: rejected, error: "Transcript attempts exhausted" });
        recordTelemetry({ sourceFile, outputMarkdown: rejected.markdown, outputJson: rejected.json, status: "error", error: "Transcript attempts exhausted", output: previous });
        console.error(`Rejected Markdown: ${rejected.markdown}`);
        console.error(`Rejected JSON: ${rejected.json}`);
        console.error(`Regression report: ${runReport}`);
        process.exitCode = 1;
        return;
      }

      logProgress("Writing immutable canonical transcript version");
      const written = await writeCanonicalTranscript(sourceFile, accepted, {
        supersedesFingerprint: options.supersedes,
        correctionReason: options.correctionReason
      });
      outputPaths = written;
      const runReport = await finishRegressionRun(run, { status: "passed", attempts: attemptSummaries, finalOutput: accepted, artifacts: { ...written } });
      recordTelemetry({ sourceFile, outputMarkdown: written.markdown, outputJson: written.json, status: "success", output: accepted });
      console.log(`Markdown: ${written.markdown}`);
      console.log(`JSON: ${written.json}`);
      console.log(`Manifest: ${written.manifest}`);
      console.log(`Regression report: ${runReport}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      let responsePath: string | undefined;
      let responseChars: number | undefined;
      if (error instanceof GeminiJsonParseError) {
        responsePath = rawResponsePath(sourceFile);
        responseChars = error.rawResponse.length;
        await mkdir(dirname(responsePath), { recursive: true });
        await writeFile(responsePath, error.rawResponse, "utf8");
        console.error(`Raw response: ${responsePath}`);
      }
      recordTelemetry({ sourceFile, outputMarkdown: outputPaths.markdown, outputJson: outputPaths.json, status: "error", error: message, rawResponsePath: responsePath, rawResponseChars: responseChars });
      if (run) await finishRegressionRun(run, { status: "failed", attempts: attemptSummaries, error: message, artifacts: outputPaths });
      console.error(message);
      process.exitCode = 1;
    }
  });

program
  .command("verify-transcript")
  .description("Re-run structural and full-media fidelity gates for an existing transcript candidate.")
  .argument("<file>", "Path to a transcript JSON artifact.")
  .option("--model <model>", "Allowed Gemini 3 Pro verifier model.")
  .option("--source-file <path>", "Current media path when the certified source has moved.")
  .option("--chunk-seconds <seconds>", "Explicitly authorized sequential fidelity excerpt duration between 30 and 900 seconds.")
  .option("--correction-reason <text>", "Reason recorded for the new canonical certification version.")
  .action(async (file: string, options: { model?: string; sourceFile?: string; chunkSeconds?: string; correctionReason?: string }) => {
    const transcriptFile = resolve(file);
    let outputPaths: { markdown?: string; json?: string } = {};
    let run: RegressionRunContext | undefined;
    const attemptSummaries: TranscriptAttemptSummary[] = [];
    try {
      const output = JSON.parse(await readFile(transcriptFile, "utf8")) as AnalyzerOutput;
      if (output.metadata?.analysisStyle !== "transcript-only" || !Array.isArray(output.transcription)) {
        throw new Error(`'${transcriptFile}' is not a transcript-only JSON artifact.`);
      }
      const sourceFile = resolve(options.sourceFile || output.metadata.sourceFile);
      output.metadata.sourceFile = sourceFile;
      const apiKey = process.env.GEMINI_API_KEY?.trim();
      const uploadClient = apiKey ? new GoogleGenAI({ apiKey }) : undefined;
      const sourceDurationSeconds = await probeMediaDurationSeconds(sourceFile);
      const sourceMimeType = await sniffMimeType(sourceFile);
      const model = options.model || defaultModel("pro");
      run = await startRegressionRun(sourceFile);
      logProgress(`Verification run: ${run.runDirectory}`);
      logProgress("Re-running structural transcript gate");
      applyTranscriptQualityReport(output, evaluateTranscriptQuality(output, { sourceDurationSeconds, mimeType: sourceMimeType }));
      if (output.metadata.transcriptQuality?.status === "passed") {
        let fidelity: TranscriptFidelityReport;
        if (options.chunkSeconds) {
          const chunkSet = await createMediaChunks(sourceFile, Number(options.chunkSeconds));
          const parts: Array<{ report: TranscriptFidelityReport; offsetSeconds: number }> = [];
          for (const chunk of chunkSet.chunks) {
            logProgress(`Fidelity chunk ${chunk.index + 1}/${chunkSet.chunks.length}: ${formatSeconds(chunk.offsetSeconds)}`);
            const media = await prepareMedia(chunk.path, uploadClient, undefined, logMediaProgress);
            const end = chunkSet.chunks[chunk.index + 1]?.offsetSeconds ?? chunkSet.sourceDurationSeconds;
            const relativeSegments = output.transcription.filter((segment) => {
              const start = parseCanonicalTimecode(segment.timecode);
              return start !== undefined && start >= chunk.offsetSeconds && start < end;
            });
            const candidate: AnalyzerOutput = {
              ...output,
              metadata: { ...output.metadata, sourceFile: chunk.path, canonicalTranscript: undefined },
              transcription: offsetTranscriptSegments(relativeSegments, -chunk.offsetSeconds)
            };
            const report = await verifyTranscriptFidelity({ media, transcript: candidate, model });
            parts.push({ report, offsetSeconds: chunk.offsetSeconds });
            if (report.status === "failed") break;
          }
          fidelity = aggregateChunkFidelityReports(parts, model);
        } else {
          logProgress("Running full-media fidelity verification without chunking");
          const media = await prepareMedia(sourceFile, uploadClient, undefined, logMediaProgress);
          fidelity = await verifyTranscriptFidelity({ media, transcript: output, model });
        }
        applyTranscriptFidelityReport(output, fidelity);
        const usageAttempts = [...(output.telemetry.usageAttempts || [])];
        appendFidelityUsage(usageAttempts, fidelity, "recertification-fidelity", model, 1);
        applyUsageTotals(output, usageAttempts);
      }
      output.metadata.canonicalTranscript = undefined;
      await writeTranscriptSnapshot(sourceFile, output, "candidate");
      const summary = summarizeTranscriptAttempt(output, 1);
      attemptSummaries.push(summary);
      await persistRegressionAttempt(run, 1, output);
      if (output.metadata.transcriptQuality?.status !== "passed" || output.metadata.transcriptQuality.fidelity?.status !== "passed") {
        const rejected = await writeRejectedOutputs(sourceFile, output);
        await writeTranscriptSnapshot(sourceFile, output, "rejected");
        outputPaths = rejected;
        await finishRegressionRun(run, { status: "failed", attempts: attemptSummaries, finalOutput: output, artifacts: rejected, error: "Transcript recertification failed" });
        console.error(`Rejected Markdown: ${rejected.markdown}`);
        console.error(`Rejected JSON: ${rejected.json}`);
        process.exitCode = 1;
        return;
      }
      const written = await writeCanonicalTranscript(sourceFile, output, {
        correctionReason: options.correctionReason || "Re-certified after fidelity gate hardening"
      });
      outputPaths = written;
      const runReport = await finishRegressionRun(run, { status: "passed", attempts: attemptSummaries, finalOutput: output, artifacts: { ...written } });
      console.log(`Markdown: ${written.markdown}`);
      console.log(`JSON: ${written.json}`);
      console.log(`Manifest: ${written.manifest}`);
      console.log(`Verification report: ${runReport}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      recordTelemetry({ sourceFile: transcriptFile, outputMarkdown: outputPaths.markdown, outputJson: outputPaths.json, status: "error", error: message });
      if (run) await finishRegressionRun(run, { status: "failed", attempts: attemptSummaries, error: message, artifacts: outputPaths });
      console.error(message);
      process.exitCode = 1;
    }
  });

program
  .command("analyze-transcript")
  .description("Analyze an existing transcript or text file without uploading media.")
  .argument("<file>", "Path to transcript, notes, captions, or other text file.")
  .option("--style <prompt-id>", "Prompt style from analysis-prompts/.", "meeting-analysis")
  .option("--prompt <text>", "Additional instruction appended to the selected prompt.")
  .option("--prompt-file <path>", "Custom prompt file. Uses custom style unless --style is also meaningful to downstream formatting.")
  .option("--schema-file <path>", "Custom schema file path recorded as schema id metadata.")
  .option("--model <model>", "Gemini model override.")
  .option("--source-kind <kind>", "Input kind: transcript requires a passed quality certificate; text analyzes unverified notes/documents.", "transcript")
  .option("--target-app <app>", "Require reviewable resource candidates for a target app, for example oldskool or dpp.")
  .option("--purpose <text>", "Analysis purpose recorded in provenance.")
  .option("--max-analysis-attempts <count>", "Analysis generations allowed to satisfy Gate 3.", "2")
  .action(async (file: string, options: { style: string; prompt?: string; promptFile?: string; schemaFile?: string; model?: string; sourceKind: string; targetApp?: string; purpose?: string; maxAnalysisAttempts: string }) => {
    const sourceFile = resolve(file);
    let outputPaths: { markdown?: string; json?: string } = {};
    let analysisRun: RegressionRunContext | undefined;
    try {
      const style = parseAnalysisStyle(options.promptFile ? "custom" : options.style);
      const prompt = options.promptFile
        ? await loadCustomPromptFile(options.promptFile, options.schemaFile || "custom")
        : await loadPrompt(style);
      const customSchema = options.schemaFile ? await loadResponseSchema(options.schemaFile) : undefined;
      const sourceKind = options.sourceKind === "text" ? "text" : "transcript";
      if (style === "conversation-knowledge" && sourceKind !== "transcript") {
        throw new Error("conversation-knowledge requires a certified canonical transcript; --source-kind text is not supported.");
      }
      let sourceText: string;
      let verifiedInstruction = "";
      let verified: VerifiedTranscriptSource | undefined;
      if (sourceKind === "transcript") {
        logProgress(`Loading verified transcript sidecar for: ${sourceFile}`);
        verified = await loadVerifiedTranscriptSource(sourceFile);
        sourceText = verified.text;
        verifiedInstruction = [
          `Verified transcript fingerprint: ${verified.quality.transcriptFingerprint}`,
          `Verified source media: ${verified.sourceMediaFile}`,
          `Verified source duration seconds: ${verified.quality.sourceDurationSeconds}`
        ].join("\n");
      } else {
        logProgress(`Reading unverified text source: ${sourceFile}`);
        sourceText = await readFile(sourceFile, "utf8");
      }
      if (verified && style === "conversation-knowledge") {
        const cachePath = conversationKnowledgeCachePath(verified, prompt.hash);
        const cached = await readConversationKnowledgeCache(cachePath, verified, prompt.hash, options.targetApp);
        if (cached) {
          logProgress(`Using cached conversation knowledge: ${cachePath}`);
          recordTelemetry({ sourceFile, outputJson: cachePath, status: "success", output: cached });
          console.log(`Knowledge JSON: ${cachePath}`);
          return;
        }
      }
      const schemaInstruction = options.schemaFile ? `Custom schema id: ${basename(options.schemaFile)}` : "";
      const analysisOnlyInstruction = [
        "Analyze the provided transcript/text directly. Do not request or infer unavailable audio/video.",
        "If the text already contains timecodes or speaker labels, preserve and use them as evidence references.",
        "If no timecodes exist, use section names, line references, or short quoted anchors instead.",
        "Keep the transcription array empty unless the input already contains transcript-like speaker turns that can be safely normalized.",
        "Represent each decision, task, financial/legal claim, dated item, owner assignment, and risk as an object with title, description, modality, timecodes, and confidence.",
        "Allowed modalities: observation, proposal, decision, commitment, disagreement, assumption, analyst-recommendation.",
        options.targetApp ? `Also return analysis.resourceCandidates for target app '${options.targetApp}'. Every candidate must use targetApp '${options.targetApp}', operation 'propose', reviewState 'draft', an allowed modality, and certified transcript timecodes. Never request a direct write.` : "Do not create app resource candidates unless a target app was requested.",
        verifiedInstruction
      ].join("\n");
      const selectedModel = options.model || defaultModel(prompt.defaultModelTier);
      const maxAnalysisAttempts = transcriptAttemptLimit(options.maxAnalysisAttempts);
      analysisRun = await startAnalysisRun(sourceFile, prompt.id);
      logProgress(`Analysis run: ${analysisRun.runDirectory}`);
      let gateFeedback = "";
      let output: Awaited<ReturnType<typeof analyzeWithGemini>> | undefined;
      const workflowUsageAttempts: GeminiUsageAttempt[] = [];
      for (let attempt = 1; attempt <= maxAnalysisAttempts; attempt += 1) {
        logProgress(`Generating analysis attempt ${attempt}/${maxAnalysisAttempts} with ${selectedModel} (${prompt.id})`);
        output = await analyzeWithGemini({
          sourceText,
          sourceFile,
          sourceMimeType: "text/plain",
          prompt,
          model: selectedModel,
          userPrompt: [analysisOnlyInstruction, options.prompt, schemaInstruction, gateFeedback].filter(Boolean).join("\n\n"),
          responseSchema: customSchema,
          schemaId: options.schemaFile ? basename(options.schemaFile) : undefined
        });
        appendOutputUsage(workflowUsageAttempts, output, "analysis", selectedModel, attempt);
        applyUsageTotals(output, workflowUsageAttempts);
        if (!verified) break;
        applyAnalysisProvenance(output, verified, { purpose: options.purpose || prompt.id, targetApp: options.targetApp });
        if (style === "conversation-knowledge") bindConversationKnowledgeProvenance(output, verified);
        const report = evaluateAnalysisQuality(output, verified, { targetApp: options.targetApp });
        if (style === "conversation-knowledge") {
          const knowledgeCheck = conversationKnowledgeQualityCheck(output, verified);
          report.checks.push(knowledgeCheck);
          if (knowledgeCheck.status === "failed") {
            report.status = "failed";
            report.failedChecks = Array.from(new Set([...report.failedChecks, knowledgeCheck.id]));
          }
        }
        applyAnalysisQualityReport(output, report);
        await persistRegressionAttempt(analysisRun, attempt, output);
        if (report.status === "passed") break;
        gateFeedback = [
          "The previous analysis was rejected by Gate 3. Regenerate the complete analysis from the same certified transcript; do not patch the rejected JSON.",
          ...report.checks.filter((check) => check.status === "failed").map((check) => `${check.id}: ${check.message} ${JSON.stringify(check.metrics)}`)
        ].join("\n")
      }
      if (!output) throw new Error("Analysis generation produced no output.");
      if (verified && output.metadata.analysisQuality?.status !== "passed") {
        const rejected = await writeRejectedOutputs(sourceFile, output);
        outputPaths = rejected;
        recordTelemetry({ sourceFile, outputMarkdown: rejected.markdown, outputJson: rejected.json, status: "error", error: `Analysis quality gate failed: ${output.metadata.analysisQuality?.failedChecks.join(", ")}`, output });
        console.error(`Rejected Markdown: ${rejected.markdown}`);
        console.error(`Rejected JSON: ${rejected.json}`);
        await finishRegressionRun(analysisRun, { status: "failed", attempts: [], finalOutput: output, artifacts: rejected, error: `Analysis quality gate failed: ${output.metadata.analysisQuality?.failedChecks.join(", ")}` });
        process.exitCode = 1;
        return;
      }
      logProgress("Writing analysis outputs");
      const cachePath = verified && style === "conversation-knowledge"
        ? conversationKnowledgeCachePath(verified, prompt.hash)
        : undefined;
      if (cachePath) {
        await mkdir(dirname(cachePath), { recursive: true });
        await writeFile(cachePath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
        logProgress(`Cached conversation knowledge: ${cachePath}`);
      }
      const written: { markdown?: string; json: string } = cachePath ? { json: cachePath } : await writeOutputs(sourceFile, output);
      const published = verified && style !== "conversation-knowledge"
        ? await writePublishedAnalysis(verified.sourceMediaFile, output, verified.output)
        : undefined;
      await finishRegressionRun(analysisRun, { status: "passed", attempts: [], finalOutput: output, artifacts: written });
      outputPaths = written;
      recordTelemetry({ sourceFile, outputMarkdown: written.markdown, outputJson: written.json, status: "success", output });
      if (written.markdown) console.log(`Markdown: ${written.markdown}`);
      console.log(`${cachePath ? "Knowledge JSON" : "JSON"}: ${written.json}`);
      if (published) {
        console.log(`Published Markdown: ${published.markdown}`);
        console.log(`Published JSON: ${published.json}`);
      }
      if (style === "conversation-knowledge") return;
      logProgress("Cleaning up temporary and rejected artifacts");
      try {
        const transcriptDir = dirname(sourceFile);
        const entries = await readdir(transcriptDir);
        for (const entry of entries) {
          if (!entry.startsWith("v0001.transcript.json") && !entry.startsWith("v0001.transcript.md") && entry !== "manifest.json" && entry !== "analyses") {
            await rm(join(transcriptDir, entry), { recursive: true, force: true });
          }
        }
        logProgress("Cleanup complete");
      } catch (cleanupError) {
        logProgress(`Warning: Failed to clean up: ${cleanupError}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      let responsePath: string | undefined;
      let responseChars: number | undefined;
      if (error instanceof GeminiJsonParseError) {
        responsePath = rawResponsePath(sourceFile);
        responseChars = error.rawResponse.length;
        await mkdir(dirname(responsePath), { recursive: true });
        await writeFile(responsePath, error.rawResponse, "utf8");
        console.error(`Raw response: ${responsePath}`);
      }
      recordTelemetry({ sourceFile, outputMarkdown: outputPaths.markdown, outputJson: outputPaths.json, status: "error", error: message, rawResponsePath: responsePath, rawResponseChars: responseChars });
      console.error(message);
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv);

async function loadResponseSchema(filePath: string): Promise<GeminiResponseSchema> {
  const source = await readFile(filePath, "utf8");
  const parsed = JSON.parse(source) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`Custom schema file '${filePath}' must contain a JSON object.`);
  }
  const schema = parsed as GeminiResponseSchema;
  if (typeof schema.type !== "string") {
    throw new Error(`Custom schema file '${filePath}' must include a top-level 'type'.`);
  }
  return schema;
}

function logProgress(message: string): void {
  console.error(`[media-analyzer] ${new Date().toISOString()} ${message}`);
}

function parseAnalysisStyle(value: string | undefined): AnalysisStyle {
  return value === "conversation-knowledge" ? value : parseStyle(value);
}

async function readConversationKnowledgeCache(
  cachePath: string,
  source: VerifiedTranscriptSource,
  promptHash: string,
  targetApp?: string
): Promise<AnalyzerOutput | undefined> {
  try {
    const cached = JSON.parse(await readFile(cachePath, "utf8")) as AnalyzerOutput;
    if (cached.metadata.analysisStyle !== "conversation-knowledge" || cached.telemetry.promptHash !== promptHash) return undefined;
    const baseQuality = evaluateAnalysisQuality(cached, source, { targetApp });
    const knowledgeCheck = conversationKnowledgeQualityCheck(cached, source);
    return baseQuality.status === "passed" && knowledgeCheck.status === "passed" ? cached : undefined;
  } catch {
    return undefined;
  }
}

function logMediaProgress(event: MediaProgressEvent): void {
  switch (event.stage) {
    case "sniff":
      logProgress(`Sniffing MIME type: ${event.filePath}`);
      break;
    case "inline":
      logProgress(`Using inline media (${formatBytes(event.sizeBytes)}, ${event.mimeType})`);
      break;
    case "cache-hit":
      logProgress(`Using cached Gemini file (${event.state || "ACTIVE"}): ${event.name || event.uri || "unknown"}`);
      break;
    case "cache-stale":
      logProgress(`Cached Gemini file unavailable; uploading again (${event.reason})`);
      break;
    case "upload-start":
      logProgress(`Uploading to Gemini File API (${formatBytes(event.sizeBytes)}, ${event.mimeType})`);
      break;
    case "upload-complete":
      logProgress(`Upload complete; waiting for ACTIVE (${event.state || "unknown"}): ${event.name || event.uri || "unknown"}`);
      break;
    case "active-wait":
      logProgress(`Waiting for Gemini File API ACTIVE (${event.state}, ${Math.round(event.elapsedMs / 1000)}s/${Math.round(event.timeoutMs / 1000)}s): ${event.name || "unknown"}`);
      break;
    case "active":
      logProgress(`Gemini file ACTIVE after ${Math.round(event.elapsedMs / 1000)}s: ${event.name || event.uri || "unknown"}`);
      break;
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const wholeSeconds = Math.floor(seconds % 60);
  return [hours, minutes, wholeSeconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function buildChunkRetryInstruction(output: AnalyzerOutput, nextAttempt: number): string {
  const quality = output.metadata.transcriptQuality;
  const fidelity = quality?.fidelity;
  const findings = [
    ...(quality?.checks || [])
      .filter((check) => check.status === "failed")
      .map((check) => `${check.id}: ${check.message} ${JSON.stringify(check.metrics)}`),
    ...(fidelity?.discrepancies || []).map((item) => [
      `${item.severity} ${item.type} at ${item.startTimecode}-${item.endTimecode}`,
      `transcript=${JSON.stringify(item.transcriptExcerpt)}`,
      `correction=${JSON.stringify(item.correction)}`,
      `reason=${item.explanation}`
    ].join("; "))
  ];
  if (fidelity && findings.length === 0) findings.push(`Verifier rejected the candidate: ${fidelity.summary}`);
  return [
    `The previous complete excerpt candidate was rejected. This is controlled regeneration attempt ${nextAttempt}.`,
    "Listen to the entire attached excerpt again and return a new complete transcript from 00:00:00 through the excerpt end.",
    "Use these findings only as an audit checklist. Do not patch, quote, or preserve the rejected JSON when the audio differs.",
    ...findings
  ].join("\n");
}

async function loadChunkAttemptOutputs(runDirectory: string, chunkIndex: number, maxChunkAttempts: number): Promise<AnalyzerOutput[]> {
  const outputs: AnalyzerOutput[] = [];
  for (let attempt = 1; attempt <= maxChunkAttempts; attempt += 1) {
    const persistedAttempt = chunkIndex * maxChunkAttempts + attempt;
    const path = join(runDirectory, `attempt-${String(persistedAttempt).padStart(2, "0")}.json`);
    try {
      outputs.push(JSON.parse(await readFile(path, "utf8")) as AnalyzerOutput);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  return outputs;
}

function chunkAttemptLimit(value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 10) {
    throw new Error("Chunk attempts must be an integer between 1 and 10.");
  }
  return parsed;
}

function appendOutputUsage(target: GeminiUsageAttempt[], output: AnalyzerOutput, stage: string, model: string, attempt: number): void {
  if (!output.telemetry.usage) return;
  target.push({ ...output.telemetry.usage, stage, model, attempt });
}

function appendFidelityUsage(target: GeminiUsageAttempt[], report: TranscriptFidelityReport, stage: string, model: string, attempt: number): void {
  if (!report.usage) return;
  target.push({ ...report.usage, stage, model, attempt });
}

function applyUsageTotals(output: AnalyzerOutput, attempts: GeminiUsageAttempt[]): void {
  const usage = sumGeminiUsage(attempts);
  output.telemetry.usageAttempts = [...attempts];
  output.telemetry.usage = usage;
  output.telemetry.tokensIn = usage.promptTokenCount;
  output.telemetry.tokensOut = usage.candidatesTokenCount;
}

async function defaultTranscriptionModel(sourceFile: string, tier: "fast" | "pro"): Promise<string> {
  const info = await stat(sourceFile);
  if (info.size >= inlineThresholdBytes) {
    return defaultModel("pro");
  }
  return defaultModel(tier);
}
