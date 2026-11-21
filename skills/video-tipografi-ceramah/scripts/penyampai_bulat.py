#!/usr/bin/env python3
"""Kesan wajah penyampai & hasilkan klip segi empat (untuk bingkai bulat) yang mengikut wajah.

Guna: python3 -I penyampai_bulat.py <sumber.mp4> <out.mp4> <mula> <akhir> [--band Y0 Y1] [--size 560]
--band : julat baris piksel video sebenar (contoh rakaman skrin telefon: 603 1003). Tanpa --band,
         seluruh tinggi bingkai digunakan dan sisi segi empat = lebar terkecil.
Perlu: pip install "opencv-python-headless<5"  (v5 tiada CascadeClassifier)
Wajah dikesan setiap 0.5 s, kedudukan dilicinkan (purata 5 s) supaya bingkai tidak bergegar.
"""
import argparse, subprocess
import cv2, numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("src"); ap.add_argument("out"); ap.add_argument("t0", type=float); ap.add_argument("t1", type=float)
ap.add_argument("--band", nargs=2, type=int); ap.add_argument("--size", type=int, default=560)
a = ap.parse_args()

cap = cv2.VideoCapture(a.src)
Wf, Hf = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
Y0, Y1 = a.band if a.band else (0, Hf)
S = min(Y1 - Y0, Wf)
cas = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
ts, cx, cy = [], [], []
t = a.t0
while t < a.t1:
    cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000); ok, f = cap.read()
    if not ok: break
    g = cv2.cvtColor(f[Y0:Y1], cv2.COLOR_BGR2GRAY)
    fs = cas.detectMultiScale(g, 1.1, 5, minSize=(60, 60))
    if len(fs):
        x, y, w, h = max(fs, key=lambda r: r[2] * r[3]); ts.append(t); cx.append(x + w / 2); cy.append(Y0 + y + h * 0.6)
    t += 0.5
print(f"wajah dikesan {len(ts)} kali")
if not ts: ts, cx, cy = [a.t0], [Wf / 2], [(Y0 + Y1) / 2]
grid = np.arange(a.t0, a.t1 + 0.01, 0.1)
def smooth(v):
    x = np.interp(grid, ts, v); k = 25
    return np.convolve(np.pad(x, k, mode="edge"), np.ones(2 * k + 1) / (2 * k + 1), mode="valid")
sx, sy = smooth(cx), smooth(cy)

O = a.size
p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{O}x{O}", "-r", "30", "-i", "-",
                      "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", a.out], stdin=subprocess.PIPE)
cap.set(cv2.CAP_PROP_POS_MSEC, a.t0 * 1000); ok, fr = cap.read()
for i in range(int((a.t1 - a.t0) * 30)):
    t = a.t0 + i / 30
    while cap.get(cv2.CAP_PROP_POS_MSEC) / 1000 < t - 1e-3:
        ok, nf = cap.read()
        if not ok: break
        fr = nf
    x0 = int(np.clip(np.interp(t, grid, sx) - S / 2, 0, Wf - S))
    y0 = int(np.clip(np.interp(t, grid, sy) - S / 2, Y0, Y1 - S))
    c = cv2.resize(fr[y0:y0 + S, x0:x0 + S], (O, O), interpolation=cv2.INTER_LANCZOS4)
    c = cv2.addWeighted(c, 1.35, cv2.GaussianBlur(c, (0, 0), 1.2), -0.35, 0)
    p.stdin.write(c.tobytes())
p.stdin.close(); p.wait(); print("siap", a.out)
