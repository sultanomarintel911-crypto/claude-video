#!/usr/bin/env python3
"""Pra-render babak siluet 'bangkit dari abu' (1920x1080, 30fps) -> public/video/siluet.mp4.

Bentuk badan diambil daripada potongan latar gambar sebenar (cut_standing.png).
Wajah TIDAK didedahkan di sini - hanya siluet hitam bertepi bara.
"""
import math
import os
import random
import subprocess

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
PUB = os.path.normpath(os.path.join(HERE, "..", "public"))
W, H, FPS = 1920, 1080, 30
D = 7.2
FORM_A, FORM_B = 0.7, 4.2


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def prog(t, a, b):
    return clamp((t - a) / (b - a))


def ease_io(x):
    x = clamp(x)
    return 3 * x * x - 2 * x * x * x


def lerp(a, b, p):
    return a + (b - a) * p


def smoothstep(a, b, x):
    x = np.clip((x - a) / (b - a), 0, 1)
    return x * x * (3 - 2 * x)


def fractal(h, w, seed, octaves=(3, 6, 12, 24, 48), pers=0.55):
    r = np.random.default_rng(seed)
    out, amp, tot = np.zeros((h, w), np.float32), 1.0, 0.0
    for o in octaves:
        gh = max(2, int(o * h / w)) + 2
        small = Image.fromarray((r.random((gh, o + 2)) * 255).astype(np.uint8))
        out += np.asarray(small.resize((w, h), Image.BICUBIC), np.float32) / 255 * amp
        tot += amp
        amp *= pers
    out /= tot
    return (out - out.min()) / (out.max() - out.min())


def radial(c_in, c_out, cx=0.5, cy=0.5, sx=1.0, sy=1.0, power=1.0):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.sqrt(((xx / W - cx) / sx) ** 2 + ((yy / H - cy) / sy) ** 2) * 2
    d = np.clip(d, 0, 1) ** power
    return np.array(c_in, np.float32) * (1 - d[..., None]) + np.array(c_out, np.float32) * d[..., None]


def th_at(t):
    return lerp(1.03, -0.03, ease_io(prog(t, FORM_A, FORM_B)))


# --- badan
cut = Image.open(os.path.join(PUB, "img", "cut_standing.png"))
FH = 1180  # tinggi paparan; kaki terkeluar bawah bingkai
sc = FH / cut.height
cut = cut.resize((int(cut.width * sc), FH), Image.LANCZOS)
PADX, PADT = 140, 140
mask = Image.new("L", (cut.width + 2 * PADX, FH + PADT), 0)
mask.paste(cut.getchannel("A"), (PADX, PADT))
mask = mask.point(lambda v: 255 if v > 110 else 0).filter(ImageFilter.GaussianBlur(1.2))
_fw, _fh = mask.size
FIG_X0, FIG_Y0 = W // 2 - _fw // 2, 150 - PADT
FIG_M = np.asarray(mask, np.float32) / 255
edge = ImageChops.subtract(mask, mask.filter(ImageFilter.MinFilter(7))).filter(ImageFilter.GaussianBlur(1.6))
FIG_RIM = np.asarray(edge, np.float32) / 255
_key = 0.55 * fractal(_fh, _fw, 31, octaves=(4, 8, 16, 32, 64)) + 0.45 * np.linspace(0, 1, _fh)[:, None]
FIG_KEY = (_key - _key.min()) / (_key.max() - _key.min())
HALO = np.asarray(mask.filter(ImageFilter.GaussianBlur(40)), np.float32) / 255

# --- asap
SMOKE = [fractal(2300, W, s) for s in (21, 22, 23)]
_yy = np.linspace(0, 1, H, dtype=np.float32)[:, None]
PROF = 0.3 + 0.7 * _yy ** 1.3
WARM = np.clip((_yy - 0.35) / 0.65, 0, 1) ** 1.6
COOL = np.array((112, 106, 112), np.float32)
HOT = np.array((255, 125, 45), np.float32)
BG = radial((150, 75, 30), (4, 3, 6), cy=0.55, sx=0.62, sy=0.85, power=0.6)
CTR = radial((1, 1, 1), (0.27, 0.27, 0.27), cy=0.5, sx=0.8, sy=1.0, power=0.9)[..., :1]

# --- zarah
r = random.Random(41)
ys, xs = np.nonzero(FIG_M > 0.6)
tgrid = np.linspace(0, FORM_B + 0.5, 500)
ths = np.array([th_at(x) for x in tgrid])
CONV = []
for _ in range(320):
    i = r.randrange(len(xs))
    tx, ty = xs[i], ys[i]
    if FIG_Y0 + ty > H:
        continue
    ta = float(tgrid[np.argmax(ths <= FIG_KEY[ty, tx])])
    ang = math.radians(r.uniform(15, 165))
    rad = r.uniform(250, 700)
    CONV.append((FIG_X0 + tx, FIG_Y0 + ty, math.cos(ang) * rad, math.sin(ang) * rad, ta, r.uniform(0.7, 1.2),
                 r.choice((-1, 1)) * r.uniform(40, 120), r.uniform(1.8, 3.6)))
EMB = [(r.gauss(W / 2, 520), r.uniform(0, H * 1.6), r.uniform(60, 220), r.uniform(0, 6.28), r.uniform(1.3, 3.8),
        r.uniform(20, 60)) for _ in range(220)]
ASH = [(r.uniform(0, W), r.uniform(0, H), r.uniform(-35, 35), r.uniform(-60, -15), r.uniform(0, 6.28),
        r.uniform(2.5, 6)) for _ in range(90)]


def ember_col(b):
    return (int(255 * b), int(lerp(110, 220, b) * b), int(50 * b))


def frame(t):
    ln = [SMOKE[k][int(t * sp) + k * 120: int(t * sp) + k * 120 + H] for k, sp in enumerate((80, 46, 120))]
    dens = smoothstep(0.22, 0.7, 0.5 * ln[0] + 0.3 * ln[1] + 0.2 * ln[2]) * PROF
    dens *= lerp(0.55, 1.0, ease_io(t / 1.5))
    warm = WARM * (0.75 + 0.25 * math.sin(t * 3.1) * math.sin(t * 1.7))
    col = COOL * (1 - warm[..., None]) + HOT * warm[..., None]
    lit = (0.55 + 0.9 * ln[2][..., None]) * CTR
    a = (dens * 0.92)[..., None]
    smoke_rgb = np.clip(col * lit, 0, 255)
    f = BG * (1 - a) + smoke_rgb * a

    th = th_at(t)
    vis = smoothstep(th, th + 0.02, FIG_KEY) * FIG_M
    band = np.exp(-((FIG_KEY - th) / 0.03) ** 2) * FIG_M * (1.0 if th > -0.02 else 0.0)
    pulse = 0.85 + 0.15 * math.sin(t * 5)
    body = np.array((9, 6, 6), np.float32)
    rimc = np.array((255, 150, 60), np.float32) * (FIG_RIM * pulse)[..., None]
    glow = np.array((255, 195, 95), np.float32) * band[..., None] * 1.5
    fa = np.clip(np.maximum(vis, band), 0, 1)[..., None]
    fig = np.clip(body * vis[..., None] + rimc * vis[..., None] + glow, 0, 255)
    hh = min(_fh, H - FIG_Y0)
    reg = f[FIG_Y0:FIG_Y0 + hh, FIG_X0:FIG_X0 + _fw]
    # halo cahaya hangat di belakang badan
    halo = (HALO[:hh] * 0.55 * ease_io(prog(t, FORM_B - 1, FORM_B + 1)))[..., None]
    reg[:] = reg + (np.array((255, 160, 70), np.float32) - reg) * halo * (1 - fa[:hh])
    reg[:] = reg * (1 - fa[:hh]) + fig[:hh] * fa[:hh]
    fd = (smoothstep(0.4, 0.85, ln[1]) * PROF * 0.5)[..., None]
    f = f * (1 - fd) + smoke_rgb * fd
    img = Image.fromarray(f.astype(np.uint8))

    d = ImageDraw.Draw(img)
    for x0, y0, vx, vy, ph, sz in ASH:
        x, y = (x0 + vx * t + 16 * math.sin(ph + t)) % W, (y0 + vy * t) % H
        fl = math.cos(ph + 4 * t)
        g = int(lerp(70, 140, abs(fl)))
        d.polygon([(x - sz, y), (x, y - sz * fl * 0.6), (x + sz, y), (x, y + sz * fl * 0.6)], fill=(g, g - 5, g - 8))
    P = Image.new("RGB", (W, H))
    pd = ImageDraw.Draw(P)
    for x0, y0, vy, ph, sz, sw in EMB:
        y = (y0 - vy * t) % (H * 1.6) - H * 0.3
        x = x0 + sw * math.sin(ph + t * 1.3)
        b = clamp(0.45 + 0.55 * math.sin(ph * 3 + t * 9) * math.sin(ph + t * 4)) * clamp(y / H + 0.2)
        if b > 0.05:
            pd.ellipse((x - sz, y - sz, x + sz, y + sz), fill=ember_col(b))
    for tx, ty, dx, dy, ta, tr, sw, sz in CONV:
        u = (t - (ta - tr)) / tr
        if 0 <= u <= 1:
            e = u * u
            px, py = tx + dx * (1 - e) + sw * math.sin(math.pi * u), ty + dy * (1 - e)
            pd.ellipse((px - sz, py - sz, px + sz, py + sz), fill=ember_col(0.4 + 0.6 * u))
    G = P.filter(ImageFilter.GaussianBlur(7)).point(lambda v: min(255, v * 3))
    return ImageChops.add(ImageChops.add(img, P), G)


def main():
    out = os.path.join(PUB, "video", "siluet.mp4")
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                           "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", out],
                          stdin=subprocess.PIPE)
    n = int(D * FPS)
    for i in range(n):
        ff.stdin.write(frame(i / FPS).tobytes())
        if i % 50 == 0:
            print(f"  {i}/{n}")
    ff.stdin.close()
    ff.wait()
    print("siap", out)


if __name__ == "__main__":
    main()
