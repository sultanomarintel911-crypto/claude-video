#!/usr/bin/env python3
"""Jana muzik latar sci-fi asli (bebas royalti, disintesis sepenuhnya) + SFX,
diselaraskan dengan src/timeline.json -> public/audio/muzik.wav

Struktur: D minor, 120 BPM, progresi Dm-Bb-F-C (1 bar setiap kord).
Lapisan diaktifkan ikut 'energi' setiap babak (0..3):
  0 = pad + denyut bass lembut (bawah suara latar)
  1 = + arpeggio
  2 = + dram penuh, bass 8th
  3 = + lead "hero", brass, simbal
Hentakan (impact), riser, whoosh dan bunyi imbasan diletak pada titik suntingan.
"""
import json
import os
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..'))
rng = np.random.default_rng(7)
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT

# ---------- garis masa (mesti sama dengan src/data.ts) ----------
TL = json.load(open(os.path.join(ROOT, 'src', 'timeline.json')))['segs']
t = 0.0
for s in TL:
    s['dur'] = s['dur'] if 'dur' in s and 'from' not in s else (s['to'] - s['from']) / s.get('rate', 1)
    s['start'] = t
    t += s['dur']
TOTAL = t
N = int((TOTAL + 1.0) * SR)
print(f'jumlah {TOTAL:.2f} s')


def energy_at(x):
    for s in TL:
        if s['start'] <= x < s['start'] + s['dur']:
            return s['energi']
    return 0


def vo_intervals():
    out = []
    for s in TL:
        if 'vo' in s:
            r = s.get('rate', 1)
            a = s['start'] + (s['voFrom'] - s['from']) / r
            b = s['start'] + (s['voTo'] - s['from']) / r
            out.append((a, b))
    return out


# ---------- utiliti ----------
def tt(d):
    return np.arange(int(d * SR)) / SR


def filt(x, kind, f, order=2):
    sos = butter(order, f, btype=kind, fs=SR, output='sos')
    return sosfilt(sos, x, axis=-1)


def saw(f, d, ph=0.0):
    return 2 * np.mod(tt(d) * f + ph, 1.0) - 1


def midi(n):
    return 440 * 2 ** ((n - 69) / 12)


def add(buf, x, at):
    i = int(at * SR)
    if i >= buf.shape[1] or i + x.shape[-1] <= 0:
        return
    x = np.atleast_2d(x)
    if x.shape[0] == 1:
        x = np.vstack([x, x])
    j0 = max(0, -i)
    i = max(0, i)
    m = min(buf.shape[1] - i, x.shape[1] - j0)
    buf[:, i:i + m] += x[:, j0:j0 + m]


def adsr(d, a, r):
    n = int(d * SR)
    e = np.ones(n)
    na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e


def reverb(x, sec=2.6, wet=0.3):
    ir = rng.standard_normal((2, int(sec * SR))) * np.exp(-tt(sec) * 3.2)
    ir = filt(ir, 'low', 6000)
    ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
    y = np.vstack([fftconvolve(x[c], ir[c])[:x.shape[1]] for c in range(2)])
    return x * (1 - wet) + y * wet * 1.4


# Envelope tenaga berlapis (dilicinkan) -> gain setiap lapisan
tgrid = np.arange(N) / SR
seg_e = np.zeros(N)
for s in TL:
    a, b = int(s['start'] * SR), int((s['start'] + s['dur']) * SR)
    seg_e[a:b] = s['energi']


def smooth(x, sec):
    k = int(sec * SR)
    c = np.cumsum(np.concatenate([[0], x]))
    y = (c[k:] - c[:-k]) / k
    return np.concatenate([np.full(k // 2, y[0]), y, np.full(len(x) - len(y) - k // 2, y[-1])])


def layer_gain(lo):
    return smooth((seg_e >= lo).astype(float), 0.35)


# ---------- progresi ----------
CHORDS = [  # (akar, nada kord) - D minor epik
    (38, [62, 65, 69]),  # Dm
    (34, [58, 62, 65]),  # Bb
    (41, [60, 65, 69]),  # F
    (36, [60, 64, 67]),  # C
]
nbars = int(np.ceil(TOTAL / BAR)) + 1

# PAD supersaw
pad = np.zeros((2, N))
for b in range(nbars):
    root, notes = CHORDS[b % 4]
    d = BAR + 0.6
    x = np.zeros((2, int(d * SR)))
    e = energy_at(b * BAR + 0.1)
    for n in notes + [notes[0] - 12]:
        for v in range(5):
            det = (v - 2) * 0.09
            f = midi(n) * 2 ** (det / 12)
            pan = 0.5 + (v - 2) * 0.2
            w = saw(f, d, rng.random())
            x[0] += w * (1 - pan)
            x[1] += w * pan
    x = filt(x, 'low', 900 + 900 * e) * adsr(d, 0.5, 0.7) * 0.05
    add(pad, x, b * BAR)
pad = reverb(pad, 3.0, 0.45)

# BASS
bass = np.zeros((2, N))
for i in range(int(TOTAL / (BEAT / 2)) + 2):
    tt0 = i * BEAT / 2
    root = CHORDS[int(tt0 // BAR) % 4][0]
    e = energy_at(tt0)
    if e == 0 and i % 2:  # tenaga rendah: denyut 1/4 sahaja
        continue
    d = BEAT / 2 * 0.95
    f = midi(root)
    x = (saw(f, d) * 0.6 + np.sin(2 * np.pi * f / 2 * tt(d)) * 0.8)
    x = filt(x, 'low', 260 + 120 * e) * adsr(d, 0.005, 0.06) * 0.32
    add(bass, x, tt0)

# ARP 16th
arp = np.zeros((2, N))
pat = [0, 1, 2, 3, 2, 1, 0, 2]
for i in range(int(TOTAL / (BEAT / 4)) + 2):
    tt0 = i * BEAT / 4
    _, notes = CHORDS[int(tt0 // BAR) % 4]
    tones = notes + [n + 12 for n in notes]
    n = tones[[0, 1, 2, 3, 4, 5, 4, 2][i % 8]]
    e = energy_at(tt0)
    d = 0.22
    x = saw(midi(n), d) * 0.6 + saw(midi(n) * 1.004, d) * 0.4
    x = filt(x, 'low', 1400 + 1300 * e + 600 * np.sin(i / 23)) * np.exp(-tt(d) * 16) * 0.075
    pan = 0.5 + 0.35 * np.sin(i * 0.7)
    add(arp, np.vstack([x * (1 - pan), x * pan]), tt0)
arp = reverb(arp, 1.6, 0.35)

# DRAM
kick_s = (np.sin(2 * np.pi * np.cumsum(45 + 110 * np.exp(-tt(0.4) * 30)) / SR) * np.exp(-tt(0.4) * 9)
          + filt(rng.standard_normal(int(0.4 * SR)), 'high', 3000) * np.exp(-tt(0.4) * 200) * 0.3) * 0.9
sn_d = 0.35
snare_s = (filt(rng.standard_normal(int(sn_d * SR)), 'band', [1200, 7000]) * np.exp(-tt(sn_d) * 14) * 0.5
           + np.sin(2 * np.pi * 185 * tt(sn_d)) * np.exp(-tt(sn_d) * 25) * 0.5) * 0.45
hat_s = filt(rng.standard_normal(int(0.06 * SR)), 'high', 8000) * np.exp(-tt(0.06) * 70) * 0.12
drums = np.zeros((2, N))
duck = np.ones(N)  # sidechain dari kick
for i in range(int(TOTAL / (BEAT / 4)) + 2):
    tt0 = i * BEAT / 4
    e = energy_at(tt0)
    q = i % 16
    if e >= 2 or (e == 1 and q in (0, 8)):
        if q % 4 == 0:
            add(drums, kick_s, tt0)
            k = int(tt0 * SR)
            L = min(int(0.25 * SR), N - k)
            if L > 0: duck[k:k + L] = np.minimum(duck[k:k + L], 0.45 + 0.55 * np.linspace(0, 1, L) ** 0.6)
    if e >= 2 and q in (4, 12):
        add(drums, snare_s, tt0)
    if e >= 2 or (e == 1 and q % 2 == 0):
        add(drums, hat_s * (1.0 if q % 2 == 0 else 0.6), tt0)
drums = reverb(drums, 1.2, 0.18)

# LEAD hero + brass (tenaga 3)
MEL = [[(77, 2), (76, 2)], [(74, 4)], [(72, 2), (69, 2)], [(72, 2), (76, 2)]]
lead = np.zeros((2, N))
for b in range(nbars):
    tb = b * BAR
    off = 0
    for n, beats in MEL[b % 4]:
        d = beats * BEAT
        x = sum(saw(midi(n) * 2 ** (dd / 1200), d + 0.3) for dd in (-8, 0, 8)) / 3
        x = x + 0.5 * saw(midi(n - 12), d + 0.3)
        x = filt(x, 'low', 3200) * adsr(d + 0.3, 0.06, 0.35) * 0.07
        add(lead, x, tb + off)
        off += d
    root, notes = CHORDS[b % 4]
    # brass stab pada rentak 1
    x = sum(saw(midi(n - 12) * 2 ** (dd / 1200), 0.6) for n in notes for dd in (-6, 6))
    x = filt(x, 'low', 1800) * adsr(0.6, 0.01, 0.4) * 0.03
    add(lead, x, tb)
lead = reverb(lead, 2.2, 0.35)

mix = pad * (0.55 + 0.45 * layer_gain(1)) \
    + bass * duck * (0.6 + 0.4 * layer_gain(2)) \
    + arp * layer_gain(1) * duck \
    + drums * layer_gain(1) \
    + lead * layer_gain(3) * duck

# ---------- SFX ----------
sfx = np.zeros((2, N))


def impact(at, big=1.0):
    d = 3.0
    boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-tt(d) * 6)) / SR) * np.exp(-tt(d) * 1.6)
    nz = filt(rng.standard_normal((2, int(d * SR))), 'low', 2500) * np.exp(-tt(d) * 5) * 0.4
    hit = np.vstack([boom, boom]) + nz
    add(sfx, reverb(hit, 2.5, 0.4) * 0.55 * big, at)


def riser(end, d=2.0):
    x = rng.standard_normal((2, int(d * SR)))
    out = np.zeros_like(x)
    seg = int(0.05 * SR)
    for k in range(0, x.shape[1], seg):
        fc = 300 * (40 ** (k / x.shape[1]))
        out[:, k:k + seg] = filt(x[:, k:k + seg], 'band', [fc, min(fc * 1.8, 18000)])
    out *= np.linspace(0, 1, x.shape[1]) ** 2 * 0.22
    add(sfx, out, end - d)


def whoosh(at, g=0.12):
    d = 0.45
    x = rng.standard_normal((2, int(d * SR)))
    x = filt(x, 'band', [600, 5000]) * np.sin(np.pi * np.linspace(0, 1, x.shape[1])) ** 2 * g
    x[0] *= np.linspace(1.2, 0.6, x.shape[1])
    x[1] *= np.linspace(0.6, 1.2, x.shape[1])
    add(sfx, x, at - d * 0.5)


def blip(at, f=1500, d=0.07, g=0.08):
    add(sfx, np.sin(2 * np.pi * f * tt(d)) * np.exp(-tt(d) * 30) * g, at)


def braaam(at):
    d = 4.0
    x = sum(saw(midi(n) * 2 ** (dd / 1200), d) for n in (26, 38, 45) for dd in (-10, 0, 10))
    out = np.zeros((2, x.shape[0]))
    seg = int(0.05 * SR)
    for k in range(0, x.shape[0], seg):
        fc = 150 + 2200 * min(1, k / (0.7 * SR)) * np.exp(-k / SR * 0.5)
        out[:, k:k + seg] = filt(x[k:k + seg], 'low', fc)
    out *= adsr(d, 0.05, 1.8) * 0.09
    add(sfx, reverb(out, 3, 0.4), at)


prev_e = 0
for k, s in enumerate(TL):
    st = s['start']
    if k > 0:
        whoosh(st, 0.10)
    if 'hit' in s:
        impact(st + s['hit'], 1.0)
        riser(st + s['hit'], 2.0)
    elif s['energi'] > prev_e and s['energi'] >= 2:
        impact(st, 0.6)
    prev_e = s['energi']
    if s['id'] == 'biometrik':
        for j in range(10):
            blip(st + 1.2 + j * 0.12, 900 + j * 60, 0.05, 0.05)
        for j, f in enumerate([880, 1320, 1760]):
            blip(st + s['dur'] * 0.62 + j * 0.09, f, 0.18, 0.09)
    if s['id'] == 'statistik':
        for j in range(4):
            for q in range(14):
                blip(st + 0.6 + j * 3.6 + q * 0.07, 1800 + q * 40, 0.03, 0.03)
    if s['id'] == 'emas':
        braaam(st)
        impact(st, 1.4)
    if s['id'] == 'tutup':
        impact(st, 1.0)

# ---------- campur: duck bawah suara latar, pudar akhir ----------
g = np.ones(N)
for a, b in vo_intervals():
    i, j = int((a - 0.3) * SR), int((b + 0.3) * SR)
    g[max(0, i):j] = 0.0
g = 0.42 + 0.58 * smooth(g, 0.6)
mix = mix * g
fin = int((TOTAL - 3.5) * SR)
fade = np.ones(N)
fade[fin:] = np.linspace(1, 0, N - fin) ** 1.5
# pembukaan masuk perlahan
fade[:int(1.5 * SR)] *= np.linspace(0, 1, int(1.5 * SR))
mix = mix * fade + sfx * np.maximum(fade, (np.arange(N) < fin))
mix = np.tanh(mix * 1.1) * 0.9
mix /= np.abs(mix).max() / 0.89

out = os.path.join(ROOT, 'public', 'audio', 'muzik.wav')
pcm = (np.clip(mix.T, -1, 1) * 32767).astype('<i2')
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('ditulis', out, f'{N / SR:.1f} s')
