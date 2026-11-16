#!/usr/bin/env python3
"""Bahan versi trailer (v8): klip Flow, muzik, VO prolog (dipecah ikut ayat), suara GB & gambar K.

Output -> public/v8/...
"""
import os
import shutil
import subprocess

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
B = os.path.normpath(os.path.join(HERE, "..", "..", "bahan"))
P = os.path.normpath(os.path.join(HERE, "..", "public", "v8"))
for d in ("flow", "aud", "muzik", "vo", "img"):
    os.makedirs(os.path.join(P, d), exist_ok=True)


def ff(*a):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *a], check=True)


COVER = "scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080"

# ---------------------------------------------------------------- klip Flow (video senyap + audio berasingan)
CLIPS = ["drones_rise_roof", "drones_taking_off", "drone_wall_opening", "to_the_basement", "lift_opens_basement",
         "man_walking_office", "woman_reading_hologram", "woman_touching_earpiece", "two_teachers_glowing",
         "teacher_wearing_headset", "visor_reflections", "teachers_invisible_a", "teachers_invisible_b",
         "hands_opening_box", "fingers_lifting_photo", "gb_pentas"]
for c in CLIPS:
    src = f"{B}/flow/{c}.mp4"
    ff("-i", src, "-an", "-vf", COVER, "-r", "30", "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", f"{P}/flow/{c}.mp4")
    ff("-i", src, "-vn", "-ac", "2", "-ar", "48000", f"{P}/aud/{c}.wav")
print("klip siap")

# ---------------------------------------------------------------- muzik (normalisasi)
MUZIK = {
    "videodrome": "videodrome.mp3",
    "midnight_breach": "the_midnight_breach.mp3",
    "princesses_heart": "the_princesses_heart.mp3",
    "shore_beyond_rain": "the_shore_beyond_the_rain.mp3",
    "sovereign_sky": "beneath_the_sovereign_sky.mp3",
    "taking_changes": "taking_in_the_changes.mp3",
    "top_morning": "top_of_the_morning.mp3",
}
for k, src in MUZIK.items():
    ff("-i", f"{B}/muzik/{src}", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "-b:a", "256k", f"{P}/muzik/{k}.mp3")
# The Last Strike (pendedahan) & The Clockwork Collapse (klimaks): normalisasi LINEAR 2 laluan
# supaya dinamik asal (senyap -> gah) kekal
import json  # noqa: E402


def norm_linear(src, dst):
    m = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    j = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
    ff("-i", src, "-af",
       f"loudnorm=I=-16:TP=-1.5:LRA=11:linear=true:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}",
       "-ar", "48000", "-b:a", "256k", dst)


norm_linear(f"{B}/muzik/the_last_strike.mp3", f"{P}/muzik/last_strike.mp3")
norm_linear(f"{B}/muzik/the_clockwork_collapse.mp3", f"{P}/muzik/clockwork_collapse.mp3")
print("muzik siap")

# ---------------------------------------------------------------- VO prolog: pecah ikut ayat (titik potong = tenaga paling rendah)
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", f"{B}/vo/vo_prolog_zain.mp3", "-ac", "1", "-ar", "48000", "-f", "s16le", "-"],
                     capture_output=True).stdout
a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
SR = 48000
env = np.convolve(np.abs(a), np.ones(int(0.03 * SR)) / int(0.03 * SR), "same")
approx = [0.0, 4.2, 8.5, 11.9, 16.9, 25.2, 28.5, len(a) / SR]  # sempadan ayat (dari transkripsi)
cuts = [0]
for t in approx[1:-1]:
    lo, hi = int((t - 0.45) * SR), int((t + 0.45) * SR)
    cuts.append(lo + int(np.argmin(env[lo:hi])))
cuts.append(len(a))
for i in range(len(cuts) - 1):
    seg = a[cuts[i]:cuts[i + 1]]
    # buang senyap di hujung
    nz = np.nonzero(np.abs(seg) > 0.01)[0]
    if len(nz):
        seg = seg[max(0, nz[0] - int(0.05 * SR)): nz[-1] + int(0.15 * SR)]
    pcm = (np.clip(seg, -1, 1) * 32767).astype(np.int16)
    tmp = f"{P}/vo/_P{i + 1}.raw"
    pcm.tofile(tmp)
    ff("-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", tmp, "-af", "loudnorm=I=-16:TP=-1.5", "-ar", "48000", f"{P}/vo/P{i + 1}.wav")
    os.remove(tmp)
    print(f"P{i + 1}: {len(seg) / SR:.2f}s")

# suara GB
for i in (1, 2, 3):
    ff("-i", f"{B}/gb/GB_0{i}.mp3", "-af", "loudnorm=I=-16:TP=-1.5", "-ar", "48000", f"{P}/vo/GB_0{i}.wav")
# GB_02 dipecah dua frasa supaya sama dengan gerak mulut dalam klip
ff("-i", f"{P}/vo/GB_02.wav", "-t", "1.8", f"{P}/vo/GB_02a.wav")
ff("-ss", "2.1", "-i", f"{P}/vo/GB_02.wav", f"{P}/vo/GB_02b.wav")

# gambar K
for k in ("K1", "K2", "K3", "K4"):
    ff("-i", f"{B}/gb/{k}.jpg", "-vf", "scale=2560:-2:flags=lanczos", "-q:v", "2", f"{P}/img/{k}.jpg")
print("siap")

# ---------------------------------------------------------------- butiran filem (grain) untuk lapisan FilmLook
import numpy as np  # noqa: E402
from PIL import Image  # noqa: E402
os.makedirs(f"{P}/grain", exist_ok=True)
rng = np.random.default_rng(35)
for k in range(8):
    n = rng.normal(0, 1, (540, 960)).astype(np.float32)
    n = (n - n.mean()) / n.std()
    Image.fromarray(np.clip(128 + n * 38, 0, 255).astype(np.uint8)).save(f"{P}/grain/g{k}.png")
print("grain siap")
