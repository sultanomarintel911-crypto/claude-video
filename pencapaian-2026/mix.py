"""Muzik asal comel (sintesis numpy: marimba, glockenspiel, ukulele petik, bass petik, kick lembut, tepukan, shaker)
+ kesan bunyi (whoosh, pop, ding, letupan konfeti, kilauan) diselaraskan dengan main.js → out/mix.wav
106.67 BPM (rentak 0.5625 s, bar 2.25 s), C major. Jalankan: python3 mix.py"""
import os, json
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
TL = json.load(open(os.path.join(HERE, 'out/timeline.json')))   # dari: node tools/timeline.mjs
DUR = TL['DUR']; EV = TL['ev']; BIG = TL['big']; OUT = DUR - 9.0
SR = 44100; N = int((DUR + 1) * SR)
mus = np.zeros((N, 2)); sfx = np.zeros((N, 2))
rng = np.random.default_rng(3)
B = 60 / 106.6667; BAR = 4 * B
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
tt = lambda d: np.arange(int(d * SR)) / SR
envx = lambda d, tau: np.exp(-tt(d) / tau)
def add(buf, x, t, g=1., pan=0.):
    i = int(t * SR)
    if i >= len(buf) or i + len(x) <= 0: return
    x = x[: len(buf) - i]
    buf[i:i + len(x), 0] += x * g * np.sqrt((1 - pan) / 2) * 1.414
    buf[i:i + len(x), 1] += x * g * np.sqrt((1 + pan) / 2) * 1.414
def fband(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    m = 1 / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4); return np.fft.irfft(X * m, len(x))
noise = lambda d: rng.uniform(-1, 1, int(d * SR))
fade = lambda x, ms=4: x * np.minimum(1, np.arange(len(x))[::-1] / (ms * SR / 1000 + 1))

def marimba(m, d=.7):
    f = mtof(m); t = tt(d)
    return fade((np.sin(2*np.pi*f*t) * envx(d, .28) + .45*np.sin(2*np.pi*f*4*t) * envx(d, .05) + .2*np.sin(2*np.pi*f*10*t)*envx(d,.012)) * np.minimum(1, t*400))
def glock(m, d=1.4):
    f = mtof(m); t = tt(d)
    return fade(sum(a*np.sin(2*np.pi*f*r*t)*envx(d, tau) for r, a, tau in [(1,1,.6),(2.76,.3,.2),(5.4,.12,.07)]) * np.minimum(1, t*800))
def ks(m, d=.6, bright=.5, decay=.996):   # Karplus–Strong, blok demi blok
    f = mtof(m); n = max(2, int(SR / f)); L = int(d * SR); y = np.zeros(L + n + 1)
    y[1:n+1] = fband(rng.uniform(-1, 1, n*8), 60, 2000 + 6000*bright)[:n]
    for k in range(1, L // n + 2):
        a, b = k*n + 1, min((k+1)*n + 1, len(y))
        if a >= len(y): break
        y[a:b] = decay * .5 * (y[a-n:b-n] + y[a-n-1:b-n-1])
    return fade(y[1:L+1])
def kick(): t = tt(.35); return np.sin(2*np.pi*(50*t + 70*(1-np.exp(-t*30))/30*1.0)) * envx(.35, .12) * .9
def clap():
    d = .2; x = fband(noise(d), 900, 3500)
    e = sum(np.exp(-np.maximum(0, tt(d)-o)/.012)*(tt(d) >= o) for o in (0, .011, .022)) * .5 + envx(d, .05)*(tt(d) > .03)
    return x * e
def shaker(): d = .06; return fband(noise(d), 6000, 15000) * envx(d, .015)
def whoosh(d=.7, up=True):
    t = tt(d); x = noise(d); env = np.sin(np.pi * t / d) ** 2
    lo = fband(x, 300, 1500); hi = fband(x, 2000, 7000); m = t / d if up else 1 - t / d
    return (lo * (1 - m) + hi * m) * env
def pop(m=84):
    d = .12; t = tt(d); f = mtof(m) * (1 + 1.5*np.exp(-t*60))
    return np.sin(2*np.pi*np.cumsum(f)/SR) * envx(d, .03)
def ding(m=96): return glock(m, 2.0)
def boom():   # pendaratan foto: hentakan lembut + sub
    d = .9; t = tt(d); return (np.sin(2*np.pi*(45*t + 40*(1-np.exp(-t*20))/20)) * envx(d, .25) + fband(noise(d), 100, 900)*envx(d,.05)*.5)
def confpop():
    d = 1.5; x = np.zeros(int(d*SR))
    for k in range(40):
        o = int(rng.uniform(0, .7)**2 * SR); s = fband(noise(.03), 2500, 9000) * envx(.03, .006)
        x[o:o+len(s)] += s * rng.uniform(.3, 1)
    return x
def sparkle(n=6, base=96):
    x = np.zeros(int(1.6*SR))
    for k in range(n):
        g = glock(base + [0, 4, 7, 12, 16, 19][k % 6], 1.0) * .5; o = int(k*.06*SR); x[o:o+len(g)] += g[:len(x)-o]
    return x

# ---------------- MUZIK ----------------
CH = [[60,64,67],[57,60,64],[53,57,60],[55,59,62]]; ROOT = [36,33,29,31]
SCALE = [60,62,64,67,69,72,74,76,79]
def chord_at(t): return int((t % (4*BAR)) // BAR)
# motif melodi (8 per bar, -1 = rehat) bergilir ikut bar
MOT = [[4,-1,5,4,2,-1,3,-1],[2,3,4,-1,5,4,3,2],[0,-1,2,3,4,-1,2,-1],[3,4,5,-1,6,5,4,-1]]
def fit(i, ch):   # tarik nota ke ton akord terdekat pada rentak kuat
    m = SCALE[i]; cands = [c + 12*o for c in ch for o in (0,1)]
    return min(cands, key=lambda c: abs(c - m))
intro_end = 2.25
# 0–2.25: kilauan glock solo + pad lembut
for k, m in enumerate([72, 76, 79, 84, 79, 76, 79, 84]): add(mus, glock(m, 1.4), .15 + k*B/2, .16, .3*np.sin(k))
t = intro_end
while t < DUR - 1.2:
    bar = int(round((t - intro_end) / BAR)); c = chord_at(t - intro_end); ch = CH[c]
    big = t >= OUT or any(a - .1 <= t < b for a, b in BIG)   # anugerah klimaks + penutup: lapisan tambahan
    for e in range(8):
        s = t + e*B/2; mi = MOT[bar % 4][e]
        if mi >= 0:
            m = fit(mi, ch) if e % 2 == 0 else SCALE[mi]
            add(mus, marimba(m + 12, .6), s, .2, -.25)
            if big: add(mus, glock(m + 12, .9), s, .07, .35)
        # ukulele: corak petik D-DU-UDU
        if e in (0, 2, 3, 5, 6, 7):
            for j, n in enumerate(ch + [ch[0]+12]):
                add(mus, ks(n + (12 if j < 3 else 0), .5, .6), s + j*.012*(1 if e % 2 == 0 else -1) + .03, .09 if e % 2 == 0 else .06, .25)
        add(mus, shaker(), s, .06 if e % 2 else .1, .4)
    for q in range(4):
        s = t + q*B
        if q in (0, 2): add(mus, kick(), s, .5)
        if q in (1, 3): add(mus, clap(), s, .22, -.1)
        add(mus, ks(ROOT[c] + (12 if q % 2 else 0), .45, .25, .993), s, .35, 0)
    t += BAR
# akord akhir
for j, m in enumerate([48, 60, 64, 67, 72, 76, 79, 84]): add(mus, glock(m, 3.5) if m > 70 else ks(m, 3, .5, .9995), DUR - 1.4 + j*.03, .14, (j/7-.5)*.6)
add(mus, kick(), DUR - 1.4, .5)

# ---------------- KESAN BUNYI (dari garis masa yang sama dengan main.js) ----------------
duck = np.ones(N)
for e in EV:
    t, k = e['t'], e['k']
    if k == 'flyin': add(sfx, whoosh(2.0, True), t, .35)
    elif k == 'letters':
        for j in range(min(e['n'], 16)): add(sfx, pop(76 + (j * 3) % 14 + 3), t + j * e['st'], .16, (j / max(1, e['n'] - 1) - .5))
    elif k == 'pop': add(sfx, pop(e['m']), t, .28)
    elif k == 'sparkle': add(sfx, sparkle(), t, .22)
    elif k == 'whooshOut': add(sfx, whoosh(.6, False), t, .3)
    elif k == 'heroHit': add(sfx, boom(), t, .5); add(sfx, ding(91), t, .3); add(sfx, sparkle(6, 91), t + .2, .25)
    elif k == 'cardFly': add(sfx, whoosh(.75, True), t, .5)
    elif k == 'land':
        big = e['fx'] != 'mid'
        add(sfx, boom(), t, .7 if big else .45); add(sfx, ding(100 if e['fx'] == 'gold' else 96), t, .35 if big else .25)
        if big: add(sfx, confpop(), t + .03, .35)
        add(sfx, sparkle(), t + .35, .2); add(sfx, sparkle(6, 100), t + .55, .1)
        a_ = int(t * SR); d = np.linspace(.55 if big else .75, 1, int(.6 * SR)); duck[a_:a_ + len(d)] *= d[:max(0, N - a_)]
    elif k == 'flip': add(sfx, whoosh(.6, False), t, .35)
    elif k == 'confettiExtra': add(sfx, confpop(), t, .35); add(sfx, sparkle(6, 91), t, .25)
    elif k == 'confetti': add(sfx, confpop(), t, .3)
    elif k == 'ding': add(sfx, ding(96), t, .3)

mix = mus * duck[:, None] * .9 + sfx
mix[:int(.02*SR)] *= np.linspace(0, 1, int(.02*SR))[:, None]
mix = mix[:int(DUR*SR)]; mix[-int(.5*SR):] *= np.linspace(1, 0, int(.5*SR))[:, None]
mix = np.tanh(mix / max(1e-9, np.abs(mix).max()) * 1.3) * .9
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out/mix.wav'), mix.astype(np.float32), SR)
print('ok', DUR, 's')
