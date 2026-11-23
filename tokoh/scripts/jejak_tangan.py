#!/usr/bin/env python3
"""Jejak tangan (kulit) dalam klip swipe -> src/v8/tangan.json: {klip: [[x,y,hujungX,hujungY,ada]...]} pada 30 fps, koordinat 1920x1080.
hujung = titik kulit paling jauh dari lengan (hujung jari), untuk panel hologram yang 'disentuh'."""
import json, subprocess, sys
import numpy as np
W, H = 480, 270
def frames(path, ss, t):
    p = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(ss), '-t', str(t), '-i', path, '-vf', f'fps=30,scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.uint8).reshape(-1, H, W, 3).astype(np.int16)
out = {}
for name, ss, t, lengan in [('teachers_invisible_a', 0.0, 8.04, (1, 0)), ('teachers_invisible_b', 0.0, 8.04, (1, 0))]:
    fs = frames(f'public/v8/flow/{name}.mp4', ss, t)
    res, prev = [], None
    for im in fs:
        r, g, b = im[..., 0], im[..., 1], im[..., 2]
        m = (r > 95) & (r - b > 22) & (r > g) & (g > b) & (r - g > 8)
        ys, xs = np.nonzero(m)
        if len(xs) < 150:
            res.append(prev[:4] + [0] if prev else [960, 540, 960, 540, 0]); continue
        cx, cy = xs.mean(), ys.mean()
        # hujung jari: titik kulit paling kiri (lengan masuk dari kanan atas)
        k = np.argsort(xs)[:max(10, len(xs) // 50)]
        hx, hy = xs[k].mean(), ys[k].mean()
        cur = [cx * 4, cy * 4, hx * 4, hy * 4]
        if prev:  # licinkan
            cur = [0.6 * c + 0.4 * p for c, p in zip(cur, prev[:4])]
        cur = [round(v, 1) for v in cur]
        res.append(cur + [1]); prev = cur + [1]
    out[name] = res
    print(name, len(res), sum(x[4] for x in res))
json.dump(out, open('src/v8/tangan.json', 'w'))
