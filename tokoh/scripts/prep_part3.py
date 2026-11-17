#!/usr/bin/env python3
"""Bahan Bahagian 3 (selepas pendedahan): montaj 'FILE DECRYPTED' + keluarga.

Wajah JELAS (selepas pendedahan). Semua gambar -> 1920x1080, gred filem neutral.
Gambar potret / 4:3 diletak penuh tinggi dengan sisi dilanjutkan latar kabur.
Gambar lari berpagar: lapisan depan/belakang untuk paralaks 3D.
-> public/v8/b3/*.jpg
"""
import glob
import json
import os

import cv2
import numpy as np
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.normpath(os.path.join(HERE, "..", "..", "bahan"))
OUT = os.path.normpath(os.path.join(HERE, "..", "public", "v8", "b3"))
os.makedirs(OUT, exist_ok=True)
FS = sorted(glob.glob(f"{B}/kehidupan/*.jpg"))
CW, CH = 1920, 1080

ITEMS = {
    # rekod sekolah
    "s00": "upd:Ceremonial Hall with Floral Stage-15.png",  # Hari Anugerah dahulu (dulu & kini)
    "s01": "upd:Curtained awards stage with blue screen-12.png",
    "s02": "upd:Dewan Al-Ihsan School Hall-5.png",
    "s03": "upd:Gold-brown event stage and red carpet-8.png",
    "s04": "upd:Two Boys Beneath Burgundy Stage Curtains-17.png",
    "s05": "upd:Ornate stage with blue carpet and poster-8.png",
    "s06": "upd:Five students in a sunlit schoolyard-16.png",
    "s07": "upd:Teal-roofed school food fair-1.png",
    # sukan
    "k01": "upd:Young medalist at sports day-18.png",
    "k02": "upd:Medal ceremony beneath the sports-day canopy-7.png",
    "k03": "upd:Medal-winning school team seam repair-20.png",
    "k04": "upd:Medalists on a forest roadside-1.png",
    "k05": "upd:School stage with pink blossoms-14.png",
    "k06": "upd:Medaled boy in a quiet car-10.png",
    "k07": 3,
    "k08": 2,
    "k09": "upd:Mounted rider with chainmail face guard.png",
    # skuasy Malaysia
    "q01": "upd:Squash Court with Flags-6.png",
    "q02": "upd:Squash teams and fluttering flags-3.png",
    "q03": "upd:Squash Court Competition With Eight Players-13.png",
    "q04": "upd:Four players on a squash court-2.png",
    "q05": "upd:Low-angle squash player on court-4.png",
    "q06": "upd:Squash Court Match in Progress-12.png",
    "q07": "upd:Indoor racket rally-5.png",
    "q08": "upd:Dynamic squash rally on hardwood-10.png",
    "q09": "upd:Squash players on a glass court-9.png",
    "q10": "upd:Trophy exchange on an indoor court-12.png",
    # antarabangsa
    "i_sg": "upd:Cinematic squash court event-2.png",
    "i_bhm0": "upd:British Junior Open Squash Lobby-3.png",
    "i_bhm1": "upd:Children with Suitcase at Birmingham Airport-6.png",
    "i_bhm6": "upd:University of Birmingham Winter Exterior-1.png",
    "i_bhm7": "upd:Children outside a glass airport terminal-4.png",
    "i_bhm2": "upd:Brick campus lawn under clear skies-1.png",
    "i_bhm3": "upd:Two boys beside a modern garden facade-2.png",
    "i_bhm4": "upd:Two boys beside a squash court-9.png",
    "i_bhm5": "upd:Children on a snowy court-4.png",
    "i_ist": 57,
    "i_sh1": 37,
    "i_sh2": 38,
    "i_sh3": "upd:Family group in airport terminal-7.png",
    # keluarga & kawan-kawan
    "f01": "upd:Seamless hall extension with cake table-2.png",   # doa
    "f02": "upd:Seven people beside an open hatchback-7.png",     # ibu (selfie)
    "f03": "upd:Family group in airport terminal-7.png",          # ibu - lapangan terbang
    "f04": "upd:Brick campus lawn under clear skies-1.png",       # ayah (Birmingham)
    "f05": "upd:Smiling boys with a Malaysian flag.png",          # sahabat
    "f06": "upd:Turquoise shoulder and woven sampin-22.png",      # sahabat
    "f07": "upd:Childrens blossom stage presentation-13.png",     # milik semua
    "f08": "upd:Sports hall, stairway, and spectators-14.png",    # milik semua
    "f09": "upd:Children on a snowy court-4.png",                 # mimpi tiada sempadan
    "f10": "upd:School facade beneath blue sky-3.png",            # penutup
}


def load(n):
    if isinstance(n, str):
        p = os.path.join(B, "update", n[4:])
    else:
        p = FS[n - 1]
    return np.asarray(ImageOps.exif_transpose(Image.open(p)).convert("RGB")).astype(np.float32)


def grade(a):
    x = a / 255.0
    x = x + 0.10 * (x - 0.5) * (1 - np.abs(2 * x - 1))
    x = 0.02 + x * 0.96
    g = x.mean(axis=2, keepdims=True)
    x = g + (x - g) * 0.92
    return np.clip(x * np.array([1.012, 1.0, 0.988]) * 255, 0, 255)


def frame(a):
    """1920x1080: cover jika hampir 16:9, jika tidak tinggi penuh + sisi latar kabur."""
    H, W = a.shape[:2]
    if W / H > 1.6:
        sc = max(CW / W, CH / H)
        r = cv2.resize(a, (int(np.ceil(W * sc)), int(np.ceil(H * sc))), interpolation=cv2.INTER_AREA if sc < 1 else cv2.INTER_CUBIC)
        y0 = (r.shape[0] - CH) // 2
        x0 = (r.shape[1] - CW) // 2
        return r[y0:y0 + CH, x0:x0 + CW]
    sc = CH / H
    r = cv2.resize(a, (int(round(W * sc)), CH), interpolation=cv2.INTER_AREA if sc < 1 else cv2.INTER_CUBIC)
    scb = max(CW / W, CH / H)
    bg = cv2.resize(a, (int(np.ceil(W * scb)), int(np.ceil(H * scb))))
    y0 = (bg.shape[0] - CH) // 2
    bg = cv2.GaussianBlur(bg[y0:y0 + CH, :CW], (0, 0), 40) * 0.5
    w = r.shape[1]
    x0 = (CW - w) // 2
    ramp = np.clip(np.minimum(np.arange(w), np.arange(w)[::-1]) / 120.0, 0, 1)[None, :, None]
    bg[:, x0:x0 + w] = bg[:, x0:x0 + w] * (1 - ramp) + r * ramp
    return bg


info = {}
for k, src in ITEMS.items():
    a = grade(load(src))
    out = frame(a)
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(f"{OUT}/{k}.jpg", quality=90)
    info[k] = a.shape[1] / a.shape[0]
    print(k, src, a.shape[1], a.shape[0])

# lari berpagar (#001): lapisan paralaks 3D, penuh skrin (dipotong 'cover' pada pelari)
from rembg import new_session, remove  # noqa: E402

im = ImageOps.exif_transpose(Image.open(FS[0])).convert("RGB")
a = grade(np.asarray(im).astype(np.float32))
pm = (np.asarray(remove(im, session=new_session("u2net_human_seg"), only_mask=True, post_process_mask=True)) > 128).astype(np.uint8)
H, W = pm.shape
# pelari utama = komponen terbesar
n, lab, st, _ = cv2.connectedComponentsWithStats(pm, 8)
kbig = 1 + int(np.argmax(st[1:, 4]))
ys, xs = np.nonzero(lab == kbig)
cx, cy = xs.mean() / W, (ys.min() * 0.5 + ys.mean() * 0.5) / H
sc = CW / W
r = cv2.resize(a, (CW, int(H * sc)), interpolation=cv2.INTER_CUBIC)
rm = cv2.resize(pm.astype(np.float32), (CW, int(H * sc)))
y0 = int(np.clip(cy * r.shape[0] - CH / 2, 0, r.shape[0] - CH))
a2, m2 = r[y0:y0 + CH], rm[y0:y0 + CH]
m2 = cv2.GaussianBlur(cv2.dilate((m2 > 0.5).astype(np.uint8), np.ones((5, 5), np.uint8)).astype(np.float32), (0, 0), 2.5)
hole = cv2.dilate((m2 > 0.05).astype(np.uint8), np.ones((41, 41), np.uint8))
sm = cv2.resize(a2.astype(np.uint8), (CW // 4, CH // 4))
inp = cv2.resize(cv2.inpaint(sm, cv2.resize(hole, (CW // 4, CH // 4), interpolation=cv2.INTER_NEAREST), 9, cv2.INPAINT_TELEA), (CW, CH)).astype(np.float32)
bg = cv2.GaussianBlur(a2 * (1 - hole[..., None]) + inp * hole[..., None], (0, 0), 7)
Image.fromarray(np.clip(bg, 0, 255).astype(np.uint8)).save(f"{OUT}/lari_bg.jpg", quality=90)
Image.fromarray(np.dstack([np.clip(a2, 0, 255), m2 * 255]).astype(np.uint8), "RGBA").save(f"{OUT}/lari_fg.png", compress_level=3)
Image.fromarray(np.clip(a2, 0, 255).astype(np.uint8)).save(f"{OUT}/lari.jpg", quality=92)  # rata, tanpa kesan 3D
print("lari: y0", y0)
