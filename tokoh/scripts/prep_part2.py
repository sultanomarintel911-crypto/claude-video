#!/usr/bin/env python3
"""Bahan Bahagian 2: gambar perjalanan pembesaran (sinematik 16:9, wajah sahaja dikaburkan) & potongan fail misi.

Rawatan wajah:
  - 'jelas'  : gambar asal
  - 'kabur'  : kawasan kepala Thoriq dikaburkan (topeng orang daripada rembg, bahagian atas)
  - 'siluet' : Thoriq digantikan siluet hitam bertepi cahaya; latar dimalapkan
-> public/v8/hidup/*.jpg, public/v8/img/misi_*.jpg
"""
import glob
import os

import cv2
import numpy as np
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.normpath(os.path.join(HERE, "..", "..", "bahan", "kehidupan"))
OUT = os.path.normpath(os.path.join(HERE, "..", "public", "v8", "hidup"))
IMG = os.path.normpath(os.path.join(HERE, "..", "public", "v8", "img"))
os.makedirs(OUT, exist_ok=True)
FS = sorted(glob.glob(f"{SRC}/*.jpg"))


def load(n):
    if isinstance(n, str) and n.startswith("upd:"):  # gambar HD dikemas kini (bahan/update)
        return ImageOps.exif_transpose(Image.open(os.path.join(SRC, "..", "update", n[4:]))).convert("RGB")
    if isinstance(n, str):  # gambar yang telah disunting (bahan/ubah)
        return ImageOps.exif_transpose(Image.open(os.path.join(SRC, "..", "ubah", n))).convert("RGB")
    return ImageOps.exif_transpose(Image.open(FS[n - 1])).convert("RGB")


# (kunci output, sumber, rawatan, titik Thoriq, pecahan kepala, kabur tanda nama?, bingkai (fx, fy, zum) atau None)
#   asli   : tiada kabur (gambar bayi)
#   topeng : topeng mata adiwira (tadika / prasekolah)
#   spek   : cermin mata hitam (tadika / prasekolah)
#   sedia  : wajah sudah ditutup dalam suntingan
#   jelas  : wajah semua orang dikaburkan (badan, pingat & sijil kekal jelas)
#   kabur  : seperti 'jelas' + kepala Thoriq dikaburkan lebih kuat
# sumber: nombor = bahan/kehidupan (sorted), "upd:..." = bahan/update (HD), lain = bahan/ubah
HD = (0.5, 0.5, 1.0)
ITEMS = [
    # BAB I - bayi & tadika (semua jelas, tanpa topeng)
    ("b01", "upd:baby thori2.2.png", "asli", None, 0, False, HD),
    ("b02", "upd:baby thoriq 2.png", "asli", None, 0, False, HD),
    ("b03", "upd:baby thoriq 1.png", "asli", None, 0, False, HD),
    ("b04", "upd:baby thoriq 3.png", "asli", None, 0, False, HD),
    ("b05", "upd:thoriq belakang baby.png", "asli", None, 0, False, HD),
    ("b06", "upd:preschool ni.png", "asli", None, 0, False, HD),
    ("b07", "upd:Red Firefighter at Preschool-4.png", "asli", None, 0, False, HD),
    ("b08", "upd:thoriq preschool.png", "asli", None, 0, False, HD),
    ("b09", "upd:thoriq tadika 1.png", "asli", None, 0, False, HD),
    ("b10", "upd:thoriq tadika.png", "asli", None, 0, False, HD),
    ("b11", "upd:Removing a stray foot artifact-9.png", "asli", None, 0, False, HD),
    ("b12", "upd:tadika lagi.png", "asli", None, 0, False, HD),
    ("b13", "upd:tadika.png", "asli", None, 0, False, HD),
    # BAB II - alam persekolahan
    ("c01", 94, "jelas", None, 0, True, None),
    ("c02", "upd:tahun 2.png", "jelas", None, 0, False, HD),
    ("c03", "upd:Timber hall with balloons and banner-11.png", "jelas", None, 0, True, HD),
    ("c04", "upd:Childrens blossom stage presentation-13.png", "jelas", None, 0, True, HD),
    ("c05", "kuda_perisai.webp", "sedia", None, 0, False, HD),
    ("c06", "upd:waktu kecil.png", "jelas", None, 0, False, HD),
    # BAB III - mula dikenali
    ("d01", "upd:Teal classroom desks in cinematic light-6.png", "jelas", None, 0, True, HD),
    ("d02", "upd:Medaled boy in a quiet car-10.png", "jelas", None, 0, False, HD),
    ("d03", "upd:Young medalist at sports day-18.png", "jelas", None, 0, False, HD),
    # BAB IV
    ("e01", 80, "kabur", (0.45, 0.32), 0.16, False, (0.58, 0.58, 1.2)),
]
# versi tanpa kabur (u_*) untuk babak 'REDACTION REMOVED' selepas pendedahan: bingkai sama, semua wajah jelas
ITEMS += [("u_" + k, n, "asli", pt, hf, tg, fr) for k, n, mode, pt, hf, tg, fr in ITEMS if mode in ("jelas", "kabur")]
# Hari Anugerah (potret) untuk REDACTION REMOVED: penuh tinggi supaya wajah tidak terpotong
ITEMS.append(("u2_e01", 80, "asli", None, 0, False, (0.5, 0.5, 1.0)))
if os.environ.get("HANYA"):
    ITEMS = [it for it in ITEMS if it[0].startswith(os.environ["HANYA"])]

from rembg import new_session, remove  # noqa: E402

sess = new_session("u2net_human_seg")
sess_am = new_session("u2net")
YUNET = os.path.join(HERE, "model", "yunet.onnx")
CW, CH = 1920, 1080  # bingkai sinematik 16:9


def faces(img):
    """Kesan semua wajah (YuNet), termasuk wajah kecil (imbasan 2 skala)."""
    out = []
    H, W = img.shape[:2]
    for sc in (1.0, 2.0):
        im = cv2.resize(img, (int(W * sc), int(H * sc)))
        det = cv2.FaceDetectorYN.create(YUNET, "", (im.shape[1], im.shape[0]), 0.55, 0.3, 5000)
        _, fs = det.detect(im)
        if fs is not None:
            for f_ in fs:
                x, y, w, h = (f_[:4] / sc).tolist()
                out.append((x, y, w, h))
    return out


def blur_region(a, mask, sigma=22, pix=12):
    """Kabur + piksel pada kawasan topeng (0..1)."""
    H, W = a.shape[:2]
    small = cv2.resize(a, (max(1, W // pix), max(1, H // pix)), interpolation=cv2.INTER_AREA)
    px = cv2.resize(small, (W, H), interpolation=cv2.INTER_NEAREST)
    bl = cv2.GaussianBlur(px, (0, 0), sigma)
    m = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 6)[..., None]
    return a * (1 - m) + bl * m


def blur_faces(a, tag):
    """Kaburkan wajah sahaja (+ tanda nama kecil di dada jika diminta)."""
    H, W = a.shape[:2]
    m = np.zeros((H, W), np.float32)
    fl = faces(a.astype(np.uint8))
    for x, y, w, h in fl:
        cx, cy = x + w / 2, y + h / 2
        cv2.ellipse(m, (int(cx), int(cy - h * 0.08)), (int(w * 0.72), int(h * 0.95)), 0, 0, 360, 1, -1)
        if tag:  # tanda nama: jalur sempit di dada atas
            cv2.rectangle(m, (int(cx - w * 1.15), int(y + h * 1.55)), (int(cx + w * 1.15), int(y + h * 2.35)), 1, -1)
    return blur_region(a, m), fl


def topeng_adiwira(a, gaya="topeng"):
    """Topeng mata adiwira (hitam berkilat, lubang mata kecil) atau cermin mata hitam (gaya spek) pada setiap wajah."""
    H, W = a.shape[:2]
    det = cv2.FaceDetectorYN.create(YUNET, "", (W, H), 0.5, 0.3, 5000)
    _, fs = det.detect(a.astype(np.uint8)[:, :, ::-1].copy())
    if fs is None:
        return a, 0
    S = 4  # lukis 4x untuk tepi licin
    out = a.copy()
    for f_ in fs:
        rx, ry, lx, ly = f_[4:8]  # mata kanan (imej kiri), mata kiri
        mx, my = (rx + lx) / 2, (ry + ly) / 2
        d = float(np.hypot(lx - rx, ly - ry))
        ang = float(np.degrees(np.arctan2(ly - ry, lx - rx)))
        # kanvas tempatan (unit d), pusat di tengah mata
        cw, ch = int(3.2 * d * S), int(1.8 * d * S)
        m = np.zeros((ch, cw), np.uint8)
        hole = np.zeros((ch, cw), np.uint8)
        u = d * S
        cx, cy = cw // 2, ch // 2
        P = lambda x, y: (int(cx + x * u), int(cy + y * u))  # noqa: E731
        if gaya == "spek":  # cermin mata hitam: dua kanta + jambatan + kaki
            for sgn in (-1, 1):
                cv2.ellipse(m, P(sgn * 0.52, 0.04), (int(0.36 * u), int(0.25 * u)), 0, 0, 360, 255, -1)
                cv2.rectangle(m, P(sgn * 0.52 - 0.36, -0.2), P(sgn * 0.52 + 0.36, 0.02), 255, -1)
                cv2.line(m, P(sgn * 0.86, -0.12), P(sgn * 1.3, -0.08), 255, max(2, int(0.06 * u)))
            cv2.line(m, P(-0.18, -0.08), P(0.18, -0.08), 255, max(2, int(0.07 * u)))
        else:
            for sgn in (-1, 1):
                cv2.ellipse(m, P(sgn * 0.52, 0.0), (int(0.6 * u), int(0.38 * u)), 0, 0, 360, 255, -1)
                tip = np.array([P(sgn * 0.75, -0.32), P(sgn * 1.32, -0.5), P(sgn * 1.06, 0.04), P(sgn * 0.8, 0.24)], np.int32)
                cv2.fillPoly(m, [tip], 255)
                cv2.ellipse(hole, P(sgn * 0.5, 0.01), (int(0.2 * u), int(0.11 * u)), sgn * 8, 0, 360, 255, -1)
            cv2.rectangle(m, P(-0.22, -0.2), P(0.22, 0.1), 255, -1)
            cv2.ellipse(m, P(0, 0.16), (int(0.13 * u), int(0.1 * u)), 0, 180, 360, 0, -1)  # lengkung hidung
        m = cv2.subtract(m, hole)
        m = cv2.GaussianBlur(m, (0, 0), S * 0.7)
        # putar & letak
        M = cv2.getRotationMatrix2D((cx, cy), -ang, 1.0 / S)
        M[0, 2] += mx - cx
        M[1, 2] += my - cy
        al = cv2.warpAffine(m, M, (W, H)).astype(np.float32) / 255
        # bayang lembut di bawah topeng
        sh = cv2.GaussianBlur(cv2.warpAffine(m, M, (W, H)).astype(np.float32) / 255, (0, 0), d * 0.06)
        sh = np.roll(sh, int(d * 0.05), axis=0)
        out = out * (1 - 0.45 * sh[..., None])
        # warna: hitam kebiruan berkilat (kilauan di bahagian atas)
        yy = np.arange(H, dtype=np.float32)[:, None]
        g = np.clip(1 - (yy - (my - 0.3 * d)) / (0.6 * d), 0, 1)
        col = np.dstack([10 + 70 * g ** 2, 10 + 72 * g ** 2, 14 + 80 * g ** 2])
        out = out * (1 - al[..., None]) + col * al[..., None]
    return out, len(fs)


def grade(a):
    """Gred filem neutral: lengkung-S lembut, hitam diangkat sedikit, ketepuan dikurang sedikit."""
    x = a / 255.0
    x = x + 0.10 * (x - 0.5) * (1 - np.abs(2 * x - 1))  # kontras lembut
    x = 0.025 + x * 0.955  # hitam pudar ala filem
    g = x.mean(axis=2, keepdims=True)
    x = g + (x - g) * 0.88
    x = x * np.array([1.015, 1.0, 0.985])  # sorotan sedikit hangat (bukan teal/amber)
    return np.clip(x * 255, 0, 255)


def place(arr, focus, z, ext=None):
    """Letak gambar dalam bingkai 16:9: skala = tinggi penuh x zum; sisi kosong diisi 'ext' (latar kabur)."""
    H, W = arr.shape[:2]
    sc = max(CH / H * z, min(CW / W, CH / H) if ext is None else 0)
    if W * sc >= CW and H * sc >= CH or ext is None:
        sc = max(sc, CW / W, CH / H)
    nw, nh = int(np.ceil(W * sc - 1e-6)), int(np.ceil(H * sc - 1e-6))
    if abs(nw - CW) <= 2:
        nw = CW
    r = cv2.resize(arr, (nw, nh), interpolation=cv2.INTER_CUBIC if sc > 1 else cv2.INTER_AREA)
    x0 = int(np.clip(focus[0] * nw - CW / 2, min(0, nw - CW), max(0, nw - CW))) if nw > CW else -(CW - nw) // 2
    y0 = int(np.clip(focus[1] * nh - CH / 2, 0, nh - CH))
    ch = arr.shape[2]
    out = np.zeros((CH, CW, ch), np.float32) if ext is None else ext.astype(np.float32).copy()
    sx0, dx0 = max(0, x0), max(0, -x0)
    w = min(nw - sx0, CW - dx0)
    piece = r[y0:y0 + CH, sx0:sx0 + w].astype(np.float32)
    if ext is None or nw >= CW:
        out[:, dx0:dx0 + w] = piece
    else:  # tepi lembut ke dalam latar lanjutan
        ramp = np.clip(np.minimum(np.arange(w), np.arange(w)[::-1]) / 170.0, 0, 1)[None, :, None]
        out[:, dx0:dx0 + w] = out[:, dx0:dx0 + w] * (1 - ramp) + piece * ramp
    return out


def cover(arr, focus, interp=cv2.INTER_AREA):
    """Potong 'cover' 16:9 berpusat pada titik fokus."""
    H, W = arr.shape[:2]
    sc = max(CW / W, CH / H)
    nw, nh = int(round(W * sc)), int(round(H * sc))
    r = cv2.resize(arr, (nw, nh), interpolation=interp)
    x0 = int(np.clip(focus[0] * nw - CW / 2, 0, nw - CW))
    y0 = int(np.clip(focus[1] * nh - CH / 2, 0, nh - CH))
    return r[y0:y0 + CH, x0:x0 + CW]


def person_mask(im, pt):
    m = np.asarray(remove(im, session=sess, only_mask=True, post_process_mask=True))
    b = (m > 128).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(b, 8)
    H, W = b.shape
    px, py = int(pt[0] * W), int(pt[1] * H)
    k = lab[py, px]
    if k == 0:  # cari komponen terdekat
        best, bd = 0, 1e18
        for i in range(1, n):
            x, y, w, h, _ = stats[i]
            cx, cy = x + w / 2, y + h / 2
            dd = (cx - px) ** 2 + (cy - py) ** 2
            if dd < bd and stats[i][4] > 0.005 * W * H:
                best, bd = i, dd
        k = best
    return (lab == k).astype(np.uint8)


for key, n, mode, pt, headf, tag, frm in ITEMS:
    im = load(n)
    im.thumbnail((2400, 2400), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    H, W = a.shape[:2]
    # subjek: orang (atau orang + kuda untuk gambar suntingan, model am u2net)
    pm = (np.asarray(remove(im, session=sess_am if mode == "sedia" else sess, only_mask=True, post_process_mask=True)) > 128).astype(np.uint8)
    fl = []
    if mode == "sedia":  # wajah sudah ditutup dalam suntingan
        pass
    elif mode == "asli":  # bayi: jelas
        pass
    elif mode in ("topeng", "spek"):  # tadika: topeng adiwira / cermin mata hitam
        a, nm = topeng_adiwira(a, mode)
        print(f"   {mode} x{nm}")
    else:
        a, fl = blur_faces(a, tag)
        # lapisan keselamatan: kepala orang yang wajahnya tidak dikesan
        nlab, lab, stats, _ = cv2.connectedComponentsWithStats(pm, 8)
        hm = np.zeros(pm.shape, np.float32)
        for c in range(1, nlab):
            x, y, w, h, area = stats[c]
            if h < 0.12 * H:
                continue
            ytop = y + h * 0.15
            if any(x <= fx + fw / 2 <= x + w and y - fh <= fy + fh / 2 <= ytop + fh for fx, fy, fw, fh in fl):
                continue
            top = lab == c
            top[int(ytop):] = False
            hm = np.maximum(hm, top.astype(np.float32))
        a = blur_region(a, cv2.dilate(hm, np.ones((15, 15), np.uint8)))
    if mode == "kabur":  # kepala Thoriq: lebih kuat, tepat ikut topeng
        m = person_mask(im, pt)
        ys, xs = np.nonzero(m)
        top = m.copy()
        top[int(ys.min() + (ys.max() - ys.min()) * headf):] = 0
        a = blur_region(a, cv2.dilate(top, np.ones((21, 21), np.uint8)), sigma=28, pix=16)
    # titik fokus: pusat orang (condong ke atas supaya kepala tidak terpotong)
    if pm.sum() > 0:
        ys, xs = np.nonzero(pm)
        focus = (xs.mean() / W, (ys.min() * 0.6 + ys.mean() * 0.4) / H)
    else:
        focus = (0.5, 0.5)
    a = grade(a)
    # tiada kesan 3D / kedalaman palsu: gambar rata, sisi kosong diisi versi kabur gambar sendiri
    fx, fy, z = frm or (focus[0], focus[1], 1.35)
    ext = cv2.GaussianBlur(cover(a.astype(np.uint8), (fx, fy)).astype(np.float32), (0, 0), 30) * 0.55
    full = place(a, (fx, fy), z, ext)
    Image.fromarray(np.clip(full, 0, 255).astype(np.uint8)).save(f"{OUT}/{key}.jpg", quality=92)
    print(f"{key} <- {n} {mode} {W}x{H} wajah={len(fl)} fokus=({focus[0]:.2f},{focus[1]:.2f})")

# gambar terawal (hujung kotak kenangan)
# bayi neutral (b01) dipotong 3:4 - tiada petunjuk jantina sebelum pendedahan
_b = Image.open(f"{OUT}/b01.jpg")
_x = max(0, min(_b.width - 810, int(0.49 * _b.width) - 405))
_b.crop((_x, 0, _x + 810, 1080)).resize((960, 1280), Image.LANCZOS).save(os.path.join(IMG, "awal.jpg"), quality=92)
print("awal.jpg <- b01")

# fail misi: papan tanda sahaja (tiada orang, tiada skuasy)
for n, name, box in ((57, "istanbul", (0.12, 0.0, 0.98, 0.42)), (60, "birmingham", (0.0, 0.0, 1.0, 0.44))):
    im = load(n)
    W, H = im.size
    c = im.crop((int(box[0] * W), int(box[1] * H), int(box[2] * W), int(box[3] * H)))
    c.save(f"{IMG}/misi_{name}.jpg", quality=92)
    print("misi", name, c.size)
