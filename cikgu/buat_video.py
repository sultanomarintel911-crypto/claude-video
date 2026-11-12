#!/usr/bin/env python3
"""Video penceritaan lucu: "0.5 Saat Sebelum KLIK!" (gambar kelas bersama cikgu).

Semua gerakan kamera, kapsyen, muzik dan kesan bunyi dijana dengan kod.
Gambar sumber (tidak disimpan dalam repo):  bahan/cikgu/kelas.jpg
Jalankan:  python3 cikgu/buat_video.py
Hasil:     cikgu/klik_cikgu.mp4
"""
import math
import os
import subprocess
import wave

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "..", "bahan", "cikgu", "kelas.jpg")
OUT = os.path.join(ROOT, "klik_cikgu.mp4")
WAV = os.path.join(ROOT, "_audio.wav")
W, H, FPS, SR = 1280, 720, 25, 44100
DUR = 62.0

# Koordinat dalam ruang gambar lebar 2000 px (gambar asal diskala).
REF_W = 2000
DUDUK_TUNDUK = [(558, 712), (694, 712), (843, 715), (972, 712), (1121, 715)]
CIKGU_KIRI = (395, 712)
CERMIN_HITAM = (1318, 718)
CIKGU_BERDIRI = (1638, 600)
TANGAN_KOT = (1640, 775)
KERUSI = [(1478, 905), (1688, 930)]
MURID_MATA = (1275, 630)
MURID_GARU = (1283, 540)
MURID_BERBUAL = (1075, 600)
MURID_KOLAR = (1822, 690)

FD = "/usr/share/fonts/opentype/inter/"
F_XB = lambda s: ImageFont.truetype(FD + "Inter-ExtraBold.otf", s)
F_B = lambda s: ImageFont.truetype(FD + "Inter-Bold.otf", s)
F_MI = lambda s: ImageFont.truetype(FD + "Inter-MediumItalic.otf", s)
F_SYM = lambda s: ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", s)

KUNING = (255, 214, 64)
MERAH = (235, 64, 52)


# ------------------------------------------------------------------ utiliti
def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def prog(t, a, b):
    return clamp((t - a) / (b - a))


def ease(x):
    x = clamp(x)
    return x * x * (3 - 2 * x)


def ease_out(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def back_out(x):  # sedikit "melantun" untuk label pop
    x = clamp(x)
    c = 2.2
    return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2


def lerp(a, b, k):
    return a + (b - a) * k


# ------------------------------------------------------------------ gambar sumber
BASE = Image.open(SRC).convert("RGB")
BASE.thumbnail((3600, 3600), Image.LANCZOS)
K = BASE.width / REF_W
IMG_H_REF = BASE.height / K


def kamera(cx, cy, lebar, shake=0.0, t=0.0):
    """Potong kawasan (ruang 2000 px) berpusat (cx,cy) selebar `lebar`."""
    lebar = min(lebar, REF_W)
    tinggi = lebar * H / W
    if tinggi > IMG_H_REF:
        tinggi = IMG_H_REF
        lebar = tinggi * W / H
    if shake:
        cx += shake * math.sin(t * 61) * lebar / 100
        cy += shake * math.cos(t * 47) * lebar / 100
    x0 = clamp(cx - lebar / 2, 0, REF_W - lebar)
    y0 = clamp(cy - tinggi / 2, 0, IMG_H_REF - tinggi)
    box = tuple(v * K for v in (x0, y0, x0 + lebar, y0 + tinggi))
    fr = BASE.transform((W, H), Image.EXTENT, box, Image.BICUBIC)
    return fr, (x0, y0, lebar / W)


def ke_skrin(p, geom):
    x0, y0, s = geom
    return ((p[0] - x0) / s, (p[1] - y0) / s)


def interp_cam(t, kunci):
    """kunci: senarai (masa, cx, cy, lebar). Interpolasi licin."""
    if t <= kunci[0][0]:
        return kunci[0][1:]
    for a, b in zip(kunci, kunci[1:]):
        if a[0] <= t <= b[0]:
            k = ease((t - a[0]) / (b[0] - a[0]))
            return tuple(lerp(a[i], b[i], k) for i in (1, 2, 3))
    return kunci[-1][1:]


# ------------------------------------------------------------------ grafik
def teks_bergaris(d, xy, s, f, isi=(255, 255, 255), garis=(0, 0, 0), sw=4, anchor="mm"):
    d.text(xy, s, font=f, fill=isi, stroke_width=sw, stroke_fill=garis, anchor=anchor)


def kapsyen(fr, baris, alfa=1.0, y=640, saiz=34):
    if alfa <= 0:
        return
    lap = Image.new("RGBA", fr.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lap)
    f = F_B(saiz)
    tinggi = len(baris) * (saiz + 12)
    lebar = max(d.textlength(b, font=f) for b in baris) + 56
    y0 = y - tinggi / 2 - 10
    d.rounded_rectangle((W / 2 - lebar / 2, y0, W / 2 + lebar / 2, y0 + tinggi + 20), 18, fill=(10, 10, 20, int(185 * alfa)))
    for i, b in enumerate(baris):
        warna = KUNING if b.startswith("“") or b.startswith('"') else (255, 255, 255)
        d.text((W / 2, y0 + 10 + (saiz + 12) * (i + 0.5)), b, font=f, fill=warna + (int(255 * alfa),), anchor="mm")
    fr.paste(lap, (0, 0), lap)


def label(fr, xy, s, t0, t, warna=KUNING, saiz=26, atas=True):
    """Label pop melantun di atas titik xy (koordinat skrin)."""
    k = prog(t, t0, t0 + 0.35)
    if k <= 0:
        return
    sk = max(0.05, back_out(k))
    f = F_XB(saiz)
    tmp = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    tw = int(tmp.textlength(s, font=f)) + 30
    th = saiz + 20
    tag = Image.new("RGBA", (tw, th + 14), (0, 0, 0, 0))
    d = ImageDraw.Draw(tag)
    d.rounded_rectangle((0, 0, tw - 1, th), 12, fill=warna + (255,), outline=(20, 20, 20, 255), width=3)
    d.polygon([(tw / 2 - 9, th - 1), (tw / 2 + 9, th - 1), (tw / 2, th + 13)], fill=(20, 20, 20, 255))
    d.text((tw / 2, th / 2), s, font=f, fill=(20, 20, 20), anchor="mm")
    tag = tag.resize((max(1, int(tw * sk)), max(1, int((th + 14) * sk))), Image.BICUBIC)
    x = int(xy[0] - tag.width / 2)
    y = int(xy[1] - tag.height - 6) if atas else int(xy[1] + 6)
    fr.paste(tag, (x, y), tag)


def anak_panah(fr, hujung, dari, t0, t, warna=KUNING, tebal=9):
    k = ease_out(prog(t, t0, t0 + 0.4))
    if k <= 0:
        return
    d = ImageDraw.Draw(fr)
    bob = 8 * math.sin((t - t0) * 9)
    ang = math.atan2(hujung[1] - dari[1], hujung[0] - dari[0])
    hx = hujung[0] - math.cos(ang) * bob
    hy = hujung[1] - math.sin(ang) * bob
    sx = lerp(hx, dari[0], k)
    sy = lerp(hy, dari[1], k)
    for w, c in ((tebal + 6, (20, 20, 20)), (tebal, warna)):
        d.line((sx, sy, hx, hy), fill=c, width=w)
        a = 26 + (w - tebal)
        p = [(hx + math.cos(ang) * 4, hy + math.sin(ang) * 4),
             (hx - math.cos(ang - 0.5) * a, hy - math.sin(ang - 0.5) * a),
             (hx - math.cos(ang + 0.5) * a, hy - math.sin(ang + 0.5) * a)]
        d.polygon(p, fill=c)


def bulatan(fr, xy, r, t0, t, warna=MERAH):
    k = ease_out(prog(t, t0, t0 + 0.5))
    if k <= 0:
        return
    d = ImageDraw.Draw(fr)
    a1 = -90 + 360 * k
    for w, c in ((10, (20, 20, 20)), (6, warna)):
        d.arc((xy[0] - r, xy[1] - r * 0.9, xy[0] + r, xy[1] + r * 0.9), -90, a1, fill=c, width=w)


def vinyet(fr, kuat=0.45):
    if not hasattr(vinyet, "m"):
        yy, xx = np.mgrid[0:H, 0:W]
        r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
        vinyet.m = np.clip(1 - (r - 0.7) * 0.8, 0, 1)[..., None]
    a = np.asarray(fr).astype(np.float32)
    m = 1 - (1 - vinyet.m) * kuat / 0.45 * 0.45
    return Image.fromarray(np.clip(a * m, 0, 255).astype(np.uint8))


def gelap(fr, k):
    if k <= 0:
        return fr
    return Image.blend(fr, Image.new("RGB", fr.size, (0, 0, 0)), clamp(k))


def kad_hitam(t, baris, t0, cps=22):
    fr = Image.new("RGB", (W, H), (12, 12, 16))
    d = ImageDraw.Draw(fr)
    n = int((t - t0) * cps)
    y = H / 2 - (len(baris) - 1) * 34
    for i, (s, f, c) in enumerate(baris):
        tunjuk = s[: max(0, n)]
        n -= len(s) + 6
        d.text((W / 2, y + i * 68), tunjuk, font=f, fill=c, anchor="mm")
    return fr


def bingkai_bintik(fr, t):  # kesan "beku" ala rakaman lama
    g = ImageEnhance.Color(fr).enhance(0.35)
    g = ImageEnhance.Contrast(g).enhance(1.15)
    a = np.asarray(g).astype(np.int16)
    a = a + np.array([18, 8, -10])  # rona sepia
    rng = np.random.default_rng(int(t * 25))
    a = a + rng.integers(-12, 12, size=(H, W, 1))
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


# ------------------------------------------------------------------ jalan cerita
# (masa_mula, masa_tamat, baris kapsyen)
KAPSYEN = [
    (5.0, 9.6, ["Hari bergambar kelas.", "Murid dah beratur, cikgu dah duduk."]),
    (9.8, 12.8, ["“Okey cikgu-cikgu, tangan atas lutut ya!”", "— jurugambar"]),
    (13.0, 19.6, ["Maka semua cikgu pun... semak lutut masing-masing.", "Serentak. Penuh dedikasi."]),
    (19.8, 24.8, ["Cikgu yang ini? Cermin mata hitam.", "Pandang mana pun, rahsia negara."]),
    (25.0, 27.4, ["Dan di hujung sana..."]),
    (28.2, 33.8, ["Kamera: “Satu... dua...”", "Cikgu: masih butangkan kot."]),
    (34.0, 40.0, ["Kerusi dah ada. Dua lagi tu.", "Tapi kot kena kemas dulu. Prinsip."]),
    (40.2, 42.0, ["Murid ni dah tak sanggup tengok."]),
    (42.0, 44.0, ["Yang ini pening kepala."]),
    (44.0, 46.0, ["“Kau nampak tak cikgu tu?”", "“Diam, nanti masuk gambar.”"]),
    (46.0, 48.0, ["Yang ini pula... ikut cikgu, betulkan kolar."]),
]

CAM = [
    (4.0, 1000, 640, 2000), (9.6, 1000, 660, 1650),
    (11.0, 760, 760, 1150), (13.0, 760, 770, 1150),
    (16.0, 800, 760, 1050), (19.0, 800, 760, 1100),
    (20.4, 1318, 718, 420), (24.6, 1300, 718, 360),
    (25.2, 1300, 718, 520), (27.4, 1640, 700, 700),
    (28.0, 1638, 690, 560), (33.6, 1638, 700, 500),
    (34.6, 1580, 790, 820), (40.0, 1580, 790, 760),
]

MONTAJ = [  # (mula, tamat, titik, lebar mula, lebar akhir)
    (40.0, 42.0, MURID_MATA, 380, 300),
    (42.0, 44.0, MURID_GARU, 380, 300),
    (44.0, 46.0, MURID_BERBUAL, 520, 440),
    (46.0, 48.0, MURID_KOLAR, 420, 340),
]


def adegan(t):
    # ---------- 0-4.4: kad pembuka
    if t < 4.4:
        fr = kad_hitam(t, [
            ("Hari Bergambar Kelas, 2026", F_XB(52), (255, 255, 255)),
            ("Sebuah kisah benar yang berlaku dalam 0.5 saat.", F_MI(30), KUNING),
        ], 0.3)
        return gelap(fr, prog(t, 3.9, 4.4))

    # ---------- 48-55: undur 3-2-1 & KLIK
    if 48.0 <= t < 55.0:
        fr, g = kamera(1000, 660, lerp(1650, 2000, ease(prog(t, 48, 49))))
        fr = vinyet(fr)
        d = ImageDraw.Draw(fr)
        for i, n in enumerate("321"):
            a = 49.0 + i * 1.0
            k = prog(t, a, a + 1.0)
            if 0 < k < 1:
                s = int(lerp(260, 170, ease_out(k)))
                teks_bergaris(d, (W / 2, H / 2 - 20), n, F_XB(s), isi=(255, 255, 255), sw=10)
        if t < 49.0:
            kapsyen(fr, ["Okey, semua... pandang sini!"], 1.0)
        if t >= 52.0:
            k = prog(t, 52.0, 52.7)
            fr = Image.blend(fr, Image.new("RGB", fr.size, (255, 255, 255)), 1 - k)
            d = ImageDraw.Draw(fr)
            if t > 52.15:
                teks_bergaris(d, (W / 2, H / 2), "KLIK!", F_XB(150), isi=MERAH, sw=10)
        return gelap(fr, prog(t, 54.4, 55.0))

    # ---------- 55-62: polaroid penutup
    if t >= 55.0:
        bg = Image.new("RGB", (W, H), (26, 32, 44))
        d = ImageDraw.Draw(bg)
        k = ease_out(prog(t, 55.0, 56.2))
        fr, _ = kamera(1000, 601, 2000)
        foto = fr.resize((760, 428), Image.LANCZOS)
        pol = Image.new("RGBA", (800, 540), (250, 248, 240, 255))
        pol.paste(foto, (20, 20))
        pd = ImageDraw.Draw(pol)
        pd.text((400, 495), "Hari Bergambar 2026  •  Tiada ulangan", font=F_MI(26), fill=(60, 60, 70), anchor="mm")
        ang = lerp(14, -3, k)
        pol = pol.rotate(ang, expand=True, resample=Image.BICUBIC)
        bayang = Image.new("RGBA", pol.size, (0, 0, 0, 0))
        bayang.paste((0, 0, 0, 120), (0, 0), pol.split()[3])
        bayang = bayang.filter(ImageFilter.GaussianBlur(14))
        cx, cy = W / 2, lerp(-300, 320, k)
        bg.paste(bayang, (int(cx - pol.width / 2 + 10), int(cy - pol.height / 2 + 16)), bayang)
        bg.paste(pol, (int(cx - pol.width / 2), int(cy - pol.height / 2)), pol)
        d = ImageDraw.Draw(bg)
        a = prog(t, 57.0, 58.0)
        if a > 0:
            c = tuple(int(v * a + 26 * (1 - a)) for v in (255, 255, 255))
            d.text((W / 2, 655), "Terima kasih, cikgu-cikgu!", font=F_XB(44), fill=c, anchor="mm")
            hs = 1 + 0.12 * math.sin(t * 7)
            hx = W / 2 + d.textlength("Terima kasih, cikgu-cikgu!", font=F_XB(44)) / 2 + 40
            d.text((hx, 652), "♥", font=F_SYM(int(46 * hs)), fill=tuple(int(v * a + 26 * (1 - a)) for v in MERAH), anchor="mm")
        return gelap(bg, prog(t, 61.2, 62.0))

    # ---------- 40-48: montaj reaksi murid
    for a, b, p, w0, w1 in MONTAJ:
        if a <= t < b:
            fr, g = kamera(p[0], p[1], lerp(w0, w1, ease(prog(t, a, b))))
            fr = vinyet(fr)
            # bingkai "tetingkap kamera"
            d = ImageDraw.Draw(fr)
            for (x, y, dx, dy) in ((40, 40, 1, 1), (W - 40, 40, -1, 1), (40, H - 40, 1, -1), (W - 40, H - 40, -1, -1)):
                d.line((x, y, x + 50 * dx, y), fill=(255, 255, 255), width=5)
                d.line((x, y, x, y + 50 * dy), fill=(255, 255, 255), width=5)
            if int(t * 2) % 2 == 0:
                d.ellipse((70, 62, 92, 84), fill=MERAH)
            d.text((104, 73), "REAKSI MURID", font=F_B(24), fill=(255, 255, 255), anchor="lm")
            break
    else:
        cx, cy, lw = interp_cam(t, CAM)
        # gegaran kecil ketika "rakaman berhenti"
        sh = 0.6 * (1 - prog(t, 27.6, 28.2)) if 27.6 <= t < 28.2 else 0
        fr, g = kamera(cx, cy, lw, shake=sh, t=t)
        if 27.6 <= t < 34.0:
            fr = bingkai_bintik(fr, t)
        fr = vinyet(fr)

    # ---------- lapisan grafik
    if 13.0 <= t < 19.8:
        for i, p in enumerate(DUDUK_TUNDUK):
            sp = ke_skrin((p[0], p[1] - 8), g)
            label(fr, sp, "LUTUT ✓" if False else "LUTUT OK", 13.6 + i * 0.55, t, saiz=22)
        if t >= 17.0:
            sp = ke_skrin((CIKGU_KIRI[0] + 40, CIKGU_KIRI[1] + 40), g)
            label(fr, sp, "YANG INI JE PANDANG KAMERA", 17.0, t, warna=(120, 230, 140), saiz=20, atas=False)
    if 20.4 <= t < 24.8:
        sp = ke_skrin((CERMIN_HITAM[0], CERMIN_HITAM[1] - 45), g)
        label(fr, sp, "MOD: SELEBRITI", 20.9, t, warna=(130, 200, 255), saiz=30)
    if 28.2 <= t < 34.0:
        d = ImageDraw.Draw(fr)
        k = back_out(prog(t, 28.2, 28.6))
        if k > 0:
            f = F_XB(int(58 * max(k, 0.05)))
            teks_bergaris(d, (W / 2, 70), "BEKU! Ini cikgu kita.", f, isi=KUNING, sw=6)
        sp = ke_skrin(TANGAN_KOT, g)
        bulatan(fr, sp, 95, 29.6, t)
        anak_panah(fr, (sp[0] + 95, sp[1] - 20), (sp[0] + 300, sp[1] - 170), 30.0, t, warna=MERAH)
        if t > 31.0:
            # meter "kekemasan kot"
            kk = ease_out(prog(t, 31.0, 33.0))
            d.rounded_rectangle((60, 170, 330, 300), 14, fill=(15, 15, 22))
            d.text((195, 198), "KEKEMASAN KOT", font=F_B(22), fill=(255, 255, 255), anchor="mm")
            d.rounded_rectangle((80, 225, 310, 255), 8, outline=(255, 255, 255), width=3)
            d.rounded_rectangle((84, 229, 84 + 222 * kk * 0.99, 251), 6, fill=(110, 220, 120))
            d.text((195, 280), f"{int(99 * kk)}% ... hampir", font=F_B(20), fill=KUNING, anchor="mm")
    if 34.6 <= t < 40.0:
        for i, p in enumerate(KERUSI):
            sp = ke_skrin(p, g)
            anak_panah(fr, (sp[0], sp[1] - 30), (sp[0] - 60 + 120 * i, sp[1] - 230), 35.0 + i * 0.6, t)
            label(fr, (sp[0] - 60 + 120 * i, sp[1] - 236), f"KOSONG #{i + 1}", 35.0 + i * 0.6, t, saiz=22)
        if t > 36.6:
            d = ImageDraw.Draw(fr)
            k = back_out(prog(t, 36.6, 37.0))
            if k > 0:
                pan = Image.new("RGBA", (330, 120), (0, 0, 0, 0))
                pd = ImageDraw.Draw(pan)
                pd.rounded_rectangle((0, 0, 329, 119), 16, fill=(15, 15, 22, 235), outline=KUNING + (255,), width=3)
                pd.text((22, 34), "Kerusi kosong :  2", font=F_B(28), fill=(255, 255, 255), anchor="lm")
                pd.text((22, 84), "Cikgu duduk   :  0", font=F_B(28), fill=MERAH, anchor="lm")
                pan = pan.resize((max(1, int(330 * k)), max(1, int(120 * k))))
                fr.paste(pan, (int(W - 60 - pan.width), 60), pan)

    for a, b, baris in KAPSYEN:
        if a <= t < b:
            alfa = min(prog(t, a, a + 0.25), 1 - prog(t, b - 0.25, b))
            kapsyen(fr, baris, alfa)

    # potongan gelap pendek sebelum beku
    if 27.4 <= t < 27.6:
        fr = gelap(fr, 0.9)
    return gelap(fr, 1 - prog(t, 4.4, 5.0))


# ------------------------------------------------------------------ audio
rng = np.random.default_rng(12)


def tt(d):
    return np.arange(int(d * SR)) / SR


def filt(x, kind, f):
    return sosfilt(butter(4, f, btype=kind, fs=SR, output="sos"), x)


def nota(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def petik(f, d=0.6, terang=1.0, decay=5.0):  # bunyi petik ala ukulele/pizzicato
    t = tt(d)
    y = sum(np.sin(2 * np.pi * f * h * t) * (terang ** h) / h * np.exp(-t * decay * (1 + h * 0.6)) for h in range(1, 7))
    return y * np.minimum(1, t / 0.003)


def marimba(f, d=0.5):
    t = tt(d)
    return (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 30)) * np.exp(-t * 7) * np.minimum(1, t / 0.002)


def letak(buf, x, t0, g=1.0):
    i = int(t0 * SR)
    if i >= len(buf):
        return
    n = min(len(x), len(buf) - i)
    buf[i:i + n] += x[:n] * g


def muzik_ceria(buf, t0, t1, bpm=118):
    beat = 60 / bpm
    kord = [(60, 64, 67), (55, 59, 62), (57, 60, 64), (53, 57, 60)]  # C G Am F
    melodi = [72, 74, 76, 79, 76, 74, 72, 74, 71, 74, 79, 74, 69, 72, 76, 72, 69, 72, 77, 76, 72, 69, 65, 69]
    n = 0
    t = t0
    while t < t1 - 0.05:
        bar = int(n / 4) % 4
        k = kord[bar]
        # bes
        if n % 2 == 0:
            letak(buf, petik(nota(k[0] - 24), 0.5, 0.5, 4), t, 0.5)
        # strum di "and"
        for j, m in enumerate(k):
            letak(buf, petik(nota(m), 0.35, 0.7, 7), t + beat / 2 + j * 0.012, 0.13)
        # tepukan pada 2 & 4
        if n % 2 == 1:
            c = filt(rng.standard_normal(int(0.12 * SR)), "bandpass", [900, 3500]) * np.exp(-tt(0.12) * 40)
            letak(buf, c, t, 0.25)
        # melodi marimba (setiap separuh ketukan, kadang rehat)
        for h in range(2):
            idx = (n * 2 + h) % len(melodi)
            if (n * 2 + h) % 6 != 5:
                letak(buf, marimba(nota(melodi[idx])), t + h * beat / 2, 0.22)
        t += beat
        n += 1


def muzik_senyap(buf, t0, t1, bpm=100):  # pizzicato "berjinjit" (minor)
    beat = 60 / bpm
    jalan = [45, 52, 48, 52, 45, 52, 47, 52, 44, 52, 47, 52, 45, 52, 48, 51]
    atas = [69, None, 72, None, 71, None, 68, None, 69, 72, 76, 75, 74, None, 71, None]
    for i in range(int((t1 - t0) / (beat / 2))):
        t = t0 + i * beat / 2
        letak(buf, petik(nota(jalan[i % 16]), 0.25, 0.5, 14), t, 0.55)
        a = atas[i % 16]
        if a and (i // 16) % 2 == 1:
            letak(buf, petik(nota(a), 0.25, 0.6, 12), t, 0.2)
        if i % 4 == 2:
            c = filt(rng.standard_normal(int(0.05 * SR)), "highpass", 6000) * np.exp(-tt(0.05) * 80)
            letak(buf, c, t, 0.12)


def sfx_taip():
    d = 0.04
    return filt(rng.standard_normal(int(d * SR)), "bandpass", [1500, 6000]) * np.exp(-tt(d) * 150)


def sfx_boing(f0=180, f1=520):
    d = 0.45
    t = tt(d)
    f = f0 + (f1 - f0) * (1 - np.exp(-t * 14)) + 30 * np.sin(2 * np.pi * 14 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)


def sfx_kilau():
    out = np.zeros(int(0.9 * SR))
    for i, m in enumerate((84, 88, 91, 96)):
        letak(out, marimba(nota(m), 0.6), i * 0.07, 0.5)
    return out


def sfx_calar():  # piring hitam tergores
    d = 0.7
    t = tt(d)
    f = 900 * np.exp(-t * 3) + 200 + 400 * np.sin(2 * np.pi * 3 * t) ** 2
    n = rng.standard_normal(len(t))
    y = filt(n, "bandpass", [300, 4000]) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)))
    return y * np.exp(-t * 3) * 0.7


def sfx_whoosh(d=1.0):
    t = tt(d)
    n = rng.standard_normal(len(t))
    y = filt(n, "bandpass", [400, 3000]) * np.sin(np.pi * t / d) ** 2
    return y * 0.8


def sfx_ding(m=88):
    t = tt(1.2)
    return sum(np.sin(2 * np.pi * nota(m) * h * t) * np.exp(-t * (3 + h * 2)) / h for h in (1, 2.76, 5.4))


def sfx_tik():
    d = 0.08
    t = tt(d)
    return (np.sin(2 * np.pi * 1800 * t) + filt(rng.standard_normal(len(t)), "highpass", 3000) * 0.5) * np.exp(-t * 90)


def sfx_rentak_dram(d):
    t = tt(d)
    n = filt(rng.standard_normal(len(t)), "bandpass", [150, 2500])
    mod = 0.6 + 0.4 * (np.sin(2 * np.pi * 22 * t) > 0)
    return n * mod * (t / d) ** 1.4


def sfx_klik():
    out = np.zeros(int(1.2 * SR))
    for t0, f in ((0.0, [2000, 8000]), (0.09, [1200, 6000])):
        c = filt(rng.standard_normal(int(0.06 * SR)), "bandpass", f) * np.exp(-tt(0.06) * 70)
        letak(out, c, t0, 1.0)
    # desingan flash mengecas
    t = tt(1.0)
    w = np.sin(2 * np.pi * np.cumsum(3000 + 5000 * t) / SR) * np.exp(-t * 3) * 0.06
    letak(out, w, 0.15)
    return out


def sfx_kord_akhir():
    t = tt(4.5)
    y = np.zeros(len(t))
    for i, m in enumerate((60, 64, 67, 72, 76)):
        letak(y, petik(nota(m), 4.5, 0.8, 0.9), i * 0.06, 0.35)
    return y


def bina_audio():
    buf = np.zeros(int(DUR * SR))
    # taip pada kad pembuka
    for i in range(70):
        tc = 0.3 + i / 22
        if tc < 3.6:
            letak(buf, sfx_taip(), tc + rng.uniform(0, 0.01), 0.25)
    muzik_ceria(buf, 4.6, 27.4)
    letak(buf, sfx_kilau(), 9.8, 0.4)
    for i in range(5):
        letak(buf, sfx_boing(170 + i * 25, 480 + i * 40), 13.6 + i * 0.55, 0.35)
    letak(buf, sfx_ding(91), 17.0, 0.25)
    letak(buf, sfx_kilau(), 20.9, 0.5)
    letak(buf, sfx_whoosh(1.4), 25.6, 0.45)
    letak(buf, sfx_calar(), 27.35, 0.9)
    muzik_senyap(buf, 28.4, 48.0)
    letak(buf, sfx_boing(260, 140), 29.6, 0.3)
    letak(buf, sfx_ding(84), 35.0, 0.3)
    letak(buf, sfx_ding(88), 35.6, 0.3)
    letak(buf, sfx_boing(400, 120), 36.6, 0.35)
    for tc in (40.0, 42.0, 44.0, 46.0):
        letak(buf, sfx_whoosh(0.35), tc - 0.15, 0.3)
    letak(buf, sfx_rentak_dram(3.0), 49.0, 0.35)
    for i in range(3):
        letak(buf, sfx_tik(), 49.0 + i, 0.6)
    letak(buf, sfx_klik(), 52.0, 0.9)
    letak(buf, sfx_kord_akhir(), 55.4, 0.8)
    letak(buf, sfx_kilau(), 57.0, 0.35)
    # fade keseluruhan & normalisasi
    buf *= np.minimum(1, (DUR - tt(DUR)) / 1.5)
    buf = np.tanh(buf / (np.abs(buf).max() + 1e-9) * 1.3) * 0.85
    st = np.stack([buf, buf], axis=1)
    with wave.open(WAV, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())


# ------------------------------------------------------------------ render
def main():
    bina_audio()
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
           "-r", str(FPS), "-i", "-", "-i", WAV, "-c:v", "libx264", "-preset", "medium", "-crf", "19",
           "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", OUT]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    n = int(DUR * FPS)
    for i in range(n):
        t = i / FPS
        p.stdin.write(adegan(t).convert("RGB").tobytes())
        if i % 250 == 0:
            print(f"  {t:5.1f}s / {DUR:.0f}s", flush=True)
    p.stdin.close()
    p.wait()
    os.remove(WAV)
    print("siap:", OUT)


if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "--cuba":  # pratonton bingkai
        S = sys.argv[2]
        for ts in sys.argv[3:]:
            adegan(float(ts)).save(os.path.join(S, f"f_{ts}.png"))
    else:
        main()
