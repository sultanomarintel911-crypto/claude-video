#!/usr/bin/env python3
"""Jana lapisan landskap bukit hijau (gaya filem, langit mendung) untuk parallax 3D.
Output: public/latar/{langit,awan,jauh,bukit,hutan,depan}.png  — semuanya asli, bebas hak cipta.
Guna: python3 scripts/latar_bukit.py
"""
import os
import numpy as np
from PIL import Image, ImageFilter

import sys
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "latar")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(11)
W, H = 1500, 1920  # lebih lebar daripada 1080 untuk ruang anjakan


def fbm2(h, w, octaves=6, base=4, seed=0):
    """Hingar fraktal 2D (nilai 0..1) melalui interpolasi grid rawak."""
    r = np.random.default_rng(seed)
    acc = np.zeros((h, w), np.float32)
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        n = base * 2 ** o
        g = r.random((n + 1, int(n * w / h) + 2)).astype(np.float32)
        im = Image.fromarray((g * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        acc += amp * np.asarray(im, np.float32) / 255
        tot += amp
        amp *= 0.5
    return acc / tot


def ridge(w, y0, amp, octaves=5, seed=0, base=3):
    r = np.random.default_rng(seed)
    x = np.zeros(w)
    a = 1.0
    for o in range(octaves):
        n = base * 2 ** o
        pts = r.random(n + 2)
        x += a * np.interp(np.linspace(0, n, w), np.arange(n + 2), pts)
        a *= 0.45
    x = (x - x.min()) / (x.max() - x.min())
    return y0 - x * amp


def lerp(c0, c1, t):
    c0, c1 = np.array(c0, np.float32), np.array(c1, np.float32)
    return c0 + (c1 - c0) * t[..., None]


def save(name, rgb, alpha=None):
    rgb = np.clip(rgb, 0, 255).astype(np.uint8)
    if alpha is None:
        Image.fromarray(rgb, "RGB").save(os.path.join(OUT, name))
    else:
        a = np.clip(alpha * 255, 0, 255).astype(np.uint8)
        Image.fromarray(np.dstack([rgb, a]), "RGBA").save(os.path.join(OUT, name))
    print(name)


yy = np.linspace(0, 1, H)[:, None] * np.ones((1, W))

# 1. Langit mendung
t = np.clip(yy / 0.6, 0, 1)
sky = lerp((92, 104, 118), (176, 184, 190), t ** 0.8)
sky += (fbm2(H, W, 5, 2, 1)[..., None] - 0.5) * 18
save("langit.png", sky)

# 2. Awan (lebar 2400 untuk hanyut)
CW, CH = 2400, 1000
n = fbm2(CH, CW, 7, 2, 2)
yc = np.linspace(0, 1, CH)[:, None]
mask = np.clip((n - 0.52) * 4.0, 0, 1) * np.clip(1 - np.abs(yc - 0.55) * 2.2, 0, 1)
shade = fbm2(CH, CW, 4, 3, 3)
col = lerp((150, 152, 160), (236, 232, 234), np.clip(shade * 1.4 - 0.1, 0, 1))
a = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(10))
save("awan.png", col, np.asarray(a, np.float32) / 255 * 0.92)

# 3. Rabung jauh (kabus kebiruan)
rj = ridge(W, 1000, 170, seed=4)
mask = (yy * H > rj[None, :]).astype(np.float32)
haze = np.clip((yy * H - rj[None, :]) / 500, 0, 1)
col = lerp((112, 132, 124), (78, 104, 84), haze)
col += (fbm2(H, W, 5, 6, 5)[..., None] - 0.5) * 14
save("jauh.png", col, mask)

# 4. Bukit rumput utama (hijau terang, tompok rumput, batu kecil)
rb = ridge(W, 1130, 150, seed=7, base=2)
d = yy * H - rb[None, :]
mask = (d > 0).astype(np.float32)
tex = fbm2(H, W, 7, 6, 8)
light = np.clip(1 - d / 420, 0, 1)
col = lerp((70, 104, 40), (150, 178, 84), np.clip(light * 0.75 + (tex - 0.5) * 0.9, 0, 1))
fine = fbm2(H, W, 3, 120, 9)
col *= (0.92 + 0.16 * fine)[..., None]
for _ in range(14):  # batu kecil, samar
    x = rng.integers(0, W); y0 = rb[x] + rng.integers(30, 300)
    r = rng.integers(2, 5)
    yy0, xx0 = np.ogrid[-r:r + 1, -r * 2:r * 2 + 1]
    m = (xx0 / 2) ** 2 + yy0 ** 2 <= r * r
    ys, xs = int(y0) - r, x - 2 * r
    if 0 <= ys < H - 2 * r - 1 and 0 <= xs < W - 4 * r - 1:
        col[ys:ys + 2 * r + 1, xs:xs + 4 * r + 1][m] = col[ys:ys + 2 * r + 1, xs:xs + 4 * r + 1][m] * 0.6 + np.array((150, 148, 128)) * 0.4
save("bukit.png", col, mask)

# 5. Hutan: kanopi bertekstur, tiada jalur keras
from PIL import ImageDraw


def kanopi(y_line, n_blob, rr, shades, seed, blur):
    r_ = np.random.default_rng(seed)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(img)
    for _ in range(n_blob):
        x = r_.integers(-60, W + 60)
        y = y_line[min(max(int(x), 0), W - 1)] + r_.integers(-30, 220)
        r = r_.integers(*rr)
        c = shades[r_.integers(0, len(shades))]
        k = 0.85 + 0.3 * r_.random()
        dr.ellipse([x - r, y - r * 0.9, x + r, y + r], fill=tuple(int(v * k) for v in c) + (255,))
    a = np.asarray(img, np.float32)
    alpha = a[..., 3] / 255
    filled = np.maximum.accumulate(alpha, axis=0)  # isi bawah kanopi
    rgb = a[..., :3]
    under = (filled > 0.5) & (alpha < 0.5)
    rgb[under] = np.array(shades[0]) * 0.7
    tex = fbm2(H, W, 7, 30, seed + 1)
    rgb *= (0.7 + 0.6 * tex)[..., None]
    out = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), filled * 255]).astype(np.uint8), "RGBA")
    if blur:
        out = out.filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(out, np.float32)


fy = ridge(W, 1300, 90, seed=12, base=4)
f1 = kanopi(fy, 1500, (9, 26), [(34, 62, 32), (44, 76, 38), (28, 52, 28), (52, 84, 44)], 30, 0.8)
fy2 = ridge(W, 1420, 80, seed=14, base=5)
f2 = kanopi(fy2, 1300, (12, 34), [(22, 44, 22), (30, 58, 28), (18, 38, 20), (38, 68, 34)], 40, 0.8)
comp = f1.copy()
a2 = f2[..., 3:4] / 255
comp[..., :3] = comp[..., :3] * (1 - a2) + f2[..., :3] * a2
comp[..., 3] = np.maximum(f1[..., 3], f2[..., 3])
# batang pokok mati / ranting (seperti gambar rujukan)
img = Image.fromarray(comp.astype(np.uint8), "RGBA"); dr = ImageDraw.Draw(img)
for x0 in [420, 980]:
    y0 = int(fy2[x0]) + 40
    dr.line([(x0, y0 + 260), (x0 - 8, y0 - 60)], fill=(112, 110, 98, 255), width=3)
    dr.line([(x0 - 6, y0), (x0 - 50, y0 - 70)], fill=(104, 102, 92, 255), width=2)
    dr.line([(x0 - 4, y0 - 30), (x0 + 40, y0 - 90)], fill=(104, 102, 92, 255), width=2)
comp = np.asarray(img, np.float32)
dark = np.clip((yy * H - 1300) / 700, 0, 1)
comp[..., :3] *= (1 - 0.35 * dark)[..., None]
save("hutan.png", comp[..., :3], comp[..., 3] / 255)

# 6. Depan: semak + rumput tinggi, dikaburkan (kedalaman medan / fokus kamera)
by = ridge(W, 1640, 80, seed=21, base=6)
f3 = kanopi(by, 1400, (12, 34), [(40, 76, 30), (52, 92, 36), (34, 64, 28), (60, 100, 44)], 50, 0)
img = Image.fromarray(f3.astype(np.uint8), "RGBA"); dr = ImageDraw.Draw(img)
for _ in range(1400):
    x0 = rng.integers(0, W); y0 = rng.integers(1780, H + 60); hgt = rng.integers(50, 170)
    lean = rng.integers(-26, 26); g = rng.integers(0, 40)
    dr.line([(x0, y0), (x0 + lean, y0 - hgt)], fill=(70 + g, 104 + g, 50 + g // 2, 255), width=int(rng.integers(2, 4)))
for _ in range(25):  # bunga liar kecil
    x0 = rng.integers(0, W); y0 = rng.integers(1700, 1880)
    dr.ellipse([x0 - 4, y0 - 4, x0 + 4, y0 + 4], fill=(214, 186, 176, 255))
img = img.filter(ImageFilter.GaussianBlur(2.2))
fa = np.asarray(img, np.float32)
fa[..., :3] *= 0.85
save("depan.png", fa[..., :3], fa[..., 3] / 255)
