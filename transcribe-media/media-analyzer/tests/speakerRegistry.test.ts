import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { listSpeakers, loadSpeakerProfiles } from "../speakerRegistry.js";

test("discovers speaker_id.wav samples without enrollment", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "speaker-registry-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(join(directory, "speaker_01.wav"), "sample");
  const speakers = await listSpeakers(directory);
  assert.deepEqual(speakers.map(({ id, name }) => ({ id, name })), [{ id: "speaker_01", name: "speaker_01" }]);
  assert.equal((await loadSpeakerProfiles(["speaker_01"], directory))[0].refAudioPath, join(directory, "speaker_01.wav"));
});

test("keeps enrolled metadata while attaching a matching discovered sample", async (t) => {
  const directory = await mkdtemp(join(tmpdir(), "speaker-registry-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(join(directory, "mengu.json"), JSON.stringify({ id: "mengu", name: "Mengü", role: "Founder", createdAt: "2026-01-01T00:00:00.000Z" }));
  await writeFile(join(directory, "mengu.wav"), "sample");
  const [speaker] = await listSpeakers(directory);
  assert.equal(speaker.name, "Mengü");
  assert.equal(speaker.role, "Founder");
  assert.equal(speaker.refAudioPath, join(directory, "mengu.wav"));
});
