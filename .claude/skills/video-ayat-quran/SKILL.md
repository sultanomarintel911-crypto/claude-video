---
name: video-ayat-quran
description: Buat video pendek menegak (9:16, Reels/TikTok/Shorts) bagi satu ayat Al-Quran — bacaan qari, teks Uthmani yang menyala ikut perkataan dibaca, terjemahan Melayu muncul perkataan demi perkataan, dan animasi simbolik bagi setiap frasa. Guna bila pengguna minta "video ayat", "buat video surah X ayat Y", "video tazkirah ayat tentang ...", atau mahu ubah video ayat sedia ada dalam folder ayat/.
---

# Video Ayat Al-Quran (Remotion)

Projek: `ayat/` (Remotion 4, React, TypeScript). Contoh siap: Al-Ahzab 33:59 → `ayat_tudung_33_59.mp4`.

## Prinsip wajib (adab & ketepatan)
- **Jangan sekali-kali taip teks Al-Quran secara manual.** Teks Uthmani, masa perkataan dan terjemahan mesti datang dari `scripts/ambil_data.py` (api.quran.com).
- Terjemahan: Abdullah Muhammad Basmeih (resource 39). Boleh pecah ikut frasa & ringkaskan kurungan, tapi jangan ubah maksud.
- **Tiada muzik.** Audio bacaan sahaja.
- **Jangan lukis** Allah, Nabi, malaikat, atau individu tertentu (isteri/anak Nabi, sahabat). Ganti dengan simbol: cahaya, tanglung, matahari, orang awam tanpa nama.
- Watak manusia tanpa wajah (bujur muka kosong). Wanita sentiasa bertudung.
- Sentiasa ingatkan pengguna menyemak teks Arab dengan mushaf sebelum terbit.
- Jangan tiru gaya akaun lain (contoh: @deenanddinar — hijau malam, bulan, bintang emas, watak krim). Kekalkan identiti sendiri (lihat Tema).
- Nama akaun: `HANDLE` dalam `src/data.ts` (lalai `@abraryusof`), dipapar di atas tengah sepanjang video, huruf besar renggang, legap 0.72. Set `''` untuk buang.

## Aliran kerja
1. **Pilih ayat.** Kalau pengguna beri topik (cth. "labuhkan tudung"), cadangkan ayat paling tepat & sebut alternatif (cth. 24:31 vs 33:59). Ayat panjang (>~40 s bacaan) → cadang potong ke frasa berkaitan.
2. **Ambil data** (dari `ayat/`):
   ```bash
   npm install            # jika node_modules tiada
   python3 scripts/ambil_data.py <surah>:<ayat> [recitation_id]   # lalai 7 = Alafasy
   ```
   Tulis `src/ayat.json` (perkataan + masa ms, rujukan, tempoh) dan `public/<sss><aaa>.mp3`. Skrip mencetak senarai perkataan bernombor dengan masa.
3. **Sahkan masa** dengan profil kekuatan bunyi: hentian (≈ −20 dB atau lebih rendah) mesti jatuh pada sempadan perkataan yang ada tanda waqaf. Skrip semakan ringkas: decode ke 8 kHz mono via ffmpeg, RMS per 100 ms, cetak dB relatif.
4. **Pecah frasa** dalam `src/data.ts` → `GROUPS`: `{from, to, tr, scene}` (nombor perkataan 1-based, inklusif). `tr` = terjemahan frasa itu; `*kata kunci*` disorot. Setiap frasa = satu babak; 3–7 perkataan Arab per frasa supaya muat 1–2 baris.
5. **Reka babak** dalam `src/Video.tsx` → komponen `Stage`. Setiap babak ialah blok yang dikawal masa audio `a` dan `S.<scene>` (masa mula frasa). Guna `WORDS[i].start` untuk hentakan pada perkataan tertentu. Kemas kini jenis `SceneId` dan objek `S`.
6. **Tukar tajuk** dalam komponen `Title` (cth. "Labuhkan *Tudungmu*") + subtajuk.
7. **Pratonton** beberapa frame dan susun jadi satu helaian (semak dengan Read):
   ```bash
   for fr in 30 140 260 ...; do npx remotion still src/index.ts AyatTudung out/s_$fr.png --frame=$fr --scale=0.4 --log=error; done
   ffmpeg -v error -y -pattern_type glob -i 'out/s_*.png' -vf tile=4x2 out/sheet.png
   ```
   Frame = (INTRO + masa_audio) × 30.
8. **Render**: `npm run render` → `out/ayat_tudung_33_59.mp4` (~45 s). Untuk ayat lain, tukar nama output dalam `package.json` (dan id Composition jika mahu). Salin ke akar repo, hantar kepada pengguna, commit & push.

## Struktur kod
| Fail | Isi |
|---|---|
| `scripts/ambil_data.py` | Ambil teks, segmen masa, terjemahan, nama surah, audio |
| `src/ayat.json` | Data terjana — jangan sunting teks Arab di sini |
| `src/data.ts` | `INTRO` (2.6 s), `OUTRO` (4.2 s), `GROUPS`, palet `C` |
| `src/Video.tsx` | `Sky` (latar), `Woman`, `Lantern`, `Stage` (babak), `Texts` (Arab + terjemahan), `Title` |

Pembantu animasi dalam `Video.tsx`: `ramp(x,x0,x1)` 0→1 ber-easing; `window_(x,s,e,d)` muncul/hilang; `pop(x,s)` lantun masuk; `rng(seed)` rawak tetap (deterministik — wajib untuk Remotion, jangan guna `Math.random`).

Teks: perkataan Arab belum dibaca pudar (0.22), sedang dibaca = warna sorotan + glow, sudah dibaca = putih. Terjemahan muncul linear sepanjang frasa.

## Tema semasa: "Subuh" (identiti kita)
- Langit ungu tua `#1d0f2e` → `#6a2d5c` → `#e3866f` → ufuk peach `#f8c38c`; matahari `#ffe2b0` di ufuk belakang watak; awan bergerak; bukit 3 lapis.
- Watak: siluet ungu (`#3a1a35` jubah, `#5c2a4e` tudung) dengan cahaya tepi `#ffc9a0`.
- Sorotan koral-peach `#ffb48c`. Fon: Amiri Quran (Arab), Nunito (terjemahan), Montserrat (tajuk), Cormorant Garamond italic (rujukan).
- Tukar tema hanya melalui palet `C` dalam `data.ts` + komponen `Sky`.

## Perpustakaan simbol (boleh guna semula)
- **Wahyu/seruan**: pancaran cahaya turun + riak bulatan di tanah.
- **Golongan orang**: tanglung menyala satu-satu, barisan watak bangkit berperingkat.
- **Menutup aurat**: tudung `Woman.drape` 0→1 (dada → betis) + kilauan di hujung + anak panah.
- **Dikenali/kemuliaan**: aura + gelang mengembang pada perkataan kunci.
- **Perlindungan**: kubah cahaya dilukis (pathLength + dashoffset), zigzag gangguan terpantul.
- **Rahmat/ampunan**: matahari naik, sinar berputar, hujan cahaya.
Untuk tema baharu (solat, sedekah, ibu bapa, sabar), tambah komponen SVG ringkas yang sama gaya: bentuk rata, tiada wajah, warna dari `C`.

## Teknikal
- `remotion.config.ts` guna Chromium di `/opt/pw-browsers/chromium_headless_shell-1243/...`; laraskan jika laluan lain.
- api.quran.com menolak User-Agent Python lalai — skrip sudah hantar `User-Agent: curl/8`.
- Bilangan segmen ≠ bilangan perkataan → skrip berhenti; semak tanda waqaf/simbol khas secara manual.
