#!/usr/bin/env python3
"""Lagu asli 120 BPM (A minor: Am – F – C – G) + kesan bunyi untuk teaser "Bukti Bertaburan" → out/mix.wav (48 kHz stereo).
Semua bunyi disintesis dalam kod (numpy). Masa sama dengan film.json / index.html.
Struktur: intro 0–4 · beat penuh 4–28 · pecahan + riser 28–32 · drop 32–40 · hentakan & ekor 40–45."""
import json, os, sys
import numpy as np, soundfile as sf
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.environ.get('LIB', '/root/lemo-opuscar'); sys.path.insert(0, LIB)
from core.audio.sfx import SR, add, bp, hp, lp, noise, env_exp, t_, whoosh, thump, norm, limit
from core.audio import sampler as S

F = json.load(open(os.path.join(D, 'film.json'))); DUR = F['dur']; N = int(DUR * SR)
BEAT = .5; rng = np.random.default_rng(7)
mus = np.zeros((N, 2)); drm = np.zeros((N, 2)); fx = np.zeros((N, 2))
hz = lambda m: 440 * 2 ** ((m - 69) / 12)
CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]   # Am F C G (MIDI)
ROOT = [45, 41, 48, 43]
def chord_at(t): return int(t // 4) % 4
def saw(f, d, det=0.0):
    tt = t_(d); ph = (f * (1 + det)) * tt; return 2 * (ph - np.floor(ph + .5))
def adsr(d, a=.005, dec=.1, s=.6, r=.1):
    n = len(t_(d)); e = np.ones(n) * s; na, nd, nr = int(a * SR), int(dec * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na) if na else e[:na]; e[na:na + nd] = np.linspace(1, s, len(e[na:na + nd]));
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e

# ── Dram ──
def kick(v=1.0):
    d = .45; tt = t_(d); f = 45 + 85 * np.exp(-tt / .035); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * env_exp(d, .16) + hp(noise(d), 3000) * env_exp(d, .004) * .25) * v
def clap(v=1.0):
    d = .3; x = np.zeros(len(t_(d)))
    for o in (0, .011, .022): n0 = int(o * SR); seg_ = bp(noise(d - o), 900, 5000) * env_exp(d - o, .012 if o < .02 else .09); x[n0:n0 + len(seg_)] += seg_
    return x * v * .7
def hat(open_=False, v=1.0):
    d = .18 if open_ else .05; return hp(noise(d), 7500) * env_exp(d, .06 if open_ else .012) * v * .5
kicks = []
for b in range(int(DUR / BEAT)):
    t = b * BEAT; full = (4 <= t < 28) or (32 <= t < 40)
    if full:
        add(drm, kick(1), t, .9); kicks.append(t)
        if b % 2 == 1: add(drm, clap(1), t, .55, .05)
    if full or 2 <= t < 4 or 28 <= t < 31:
        add(drm, hat(False, .8), t + .25, .35, .25); add(drm, hat(False, .5), t + .125, .2, -.25) if full else None
        if full and b % 4 == 3: add(drm, hat(True, .7), t + .25, .3, .3)
for k in range(16): add(drm, clap(.5 + k / 24), 31 + k * .0625, .35 + k * .02, 0)   # gulungan sebelum drop
add(drm, kick(1.2), 40, 1.0); kicks.append(40)

# ── Sidechain (pam) ──
sc = np.ones(N)
for t in kicks:
    n0 = int(t * SR); n1 = min(N, n0 + int(.35 * SR)); tt = np.arange(n1 - n0) / SR; sc[n0:n1] = np.minimum(sc[n0:n1], 1 - .65 * np.exp(-tt / .11))

# ── Bes (lapan) ──
for b in range(int(DUR / .25)):
    t = b * .25; full = (4 <= t < 28) or (32 <= t < 40)
    if not full or b % 2 == 0 and False: continue
    if b % 2 == 0: continue   # luar rentak: bes "off-beat" (pada &)
    f = hz(ROOT[chord_at(t)] - 12 + 12 * (t >= 32)); d = .22
    s = lp(saw(f, d) + .5 * saw(f, d, .004), 380 + 300 * (t >= 32)) * adsr(d, .003, .08, .7, .05)
    add(mus, s, t, .55, 0)
for t0 in (40,):
    f = hz(ROOT[0] - 12); d = 4.5; add(mus, lp(saw(f, d) + saw(f, d, .005), 260) * env_exp(d, 1.6), t0, .7)

# ── Pad (gergaji ditala lari, penapis lembut) ──
for c in range(12):
    t0 = c * 4.0; d = 4.0 if t0 < 40 else 5.0
    if t0 >= 45: break
    notes = CH[chord_at(t0)]; sig = np.zeros(len(t_(d)))
    for m in notes:
        for det in (-.006, 0, .007): sig += saw(hz(m), d, det)
    cut = 900 if t0 < 4 else 1500 if t0 < 28 else 700 if t0 < 32 else 2200 if t0 < 40 else 1200
    sig = lp(sig, cut) * adsr(d, .4, .5, .8, .6) / 9
    add(mus, sig, t0, .5 if t0 < 40 else .65, 0)

# ── Arpeggio (enam belas, pluck) ──
arp = np.zeros((N, 2))
for b in range(int(DUR / .125)):
    t = b * .125
    if 40 <= t and b % 4: continue
    if t >= 44: break
    ch = CH[chord_at(t)]; pat = [0, 1, 2, 1, 2, 0, 1, 2]; m = ch[pat[b % 8]] + 12 + (12 if (b // 8) % 2 and t >= 4 else 0)
    d = .2; s = (saw(hz(m), d) * .6 + np.sign(np.sin(2 * np.pi * hz(m) * t_(d))) * .4)
    cut = 900 + 2600 * min(1, t / 4) if t < 4 else 3200 if t < 28 else 1200 + 3000 * ((t - 28) / 4) if t < 32 else 4200
    s = lp(s, min(cut, 7000)) * env_exp(d, .07)
    add(arp, s, t, .16 + .06 * (t >= 32), .35 if b % 2 else -.35)
mus += arp
# ── Stab drop (32–40): kord pada luar rentak ──
for b in range(16):
    t = 32 + b * .5 + .25; ch = CH[chord_at(t)]; d = .18; s = sum(saw(hz(m + 12), d) + saw(hz(m + 12), d, .008) for m in ch)
    add(mus, lp(s, 3500) * env_exp(d, .06) / 4, t, .28, .15 if b % 2 else -.15)
mus = S.room(mus.astype(np.float32), size=.55, mix=.18)[:N]
mus *= sc[:, None]

# ── Kesan bunyi ──
def riser(d, v=1.0):
    tt = t_(d); f = 200 * np.exp(np.log(30) * tt / d); ph = 2 * np.pi * np.cumsum(f) / SR
    nz = noise(d); out = np.zeros(len(tt)); blk = int(.05 * SR)
    for i in range(0, len(tt), blk): fc = 400 + 9000 * (i / len(tt)) ** 2; out[i:i + blk] = bp(nz[i:i + blk + 200], fc * .7, min(fc * 1.4, 20000))[:len(out[i:i + blk])]
    return (out * .6 + np.sin(ph) * .15) * (tt / d) ** 2 * v
def impact(v=1.0):
    d = 2.0; return (thump(1.0, 40)[:len(t_(d))] if len(thump(1.0, 40)) >= len(t_(d)) else np.pad(thump(1.0, 40), (0, len(t_(d)) - len(thump(1.0, 40))))) * v + lp(noise(d), 1800) * env_exp(d, .5) * .25 * v
def tick(v=1.0, f=2400):
    d = .03; tt = t_(d); return (hp(noise(d), 1800) * env_exp(d, .003) + np.sin(2 * np.pi * f * tt) * env_exp(d, .004) * .6) * v
def flick(v=1.0):
    d = .06; return hp(noise(d), 2500) * env_exp(d, .01) * v
def ding(v=1.0):
    d = 1.2; tt = t_(d); return (np.sin(2 * np.pi * 1760 * tt) + .4 * np.sin(2 * np.pi * 2640 * tt)) * env_exp(d, .35) * .4 * v
for c in [4, 8, 12, 16, 20, 24, 28, 32, 40]: add(fx, whoosh(.45, 1), c - .38, .45, 0)
for t, v in [(.5, .7), (4.35, .8), (8.3, .8), (12.3, .8), (16.35, .8), (24.5, .7), (28.5, .6), (30.0, .7), (32.15, 1.0), (40.0, 1.0)]: add(fx, impact(v), t, .5 * v)
add(fx, riser(4.0), 28.0, .55); add(fx, riser(1.2, .7), 38.8, .4)
r = np.random.default_rng(3)
for k in range(26): add(fx, flick(.8), .4 + k * .13 + r.random() * .05, .25, r.uniform(-.6, .6))
for k in range(17): add(fx, tick(.9, 2200 + k * 40), 20.6 + k * (2.6 / 17), .3, .1)
add(fx, ding(1), 23.2, .5)
for t in (40.85,): add(fx, whoosh(.3, 1), t, .4)

out = mus * .9 + drm * .85 + fx * .9
tail = int(.8 * SR); out[-tail:] *= np.linspace(1, 0, tail)[:, None]
out = np.stack([limit(out[:, c], .5) for c in range(2)], 1)
os.makedirs(os.path.join(D, 'out'), exist_ok=True)
sf.write(os.path.join(D, 'out/mix.wav'), out.astype(np.float32), SR)
print('mix', out.shape, 'peak', float(np.abs(out).max()))
