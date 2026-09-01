import { basename, dirname, extname, join, sep } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import type { AnalyzerOutput } from "./schemas.js";

export function outputPaths(sourceFile: string, analysisStyle?: string): { markdown: string; json: string } {
  const dir = dirname(sourceFile);
  const ext = extname(sourceFile);
  const base = basename(sourceFile, ext);
  const style = analysisStyle && analysisStyle !== "transcript-only"
    ? `.${analysisStyle.replace(/[^a-zA-Z0-9._-]+/g, "-")}`
    : "";
  return {
    markdown: join(dir, `${base}${style}.analysis.md`),
    json: join(dir, `${base}${style}.analysis.json`)
  };
}

export function rawResponsePath(sourceFile: string): string {
  const { directory, base } = internalArtifactLocation(sourceFile, "rejected");
  return join(directory, `${base}.analysis.raw-response.txt`);
}

export function rejectedOutputPaths(sourceFile: string): { markdown: string; json: string } {
  const { directory, base } = internalArtifactLocation(sourceFile, "rejected");
  return {
    markdown: join(directory, `${base}.analysis.rejected.md`),
    json: join(directory, `${base}.analysis.rejected.json`)
  };
}

export async function writeOutputs(sourceFile: string, output: AnalyzerOutput): Promise<{ markdown: string; json: string }> {
  const paths = outputPaths(sourceFile, output.metadata.analysisStyle);
  await writeFile(paths.json, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  await writeFile(paths.markdown, renderMarkdown(output), "utf8");
  return paths;
}

export async function writeRejectedOutputs(sourceFile: string, output: AnalyzerOutput): Promise<{ markdown: string; json: string }> {
  const paths = rejectedOutputPaths(sourceFile);
  await mkdir(dirname(paths.json), { recursive: true });
  await writeFile(paths.json, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  await writeFile(paths.markdown, renderMarkdown(output), "utf8");
  return paths;
}

export async function writePublishedAnalysis(
  sourceMediaFile: string,
  analysisOutput: AnalyzerOutput,
  transcriptOutput: AnalyzerOutput
): Promise<{ markdown: string; json: string }> {
  const dir = dirname(sourceMediaFile);
  const ext = extname(sourceMediaFile);
  const base = basename(sourceMediaFile, ext);
  const paths = {
    markdown: join(dir, `${base}-analiz.md`),
    json: join(dir, ".transcripts", base, "published", `${base}-analiz.json`)
  };
  const output: AnalyzerOutput = {
    ...analysisOutput,
    metadata: {
      ...analysisOutput.metadata,
      sourceFile: sourceMediaFile,
      transcriptQuality: transcriptOutput.metadata.transcriptQuality,
      canonicalTranscript: transcriptOutput.metadata.canonicalTranscript
    },
    transcription: transcriptOutput.transcription
  };
  await mkdir(dirname(paths.json), { recursive: true });
  await writeFile(paths.json, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  await writeFile(paths.markdown, renderMarkdown(output, { includeRawJson: false }), "utf8");
  return paths;
}

function internalArtifactLocation(sourceFile: string, category: string): { directory: string; base: string } {
  const ext = extname(sourceFile);
  const base = basename(sourceFile, ext);
  const marker = `${sep}.transcripts${sep}`;
  if (sourceFile.includes(marker)) return { directory: join(dirname(sourceFile), category), base };
  return { directory: join(dirname(sourceFile), ".transcripts", base, category), base };
}

export function renderMarkdown(output: AnalyzerOutput, options: { includeRawJson?: boolean } = {}): string {
  const title = titleFromAnalysis(output.analysis) || translate("Media Analysis", output) + `: ${basename(output.metadata.sourceFile)}`;
  const sections = [
    `# ${title}`,
    renderMetadata(output),
    renderTranscriptQuality(output),
    renderAnalysisQuality(output),
    renderWarnings(output),
    renderAnalysis(output.analysis, output),
    renderEvidence(output),
    renderOpenQuestions(output),
    renderTranscript(output),
    options.includeRawJson === false ? "" : [
      `## ${translate("Raw JSON", output)}`,
      "",
      "```json",
      JSON.stringify(output, null, 2),
      "```"
    ].join("\n")
  ].filter(Boolean);
  return `${sections.join("\n\n")}\n`;
}

function renderAnalysisQuality(output: AnalyzerOutput): string {
  const quality = output.metadata.analysisQuality;
  if (!quality) return "";
  const failed = quality.checks.filter((check) => check.status === "failed");
  const lines = [
    `## ${translate("Analysis Quality Gate", output)}`,
    "",
    `- Status: ${quality.status}`,
    `- App readiness: ${quality.appReadiness}`,
    `- Source transcript fingerprint: \`${quality.sourceTranscriptFingerprint}\``,
    quality.targetApp ? `- Target app: ${quality.targetApp}` : ""
  ].filter(Boolean);
  failed.forEach((check) => lines.push(`- **${check.id}**: ${check.message} \`${JSON.stringify(check.metrics)}\``));
  return lines.join("\n");
}

function renderTranscriptQuality(output: AnalyzerOutput): string {
  const quality = output.metadata.transcriptQuality;
  if (!quality) return "";
  const failed = quality.checks.filter((check) => check.status === "failed");
  const fidelity = quality.fidelity;
  const lines = [
    `## ${translate("Transcript Quality Gate", output)}`,
    "",
    `- Status: ${quality.status}`,
    `- Source duration: ${quality.sourceDurationSeconds}s`,
    `- Transcript boundary: ${quality.transcriptStartSeconds ?? "?"}s-${quality.transcriptEndSeconds ?? "?"}s`,
    `- Segment count: ${quality.segmentCount}`,
    `- Fingerprint: \`${quality.transcriptFingerprint}\``
  ];
  if (failed.length) {
    lines.push("", `### ${translate("Failed Checks", output)}`, "");
    failed.forEach((check) => lines.push(`- **${check.id}**: ${check.message} \`${JSON.stringify(check.metrics)}\``));
  }
  if (fidelity) {
    lines.push(
      "",
      `### ${translate("Fidelity Verification", output)}`,
      "",
      `- Status: ${fidelity.status}`,
      `- Model: ${fidelity.model}`,
      `- Entire media reviewed: ${fidelity.reviewedEntireMedia}`,
      `- Detected language: ${fidelity.detectedLanguage || "unknown"}`,
      `- Quality score: ${fidelity.qualityScore}/100`,
      `- Blocking discrepancies: ${fidelity.blockingDiscrepancies}`,
      `- Summary: ${fidelity.summary || "-"}`
    );
    fidelity.discrepancies.forEach((item) => {
      lines.push(`- **${item.severity}/${item.type}/${item.discussionImpact} ${item.startTimecode}-${item.endTimecode}**: ${item.explanation} Correction: ${item.correction}`);
    });
  }
  return lines.join("\n");
}

function renderMetadata(output: AnalyzerOutput): string {
  const lines = [
    `## ${translate("Source Metadata", output)}`,
    "",
    `- Source file: \`${output.metadata.sourceFile}\``,
    `- Generated at: ${output.metadata.generatedAt}`,
    `- Model: ${output.metadata.model}`,
    `- Analysis style: ${output.metadata.analysisStyle}`,
    output.metadata.language ? `- Language: ${output.metadata.language}` : "",
    output.metadata.duration ? `- Duration: ${output.metadata.duration}` : "",
    output.metadata.transcriptQuality ? `- Transcript quality: ${output.metadata.transcriptQuality.status} (${output.metadata.transcriptQuality.version})` : "",
    output.metadata.transcriptQuality ? `- Timeline coverage: ${(output.metadata.transcriptQuality.timelineCoverageRatio * 100).toFixed(1)}%` : "",
    output.metadata.canonicalTranscript ? `- Canonical transcript version: v${String(output.metadata.canonicalTranscript.version).padStart(4, "0")}` : "",
    output.metadata.analysisProvenance ? `- Source transcript fingerprint: \`${output.metadata.analysisProvenance.sourceTranscriptFingerprint}\`` : "",
    output.metadata.analysisProvenance?.targetApp ? `- Target app: ${output.metadata.analysisProvenance.targetApp}` : "",
    `- Prompt: ${output.telemetry.promptId} (${output.telemetry.promptHash})`,
    `- Schema: ${output.telemetry.schemaId}`
  ].filter(Boolean);
  return lines.join("\n");
}

function renderWarnings(output: AnalyzerOutput): string {
  if (!output.metadata.warnings.length) return "";
  return [`## ${translate("Interpretation Rules And Warnings", output)}`, "", ...output.metadata.warnings.map((item) => `- ${item}`)].join("\n");
}

function renderAnalysis(analysis: Record<string, unknown>, output: AnalyzerOutput): string {
  if (!Object.keys(analysis).length) return `## ${translate("Analysis", output)}\n\n${translate("No structured analysis was returned.", output)}`;
  return [`## ${translate("Analysis", output)}`, "", ...Object.entries(analysis).map(([key, value]) => renderValue(translate(key, output), value))].join("\n\n");
}

function renderValue(label: string, value: unknown): string {
  if (Array.isArray(value)) {
    if (!value.length) return `### ${label}\n\nNo entries.`;
    if (value.every((item) => typeof item !== "object" || item === null)) {
      return [`### ${label}`, "", ...value.map((item) => `- ${String(item)}`)].join("\n");
    }
    return [`### ${label}`, "", ...value.map((item) => `- ${renderStructuredItem(item)}`)].join("\n");
  }
  if (value && typeof value === "object") {
    return [`### ${label}`, "", ...Object.entries(value as Record<string, unknown>).map(([key, item]) => `- ${titleCase(key)}: ${inlineObject(item)}`)].join("\n");
  }
  return `### ${label}\n\n${String(value ?? "")}`;
}

function renderEvidence(output: AnalyzerOutput): string {
  if (!output.evidence.length) return "";
  return [`## ${translate("Evidence", output)}`, "", ...output.evidence.map((item) => {
    const refs = item.timecodes.length ? ` (${item.timecodes.join(", ")})` : "";
    return `- ${item.claim}${refs} - confidence ${item.confidence}`;
  })].join("\n");
}

function renderOpenQuestions(output: AnalyzerOutput): string {
  if (!output.openQuestions.length) return "";
  return [`## ${translate("Open Questions", output)}`, "", ...output.openQuestions.map((item) => `- ${item}`)].join("\n");
}

function renderTranscript(output: AnalyzerOutput): string {
  if (!output.transcription.length) return `## ${translate("Transcript", output)}\n\n${translate("No transcript was returned.", output)}`;
  return [`## ${translate("Transcript", output)}`, "", ...output.transcription.map((segment) => {
    const end = segment.endTimecode ? `-${segment.endTimecode}` : "";
    const confidence = typeof segment.speakerConfidence === "number" ? ` (${segment.speakerConfidence})` : "";
    return `**${segment.timecode}${end} ${segment.speaker}${confidence}:** ${segment.content}${segment.notes ? `\n\n_${segment.notes}_` : ""}`;
  })].join("\n\n");
}

function titleFromAnalysis(analysis: Record<string, unknown>): string {
  const value = analysis.meetingTitle || analysis.reportTitle || analysis.title;
  return typeof value === "string" ? value : "";
}

function titleCase(value: string): string {
  if (/\s/.test(value.trim())) return value.trim();
  return value.replace(/([A-Z])/g, " $1").replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()).trim();
}

function inlineObject(value: unknown): string {
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value ?? "");
}

function renderStructuredItem(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return inlineObject(value);
  const item = value as Record<string, unknown>;
  const title = stringField(item.title);
  const description = stringField(item.description);
  const chunks: string[] = [];
  if (title) chunks.push(`**${title}**`);
  if (description) chunks.push(description);

  const meta: string[] = [];
  const owner = stringField(item.owner);
  const status = stringField(item.status);
  const modality = stringField(item.modality);
  const date = stringField(item.date);
  const timeframe = stringField(item.timeframe);
  const amount = meaningfulAmount(item.amount);
  const currency = stringField(item.currency);
  const confidence = numberField(item.confidence);
  const timecodes = stringArrayField(item.timecodes);

  if (owner) meta.push(`owner: ${owner}`);
  if (status) meta.push(`status: ${status}`);
  if (modality) meta.push(`modality: ${modality}`);
  if (date) meta.push(`date: ${date}`);
  if (timeframe) meta.push(`timeframe: ${timeframe}`);
  if (amount !== undefined) meta.push(`amount: ${formatAmount(amount, currency)}`);
  if (timecodes.length) meta.push(`timecodes: ${timecodes.join(", ")}`);
  if (confidence !== undefined) meta.push(`confidence: ${confidence}`);

  if (!chunks.length) chunks.push(inlineObject(value));
  return meta.length ? `${chunks.join(" - ")} (${meta.join("; ")})` : chunks.join(" - ");
}

function stringField(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function numberField(value: unknown): number | undefined {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function meaningfulAmount(value: unknown): number | undefined {
  const number = numberField(value);
  if (number === undefined || number === 0) return undefined;
  return number;
}

function stringArrayField(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
}

function formatAmount(amount: number, currency: string): string {
  return currency ? `${amount} ${currency}` : String(amount);
}

const trDictionary: Record<string, string> = {
  "Media Analysis": "Medya Analizi",
  "Source Metadata": "Kaynak Meta Verileri",
  "Interpretation Rules And Warnings": "Yorumlama Kuralları ve Uyarılar",
  "Analysis": "Analiz",
  "Evidence": "Kanıtlar",
  "Open Questions": "Açık Sorular",
  "Transcript": "Transkript",
  "Raw JSON": "Ham JSON Verisi",
  "No structured analysis was returned.": "Yapılandırılmış analiz döndürülmedi.",
  "No transcript was returned.": "Transkript döndürülmedi.",
  "Transcript Quality Gate": "Transkript Kalite Kapısı",
  "Failed Checks": "Başarısız Kontroller",
  "Fidelity Verification": "Sadakat Doğrulaması",
  "Analysis Quality Gate": "Analiz Kalite Kapısı",
  "meetingTitle": "Toplantı Başlığı",
  "executiveSummary": "Yönetici Özeti",
  "interpretationRules": "Yorumlama Kuralları",
  "revenueModels": "Gelir Modelleri",
  "infrastructureGates": "Altyapı İhtiyaçları",
  "legalComplianceIssues": "Hukuki Uyumluluk",
  "budgetAssumptions": "Bütçe Varsayımları",
  "founderEconomics": "Kurucu Ekonomisi",
  "entityBoundaries": "Varlık Sınırları",
  "roadmap": "Yol Haritası",
  "proofCalendar": "Kanıt Takvimi",
  "decisions": "Kararlar",
  "actionItems": "Yapılacaklar",
  "risks": "Riskler",
  "openQuestions": "Açık Sorular",
  "sourceGaps": "Kaynak Boşlukları",
  "summary": "Özet",
  "participants": "Katılımcılar",
  "themes": "Temalar",
  "moneyMentions": "Finansal Konular",
  "referencedEntities": "Referans Verilen Varlıklar",
  "qualityNotes": "Kalite Notları",
  "reportTitle": "Rapor Başlığı",
  "sourceFiles": "Kaynak Dosyalar",
  "sourceSummaries": "Kaynak Özetleri",
  "alignmentAndGaps": "Hizalanma ve Boşluklar",
  "conflicts": "Çelişkiler",
  "correctedAssumptions": "Düzeltilmiş Varsayımlar",
  "recommendedPlan": "Önerilen Plan"
};

function translate(key: string, output: AnalyzerOutput): string {
  if (output.metadata.language?.toLowerCase() === "tr" || output.metadata.language?.toLowerCase().startsWith("tr-")) {
    const tr = trDictionary[key] || trDictionary[titleCase(key)] || trDictionary[key.charAt(0).toLowerCase() + key.slice(1)];
    if (tr) return tr;
  }

  const custom = output.metadata.localizedHeadings?.[key];
  if (custom) return custom;

  const titleCased = titleCase(key);
  const customTitle = output.metadata.localizedHeadings?.[titleCased];
  if (customTitle) return customTitle;

  return titleCased;
}
