#!/usr/bin/env python3
"""Potong panel papan cerita + sediakan potret (latar dibuang) -> public/img."""
import os
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "bahan")
OUT = os.path.join(HERE, "..", "public", "img")
os.makedirs(OUT, exist_ok=True)

sb = Image.open(os.path.join(SRC, "1.webp")).convert("RGB")
# (kiri, atas, kanan, bawah) -- sedikit ke dalam supaya bingkai bulat tidak kelihatan
PANELS = {
    "p1_loceng": (14, 104, 530, 398),
    "p2_kecoh": (584, 104, 1090, 398),
    "p3_pejabat": (1146, 104, 1660, 398),
    "p4_cermin": (14, 426, 530, 773),
    "p5_wira": (586, 426, 1104, 773),
    "p6_barisan": (1146, 426, 1660, 773),
}


def upscale(im, w=2400):
    h = round(im.height * w / im.width)
    im = im.resize((w, h), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=2.2, percent=70, threshold=2))
    return im


def kill_yellow(im, box):
    """Buang grafik 'kilat' kuning kartun dari papan cerita (isi dengan piksel jiran kabur)."""
    a = np.asarray(im).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mask = (r > 150) & (g > 110) & (b < 140) & (r - b > 60)
    inbox = np.zeros_like(mask)
    x0, y0, x1, y1 = box
    inbox[y0:y1, x0:x1] = True
    mask &= inbox
    m = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.MaxFilter(11))
    fill = im
    for _ in range(8):
        fill = Image.composite(fill.filter(ImageFilter.GaussianBlur(14)), im, m)
    return Image.composite(fill.filter(ImageFilter.GaussianBlur(6)), im, m.filter(ImageFilter.GaussianBlur(3)))


MARKS = {"p1_loceng": (285, 5, 410, 145), "p2_kecoh": (277, 0, 377, 85)}

for name, box in PANELS.items():
    p = sb.crop(box)
    if name in MARKS:
        p = kill_yellow(p, MARKS[name])
    upscale(p).save(os.path.join(OUT, name + ".jpg"), quality=92)
    print(name, p.size)

# Potret: latar biru/cyan rata -> alfa
por = Image.open(os.path.join(SRC, "2.jpg")).convert("RGB")
a = np.asarray(por).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
bg = (b > 170) & (g > 150) & (r < 140) & (b - r > 70)
alpha = Image.fromarray(((~bg) * 255).astype(np.uint8))
al = np.asarray(alpha).copy()
al[:, :6] = 0
al[:, -6:] = 0
al[:6, :] = 0
alpha = Image.fromarray(al)
alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.GaussianBlur(1.2))
# hilangkan tumpahan warna cyan di tepi
edge = np.asarray(alpha.filter(ImageFilter.GaussianBlur(4))).astype(np.float32) / 255
spill = (edge < 0.98)[..., None]
desp = a.copy()
desp[..., 1] = np.minimum(desp[..., 1], (desp[..., 0] + desp[..., 2]) / 2 + 10)
desp[..., 2] = np.minimum(desp[..., 2], desp[..., 0] + 20)
a2 = np.where(spill, desp, a).clip(0, 255).astype(np.uint8)
cut = Image.fromarray(a2).convert("RGBA")
cut.putalpha(alpha)
cut = cut.resize((cut.width * 2, cut.height * 2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 60, 2))
cut.save(os.path.join(OUT, "potret_alpha.png"))
print("potret_alpha", cut.size)

full = Image.open(os.path.join(SRC, "3.jpg")).convert("RGB")
full.save(os.path.join(OUT, "berdiri.jpg"), quality=92)
