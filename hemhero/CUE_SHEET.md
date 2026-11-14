# Helaian Isyarat: THE HEM HERO

**Watak:** Razulddin bin Mustaffa (PK HEM), SK Sultan Omar
**Format:** 3840×2160 (4K UHD), 16:9, 30 fps, 30 saat. Dibina dengan Remotion (komposisi 1920×1080, render `--scale=2`).
**Audio:** Semua bunyi disintesis (`scripts/audio.py`). Tiada dialog, suara, narasi, nyanyian, sari kata atau teks selain tajuk penutup.

## Bahan

| Fail | Sumber | Kegunaan |
|---|---|---|
| `bahan/1.webp` | Papan cerita Scene 1 | 6 panel dipotong → `public/img/p1…p6` (grafik kilat kartun kuning dibuang) |
| `bahan/2.jpg` | Potret rasmi | Latar cyan dibuang → `potret_alpha.png` (babak bangun & penutup) |
| `bahan/3.jpg` | Foto berdiri penuh | Syot tilt-up kasut → wajah |

## Garis masa

| Masa | Syot | Visual / gerak kamera | Bunyi |
|---|---|---|---|
| 0:00.0 | 1 Loceng | Close-up loceng tembaga, zum keluar perlahan, gegaran setiap pukulan | Loceng tradisional ×7, riuh mula |
| 0:03.2 | 2 Kekecohan | Tracking pantas kiri→kanan, kamera pegang tangan | Whip, riuh sekolah, tapak kaki berlari |
| 0:05.5 | | Snap-zoom ke pengawas (tangan diangkat) | Wisel pengawas |
| 0:07.6 | 3 Wira | Pejabat, push-in perlahan, gred sejuk, habuk dalam cahaya | Sunyi tiba-tiba, detik jam, kerusi berkeriut |
| 0:10.4 | | ECU cermin mata, tangan membetulkan cermin | Whoosh, dengung tegang |
| 0:11.7 | | Kilauan cahaya merentas kanta | Bunyi kilauan + hentakan rendah |
| 0:13.0 | 4 Transformasi | Potret sebenar bangun dari bawah, sudut rendah, sinar cahaya wira di belakang | Kerusi bergerak, whoosh wira, riser |
| 0:15.4 | | Syot wira (PK HEM, jubah), kilat putih, gegaran | Hentakan sinematik, muzik wira bermula |
| 0:17.6 | 5 Masuk | Tilt-up gerak perlahan dari kasut ke wajah, letterbox menebal | Tapak kaki dalam bergema |
| 0:20.0 | | Berjalan di koridor, dolly masuk, gegaran setiap langkah | 〃 + muzik |
| 0:22.6 | 6 Lawak | Kembali sekejap ke kekecohan (1 s) | Whip, riuh |
| 0:23.6 | | **Serta-merta**: snap-zoom keluar, murid berbaris tersusun | Slide-whistle + "boop-boop-DING" lawak, kasut berhenti serentak |
| 0:25.6 | | Push-in ke wajah, kilauan cermin mata | Kilauan, tema wira ringan |
| 0:27.4 | Penutup | Potret + tajuk emas "THE HEM HERO", kilauan kanta | Hentakan + kord D major |
| 0:29.4 | | Pudar ke hitam | |

## Bina semula

```bash
cd hemhero && npm install && pip install scipy numpy pillow
python3 scripts/prep.py && python3 scripts/audio.py
npm run final   # -> out/the_hem_hero_4k.mp4
```

## Had yang perlu diketahui

- Ini **bukan** video AI generatif: wajah tidak bergerak, dia tidak benar-benar berjalan, dan murid tidak bergerak. Gerakan datang daripada kamera (zum, pan, tilt, gegaran), cahaya dan suntingan.
- Panel papan cerita asal hanya ~530 px lebar; dalam 4K ia kelihatan lembut (kesan "cetek kedalaman medan" membantu, tetapi tidak setajam rakaman sebenar).
- Wajah dalam panel papan cerita (pejabat, ECU, wira, koridor) ialah lukisan AI daripada papan cerita, bukan foto sebenar. Syot bangun, tilt-up dan penutup menggunakan foto sebenar.
