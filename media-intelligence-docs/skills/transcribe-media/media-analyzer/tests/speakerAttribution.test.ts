import assert from "node:assert/strict";
import test from "node:test";
import { speakerAttributionPath, validateSpeakerAttribution } from "../speakerAttribution.js";

const fingerprint = "a".repeat(64);

test("speaker attribution is transcript-fingerprint bound and stored beside canonical derivatives", () => {
  const transcript = {
    sidecarPath: "/tmp/.transcripts/call/v0001.transcript.json",
    quality: { transcriptFingerprint: fingerprint },
  } as never;
  assert.equal(speakerAttributionPath(transcript), `/tmp/.transcripts/call/analyses/speaker-attribution/cache/${fingerprint}.json`);
  const result = {
    schemaVersion: "speaker-attribution-v1",
    sourceTranscriptFingerprint: fingerprint,
    speakers: [{ segmentIndex: 0, status: "confirmed" }],
  };
  assert.doesNotThrow(() => validateSpeakerAttribution(result, fingerprint));
  assert.throws(() => validateSpeakerAttribution({ ...result, sourceTranscriptFingerprint: "other" }, fingerprint), /fingerprint/);
});
