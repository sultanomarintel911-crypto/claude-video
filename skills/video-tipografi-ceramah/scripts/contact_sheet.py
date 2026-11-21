#!/usr/bin/env python3
"""Gabung still menegak jadi satu helaian untuk semakan visual.
Guna: python3 contact_sheet.py <stills_dir> <out.jpg> <frame> [<frame> ...]
(fail dijangka: <stills_dir>/s_<frame>.jpg)"""
import sys
from PIL import Image, ImageDraw
d0, out, fs = sys.argv[1], sys.argv[2], sys.argv[3:]
ims = [Image.open(f"{d0}/s_{f}.jpg").resize((360, 640)) for f in fs]
c = Image.new("RGB", (370 * len(ims), 660), "white"); dr = ImageDraw.Draw(c)
for i, (im, f) in enumerate(zip(ims, fs)):
    c.paste(im, (i * 370, 20)); dr.text((i * 370 + 5, 3), f, fill="black")
c.save(out)
