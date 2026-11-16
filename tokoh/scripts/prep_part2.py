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
YUNET = os.path.join(HERE, "model", "yunet.onnx")


def faces(img):
    """Kesan semua wajah (YuNet), termasuk wajah kecil (imbasan 2 skala)."""
    out = []
    H, W = img.shape[:2]
    for sc in (1.0, 2.0):
        im = cv2.resize(img, (int(W * sc), int(H * sc)))
        det = cv2.FaceDetectorYN.create(YUNET, "", (im.shape[1], im.shape[0]), 0.55, 0.3, 5000)
        _, fs = det.detect(im)
        if fs is not None:
            for f_ in fs:
                x, y, w, h = (f_[:4] / sc).tolist()
                out.append((x, y, w, h))
    return out


def blur_region(a, mask, sigma=26, pix=14):
    """Kabur kuat + piksel pada kawasan topeng (0..1)."""
    H, W = a.shape[:2]
    small = cv2.resize(a, (max(1, W // pix), max(1, H // pix)), interpolation=cv2.INTER_AREA)
    px = cv2.resize(small, (W, H), interpolation=cv2.INTER_NEAREST)
    bl = cv2.GaussianBlur(px, (0, 0), sigma)
    m = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 10)[..., None]
    return a * (1 - m) + bl * m


def blur_faces(a):
    """Kaburkan setiap wajah + kawasan dada di bawahnya (tanda nama)."""
    H, W = a.shape[:2]
    m = np.zeros((H, W), np.float32)
    for x, y, w, h in faces(a.astype(np.uint8)):
        cx, cy = x + w / 2, y + h / 2
        cv2.ellipse(m, (int(cx), int(cy)), (int(w * 0.95), int(h * 1.05)), 0, 0, 360, 1, -1)
        cv2.rectangle(m, (int(cx - w * 1.3), int(y + h * 0.9)), (int(cx + w * 1.3), int(y + h * 2.9)), 1, -1)
    return blur_region(a, m), int(m.sum() > 0)


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
    a, nf = blur_faces(a)
    # lapisan keselamatan: kaburkan bahagian kepala SETIAP orang (wajah kecil yang terlepas)
    pm = (np.asarray(remove(im, session=sess, only_mask=True, post_process_mask=True)) > 128).astype(np.uint8)
    nlab, lab, stats, _ = cv2.connectedComponentsWithStats(pm, 8)
    hm = np.zeros(pm.shape, np.float32)
    for c in range(1, nlab):
        x, y, w, h, area = stats[c]
        if h < 0.12 * pm.shape[0]:
            continue
        top = (lab == c)
        top[int(y + h * 0.22):] = False
        hm = np.maximum(hm, top.astype(np.float32))
    hm = cv2.dilate(hm, np.ones((25, 25), np.uint8))
    a = blur_region(a, hm)
    if mode == "kabur":
        m = person_mask(im, pt)
        m = cv2.dilate(m, np.ones((31, 31), np.uint8))
        a = blur_region(a, m, sigma=30, pix=18)
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
    print(f"h{i + 1:02d} <- #{n:03d} {mode} {out.size} wajah={nf}")

# gambar terawal (hujung kotak kenangan): wajah dikaburkan juga
aw = np.asarray(load(101)).astype(np.float32)
aw, _ = blur_faces(aw)
Image.fromarray(np.clip(aw, 0, 255).astype(np.uint8)).save(os.path.join(IMG, "awal.jpg"), quality=92)
print("awal.jpg dikaburkan")

# fail misi: papan tanda sahaja (tiada orang, tiada skuasy)
for n, name, box in ((57, "istanbul", (0.12, 0.0, 0.98, 0.42)), (60, "birmingham", (0.0, 0.0, 1.0, 0.44))):
    im = load(n)
    W, H = im.size
    c = im.crop((int(box[0] * W), int(box[1] * H), int(box[2] * W), int(box[3] * H)))
    c.save(f"{IMG}/misi_{name}.jpg", quality=92)
    print("misi", name, c.size)
