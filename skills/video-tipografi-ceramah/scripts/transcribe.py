#!/usr/bin/env python3
"""Transkrip video/audio dengan masa setiap perkataan (faster-whisper).

Guna:  python3 -I transcribe.py <video_or_audio> <out.json> [--model medium] [--lang ms]
Cetak segmen ke stdout; simpan JSON [{start,end,text,words:[{w,s,e}]}].
Perlu: pip install faster-whisper ; ffmpeg.
Nota: audio dibaca sendiri via ffmpeg -> WAV -> numpy kerana sesetengah versi PyAV
gagal dengan decode_audio() faster-whisper ('metadata_errors').
"""
import argparse, json, os, subprocess, tempfile, wave

import numpy as np
from faster_whisper import WhisperModel

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("out")
ap.add_argument("--model", default="medium"); ap.add_argument("--lang", default="ms")
a = ap.parse_args()

with tempfile.TemporaryDirectory() as td:
    wav = os.path.join(td, "a.wav")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", a.src, "-ac", "1", "-ar", "16000", wav], check=True)
    wf = wave.open(wav)
    audio = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768

m = WhisperModel(a.model, device="cpu", compute_type="int8")
segs, _ = m.transcribe(audio, language=a.lang, word_timestamps=True, beam_size=5, vad_filter=False)
out = []
for s in segs:
    print(f"[{s.start:7.2f}-{s.end:7.2f}] {s.text}", flush=True)
    out.append({"start": s.start, "end": s.end, "text": s.text,
                "words": [{"w": w.word, "s": w.start, "e": w.end} for w in s.words]})
json.dump(out, open(a.out, "w"), ensure_ascii=False, indent=1)
