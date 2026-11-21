"""Sediakan aset intro badge:
  - public/montaj/badge_rasmi.png  : badge rasmi dipotong (latar hitam -> lutsinar)
  - public/montaj/badge_titik.json : titik zarah untuk badge (tepi padat + isian jarang)
                                     dan nama sekolah (dirender dengan Orbitron 900)
Guna: python3 scripts/badge_titik.py <badge.jpeg> <orbitron900.ttf>
"""
import json
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

src, fon = sys.argv[1], sys.argv[2]
OUT = 'public/montaj/'
rng = np.random.default_rng(7)

img = cv2.imread(src)
h, w = img.shape[:2]
# latar = piksel gelap yang bersambung dengan bucu
gelap = (img.max(axis=2) < 60).astype(np.uint8)
mask = np.zeros((h + 2, w + 2), np.uint8)
isi = gelap.copy()
for x, y in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
    if isi[y, x]:
        cv2.floodFill(isi, mask, (x, y), 2)
alpha = np.where(isi == 2, 0, 255).astype(np.uint8)
alpha = cv2.GaussianBlur(alpha, (3, 3), 0)
ys, xs = np.where(alpha > 128)
x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
img, alpha = img[y0:y1 + 1, x0:x1 + 1], alpha[y0:y1 + 1, x0:x1 + 1]
rgba = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
rgba[:, :, 3] = alpha
TH = 1400
sk = TH / rgba.shape[0]
rgba = cv2.resize(rgba, (round(rgba.shape[1] * sk), TH), interpolation=cv2.INTER_AREA)
cv2.imwrite(OUT + 'badge_rasmi.png', rgba)
print('badge', rgba.shape)

# ---- titik badge (koordinat: tinggi badge = 1, pusat 0,0, y ke atas)
S = 700
k = S / rgba.shape[0]
b = cv2.resize(rgba, (round(rgba.shape[1] * k), S), interpolation=cv2.INTER_AREA)
bh, bw = b.shape[:2]
bgr, a = b[:, :, :3], b[:, :, 3]
kel = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
tepi = cv2.Canny(kel, 60, 160)
tepi[a < 200] = 0
# sempadan badge sendiri
tepi |= cv2.Canny(a, 50, 150)
ey, ex = np.where(tepi > 0)
pilih = rng.random(len(ex)) < 0.55
ex, ey = ex[pilih], ey[pilih]
# isian jarang
gy, gx = np.mgrid[3:bh:7, 3:bw:7]
gx, gy = gx.ravel(), gy.ravel()
ok = a[gy, gx] > 200
gx, gy = gx[ok], gy[ok]
px = np.concatenate([ex, gx]).astype(float)
py = np.concatenate([ey, gy]).astype(float)
jenis = np.concatenate([np.ones(len(ex)), np.zeros(len(gx))])
warna = bgr[py.astype(int), px.astype(int)][:, ::-1] / 255.0
px += rng.random(len(px)) - 0.5
py += rng.random(len(py)) - 0.5
X = (px - bw / 2) / bh
Y = -(py - bh / 2) / bh
print('titik badge', len(X), 'tepi', int(jenis.sum()))

# ---- titik nama sekolah
def teks_titik(teks, saiz, langkah):
    f = ImageFont.truetype(fon, saiz)
    l, t, r, bt = f.getbbox(teks)
    im = Image.new('L', (r - l + 20, bt - t + 20), 0)
    ImageDraw.Draw(im).text((10 - l, 10 - t), teks, font=f, fill=255)
    m = np.array(im)
    yy, xx = np.mgrid[0:m.shape[0]:langkah, 0:m.shape[1]:langkah]
    xx, yy = xx.ravel(), yy.ravel()
    ok = m[yy, xx] > 128
    xx, yy = xx[ok].astype(float), yy[ok].astype(float)
    return (xx - m.shape[1] / 2), -(yy - m.shape[0] / 2), m.shape

tx, ty, tsh = teks_titik('SEKOLAH KEBANGSAAN SULTAN OMAR', 120, 3)
print('titik teks', len(tx), tsh)

r = lambda v: [round(float(z), 4) for z in v]
json.dump({
    'badge': {'aspek': bw / bh, 'x': r(X), 'y': r(Y), 'c': [round(float(z), 3) for z in warna.ravel()], 'tepi': [int(z) for z in jenis]},
    'teks': {'lebar': tsh[1], 'tinggi': tsh[0], 'x': r(tx), 'y': r(ty)},
}, open(OUT + 'badge_titik.json', 'w'), separators=(',', ':'))
