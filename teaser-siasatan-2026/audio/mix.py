#!/usr/bin/env python3
"""Adunan teaser "Fail Kes TM-26" → out/mix.wav (48 kHz stereo). Tiada suara; jam ialah rentak.
Masa peristiwa sama dengan index.html (LAMP_T, FLAP_T, P_T, HL_T, ARC_T, TICK_T, K_T, U_T, STR_T, CAP_T, END_T).
Skor: core/audio/sampler (VSCO 2 CE / VCSL, CC0), D minor. Kesan bunyi: core/audio/sfx (sintesis)."""
import json, os, sys
import numpy as np, soundfile as sf
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.environ.get('LIB', '/root/lemo-opuscar'); sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, add, bp, hp, lp, noise, env_exp, t_, whoosh, thump, norm, limit, brown

F = json.load(open(os.path.join(D, 'film.json'))); DUR = F['dur']
N = int(DUR * SR); mus = np.zeros((N, 2), np.float32); fx = np.zeros((N, 2), np.float32)
S.seed(26); rng = np.random.default_rng(26)
LAMP_T = .5; FLAP_T = 3.4; P_T = lambda i: 4.6 + i * .13
HL_T = lambda k: 7.2 + k * .55; N18_T = 10.8; N06_T = 11.8; TALLY_T = 12.6
ARC_T = [15.0, 16.2, 17.4, 18.6]; ARC_D = .7; NEG_T = 20.0; KM_T = 20.6
TICK_T = lambda i: 23.0 + i * .55; JAW_T = 26.0
K_T = lambda i: 28.6 + i * .45; U_T = lambda i: 31.6 + i * .6
STR_T = lambda i: 37.2 + i * .2; CAP_T = 39.6; END_T = 41.5

ev = []
def E(*a): ev.append(a)
# ── Skor ──
# buka: hentakan pada potongan ke peta; dengung D rendah sepanjang filem
E(LAMP_T, 'timpani', 'D2', 2.0, .55, 0, .55); E(FLAP_T, 'gran_cassa', 'hit', 1.6, .55, 0, .55)
for t0, d in [(.5, 13.5), (14.0, 8.0), (22.0, 6.0), (28.0, 8.0)]: E(t0, 'contrabass', 'D2', d, .5, -.15, .5)
E(.6, 'cellos', 'A2', 4.6, .3, .2, .28)
# rekod: ostinato pizzicato (lapan = 0.25 s), Dm → B♭ → Gm → A
pat = [(5.5, ['D4', 'F4', 'A4', 'F4']), (7.5, ['D4', 'F4', 'Bb4', 'F4']), (9.5, ['D4', 'G4', 'Bb4', 'G4']), (11.5, ['C#4', 'E4', 'A4', 'E4'])]
for i, (t0, p) in enumerate(pat):
    t1 = pat[i + 1][0] if i + 1 < len(pat) else 14.0; k = 0; tt = t0
    while tt < t1 - .01: E(tt, 'violas_pizz', p[k % 4], .3, .42 + .12 * (k % 4 == 0), .25, .42); k += 1; tt += .25
for t0, r in [(5.5, 'D2'), (7.5, 'Bb1'), (9.5, 'G2'), (11.5, 'A1')]: E(t0, 'cellos', {'D2': 'D3', 'Bb1': 'Bb2', 'G2': 'G2', 'A1': 'A2'}[r], 2.0, .4, .1, .35)
for k in range(6): E(HL_T(k) + .1, 'glockenspiel', ['D6', 'E6', 'F6', 'A6', 'C7', 'D7'][k], 1.0, .5, -.3 + .12 * k, .42)
# dunia: rentetan lebar, nota pin pada setiap pendaratan
E(14.0, 'cellos', 'D3', 8.0, .35, .1, .32); E(14.0, 'violas', 'A3', 8.0, .3, -.1, .25); E(16.0, 'violins', 'F4', 6.0, .25, .3, .18)
for i, p in enumerate(['A5', 'C6', 'D6', 'F6']): E(ARC_T[i] + ARC_D, 'vibraphone', p, 1.8, .5, -.3 + .2 * i, .4); E(ARC_T[i] + ARC_D, 'timpani', 'D2', .8, .35, 0, .3)
E(NEG_T, 'gran_cassa', 'hit', 1.4, .55, 0, .55); E(NEG_T, 'timpani', 'A2', 1.2, .6, 0, .5)
# jawatan: pizzicato semula + tremolo
k = 0; tt = 22.0
while tt < 27.95: E(tt, 'violas_pizz', ['D4', 'F4', 'A4', 'F4'][k % 4] if tt < 25 else ['C#4', 'E4', 'A4', 'E4'][k % 4], .3, .45, .25, .42); k += 1; tt += .25
E(22.0, 'violins_trem', 'A5', 6.0, .22, .4, .15)
for i in range(5): E(TICK_T(i) + .1, 'glockenspiel', ['D6', 'F6', 'A6', 'C7', 'D7'][i], 1.0, .5, -.3 + .15 * i, .42)
E(JAW_T, 'gran_cassa', 'hit', 1.4, .55, 0, .55); E(JAW_T, 'timpani', 'D2', 1.4, .65, 0, .55)
# papan: ketegangan minor-second, jantung bes
E(28.0, 'violins_trem', 'E5', 8.0, .28, .35, .22); E(30.8, 'violins_trem', 'F5', 5.2, .34, -.35, .24); E(28.0, 'cellos', 'D3', 8.0, .42, .1, .38)
for tt in np.arange(28.2, 35.9, 1.0): E(float(tt), 'contrabass_pizz' if 'contrabass_pizz' in S.REG else 'cellos_pizz', 'D2', .5, .75, 0, .7)
for i in range(5): E(K_T(i), 'glockenspiel', ['D6', 'F6', 'A6', 'C7', 'D7'][i], .9, .45, -.2 + .1 * i, .38)
for i in range(3): E(U_T(i), 'timpani', 'D2', .9, .5, 0, .45)
# bukti: hentakan + D minor add9 + arpeggio vibrafon
E(36.0, 'gran_cassa', 'hit', 2.0, .75, 0, .7); E(36.0, 'timpani', 'D2', 2.0, .8, 0, .7)
for p, pan in [('D2', 0), ('D3', -.2), ('A3', .2), ('E4', -.3), ('F4', .3)]: E(36.0, 'cellos' if p != 'D2' else 'contrabass', p, 5.2, .4, pan, .36)
for i, p in enumerate(['D4', 'A4', 'E5', 'F5', 'A5', 'D6']): E(36.1 + .22 * i, 'vibraphone', p, 2.2, .45, -.3 + .12 * i, .33)
for i in range(5): E(STR_T(i) + .1, 'glockenspiel', ['A6', 'C7', 'D7', 'E7', 'F7'][i], .9, .5, -.2 + .13 * i, .4)
E(CAP_T, 'violins', 'A4', 2.7, .32, .3, .2)
# akhir: senyap 0.2 s, kemudian hentakan dalam + harpa
E(41.5, 'gran_cassa', 'hit', 2.4, 1.0, 0, .95); E(41.5, 'timpani', 'D2', 2.6, .9, 0, .85); E(41.5, 'contrabass', 'D2', 3.4, .55, 0, .5)
for i, p in enumerate(['D3', 'A3', 'E4', 'F4']): E(42.2 + .4 * i, 'harp', p, 2.4, .45, -.2 + .12 * i, .38)

mus += S.render(ev, dur=DUR, master=False)[:N]
mus = S.room(mus, size=.5, mix=.2)
# senyap sebelum hentakan akhir
g = np.ones(N); a, b = int(41.2 * SR), int(41.45 * SR); g[a:b] = np.linspace(1, .05, b - a); mus[:b] *= 1; mus[a:b] *= g[a:b, None]

# ── Kesan bunyi ──
def tick(v=1.0, f=2400):
    d = .03; tt = t_(d); return (hp(noise(d), 1800) * env_exp(d, .003) + np.sin(2 * np.pi * f * tt) * env_exp(d, .004) * .6) * v
def paper(v=1.0):
    d = .25; return bp(noise(d), 1200, 6000) * env_exp(d, .05) * (1 - np.exp(-t_(d) / .01)) * v
def shutter(v=1.0):
    d = .09; a = hp(noise(d), 2000) * env_exp(d, .006); b = np.pad(hp(noise(.05), 1500) * env_exp(.05, .005), (int(.045 * SR), 0))[:len(a)]
    return norm(a + b * .8) * v
def typekey(v=1.0):
    d = .035; return norm(bp(noise(d), 900, 5000) * env_exp(d, .004) + np.sin(2 * np.pi * 180 * t_(d)) * env_exp(d, .008) * .4) * v
def pencil(d=.4, v=1.0):
    return bp(noise(d), 2500, 7000) * (.6 + .4 * np.abs(np.sin(np.pi * t_(d) * 9))) * np.sin(np.pi * t_(d) / d) * .35 * v

def click(v=1.0):      # suis lampu
    d = .06; return norm(hp(noise(d), 1500) * env_exp(d, .004) + np.sin(2 * np.pi * 95 * t_(d)) * env_exp(d, .01) * .7) * v
def slide(d=.5, v=1.0): # kertas menggelongsor di atas kayu
    tt = t_(d); return bp(noise(d), 700, 5000) * np.sin(np.pi * tt / d) ** 1.5 * .55 * v
def marker(d=.4, v=1.0): # pen marker berdecit
    tt = t_(d); return bp(noise(d), 1800, 6500) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 7 * tt))) * np.sin(np.pi * tt / d) * .45 * v
def pinhit(v=1.0):
    d = .05; return norm(hp(noise(d), 2500) * env_exp(d, .003) + np.sin(2 * np.pi * 1400 * t_(d)) * env_exp(d, .006) * .4) * v
add(fx, click(1), LAMP_T, .6, -.2); add(fx, click(.6), LAMP_T + .12, .4, -.2)
for tt in np.arange(1.0, 36.0, .5):
    add(fx, tick(.5, 2600 if int(tt * 2) % 2 == 0 else 2200), float(tt), .2, .35)          # jam dinding
add(fx, slide(.45), FLAP_T, .5, 0); add(fx, paper(1), FLAP_T + .2, .4)
for i in range(7): add(fx, slide(.55, .9), P_T(i), .5, -.5 + i * .16); add(fx, paper(.7), P_T(i) + .45, .3, -.5 + i * .16)
for k in range(6): add(fx, marker(.32), HL_T(k), .5, -.2)
add(fx, paper(.8), 10.4, .35, .3)
for tt, d in [(N18_T, .8), (N06_T, .7), (N06_T + .7, .4), (TALLY_T, .9)]: add(fx, marker(d), tt, .45, .25)
add(fx, slide(.6), 14.1, .35); add(fx, pinhit(1), 14.6, .4)
for i in range(4): add(fx, marker(ARC_D, .9), ARC_T[i], .4, -.3 + .2 * i); add(fx, pinhit(1), ARC_T[i] + ARC_D, .5, -.3 + .2 * i)
for tt, d in [(NEG_T, .6), (KM_T, .6)]: add(fx, marker(d), tt, .45)
add(fx, slide(.6), 22.0, .35)
for i in range(5): add(fx, marker(.3), TICK_T(i), .45, .2)
add(fx, marker(.55), JAW_T, .45); add(fx, marker(.5), JAW_T + .6, .4)
add(fx, slide(.6), 28.0, .35)
for i in range(5): add(fx, marker(.38, .8), K_T(i), .4, -.2)
for i in range(3): add(fx, marker(.3), U_T(i), .45, .3); add(fx, marker(.2, .7), U_T(i) + .3, .4, .3)
add(fx, slide(.7), 36.0, .35)
for i in range(5): add(fx, pinhit(1), STR_T(i), .45, -.4 + .2 * i)
add(fx, marker(.7), CAP_T, .45)
add(fx, click(1), END_T - .1, .6, -.2)
for k in range(13): add(fx, typekey(.9), END_T + .2 + k * .054, .32)
for k in range(48): add(fx, typekey(.7), 42.5 + k * .021, .22)
add(fx, thump(1.0, 42), END_T, .8)
fx += np.repeat(lp(brown(DUR), 400)[:N, None] * .012, 2, axis=1).astype(np.float32)

out = mus * 3.0 + fx * .8
tail = int(.8 * SR); out[-tail:] *= np.linspace(1, 0, tail)[:, None]
def tp_limit(x, ceil):
    from scipy.signal import resample_poly
    from scipy.ndimage import maximum_filter1d, minimum_filter1d, uniform_filter1d
    up = resample_poly(x, 4, 1); n = int(.004 * SR * 4)
    g = np.minimum(1, ceil / np.maximum(maximum_filter1d(np.abs(up), 2 * n + 1), 1e-9)); g = uniform_filter1d(minimum_filter1d(g, 2 * n + 1), n)
    return resample_poly(up * g, 1, 4)[:len(x)]
out = np.stack([tp_limit(limit(out[:, c], .5), .45) for c in range(2)], 1)
os.makedirs(os.path.join(D, 'out'), exist_ok=True)
sf.write(os.path.join(D, 'out/mix.wav'), out.astype(np.float32), SR)
print('mix', out.shape, 'peak', float(np.abs(out).max()))
