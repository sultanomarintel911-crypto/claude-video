#!/usr/bin/env python3
"""Sediakan bahan dari ../bahan ke public/ untuk Remotion.

- Ubah saiz gambar (lebih ringan untuk render)
- Potong latar belakang Thoriq (rembg) untuk babak pendedahan & siluet
- Latar kabur untuk babak petunjuk (wajah tak dapat dicam)
- Potong klip video & salin muzik
"""
import os
import subprocess

from PIL import Image, ImageFilter, ImageOps, ImageEnhance

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.normpath(os.path.join(HERE, "..", "..", "bahan"))
PUB = os.path.normpath(os.path.join(HERE, "..", "public"))
for d in ("img", "video", "audio", "sfx"):
    os.makedirs(os.path.join(PUB, d), exist_ok=True)


def load(name):
    return ImageOps.exif_transpose(Image.open(os.path.join(SRC, name))).convert("RGB")


def save_resized(name, out, long_edge=2560):
    im = load(name)
    im.thumbnail((long_edge, long_edge), Image.LANCZOS)
    im.save(os.path.join(PUB, "img", out), quality=90)
    print("img", out, im.size)
    return im


IMAGES = {
    "squash_match.jpg": "squash_match.jpg",
    "hitting_ball.jpg": "hitting_ball.jpg",
    "squash_court.jpg": "squash_court.jpg",
    "handball_team.jpg": "handball_team.jpg",
    "standing_confidently.jpg": "standing.jpg",
    "DSCF2100.jpg": "graduation.jpg",
    "gambar_kelas.png": "kelas.jpg",
    "DSCF0862.jpg": "sekolah.jpg",
    "IMG_20260404_135128.jpg": "koridor.jpg",
    "IMG_20260404_181928.jpg": "papan_skeso.jpg",
}
loaded = {out: save_resized(src, out) for src, out in IMAGES.items()}

# latar kabur untuk petunjuk (1920x1080, kabur kuat + gelap)
for out in ("koridor.jpg", "sekolah.jpg", "squash_match.jpg", "handball_team.jpg", "papan_skeso.jpg"):
    im = ImageOps.fit(loaded[out], (1920, 1080), Image.LANCZOS)
    im = im.resize((480, 270), Image.LANCZOS).filter(ImageFilter.GaussianBlur(9)).resize((1920, 1080), Image.BICUBIC)
    im = ImageEnhance.Brightness(im).enhance(0.55)
    im.save(os.path.join(PUB, "img", "blur_" + out), quality=88)

# logo
logo = Image.open(os.path.join(SRC, "logo_sekolah.png")).convert("RGBA")
logo = logo.crop(logo.getchannel("A").getbbox())
logo.thumbnail((900, 900), Image.LANCZOS)
logo.save(os.path.join(PUB, "img", "logo.png"))

# potongan latar (cutout)
from rembg import new_session, remove  # noqa: E402

sess = new_session("u2net_human_seg")
for src, out, crop in (
    ("DSCF2100.jpg", "cut_graduation.png", None),
    ("standing_confidently.jpg", "cut_standing.png", None),
):
    im = load(src)
    im.thumbnail((3000, 3000), Image.LANCZOS)
    cut = remove(im, session=sess, post_process_mask=True)
    bbox = cut.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
    cut = cut.crop(bbox)
    cut.save(os.path.join(PUB, "img", out))
    print("cutout", out, cut.size, "bbox", bbox, "src", im.size)


def ff(*args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args], check=True)


# video
# video asal ialah rakaman skrin: ikon 'play' bergerak dipadam bingkai demi bingkai
subprocess.run(["python3", os.path.join(HERE, "bersih_dron.py")], check=True)
ff("-ss", "45.0", "-to", "48.9", "-i", os.path.join(SRC, "pen_ket_pengawas.mp4"), "-an", "-c:v", "libx264", "-crf", "18",
   "-pix_fmt", "yuv420p", os.path.join(PUB, "video", "thoriq_pengawas.mp4"))

# muzik (normalisasi kekuatan bunyi)
for src, out in (("ticking_clock.mp3", "misteri.mp3"), ("triumph_of_the_spirit.mp3", "kemenangan.mp3")):
    ff("-i", os.path.join(SRC, src), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "-b:a", "256k",
       os.path.join(PUB, "audio", out))
print("siap")
