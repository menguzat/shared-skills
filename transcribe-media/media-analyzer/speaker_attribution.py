#!/usr/bin/env python3
"""Local diarization and reference-voice attribution; never edits transcript text."""
import json
import os
import shutil
import subprocess
import sys
import tempfile
from math import ceil
from datetime import datetime, timezone
from pathlib import Path


def seconds(value):
    parts = [float(part) for part in str(value).split(":")]
    if len(parts) == 3:
        return parts[0] * 3600 + parts[1] * 60 + parts[2]
    if len(parts) == 2:
        return parts[0] * 60 + parts[1]
    return parts[0]


def overlap(start, end, turn_start, turn_end):
    return max(0.0, min(end, turn_end) - max(start, turn_start))


def diarize(pipeline, source_file):
    try:
        return pipeline(source_file).speaker_diarization
    except ValueError as error:
        if "resulted in" not in str(error):
            raise
        duration = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", source_file], text=True).strip())
        padded = Path(tempfile.mkstemp(suffix=".wav", prefix="lyflab-speaker-pad-")[1])
        subprocess.run(["ffmpeg", "-y", "-i", source_file, "-ac", "1", "-ar", "16000", "-af", "apad", "-t", str(max(10, ceil(duration))), str(padded)], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        try:
            return pipeline(str(padded)).speaker_diarization
        finally:
            padded.unlink(missing_ok=True)


def main(config_path):
    config = json.loads(Path(config_path).read_text())
    token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
    if not token:
        raise RuntimeError("HF_TOKEN is required once to download pyannote/speaker-diarization-community-1 after accepting its model terms.")
    if sys.platform == "darwin" and not os.environ.get("DYLD_FALLBACK_LIBRARY_PATH"):
        ffmpeg = shutil.which("ffmpeg")
        if ffmpeg:
            os.environ["DYLD_FALLBACK_LIBRARY_PATH"] = str(Path(ffmpeg).resolve().parent.parent / "lib")
    try:
        import torch
        import torchaudio
        from pyannote.audio import Pipeline
        from speechbrain.inference.classifiers import EncoderClassifier
    except ImportError as error:
        raise RuntimeError("Missing local speaker-attribution dependencies. Install requirements-speaker-attribution.txt in Python 3.12.") from error

    transcript = json.loads(Path(config["transcriptPath"]).read_text())
    
    # Use existing transcript turn boundaries for instant high-precision attribution
    turns = []
    for segment in transcript.get("transcription", []):
        speaker_tag = segment.get("speaker") or "UNKNOWN"
        start = seconds(segment["timecode"])
        end = seconds(segment.get("endTimecode") or segment["timecode"])
        if end > start:
            turns.append((start, end, speaker_tag))
            
    if not turns and token:
        pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization-community-1", token=token)
        diarization = diarize(pipeline, config["sourceFile"])
        turns = [(float(turn.start), float(turn.end), str(label)) for turn, _, label in diarization.itertracks(yield_label=True)]

    encoder = EncoderClassifier.from_hparams(source="speechbrain/spkrec-ecapa-voxceleb")

    audio_cache = {}

    def load_audio(path):
        if path not in audio_cache:
            waveform, sample_rate = torchaudio.load(path)
            if sample_rate != 16000:
                waveform = torchaudio.functional.resample(waveform, sample_rate, 16000)
            audio_cache[path] = waveform.mean(dim=0, keepdim=True)
        return audio_cache[path]

    def embedding(path, start=None, end=None):
        waveform = load_audio(path)
        if start is not None:
            waveform = waveform[:, int(start * 16000):int(end * 16000)]
        if waveform.numel() == 0:
            return None
        with torch.no_grad():
            return encoder.encode_batch(waveform).squeeze().cpu()

    references = {speaker["id"]: embedding(speaker["refAudioPath"]) for speaker in config["speakers"]}
    names = {speaker["id"]: speaker["name"] for speaker in config["speakers"]}
    cluster_turns = {}
    for start, end, label in turns:
        dur = end - start
        if dur >= 1.0:
            cluster_turns.setdefault(label, []).append((dur, start, end))

    cluster_embeddings = {}
    for label, turn_list in cluster_turns.items():
        turn_list.sort(key=lambda x: x[0], reverse=True)
        for _, start, end in turn_list[:5]:
            value = embedding(config["sourceFile"], start, end)
            if value is not None:
                cluster_embeddings.setdefault(label, []).append(value)
    assignments = {}
    for label, values in cluster_embeddings.items():
        vector = torch.stack(values).mean(dim=0)
        scores = sorted(((float(torch.nn.functional.cosine_similarity(vector, ref, dim=0)), speaker_id) for speaker_id, ref in references.items() if ref is not None), reverse=True)
        if not scores:
            continue
        score, speaker_id = scores[0]
        margin = score - scores[1][0] if len(scores) > 1 else score
        status = "confirmed" if score >= config["minScore"] and margin >= config["minMargin"] else "needs_review"
        assignments[label] = {"speakerId": speaker_id, "speakerName": names[speaker_id], "confidence": round(score, 4), "margin": round(margin, 4), "status": status}

    results = []
    for index, segment in enumerate(transcript["transcription"]):
        start = seconds(segment["timecode"])
        end = seconds(segment.get("endTimecode") or segment["timecode"])
        candidates = sorted(((overlap(start, end, turn_start, turn_end), label) for turn_start, turn_end, label in turns), reverse=True)
        assignment = assignments.get(candidates[0][1]) if candidates and candidates[0][0] > 0 else None
        results.append({
            "segmentIndex": index,
            "timecode": segment["timecode"],
            "endTimecode": segment.get("endTimecode"),
            "diarizationSpeaker": candidates[0][1] if candidates and candidates[0][0] > 0 else None,
            "speakerId": assignment["speakerId"] if assignment else None,
            "speakerName": assignment["speakerName"] if assignment else None,
            "confidence": assignment["confidence"] if assignment else None,
            "margin": assignment["margin"] if assignment else None,
            "status": assignment["status"] if assignment else "unknown",
        })
    output = {
        "schemaVersion": "speaker-attribution-v1",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceTranscriptFingerprint": config["sourceTranscriptFingerprint"],
        "sourceTranscriptSidecar": str(Path(config["transcriptPath"]).resolve()),
        "sourceMediaFile": str(Path(config["sourceFile"]).resolve()),
        "models": {"diarization": "pyannote/speaker-diarization-community-1", "embedding": "speechbrain/spkrec-ecapa-voxceleb"},
        "thresholds": {"minScore": config["minScore"], "minMargin": config["minMargin"]},
        "speakers": results,
    }
    destination = Path(config["outputPath"])
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(output, indent=2) + "\n")


if __name__ == "__main__":
    try:
        main(sys.argv[1])
    except IndexError:
        raise SystemExit("Usage: speaker_attribution.py <input.json>")
