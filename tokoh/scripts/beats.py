#!/usr/bin/env python3
"""Kesan rentak (beat) setiap lagu -> src/v8/beats.json

Untuk setiap lagu: senarai masa rentak (saat) + kekuatan (0..1, berdasarkan kekuatan onset & tenaga bass).
Digunakan oleh komponen untuk zum/hentakan gambar & potongan yang mengikut rentak muzik.
"""
import glob
import json
import os

import librosa
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
M = os.path.normpath(os.path.join(HERE, "..", "public", "v8", "muzik"))
OUT = os.path.normpath(os.path.join(HERE, "..", "src", "v8", "beats.json"))
res = {}
for p in sorted(glob.glob(f"{M}/*.mp3")):
    k = os.path.splitext(os.path.basename(p))[0]
    y, sr = librosa.load(p, sr=22050)
    hop = 256
    on = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    tempo, bt = librosa.beat.beat_track(onset_envelope=on, sr=sr, hop_length=hop, tightness=120)
    t = librosa.frames_to_time(bt, sr=sr, hop_length=hop)
    # kekuatan = onset di sekitar rentak x tenaga bass (rendah)
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
    fr = librosa.fft_frequencies(sr=sr, n_fft=2048)
    bass = S[fr < 150].sum(0)
    rms = librosa.feature.rms(y=y, hop_length=hop)[0]
    st = []
    for b in bt:
        a, z = max(0, b - 3), b + 4
        st.append(float(on[a:z].max()) * (0.5 + 0.5 * float(bass[a:z].max() / (bass.max() + 1e-9))) * float(rms[a:z].max()))
    st = np.array(st)
    st = np.clip(st / (np.percentile(st, 95) + 1e-9), 0, 1)
    res[k] = {"tempo": float(np.atleast_1d(tempo)[0]), "t": [round(float(x), 3) for x in t], "s": [round(float(x), 2) for x in st]}
    print(k, round(res[k]["tempo"], 1), len(t))
json.dump(res, open(OUT, "w"))
