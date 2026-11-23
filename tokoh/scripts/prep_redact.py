#!/usr/bin/env python3
"""Versi CLASSIFIED untuk gambar sebelum pendedahan (sembunyi jantina & identiti).

Dua gaya (digabung):
  bar  : bar hitam segi empat menutup subjek (bukan ikut bentuk badan supaya bentuk kepala/tudung tidak kelihatan),
         dengan 'tingkap bukti' berbingkai emas untuk pencapaian (pingat, nombor, buku...), cop merah CLASSIFIED.
  zum  : potong rapat pada bukti sahaja (tangan + objek), label EVIDENCE.

Output (public/v8/hidup):
  r_{key}.jpg      : asas (gambar jelas / dipotong)
  r_{key}_bar.png  : lapisan bar + cop + label (dihentak masuk ikut rentak dalam Remotion)
Koordinat dalam pecahan bingkai 1920x1080.
"""
import glob
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
H = os.path.normpath(os.path.join(HERE, "..", "public", "v8", "hidup"))
W_, H_ = 1920, 1080
CYAN, GOLD, RED = (127, 243, 255, 255), (255, 196, 64, 255), (230, 40, 50, 255)
_f = ([p for p in glob.glob("/usr/share/fonts/**/*Mono*Bold*.ttf", recursive=True)] or glob.glob("/usr/share/fonts/**/*.ttf", recursive=True))[0]


def F(s):
    return ImageFont.truetype(_f, s)


# key: (sumber jelas, bab, gaya, data)
#   bar: data = {"bar": [kotak...], "lubang": [(x0,y0,x1,y1,label)...], "pulih": [poligon piksel...]}
#   zum: data = {"crop": (x0,y0,x1,y1), "objek": "..."}
ITEMS = {
    "b01": ("b01", "BAB I", "bar", {"bar": [(0.27, 0.1, 0.76, 1.0)]}),
    "b02": ("b02", "BAB I", "bar", {"bar": [(0.35, 0.1, 0.69, 1.0)]}),
    "b03": ("b03", "BAB I", "bar", {"bar": [(0.32, 0.17, 0.72, 1.0)]}),
    "b04": ("b04", "BAB I", "bar", {"bar": [(0.19, 0.34, 0.71, 1.0)]}),
    "b05": ("b05", "BAB I", "bar", {"bar": [(0.24, 0.22, 0.77, 1.0)]}),
    "b06": ("b06", "BAB I", "bar", {"bar": [(0.36, 0.0, 0.58, 0.64)]}),
    "b07": ("b07", "BAB I", "bar", {"bar": [(0.32, 0.06, 0.63, 1.0)]}),
    "b08": ("b08", "BAB I", "bar", {"bar": [(0.3, 0.33, 0.65, 0.99)]}),
    "b09": ("b09", "BAB I", "bar", {"bar": [(0.14, 0.03, 0.8, 1.0)]}),
    "b10": ("b10", "BAB I", "bar", {"bar": [(0.37, 0.14, 0.67, 0.99)], "lubang": [(0.44, 0.5, 0.6, 0.66, "NO. 16")]}),
    "b11": ("b11", "BAB I", "bar", {"bar": [(0.32, 0.12, 0.7, 0.99)]}),
    "b12": ("b12", "BAB I", "bar", {"bar": [(0.27, 0.06, 0.83, 1.0)], "lubang": [(0.28, 0.5, 0.44, 0.78, "BACAAN")]}),
    "b13": ("b13", "BAB I", "bar", {"bar": [(0.24, 0.07, 0.8, 1.0)]}),
    "c01": ("u_c01", "BAB II", "bar", {"bar": [(0.04, 0.34, 0.83, 1.0)]}),
    "c02": ("u_c02", "BAB II", "bar", {"bar": [(0.32, 0.2, 0.63, 0.96)], "lubang": [(0.44, 0.45, 0.58, 0.74, "BUKU SAINS")]}),
    "c03": ("u_c03", "BAB II", "bar", {"bar": [(0.465, 0.27, 0.6, 0.86)]}),
    "c04": ("u_c04", "BAB II", "bar", {"bar": [(0.19, 0.4, 0.76, 1.0)]}),
    "c05": ("c05", "BAB II", "bar", {"bar": [(775 / W_, 105 / H_, 1175 / W_, 752 / H_)],
                                     "pulih": [[(935, 388), (1020, 388), (1062, 470), (1052, 560), (1040, 640), (1090, 660), (1095, 752),
                                                (885, 752), (888, 660), (935, 640), (905, 560), (890, 470)]]}),
    "c06": ("u_c06", "BAB II", "zum", {"crop": (0.25, 0.5, 0.75, 1.0), "objek": "TABLET · BACAAN"}),
    "d01": ("u_d01", "BAB III", "zum", {"crop": (0.27, 0.69, 0.55, 0.9675), "objek": "LUKISAN · WARNA"}),  # elak tag nama,
    "d02": ("u_d02", "BAB III", "bar", {"bar": [(0.2, 0.0, 0.66, 1.0)], "lubang": [(0.375, 0.62, 0.51, 0.86, "PINGAT")]}),
    "d03": ("u_d03", "BAB III", "bar", {"bar": [(0.415, 0.37, 0.56, 1.0)], "lubang": [(0.462, 0.57, 0.538, 0.705, "PINGAT")]}),
    "e01": ("u_e01", "BAB IV", "zum", {"crop": (0.25, 0.18, 0.56, 0.5), "objek": "JAMBANGAN · ANUGERAH"}),  # elak nama pada sijil,
}


def cop(d_img, cx, cy, size):
    f = F(size)
    t = "CLASSIFIED"
    tw = int(ImageDraw.Draw(d_img).textlength(t, font=f))
    st = Image.new("RGBA", (tw + 30, size + 26), (0, 0, 0, 0))
    sd = ImageDraw.Draw(st)
    sd.rectangle([2, 2, st.width - 3, st.height - 3], outline=RED, width=max(3, size // 14))
    sd.text((15, 8), t, font=f, fill=RED)
    st = st.rotate(8, expand=True, resample=Image.BICUBIC)
    d_img.alpha_composite(st, (int(cx - st.width / 2), int(cy - st.height / 2)))


def hud(ov, no, bab, baris2):
    d = ImageDraw.Draw(ov)
    d.rectangle([50, 40, 760, 128], fill=(0, 0, 0, 140))
    d.text((66, 50), f"ARCHIVE {no:02d} · {bab}", font=F(34), fill=CYAN)
    d.text((66, 94), baris2, font=F(24), fill=(215, 215, 215, 255))


for no, (k, (src, bab, gaya, data)) in enumerate(ITEMS.items(), 1):
    im = Image.open(f"{H}/{src}.jpg").convert("RGB")
    ov = Image.new("RGBA", (W_, H_), (0, 0, 0, 0))
    if gaya == "bar":
        bd = ImageDraw.Draw(ov)
        rng = np.random.default_rng(no)
        big = None
        for (x0, y0, x1, y1) in data["bar"]:
            b = [int(x0 * W_), int(y0 * H_), int(x1 * W_), int(y1 * H_)]
            bd.rectangle(b, fill=(8, 8, 8, 252))
            for _ in range(36):  # tepi kasar seperti dakwat penapis
                yy = int(rng.integers(b[1], max(b[1] + 1, b[3])))
                hh = int(rng.integers(4, 20))
                bd.rectangle([b[0] - int(rng.integers(0, 9)), yy, b[0], yy + hh], fill=(8, 8, 8, 252))
                bd.rectangle([b[2], yy, b[2] + int(rng.integers(0, 9)), yy + hh], fill=(8, 8, 8, 252))
            if big is None or (b[2] - b[0]) * (b[3] - b[1]) > (big[2] - big[0]) * (big[3] - big[1]):
                big = b
        a = np.asarray(ov).copy()
        for poly in data.get("pulih", []):  # bahagian (kuda) di hadapan subjek: kekal kelihatan
            m = Image.new("L", (W_, H_), 0)
            ImageDraw.Draw(m).polygon(poly, fill=255)
            m = np.asarray(m.filter(ImageFilter.GaussianBlur(2))).astype(np.float32) / 255
            a[..., 3] = (a[..., 3] * (1 - m)).astype(np.uint8)
        for (x0, y0, x1, y1, lbl) in data.get("lubang", []):
            a[int(y0 * H_):int(y1 * H_), int(x0 * W_):int(x1 * W_)] = 0
        ov = Image.fromarray(a, "RGBA")
        d = ImageDraw.Draw(ov)
        for (x0, y0, x1, y1, lbl) in data.get("lubang", []):
            b = [int(x0 * W_), int(y0 * H_), int(x1 * W_), int(y1 * H_)]
            d.rectangle(b, outline=GOLD, width=4)
            ty = b[3] + 8 if b[3] + 44 < H_ else b[1] - 38
            d.rectangle([b[0], ty, b[0] + 22 + 15 * (len(lbl) + 10), ty + 34], fill=(0, 0, 0, 200))
            d.text((b[0] + 8, ty + 4), f"EVIDENCE: {lbl}", font=F(24), fill=GOLD)
        bw = big[2] - big[0]
        cop(ov, (big[0] + big[2]) / 2, big[1] + min(160, (big[3] - big[1]) * 0.2) + 30, int(np.clip(bw / 7.5, 26, 70)))
        hud(ov, no, bab, "SUBJECT: ████████  ·  IDENTITY WITHHELD")
        base = im
    else:
        x0, y0, x1, y1 = data["crop"]
        base = im.crop((int(x0 * W_), int(y0 * H_), int(x1 * W_), int(y1 * H_))).resize((W_, H_), Image.LANCZOS)
        base = base.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
        d = ImageDraw.Draw(ov)
        d.rectangle([40, 40, W_ - 40, H_ - 40], outline=CYAN, width=3)
        for (cx, cy) in ((40, 40), (W_ - 40, 40), (40, H_ - 40), (W_ - 40, H_ - 40)):
            d.rectangle([cx - 14, cy - 14, cx + 14, cy + 14], outline=CYAN, width=3)
        d.rectangle([70, 70, 900, 220], fill=(0, 0, 0, 150))
        d.text((90, 80), f"EVIDENCE {no:02d}", font=F(64), fill=CYAN)
        d.text((92, 160), f"{bab} · OBJECT: {data['objek']}", font=F(28), fill=(235, 235, 235, 255))
        d.text((92, 192), "SUBJECT: ████████", font=F(24), fill=(200, 200, 200, 255))
        cop(ov, W_ - 330, H_ - 150, 54)
    base.save(f"{H}/r_{k}.jpg", quality=92)
    ov.save(f"{H}/r_{k}_bar.png", compress_level=3)
    print(k, gaya)
