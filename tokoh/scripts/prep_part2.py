#!/usr/bin/env python3
"""Bahan Bahagian 2: gambar perjalanan pembesaran (jelas / wajah kabur / siluet) & potongan fail misi.

Rawatan wajah:
  - 'jelas'  : gambar asal
  - 'kabur'  : kawasan kepala Thoriq dikaburkan (topeng orang daripada rembg, bahagian atas)
  - 'siluet' : Thoriq digantikan siluet hitam bertepi cahaya; latar dimalapkan
-> public/v8/hidup/*.jpg, public/v8/img/misi_*.jpg
"""
import glob
import os

import cv2
import numpy as np
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.normpath(os.path.join(HERE, "..", "..", "bahan", "kehidupan"))
OUT = os.path.normpath(os.path.join(HERE, "..", "public", "v8", "hidup"))
IMG = os.path.normpath(os.path.join(HERE, "..", "public", "v8", "img"))
os.makedirs(OUT, exist_ok=True)
FS = sorted(glob.glob(f"{SRC}/*.jpg"))


def load(n):
    return ImageOps.exif_transpose(Image.open(FS[n - 1])).convert("RGB")


# (nombor gambar, rawatan, titik Thoriq (x,y dinormal), pecahan kepala daripada tinggi badan)
ITEMS = [
    (103, "jelas", None, 0),
    (95, "jelas", None, 0),
    (100, "jelas", None, 0),
    (94, "jelas", None, 0),
    (90, "jelas", None, 0),
    (88, "jelas", None, 0),
    (85, "kabur", (0.62, 0.45), 0.45),
    (87, "kabur", (0.5, 0.45), 0.42),
    (91, "kabur", (0.55, 0.6), 0.2),
    (80, "siluet", (0.45, 0.32), 0),
    (1, "siluet", (0.45, 0.42), 0),
    (73, "siluet", (0.5, 0.5), 0),
]

from rembg import new_session, remove  # noqa: E402

sess = new_session("u2net_human_seg")


def person_mask(im, pt):
    m = np.asarray(remove(im, session=sess, only_mask=True, post_process_mask=True))
    b = (m > 128).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(b, 8)
    H, W = b.shape
    px, py = int(pt[0] * W), int(pt[1] * H)
    k = lab[py, px]
    if k == 0:  # cari komponen terdekat
        best, bd = 0, 1e18
        for i in range(1, n):
            x, y, w, h, _ = stats[i]
            cx, cy = x + w / 2, y + h / 2
            dd = (cx - px) ** 2 + (cy - py) ** 2
            if dd < bd and stats[i][4] > 0.005 * W * H:
                best, bd = i, dd
        k = best
    return (lab == k).astype(np.uint8)


for i, (n, mode, pt, headf) in enumerate(ITEMS):
    im = load(n)
    im.thumbnail((2000, 2000), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    if mode == "kabur":
        m = person_mask(im, pt)
        ys, xs = np.nonzero(m)
        y0, y1 = ys.min(), ys.max()
        hy = int(y0 + (y1 - y0) * headf)
        head = m.copy()
        head[hy:] = 0
        head = cv2.dilate(head, np.ones((41, 41), np.uint8))
        soft = cv2.GaussianBlur(head.astype(np.float32), (0, 0), 18)[..., None]
        blur = cv2.GaussianBlur(a, (0, 0), 28)
        a = a * (1 - soft) + blur * soft
    elif mode == "siluet":
        m = person_mask(im, pt).astype(np.float32)
        m = cv2.GaussianBlur(m, (0, 0), 1.2)
        edge = np.clip(m - cv2.erode(m, np.ones((7, 7), np.uint8)), 0, 1)
        rim = cv2.GaussianBlur(edge, (0, 0), 2)[..., None]
        glow = cv2.GaussianBlur(m, (0, 0), 25)[..., None]
        bg = cv2.GaussianBlur(a, (0, 0), 3) * 0.55
        bg = bg + glow * (1 - m[..., None]) * np.array([255, 210, 140]) * 0.45
        a = bg * (1 - m[..., None]) + np.array([6, 6, 8]) * m[..., None] + rim * np.array([255, 225, 170]) * 0.9
    out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    out.save(f"{OUT}/h{i + 1:02d}.jpg", quality=92)
    print(f"h{i + 1:02d} <- #{n:03d} {mode} {out.size}")

# fail misi: papan tanda sahaja (tiada orang, tiada skuasy)
for n, name, box in ((57, "istanbul", (0.12, 0.0, 0.98, 0.42)), (60, "birmingham", (0.0, 0.0, 1.0, 0.44))):
    im = load(n)
    W, H = im.size
    c = im.crop((int(box[0] * W), int(box[1] * H), int(box[2] * W), int(box[3] * H)))
    c.save(f"{IMG}/misi_{name}.jpg", quality=92)
    print("misi", name, c.size)
