#!/usr/bin/env python3
"""Muzik SEMENTARA gaya trailer untuk montaj pentadbir (akan diganti lagu pilihan sekolah).
Input: JSON garis masa (argumen 1). Output: public/audio/muzik_montaj.wav
Lapisan: dengung bass, denyut ostinato, dram besar (taiko sintetik), hentakan pada setiap kad nama,
whoosh pada whip pan, riser + braaam pada tajuk, reda pada babak PPKI, klimaks pada data/penutup.
"""
import json
import os
import sys
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 44100
rng = np.random.default_rng(11)
ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
tl = json.load(open(sys.argv[1]))
TOTAL = tl['total'] + 0.5
N = int(TOTAL * SR)
EV = {e['id']: e for e in tl['ev']}
BPM = 100
BEAT = 60 / BPM


def tt(d):
    return np.arange(int(d * SR)) / SR


def filt(x, k, f, o=2):
    return sosfilt(butter(o, f, btype=k, fs=SR, output='sos'), x, axis=-1)


def add(buf, x, at, g=1.0):
    i = int(at * SR)
    x = np.atleast_2d(x)
    if x.shape[0] == 1:
        x = np.vstack([x, x])
    if i < 0:
        x = x[:, -i:]
        i = 0
    m = min(N - i, x.shape[1])
    if m > 0:
        buf[:, i:i + m] += x[:, :m] * g


def reverb(x, sec=2.5, wet=0.35):
    ir = rng.standard_normal((2, int(sec * SR))) * np.exp(-tt(sec) * 3)
    ir = filt(ir, 'low', 5000)
    ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
    return x * (1 - wet) + np.vstack([fftconvolve(x[c], ir[c])[:x.shape[1]] for c in range(2)]) * wet * 1.5


def saw(f, d):
    return 2 * np.mod(tt(d) * f, 1) - 1


# Tenaga sepanjang masa (0..1)
energy = np.zeros(N)
def seg(a, b, v):
    energy[int(a * SR):int(b * SR)] = v
for e in tl['ev']:
    v = {'klip': 0.8, 'tajuk': 0.6, 'hologram': 0.85, 'data': 1.0, 'akhir': 1.0}[e['kind']]
    if e['id'] in ('dungun', 'bangunan'):
        v = 0.3
    seg(e['start'], e['start'] + e['dur'], v)
k = int(0.4 * SR)
energy = np.convolve(energy, np.ones(k) / k, mode='same')

out = np.zeros((2, N))
# Dengung bass D
drone = np.sin(2 * np.pi * 36.7 * tt(TOTAL)) * 0.5 + saw(73.4, TOTAL) * 0.15
drone = filt(drone, 'low', 220) * 0.35
out += np.vstack([drone, drone]) * (0.5 + 0.5 * energy)

# Denyut ostinato (16th) D-F-A
notes = [146.8, 174.6, 220.0, 174.6]
puls = np.zeros((2, N))
for i in range(int(TOTAL / (BEAT / 4))):
    t0 = i * BEAT / 4
    d = 0.14
    x = filt(saw(notes[i % 4], d), 'low', 1800) * np.exp(-tt(d) * 22) * 0.12
    add(puls, x, t0)
out += reverb(puls, 1.2, 0.25) * energy

# Dram besar (taiko) pada rentak 1 & 3
def taiko(g=1.0):
    d = 0.9
    body = np.sin(2 * np.pi * np.cumsum(50 + 70 * np.exp(-tt(d) * 18)) / SR) * np.exp(-tt(d) * 5)
    sk = filt(rng.standard_normal(int(d * SR)), 'band', [80, 900]) * np.exp(-tt(d) * 25) * 0.6
    return (body + sk) * 0.6 * g
drums = np.zeros((2, N))
for i in range(int(TOTAL / BEAT)):
    t0 = i * BEAT
    e = energy[min(N - 1, int(t0 * SR))]
    if e > 0.5 and i % 2 == 0:
        add(drums, taiko(e), t0)
    if e > 0.9 and i % 2 == 1:
        add(drums, taiko(0.5), t0 + BEAT / 2)
out += reverb(drums, 1.8, 0.3)

# Brass (kord D minor) pada blok tenaga tinggi
for e in tl['ev']:
    if e['kind'] in ('data', 'akhir'):
        d = e['dur']
        x = sum(saw(f * 2 ** (dd / 1200), d) for f in (73.4, 110, 146.8, 174.6) for dd in (-7, 7))
        env = np.minimum(1, tt(d) / 0.4) * np.minimum(1, (d - tt(d)) / 1.0)
        add(out, reverb(np.vstack([filt(x, 'low', 1400) * env * 0.05] * 2), 2.5, 0.4), e['start'])

# Kesan bunyi
def impact(at, g=1.0):
    d = 3.0
    boom = np.sin(2 * np.pi * np.cumsum(34 + 70 * np.exp(-tt(d) * 7)) / SR) * np.exp(-tt(d) * 1.8)
    nz = filt(rng.standard_normal((2, int(d * SR))), 'low', 3000) * np.exp(-tt(d) * 6) * 0.5
    add(out, reverb(np.vstack([boom, boom]) + nz, 2.5, 0.4), at, 0.8 * g)

def riser(end, d=1.8):
    x = rng.standard_normal((2, int(d * SR)))
    y = np.zeros_like(x)
    s = int(0.05 * SR)
    for j in range(0, x.shape[1], s):
        fc = 250 * 40 ** (j / x.shape[1])
        y[:, j:j + s] = filt(x[:, j:j + s], 'band', [fc, min(fc * 1.8, 18000)])
    add(out, y * np.linspace(0, 1, x.shape[1]) ** 2 * 0.25, end - d)

def whoosh(at, g=0.25):
    d = 0.5
    x = filt(rng.standard_normal((2, int(d * SR))), 'band', [500, 6000]) * np.sin(np.pi * np.linspace(0, 1, int(d * SR))) ** 2
    x[0] *= np.linspace(1.3, 0.5, x.shape[1])
    x[1] *= np.linspace(0.5, 1.3, x.shape[1])
    add(out, x, at - d * 0.5, g)

def braaam(at, d=3.5):
    x = sum(saw(f * 2 ** (dd / 1200), d) for f in (36.7, 73.4, 110) for dd in (-12, 0, 12))
    y = np.zeros(x.shape[0])
    s = int(0.05 * SR)
    for j in range(0, x.shape[0], s):
        fc = 120 + 2000 * min(1, j / (0.5 * SR)) * np.exp(-j / SR * 0.6)
        y[j:j + s] = filt(x[j:j + s], 'low', fc)
    env = np.minimum(1, tt(d) / 0.04) * np.exp(-tt(d) * 0.6)
    add(out, reverb(np.vstack([y * env * 0.11] * 2), 3, 0.4), at)

def blip(at, f=1600, g=0.08):
    add(out, np.sin(2 * np.pi * f * tt(0.06)) * np.exp(-tt(0.06) * 40), at, g)

prev = None
for e in tl['ev']:
    s = e['start']
    if prev and prev['whip']:
        whoosh(s, 0.35)
    if e['kind'] == 'tajuk':
        riser(s, 2.0)
        braaam(s)
        impact(s, 1.2)
    if e['card'] is not None:
        impact(s + e['card'], 1.0)
        for j in range(8):
            blip(s + e['card'] + 0.2 + j * 0.05, 1400 + j * 90, 0.05)
    if e['kind'] == 'data':
        riser(s, 1.5)
        impact(s, 1.3)
        for j in range(4):
            for q in range(10):
                blip(s + (10 + j * 8) / 30 + q * 0.06, 1800 + q * 40, 0.035)
    if e['kind'] == 'akhir':
        braaam(s)
        impact(s, 1.4)
    if e['id'] == 'bangunan':
        whoosh(s, 0.2)
    prev = e

fade = np.ones(N)
a = int((TOTAL - 3) * SR)
fade[a:] = np.linspace(1, 0, N - a) ** 1.5
fade[:int(1.5 * SR)] *= np.linspace(0, 1, int(1.5 * SR))
out = np.tanh(out * fade * 1.2)
out /= np.abs(out).max() / 0.89
p = os.path.join(ROOT, 'public', 'audio', 'muzik_montaj.wav')
with wave.open(p, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((out.T * 32767).astype('<i2').tobytes())
print('ditulis', p, f'{TOTAL:.1f}s')
