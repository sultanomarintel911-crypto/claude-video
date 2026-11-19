"""Geometri vektor untuk video Ar-Rum 30:54 (versi VectorCraft + EffectCraft).

Menjana senarai bentuk mengikut lapisan (setiap lapisan = satu PNG penuh 1080x1920 yang dieksport
oleh VectorCraft), dalam koordinat piksel. Algoritma pokok sama dengan src/v_030054.tsx.
Output: craft/build/geometri.json
"""
import json, math, os

W, H = 1080, 1920
GROUND = 1186
BASE = (540, GROUND - 6)
MAXD = 6


def mulberry32(seed):
    s = [seed & 0xFFFFFFFF]

    def r():
        s[0] = (s[0] + 0x6D2B79F5) & 0xFFFFFFFF
        t = s[0]
        t = ((t ^ (t >> 15)) * (1 | t)) & 0xFFFFFFFF
        t = (t + (((t ^ (t >> 7)) * (61 | t)) & 0xFFFFFFFF) ^ t) & 0xFFFFFFFF
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296

    return r


LEAF = ["#ec7a62", "#f59a7e", "#ffb48c", "#ff9f8a", "#e8836f"]
r = mulberry32(3054)
segs, leaves = [], []


def grow(x, y, ang, ln, w, d):
    x1, y1 = x + math.cos(ang) * ln, y + math.sin(ang) * ln
    segs.append(dict(x0=x, y0=y, x1=x1, y1=y1, d=d, w=w))
    if d >= 3:
        for t in (1, 0.55):
            leaves.append(dict(x=x + (x1 - x) * t + (r() - 0.5) * 26, y=y + (y1 - y) * t + (r() - 0.5) * 26,
                               r=15 + r() * 14 - d, d=d, c=LEAF[int(r() * len(LEAF))], fall=r() < 0.45, ph=r()))
    if d >= MAXD:
        return
    n = 3 if d >= 2 and r() < 0.35 else 2
    for i in range(n):
        sgn = [-1, 0, 1][i] if n == 3 else (1 if i else -1)
        spread = sgn * (0.32 + r() * 0.22)
        grow(x1, y1, ang + spread + (r() - 0.5) * 0.15, ln * (0.7 + r() * 0.1), w * 0.66, d + 1)


grow(BASE[0], BASE[1], -math.pi / 2, 215, 34, 0)


def capsule(s, wscale=1.0):
    """Cabang sebagai poligon tirus berhujung bulat (SVG path d)."""
    dx, dy = s["x1"] - s["x0"], s["y1"] - s["y0"]
    L = math.hypot(dx, dy) or 1
    nx, ny = -dy / L, dx / L
    w0 = max(1.6, s["w"] * wscale) / 2
    w1 = max(1.2, s["w"] * 0.66 * wscale) / 2
    p = lambda x, y: f"{x:.1f} {y:.1f}"
    return (f"M {p(s['x0'] + nx * w0, s['y0'] + ny * w0)} L {p(s['x1'] + nx * w1, s['y1'] + ny * w1)} "
            f"A {w1:.1f} {w1:.1f} 0 0 1 {p(s['x1'] - nx * w1, s['y1'] - ny * w1)} "
            f"L {p(s['x0'] - nx * w0, s['y0'] - ny * w0)} A {w0:.1f} {w0:.1f} 0 0 1 {p(s['x0'] + nx * w0, s['y0'] + ny * w0)} Z")


layers = {}
# cabang ikut kedalaman (untuk animasi tumbuh), warna batang siluet ungu
for d in range(MAXD + 1):
    layers[f"pokok_d{d}"] = [dict(kind="path", d=capsule(s), fill="#3a1a35") for s in segs if s["d"] == d]
# daun: kekal & gugur, versi berwarna & beruban
# daun gugur dipecah 6 kumpulan (ikut fasa rawak) supaya gugur berperingkat
groups = [("daun_kekal", [l for l in leaves if not l["fall"]])]
groups += [(f"daun_gugur{g}", [l for l in leaves if l["fall"] and int(l["ph"] * 6) == g]) for g in range(6)]
for name, ls in groups:
    layers[name] = [dict(kind="ellipse", cx=l["x"], cy=l["y"], rx=l["r"], ry=l["r"], fill=l["c"]) for l in ls]
    layers[name + "_uban"] = [dict(kind="ellipse", cx=l["x"], cy=l["y"], rx=l["r"], ry=l["r"], fill="#f6f1ec") for l in ls]

# langit & landskap (tema Subuh)
layers["langit"] = [dict(kind="rect", x=0, y=0, w=W, h=H, gradient=[(0, "#1d0f2e"), (0.3, "#6a2d5c"), (0.5, "#e3866f"), (0.6, "#f8c38c"), (1, "#2a1327")])]
rs = mulberry32(59)
layers["bintang"] = [dict(kind="ellipse", cx=rs() * W, cy=60 + rs() ** 1.6 * 560, rx=r0, ry=r0, fill="#fff4ea") for r0 in [1 + rs() * 1.6 for _ in range(34)]]
layers["matahari"] = [dict(kind="ellipse", cx=540, cy=GROUND - 120, rx=150, ry=150, fill="#ffe2b0", glow=True)]
layers["bukit_jauh"] = [dict(kind="path", fill="#a2506d", d=f"M0 {GROUND-120} C 200 {GROUND-190}, 420 {GROUND-120}, 620 {GROUND-160} S 940 {GROUND-200}, 1080 {GROUND-140} L1080 {H} L0 {H} Z")]
layers["bukit_tengah"] = [dict(kind="path", fill="#5e2a4d", d=f"M0 {GROUND-60} C 220 {GROUND-120}, 470 {GROUND-50}, 700 {GROUND-95} S 980 {GROUND-110}, 1080 {GROUND-70} L1080 {H} L0 {H} Z")]
layers["bukit_dekat"] = [dict(kind="path", fill="#2a1327", d=f"M0 {GROUND+10} C 300 {GROUND-30}, 720 {GROUND+6}, 1080 {GROUND-18} L1080 {H} L0 {H} Z")]
layers["awan"] = []
for (cy, w, x0) in ((430, 420, 220), (560, 300, 820), (700, 520, 300), (820, 260, 120), (930, 380, 860)):
    layers["awan"] += [dict(kind="rect", x=x0 - w / 2, y=cy, w=w, h=30, rx=15, fill="#f7b49a", opacity=0.5),
                       dict(kind="rect", x=x0 - w / 4, y=cy - 16, w=w * 0.45, h=30, rx=15, fill="#f7b49a", opacity=0.5)]

# benih & anak pokok
bx, by = BASE
layers["benih"] = [dict(kind="ellipse", cx=bx, cy=by - 6, rx=13, ry=9, fill="#7a4a3a", stroke="#ffc9a0", glow=True)]
s = 2.2
layers["anak_pokok"] = [
    dict(kind="path", fill="none", stroke="#8fae78", strokeWidth=5 * s, d=f"M {bx} {by-8} Q {bx+4*s} {by-8-40*s} {bx} {by-8-80*s}"),
    dict(kind="ellipse", cx=bx - 14 * s, cy=by - 8 - 78 * s, rx=16 * s, ry=7 * s, fill="#a8cf8a", rotate=-25),
    dict(kind="ellipse", cx=bx + 14 * s, cy=by - 8 - 84 * s, rx=16 * s, ry=7 * s, fill="#a8cf8a", rotate=25),
]

# bunga: 3 kumpulan (mekar berperingkat)
rf = mulberry32(54)
cols = ["#ffd1dc", "#ffb48c", "#f6e27a", "#c9a7ff", "#ffffff", "#ff8f8f", "#9fe0d0"]
flowers = []
for i in range(26):
    x = 50 + rf() * 980
    if abs(x - 540) < 110:
        x += -120 if x < 540 else 120
    flowers.append(dict(x=x, y=GROUND - 34 + rf() * 50, h=34 + rf() * 46, type=int(rf() * 3), c=cols[int(rf() * len(cols))], sc=0.8 + rf() * 0.5, i=i))
for g in range(3):
    shapes = []
    for f in flowers[g::3]:
        x, y, hh, sc = f["x"], f["y"], f["h"] * f["sc"], f["sc"]
        shapes.append(dict(kind="path", fill="none", stroke="#6b8f5e", strokeWidth=3 * sc, d=f"M {x:.1f} {y:.1f} Q {x:.1f} {y-hh/2:.1f} {x:.1f} {y-hh:.1f}"))
        hy = y - hh
        if f["type"] == 0:
            for k in range(6):
                a = k * math.pi / 3
                shapes.append(dict(kind="ellipse", cx=x + math.sin(a) * 9 * sc, cy=hy - math.cos(a) * 9 * sc, rx=5 * sc, ry=10 * sc, fill=f["c"], rotate=k * 60))
        elif f["type"] == 1:
            pts = [(-10, 0), (-11, -14), (-5, -8), (0, -18), (5, -8), (11, -14), (10, 0)]
            d = "M " + " L ".join(f"{x+px*sc:.1f} {hy+py*sc:.1f}" for px, py in pts) + f" Q {x:.1f} {hy+8*sc:.1f} {x-10*sc:.1f} {hy:.1f} Z"
            shapes.append(dict(kind="path", d=d, fill=f["c"]))
        else:
            for k in range(4):
                shapes.append(dict(kind="ellipse", cx=x + math.cos(k * 1.57) * 6 * sc, cy=hy + math.sin(k * 1.57) * 6 * sc, rx=7 * sc, ry=7 * sc, fill=f["c"]))
        if f["type"] != 1:
            shapes.append(dict(kind="ellipse", cx=x, cy=hy, rx=4.5 * sc, ry=4.5 * sc, fill="#ec7a62"))
    layers[f"bunga_{g}"] = shapes

os.makedirs(os.path.join(os.path.dirname(__file__), "build"), exist_ok=True)
out = os.path.join(os.path.dirname(__file__), "build", "geometri.json")
json.dump(dict(W=W, H=H, GROUND=GROUND, layers=layers), open(out, "w"))
print(out, {k: len(v) for k, v in layers.items()})
