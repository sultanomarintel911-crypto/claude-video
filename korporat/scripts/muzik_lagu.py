"""Runut bunyi daripada dua lagu pilihan pengguna -> public/audio/muzik.wav

Lagu disusun supaya dentuman kuat jatuh tepat pada sorotan video:
  lagu B 11.77 s  -> pendedahan badge (intro 7.2 s)
  lagu A 44.35 s  -> "02 // BARISAN KEPIMPINAN" (selepas senyap seketika)
  lagu A 96.53 s  -> "03 // PEMBUDAYAAN DIGITAL" (terowong)
  Barisan kepimpinan: setiap potongan jatuh pada rentak lagu A, setiap
  pentadbir baharu masuk pada permulaan bar.
  lagu A 146.10 s -> ANUGERAH EMAS (selepas breakdown semasa "04 // PENCAPAIAN")
  lagu A 171.7 s  -> dentuman penutup
Lompatan dalam lagu A dibuat dalam gandaan rentak (123 BPM) supaya alunan
tidak tergelincir. Muzik direndahkan semasa suara latar (e-learning walk).

Guna: python3 scripts/muzik_lagu.py bahan_muzik/lagu_a.wav bahan_muzik/lagu_b.wav
"""
import json
import os
import sys

import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
BEAT_A = 60 / 123.046875

segs = json.load(open(os.path.join(ROOT, 'src', 'timeline.json')))['segs']
mula = {}
t = 0.0
for s in segs:
    d = (s['to'] - s['from']) / s.get('rate', 1) if 'from' in s and 'to' in s else s['dur']
    mula[s['id']] = (t, d, s)
    t += d
JUM = t


def baca(p):
    y, sr = sf.read(p, always_2d=True)
    assert sr == SR, (p, sr)
    return y[:, :2]


A = baca(sys.argv[1])
B = baca(sys.argv[2])


def rms(y, a, b):
    s = y[int(a * SR):int(b * SR)]
    return np.sqrt(np.mean(s ** 2))


# padankan kenyaringan bahagian bertenaga kedua-dua lagu
B *= rms(A, 50, 130) / rms(B, 12, 30)

T = lambda k: mula[k][0]
# offset: masa_lagu = masa_video + off
offB = 11.773 - T('intro') - 7.2
offA2 = 44.35 - T('lima_guru')
# langkau 12 rentak (3 bar) pada potongan koko -> pukulan 96.4 jatuh pada terowong;
# grid rentak tetap 123 BPM berpaksikan dentuman 44.35 s (96.53 tepat pada grid)
offA3 = offA2 + 12 * BEAT_A
# lompatan di bawah suara latar (muzik direndahkan) -> 146.10 jatuh tepat pada emas
offA4 = 146.10 - T('emas')
print('terowong ->', round(96.53 - offA3, 3), 'video', round(T('terowong'), 3))
print('emas     ->', round(146.10 - offA4, 3), 'video', round(T('emas'), 3))

# senarai keratan: (lagu, offset, v0, v1, pudar_masuk, pudar_keluar)
xB_tamat = T('lima_guru') - 1.35  # lagu A senyap bermula di sini
lomp3 = T('koko')
lomp4 = T('elearning')
KER = [
    (B, offB, 0.0, xB_tamat + 0.5, 0.0, 1.0),
    (A, offA2, xB_tamat, lomp3, 0.05, 0.04),
    (A, offA3, lomp3, lomp4, 0.04, 0.05),
    (A, offA4, lomp4, JUM, 0.05, 2.2),
]

n = int(np.ceil(JUM * SR)) + 1
out = np.zeros((n, 2))
for y, off, v0, v1, fi, fo in KER:
    i0, i1 = int(v0 * SR), min(int(v1 * SR), n)
    src = np.arange(i0, i1) + int(round(off * SR))
    ok = (src >= 0) & (src < len(y))
    seg = np.zeros((i1 - i0, 2))
    seg[ok] = y[src[ok]]
    tt = np.arange(i1 - i0) / SR
    g = np.ones(i1 - i0)
    if fi > 0:
        g *= np.clip(tt / fi, 0, 1)
    if fo > 0:
        g *= np.clip((tt[-1] - tt) / fo, 0, 1)
    out[i0:i1] += seg * g[:, None]


# dentuman sub tambahan pada babak data (statistik & graf 3D)
def dentum(at, kuat=0.5):
    L = int(1.4 * SR)
    tt = np.arange(L) / SR
    f = 38 + 70 * np.exp(-tt * 9)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-tt * 3.2)
    rng = np.random.default_rng(int(at * 100))
    s += rng.standard_normal(L) * np.exp(-tt * 40) * 0.35
    i = int(at * SR)
    j = min(n, i + L)
    out[i:j] += (s[:j - i] * kuat)[:, None]


dentum(T('statistik'), 0.45)
dentum(T('graf3d'), 0.4)

# rendahkan muzik semasa suara latar
v0 = T('elearning')
v1 = max(T(k) + (mula[k][2]['voTo'] - mula[k][2]['from']) / mula[k][2].get('rate', 1) for k in mula if mula[k][2].get('vo'))
tt = np.arange(n) / SR
duk = 1 - 0.68 * np.clip(np.minimum((tt - v0) / 0.6, (v1 + 0.9 - tt) / 0.9), 0, 1)
out *= duk[:, None]

# normalkan: puncak -1.5 dBFS
out *= 10 ** (-1.5 / 20) / np.abs(out).max()
p = os.path.join(ROOT, 'public', 'audio', 'muzik.wav')
sf.write(p, out.astype(np.float32), SR, subtype='PCM_16')
print('ditulis', p, round(n / SR, 2), 's; rms dB', round(20 * np.log10(np.sqrt(np.mean(out ** 2))), 1))
