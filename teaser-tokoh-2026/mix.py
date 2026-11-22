"""Skor asal (sintesis numpy, 120 BPM, D minor) + foley HUD + dengung → out/mix.wav
Dibaca dari events.json (peristiwa gambar); garis masa sama dengan film.js. Jalankan: $LIB/.venv/bin/python mix.py"""
import json, os, sys
import numpy as np
import soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.environ.get('LIB', '/root/lemo-opuscar'), 'core/audio'))
import sfx as S
from sfx import SR, t_, env_exp, lp, hp, bp, noise, norm, add

EV = json.load(open(os.path.join(HERE, 'events.json')))
DUR = EV['dur']; E = EV['ev']
N = int((DUR + 0.5) * SR)
mus = np.zeros((N, 2)); fol = np.zeros((N, 2)); amb = np.zeros((N, 2))
BEAT, BAR = 0.5, 2.0
rng = np.random.default_rng(3)
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------- pemancar asas ----------
def adsr(d, a=.01, r=.08):
    e = np.ones(int(round(d * SR))); na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e
def saw(f, d, det=0.0, ph=0.0):
    tt = t_(d); return 2 * ((tt * f * (1 + det) + ph) % 1) - 1
def sq(f, d, pw=.5):
    tt = t_(d); return np.where((tt * f) % 1 < pw, 1.0, -1.0)
def sine(f, d): return np.sin(2 * np.pi * f * t_(d))

def supersaw(m, d, voices=5, spread=.012, cut=1800):
    x = sum(saw(mtof(m), d, (k - voices // 2) * spread / voices, rng.random()) for k in range(voices)) / voices
    return lp(x, cut, 2)

# ---------- akord: Dm(add9) – Gm7 – B♭maj7 – A7sus ----------
CH = [[50, 57, 62, 64, 65], [55, 58, 62, 65, 67], [58, 62, 65, 69, 70], [57, 62, 64, 67, 69]]
ROOT = [38, 43, 46, 45]
ARP = [[62, 65, 69, 74], [62, 67, 70, 74], [62, 65, 70, 74], [61, 64, 69, 73]]
def chord_at(t): return int(t // BAR) % 4

def pad(t0, t1, gain, cut=1400, wide=0.35):
    for b in np.arange(t0, t1, BAR):
        d = min(BAR, t1 - b) + 0.25; ci = chord_at(b)
        for j, m in enumerate(CH[ci]):
            if m < 48: continue
            x = supersaw(m, d, 5, .014, cut) * adsr(d, .25, .3)
            add(mus, x, b, gain * .18, (j / 4 - .5) * 2 * wide)

def arp(t0, t1, step, gain, oct=0, cut=3000):
    i = 0
    for s in np.arange(t0, t1 - 1e-6, step):
        n = ARP[chord_at(s)][i % 4] + 12 * oct; i += 1
        d = min(step * .9, .22)
        x = lp(sq(mtof(n), d, .3) * .6 + saw(mtof(n), d) * .4, cut) * env_exp(d, .07)
        x = x - bp(x, 1000, 4000) * .5            # dikerok 1–4 kHz
        pan = -.45 if i % 2 else .45
        add(mus, x, s, gain, pan)
        add(mus, x * .35, s + .375, gain, -pan)   # lengah ping-pong 3/16
        add(mus, x * .15, s + .75, gain, pan)

def bass(t0, t1, gain):
    for s in np.arange(t0, t1 - 1e-6, BEAT / 2):
        f = mtof(ROOT[chord_at(s)]); d = .22
        x = (sine(f, d) + .35 * sine(2 * f, d) + .18 * sine(3 * f, d)) * adsr(d, .004, .05)   # harmonik 2 & 3 untuk pembesar suara kecil
        add(mus, x, s, gain)

def kick(t, g=1.0):
    d = .35; tt = t_(d); f = 45 + 110 * np.exp(-tt * 40)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, .12) + hp(noise(d), 3000) * env_exp(d, .002) * .3
    add(mus, hp(x, 35), t, g * .6)
def hat(t, g=1.0):
    d = .06; add(mus, hp(noise(d), 7000) * env_exp(d, .012), t, g * .22, .3)
def clap(t, g=1.0):
    d = .18; x = bp(noise(d), 900, 2600) * (env_exp(d, .03) + np.pad(env_exp(d - .012, .025), (int(.012 * SR), 0))[:int(round(d * SR))] * .7)
    add(mus, x, t, g * .32, -.15)

# ---------- susunan ----------
pad(0, 30.0, 0.8, cut=900)                    # pembuka: pad sahaja, gelap
arp(4, 14, BEAT / 4, .10)                     # 16th masuk bar 2
bass(8, 26, .16)
for s in np.arange(8, 26, 1.0): kick(s, .7)
for s in np.arange(14, 26, BEAT): hat(s + .25)
for s in np.arange(18, 26, BAR / 2): clap(s + .5)
arp(14, 22, BEAT / 4, .11, 0, 4200); arp(22, 26, BEAT / 4, .10, 1, 5200)   # naik satu oktaf pada bukti 4
arp(26, 28, BEAT / 2, .09); arp(28, 29.5, BEAT, .08)                        # nyahpecutan: 8th → 4th
kick(26, .6); kick(28, .5)                    # separuh tempo
x = sine(mtof(69), 4.0) * adsr(4.0, 1.5, .05) * (1 + .3 * sine(5, 4.0)); add(mus, x, 26, .05)   # nada tunggal tegang
# DROP pada 32.0: gelinciran 808 + kord saw lebar 7 suara
d = 3.0; tt = t_(d); f = mtof(38) * (1 + 1.0 * np.exp(-tt * 8))
add(mus, np.tanh(1.6 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * env_exp(d, 1.2), 32.0, .42)
for j, m in enumerate([50, 57, 62, 65, 69, 74, 76]):
    x = supersaw(m, 6.2, 7, .02, 3200) * adsr(6.2, .02, 1.2)
    add(mus, x, 32.0, .1, (j / 6 - .5) * 1.6)
pad(32, 41, 0.9, cut=2200, wide=.6)
arp(34, 38, BEAT / 4, .1, 1, 5200)
bass(32, 38, .15)
for s in np.arange(32, 38, 1.0): kick(s, .75)
for s in np.arange(32, 38, BEAT): hat(s + .25, 1.1)
for s in np.arange(32, 38, BAR / 2): clap(s + .5)
arp(38, 40, BEAT / 2, .07, 1, 4000); arp(40, 41, BEAT, .05, 1, 3000)        # arpeggio dibuang nota demi nota
x = supersaw(50, 6.0, 5, .014, 900) * adsr(6.0, .4, 3.5); add(mus, x, 39.0, .22)   # nada pad panjang yang reput
# ---------- dengung projektor (40/80/120 Hz) + bunyi bilik ----------
tt = t_(DUR + .5)
hum = (np.sin(2 * np.pi * 40 * tt) * .5 + np.sin(2 * np.pi * 80 * tt) * .35 + np.sin(2 * np.pi * 120 * tt) * .25 + .2 * np.sin(2 * np.pi * 240 * tt))
room = lp(noise(DUR + .5), 600) * .05
henv = np.clip(tt / .8, 0, 1) * np.clip((DUR - tt) / 3.0, 0, 1) * np.where(tt > 41, np.clip(1 - (tt - 41) / 3.5, .15, 1), 1)
amb[:, 0] = (hum + room) * henv * .04; amb[:, 1] = (hum + room[::-1]) * henv * .04

# ---------- foley (dari events.json) ----------
def blip(m, d=.06, g=1.0):
    return sine(mtof(m), d) * env_exp(d, d / 3) * g
def lock_snd():
    x = np.zeros(int(.4 * SR)); th = S.thump(1, 62); x[:len(th)] += th * .8
    c = S.clack(1.2, .5); x[:len(c)] += c[:len(x)]
    b1, b2 = blip(86, .07), blip(93, .09); x[int(.03 * SR):int(.03 * SR) + len(b1)] += b1 * .5; x[int(.1 * SR):int(.1 * SR) + len(b2)] += b2 * .5
    return x
def confirm_snd():
    d = .9; return (sine(mtof(86), d) + .7 * sine(mtof(93), d) + .5 * sine(mtof(100), d)) * env_exp(d, .25) * .4
def servo(d, up=True):
    tt = t_(d); f = (300 if up else 520) + (220 if up else -220) * tt / d
    x = bp(2 * ((np.cumsum(f) / SR) % 1) - 1, 300, 2500) * np.sin(np.pi * tt / d) ** .5
    return x * .5 + hp(noise(d), 2500) * env_exp(d, .05) * .25   # hembusan pneumatik
def glitch_snd(d=.13):
    x = noise(d); x = np.round(x * 4) / 4; return hp(x, 400) * .6 * (rng.random(len(x)) > .3)
def ticks(t0, d, rate=24, g=.12, m=98):
    for k in range(int(d * rate)): add(fol, blip(m + (k % 3), .012), t0 + k / rate, g, rng.uniform(-.3, .3))
def swell(d):
    tt = t_(d); return bp(noise(d), 2000, 9000) * np.sin(np.pi * tt / d) ** 2 * .4

for e in E:
    t, k = e['t'], e['type']
    if k == 'star_scan': add(fol, hp(noise(.45), 3000) * np.sin(np.pi * t_(.45) / .45) * .3, t, .5)
    elif k == 'scan':
        d = e['d']; tt = t_(d); f0 = 400 + 3000 * tt / d
        add(fol, bp(noise(d), 800, 6000) * np.sin(np.pi * tt / d) * .35 + np.sin(2 * np.pi * np.cumsum(f0) / SR) * .04, t, .7)
    elif k == 'lock': add(fol, lock_snd(), t, .9 if e.get('i', 0) >= 0 else .7)
    elif k == 'detect': add(fol, blip([74, 77, 81, 86][e['i'] % 4] + 12, .08), t, .35, (e['i'] - 1.5) * .3)
    elif k == 'type_line': [add(fol, S.step(.6), t + j * .045, .18, rng.uniform(-.2, .2)) for j in range(8)]
    elif k == 'roll': ticks(t, e['d'])
    elif k == 'confirm': add(fol, confirm_snd(), t, .7); add(fol, S.thump(1, 55), t, .4)
    elif k == 'confirm_small': add(fol, blip(93, .12, .8), t, .4)
    elif k == 'whip': add(fol, S.whoosh(.5), t, .55)
    elif k == 'explode': add(fol, servo(max(.3, e['d'])), t, .45)
    elif k == 'reassemble': add(fol, servo(.4, False), t, .3)
    elif k == 'dock': add(fol, S.click(1.4, .6), t, .35, -.3)
    elif k == 'pullback': add(fol, S.whoosh(1.2), t, .25)
    elif k == 'tick': add(fol, blip(86 + int(t * 4) % 5, .02), t, .2)
    elif k == 'ping': add(fol, blip([74, 77, 81, 86][e['i']] + 12, .12), t, .4, (e['i'] - 1.5) * .4)
    elif k == 'match99': add(fol, sine(mtof(93), .5) * adsr(.5, .02, .1) * .4, t, .5)
    elif k == 'nameroll': ticks(t, e['d'], 30, .14, 100)
    elif k == 'deny':
        d = .6; x = (sq(mtof(50), d, .5) + sq(mtof(49), d, .5)) * adsr(d, .005, .15)
        add(fol, lp(x, 1500) * .5, t, .45); add(fol, S.thump(1, 50), t, .4)
    elif k == 'glitch': add(fol, glitch_snd(e['d']), t, .5)
    elif k == 'ignite': add(fol, S.ignite(1), t, .7)
    elif k == 'wave': add(fol, swell(e['d']), t, .35)
    elif k == 'spin': add(fol, S.whoosh(e['d']), t, .2)
    elif k == 'panel_off': add(fol, S.click(.8, .5), t, .3); add(fol, blip(74, .1), t + .02, .2)
    elif k == 'powerdown':
        d = e['d']; tt = t_(d); f = 220 * np.exp(-tt * 1.2)
        add(fol, np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(d, 1.2) * .5, t, .35)

# ---------- campuran ----------
# senyap: 7.5–8.0 hampir senyap (hanya dengung), 30.0–30.5 senyap mutlak (tiada apa pun)
def gate(buf, a, b, level, fade=.01):
    i0, i1, nf = int(a * SR), int(b * SR), int(fade * SR)
    g = np.ones(len(buf)); g[i0:i1] = level
    g[max(0, i0 - nf):i0] = np.linspace(1, level, i0 - max(0, i0 - nf)); g[i1:i1 + nf] = np.linspace(level, 1, nf)
    buf *= g[:, None]
gate(mus, 7.5, 8.0, 0.0, .03); gate(fol, 7.5, 7.98, 0.0, .02)
for b in (mus, fol, amb): gate(b, 30.0, 30.5, 0.0, .02)
gate(mus, 30.5, 32.0, 0.0, .01)
out = mus * 1.0 + fol * 0.9 + amb
for c in range(2): out[:, c] = S.limit(out[:, c], .95)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out/mix.wav'), out.astype(np.float32), SR, subtype='FLOAT')
print('mix.wav', round(len(out) / SR, 2), 's, puncak', round(float(np.abs(out).max()), 3))
