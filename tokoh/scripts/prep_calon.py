#!/usr/bin/env python3
"""Potret calon rekaan (bukan Thoriq) untuk babak 'imbasan calon'.

Setiap potret dipotong close-up berpusat pada wajah, di atas dada
(tiada lencana bendera / tanda nama / tera air), gred filem sama seperti gambar lain.
-> public/v8/calon/c{1..N}.jpg  +  calon.json (kotak wajah dalam bingkai 1920x1080)
"""
import glob
import json
import os

import cv2
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.normpath(os.path.join(HERE, "..", "..", "bahan", "calon"))
OUT = os.path.normpath(os.path.join(HERE, "..", "public", "v8", "calon"))
JS = os.path.normpath(os.path.join(HERE, "..", "src", "v8", "calon.json"))
YUNET = os.path.join(HERE, "model", "yunet.onnx")
os.makedirs(OUT, exist_ok=True)
CW, CH = 1920, 1080


def grade(x):
    x = x / 255.0
    x = x + 0.10 * (x - 0.5) * (1 - np.abs(2 * x - 1))
    x = 0.025 + x * 0.955
    g = x.mean(axis=2, keepdims=True)
    x = g + (x - g) * 0.85
    return np.clip(x * np.array([1.015, 1.0, 0.985]) * 255, 0, 255)


info = []
for k, p in enumerate(sorted(glob.glob(f"{SRC}/CALON_*.*"))):
    a = np.asarray(Image.open(p).convert("RGB"))
    H, W = a.shape[:2]
    det = cv2.FaceDetectorYN.create(YUNET, "", (W, H), 0.6, 0.3, 5000)
    _, fs = det.detect(a[:, :, ::-1].copy())
    x, y, w, h = max(fs, key=lambda f_: f_[2] * f_[3])[:4]
    # bingkai close-up: atas imej hingga 60% tinggi (lencana dada/bendera & tera air di luar bingkai)
    bh = 0.6 * H
    sc = CH / bh
    big = cv2.resize(a, (int(round(W * sc)), int(round(H * sc))), interpolation=cv2.INTER_LANCZOS4)
    cx = (x + w / 2) * sc
    x0 = int(np.clip(cx - CW / 2, 0, big.shape[1] - CW))
    crop = big[0:CH, x0:x0 + CW].astype(np.float32)
    crop = cv2.addWeighted(crop, 1.35, cv2.GaussianBlur(crop, (0, 0), 2.0), -0.35, 0)  # tajamkan sedikit selepas besarkan
    out = grade(crop).astype(np.uint8)
    Image.fromarray(out).save(f"{OUT}/c{k + 1}.jpg", quality=92)
    info.append({"x": float(x * sc - x0), "y": float(y * sc), "w": float(w * sc), "h": float(h * sc)})
    print(os.path.basename(p), "skala", round(sc, 2))
json.dump(info, open(JS, "w"))
