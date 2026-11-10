#!/usr/bin/env python3
"""Bersihkan video dron (rakaman skrin): padam ikon 'play' yang bergerak dengan
pengesanan templat + inpainting setiap bingkai, kemudian potong bar pemain di bawah.
-> public/video/intro_dron.mp4 (1920x1080)
"""
import os
import subprocess

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.normpath(os.path.join(HERE, "..", "..", "bahan", "intro_sekolah.mp4"))
OUT = os.path.normpath(os.path.join(HERE, "..", "public", "video", "intro_dron.mp4"))

cap = cv2.VideoCapture(SRC)
fps = cap.get(cv2.CAP_PROP_FPS)
frames = []
while True:
    ok, fr = cap.read()
    if not ok:
        break
    frames.append(fr)
H, W = frames[0].shape[:2]

# templat ikon diambil pada t=1.0 s (pusat lebih kurang (645,405))
ref = frames[int(1.0 * fps)]
g = cv2.cvtColor(ref, cv2.COLOR_BGR2GRAY)
# cari pusat sebenar: bulatan gelap dengan segi tiga putih -> guna kawasan 70x70 dan cari titik paling putih
win = g[370:440, 610:680]
_, _, _, mx = cv2.minMaxLoc(cv2.GaussianBlur(win, (9, 9), 0))
cx, cy = 610 + mx[0] - 2, 370 + mx[1]
R = 19
tpl = g[cy - R:cy + R, cx - R:cx + R].copy()
print("pusat ikon rujukan", cx, cy)

mask_c = np.zeros((2 * R + 8, 2 * R + 8), np.uint8)
cv2.circle(mask_c, (R + 4, R + 4), R + 3, 255, -1)

found = 0
ff = subprocess.Popen(
    ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-",
     "-vf", "crop=1180:664:50:0,scale=1920:1080:flags=lanczos", "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", OUT],
    stdin=subprocess.PIPE,
)
for i, fr in enumerate(frames):
    gg = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY)
    # ikon mengecil bila dron naik -> cari pada beberapa skala
    best = (0.0, None, 1.0)
    for sc in (1.0, 0.9, 0.8, 0.7, 0.62, 0.55, 0.48):
        t = cv2.resize(tpl, None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA)
        res = cv2.matchTemplate(gg[: H - 60], t, cv2.TM_CCOEFF_NORMED)
        _, mv, _, loc = cv2.minMaxLoc(res)
        if mv > best[0]:
            best = (mv, loc, sc)
    mv, loc, sc = best
    if mv > 0.6:
        found += 1
        r = R * sc
        x, y = int(loc[0] + r), int(loc[1] + r)
        m = np.zeros((H, W), np.uint8)
        cv2.circle(m, (x, y), int(r + 4), 255, -1)
        fr = cv2.inpaint(fr, m, 7, cv2.INPAINT_TELEA)
    ff.stdin.write(fr.tobytes())
ff.stdin.close()
ff.wait()
print(f"ikon dipadam dalam {found}/{len(frames)} bingkai -> {OUT}")
