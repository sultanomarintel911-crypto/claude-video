---
name: video-ayat-quran
description: Buat video pendek menegak (9:16, Reels/TikTok/Shorts) bagi satu ayat Al-Quran — bacaan qari, teks Uthmani yang menyala ikut perkataan dibaca, terjemahan Melayu muncul perkataan demi perkataan, dan animasi simbolik bagi setiap frasa. Guna bila pengguna minta "video ayat", "buat video surah X ayat Y", "video tazkirah ayat tentang ...", atau mahu ubah video ayat sedia ada dalam folder ayat/.
---

# Video Ayat Al-Quran (Remotion)

Projek: `ayat/` (Remotion 4, React, TypeScript). Contoh siap:
- Al-Ahzab 33:59 → `ayat_tudung_33_59.mp4` (komposisi `AyatTudung`, `src/v_033059.tsx`)
- Al-Baqarah 2:120 → `ayat_2_120_teguh_petunjuk.mp4` (komposisi `AyatYahudiNasrani`, `src/v_002120.tsx`)
- Al-Baqarah 2:153 (sabar) → `ayat_2_153_sabar_3d.mp4` (komposisi `AyatSabar`, `src/v_002153.tsx`) — **gaya Kristal 3D**, qari Abdul Basit
- Ar-Rum 30:54 (lemah–kuat–beruban) → `ayat_30_54_kitaran_kehidupan.mp4` (komposisi `AyatKitaranHidup`, `src/v_030054.tsx`)
- Ar-Rum 30:54 versi VectorCraft + EffectCraft → `ayat_30_54_vectorcraft_effectcraft.mp4` (komposisi `AyatKitaranHidupCraft`)
- Hadis Bukhari 7320 "lubang biawak" → `hadis_lubang_biawak_bukhari_7320.mp4` (komposisi `HadisLubangBiawak`, `src/v_hadis_bukhari_7320.tsx`)

Satu fail `src/v_<sss><aaa>.tsx` bagi setiap ayat; jangan tindih video lama.

## Prinsip wajib (adab & ketepatan)
- **Jangan sekali-kali taip teks Al-Quran secara manual.** Teks Uthmani, masa perkataan dan terjemahan mesti datang dari `scripts/ambil_data.py` (api.quran.com).
- Terjemahan: Abdullah Muhammad Basmeih (resource 39). Boleh pecah ikut frasa & ringkaskan kurungan, tapi jangan ubah maksud.
- **Tiada muzik.** Audio bacaan sahaja.
- **Jangan lukis** Allah, Nabi, malaikat, atau individu tertentu (isteri/anak Nabi, sahabat). Ganti dengan simbol: cahaya, tanglung, matahari, orang awam tanpa nama.
- Watak manusia tanpa wajah (bujur muka kosong). Wanita sentiasa bertudung.
- Ayat tentang kaum/agama lain (Yahudi, Nasrani, musyrikin): visual **simbolik sahaja** (jalan, simpang, cahaya, kabus). Jangan lukis watak kaum itu, simbol agama mereka (salib, bintang Daud), atau karikatur. Fokus pada keteguhan orang beriman, bukan merendahkan orang lain.
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
4. **Fail ayat baharu** `src/v_<sss><aaa>.tsx` (salin corak `v_002120.tsx`): `export const ay = makeAyat(data, [GROUPS...])` dengan `{from, to, tr, scene}` (nombor perkataan 1-based, inklusif; `tr` terjemahan frasa, `*kata kunci*` disorot). 3–7 perkataan Arab per frasa. Saiz teks Arab/terjemahan menyesuai sendiri ikut panjang.
5. **Reka babak** dalam komponen `Stage` fail itu, dikawal masa audio `a`, `ay.S.<scene>` (mula frasa) dan `ay.words[i].start` (hentakan perkataan). Bungkus dengan `<Shell ay title sub bright stage />` — `bright(a)` 0→1 = matahari naik + sinar.
6. **Daftar** dalam `src/Root.tsx` (`<Composition id=... durationInFrames={ay.duration}>`) dan tambah skrip `render:<s>-<a>` dalam `package.json`. Tajuk: prop `title` (cth. "Teguh di Atas *Petunjuk*").
7. **Pratonton** beberapa frame dan susun jadi satu helaian (semak dengan Read):
   ```bash
   for fr in 30 140 260 ...; do npx remotion still src/index.ts <KompositionId> out/s_$fr.png --frame=$fr --scale=0.4 --log=error; done
   ffmpeg -v error -y -pattern_type glob -i 'out/s_*.png' -vf tile=4x2 out/sheet.png
   ```
   Frame = (INTRO + masa_audio) × 30.
8. **Render**: `npm run render:<s>-<a>` (~50 s). Salin ke akar repo, hantar kepada pengguna, commit & push.

## Struktur kod
| Fail | Isi |
|---|---|
| `scripts/ambil_data.py` | Ambil teks, segmen masa, terjemahan, nama surah, audio → `src/data/<sss><aaa>.json` |
| `src/data/*.json` | Data terjana — jangan sunting teks Arab di sini |
| `src/data.ts` | `INTRO` (2.6 s), `OUTRO` (4.2 s), `HANDLE`, `makeAyat`, palet `C` |
| `src/core.tsx` | Kongsi: pembantu animasi, `Sky`, `Woman`, `Lantern`, `Texts`, `Title`, `Shell` |
| `src/v_*.tsx` | Satu ayat: GROUPS + `Stage` + komponen video |
| `src/Root.tsx` | Daftar semua komposisi |

Pembantu animasi dalam `core.tsx`: `ramp(x,x0,x1)` 0→1 ber-easing; `window_(x,s,e,d)` muncul/hilang; `pop(x,s)` lantun masuk; `rng(seed)` rawak tetap (deterministik — wajib untuk Remotion, jangan guna `Math.random`).

Teks: perkataan Arab belum dibaca pudar (0.22), sedang dibaca = warna sorotan + glow, sudah dibaca = putih. Terjemahan muncul linear sepanjang frasa.
**Jarak teks:** harakat bawah (kasrah, kasratain) terkeluar dari kotak baris — Arab `lineHeight: 1.8` dan terjemahan `marginTop: 44` (gaya Subuh) / `34` (kad 3D). Sentiasa semak frasa yang ada kasrah di baris bawah dengan render frame skala 1 dan zum.

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
- **Petunjuk vs jalan lain** (2:120): jalan lurus ke matahari menyala emas, simpang kelabu ke tepi dengan anak panah tarikan, tanglung berdiri (cahaya iman).
- **Hawa nafsu / amaran**: kabus gelap dari tepi, langit malap, tanglung berkelip.
- **Tiada pelindung**: kubah cahaya pecah berkecai.
- **Kitaran hidup** (30:54): pokok prosedural (cabang rekursif, tumbuh ikut `g`), benih → anak pokok ditiup angin → pokok kuat (batang menebal) → daun memutih (uban) & gugur → bunga pelbagai jenis mekar. Kesan: debunga bercahaya, light leak (`mixBlendMode: screen`), butiran filem (`feTurbulence`, seed ikut frame).
- `Shell` ada prop `titleTop` jika tajuk penutup bertindih dengan visual.
- **Ikut jejak** (hadis 7320): bukit pasir, jejak gelap → lubang; jejak terang memijak tepat di atasnya + penanda jengkal/hasta + bunyi tapak; biawak masuk lubang.
Untuk tema baharu (solat, sedekah, ibu bapa, sabar), tambah komponen SVG ringkas yang sama gaya: bentuk rata, tiada wajah, warna dari `C`.

## Qari (recitation_id quran.com, semua ada masa perkataan)
1 Abdul Basit mujawwad · 2 Abdul Basit murattal · 3 as-Sudais · 4 asy-Syatri · 5 ar-Rifa'i · 6 al-Husary · 7 Alafasy (lalai) · 9 al-Minshawi murattal · 10 asy-Syuraim. Contoh: `python3 scripts/ambil_data.py 2:153 2`.

## Gaya kedua: "Kristal 3D" (`src/v_002153.tsx`)
Bila pengguna minta gaya lain / 3D. Berdiri sendiri (tidak guna `Shell`/`Sky`), hanya kongsi `makeAyat`, `parseTr`, pembantu animasi.
- Three.js melalui `@remotion/three` + `@react-three/fiber@8` + `three@0.170` (`ThreeCanvas`). Semua animasi dikira daripada frame (`a`), jangan guna `useFrame`/jam.
- Kamera dikawal komponen `Rig` (`useThree().camera.position.set` + `lookAt`). Format menegak sempitkan pandangan mendatar — jarak kamera ~14–19 unit supaya objek tidak terlalu besar. Semak tiada objek menghalang subjek dari sudut kamera.
- Palet ais/cyan atas hitam biru (`#04070d`, `#7fe9ff`, `#2cc9e8`); lantai grid, kabus, habuk zarah.
- Teks dalam kad kaca (backdrop-filter) di bawah; Arab = Scheherazade New 700, perkataan semasa terangkat + cahaya cyan; terjemahan DM Sans muncul dari kabur. Tajuk = Space Grotesk timbul (text-shadow berlapis). Nama akaun kiri atas dengan titik cyan.
- **Orang solat 3D** (`src/Musalli.tsx`): lelaki tanpa wajah berjubah + kopiah, kapsul/sfera. Pose `diri/takbir/qiyam/rukuk/sujud` (FK untuk kaki & badan, IK 2-tulang untuk tangan); `mixPose` + kerangka masa `KEYS`. Hadap profil 3/4 ke kamera (`FACE`) supaya rukuk/sujud jelas. Semak setiap pose dengan render frame. Boleh guna semula untuk ayat solat lain.
- Simbol: kristal (hati mukmin, naik ke atas bila orang solat muncul), batu + hujan (ujian), cincin perisai (sabar), lima tiang + sejadah (solat), pancaran dari atas (pertolongan Allah — Allah tidak digambarkan), riak lantai pada perkataan kunci.
- Render lebih lambat (~2.5 min, `--concurrency=2`), fail ~19 MB.

## Aliran VectorCraft + EffectCraft (bila pengguna minta "VectorCraft"/"EffectCraft")
Aplikasi sumber terbuka ArtCraft (Rust): https://github.com/storytold/vectorcraft dan https://github.com/storytold/effectcraft.
- Klon (`GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 ...` ke `/home/user/storytold/`) dan bina CLI: `cargo build --release -p vectorcraft-cli` (~17 min) dan `-p effectcraft-cli` (~14 min). Binari di `target/release/`.
- **VectorCraft** (`craft/vectorcraft_lukis.py`): setiap lapisan = satu dokumen 1080×1920 Pixels latar lutsinar; arahan `shape.ellipse|rectangle`, `path.create {d}`, `paint.setFill/setStroke`, `stroke.set`, `object.setProps {opacity}`, `effect.apply` (`stylize.outerGlow`, `stylize.innerGlow`, `stylize.feather`…) melalui `vectorcraft-cli run --commands F.json --export L.png --export L.vectorcraft`. Koordinat y ke bawah. Geometri dijana Python (`craft/geometri_30_54.py`).
- **EffectCraft** (`craft/effectcraft_animasi.py`): skrip gaya After Effects (`effectcraft-cli script F.jsx --empty`): `importFile` + `comp.layers.add`, keyframe `setValueAtTime`, ekspresi, kesan `Linear Wipe` (Wipe Angle 180 = dedah dari bawah), `Glow`, `CC Light Rays`, `CC Particle World` (Particle Type 3 = Faded Sphere, indeks bermula 1), `Add Grain` pada adjustment layer. Semak dengan `render-frame --time S`, render penuh `render P.ecproj --comp C --out bg.mp4 --audio off` (~14 min CPU untuk 38 s).
- **Remotion** hanya menindih teks/audio: `Shell` dengan prop `bg={<OffthreadVideo src=... />}` (lihat `src/v_030054_craft.tsx`). Teks Al-Quran kekal dalam Remotion demi ketepatan.
- Mampatkan output akhir (`ffmpeg -crf 25 -preset slow`) — butiran filem membesarkan fail. `public/craft/` tidak di-commit (jana semula dengan skrip).

## Video hadis
- Teks Arab dari fawazahmed0/hadith-api (jsDelivr, tanpa kunci): `python3 scripts/ambil_hadis.py <kitab> <no> --groups 5,4,... --baca 10,6,...` → `src/data/hadis_<kitab>_<no>.json`. Sanad dibuang automatik (matan = selepas tanda petik pertama). Edisi `ind-<kitab>` (Indonesia) boleh jadi rujukan terjemahan; terjemahan Melayu disusun sendiri — minta pengguna semak.
- **Semak nombor hadis**: penomboran Muslim dalam API ini berbeza daripada Abdul Baqi (cth. 2669 bukan hadis yang sama). Petik hanya nombor yang disahkan dari teks yang diambil.
- Tiada audio bacaan: masa perkataan dijana (`--perkataan` saat/perkataan, `--wpm` kelajuan baca terjemahan). Audio = `public/ambien_angin.mp3` (angin, dijana ffmpeg, bermula frame 0) + `public/tapak.wav` sebagai kesan bunyi melalui prop `extra` pada `Shell`. Tiada muzik.
- Fon Arab hadis = Amiri biasa (`arFont` dalam JSON), bukan Amiri Quran — bezakan hadis daripada ayat.
- Jangan lukis Nabi ﷺ; "Sabda Nabi ﷺ" boleh dalam teks.

## Teknikal
- `remotion.config.ts` guna Chromium di `/opt/pw-browsers/chromium_headless_shell-1243/...`; laraskan jika laluan lain.
- api.quran.com menolak User-Agent Python lalai — skrip sudah hantar `User-Agent: curl/8`.
- Bilangan segmen ≠ bilangan perkataan → skrip berhenti; semak tanda waqaf/simbol khas secara manual. Tanda hizb `۞` di awal ayat dilekatkan pada perkataan pertama secara automatik.

