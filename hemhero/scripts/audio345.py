#!/usr/bin/env python3
"""Runut bunyi babak 3, 4, 5 -> public/sfx/runut3.wav, runut4.wav, runut5.wav (48 kHz stereo).

Tiada dialog, suara manusia, narasi atau nyanyian. Babak 5: kesan bunyi SAHAJA (tiada muzik).
Masa mesti selari dengan src/Scene345.tsx.
"""
import os
import sys
import wave

import numpy as np

from audio import SR, bp, footstep, hp, hz, impact, lp, note, reverb, riser, rng, st, timpani, tt, whoosh, crowd, glint

OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "sfx"))
DUR = 30.0
N = int(DUR * SR)

T3 = dict(s1=0.0, s2=6.0, s3=12.0, s3b=13.8, s4=15.5, s5=20.5, s6=25.5, fade=28.8)
T4 = dict(s1=0.0, s2=5.0, s2b=7.3, s3=9.5, s4=13.5, tr=18.0, s5=18.6, card=23.0, fade=29.0)
T5 = dict(p1=0.0, p2=3.5, p3=6.5, p4=9.5, p5=12.5, walk=15.0, p6=18.0, p7=21.0, p8=23.5, p9=26.0, fade=29.2)


class Mix:
    def __init__(self):
        self.m = np.zeros((2, N + SR * 6))

    def put(self, x, at, gain=1.0, p=0.0):
        x = st(x, p)
        i = int(at * SR)
        k = min(x.shape[1], self.m.shape[1] - i)
        if k > 0:
            self.m[:, i : i + k] += x[:, :k] * gain

    def save(self, name, fade_from=None, drive=1.4):
        out = self.m[:, :N].copy()
        if fade_from is not None:
            a, b = int(fade_from * SR), N
            out[:, a:b] *= np.linspace(1, 0, b - a) ** 1.5
        out = hp(out, 25)
        out = np.tanh(out / (np.abs(out).max() + 1e-9) * drive) / np.tanh(drive) * 0.89
        with wave.open(os.path.join(OUT, name), "wb") as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes((out.T * 32767).astype(np.int16).tobytes())
        print(name, out.shape[1] / SR, "s")


# ---------------- Instrumen ----------------
def piano(f, d=2.5, vel=0.8):
    t = tt(d)
    x = np.zeros_like(t)
    B = 0.0004
    for h in range(1, 10):
        fh = f * h * np.sqrt(1 + B * h * h)
        if fh > 16000:
            break
        x += np.sin(2 * np.pi * fh * t) * (1 / h ** 1.4) * np.exp(-t * (0.9 + 0.5 * h) * (f / 440) ** 0.3)
    hammer = lp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 80) * 0.05
    e = np.minimum(t / 0.004, 1)
    return (x + hammer) * e * vel


def strings(f, d, vel=0.5, att=0.8):
    t = tt(d)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.2 * t + rng.uniform(0, 6))
    x = np.zeros_like(t)
    for det in (0.995, 1.0, 1.005):
        ph = 2 * np.pi * np.cumsum(f * det * vib) / SR
        x += sum(np.sin(h * ph) / h for h in range(1, 10))
    x = lp(x, 2200)
    e = np.minimum(t / att, 1) * np.minimum((d - t) / 0.8, 1).clip(0, 1)
    return x * e * vel / 3


def chord_notes(root, kind="maj"):
    third = 4 if kind == "maj" else 3
    return [root, root + third, root + 7]


# ---------------- SFX ----------------
def wind(d, strength=1.0):
    t = tt(d)
    n = rng.standard_normal((2, len(t)))
    mod = lp(np.abs(rng.standard_normal((2, len(t)))), 0.6) * 4
    x = bp(n, 150, 1200) * (0.3 + mod) + hp(n, 3000) * 0.05 * mod
    e = np.minimum(t / 1.0, 1) * np.minimum((d - t) / 1.0, 1).clip(0, 1)
    return x * e * strength


def birds(d, count=6):
    x = np.zeros(int(d * SR))
    for _ in range(count):
        at = rng.uniform(0, d - 0.6)
        base = rng.uniform(2800, 4500)
        for k in range(rng.integers(2, 5)):
            t = tt(0.07)
            f = base + 900 * np.sin(np.pi * t / 0.07) * rng.uniform(0.5, 1.2)
            chirp = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.07)
            i = int((at + k * 0.11) * SR)
            x[i : i + len(t)] += chirp * 0.25
    return reverb(x, rt=1.2, wet=0.35)


def applause(d, density=60, gain=1.0):
    t = tt(d)
    x = np.zeros((2, len(t)))
    for _ in range(int(d * density)):
        i = int(rng.uniform(0, d - 0.05) * SR)
        c = tt(0.03)
        clap = bp(rng.standard_normal(len(c)), rng.uniform(900, 1600), rng.uniform(2500, 5000)) * np.exp(-c * 140)
        p = rng.uniform(-1, 1)
        x[:, i : i + len(c)] += st(clap * rng.uniform(0.3, 1.0), p)
    e = np.minimum(t / 0.3, 1) * np.minimum((d - t) / 1.2, 1).clip(0, 1)
    return reverb(x * e, rt=1.0, wet=0.25) * gain


def rustle(d=0.5):
    t = tt(d)
    n = rng.standard_normal(len(t))
    return bp(n, 600, 5000) * lp(np.abs(rng.standard_normal(len(t))), 12) * 3 * np.sin(np.pi * t / d)


def handshake():
    t = tt(0.25)
    return lp(rng.standard_normal(len(t)), 1500) * np.exp(-t * 30) * 0.8 + rustle(0.3)[: len(t)] * 0.5


def paper(d=0.4):
    t = tt(d)
    n = rng.standard_normal(len(t))
    crinkle = (rng.random(len(t)) > 0.85).astype(float)
    return (bp(n, 1500, 8000) * crinkle * 1.5 + bp(n, 400, 2000) * 0.3) * np.sin(np.pi * t / d)


def heartbeat_soft():
    x = np.zeros(int(1.0 * SR))
    for at in (0.0, 0.28):
        t = tt(0.2)
        i = int(at * SR)
        x[i : i + len(t)] += np.sin(2 * np.pi * 50 * t) * np.exp(-t * 25)
    return x


def shimmer(d=2.5):
    t = tt(d)
    x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in ((2093, 1.5), (2637, 1.8), (3136, 2.0), (4186, 2.5)))
    return reverb(x * 0.15 * np.minimum(t / 0.3, 1), rt=2.5, wet=0.5, tone=10000)


def suitcase_roll(d):
    t = tt(d)
    n = rng.standard_normal(len(t))
    roll = bp(n, 150, 900) * 0.6 + bp(n, 2000, 5000) * 0.08
    clicks = np.zeros_like(t)
    for k in np.arange(0.2, d, 0.55):
        i = int(k * SR)
        c = tt(0.04)
        clicks[i : i + len(c)] += hp(rng.standard_normal(len(c)), 800) * np.exp(-c * 100)
    e = np.minimum(t / 0.2, 1) * np.minimum((d - t) / 0.3, 1).clip(0, 1)
    return (roll + clicks * 0.8) * e


def door_close():
    t = tt(1.2)
    thunk = np.sin(2 * np.pi * (70 + 50 * np.exp(-t * 30)) * t) * np.exp(-t * 10)
    latch = hp(rng.standard_normal(len(t)), 1500) * np.exp(-(t - 0.12).clip(0) * 60) * (t > 0.12) * 0.6
    seal = bp(rng.standard_normal(len(t)), 200, 1500) * np.exp(-t * 6) * 0.3
    return reverb(thunk * 1.2 + latch + seal, rt=0.9, wet=0.2)


def jet(d, rise=True):
    """Enjin jet: dengung kipas + gemuruh, meningkat (berlepas) kemudian menjauh."""
    t = tt(d)
    if rise:
        level = np.clip(t / (d * 0.55), 0, 1) ** 1.3
        level = level * np.clip((d - t) / (d * 0.4), 0, 1) ** 0.8 + (t < d * 0.55) * 0  # naik lalu menjauh
    else:
        level = np.ones_like(t) * 0.3
    whine_f = 900 + 2600 * np.clip(t / (d * 0.5), 0, 1)
    whine = np.sin(2 * np.pi * np.cumsum(whine_f) / SR) * 0.12 + np.sin(2 * np.pi * np.cumsum(whine_f * 1.5) / SR) * 0.06
    n = rng.standard_normal((2, len(t)))
    roar = lp(n, 500) * 1.2 + bp(n, 500, 3000) * 0.4
    doppler_lp = 6000 - 4500 * np.clip((t - d * 0.6) / (d * 0.4), 0, 1)
    x = roar + st(whine)
    x = lp(x, float(doppler_lp.mean()))
    return x * level


def airport_amb(d):
    t = tt(d)
    n = rng.standard_normal((2, len(t)))
    hum = lp(n, 250) * 0.6
    dist = np.sin(2 * np.pi * np.cumsum(1400 + 30 * np.sin(2 * np.pi * 0.1 * t)) / SR) * 0.015
    e = np.minimum(t / 0.6, 1) * np.minimum((d - t) / 0.6, 1).clip(0, 1)
    return (hum + st(dist)) * e


def soft_whoosh(at_mix, at):
    at_mix.put(whoosh(1.0, 150, 2500, 0.6), at - 0.5, 0.25)


# ================= BABAK 3: BEHIND THE SMILE =================
def scene3():
    M = Mix()
    # Muzik: piano arpeggio + rentetan, C major, 2.5 s setiap kord
    prog = [(48, "maj"), (43, "maj"), (45, "min"), (41, "maj"),
            (48, "maj"), (43, "maj"), (45, "min"), (41, "maj"),
            (41, "maj"), (43, "maj"), (48, "maj"), (48, "maj")]
    for c, (root, kind) in enumerate(prog):
        at = c * 2.5
        tones = chord_notes(root + 12, kind)
        patt = [tones[0], tones[1], tones[2], tones[0] + 12, tones[2], tones[1] + 12, tones[2], tones[0] + 12]
        build = min(1.0, 0.45 + c * 0.06)
        for k, n in enumerate(patt):
            M.put(piano(hz(n + 12), 2.4, 0.22 * build), at + k * 0.3125, 1.0, (k % 3 - 1) * 0.35)
        M.put(piano(hz(root), 3.0, 0.32 * build), at, 1.0)
        if at >= T3["s2"] - 0.1:
            sv = 0.35 + 0.65 * min(1, (at - 6) / 18)
            for j, n in enumerate(tones):
                M.put(strings(hz(n), 2.7, 0.18 * sv), at, 1.0, (j - 1) * 0.6)
            M.put(strings(hz(root), 2.7, 0.22 * sv), at, 1.0)
        if at >= 20:
            M.put(strings(hz(tones[2] + 12), 2.7, 0.10), at, 1.0, 0.3)  # melodi tinggi
    # Kemuncak
    M.put(timpani(hz(36), 3.0, 0.8), T3["s6"], 0.55)
    M.put(shimmer(4.0), T3["s6"], 0.8)
    for j, n in enumerate((60, 64, 67, 72, 76)):
        M.put(strings(hz(n), 4.5, 0.16, att=0.3), T3["s6"], 1.0, (j % 3 - 1) * 0.5)
    m = M.m
    M.m = reverb(m, rt=2.4, wet=0.28, tone=6000)[:, : m.shape[1]]

    # SFX
    M.put(wind(6.5, 0.5), 0.0, 0.3)
    M.put(crowd(6.0, 0.2), 0.0, 0.03)
    for k in range(7):
        M.put(reverb(footstep(dark=True), rt=1.8, wet=0.45, tone=2500), 0.6 + k * 0.78, 0.35, (-1) ** k * 0.1)
    for at in (T3["s2"], 7.5, 9.0, 10.5, T3["s3"]):
        M.put(whoosh(0.9, 200, 3000, 0.55), at - 0.45, 0.28)
        M.put(shimmer(1.2), at, 0.25)
    M.put(crowd(6.0, 0.4), T3["s2"], 0.06)  # aktiviti sekolah, jauh
    M.put(applause(1.4, 30, 0.15), 10.5, 1.0)  # sukan
    M.put(paper(0.5), 12.6, 0.18)
    M.put(paper(0.4), 14.3, 0.15)
    M.put(wind(5.5, 0.4), T3["s4"], 0.18)
    M.put(paper(0.6), 17.0, 0.35, 0.1)
    M.put(paper(0.5), 18.6, 0.25, 0.1)
    M.put(paper(0.6), 21.0, 0.25)  # kad dibuka
    M.put(heartbeat_soft(), 22.6, 0.2)
    M.put(wind(5.0, 0.5), T3["s6"], 0.2)
    M.save("runut3.wav", fade_from=T3["fade"])


# ================= BABAK 4: THE NEXT CHAPTER =================
def scene4():
    M = Mix()
    # Muzik: D major. Kord 2.5 s: D, A/C#, Bm, G ... binaan ke 23.0
    prog = [(50, "maj"), (45, "maj"), (47, "min"), (43, "maj"),
            (50, "maj"), (45, "maj"), (47, "min"), (43, "maj")]
    for c, (root, kind) in enumerate(prog):
        at = c * 2.25
        if at >= T4["tr"]:
            break
        tones = chord_notes(root + 12, kind)
        build = min(1.0, 0.5 + c * 0.07)
        for k, n in enumerate([tones[0], tones[2], tones[1] + 12, tones[2]]):
            M.put(piano(hz(n + 12), 2.2, 0.24 * build), at + k * 0.5625, 1.0, (k % 3 - 1) * 0.35)
        M.put(piano(hz(root), 2.6, 0.3 * build), at, 1.0)
        if at >= T4["s2"] - 0.5:
            for j, n in enumerate(tones):
                M.put(strings(hz(n), 2.5, 0.2 * build), at, 1.0, (j - 1) * 0.6)
            M.put(strings(hz(root - 12), 2.5, 0.25 * build), at, 1.0)
    # Peralihan ke SK Batu 48
    M.put(riser(1.4), T4["tr"] - 0.8, 0.35)
    # Bahagian baharu: lebih terang & berharap (brass lembut + rentetan)
    for c, (root, kind) in enumerate([(50, "maj"), (55, "maj"), (52, "min"), (57, "maj")]):
        at = T4["s5"] + c * 1.1
        tones = chord_notes(root + 12, kind)
        for j, n in enumerate(tones):
            M.put(strings(hz(n), 1.4, 0.22, att=0.2), at, 1.0, (j - 1) * 0.6)
            M.put(note(hz(n - 12), 1.3, "brass", 0.8), at, 0.06, (j - 1) * 0.5)
        M.put(timpani(hz(root - 24), 1.2, 0.6), at, 0.35)
        for k in range(4):
            M.put(piano(hz(tones[k % 3] + 12), 1.2, 0.2), at + k * 0.275, 1.0)
    # Kad penghargaan: hentakan dalam + kord D major panjang
    M.put(impact(3.5, 38), T4["card"], 0.3)
    M.put(timpani(hz(26), 4.0, 1.2), T4["card"], 0.3)
    for j, n in enumerate((50, 57, 62, 66, 69, 74)):
        M.put(strings(hz(n), 7.0, 0.17, att=0.4), T4["card"], 1.0, (j % 3 - 1) * 0.6)
    M.put(note(hz(38), 7.0, "pad"), T4["card"], 0.4)
    M.put(shimmer(5.0), T4["card"] + 0.2, 0.9)
    for k, n in enumerate((74, 78, 81, 86)):
        M.put(piano(hz(n), 3.0, 0.2), T4["card"] + 1.0 + k * 0.6, 1.0, (k - 1.5) * 0.3)
    m = M.m
    M.m = reverb(m, rt=2.2, wet=0.25, tone=6000)[:, : m.shape[1]]

    # SFX
    M.put(crowd(5.0, 0.2), 0.0, 0.05)
    M.put(applause(5.0, 70, 1.0), 0.2, 0.35)
    M.put(applause(4.5, 35, 1.0), T4["s2"], 0.18)
    M.put(rustle(0.4), T4["s2b"] - 0.15, 0.25)
    M.put(handshake(), T4["s2b"], 0.45)
    M.put(rustle(0.5), T4["s3"] + 0.6, 0.2)
    M.put(wind(5.0, 0.4), T4["s3"], 0.12)
    M.put(wind(5.5, 0.7), T4["s4"], 0.25)
    M.put(applause(4.0, 25, 1.0), T4["s4"], 0.12)
    for k in range(6):
        M.put(reverb(footstep(dark=True), rt=1.2, wet=0.35, tone=2500), T4["s4"] + 0.4 + k * 0.7, 0.3, 0.1)
    M.put(whoosh(1.2, 200, 5000, 0.6), T4["tr"] - 0.55, 0.4)
    M.put(birds(4.0, 4), T4["s5"], 0.2)
    M.put(wind(4.4, 0.4), T4["s5"], 0.12)
    for k in range(4):
        M.put(footstep(), T4["s5"] + 0.6 + k * 0.65, 0.15)
    M.save("runut4.wav", fade_from=T4["fade"], drive=2.0)


# ================= BABAK 5: THE FINAL FAREWELL (SFX sahaja) =================
def scene5():
    M = Mix()
    # pagi di pintu masuk
    M.put(wind(9.5, 0.8), 0.0, 0.22)
    M.put(birds(9.0, 8), 0.0, 0.35)
    M.put(crowd(9.5, 0.15), 0.0, 0.04)
    M.put(footstep(), 0.5, 0.12)
    M.put(footstep(), 1.1, 0.12)
    M.put(rustle(0.6), T5["p3"] + 0.7, 0.35)  # tangan diangkat
    M.put(rustle(0.5), T5["p3"] + 1.8, 0.25)
    # murid melambai, tepukan perlahan
    M.put(applause(3.5, 22, 1.0), T5["p4"], 0.25)
    M.put(crowd(6.0, 0.3), T5["p4"], 0.06)
    M.put(rustle(0.6), T5["p5"] + 0.3, 0.3)
    M.put(wind(6.0, 0.6), T5["p4"], 0.3)
    # berjalan pergi: langkah berat
    M.put(wind(4.0, 0.9), T5["walk"], 0.35)
    for k in range(4):
        M.put(reverb(footstep(dark=True), rt=1.4, wet=0.3, tone=2200), T5["walk"] + 0.3 + k * 0.75, 0.6, (-1) ** k * 0.1)
    # lapangan terbang
    M.put(airport_amb(12.0), T5["p6"], 0.5)
    M.put(jet(6.0, rise=False), T5["p6"], 0.12, -0.6)  # enjin jauh
    M.put(suitcase_roll(2.8), T5["p6"] + 0.1, 0.35)
    for k in range(4):
        M.put(footstep(dark=True), T5["p6"] + 0.3 + k * 0.7, 0.35)
    M.put(wind(3.0, 0.7), T5["p7"], 0.3)
    M.put(rustle(0.5), T5["p7"] + 0.2, 0.2)
    for k in range(4):  # menaiki tangga logam
        t = tt(0.25)
        clank = (np.sin(2 * np.pi * 330 * t) + 0.6 * np.sin(2 * np.pi * 870 * t)) * np.exp(-t * 25) * 0.4 + np.pad(footstep(), (0, len(t) - len(footstep())))[: len(t)] * 0.6
        M.put(reverb(clank, rt=0.8, wet=0.25), T5["p8"] + 0.3 + k * 0.45, 0.4)
    M.put(door_close(), T5["p8"] + 2.2, 0.7)
    # berlepas
    M.put(jet(4.5), T5["p9"] - 0.4, 2.6)
    M.put(wind(4.0, 0.6), T5["p9"], 0.25)
    M.save("runut5.wav", fade_from=T5["fade"], drive=1.2)


if __name__ == "__main__":
    which = sys.argv[1:] or ["3", "4", "5"]
    for w in which:
        {"3": scene3, "4": scene4, "5": scene5}[w]()
