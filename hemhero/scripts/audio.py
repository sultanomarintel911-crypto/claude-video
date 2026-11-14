#!/usr/bin/env python3
"""Jana runut bunyi penuh 30 s untuk THE HEM HERO -> public/sfx/runut.wav (48 kHz stereo).

Tiada dialog, suara manusia, narasi atau nyanyian: semua bunyi disintesis
(loceng, tapak kaki, suasana, wisel, kerusi, whoosh, hentakan, muzik instrumental).
Masa mesti selari dengan src/data.ts.
"""
import os
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
DUR = 30.0
N = int(DUR * SR)
OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "sfx"))
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)

# ---- Garis masa (saat) : mesti sama dengan src/data.ts ----
T = dict(s1=0.0, s2=3.2, s3a=7.6, s3b=10.4, s4a=13.0, s4b=15.4, s5=17.6, s6a=22.6, s6b=23.6, end=27.4)


def tt(d):
    return np.arange(int(d * SR)) / SR


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x, axis=-1)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x, axis=-1)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x, axis=-1)


def st(x, p=0.0):
    """mono -> stereo dengan pan p (-1..1)."""
    if x.ndim == 2:
        return x
    l, r = np.cos((p + 1) * np.pi / 4), np.sin((p + 1) * np.pi / 4)
    return np.vstack([x * l, x * r]) * 1.414


def reverb(x, rt=1.6, wet=0.3, tone=6000):
    x = st(x)
    n = int(rt * SR)
    ir = rng.standard_normal((2, n)) * np.exp(-np.arange(n) / SR * 6.9 / rt)
    ir = lp(ir, tone)
    ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
    y = np.stack([fftconvolve(x[i], ir[i]) for i in range(2)])
    out = y * wet * 2.5
    out[:, : x.shape[1]] += x * (1 - wet)
    return out


MIX = np.zeros((2, N + SR * 4))


def put(x, at, gain=1.0, p=0.0):
    x = st(x, p)
    i = int(at * SR)
    if i >= MIX.shape[1]:
        return
    m = min(x.shape[1], MIX.shape[1] - i)
    MIX[:, i : i + m] += x[:, :m] * gain


def env(d, a=0.005, k=5.0):
    t = tt(d)
    return np.minimum(t / a, 1) * np.exp(-t * k)


# ---------------- SFX ----------------
def bell_strike(f0=620.0, d=2.5):
    t = tt(d)
    partials = [(0.5, 0.5, 1.2), (1.0, 1.0, 1.6), (1.19, 0.6, 2.2), (1.5, 0.45, 2.6),
                (2.0, 0.55, 3.0), (2.51, 0.3, 4.0), (2.66, 0.25, 4.5), (3.01, 0.2, 5.5), (4.1, 0.12, 7.0)]
    x = np.zeros_like(t)
    for ratio, amp, k in partials:
        det = 1 + rng.uniform(-0.002, 0.002)
        x += amp * np.sin(2 * np.pi * f0 * ratio * det * t + rng.uniform(0, 6)) * np.exp(-t * k)
    clank = hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 60) * 0.6
    return (x + clank) * np.minimum(t / 0.002, 1)


def footstep(dark=False):
    d = 0.18
    t = tt(d)
    n = rng.standard_normal(len(t))
    if dark:
        thump = np.sin(2 * np.pi * (55 + 40 * np.exp(-t * 30)) * t) * np.exp(-t * 18)
        click = bp(n, 300, 2500) * np.exp(-t * 70) * 0.35
        return thump * 1.2 + click
    return bp(n, 400, 4000) * np.exp(-t * 45) + bp(n, 80, 300) * np.exp(-t * 30) * 0.6


def crowd(d, density=1.0):
    """Suasana riuh (bukan pertuturan): bunyi bising berbentuk-formant yang dimodulasi, dentingan, tapak kaki."""
    t = tt(d)
    base = rng.standard_normal((2, len(t)))
    x = np.zeros((2, len(t)))
    for lo, hi, g in ((250, 700, 1.0), (900, 1800, 0.7), (2200, 3600, 0.35)):
        x += bp(base, lo, hi) * g
    mod = lp(np.abs(rng.standard_normal((2, len(t)))), 5) * 3
    x *= 0.4 + mod
    x = lp(x, 3000)
    # langkah lari rawak
    for _ in range(int(14 * d * density)):
        put_local = int(rng.uniform(0, d - 0.2) * SR)
        s = st(footstep(), rng.uniform(-0.8, 0.8)) * rng.uniform(0.25, 0.6)
        x[:, put_local : put_local + s.shape[1]] += s[:, : len(t) - put_local]
    return x


def whistle(d=0.9):
    t = tt(d)
    trill = 1 + 0.5 * (np.sin(2 * np.pi * 28 * t) > 0)
    f = 2900 + 60 * np.sin(2 * np.pi * 28 * t)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.6 + 0.4 * trill / 1.5)
    x += hp(rng.standard_normal(len(t)), 2000) * 0.08
    e = np.minimum(t / 0.02, 1) * np.minimum((d - t) / 0.05, 1)
    return x * e


def whoosh(d=0.8, f0=300, f1=4000, peak=0.6):
    t = tt(d)
    n = rng.standard_normal((2, len(t)))
    fc = f0 + (f1 - f0) * (t / d)
    # penapis lulus-jalur bergerak (blok)
    y = np.zeros_like(n)
    blk = 1024
    for i in range(0, len(t), blk):
        c = fc[i]
        y[:, i : i + blk] = bp(n[:, max(0, i - 4096) : i + blk], c * 0.6, min(c * 1.6, 20000))[:, -min(blk, len(t) - i):]
    e = np.exp(-((t - d * peak) ** 2) / (2 * (d * 0.22) ** 2))
    return y * e


def whip(d=0.35):
    return whoosh(d, 800, 7000, 0.55) * 1.4


def impact(d=2.5, sub=48):
    t = tt(d)
    boom = np.sin(2 * np.pi * np.cumsum(sub + 60 * np.exp(-t * 12)) / SR) * np.exp(-t * 2.2)
    crack = lp(rng.standard_normal(len(t)), 5000) * np.exp(-t * 14) * 0.7
    return reverb(boom * 1.3 + crack, rt=2.2, wet=0.35, tone=3000)


def riser(d=2.0):
    t = tt(d)
    n = rng.standard_normal((2, len(t)))
    y = whoosh(d, 200, 9000, 0.98)
    tone = np.sin(2 * np.pi * np.cumsum(110 * 2 ** (2.5 * t / d)) / SR) * (t / d) ** 2 * 0.25
    return y * (t / d) ** 1.5 * 1.5 + st(tone) + hp(n, 6000) * (t / d) ** 3 * 0.15


def chair_creak(d=0.7):
    t = tt(d)
    f = 520 + 180 * np.sin(2 * np.pi * 1.6 * t)
    pulses = (np.sin(2 * np.pi * 34 * t) > 0.6).astype(float)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * pulses
    x = bp(x + 0.3 * rng.standard_normal(len(t)) * pulses, 300, 2500)
    roll = bp(rng.standard_normal(len(t)), 100, 600) * 0.4
    return (x * 0.6 + roll) * np.sin(np.pi * t / d)


def clock_tick():
    t = tt(0.04)
    return hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 200)


def glint(d=0.9):
    t = tt(d)
    x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, k in ((2637, 5), (3951, 7), (5274, 9), (7040, 12)))
    return reverb(x * 0.3, rt=1.5, wet=0.4, tone=12000)


def comedy_sting():
    """'Boop-boop-DING': dua nada naik ala kartun kelakar + loceng kecil."""
    out = np.zeros(int(1.6 * SR))
    for k, (f, at) in enumerate(((523.25, 0.0), (659.25, 0.12), (783.99, 0.24))):
        t = tt(0.14)
        tone = (np.sign(np.sin(2 * np.pi * f * t)) * 0.3 + np.sin(2 * np.pi * f * t)) * np.exp(-t * 18)
        i = int(at * SR)
        out[i : i + len(t)] += lp(tone, 4000) * 0.6
    t = tt(1.2)
    ding = sum(np.sin(2 * np.pi * 1568 * r * t) * a * np.exp(-t * k) for r, a, k in ((1, 1, 3), (2.76, 0.4, 6), (5.4, 0.2, 10)))
    i = int(0.38 * SR)
    out[i : i + len(t)] += ding * 0.8
    return reverb(out, rt=1.0, wet=0.2)


def slide_whistle(d=0.35, f0=500, f1=1400):
    t = tt(d)
    f = f0 * (f1 / f0) ** (t / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * 0.6


# ---------------- Muzik ----------------
def note(f, d, kind="brass", vel=1.0):
    t = tt(d)
    if kind == "brass":
        x = sum(np.sin(2 * np.pi * f * h * t + 0.3 * h) / h ** 1.1 for h in range(1, 12))
        x += 0.5 * sum(np.sin(2 * np.pi * f * 1.004 * h * t) / h ** 1.1 for h in range(1, 12))
        e = np.minimum(t / 0.09, 1) * np.minimum((d - t) / 0.12, 1).clip(0, 1)
        x = lp(x * e, 2200 * vel + 600)
    elif kind == "string":
        x = sum(np.sin(2 * np.pi * f * h * t) / h for h in range(1, 9))
        e = np.minimum(t / 0.008, 1) * np.exp(-t * 9)
        x = lp(x * e, 3500)
    elif kind == "pad":
        x = sum(np.sin(2 * np.pi * f * dt * t) for dt in (0.997, 1.0, 1.003)) / 3
        x += 0.3 * np.sin(2 * np.pi * f * 2 * t)
        e = np.minimum(t / 0.8, 1) * np.minimum((d - t) / 0.6, 1).clip(0, 1)
        x = x * e
    elif kind == "bass":
        x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2 * t)
        e = np.minimum(t / 0.01, 1) * np.exp(-t * 4)
        x = x * e
    return x * vel


def timpani(f=73.4, d=1.6, vel=1.0):
    t = tt(d)
    x = np.sin(2 * np.pi * f * (1 + 0.08 * np.exp(-t * 20)) * t) * np.exp(-t * 3)
    x += lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 25) * 0.5
    return x * vel


def hz(n):
    return 440 * 2 ** ((n - 69) / 12)


D2, D3, F3, A3, D4, F4, A4, D5 = 38, 50, 53, 57, 62, 65, 69, 74
CHORDS = {  # akar (MIDI), not kord
    "Dm": (38, [62, 65, 69]), "Bb": (34, [58, 62, 65]), "C": (36, [60, 64, 67]),
    "Gm": (43, [62, 67, 70]), "A": (45, [61, 64, 69]), "D": (38, [62, 66, 69]),
}
BPM = 120
BEAT = 60 / BPM


def music():
    m = np.zeros((2, N + SR * 4))

    def add(x, at, g=1.0, p=0.0):
        x = st(x, p)
        i = int(at * SR)
        k = min(x.shape[1], m.shape[1] - i)
        m[:, i : i + k] += x[:, :k] * g

    # Babak 3: dengung rendah tegang (pejabat)
    add(note(hz(D2), 5.6, "pad") * 0.5, T["s3a"], 0.5)
    add(note(hz(A3), 2.6, "pad") * 0.3, T["s3b"], 0.4)

    # Babak 4b -> 6a: ostinato rentetan + brass wira
    start = T["s4b"]
    prog = ["Dm", "Dm", "Bb", "C", "Dm", "Bb", "Gm", "A", "Dm", "Bb", "C", "D"]
    bar = BEAT * 2  # setiap kord = 2 rentak (1 s)
    endm = T["s6a"]
    i = 0
    tcur = start
    while tcur < endm - 0.01:
        ch = prog[i % len(prog)]
        root, notes = CHORDS[ch]
        dur = min(bar, endm - tcur)
        # ostinato 1/8
        for k in range(int(dur / (BEAT / 2) + 0.5)):
            pitch = root + 12 if k % 2 == 0 else root + 24
            add(note(hz(pitch), BEAT / 2, "string", 0.8), tcur + k * BEAT / 2, 0.35, -0.3)
        add(note(hz(root), dur, "bass"), tcur, 0.55)
        for j, n in enumerate(notes):
            add(note(hz(n - 12), dur * 1.02, "brass", 0.9), tcur, 0.16, (j - 1) * 0.5)
        if i % 2 == 0:
            add(timpani(hz(root - 12 if root > 40 else root)), tcur, 0.7)
        tcur += bar
        i += 1

    # Babak 6a: muzik tergantung (kekecohan semula)
    # Babak 6b: tema wira semula selepas 'ding', lebih ringan
    t2 = T["s6b"] + 0.6
    prog2 = ["Bb", "C", "Dm", "Bb", "C"]
    for k, ch in enumerate(prog2):
        root, notes = CHORDS[ch]
        at = t2 + k * bar
        for j, n in enumerate(notes):
            add(note(hz(n), bar, "brass", 0.8), at, 0.12, (j - 1) * 0.5)
        add(note(hz(root), bar, "bass"), at, 0.45)
        for q in range(4):
            add(note(hz(root + 24), BEAT / 2, "string", 0.7), at + q * BEAT / 2, 0.25, 0.3)
    # Penutup: kord D major besar
    root, notes = CHORDS["D"]
    for j, n in enumerate(notes + [n + 12 for n in notes]):
        add(note(hz(n - 12), 2.6, "brass", 1.0), T["end"], 0.12, (j % 3 - 1) * 0.6)
    add(note(hz(26), 2.6, "pad"), T["end"], 0.6)
    add(timpani(hz(38), 2.5, 1.2), T["end"], 0.9)
    return reverb(m, rt=2.0, wet=0.22, tone=5000)


if __name__ == "__main__":
    # ================= Susunan =================
    # Babak 1: loceng
    for k in range(7):
        put(reverb(bell_strike(640 + rng.uniform(-4, 4)), rt=1.8, wet=0.25), T["s1"] + 0.15 + k * 0.42, 0.55 if k else 0.7, 0.1)
    put(crowd(4.0, 0.6), T["s1"] + 1.4, 0.12)

    # Babak 2: kekecohan
    put(whip(), T["s2"] - 0.15, 0.6)
    put(crowd(4.6, 1.4), T["s2"], 0.32)
    for k in range(18):
        put(footstep(), T["s2"] + k * 0.22 + rng.uniform(0, 0.05), 0.45, np.sin(k) * 0.7)
    put(whistle(0.35), T["s2"] + 2.3, 0.35, 0.4)
    put(whistle(0.8), T["s2"] + 2.75, 0.4, 0.4)
    put(whip(), T["s3a"] - 0.18, 0.5)

    # Babak 3a: pejabat sunyi
    for k in range(6):
        put(clock_tick(), T["s3a"] + 0.25 + k * 0.5, 0.25, -0.5)
    put(crowd(2.8, 0.3), T["s3a"], 0.03)  # riuh jauh di luar
    put(chair_creak(0.8), T["s3a"] + 1.4, 0.35, 0.2)

    # Babak 3b: cermin mata
    put(whoosh(0.6, 200, 1500), T["s3b"] - 0.3, 0.35)
    put(glint(), T["s3b"] + 1.35, 0.6, 0.3)
    put(impact(2.0, 40), T["s3b"] + 1.4, 0.45)

    # Babak 4: transformasi
    put(chair_creak(0.6), T["s4a"] + 0.05, 0.4, -0.2)
    put(whoosh(1.1, 150, 5000, 0.7), T["s4a"] + 0.2, 0.75)
    put(riser(2.2), T["s4a"] + 0.2, 0.45)
    put(impact(3.0, 44), T["s4b"], 0.8)
    put(whoosh(0.9, 300, 6000, 0.5), T["s4b"] + 0.05, 0.4)

    # Babak 5: tapak kaki dalam (gerak perlahan)
    put(whip(), T["s5"] - 0.15, 0.35)
    for k in range(6):
        put(reverb(footstep(dark=True), rt=1.4, wet=0.35, tone=2500), T["s5"] + 0.25 + k * 0.8, 0.9, (-1) ** k * 0.15)

    # Babak 6: kekecohan sekejap -> barisan tersusun (lawak)
    put(whip(), T["s6a"] - 0.12, 0.6)
    put(crowd(1.0, 2.0), T["s6a"], 0.4)
    put(footstep(dark=True), T["s6a"] + 0.25, 1.0)
    put(slide_whistle(0.3, 1400, 400), T["s6b"] - 0.32, 0.35)
    put(comedy_sting(), T["s6b"], 0.55)
    for k in range(10):  # kasut berhenti serentak
        put(footstep(), T["s6b"] + 0.02 + rng.uniform(0, 0.06), 0.25, rng.uniform(-0.9, 0.9))
    put(glint(), T["s6b"] + 2.4, 0.5, 0.2)

    # Penutup
    put(impact(3.0, 40), T["end"], 0.7)
    put(glint(), T["end"] + 0.9, 0.45)

    MIX += music()[:, : MIX.shape[1]] * 0.9

    # Duck semua di hujung, potong 30 s
    out = MIX[:, :N]
    fade = int(0.6 * SR)
    out[:, -fade:] *= np.linspace(1, 0, fade) ** 2
    out = hp(out, 25)
    peak = np.abs(out).max()
    out = np.tanh(out / peak * 1.6) / np.tanh(1.6) * 0.89
    pcm = (out.T * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, "runut.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("runut.wav", out.shape[1] / SR, "s")
