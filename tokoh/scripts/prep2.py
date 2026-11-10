#!/usr/bin/env python3
"""Bahan v6: b-roll, lapisan parallax 2.5D, gambar pelantikan dan data mozek.

- public/video/*.mp4    : b-roll (tanpa bunyi), potret hidup (grok_1)
- public/img/fg_*.png   : Thoriq sahaja (latar lutsinar), saiz sama dengan gambar asal
- public/img/bg_*.jpg   : latar dengan Thoriq dipadam (inpaint) untuk kesan kedalaman
- public/img/tiles/*.jpg: kepingan mozek; src/mosaic.json: susunan mozek
"""
import json
import os
import subprocess

import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.normpath(os.path.join(HERE, "..", "..", "bahan"))
PUB = os.path.normpath(os.path.join(HERE, "..", "public"))
SRCDIR = os.path.normpath(os.path.join(HERE, "..", "src"))
os.makedirs(os.path.join(PUB, "img", "tiles"), exist_ok=True)


def ff(*a):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *a], check=True)


COVER = "scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080"

# ---------------------------------------------------------------- b-roll
for name in ("tangga", "tali_kasut", "bayang_koridor", "raket"):
    ff("-i", f"{B}/broll/{name}.mp4", "-an", "-vf", COVER, "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", f"{PUB}/video/{name}.mp4")
# bendera: langkau 2.4 s pertama (ada tera air ✦)
ff("-ss", "2.4", "-i", f"{B}/broll/grok_4.mp4", "-an", "-vf", COVER, "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", f"{PUB}/video/bendera.mp4")
ff("-i", f"{B}/broll/grok_a.mp4", "-an", "-vf", COVER, "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", f"{PUB}/video/sekolah_senja.mp4")
ff("-i", f"{B}/broll/grok_1.mp4", "-an", "-vf", COVER, "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", f"{PUB}/video/potret_hidup.mp4")
ff("-i", f"{PUB}/video/potret_hidup.mp4", "-frames:v", "1", "-q:v", "2", f"{PUB}/img/mozek_sasaran.jpg")
print("b-roll siap")

# ---------------------------------------------------------------- gambar pelantikan
pel = Image.open(f"{B}/pelantikan.webp").convert("RGB")
pel.save(f"{PUB}/img/pelantikan.jpg", quality=92)
print("pelantikan", pel.size)

# ---------------------------------------------------------------- lapisan parallax
from rembg import new_session, remove  # noqa: E402

sess = new_session("u2net_human_seg")
FACES = {
    "squash_match": (0.445, 0.14, 0.515, 0.25),
    "hitting_ball": (0.37, 0.11, 0.49, 0.33),
    "handball_team": (0.465, 0.34, 0.53, 0.45),
    "olahraga_3": (0.565, 0.42, 0.615, 0.51),
    "pelantikan": (0.395, 0.297, 0.449, 0.38),
    "graduation": (0.27, 0.43, 0.365, 0.6),
}
report = {}
for name, fb in FACES.items():
    im = Image.open(f"{PUB}/img/{name}.jpg").convert("RGB")
    W, H = im.size
    a = np.asarray(remove(im, session=sess, only_mask=True, post_process_mask=True))
    binm = (a > 128).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(binm, 8)
    x0, y0, x1, y1 = int(fb[0] * W), int(fb[1] * H), int(fb[2] * W), int(fb[3] * H)
    box = lab[y0:y1, x0:x1]
    ids, cnt = np.unique(box[box > 0], return_counts=True)
    if len(ids) == 0:
        print("!! tiada komponen di wajah", name)
        continue
    k = ids[np.argmax(cnt)]
    m = (lab == k).astype(np.uint8) * 255
    area = (m > 0).mean()
    report[name] = round(float(area), 3)
    # latar depan (feather sedikit)
    alpha = Image.fromarray(m).filter(ImageFilter.GaussianBlur(1.5))
    fg = im.copy()
    fg.putalpha(alpha)
    fg.save(f"{PUB}/img/fg_{name}.png")
    # latar belakang: padam Thoriq (inpaint pada skala kecil, kemudian tampal semula)
    dil = cv2.dilate(m, np.ones((25, 25), np.uint8))
    sc = 0.35
    small = cv2.resize(np.asarray(im)[:, :, ::-1], None, fx=sc, fy=sc, interpolation=cv2.INTER_AREA)
    sm = cv2.resize(dil, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_NEAREST)
    inp = cv2.inpaint(small, sm, 9, cv2.INPAINT_TELEA)
    inp = cv2.resize(inp, (W, H), interpolation=cv2.INTER_CUBIC)[:, :, ::-1]
    inp = cv2.GaussianBlur(inp, (0, 0), 3)
    base = np.asarray(im).copy()
    mk = (cv2.GaussianBlur(dil, (0, 0), 6) / 255.0)[..., None]
    out = (base * (1 - mk) + inp * mk).astype(np.uint8)
    Image.fromarray(out).save(f"{PUB}/img/bg_{name}.jpg", quality=90)
print("parallax (peratus kawasan Thoriq):", report)

# ---------------------------------------------------------------- mozek
SRCS = ["squash_match", "hitting_ball", "squash_court", "handball_team", "standing", "graduation", "kelas", "olahraga_1",
        "olahraga_2", "olahraga_3", "olahraga_4", "pelantikan", "sekolah", "koridor", "papan_skeso"]
tiles = []
for i, n in enumerate(SRCS):
    im = Image.open(f"{PUB}/img/{n}.jpg").convert("RGB")
    for j, (cx, cy) in enumerate(((0.5, 0.5), (0.3, 0.4), (0.7, 0.6))):
        s = min(im.size) * 0.55
        c = im.crop((int(cx * im.width - s / 2), int(cy * im.height - s / 2), int(cx * im.width + s / 2), int(cy * im.height + s / 2)))
        c = c.resize((96, 96), Image.LANCZOS)
        fn = f"t{i:02d}{j}.jpg"
        c.save(f"{PUB}/img/tiles/{fn}", quality=85)
        tiles.append((fn, np.asarray(c, np.float32).reshape(-1, 3).mean(0)))
tgt = np.asarray(Image.open(f"{PUB}/img/mozek_sasaran.jpg").convert("RGB"), np.float32)
CELL, COLS, ROWS = 80, 24, 14
cells = []
rng = np.random.default_rng(3)
for r in range(ROWS):
    for c in range(COLS):
        blk = tgt[r * CELL:min(1080, (r + 1) * CELL), c * CELL:(c + 1) * CELL]
        col = blk.reshape(-1, 3).mean(0)
        lum = lambda v: 0.3 * v[0] + 0.59 * v[1] + 0.11 * v[2]  # noqa: E731
        order = sorted(range(len(tiles)), key=lambda k: abs(lum(tiles[k][1]) - lum(col)) + rng.uniform(0, 25))
        fn = tiles[order[0]][0]
        cells.append({"r": r, "c": c, "t": fn, "col": [int(v) for v in col]})
json.dump({"cell": CELL, "cols": COLS, "rows": ROWS, "cells": cells}, open(f"{SRCDIR}/mosaic.json", "w"))
print("mozek", len(cells), "kepingan,", len(tiles), "jenis")
