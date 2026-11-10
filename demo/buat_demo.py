#!/usr/bin/env python3
"""Demo video Anugerah Tokoh Murid - SK Sultan Omar.

Semua visual (gambar contoh) dan bunyi dijana dengan kod.
Jalankan:  python3 demo/buat_demo.py
Hasil:     demo/demo_tokoh_murid.mp4
"""
import math
import os
import random
import subprocess
import wave

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "demo_tokoh_murid.mp4")
W, H, FPS, SR = 1280, 720, 25, 44100

# ------------------------------------------------------------------ KONFIGURASI
SEKOLAH = "SK SULTAN OMAR"
TAJUK = "ANUGERAH TOKOH MURID 2026"
NAMA = "ADAM HAKIMI BIN ISMAIL"  # nama rekaan untuk demo
KELAS = "6 BESTARI"
PETUNJUK = [
    "Dia seorang pemimpin yang disegani...",
    "Dia pernah menjuarai pidato peringkat negeri...",
    "Dia disayangi guru dan rakan-rakan...",
]
MONTAJ = ["Johan Pidato Peringkat Negeri", "Ketua Pengawas Sekolah"]

FONT_DIR = "/usr/share/fonts/opentype/inter/"


def font(name, size):
    return ImageFont.truetype(FONT_DIR + name, size)


F_XB = lambda s: font("Inter-ExtraBold.otf", s)
F_B = lambda s: font("Inter-Bold.otf", s)
F_M = lambda s: font("Inter-Medium.otf", s)

GOLD = (245, 195, 70)
rng = random.Random(7)


# ------------------------------------------------------------------ UTILITI
def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def prog(t, a, b):
    return clamp((t - a) / (b - a))


def ease_out(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def ease_io(x):
    x = clamp(x)
    return 3 * x * x - 2 * x * x * x


def lerp(a, b, p):
    return a + (b - a) * p


PAD = 30


def text_img(text, fnt, fill=(255, 255, 255), tracking=0):
    asc, desc = fnt.getmetrics()
    if tracking:
        w = sum(fnt.getlength(c) for c in text) + tracking * (len(text) - 1)
    else:
        w = fnt.getlength(text)
    img = Image.new("RGBA", (int(w) + 2 * PAD, asc + desc + 2 * PAD), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if tracking:
        x = PAD
        for c in text:
            d.text((x, PAD), c, font=fnt, fill=fill)
            x += fnt.getlength(c) + tracking
    else:
        d.text((PAD, PAD), text, font=fnt, fill=fill)
    return img


_grad = Image.new("RGB", (1, 5))
for i, c in enumerate([(255, 244, 190), (250, 205, 90), (205, 140, 35), (240, 185, 70), (255, 230, 150)]):
    _grad.putpixel((0, i), c)


def gold(img, glow=True):
    a = img.getchannel("A")
    g = _grad.resize(img.size, Image.BICUBIC).convert("RGBA")
    g.putalpha(a)
    if not glow:
        return g
    out = Image.new("RGBA", img.size, GOLD + (0,))
    out.putalpha(a.filter(ImageFilter.GaussianBlur(10)).point(lambda v: int(v * 0.6)))
    out.alpha_composite(g)
    return out


def with_alpha(layer, alpha):
    if alpha >= 0.999:
        return layer
    layer = layer.copy()
    layer.putalpha(layer.getchannel("A").point(lambda v: int(v * alpha)))
    return layer


def paste(base, layer, cx, cy, alpha=1.0, scale=1.0, left=False):
    if alpha <= 0.01:
        return
    if abs(scale - 1) > 1e-3:
        layer = layer.resize((max(1, int(layer.width * scale)), max(1, int(layer.height * scale))), Image.BILINEAR)
    layer = with_alpha(layer, alpha)
    x = cx - PAD if left else cx - layer.width / 2
    base.paste(layer, (int(round(x)), int(round(cy - layer.height / 2))), layer)


BLACK = Image.new("RGB", (W, H), (0, 0, 0))
WHITE = Image.new("RGB", (W, H), (255, 255, 255))


def fade(img, k):
    return img if k >= 0.999 else Image.blend(BLACK, img, clamp(k))


def radial(c_in, c_out, cx=0.5, cy=0.5, sx=1.0, sy=1.0, power=1.0):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.sqrt(((xx / W - cx) / sx) ** 2 + ((yy / H - cy) / sy) ** 2) * 2
    d = np.clip(d, 0, 1) ** power
    c = np.array(c_in, np.float32) * (1 - d[..., None]) + np.array(c_out, np.float32) * d[..., None]
    return Image.fromarray(c.astype(np.uint8))


def letterbox(img, h=48):
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, W, h), fill=(0, 0, 0))
    d.rectangle((0, H - h, W, H), fill=(0, 0, 0))


def kenburns(img, p, z0, z1, ax0=0, ay0=0, ax1=0, ay1=0):
    z = lerp(z0, z1, p)
    cw, ch = img.width / z, img.height / z
    cx = img.width / 2 + lerp(ax0, ax1, p) * (img.width - cw) / 2
    cy = img.height / 2 + lerp(ay0, ay1, p) * (img.height - ch) / 2
    return img.resize((W, H), Image.BILINEAR, box=(cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2))


# ------------------------------------------------------------------ GAMBAR CONTOH
def vgrad(size, top, bot):
    g = Image.new("RGB", (1, 2))
    g.putpixel((0, 0), top)
    g.putpixel((0, 1), bot)
    return g.resize(size, Image.BICUBIC)


def make_portrait():
    w, h = 560, 700
    img = vgrad((w, h), (55, 110, 180), (12, 28, 70))
    glow = Image.new("L", (w, h), 0)
    ImageDraw.Draw(glow).ellipse((60, 40, 500, 480), fill=120)
    img = Image.composite(Image.new("RGB", (w, h), (120, 170, 230)), img, glow.filter(ImageFilter.GaussianBlur(60)))
    mask = Image.new("L", (w, h), 0)
    d, m = ImageDraw.Draw(img), ImageDraw.Draw(mask)
    skin, skin2, hair = (226, 176, 134), (200, 150, 110), (28, 22, 18)
    shirt = (244, 244, 248)
    shapes = [
        ("poly", [(0, 700), (0, 610), (30, 545), (110, 492), (230, 452), (330, 452), (450, 492),
                  (530, 545), (560, 610), (560, 700)], shirt),  # baju (bahu menurun)
        ("ellipse", (10, 480, 230, 760), shirt),
        ("ellipse", (330, 480, 550, 760), shirt),
        ("poly", [(250, 335), (310, 335), (318, 462), (242, 462)], skin2),  # leher
        ("ellipse", (171, 248, 191, 300), skin2),  # telinga
        ("ellipse", (369, 248, 389, 300), skin2),
        ("ellipse", (174, 118, 386, 300), hair),  # rambut
    ]
    for i in range(9):  # tekstur rambut
        x = 186 + i * 21
        shapes.append(("poly", [(x, 160), (x + 13, 111 + (i % 3) * 4), (x + 30, 160)], hair))
    shapes.append(("ellipse", (182, 142, 378, 378), skin))  # muka
    for kind, box, col in shapes:
        {"ellipse": d.ellipse, "rect": d.rectangle, "poly": d.polygon}[kind](box, fill=col)
        {"ellipse": m.ellipse, "rect": m.rectangle, "poly": m.polygon}[kind](box, fill=255)
    d.chord((180, 128, 380, 290), 180, 360, fill=hair)
    d.ellipse((232, 262, 254, 282), fill=(35, 25, 20))
    d.ellipse((306, 262, 328, 282), fill=(35, 25, 20))
    d.arc((245, 295, 315, 345), 20, 160, fill=(150, 70, 60), width=5)
    d.polygon([(230, 430), (280, 470), (240, 520)], fill=(215, 215, 222))  # kolar
    d.polygon([(330, 430), (280, 470), (320, 520)], fill=(215, 215, 222))
    d.polygon([(270, 465), (290, 465), (302, 590), (280, 625), (258, 590)], fill=(25, 50, 130))  # tali leher
    d.ellipse((370, 520, 410, 560), fill=GOLD)  # lencana
    d.text((18, 14), "GAMBAR CONTOH", font=F_B(18), fill=(255, 255, 255))
    return img, mask


def star_pts(cx, cy, r1, r2, n=5, rot=-90):
    pts = []
    for i in range(n * 2):
        r = r1 if i % 2 == 0 else r2
        a = math.radians(rot + i * 180 / n)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def make_activity(i, label):
    pal = [((150, 40, 60), (40, 10, 30)), ((20, 110, 90), (5, 30, 40)),
           ((40, 60, 150), (10, 15, 50)), ((150, 90, 20), (40, 20, 5))][i]
    w, h = 1600, 900
    img = vgrad((w, h), pal[0], pal[1])
    d = ImageDraw.Draw(img, "RGBA")
    r = random.Random(i)
    for _ in range(14):
        x, y, s = r.randint(0, w), r.randint(0, h), r.randint(60, 260)
        d.ellipse((x - s, y - s, x + s, y + s), fill=(255, 255, 255, r.randint(10, 30)))
    cx, cy = 800, 420
    if i == 0:  # trofi
        d.polygon([(650, 230), (950, 230), (900, 470), (700, 470)], fill=GOLD)
        d.arc((560, 250, 700, 400), 90, 270, fill=GOLD, width=26)
        d.arc((900, 250, 1040, 400), 270, 90, fill=GOLD, width=26)
        d.rectangle((770, 470, 830, 580), fill=(220, 165, 50))
        d.rectangle((670, 580, 930, 640), fill=(200, 150, 40))
    elif i == 1:  # bintang
        d.polygon(star_pts(cx, cy, 240, 100), fill=GOLD)
    elif i == 2:  # pingat
        d.polygon([(700, 150), (780, 150), (830, 350), (750, 350)], fill=(200, 40, 50))
        d.polygon([(900, 150), (820, 150), (770, 350), (850, 350)], fill=(30, 80, 190))
        d.ellipse((650, 320, 950, 620), fill=GOLD)
        d.polygon(star_pts(cx, 470, 90, 38), fill=(210, 150, 40))
    else:  # mikrofon
        d.rounded_rectangle((720, 180, 880, 460), radius=80, fill=(210, 210, 220))
        d.arc((660, 300, 940, 560), 0, 180, fill=GOLD, width=22)
        d.rectangle((788, 560, 812, 660), fill=GOLD)
        d.rectangle((700, 660, 900, 690), fill=GOLD)
    d.text((40, 30), "GAMBAR CONTOH: " + label, font=F_B(34), fill=(255, 255, 255, 200))
    return img


# ------------------------------------------------------------------ ZARAH
class Confetti:
    COLS = [GOLD, (235, 70, 90), (70, 150, 255), (70, 210, 130), (255, 255, 255), (250, 130, 200)]

    def __init__(self, seed, burst=200, rain=120):
        r = random.Random(seed)
        self.p = []
        for k in range(burst):
            side = k % 2
            self.p.append(dict(mode=0, x0=-10 if side == 0 else W + 10, y0=H + 10,
                               vx=(1 if side == 0 else -1) * r.uniform(300, 1500), vy=-r.uniform(800, 1350),
                               **self._common(r)))
        for _ in range(rain):
            self.p.append(dict(mode=1, x0=r.uniform(0, W), y0=-r.uniform(10, 900), vx=0, vy=r.uniform(90, 170),
                               **self._common(r)))

    def _common(self, r):
        return dict(col=r.choice(self.COLS), w=r.uniform(8, 16), h=r.uniform(5, 10), rot=r.uniform(0, 6.28),
                    spin=r.uniform(-6, 6), ph=r.uniform(0, 6.28), fs=r.uniform(3, 8), sway=r.uniform(15, 40))

    def draw(self, img, t):
        d = ImageDraw.Draw(img)
        k, g = 2.5, 500
        for p in self.p:
            if p["mode"] == 0:
                e = 1 - math.exp(-k * t)
                x = p["x0"] + p["vx"] * e / k + p["sway"] * math.sin(p["ph"] + 4 * t) * (1 - math.exp(-t))
                y = p["y0"] + (g / k) * t + (p["vy"] - g / k) * e / k
            else:
                x = p["x0"] + p["sway"] * math.sin(p["ph"] + 2 * t)
                y = p["y0"] + p["vy"] * t
            if not (-20 < x < W + 20 and -20 < y < H + 20):
                continue
            a = p["rot"] + p["spin"] * t
            f = math.cos(p["ph"] + p["fs"] * t)
            ca, sa = math.cos(a), math.sin(a)
            hw, hh = p["w"] / 2, p["h"] / 2 * f
            pts = [(x + ca * hw * sx - sa * hh * sy, y + sa * hw * sx + ca * hh * sy)
                   for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
            s = 0.55 + 0.45 * abs(f)
            d.polygon(pts, fill=tuple(int(c * s) for c in p["col"]))


class Dust:
    def __init__(self, n=70, seed=3):
        r = random.Random(seed)
        self.p = [(r.uniform(0, W), r.uniform(0, H), r.uniform(-12, 12), r.uniform(-25, -6),
                   r.uniform(1, 3.2), r.uniform(0, 6.28)) for _ in range(n)]

    def draw(self, img, t, strength=1.0):
        d = ImageDraw.Draw(img)
        for x0, y0, vx, vy, s, ph in self.p:
            x, y = (x0 + vx * t) % W, (y0 + vy * t) % H
            b = (0.35 + 0.65 * (0.5 + 0.5 * math.sin(ph + 2 * t))) * strength
            d.ellipse((x - s, y - s, x + s, y + s), fill=tuple(int(c * b) for c in (255, 210, 120)))


def rays(cx, cy, angle, n=16, alpha=45):
    lay = Image.new("RGBA", (W // 2, H // 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    for i in range(n):
        a0 = math.radians(angle + i * 360 / n)
        a1 = a0 + math.radians(360 / n / 2.4)
        R = 900
        d.polygon([(cx / 2, cy / 2), (cx / 2 + R * math.cos(a0), cy / 2 + R * math.sin(a0)),
                   (cx / 2 + R * math.cos(a1), cy / 2 + R * math.sin(a1))], fill=(255, 210, 120, alpha))
    return lay.filter(ImageFilter.GaussianBlur(4)).resize((W, H), Image.BILINEAR)


def sparkle(img, t, pts):
    d = ImageDraw.Draw(img)
    for x, y, ph, sz in pts:
        s = max(0.0, math.sin(ph + t * 3.2)) ** 3 * sz
        if s > 1:
            d.polygon(star_pts(x, y, s, s * 0.22, n=4), fill=(255, 245, 210))


# ------------------------------------------------------------------ ASET
print("Menyediakan aset...")
PORT, PMASK = make_portrait()
ACTS = [make_activity(i, lbl) for i, lbl in enumerate(["Pertandingan", "Kepimpinan", "Anugerah", "Pidato"])]
ACTS_BLUR = [ImageEnhance.Brightness(a.filter(ImageFilter.GaussianBlur(16))).enhance(0.42) for a in ACTS]
VIG = radial((255, 255, 255), (95, 95, 95), sx=1.25, sy=1.25, power=2.2)
BG_DARK = radial((22, 26, 52), (2, 2, 8), power=0.9)
BG_REVEAL = radial((70, 40, 110), (8, 6, 22), cx=0.33, power=0.8)
SPOT = radial((70, 80, 110), (0, 0, 0), cy=0.05, sx=0.55, sy=1.6, power=0.7)
DUST = Dust()

# logo contoh
LOGO = Image.new("RGBA", (260, 260), (0, 0, 0, 0))
ld = ImageDraw.Draw(LOGO)
ld.ellipse((20, 20, 240, 240), fill=(18, 30, 80), outline=GOLD, width=9)
ld.ellipse((42, 42, 218, 218), outline=(245, 195, 70, 140), width=2)
ld.polygon(star_pts(130, 82, 26, 11), fill=GOLD)
ld.text((130, 150), "SKSO", font=F_XB(52), fill=GOLD, anchor="mm")
ld.text((130, 196), "LOGO CONTOH", font=F_B(13), fill=(220, 220, 230), anchor="mm")
LOGO_GLOW = Image.new("RGBA", LOGO.size, GOLD + (0,))
LOGO_GLOW.putalpha(LOGO.getchannel("A").filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * 0.5)))
LOGO_GLOW.alpha_composite(LOGO)

T_SEK = text_img(SEKOLAH, F_XB(58), tracking=6)
T_TAJ = gold(text_img(TAJUK, F_B(28), tracking=8))
T_PET = [gold(text_img(f"PETUNJUK {i + 1}", F_B(24), tracking=10), glow=False) for i in range(3)]
F_CLUE = F_M(44)
NUMS = {n: gold(text_img(str(n), F_XB(250))) for n in (1, 2, 3)}

# siluet (gaya lampu pentas dari belakang)
SW, SH, SP = 480, 600, 60
smask = PMASK.resize((SW, SH), Image.LANCZOS)
smask_p = Image.new("L", (SW + 2 * SP, SH + 2 * SP), 0)
smask_p.paste(smask, (SP, SP))
SMASK_SOFT = smask_p.filter(ImageFilter.GaussianBlur(1.2))
PORT_S = Image.new("RGB", smask_p.size, (0, 0, 0))
PORT_S.paste(PORT.resize((SW, SH), Image.LANCZOS), (SP, SP))
_edge = ImageChops.subtract(smask_p, smask_p.filter(ImageFilter.MinFilter(5))).filter(ImageFilter.GaussianBlur(1.4))
_topw = vgrad(smask_p.size, (255, 255, 255), (40, 40, 40)).convert("L")  # tepi atas lebih terang
RIM = Image.new("RGBA", smask_p.size, (255, 238, 205, 0))
RIM.putalpha(ImageChops.multiply(_edge, _topw).point(lambda v: min(255, int(v * 1.8))))
HALO = Image.new("RGBA", smask_p.size, (255, 205, 130, 0))
HALO.putalpha(ImageChops.multiply(smask_p.filter(ImageFilter.GaussianBlur(26)), _topw).point(lambda v: int(v * 0.95)))
BACKLIGHT = radial((235, 190, 135), (3, 5, 14), cy=0.45, sx=0.55, sy=0.75, power=0.55)
_fr = np.random.default_rng(9)
FOG = [Image.fromarray((_fr.random((10, 30)) * 255).astype(np.uint8)).resize((W * 2, H), Image.BICUBIC)
       .filter(ImageFilter.GaussianBlur(40)) for _ in range(2)]
FOG_COL = Image.new("RGB", (W, H), (150, 165, 205))
T_SIAPA = gold(text_img("SIAPAKAH DIA?", F_XB(56), tracking=8))

# potret berbingkai
FP = 40
pw, ph = 400, 500
FRAMED = Image.new("RGBA", (pw + 16 + 2 * FP, ph + 16 + 2 * FP), (0, 0, 0, 0))
fm = Image.new("L", FRAMED.size, 0)
ImageDraw.Draw(fm).rectangle((FP, FP, FP + pw + 15, FP + ph + 15), fill=255)
FRAMED = Image.new("RGBA", FRAMED.size, GOLD + (0,))
FRAMED.putalpha(fm.filter(ImageFilter.GaussianBlur(18)).point(lambda v: int(v * 0.8)))
FRAMED.paste(Image.new("RGBA", (pw + 16, ph + 16), GOLD + (255,)), (FP, FP))
FRAMED.paste(PORT.resize((pw, ph), Image.LANCZOS).convert("RGBA"), (FP + 8, FP + 8))

if " BINTI " in NAMA:
    a, b = NAMA.split(" BINTI ", 1)
    NAME_LINES = [a, "BINTI " + b]
elif " BIN " in NAMA:
    a, b = NAMA.split(" BIN ", 1)
    NAME_LINES = [a, "BIN " + b]
else:
    NAME_LINES = [NAMA]
T_NAME = [gold(text_img(s, F_XB(62))) for s in NAME_LINES]
T_LABEL = gold(text_img("TOKOH MURID 2026", F_B(24), tracking=8), glow=False)
T_KELAS = text_img(KELAS, F_B(36))
T_SEK2 = text_img(SEKOLAH, F_M(22), fill=(190, 190, 210), tracking=6)
T_TAHNIAH = gold(text_img("TAHNIAH!", F_XB(130), tracking=6))
T_NAMA_END = text_img(NAMA, F_B(36))
T_DARI = text_img("Daripada seluruh warga " + SEKOLAH.title().replace("Sk ", "SK "), F_M(24), fill=(200, 200, 215))
T_PENC = gold(text_img("PENCAPAIAN", F_B(20), tracking=8), glow=False)
T_MON = [text_img(s, F_B(42)) for s in MONTAJ]
BAND = Image.new("RGBA", (W, 220), (0, 0, 0, 0))
for y in range(220):
    ImageDraw.Draw(BAND).line((0, y, W, y), fill=(0, 0, 0, int(210 * (y / 220) ** 1.4)))

CONF1 = Confetti(11)
CONF2 = Confetti(23, burst=120, rain=140)
SPK = [(rng.uniform(150, 1150), rng.uniform(80, 650), rng.uniform(0, 6.28), rng.uniform(10, 22)) for _ in range(26)]

# ------------------------------------------------------------------ BABAK
CLUE_D = 2.9


def s_open(t, D):
    img = BG_DARK.copy()
    DUST.draw(img, t)
    p = ease_out(prog(t, 0.0, 1.1))
    paste(img, LOGO_GLOW, W / 2, 245, alpha=p, scale=0.85 + 0.15 * p)
    p1 = ease_out(prog(t, 0.9, 1.6))
    paste(img, T_SEK, W / 2, 430 + 20 * (1 - p1), alpha=p1)
    p2 = ease_out(prog(t, 1.6, 2.3))
    lw = 380 * p2
    ImageDraw.Draw(img).line((W / 2 - lw, 470, W / 2 + lw, 470), fill=GOLD, width=2)
    paste(img, T_TAJ, W / 2, 505, alpha=p2)
    return fade(img, prog(t, 0, 0.4) * (1 - prog(t, D - 0.4, D)))


def s_clues(t, D):
    k = min(2, int(t // CLUE_D))
    u = t - k * CLUE_D
    img = kenburns(ACTS_BLUR[k], u / CLUE_D, 1.05, 1.18, -0.5 + k * 0.5, 0, 0.3 - k * 0.3, 0.2)
    DUST.draw(img, t, 0.6)
    paste(img, T_PET[k], W / 2, 290, alpha=prog(u, 0.1, 0.4))
    txt = PETUNJUK[k]
    full = F_CLUE.getlength(txt)
    n = int(len(txt) * prog(u, 0.35, 1.7))
    shown = text_img(txt[:n], F_CLUE) if n else None
    x0 = (W - full) / 2
    if shown:
        paste(img, shown, x0, 370, left=True)
    if n < len(txt) or int(u * 3) % 2 == 0:
        cx = x0 + F_CLUE.getlength(txt[:n]) + 6
        ImageDraw.Draw(img).rectangle((cx, 345, cx + 3, 398), fill=GOLD)
    letterbox(img)
    return fade(img, prog(u, 0, 0.25) * (1 - prog(u, CLUE_D - 0.25, CLUE_D)))


def s_silhouette(t, D):
    breathe = 0.92 + 0.08 * math.sin(t * 2.2)
    img = ImageEnhance.Brightness(BACKLIGHT).enhance(breathe * lerp(0.6, 1.0, ease_out(t / 1.2)))
    r = rays(W / 2, 300, -90 + 8 * math.sin(t * 0.5), n=22, alpha=22)
    img.paste(r, (0, 0), r)
    for i, fog in enumerate(FOG):
        ox = int((t * (35 + 25 * i)) % W)
        fm = fog.crop((ox, 0, ox + W, H)).point(lambda v: int(max(0, v - 90) * 0.55))
        img.paste(FOG_COL, (0, 0), fm)
    DUST.draw(img, t, 0.9)
    q = ease_io(prog(t, 2.0, D))
    fig = PORT_S.filter(ImageFilter.GaussianBlur(lerp(7, 3.5, q)))
    fig = Image.blend(Image.new("RGB", fig.size, (4, 6, 16)), fig, lerp(0.05, 0.2, q)).convert("RGBA")
    fig.putalpha(SMASK_SOFT)
    lay = HALO.copy()
    lay.alpha_composite(fig)
    lay.alpha_composite(RIM)
    paste(img, lay, W / 2, 425, scale=1.0 + 0.06 * ease_io(t / D))
    paste(img, T_SIAPA, W / 2, 95, alpha=prog(t, 0.4, 1.0) * (0.8 + 0.2 * math.sin(t * 4)))
    letterbox(img)
    return fade(img, prog(t, 0, 0.3))


def s_count(t, D):
    n = 3 - min(2, int(t))
    u = t - int(t)
    beat = math.exp(-u * 6)
    img = ImageEnhance.Brightness(BG_DARK).enhance(1 + 0.8 * beat)
    d = ImageDraw.Draw(img)
    R = 190
    d.arc((W / 2 - R, H / 2 - R, W / 2 + R, H / 2 + R), -90, -90 + 360 * (1 - u), fill=GOLD, width=6)
    d.ellipse((W / 2 - R - 14, H / 2 - R - 14, W / 2 + R + 14, H / 2 + R + 14), outline=(80, 70, 50), width=1)
    sc = 1.6 - 0.6 * ease_out(u * 2.2)
    paste(img, NUMS[n], W / 2, H / 2 - 5, alpha=prog(u, 0, 0.12) * (1 - prog(u, 0.8, 1.0)), scale=sc)
    letterbox(img)
    a = 9 * beat
    return ImageChops.offset(img, int(rng.uniform(-a, a)), int(rng.uniform(-a, a)))


def s_reveal(t, D):
    mv = ease_io(prog(t, 1.3, 2.1))
    cx = lerp(W / 2, 420, mv)
    img = BG_REVEAL.copy()
    r = rays(cx, 360, t * 12)
    img.paste(r, (0, 0), r)
    sparkle(img, t, SPK)
    sc = 1.0 + 0.3 * (1 - ease_out(prog(t, 0, 0.9)))
    paste(img, FRAMED, cx, 360, scale=sc)
    p = [ease_out(prog(t, 1.9 + i * 0.25, 2.6 + i * 0.25)) for i in range(5)]
    rx = 945
    paste(img, T_LABEL, rx + 60 * (1 - p[0]), 205, alpha=p[0])
    for i, tl in enumerate(T_NAME):
        paste(img, tl, rx + 80 * (1 - p[1 + i]), 285 + i * 78, alpha=p[1 + i])
    y_div = 285 + len(T_NAME) * 78 - 15
    ImageDraw.Draw(img).line((rx - 220 * p[3], y_div, rx + 220 * p[3], y_div), fill=GOLD, width=2)
    paste(img, T_KELAS, rx + 60 * (1 - p[3]), y_div + 48, alpha=p[3])
    paste(img, T_SEK2, rx + 60 * (1 - p[4]), y_div + 98, alpha=p[4])
    CONF1.draw(img, t)
    flash = 1 - prog(t, 0, 0.55)
    if flash > 0:
        img = Image.blend(img, WHITE, flash)
    return img


def s_montage(t, D):
    half = D / len(MONTAJ)
    k = min(len(MONTAJ) - 1, int(t // half))
    u = t - k * half
    src = [ACTS[0], ACTS[2]][k]
    img = kenburns(src, u / half, 1.0 + 0.12 * k, 1.12 - 0.12 * k, -0.6, -0.3, 0.6, 0.3)
    img.paste(BAND, (0, H - 220), BAND)
    p = ease_out(prog(u, 0.2, 0.8))
    paste(img, T_PENC, 90, 560, alpha=p, left=True)
    paste(img, T_MON[k], 90 + 40 * (1 - p), 610, alpha=p, left=True)
    letterbox(img)
    if u < 0.3 and k > 0:
        img = Image.blend(WHITE, img, prog(u, 0, 0.3))
    return fade(img, prog(t, 0, 0.3))


def s_end(t, D):
    img = BG_REVEAL.copy()
    r = rays(W / 2, 330, t * 10, alpha=30)
    img.paste(r, (0, 0), r)
    sparkle(img, t + 3, SPK)
    p = ease_out(prog(t, 0, 0.6))
    sc = 0.6 + 0.4 * p + 0.06 * math.sin(clamp(t / 0.6) * math.pi)
    paste(img, T_TAHNIAH, W / 2, 300, alpha=p, scale=sc)
    p2 = ease_out(prog(t, 0.6, 1.2))
    paste(img, T_NAMA_END, W / 2, 425 + 20 * (1 - p2), alpha=p2)
    p3 = ease_out(prog(t, 1.0, 1.6))
    paste(img, T_DARI, W / 2, 480, alpha=p3)
    CONF2.draw(img, t)
    return fade(img, 1 - prog(t, D - 1.0, D))


SCENES = [(3.6, s_open), (CLUE_D * 3, s_clues), (5.0, s_silhouette), (3.0, s_count),
          (5.5, s_reveal), (4.4, s_montage), (3.6, s_end)]
STARTS = np.cumsum([0] + [d for d, _ in SCENES]).tolist()
TOTAL = STARTS[-1]


# ------------------------------------------------------------------ AUDIO
def build_audio(path):
    n_total = int(SR * (TOTAL + 0.5))
    buf = np.zeros(n_total)
    nr = np.random.default_rng(5)

    def tt(d):
        return np.arange(int(d * SR)) / SR

    def add(sig, t0, gain=1.0):
        i = int(t0 * SR)
        n = min(len(sig), n_total - i)
        if n > 0:
            buf[i:i + n] += sig[:n] * gain

    def lp(x, win):
        return np.convolve(x, np.ones(win) / win, "same")

    def hp_noise(d):
        x = nr.standard_normal(int(d * SR))
        return x - lp(x, 6)

    def boom(d, f0, f1, decay):
        t = tt(d)
        f = f1 + (f0 - f1) * np.exp(-t * 7)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * decay)

    def note(f, d, harm=6, att=0.08, rel=0.6):
        t = tt(d)
        vib = 1 + 0.003 * np.sin(2 * np.pi * 5 * t)
        s = sum(np.sin(2 * np.pi * f * k * t * vib) / k ** 1.4 for k in range(1, harm + 1))
        env = np.minimum(1, t / att) * np.minimum(1, (d - t) / rel)
        return s * env

    s_clue, s_sil, s_cnt, s_rev, s_mon, s_end = STARTS[1:7]

    # pad misteri
    pd = s_cnt
    t = tt(pd)
    pad = sum(np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 1.004 * t) for f in (110, 130.81, 164.81, 220))
    pad *= (0.7 + 0.3 * np.sin(2 * np.pi * 0.25 * t)) * np.minimum(1, t / 2.0) * np.minimum(1, (pd - t) / 0.4)
    add(pad, 0, 0.05)
    add(boom(2.5, 70, 40, 1.5), 0.0, 0.5)
    add(boom(1.5, 90, 50, 3), 0.9, 0.3)

    # petunjuk: whoosh + bunyi taip
    for k in range(3):
        t0 = s_clue + k * CLUE_D
        d = 0.7
        x = nr.standard_normal(int(d * SR))
        tw = tt(d)
        env = np.sin(np.pi * tw / d) ** 2
        add((lp(x, 30) * (1 - tw / d) + lp(x, 5) * (tw / d)) * env, t0 - 0.2, 0.5)
        n = len(PETUNJUK[k])
        for c in range(n):
            if PETUNJUK[k][c] != " ":
                add(hp_noise(0.012) * np.exp(-tt(0.012) * 350), t0 + 0.35 + 1.35 * c / n, 0.25)

    # degupan jantung
    for i in range(5):
        b = s_sil + 0.3 + i * 0.95
        add(boom(0.3, 95, 45, 16), b, 0.9)
        add(boom(0.3, 85, 42, 18), b + 0.24, 0.6)

    # kiraan detik + gendang
    for i in range(3):
        add(boom(0.8, 140, 45, 5), s_cnt + i, 0.9)
        add(hp_noise(0.02) * np.exp(-tt(0.02) * 150), s_cnt + i, 0.5)
    tr = s_cnt
    while tr < s_rev - 0.02:
        p = (tr - s_cnt) / 3
        add(hp_noise(0.05) * np.exp(-tt(0.05) * 70), tr, 0.06 + 0.3 * p)
        tr += lerp(0.14, 0.03, p)

    # pendedahan: hentakan + cymbal
    add(boom(1.6, 90, 32, 2.0), s_rev, 1.4)
    add(nr.standard_normal(int(0.3 * SR)) * np.exp(-tt(0.3) * 15), s_rev, 0.5)
    add(hp_noise(3.5) * np.exp(-tt(3.5) * 1.3), s_rev, 0.35)
    add(hp_noise(3.0) * np.exp(-tt(3.0) * 1.5), s_end, 0.25)

    # fanfare
    chords = [(s_rev, 2.75, (130.81, 261.63, 329.63, 392.0, 523.25)),
              (s_rev + 2.75, 2.75, (174.61, 349.23, 440.0, 523.25, 698.46)),
              (s_mon, 2.2, (196.0, 392.0, 493.88, 587.33)),
              (s_mon + 2.2, 2.2, (220.0, 440.0, 523.25, 659.25)),
              (s_end, TOTAL - s_end, (130.81, 261.63, 329.63, 392.0, 523.25, 783.99))]
    for t0, d, fs in chords:
        for f in fs:
            add(note(f, d + 0.25), t0, 0.045)
    for _ in range(26):
        t0 = nr.uniform(s_rev + 0.3, TOTAL - 1)
        f = nr.choice([1046.5, 1318.5, 1568.0, 2093.0, 2637.0])
        add(np.sin(2 * np.pi * f * tt(0.8)) * np.exp(-tt(0.8) * 6), t0, 0.05)

    t = np.arange(n_total) / SR
    buf *= np.clip((TOTAL - t) / 1.2, 0, 1)
    buf = np.tanh(buf * 1.3)
    buf = buf / (np.abs(buf).max() + 1e-9) * 0.9
    pcm = (buf * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(np.repeat(pcm, 2).tobytes())


# ------------------------------------------------------------------ RENDER
def main():
    audio = os.path.join(ROOT, "_audio.wav")
    print("Menjana audio...")
    build_audio(audio)
    nframes = int(TOTAL * FPS)
    print(f"Merender {nframes} bingkai ({TOTAL:.1f} saat)...")
    ff = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
         "-r", str(FPS), "-i", "-", "-i", audio, "-c:v", "libx264", "-preset", "medium", "-crf", "20",
         "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-shortest", OUT],
        stdin=subprocess.PIPE)
    si = 0
    for f in range(nframes):
        t = f / FPS
        while si < len(SCENES) - 1 and t >= STARTS[si + 1]:
            si += 1
        dur, fn = SCENES[si]
        img = fn(t - STARTS[si], dur)
        img = ImageChops.multiply(img, VIG)
        ff.stdin.write(img.tobytes())
        if f % 100 == 0:
            print(f"  {f}/{nframes}")
    ff.stdin.close()
    ff.wait()
    os.remove(audio)
    print("Siap:", OUT)


if __name__ == "__main__":
    main()
