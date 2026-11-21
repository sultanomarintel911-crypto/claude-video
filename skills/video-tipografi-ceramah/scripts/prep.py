#!/usr/bin/env python3
"""Sediakan public/ untuk projek Remotion: potong audio, tekstur bijian, SFX.

Guna: python3 prep.py <video_sumber> <projek_dir> <mula_saat> <akhir_saat>
<mula>/<akhir> MESTI sama dengan CLIP_START / CLIP_END dalam src/data.ts.
"""
import os, subprocess, sys

import numpy as np
from PIL import Image

src, proj, mula, akhir = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
pub = os.path.join(proj, "public")
for d in ("audio", "img", "sfx"):
    os.makedirs(os.path.join(pub, d), exist_ok=True)

dur = akhir - mula
subprocess.run([
    "ffmpeg", "-y", "-loglevel", "error", "-ss", str(mula), "-to", str(akhir), "-i", src,
    "-af", f"highpass=f=70,afade=t=in:d=0.08,afade=t=out:st={dur - 0.35:.2f}:d=0.35,"
           "loudnorm=I=-15:TP=-1.5:LRA=9,aresample=48000",
    "-ac", "2", os.path.join(pub, "audio", "suara.wav"),
], check=True)
print("audio suara.wav", f"{dur:.1f}s")

rng = np.random.default_rng(7)
for i in range(4):
    n = rng.normal(128, 38, (512, 512)).clip(0, 255).astype(np.uint8)
    Image.fromarray(n, "L").save(os.path.join(pub, "img", f"grain{i}.png"))
print("grain x4")

subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), "sfx.py"),
                os.path.join(pub, "sfx")], check=True)
