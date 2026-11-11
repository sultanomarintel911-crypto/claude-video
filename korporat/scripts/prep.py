"""Sediakan bahan ke public/ daripada folder bahan (default: ../bahan_korporat).
Bahan asal (dari Google Drive): KORPORAT BARU 2026.mp4, SKESO APPS & E-LEARNING WALK.mp4,
klip grok, DSCF2468-2476.JPG, DSCF2469.MOV.
Langkah: salin video, stabilkan video anugerah, kecilkan foto, asingkan suara latar (demucs).
"""
import os, subprocess, sys, shutil
from PIL import Image, ImageOps

B = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', '..', 'bahan_korporat')
P = os.path.join(os.path.dirname(__file__), '..', 'public')
for d in ['video', 'img', 'audio']:
    os.makedirs(os.path.join(P, d), exist_ok=True)

def run(*a):
    subprocess.run(list(a), check=True)

def v(name, out):
    dst = os.path.join(P, 'video', out)
    if not os.path.exists(dst):
        # kunci keyframe rapat supaya carian pantas semasa render
        run('ffmpeg', '-v', 'error', '-y', '-i', os.path.join(B, name), '-an', '-c:v', 'libx264', '-crf', '18',
            '-preset', 'veryfast', '-g', '25', '-pix_fmt', 'yuv420p', dst)

v('KORPORAT BARU 2026.mp4', 'korporat.mp4')
v('SKESO APPS & E-LEARNING WALK.mp4', 'walk.mp4')
v('grok-video-7f4493ef-761f-40ee-bd91-fea3903330ee.mp4', 'biometrik.mp4')
v('grok-video-abe8eb43-e95c-46a8-ad05-c8f4080de95b.mp4', 'hologram.mp4')

# Video anugerah bergegar -> stabilkan (vidstab 2 laluan)
st = os.path.join(P, 'video', 'emas_stabil.mp4')
if not os.path.exists(st):
    trf = os.path.join(P, 'video', '_t.trf')
    src = os.path.join(B, 'DSCF2469.MOV')
    run('ffmpeg', '-v', 'error', '-y', '-i', src, '-vf', f'vidstabdetect=shakiness=8:accuracy=15:result={trf}', '-f', 'null', '-')
    run('ffmpeg', '-v', 'error', '-y', '-i', src, '-vf',
        f'vidstabtransform=input={trf}:smoothing=30:optzoom=1:zoom=4:interpol=bicubic,unsharp=5:5:0.6',
        '-an', '-c:v', 'libx264', '-crf', '18', '-g', '25', '-pix_fmt', 'yuv420p', st)
    os.remove(trf)

for n in ['DSCF2468', 'DSCF2470', 'DSCF2472', 'DSCF2473']:
    dst = os.path.join(P, 'img', n.lower() + '.jpg')
    if not os.path.exists(dst):
        im = ImageOps.exif_transpose(Image.open(os.path.join(B, n + '.JPG'))).convert('RGB')
        im.thumbnail((3000, 3000))
        im.save(dst, quality=90)

# Suara latar: asingkan vokal daripada muzik lama (muzik diganti)
for name, ss, to, out in [('KORPORAT BARU 2026.mp4', 110, 178, 'vo_korporat.wav'),
                          ('SKESO APPS & E-LEARNING WALK.mp4', 10, 141, 'vo_walk.wav')]:
    dst = os.path.join(P, 'audio', out)
    if os.path.exists(dst):
        continue
    tmp = os.path.join(P, 'audio', '_src.wav')
    run('ffmpeg', '-v', 'error', '-y', '-ss', str(ss), '-to', str(to), '-i', os.path.join(B, name), '-vn', '-ac', '2', '-ar', '44100', tmp)
    run(sys.executable, '-m', 'demucs', '--two-stems=vocals', '-n', 'htdemucs', '-o', os.path.join(P, 'audio', '_sep'), tmp)
    shutil.move(os.path.join(P, 'audio', '_sep', 'htdemucs', '_src', 'vocals.wav'), dst)
    shutil.rmtree(os.path.join(P, 'audio', '_sep')); os.remove(tmp)
print('siap')
