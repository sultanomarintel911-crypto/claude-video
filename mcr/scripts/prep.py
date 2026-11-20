#!/usr/bin/env python3
"""Sediakan bahan untuk video tipografi "Kisah MCR" -> public/.

- Potong audio ceramah (bahagian MCR: 1:12.0 – 2:08.0) + normalkan kelantangan
- Jana tekstur bijian (grain) untuk latar
- Jana SFX (scripts/sfx.py)
"""
import os
import subprocess

import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.normpath(os.path.join(HERE, "..", "..", "bahan", "ceramah", "ceramah.mp4"))
PUB = os.path.normpath(os.path.join(HERE, "..", "public"))
for d in ("audio", "img", "sfx"):
    os.makedirs(os.path.join(PUB, d), exist_ok=True)

MULA, AKHIR = 72.0, 128.0  # mesti sama dengan CLIP_START / CLIP_END dalam src/data.ts

subprocess.run([
    "ffmpeg", "-y", "-loglevel", "error", "-ss", str(MULA), "-to", str(AKHIR), "-i", SRC,
    "-af", "highpass=f=70,afade=t=in:d=0.08,afade=t=out:st=%.2f:d=0.35,loudnorm=I=-15:TP=-1.5:LRA=9,aresample=48000"
    % (AKHIR - MULA - 0.35),
    "-ac", "2", os.path.join(PUB, "audio", "ceramah_mcr.wav"),
], check=True)
print("audio ceramah_mcr.wav")

# Tekstur bijian filem (tile 512x512, kelabu)
rng = np.random.default_rng(7)
for i in range(4):
    n = rng.normal(128, 38, (512, 512)).clip(0, 255).astype(np.uint8)
    Image.fromarray(n, "L").save(os.path.join(PUB, "img", f"grain{i}.png"))
print("grain x4")

subprocess.run(["python3", os.path.join(HERE, "sfx.py")], check=True)
