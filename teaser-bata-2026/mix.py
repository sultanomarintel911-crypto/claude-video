"""Skor asal (sintesis numpy: glockenspiel, piano mainan, pizzicato, tepukan, tiupan brass, degupan jantung) + foley bata → out/mix.wav
120 BPM, C major. Muzik dipotong mati pada 32.0 (kepingan terhenti); 32–34 hanya bunyi bilik + jam; 34–38 degupan; kord akhir 40.
Jalankan: LIB=<pustaka> $LIB/.venv/bin/python mix.py   (perlukan events.json dari core/render/events.mjs)"""
import json, os, sys
import numpy as np
import soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.environ.get('LIB', '/root/lemo-opuscar'), 'core/audio'))
import sfx as S
from sfx import SR, t_, env_exp, lp, hp, bp, noise, norm, add

E = json.load(open(os.path.join(HERE, 'events.json')))['ev']
DUR = 45.0; N = int((DUR + .5) * SR)
mus = np.zeros((N, 2)); fol = np.zeros((N, 2)); amb = np.zeros((N, 2))
B = .5
rng = np.random.default_rng(4)
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)

def glock(m, d=1.2):   # bar logam: separa tak harmonik
    f = mtof(m); tt = t_(d)
    return sum(a * np.sin(2 * np.pi * f * r * tt) * env_exp(d, tau) for r, a, tau in [(1, 1, .5), (2.76, .35, .18), (5.4, .15, .07)]) * .5
def toypiano(m, d=.6):   # tine: fundamental + 'tink' tinggi
    f = mtof(m); tt = t_(d)
    return (np.sin(2 * np.pi * f * tt) * env_exp(d, .25) + .4 * np.sin(2 * np.pi * f * 4.1 * tt) * env_exp(d, .03)) * .5
def pizz(m, d=.35):    # Karplus–Strong ringkas
    f = mtof(m); n = int(SR / f); buf = rng.uniform(-1, 1, n); out = np.zeros(int(d * SR))
    for i in range(len(out)):
        out[i] = buf[i % n]; buf[i % n] = .5 * (buf[i % n] + buf[(i + 1) % n]) * .994
    return lp(out, 2500) * .6
def clap(t, g=1):
    d = .16; x = bp(noise(d), 900, 2600) * env_exp(d, .03); add(mus, x, t, .22 * g, .15)
def shaker(t, g=1):
    d = .07; add(mus, hp(noise(d), 6000) * env_exp(d, .015), t, .1 * g, -.3)
def brass(ms, t, d, g):   # tiupan: saw bertingkat, penapis membuka perlahan
    tt = t_(d)
    for j, m in enumerate(ms):
        f = mtof(m); x = sum(2 * ((tt * f * (1 + k * .004) + rng.random()) % 1) - 1 for k in range(-2, 3)) / 5
        x = lp(x, 900 + 1400 * min(1, d / 2)) * np.clip(tt / .5, 0, 1) * np.clip((d - tt) / .6, 0, 1)
        add(mus, x, t, g, (j / max(1, len(ms) - 1) - .5) * .8)
def heart(t, g=1):
    add(mus, S.heartbeat(1), t, .28 * g)

# progresi C – Am – F – G (satu akord sebar)
CH = [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]]
ROOT = [48, 45, 41, 43]
MEL = [72, 76, 79, 76, 74, 72, 74, 76, 77, 76, 74, 72, 71, 72, 74, 79]   # melodi glockenspiel 16 nota (setiap rentak)
ci = lambda t: int(t // 2) % 4
# 0–4: glockenspiel solo (melodi), lembut
for k in range(8): add(mus, glock(MEL[k % 16]), .0 + k * B, .22, .2)
# 4–28: + pizzicato bass, piano mainan, tepukan, shaker (lapisan ditambah setiap tingkat)
for s in np.arange(4, 28, B):
    k = int(s / B); add(mus, glock(MEL[k % 16], .9), s, .17, .2)
    add(mus, pizz(ROOT[ci(s)] + (12 if k % 2 else 0)), s, .45, -.1)
for s in np.arange(10, 28, B / 2): add(mus, toypiano(CH[ci(s)][int(s * 4) % 3] + 12, .4), s, .13, .35)
for s in np.arange(14, 28, 1.0): clap(s + .5)
for s in np.arange(4, 28, B / 2): shaker(s, .8 if s >= 14 else .5)
# 24–30: tiupan brass untuk skala (orbit)
brass([48, 55, 60, 64, 67], 24, 4.0, .07); brass([45, 52, 57, 60, 64], 28, 2.0, .06)
for s in np.arange(28, 32, B): add(mus, glock(MEL[int(s / B) % 16]), s, .2, .2); add(mus, pizz(ROOT[ci(s)]), s, .4, -.1)
# 32.0: potong mati. 34–38: degupan jantung (perlahan → cepat)
for s in [34.0, 34.9, 35.7, 36.4, 37.0, 37.5]: heart(s, .9)
# 38–45: satu nota glockenspiel + kord akhir lembut pada 40
add(mus, glock(84, 3.0), 38.0, .28, 0)
for j, m in enumerate([60, 64, 67, 72, 76]): add(mus, glock(m, 4.5), 40.0 + j * .06, .16, (j - 2) * .25)
brass([48, 55, 60, 64], 40.0, 4.8, .05)
# bunyi bilik + dengung peti sejuk jauh + jam berdetik semasa senyap
tt = t_(DUR + .5); room = lp(noise(DUR + .5), 500) * .04 + np.sin(2 * np.pi * 58 * tt) * .006
amb[:, 0] = room; amb[:, 1] = room[::-1]
for s in np.arange(32.0, 38.0, .5): add(amb, S.step(.4) * .6, s, .25 if int(s * 2) % 2 == 0 else .18, -.5)   # tik-tak

for e in E:
    t, k, v = e['t'], e['type'], e.get('v', 1)
    if k == 'click': add(fol, S.click(e.get('pitch', 1), 1), t, .55 * v, rng.uniform(-.3, .3))
    elif k == 'whoosh': add(fol, S.whoosh(.4), t, .3 * v, rng.uniform(-.4, .4))
    elif k == 'ding': add(fol, S.ding(1), t, .25 * v, 0)
    elif k == 'title': add(fol, S.pop(1), t, .3)
    elif k == 'creak': add(fol, S.creak(1), t, .4 * v)
    elif k == 'clack': add(fol, S.clack(.9, 1), t, .6 * v); add(fol, S.thump(1, 90), t, .25 * v)

# potong mati 32.0 (muzik sahaja); foley & bilik terus
i0 = int(32.0 * SR); mus[i0:int(34.0 * SR)] = 0; mus[i0 - 240:i0] *= np.linspace(1, 0, 240)[:, None]
fade = np.clip((DUR - t_(DUR + .5)) / .8, 0, 1)
out = (mus + fol + amb) * fade[:, None]
for c in range(2): out[:, c] = S.limit(out[:, c], .95)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out/mix.wav'), out.astype(np.float32), SR, subtype='FLOAT')
print('mix.wav', round(len(out) / SR, 2), 's')
