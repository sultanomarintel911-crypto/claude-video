#!/usr/bin/env python3
"""Babak 3, 4, 5: potong panel papan cerita -> public/img/s{3,4,5}_*.jpg"""
import os
from PIL import Image
from prep import upscale, kill_yellow

HERE = os.path.dirname(os.path.abspath(__file__))
BAHAN = os.path.join(HERE, "..", "bahan")
OUT = os.path.join(HERE, "..", "public", "img")

SCENES = {
    "scene3.webp": {
        "s3_p1_koridor": (14, 102, 536, 402),
        "s3_p2_tumbuk": (584, 102, 1092, 402),
        "s3_p3_guru": (1148, 102, 1660, 402),
        "s3_p4_sukan": (14, 426, 536, 652),
        "s3_p5_kad": (584, 426, 1092, 742),
        "s3_p6_cu": (1148, 426, 1660, 742),
    },
    "scene4.webp": {
        "s4_p1_lambai": (14, 100, 536, 408),
        "s4_p2_salam": (584, 100, 1086, 408),
        "s4_p3_pelukan": (1148, 100, 1662, 408),
        "s4_p4_pergi": (14, 428, 536, 756),
        "s4_p5_batu48": (584, 428, 1092, 756),
    },
    "scene5.webp": {
        "s5_p1_pintu": (6, 70, 553, 312),
        "s5_p2_wajah": (566, 70, 1108, 312),
        "s5_p3_airmata": (1121, 70, 1665, 312),
        "s5_p4_murid": (6, 377, 553, 592),
        "s5_p5_lambai": (566, 377, 1108, 592),
        "s5_p6_pesawat": (1121, 377, 1665, 592),
        "s5_p7_toleh": (6, 658, 553, 876),
        "s5_p8_tangga": (566, 658, 1108, 876),
        "s5_p9_berlepas": (1121, 658, 1665, 876),
    },
}
MARKS = {}

for src, panels in SCENES.items():
    sb = Image.open(os.path.join(BAHAN, src)).convert("RGB")
    for name, box in panels.items():
        p = sb.crop(box)
        if name in MARKS:
            p = kill_yellow(p, MARKS[name])
        upscale(p).save(os.path.join(OUT, name + ".jpg"), quality=92)
        print(name, p.size)
