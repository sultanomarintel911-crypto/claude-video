#!/usr/bin/env python3
"""Babak 2 (MISI PK HEM): potong panel papan cerita -> public/img/s2_*.jpg"""
import os
from PIL import Image
from prep import upscale, kill_yellow

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "bahan", "scene2.webp")
OUT = os.path.join(HERE, "..", "public", "img")

sb = Image.open(SRC).convert("RGB")
PANELS = {
    "s2_p1_fail": (14, 100, 524, 402),
    "s2_p2_perhimpunan": (584, 100, 1086, 402),
    "s2_p3_kantin": (1148, 100, 1660, 402),
    "s2_p4_tandas": (14, 428, 524, 742),
    "s2_p5_kebajikan": (584, 428, 1086, 742),
    "s2_p6_pejabat": (1140, 428, 1660, 742),
}
MARKS = {
    "s2_p1_fail": (420, 50, 512, 135),
    "s2_p3_kantin": (305, 30, 392, 108),
    "s2_p6_pejabat": (365, 105, 470, 195),
}
for name, box in PANELS.items():
    p = sb.crop(box)
    if name in MARKS:
        p = kill_yellow(p, MARKS[name])
    upscale(p).save(os.path.join(OUT, name + ".jpg"), quality=92)
    print(name, p.size)
