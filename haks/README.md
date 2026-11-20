# HAKS — video gelung 9:16

Video gelung 10 s (1080×1920, 30 fps) yang bersambung lancar, gaya poster HAKS.

- **`gen/`**: penjana Rust (tanpa kebergantungan) yang menghasilkan susun atur prosedur ke `src/layout.json`:
  bas litar 45° berselari, jubin piksel, grid titik, zarah, komponen gelombang jaring dan tanda detik cincin HUD.
  Setiap parameter gerakan ialah harmonik integer bagi gelung, jadi bingkai akhir bersambung ke bingkai pertama.
- **`src/HaksLoop.tsx`**: komposisi Remotion yang dipacu oleh fasa gelung `t ∈ [0,1)`.

```bash
npm install
npm run studio    # pratonton interaktif
npm run render    # out/haks_loop_10s.mp4 + out/haks_loop_30s.mp4 (3× gelung)
```

Tukar `SEED` dalam `gen/src/main.rs` untuk susun atur litar/zarah yang lain.

## Versi "gah" (`HaksGah`, 12 s)

Angkasa gelap + planet (tekstur dijana Rust ke `public/planet.png`) → warp & teras tenaga mengecas →
HUD & litar dilukis → huruf H·A·K·S terbang masuk satu-satu (jejak cahaya, percikan, gelombang kejutan,
goncangan kamera) → detik gah 3.85 s (kilatan, sinar, jalur kuning, latar biru poster) → logo hidup →
huruf terbang keluar ke arah kamera → kembali ke angkasa (bersambung lancar).

```bash
npm run render:gah   # out/haks_gah_12s.mp4 + out/haks_gah_36s.mp4
```

## Versi gabungan (`HaksCombo`, 22 s) — untuk dimainkan sepanjang program

Angkasa → HAKS **melintang** (terbang masuk satu-satu, gah 3.85 s) → **transformasi** 9.2 s (setiap huruf
melayang dalam lengkung Bezier + pusingan 3D ke susunan **menegak**, cincin HUD membesar, planet turun) →
**"26"** naik dari bawah + gah kedua 11.3 s → kilauan atas→bawah, riak huruf, cahaya kuning antara huruf →
keluar 19.8 s → angkasa (bersambung lancar).

```bash
npm run render:combo   # out/haks_combo_22s.mp4 + out/haks_combo_110s.mp4 (5× gelung)
```
