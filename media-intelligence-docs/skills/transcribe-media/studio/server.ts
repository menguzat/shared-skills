import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../../');
const CONV_DIR = path.join(ROOT_DIR, '.conversations');
const SPEAKERS_DIR = path.join(ROOT_DIR, '.agents/skills/transcribe-media/data/speakers');
const PORT = Number(process.env.PORT) || 3030;

const app = express();
app.use(cors());
app.use(express.json());

// API: Get Full Conversation Catalog
app.get('/api/catalog', (req, res) => {
  const catalogPath = path.join(CONV_DIR, 'catalog.json');
  if (!fs.existsSync(catalogPath)) {
    return res.status(404).json({ error: 'Catalog not found' });
  }
  try {
    const raw = fs.readFileSync(catalogPath, 'utf8');
    res.setHeader('Content-Type', 'application/json');
    res.send(raw);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Enrolled Speaker Profiles
app.get('/api/speakers', (req, res) => {
  const roster: any[] = [];
  if (fs.existsSync(SPEAKERS_DIR)) {
    for (const file of fs.readdirSync(SPEAKERS_DIR)) {
      if (file.endsWith('.json')) {
        try {
          const profile = JSON.parse(fs.readFileSync(path.join(SPEAKERS_DIR, file), 'utf8'));
          roster.push(profile);
        } catch {}
      }
    }
  }
  res.json({ speakers: roster.sort((a, b) => (a.name || '').localeCompare(b.name || '')) });
});

// API: Pre-aggregated Speaker Attribution Review Incidents
app.get('/api/speaker-incidents', (req, res) => {
  const catalogPath = path.join(CONV_DIR, 'catalog.json');
  if (!fs.existsSync(catalogPath)) {
    return res.status(404).json({ error: 'Catalog not found' });
  }

  try {
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    const clusters: any[] = [];

    for (const conv of catalog.conversations || []) {
      if (!conv.transcriptPath || !conv.audioPath) continue;
      const jsonPath = conv.transcriptPath.replace('.transcript.md', '.transcript.json');

      for (const attPath of conv.speakerAttributionPaths || []) {
        const fullAttPath = path.join(CONV_DIR, attPath);
        if (fs.existsSync(fullAttPath)) {
          try {
            const sidecar = JSON.parse(fs.readFileSync(fullAttPath, 'utf8'));
            const bySpeaker = new Map<string, any>();

            for (const spk of sidecar.speakers || []) {
              const key = spk.diarizationSpeaker || 'Speaker 1';
              if (!bySpeaker.has(key)) {
                bySpeaker.set(key, {
                  convId: conv.id,
                  convTitle: conv.title,
                  audioPath: conv.audioPath,
                  transcriptPath: jsonPath,
                  diarizationSpeaker: key,
                  count: 0,
                  firstTimecode: spk.timecode,
                  matchedSpeakerId: spk.speakerId,
                  matchedSpeakerName: spk.speakerName,
                  confidence: spk.confidence || 0,
                  margin: spk.margin || 0,
                  status: spk.status || 'needs_review',
                });
              }
              const cluster = bySpeaker.get(key);
              cluster.count++;
              if ((spk.confidence || 0) > cluster.confidence) {
                cluster.confidence = spk.confidence;
                cluster.matchedSpeakerName = spk.speakerName;
                cluster.matchedSpeakerId = spk.speakerId;
                cluster.status = spk.status;
                cluster.firstTimecode = spk.timecode;
              }
            }

            for (const c of bySpeaker.values()) {
              if (c.status === 'needs_review' || c.confidence < 0.75) {
                clusters.push(c);
              }
            }
          } catch {}
        }
      }
    }

    clusters.sort((a, b) => a.confidence - b.confidence);
    res.json({ incidents: clusters, total: clusters.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API: Canonize Speaker
app.post('/api/canonize-speaker', (req, res) => {
  try {
    const { conversationId, transcriptPath, previousSpeaker, segmentIndex, speakerId, speakerName } = req.body;
    if (!transcriptPath || (!speakerId && !speakerName)) {
      return res.status(400).json({ error: 'Missing transcriptPath or speakerId/speakerName' });
    }

    const cleanRelPath = transcriptPath.replace(/^\.?\/?(?:\.conversations\/)?/, '');
    const absTranscriptPath = path.resolve(CONV_DIR, cleanRelPath);
    if (!fs.existsSync(absTranscriptPath)) {
      return res.status(404).json({ error: `Transcript not found: ${absTranscriptPath}` });
    }

    const targetSpeakerName = speakerName || speakerId;

    // 1. Update Transcript JSON
    const transcript = JSON.parse(fs.readFileSync(absTranscriptPath, 'utf8'));
    const segments = transcript.transcription || [];

    if (typeof segmentIndex === 'number' && segments[segmentIndex]) {
      segments[segmentIndex].speaker = targetSpeakerName;
    } else if (previousSpeaker) {
      for (const seg of segments) {
        if (seg.speaker === previousSpeaker) {
          seg.speaker = targetSpeakerName;
        }
      }
    }
    fs.writeFileSync(absTranscriptPath, JSON.stringify(transcript, null, 2), 'utf8');

    // 2. Update Speaker Attribution Sidecar Cache
    const cacheDir = path.join(path.dirname(absTranscriptPath), 'analyses', 'speaker-attribution', 'cache');
    if (fs.existsSync(cacheDir)) {
      for (const cacheFile of fs.readdirSync(cacheDir)) {
        if (cacheFile.endsWith('.json')) {
          try {
            const cachePath = path.join(cacheDir, cacheFile);
            const sidecar = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
            for (const spk of sidecar.speakers || []) {
              if (typeof segmentIndex === 'number' && spk.segmentIndex === segmentIndex) {
                spk.speakerId = speakerId || spk.speakerId;
                spk.speakerName = targetSpeakerName;
                spk.status = 'confirmed';
                spk.confidence = 1.0;
              } else if (previousSpeaker && spk.diarizationSpeaker === previousSpeaker) {
                spk.speakerId = speakerId || spk.speakerId;
                spk.speakerName = targetSpeakerName;
                spk.status = 'confirmed';
                spk.confidence = 1.0;
              }
            }
            fs.writeFileSync(cachePath, JSON.stringify(sidecar, null, 2), 'utf8');
          } catch {}
        }
      }
    }

    // 3. Rebuild Catalog in background
    try {
      execSync(`node "${path.join(CONV_DIR, 'build-catalog.mjs')}"`, { cwd: ROOT_DIR });
    } catch (err: any) {
      console.error('Catalog rebuild warning:', err.message);
    }

    const updatedCatalog = JSON.parse(fs.readFileSync(path.join(CONV_DIR, 'catalog.json'), 'utf8'));
    res.json({
      ok: true,
      message: `Canonized speaker '${targetSpeakerName}' successfully.`,
      catalog: updatedCatalog,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Media & Transcript Static Serving with Range Requests for Audio
app.use('/.conversations', express.static(CONV_DIR, {
  setHeaders: (res) => {
    res.setHeader('Accept-Ranges', 'bytes');
  },
}));

// Serve built React frontend if dist exists
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🎙️  LYF.lab Transcribe Studio Backend running at:`);
  console.log(`👉  http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
