#!/usr/bin/env python3
"""Jana kesan bunyi (SFX) sinematik berlapis -> public/sfx/*.wav (48 kHz stereo)."""
import os
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
OUT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "sfx"))
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(2026)


def tt(d):
    return np.arange(int(d * SR)) / SR


def noise(d, ch=2):
    return rng.standard_normal((ch, int(d * SR)))


def filt(x, kind, f):
    sos = butter(4, f, btype=kind, fs=SR, output="sos")
    return sosfilt(sos, x, axis=-1)


def env_exp(d, k):
    return np.exp(-tt(d) * k)


def fit(x, n):
    out = np.zeros((2, n))
    x = np.atleast_2d(x)
    if x.shape[0] == 1:
        x = np.vstack([x, x])
    m = min(n, x.shape[1])
    out[:, :m] = x[:, :m]
    return out


def reverb(x, rt=1.8, wet=0.3, tone=6000):
    ir = noise(rt) * env_exp(rt, 6.9 / rt)
    ir = filt(ir, "lowpass", tone)
    ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
    y = np.stack([fftconvolve(x[i], ir[i])[: x.shape[1] + ir.shape[1] - 1] for i in range(2)])
    dry = np.zeros_like(y)
    dry[:, : x.shape[1]] = x
    return dry * (1 - wet) + y * wet * 3


def sweep_sine(d, f0, f1, curve=4.0):
    t = tt(d)
    f = f1 + (f0 - f1) * np.exp(-t * curve)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def pan(x, p):  # p: -1..1 skalar atau tatasusunan
    l = np.cos((p + 1) * np.pi / 4)
    r = np.sin((p + 1) * np.pi / 4)
    mono = x if x.ndim == 1 else x.mean(axis=0)
    return np.vstack([mono * l, mono * r])


def save(name, x, peak=0.89):
    x = np.atleast_2d(x)
    if x.shape[0] == 1:
        x = np.vstack([x, x])
    fade = min(len(x[0]), int(0.01 * SR))
    x[:, -fade:] *= np.linspace(1, 0, fade)
    x = x / (np.abs(x).max() + 1e-9) * peak
    pcm = (x.T * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"{name:22s} {x.shape[1] / SR:5.2f}s")


def whoosh(d, f_lo=250, f_hi=4000, peak_at=0.55, p0=-0.8, p1=0.8):
    t = tt(d)
    n = noise(d, 1)[0]
    bands = np.geomspace(f_lo, f_hi, 14)
    pos = np.clip(t / d, 0, 1)
    center = np.where(pos < peak_at, pos / peak_at, 1 - (pos - peak_at) / (1 - peak_at))
    cidx = center * (len(bands) - 1)
    y = np.zeros_like(n)
    for i, f in enumerate(bands):
        b = filt(n, "bandpass", [f / 1.3, min(f * 1.3, SR / 2 - 100)])
        y += b * np.exp(-((cidx - i) / 1.6) ** 2)
    amp = np.where(pos < peak_at, (pos / peak_at) ** 2, ((1 - pos) / (1 - peak_at)) ** 1.5)
    return reverb(pan(y * amp, np.linspace(p0, p1, len(t))), rt=1.0, wet=0.2)


# 1. hentakan sinematik besar
d = 5.0
sub = sweep_sine(d, 120, 34, 3.2) * env_exp(d, 1.1)
thump = np.sin(2 * np.pi * 70 * tt(d)) * env_exp(d, 9)
crack = filt(noise(d, 1)[0], "bandpass", [900, 7000]) * env_exp(d, 38)
body = filt(noise(d, 1)[0], "lowpass", 400) * env_exp(d, 4)
x = fit(sub * 1.0 + thump * 0.7 + crack * 0.5 + body * 0.4, int(d * SR))
save("impact_besar.wav", reverb(x, rt=3.2, wet=0.35, tone=3500)[:, : int(6.5 * SR)])

# 2. hentakan lembut (untuk tajuk/teks besar)
d = 3.0
x = sweep_sine(d, 95, 45, 5) * env_exp(d, 2.6) + filt(noise(d, 1)[0], "bandpass", [600, 4000]) * env_exp(d, 50) * 0.35
save("impact_lembut.wav", reverb(fit(x, int(d * SR)), rt=2.2, wet=0.35, tone=4000), peak=0.8)

# 3-4. whoosh
save("whoosh_panjang.wav", whoosh(1.4))
save("whoosh_pendek.wav", whoosh(0.6, 600, 7000, 0.6, 0.7, -0.7), peak=0.75)
save("swish_teks.wav", whoosh(0.35, 1500, 9000, 0.4, -0.3, 0.3), peak=0.55)

# 5. riser (untuk kiraan detik) - berakhir mengejut
d = 4.0
t = tt(d)
nz = filt(noise(d, 1)[0], "highpass", 800)
lfo = 0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(2 + 14 * (t / d) ** 2) / SR)
tone = sum(np.sin(2 * np.pi * np.cumsum(f0 * (1 + 4 * (t / d) ** 2)) / SR) / k for k, f0 in enumerate((110, 220, 330.5), 1))
x = (nz * 0.5 + tone * 0.6) * (t / d) ** 2.2 * (0.6 + 0.4 * lfo)
x = fit(x, len(t))
x[0] *= 1 + 0.15 * np.sin(2 * np.pi * 0.7 * t)
save("riser.wav", reverb(x, rt=1.2, wet=0.25)[:, : len(t)])

# 6. cymbal terbalik
d = 2.5
cym = filt(noise(d), "highpass", 4000) * env_exp(d, 1.6) + filt(noise(d), "bandpass", [2500, 9000]) * env_exp(d, 3) * 0.5
save("cymbal_terbalik.wav", reverb(cym, rt=1.5, wet=0.3)[:, : int(d * SR)][:, ::-1], peak=0.7)

# 7. kilauan (shimmer)
d = 3.5
x = np.zeros((2, int(d * SR)))
for _ in range(26):
    f = rng.choice([1567.98, 2093.0, 2349.3, 2637.0, 3135.9, 4186.0])
    st = rng.uniform(0, 0.9)
    s = np.sin(2 * np.pi * f * tt(1.5)) * env_exp(1.5, rng.uniform(3, 6)) * rng.uniform(0.3, 1)
    i = int(st * SR)
    x[:, i:i + len(s)] += pan(s, rng.uniform(-0.9, 0.9))[:, : x.shape[1] - i]
save("kilauan.wav", reverb(x, rt=2.5, wet=0.45, tone=9000)[:, : int(d * SR)], peak=0.6)

# 8. degupan jantung
d = 1.1
hb = np.zeros(int(d * SR))
for st, a in ((0.0, 1.0), (0.26, 0.7)):
    s = sweep_sine(0.35, 95, 42, 14) * env_exp(0.35, 13) * a
    i = int(st * SR)
    hb[i:i + len(s)] += s
save("degupan.wav", reverb(fit(filt(hb, "lowpass", 300), len(hb)), rt=0.8, wet=0.15))

# 9. drumroll memuncak (3 s)
d = 3.0
x = np.zeros((2, int(d * SR)))
tr = 0.0
while tr < d - 0.02:
    p = tr / d
    hit = filt(noise(0.09, 1)[0], "bandpass", [1500, 8000]) * env_exp(0.09, 45) + np.sin(2 * np.pi * 190 * tt(0.09)) * env_exp(0.09, 40) * 0.5
    i = int(tr * SR)
    x[:, i:i + len(hit)] += pan(hit * (0.15 + 0.85 * p ** 1.5), rng.uniform(-0.3, 0.3))[:, : x.shape[1] - i]
    tr += 0.13 - 0.1 * p ** 0.8
save("drumroll.wav", reverb(x, rt=1.0, wet=0.2)[:, : int(d * SR)])

# 10. detik jam & 11. taip & 12. blip kaunter
tick = filt(noise(0.08, 1)[0], "bandpass", [2000, 6000]) * env_exp(0.08, 120) + np.sin(2 * np.pi * 1200 * tt(0.08)) * env_exp(0.08, 90) * 0.4
save("detik.wav", reverb(fit(tick, len(tick)), rt=0.5, wet=0.2), peak=0.6)
key = filt(noise(0.05, 1)[0], "bandpass", [1200, 5000]) * env_exp(0.05, 160)
save("taip.wav", fit(key, len(key)), peak=0.35)
blip = np.sin(2 * np.pi * 1760 * tt(0.06)) * env_exp(0.06, 70)
save("blip.wav", fit(blip, len(blip)), peak=0.3)

# 13. api & bara (latar 8.5 s)
d = 8.5
t = tt(d)
roar = filt(noise(d), "lowpass", 260) * (0.5 + 0.5 * np.minimum(1, t / 2))
x = roar * 1.4
for _ in range(int(d * 45)):
    st = rng.uniform(0, d - 0.02)
    c = filt(noise(0.015, 1)[0], "bandpass", [rng.uniform(1000, 3000), 9000]) * env_exp(0.015, rng.uniform(250, 600))
    i = int(st * SR)
    x[:, i:i + len(c)] += pan(c * rng.uniform(0.1, 0.8), rng.uniform(-0.9, 0.9))
x = x * np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 0.8)
save("api.wav", reverb(x, rt=1.5, wet=0.25)[:, : len(t)], peak=0.7)

# 14. whoosh bara naik (badan terbentuk)
w = whoosh(2.2, 120, 3000, 0.8, -0.2, 0.2)
save("bara_naik.wav", w, peak=0.85)

# 15. tepukan gemuruh
d = 7.0
t = tt(d)
x = np.zeros((2, int(d * SR)))
dens = np.interp(t, [0, 0.6, 4.5, 7], [0, 1, 1, 0])
for _ in range(2400):
    st = rng.uniform(0, d - 0.03)
    if rng.uniform() > dens[int(st * SR)]:
        continue
    f = rng.uniform(900, 2400)
    c = filt(noise(0.03, 1)[0], "bandpass", [f / 1.6, f * 1.6]) * env_exp(0.03, rng.uniform(90, 160))
    i = int(st * SR)
    x[:, i:i + len(c)] += pan(c * rng.uniform(0.3, 1), rng.uniform(-1, 1))
save("tepukan.wav", reverb(x, rt=2.0, wet=0.4, tone=7000)[:, : len(t)], peak=0.6)

# 16. pengatup kamera
sh = np.zeros(int(0.25 * SR))
for st, a in ((0, 1), (0.085, 0.7)):
    c = filt(noise(0.04, 1)[0], "bandpass", [1500, 9000]) * env_exp(0.04, 120) * a
    i = int(st * SR)
    sh[i:i + len(c)] += c
save("kamera.wav", reverb(fit(sh, len(sh)), rt=0.4, wet=0.15), peak=0.5)

# 17. sub drop
d = 2.5
save("sub_drop.wav", fit(sweep_sine(d, 90, 24, 1.8) * env_exp(d, 1.4), int(d * SR)), peak=0.9)

# 18. pop bintang
d = 0.7
pop = np.sin(2 * np.pi * 2637 * tt(d)) * env_exp(d, 9) + np.sin(2 * np.pi * 3951 * tt(d)) * env_exp(d, 12) * 0.5
save("pop_bintang.wav", reverb(fit(pop, int(d * SR)), rt=1.2, wet=0.35, tone=9000), peak=0.45)
print("siap")
