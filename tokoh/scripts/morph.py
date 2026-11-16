#!/usr/bin/env python3
"""Siluet murid yang berubah-ubah (lelaki <-> perempuan) untuk trailer.

Bentuk diambil daripada potret pengawas (hanya topeng hitam - tiada wajah).
Morph lancar menggunakan interpolasi signed distance field (SDF).
Siluet terakhir = purata semua bentuk (sengaja kabur, tidak dapat diteka jantina).

-> public/v8/flow/morph_lambat.mp4 (perlahan) & morph_laju.mp4 (pantas, untuk klimaks)
"""
import math
import os
import subprocess

import cv2
import numpy as np
from scipy.ndimage import distance_transform_edt

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.normpath(os.path.join(HERE, "..", "..", "bahan", "siluet"))
OUT = os.path.normpath(os.path.join(HERE, "..", "public", "v8", "flow"))
W, H, FPS = 1920, 1080, 30
SW, SH = 960, 540  # resolusi kerja SDF

# susunan: lelaki, perempuan, bersilih ganti
ORDER = [9, 15, 32, 19, 35, 24, 39, 28]


def load(n):
    m = cv2.imread(f"{SRC}/m_f{n}.png", cv2.IMREAD_GRAYSCALE)
    m = (m > 128).astype(np.uint8)
    ys, xs = np.nonzero(m)
    x0, x1, y0 = xs.min(), xs.max(), ys.min()
    crop = m[y0:, x0:x1 + 1]
    # skala: tinggi kepala hingga bawah bingkai ~ 0.80 H
    target_h = int(SH * 0.82)
    sc = target_h / crop.shape[0]
    crop = cv2.resize(crop, (max(1, int(crop.shape[1] * sc)), target_h), interpolation=cv2.INTER_LINEAR)
    canvas = np.zeros((SH, SW), np.uint8)
    top = SH - target_h + 6
    left = SW // 2 - crop.shape[1] // 2
    canvas[top:top + target_h, left:left + crop.shape[1]] = crop[: SH - top]
    return canvas


def sdf(m):
    inside = distance_transform_edt(m)
    outside = distance_transform_edt(1 - m)
    return (inside - outside).astype(np.float32)


SDFS = [sdf(load(n)) for n in ORDER]
BLEND = np.mean(SDFS, axis=0)  # bentuk kabur akhir

# latar: gelap + cahaya dari belakang + kabus
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
d = np.sqrt(((xx - W / 2) / (W * 0.42)) ** 2 + ((yy - H * 0.42) / (H * 0.62)) ** 2)
BACK = np.clip(1 - d, 0, 1) ** 1.6
BG = np.stack([BACK * 150 + 6, BACK * 135 + 6, BACK * 110 + 9], -1)
rng = np.random.default_rng(4)
FOG = cv2.GaussianBlur(cv2.resize(rng.random((18, 60)).astype(np.float32), (W * 2, H), interpolation=cv2.INTER_CUBIC), (0, 0), 60)
FOG = (FOG - FOG.min()) / (FOG.max() - FOG.min())
DUST = [(rng.uniform(0, W), rng.uniform(0, H), rng.uniform(-10, 10), rng.uniform(-30, -8), rng.uniform(1.2, 3), rng.uniform(0, 6.28)) for _ in range(140)]


def render(field, t, flicker=1.0):
    big = cv2.resize(field, (W, H), interpolation=cv2.INTER_CUBIC) * (W / SW)
    mask = np.clip(big / 2.0 + 0.5, 0, 1)  # tepi lembut ~2px
    edge = np.clip(1 - np.abs(big) / 5.0, 0, 1) * (big > -6)
    rim = cv2.GaussianBlur(edge, (0, 0), 2.2)
    glow = cv2.GaussianBlur(mask, (0, 0), 38)
    ox = int((t * 25) % W)
    fog = FOG[:, ox:ox + W] * 0.35
    img = BG * (0.85 + 0.15 * math.sin(t * 1.3)) * flicker
    img = img + fog[..., None] * np.array([60, 58, 62])
    img = img + (glow * (1 - mask))[..., None] * np.array([120, 100, 70]) * 0.7
    img = img * (1 - mask[..., None]) + np.array([4, 4, 6]) * mask[..., None]
    img = img + (rim * mask)[..., None] * np.array([255, 225, 170]) * 0.85
    img = np.clip(img, 0, 255).astype(np.uint8)
    for x0, y0, vx, vy, s, ph in DUST:
        x, y = int((x0 + vx * t) % W), int((y0 + vy * t) % H)
        b = 0.4 + 0.6 * abs(math.sin(ph + t * 2))
        cv2.circle(img, (x, y), int(s), (int(255 * b), int(220 * b), int(160 * b)), -1, lineType=cv2.LINE_AA)
    return img[:, :, ::-1]  # RGB -> BGR untuk ffmpeg bgr24


def ease(x):
    return x * x * (3 - 2 * x)


def write(name, frames_fn, n):
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS),
                           "-i", "-", "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", f"{OUT}/{name}"], stdin=subprocess.PIPE)
    for i in range(n):
        ff.stdin.write(np.ascontiguousarray(frames_fn(i)).tobytes())
    ff.stdin.close()
    ff.wait()
    print("siap", name)


# --- perlahan: tahan 1.0 s, morph 0.9 s, akhir pada bentuk kabur
HOLD, MORPH = 1.0, 0.9
seq = SDFS + [BLEND]
STEP = HOLD + MORPH
N1 = int((STEP * (len(seq) - 1) + 2.5) * FPS)


def lambat(i):
    t = i / FPS
    k = min(int(t // STEP), len(seq) - 2)
    u = t - k * STEP
    a = ease(min(1.0, max(0.0, (u - HOLD) / MORPH)))
    if t >= STEP * (len(seq) - 1):
        field = seq[-1]
    else:
        field = seq[k] * (1 - a) + seq[k + 1] * a
    return render(field, t)


# --- pantas: bertukar setiap 0.22 s dengan kelipan, akhir pada bentuk kabur
N2 = int(6.0 * FPS)


def laju(i):
    t = i / FPS
    if t >= 4.6:
        return render(BLEND, t, 1.0)
    k = int(t / 0.22) % len(SDFS)
    u = (t % 0.22) / 0.22
    field = SDFS[k] * (1 - ease(u) * 0.5) + SDFS[(k + 1) % len(SDFS)] * ease(u) * 0.5
    flick = 1.35 if (t % 0.22) < 0.04 else 1.0
    return render(field, t, flick)


write("morph_lambat.mp4", lambat, N1)
write("morph_laju.mp4", laju, N2)
