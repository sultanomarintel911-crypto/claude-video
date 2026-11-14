#!/usr/bin/env python3
"""Asingkan pesawat dari panel s5_p9: plat bersih (langit tanpa pesawat) + sprite pesawat beralfa."""
import os
import numpy as np
from PIL import Image, ImageFilter
from prep import upscale

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "public", "img")
p = Image.open(os.path.join(HERE, "..", "bahan", "scene5.webp")).convert("RGB").crop((1121, 658, 1665, 876))
a = np.asarray(p).astype(np.float32)
X0, X1, Y0, Y1 = 236, 448, 0, 68
reg = a[Y0:Y1, X0:X1]
sky = np.asarray(p.filter(ImageFilter.MedianFilter(21))).astype(np.float32)[Y0:Y1, X0:X1]
diff = np.abs(reg - sky).sum(-1)
mx, mn = reg.max(-1), reg.min(-1)
sat = (mx - mn) / (mx + 1)
m = (diff > 45) | ((sat < 0.2) & (mx > 175))
mask = np.zeros(a.shape[:2], np.uint8)
mask[Y0:Y1, X0:X1] = m * 255
mimg = Image.fromarray(mask).filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.MaxFilter(3))
# plat bersih dahulu, kemudian topeng = beza asal vs plat bersih
big = mimg.filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(3))
fill = p
for _ in range(12):
    fill = Image.composite(fill.filter(ImageFilter.GaussianBlur(8)), p, big.point(lambda v: 255 if v > 10 else 0))
clean = Image.composite(fill, p, big)
d = np.abs(a - np.asarray(clean).astype(np.float32)).sum(-1)
m2 = np.zeros_like(mask)
m2[Y0:Y1, X0:X1] = ((d[Y0:Y1, X0:X1] > 70) * 255).astype(np.uint8)
mimg2 = Image.fromarray(m2).filter(ImageFilter.MedianFilter(3))
alpha = mimg2.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7)).filter(ImageFilter.GaussianBlur(0.7))
spr = p.convert("RGBA")
spr.putalpha(alpha)
spr = spr.crop((X0, Y0, X1, Y1))
spr = spr.resize((spr.width * 6, spr.height * 6), Image.LANCZOS)
spr.save(os.path.join(OUT, "s5_pesawat.png"))
upscale(clean).save(os.path.join(OUT, "s5_p9_bersih.jpg"), quality=92)
print("ok", spr.size)
