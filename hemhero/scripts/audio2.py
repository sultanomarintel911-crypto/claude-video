#!/usr/bin/env python3
"""Babak 2 MISI PK HEM: runut bunyi 30 s -> public/sfx/runut2.wav (48 kHz stereo).

Tiada dialog/suara manusia/narasi/nyanyian. Masa mesti selari dengan src/data2.ts.
"""
import os
import wave

import numpy as np

from audio import (SR, bell_strike, bp, comedy_sting, crowd, footstep, glint, hp, hz, impact, lp, note,
                   reverb, riser, rng, slide_whistle, st, timpani, tt, whip, whistle, whoosh, chair_creak)

DUR = 30.0
N = int(DUR * SR)
OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "sfx"))

T = dict(title=0.0, s1a=2.0, s1b=3.8, s2=6.0, s3=11.0, s4=16.0, s5=20.4, s6=24.4, ring=26.6, end=29.6)

MIX = np.zeros((2, N + SR * 4))


def put(x, at, gain=1.0, p=0.0):
    x = st(x, p)
    i = int(at * SR)
    if i >= MIX.shape[1]:
        return
    m = min(x.shape[1], MIX.shape[1] - i)
    MIX[:, i : i + m] += x[:, :m] * gain


# ---------------- SFX baharu ----------------
def page_flip():
    d = 0.11
    t = tt(d)
    n = rng.standard_normal(len(t))
    e = np.sin(np.pi * t / d) ** 2
    return (bp(n, 1500, 9000) * e + bp(n, 300, 1200) * e * 0.4) * (0.7 + 0.3 * rng.random())


def book_thud():
    t = tt(0.4)
    x = np.sin(2 * np.pi * (90 + 60 * np.exp(-t * 40)) * t) * np.exp(-t * 18)
    return x + bp(rng.standard_normal(len(t)), 200, 3000) * np.exp(-t * 50) * 0.6


def stamp():
    t = tt(0.5)
    thump = np.sin(2 * np.pi * (70 + 120 * np.exp(-t * 60)) * t) * np.exp(-t * 14)
    click = hp(rng.standard_normal(len(t)), 1500) * np.exp(-t * 120) * 0.8
    return reverb(thump * 1.4 + click, rt=0.6, wet=0.15)


def pen_scratch(d=0.6):
    t = tt(d)
    n = rng.standard_normal(len(t))
    strokes = (np.sin(2 * np.pi * 7 * t) > -0.2).astype(float)
    return bp(n, 2500, 7000) * strokes * lp(np.abs(rng.standard_normal(len(t))), 30) * 2


def clip_tick():
    t = tt(0.08)
    return bp(rng.standard_normal(len(t)), 1800, 6000) * np.exp(-t * 90) + np.sin(2 * np.pi * 1900 * t) * np.exp(-t * 70) * 0.4


def boing(d=0.55, f0=180, f1=420):
    t = tt(d)
    f = f0 + (f1 - f0) * (1 - np.exp(-t * 18)) + 25 * np.sin(2 * np.pi * 14 * t) * np.exp(-t * 3)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * np.sin(4 * np.pi * np.cumsum(f) / SR)
    return x * np.exp(-t * 5) * np.minimum(t / 0.005, 1)


def cutlery(d):
    x = np.zeros(int(d * SR))
    for _ in range(int(d * 9)):
        f = rng.uniform(2500, 6000)
        t = tt(0.25)
        ping = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.7 * t)) * np.exp(-t * rng.uniform(15, 30))
        i = int(rng.uniform(0, d - 0.25) * SR)
        x[i : i + len(t)] += ping * rng.uniform(0.1, 0.35)
    return x


def tape_rip():
    t = tt(0.35)
    n = rng.standard_normal(len(t))
    crackle = (rng.random(len(t)) > 0.7).astype(float)
    return hp(n * crackle, 1200) * np.sin(np.pi * t / 0.35) * 0.8


def pat():
    t = tt(0.12)
    return lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 45)


def success_jingle():
    out = np.zeros(int(1.6 * SR))
    for k, n in enumerate((72, 76, 79, 84)):
        t = tt(0.9 if k == 3 else 0.2)
        tone = sum(np.sin(2 * np.pi * hz(n) * h * t) / h ** 1.5 for h in (1, 2, 3, 4)) * np.exp(-t * (3 if k == 3 else 9))
        i = int(k * 0.09 * SR)
        out[i : i + len(t)] += tone * 0.5
    return reverb(out, rt=1.2, wet=0.25)


def phone_ring(d=1.0):
    """Telefon pejabat: dua loceng kecil dipukul pada 20 Hz."""
    t = tt(d)
    x = np.zeros_like(t)
    for f0 in (1180.0, 1460.0):
        for r, a in ((1, 1.0), (2.32, 0.45), (3.9, 0.2)):
            x += a * np.sin(2 * np.pi * f0 * r * t)
    gate = 0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 20 * t))
    e = np.minimum(t / 0.01, 1) * np.minimum((d - t) / 0.03, 1).clip(0, 1)
    return np.tanh(x * gate * e * 0.7) * 1.2


def sad_trombone():
    out = np.zeros(int(2.2 * SR))
    for k, (n, d) in enumerate(((58, 0.35), (57, 0.35), (56, 0.35), (55, 1.0))):
        t = tt(d)
        vib = 1 + (0.012 * np.sin(2 * np.pi * 6 * t) if k == 3 else 0)
        ph = 2 * np.pi * np.cumsum(hz(n) * vib) / SR
        x = sum(np.sin(h * ph) / h ** 1.2 for h in range(1, 9))
        e = np.minimum(t / 0.04, 1) * np.minimum((d - t) / 0.06, 1).clip(0, 1)
        x = lp(x * e, 1400)
        i = int(sum(dd for _, dd in ((58, 0.35), (57, 0.35), (56, 0.35))[:k]) * SR)
        out[i : i + len(t)] += x * 0.5
    return reverb(out, rt=0.8, wet=0.15)


# ---------------- Dram & muzik misi ----------------
def kick():
    t = tt(0.35)
    return np.sin(2 * np.pi * np.cumsum(50 + 110 * np.exp(-t * 35)) / SR) * np.exp(-t * 9)


def snare():
    t = tt(0.25)
    return bp(rng.standard_normal(len(t)), 1200, 8000) * np.exp(-t * 22) * 0.7 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.5


def hat(open_=False):
    t = tt(0.15 if open_ else 0.05)
    return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * (18 if open_ else 80))


def pluck(f, d=0.25):
    t = tt(d)
    x = sum(np.sin(2 * np.pi * f * h * t) / h ** 1.3 for h in range(1, 7))
    return lp(x * np.exp(-t * 12) * np.minimum(t / 0.004, 1), 2500)


BEAT = 0.5  # 120 BPM


def music():
    m = np.zeros((2, N + SR * 4))

    def add(x, at, g=1.0, p=0.0):
        x = st(x, p)
        i = int(at * SR)
        k = min(x.shape[1], m.shape[1] - i)
        m[:, i : i + k] += x[:, :k] * g

    # Bahagian misi (2.0 -> 20.4): groove ala filem pengintip, F minor
    bassline = [41, 41, 44, 41, 46, 41, 48, 47]  # F F Ab F Bb F C B
    stabs = {0: [65, 68, 72], 8: [63, 67, 70], 16: [65, 68, 72], 24: [61, 65, 68]}
    t0, t1 = T["s1a"], T["s5"]
    k = 0
    while t0 + k * BEAT / 2 < t1 - 0.01:
        at = t0 + k * BEAT / 2
        if k % 8 in (0, 5):
            add(kick(), at, 0.8)
        if k % 8 in (2, 6):
            add(snare(), at, 0.45, 0.1)
        add(hat(k % 4 == 3), at, 0.12 if k % 2 else 0.2, 0.4)
        add(note(hz(bassline[k % 8]), BEAT / 2 * 0.9, "bass"), at, 0.5)
        if k % 32 in stabs and at > T["s1b"]:
            for j, n in enumerate(stabs[k % 32]):
                add(note(hz(n - 12), 0.35, "brass", 1.0), at, 0.14, (j - 1) * 0.5)
        k += 1
    # pukulan misi di permulaan
    add(timpani(hz(29), 2.0, 1.2), T["s1a"], 0.8)

    # Kebajikan (20.4 -> 24.4): hangat, F major, petikan lembut
    prog = [(53, [65, 69, 72]), (50, [62, 65, 69]), (46, [62, 65, 70]), (48, [64, 67, 72])]
    for c, (root, notes) in enumerate(prog):
        at = T["s5"] + c * 1.0
        add(note(hz(root - 12), 1.1, "pad"), at, 0.35)
        for j, n in enumerate(notes):
            add(note(hz(n), 1.1, "pad"), at, 0.08, (j - 1) * 0.5)
            add(pluck(hz(n + 12)), at + j * 0.16, 0.18, (j - 1) * 0.6)

    # Pejabat (24.4 -> 26.6): rehat, kord besar lembut
    for j, n in enumerate((65, 69, 72, 77)):
        add(note(hz(n - 12), 2.3, "pad"), T["s6"] + 0.3, 0.1, (j % 3 - 1) * 0.5)
    add(note(hz(29), 2.3, "pad"), T["s6"] + 0.3, 0.3)
    return reverb(m, rt=1.6, wet=0.18, tone=5500)


# ================= Susunan =================
# Tajuk
put(whoosh(0.8, 200, 3000, 0.8), T["title"] + 0.0, 0.5)
put(stamp(), T["title"] + 0.6, 0.9)
put(impact(2.0, 44), T["title"] + 0.6, 0.45)
put(glint(), T["title"] + 1.2, 0.35)

# Syot 1: fail misi
put(whip(), T["s1a"] - 0.12, 0.5)
put(book_thud(), T["s1a"] + 0.25, 0.6)
put(riser(1.5), T["s1a"] + 0.2, 0.25)
put(book_thud(), T["s1b"] + 0.05, 0.7)
put(impact(1.8, 50), T["s1b"] + 0.05, 0.35)
for k in range(16):
    put(page_flip(), T["s1b"] + 0.15 + k * 0.12 * (1 + 0.012 * k), 0.45, rng.uniform(-0.4, 0.4))

# Syot 2: rondaan perhimpunan
put(whip(), T["s2"] - 0.12, 0.5)
put(crowd(5.0, 0.3), T["s2"], 0.12)
put(whistle(0.25), T["s2"] + 0.2, 0.35, -0.3)
put(whistle(0.7), T["s2"] + 0.55, 0.4, -0.3)
for k in range(4):
    put(footstep(), T["s2"] + 0.4 + k * 0.5, 0.3, 0.3)
put(pen_scratch(0.7), T["s2"] + 2.2, 0.35, 0.2)
put(clip_tick(), T["s2"] + 2.95, 0.5)
put(clip_tick(), T["s2"] + 3.15, 0.4)
put(whip(0.25), T["s2"] + 3.35, 0.4)
put(boing(0.6, 160, 480), T["s2"] + 3.45, 0.55)
put(slide_whistle(0.35, 600, 1500), T["s2"] + 4.3, 0.3)

# Syot 3: operasi kantin
put(whip(), T["s3"] - 0.12, 0.5)
put(crowd(5.0, 0.5), T["s3"], 0.2)
put(cutlery(5.0), T["s3"], 0.6, 0.2)
put(whip(0.25), T["s3"] + 1.35, 0.45)
put(boing(0.7, 420, 140), T["s3"] + 1.45, 0.55)  # pelajar terkejut
put(whoosh(0.4, 600, 4000, 0.4), T["s3"] + 2.55, 0.4)
put(stamp(), T["s3"] + 2.75, 0.35)  # tunjuk tegas tapi mesra
put(slide_whistle(0.45, 1500, 450), T["s3"] + 3.9, 0.4)  # pelajar undur ke belakang
for k in range(5):
    put(footstep(), T["s3"] + 3.95 + k * 0.1, 0.3, 0.6 - k * 0.1)
put(comedy_sting(), T["s3"] + 4.4, 0.25)

# Syot 4: pemeriksaan
put(whip(), T["s4"] - 0.12, 0.5)
for k in range(5):
    put(reverb(footstep(dark=True), rt=0.9, wet=0.3), T["s4"] + 0.2 + k * 0.45, 0.55, (-1) ** k * 0.2)
put(bp(rng.standard_normal(int(1.2 * SR)), 2000, 8000) * 0.05, T["s4"] + 0.4, 1.0, -0.4)  # titisan air halus
put(pen_scratch(0.4), T["s4"] + 1.9, 0.3)
put(success_jingle(), T["s4"] + 2.45, 0.6)
put(glint(), T["s4"] + 2.5, 0.35)
put(stamp(), T["s4"] + 3.2, 0.6)

# Syot 5: kebajikan murid (lembut)
put(whoosh(0.6, 200, 1500), T["s5"] - 0.3, 0.3)
put(tape_rip(), T["s5"] + 1.2, 0.35)
put(pat(), T["s5"] + 2.0, 0.6)
put(pat(), T["s5"] + 2.25, 0.5)
put(glint(), T["s5"] + 2.8, 0.25)

# Syot 6: pejabat -> telefon
put(whip(), T["s6"] - 0.12, 0.4)
put(book_thud(), T["s6"] + 0.15, 0.6)  # fail ditutup
put(chair_creak(0.9), T["s6"] + 0.4, 0.4)
put(success_jingle(), T["s6"] + 0.6, 0.35)
for k, (a, d) in enumerate(((0.0, 0.42), (0.6, 0.42), (1.6, 0.42), (2.2, 0.42))):
    put(phone_ring(d), T["ring"] + a, 1.5, 0.35)
put(impact(1.2, 60), T["ring"], 0.35)
put(whip(0.25), T["ring"] + 1.0, 0.35)
put(sad_trombone(), T["ring"] + 1.35, 0.35)

MIX += music()[:, : MIX.shape[1]] * 0.9

out = MIX[:, :N]
fade = int(0.35 * SR)
out[:, -fade:] *= np.linspace(1, 0, fade) ** 2
out = hp(out, 25)
out = np.tanh(out / np.abs(out).max() * 1.6) / np.tanh(1.6) * 0.89
with wave.open(os.path.join(OUT, "runut2.wav"), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((out.T * 32767).astype(np.int16).tobytes())
print("runut2.wav", out.shape[1] / SR, "s")
