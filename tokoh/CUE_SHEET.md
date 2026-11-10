# Helaian Isyarat: Video Anugerah Tokoh Murid 2026

**Tokoh:** Thoriq Yusuf bin Mohammad Nor Bakri (6 Ibnu Majah), SK Sultan Omar
**Format:** 1920×1080, 30 fps, ±1 minit 53 saat. Dibina dengan Remotion.

## 1. Transkrip & peta muzik

Whisper tidak mengesan sebarang ucapan atau vokal dalam fail-fail ini. Semuanya muzik instrumental.
Oleh itu, "transkrip" di bawah ialah peta muzik: tempo, hentakan dan bahagian kuat/perlahan.
Peta inilah yang menentukan di mana animasi dan kesan bunyi diletakkan.

| Fail | Tempo | Ciri | Kegunaan |
|---|---|---|---|
| `ticking_clock.mp3` | 89 BPM | Hentakan setiap **5.38 s** (bermula 0.8 s), tegangan meningkat | Bahagian misteri, 0:00–0:51 |
| `triumph_of_the_spirit.mp3` | 123 BPM | Rentak pertama pada 0.44 s, 1 rentak = 0.4876 s | Pendedahan hingga penutup, 0:54–akhir |
| `intro_sekolah.mp4` | — | Rakaman dron, berakhir di langit berbintang | Pembukaan (bunyi asal dibisukan) |
| `pen_ket_pengawas.mp4` | — | Thoriq muncul pada 0:31–0:36 dan 0:45–0:49 | Klip 0:45–0:49 digunakan dalam montaj |
| `tick_of_the_heart.mp3`, `untitled.mp3` | 92 / 123 BPM | Tidak digunakan | Simpanan |

## 2. Garis masa

| Masa | Babak | Animasi / grafik gerak | Kesan bunyi |
|---|---|---|---|
| 0:00 | Rakaman dron sekolah | Lower-third logo + nama sekolah (1.1 s) | whoosh |
| 0:06.8 | Langit & burung | "Di bumi ilmu ini, lahir seorang bintang..." | swish |
| 0:09.6 | Tajuk | Bintang, logo turun | cymbal terbalik → whoosh |
| 0:11.56 | **Hentakan muzik** | "TOKOH MURID 2026" menghentam, skrin bergegar, kilauan emas | hentakan + kilauan |
| 0:14.7 | | "Siapakah dia...?" | sub-drop |
| 0:16.94 | Petunjuk 1 *(selari hentakan)* | Teks ditaip → "PENOLONG KETUA MURID" | whoosh, bunyi taip, hentakan |
| 0:22.32 | Petunjuk 2 | "PENGERUSI TV PSS" | 〃 |
| 0:27.70 | Petunjuk 3 | Trofi + "JOHAN SKUASY" | 〃 |
| 0:33.08 | Petunjuk 4 | Kaunter 0→6 "PERTANDINGAN KEBANGSAAN" | 〃 + blip kaunter |
| 0:38.46 | Petunjuk 5 | "NILAM 4 BINTANG", 4 bintang muncul | 〃 + pop bintang |
| 0:43.84 | **Siluet bangkit dari abu** | Asap tebal, bara membentuk badan Thoriq dari bawah | api, sub-drop, whoosh bara |
| 0:48.2 | | "SIAPAKAH ··· DIA?" mengapit siluet | degupan jantung ×3 |
| 0:51.04 | Kiraan detik 3‑2‑1 | Gelang emas, nombor menghentam, skrin bergegar | riser, drumroll, detik |
| **0:54.04** | **PENDEDAHAN** | Kilat putih, Thoriq bertopi graduan, sinar emas, confetti (mengelak wajah), nama | **hentakan besar**, kilauan, tepukan; muzik kemenangan bermula |
| 1:01.84 | Montaj (10 syot × 8 rentak) | Ken Burns sedar-wajah, kapsyen, lencana | whoosh + pengatup kamera setiap syot |
| | 1. Skuasy MSSD | Lencana **JOHAN** | hentakan + kilauan |
| | 2. MSST Skuasy | Lencana **JOHAN** | 〃 |
| | 3. Skuasy MSSM | Mewakili Terengganu | |
| | 4. Bola Baling | Lencana **KETIGA** | hentakan + kilauan |
| | 5. Statistik | 18 · 6 · 4 · 4 dikira naik | blip |
| | 6. 6 Pentas Kebangsaan | 6 kad muncul ikut rentak | swish |
| | 7. Video pengawas | Penolong Ketua Murid | |
| | 8. Gambar berkot | Ketua Rumah Temenggung | |
| | 9. Gambar kelas | Zum ke Thoriq dalam 6 Ibnu Majah | |
| | 10. Gambar graduasi | "Perjalanan baru bermula" | |
| 1:40.85 | Penutup | "TAHNIAH!", nama penuh, logo, moto sekolah, confetti | hentakan, kilauan, tepukan |
| 1:51.3 | | Pudar ke hitam, muzik pudar | |

## 3. Peraturan wajah

- Setiap gambar mempunyai **kotak wajah Thoriq** (`src/data.ts`) yang telah disemak secara visual.
- Ken Burns sentiasa mengekalkan wajah dalam bingkai.
- Kapsyen dan lencana diletakkan secara automatik di sudut yang **tidak bertindih** dengan wajah (kawasan larangan +50 px).
- Confetti dan bara tidak dilukis dalam kawasan wajah (kawasan larangan +55 px).
- Babak petunjuk menggunakan gambar yang dikaburkan, jadi wajah tidak dapat dicam sebelum pendedahan.

## 4. Kesan bunyi

Semua 19 SFX dijana oleh `scripts/sfx.py`. Ia sintesis berlapis: sub-bass, stereo dan gema bilik.
Tiada pustaka SFX premium berbayar digunakan. Untuk menggantikannya dengan SFX premium anda sendiri,
letakkan fail dengan nama yang sama dalam `public/sfx/`, contohnya `impact_besar.wav` atau `riser.wav`.

## 5. Arahan

Untuk menyediakan semula bahan (perlu folder `../bahan`):

```bash
python3 scripts/prep.py
```

```bash
python3 scripts/sfx.py
```

```bash
python3 scripts/siluet.py
```

Untuk menyemak dalam pelayar:

```bash
npm run studio
```

Untuk render pratonton (960×540):

```bash
npm run preview
```

Untuk render akhir (1920×1080). **Jalankan hanya selepas pratonton diluluskan.**

```bash
npm run final
```
