#!/usr/bin/env python3
"""Potret calon rekaan (bukan Thoriq) untuk babak 'imbasan calon'.

Bidikan sederhana (imej penuh 16:9); lencana bendera di dada & tera air dipadam (inpaint).
Tolak masuk ke wajah semasa imbasan dibuat dalam Remotion, gred filem sama seperti gambar lain.
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


BENDERA = {
    "CALON_01": [(663, 593, 765, 645)],
    "CALON_02": [(663, 593, 765, 645)],
    "CALON_07": [(658, 594, 758, 646)],
    "CALON_08": [(625, 645, 730, 712)],
}
info = []
for k, p in enumerate(sorted(glob.glob(f"{SRC}/CALON_*.*"))):
    a = np.asarray(Image.open(p).convert("RGB"))
    H, W = a.shape[:2]
    det = cv2.FaceDetectorYN.create(YUNET, "", (W, H), 0.6, 0.3, 5000)
    _, fs = det.detect(a[:, :, ::-1].copy())
    x, y, w, h = max(fs, key=lambda f_: f_[2] * f_[3])[:4]
    # padam lencana bendera di dada (kotak ditetapkan manual, koordinat imej asal) + tera air bucu kanan bawah
    fix = np.zeros((H, W), np.uint8)
    for bx0, by0, bx1, by1 in BENDERA.get(os.path.basename(p).split(".")[0], []):
        cv2.rectangle(fix, (bx0 - 10, by0 - 10), (bx1 + 10, by1 + 10), 255, -1)
    cv2.rectangle(fix, (W - 120, H - 120), (W - 1, H - 1), 255, -1)
    a = cv2.inpaint(np.ascontiguousarray(a), fix, 7, cv2.INPAINT_TELEA)
    # bidikan sederhana: imej penuh 16:9 (tolak masuk ke wajah dibuat dalam Remotion)
    sc = max(CW / W, CH / H)
    big = cv2.resize(a, (int(round(W * sc)), int(round(H * sc))), interpolation=cv2.INTER_LANCZOS4)
    x0 = int(np.clip((x + w / 2) * sc - CW / 2, 0, big.shape[1] - CW))
    y0 = int((big.shape[0] - CH) / 2)
    crop = big[y0:y0 + CH, x0:x0 + CW].astype(np.float32)
    out = grade(crop).astype(np.uint8)
    Image.fromarray(out).save(f"{OUT}/c{k + 1}.jpg", quality=92)
    info.append({"x": float(x * sc - x0), "y": float(y * sc - y0), "w": float(w * sc), "h": float(h * sc)})
    print(os.path.basename(p), "skala", round(sc, 2))
json.dump(info, open(JS, "w"))
