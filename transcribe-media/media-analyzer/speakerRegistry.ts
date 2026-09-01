import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile, stat } from "node:fs/promises";
import { basename, dirname, join, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

export interface SpeakerProfile {
  id: string;
  name: string;
  role?: string;
  gender?: string;
  refAudioPath?: string;
  createdAt: string;
}

const here = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(here, "..");
export const speakerDataDir = resolve(skillRoot, "data/speakers");

export function normalizeSpeakerId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_\s]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export async function ensureSpeakerDir(directory = speakerDataDir): Promise<string> {
  await mkdir(directory, { recursive: true });
  return directory;
}

export async function enrollSpeaker(input: {
  name: string;
  role?: string;
  gender?: string;
  refAudioPath?: string;
}): Promise<SpeakerProfile> {
  const dir = await ensureSpeakerDir();
  const id = normalizeSpeakerId(input.name);
  const profilePath = join(dir, `${id}.json`);

  let refAudioSavedPath: string | undefined;
  if (input.refAudioPath) {
    const ext = extname(input.refAudioPath) || ".mp3";
    refAudioSavedPath = join(dir, `${id}_ref${ext}`);
    const audioBuffer = await readFile(resolve(input.refAudioPath));
    await writeFile(refAudioSavedPath, audioBuffer);
  }

  const profile: SpeakerProfile = {
    id,
    name: input.name.trim(),
    role: input.role?.trim(),
    gender: input.gender?.trim(),
    refAudioPath: refAudioSavedPath,
    createdAt: new Date().toISOString()
  };

  await writeFile(profilePath, JSON.stringify(profile, null, 2), "utf8");
  return profile;
}

export async function listSpeakers(directory = speakerDataDir): Promise<SpeakerProfile[]> {
  const dir = await ensureSpeakerDir(directory);
  let files: string[] = [];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const profiles: SpeakerProfile[] = [];
  for (const file of files) {
    try {
      const content = await readFile(join(dir, file), "utf8");
      const parsed = JSON.parse(content);
      parsed.id = normalizeSpeakerId(parsed.id || basename(file, ".json"));
      profiles.push(parsed);
    } catch {
      // Ignore invalid files
    }
  }
  const discovered = await discoverSpeakerProfiles(dir);
  const byId = new Map(profiles.map((profile) => [profile.id, profile]));
  for (const sample of discovered) {
    const enrolled = byId.get(sample.id);
    if (enrolled) {
      if (!enrolled.refAudioPath) enrolled.refAudioPath = sample.refAudioPath;
    } else {
      byId.set(sample.id, sample);
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export async function discoverSpeakerProfiles(directory = speakerDataDir): Promise<SpeakerProfile[]> {
  const dir = await ensureSpeakerDir(directory);
  const files = await readdir(dir);
  return files
    .filter((file) => extname(file).toLowerCase() === ".wav" && basename(file, ".wav").trim())
    .map((file) => {
      const rawStem = basename(file, ".wav");
      const id = normalizeSpeakerId(rawStem);
      return { id, name: rawStem, refAudioPath: join(dir, file), createdAt: "" };
    });
}

export async function loadSpeakerProfiles(namesOrIds?: string[], directory = speakerDataDir): Promise<SpeakerProfile[]> {
  const all = await listSpeakers(directory);
  if (!namesOrIds || namesOrIds.length === 0) return all;

  const targetIds = namesOrIds.map((n) => normalizeSpeakerId(n));
  return all.filter((s) => targetIds.includes(s.id) || namesOrIds.includes(s.name));
}

export async function getSpeakerRefPart(profile: SpeakerProfile): Promise<{ inlineData: { mimeType: string; data: string }; label: string } | undefined> {
  if (!profile.refAudioPath) return undefined;
  try {
    const fileStat = await stat(profile.refAudioPath);
    if (!fileStat.isFile()) return undefined;

    const buffer = await readFile(profile.refAudioPath);
    const mimeType = inferMimeType(profile.refAudioPath);
    const label = `Reference Audio Sample for Speaker '${profile.name}' (${profile.role || "Participant"}, ${profile.gender || "unspecified gender"})`;
    return {
      inlineData: {
        mimeType,
        data: buffer.toString("base64")
      },
      label
    };
  } catch {
    return undefined;
  }
}

function inferMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase();
  switch (ext) {
    case ".mp3": return "audio/mp3";
    case ".wav": return "audio/wav";
    case ".aac": return "audio/aac";
    case ".m4a": return "audio/m4a";
    case ".ogg": return "audio/ogg";
    case ".flac": return "audio/flac";
    default: return "audio/mp3";
  }
}
