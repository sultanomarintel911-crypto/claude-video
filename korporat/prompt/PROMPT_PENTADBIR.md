# Pakej Prompt: Perkenalan Pentadbir SKeSO (gaya "Objek Geganti")

Rujukan gaya: video Terafecta (Digital Luminaries Awards). Satu objek emblem 3D emas-hitam
terbang dari seorang ke seorang dan dari lokasi ke lokasi. Setiap watak menangkap, memegang
atau menghantar objek itu, dan nama mereka muncul sebagai lower-third emas.

Untuk SKeSO, objek geganti ialah **"Teras SKeSO"**: sfera hitam-emas dengan emblem atom
*SKeSO Be Excellent* bercahaya biru siber.

---

## 0. Aliran kerja (ikut urutan)

| Langkah | Alat dicadangkan | Hasil |
|---|---|---|
| 1. Jana **Teras SKeSO** sekali sahaja | Nano Banana (Gemini), Midjourney | `REF_TERAS.png`, latar putih/hitam |
| 2. Jana **bingkai pertama** setiap syot, dengan lampiran helaian karakter | Nano Banana / Flux Kontext (paling konsisten wajah) | `GB_A_mula.png` dan lain-lain |
| 3. (Pilihan) Jana **bingkai akhir** untuk syot hand-off | Sama | `GB_A_akhir.png` |
| 4. **Image-to-video** guna prompt JSON | Veo 3, Kling 2.x, Runway Gen-4 | klip 5–8 s |
| 5. Sunting, lower-third, gred warna, SFX | Saya (Remotion) / CapCut / Premiere | babak siap |

**Peraturan konsistensi:**
- Setiap prompt gambar **mesti dilampirkan**: helaian karakter pentadbir + `REF_TERAS.png` + gambar murid (jika ada).
- Gunakan **BLOK GAYA GLOBAL** yang sama di setiap prompt. Jangan ubah.
- Satu syot = satu aksi utama. Klip pendek (5–8 s) lebih stabil.
- Teks nama **jangan dijana AI**. Saya tambah sebagai lower-third semasa suntingan.

---

## 1. Blok tetap (salin ke setiap prompt)

**BLOK GAYA GLOBAL**
```
cinematic hyperreal photograph, shot on ARRI Alexa 35, anamorphic 40mm lens, golden-hour
sunlight, teal-and-gold colour grade, soft volumetric haze, shallow depth of field,
subtle film grain, Malaysian school setting in Dungun Terengganu, 16:9, 4K
```

**BLOK TERAS SKeSO** (objek geganti)
```
the "SKeSO Core": a floating glossy black sphere (about 25 cm) wrapped in polished gold
rings, front face embossed with the SKeSO atom emblem (school crest at the centre, three
electron orbits), emblem glowing cyan-blue, thin gold light trail behind it, levitating
by itself — match REF_TERAS.png exactly
```

**PAKAIAN** (isi ikut helaian karakter; ini andaian daripada video lama)
- Pentadbir lelaki: songkok hitam, sut gelap, kemeja putih, tali leher merah, tag nama.
- Murid lelaki: kemeja putih, seluar biru tua, tali leher hijau sekolah.
- Murid perempuan: baju kurung putih, kain biru tua, tudung putih.
- Murid sukan: baju-T ungu "PE", seluar trek gelap.

**NEGATIF (semua prompt)**
```
no text, no captions, no watermark, no extra fingers, no distorted face, no logo other than
the SKeSO emblem, no cartoon style, not plastic skin
```

---

## 2. Senarai syot

| # | Pentadbir | Lokasi | Tema portfolio | Tempoh |
|---|---|---|---|---|
| 00 | Pembuka | Langit atas sekolah → gerbang 1956 | Teras dilancarkan | 6 s |
| 1A/1B | **GB:** Rusmadi bin Abdullah | Gerbang 1956 → Microsoft Digital Hub | Peneraju visi digital, Showcase School | 8 + 6 s |
| 2A/2B | **PK Pentadbiran:** Tn Hj Mohd Shffri @ Hafizzudin b. Abu Bakar | Be Excellent Hub | Pengurusan pintar, SKeSO App, jadual | 7 + 6 s |
| 3A/3B | **PK HEM:** Razulddin bin Mustaffa | Dataran perhimpunan | Kebajikan murid, e-rekod kehadiran | 7 + 6 s |
| 4A/4B | **PK Kokurikulum:** Abu Seman bin Mat Salleh | Padang sekolah | Sukan, dron, analisis teknik | 7 + 6 s |
| 5A/5B | **PK Pendidikan Khas:** Baharudin bin Ismail | Hub Digital PPKI | Inklusif, iPad, Chromebook | 7 + 6 s |
| 99 | Penutup | Gerbang 1956, senja | Kelima-lima bersama, Teras meletup jadi logo | 7 s |

Jumlah ±85 s mentah. Selepas suntingan menjadi ±55–65 s.

---

## 3. Prompt setiap syot

### 00 · PEMBUKA: Teras dilancarkan

**Gambar (bingkai pertama)**
```
[BLOK GAYA GLOBAL] Aerial drone view at golden hour above SK Sultan Omar Dungun, red-roofed
school blocks and green field below, wispy clouds. High in the sky the [BLOK TERAS SKeSO]
streaks downward like a small comet with a long gold-and-cyan light trail.
Attach: REF_TERAS.png, school drone still (korporat 0:18).
```
**Video (JSON)**
```json
{
  "shot_id": "00_pembuka",
  "duration_s": 6,
  "start_frame": "00_mula.png",
  "action": "The SKeSO Core descends fast from the sky over the school, leaving a gold-cyan trail, then dives toward the school entrance arch.",
  "camera": {"movement": "drone tilt-down then fast push-in following the orb", "lens": "24mm", "speed": "accelerating", "stabilisation": "smooth gimbal"},
  "lighting": "golden hour, sun flare behind clouds",
  "style": "cinematic hyperreal, teal and gold grade",
  "physics": "orb keeps the same size and emblem, trail stays consistent",
  "audio_hint": "whoosh + deep impact on arrival",
  "negative": "no text, no extra objects, no logo change"
}
```

---

### 1A · GURU BESAR: menerima Teras di gerbang 1956

**Gambar**
```
[BLOK GAYA GLOBAL] Medium-wide shot. Encik Rusmadi bin Abdullah, the headmaster (match
GB_charsheet.png: face, glasses, build), wearing [PAKAIAN pentadbir lelaki], stands confidently
under the school entrance arch marked "1956" at sunset. He raises his right hand palm-up as
the [BLOK TERAS SKeSO] arrives and hovers just above his palm, gold sparks around it.
Calm, proud, visionary expression.
Attach: GB_charsheet.png, REF_TERAS.png, arch photo (korporat 0:28).
```
**Video (JSON)**
```json
{
  "shot_id": "1A_gb_terima",
  "duration_s": 8,
  "start_frame": "1A_mula.png",
  "subject": "Headmaster Encik Rusmadi bin Abdullah (keep identity from reference)",
  "action": "The orb glides in and settles above his palm; he looks at it, then lifts his gaze to camera with a confident smile.",
  "camera": {"movement": "slow arc right 30 degrees with gentle push-in to medium close-up", "lens": "50mm anamorphic", "speed": "slow", "focus": "rack focus from orb to face"},
  "lighting": "warm backlight sunset, rim light on shoulders",
  "style": "cinematic hyperreal, teal and gold",
  "negative": "no face morphing, no extra hands, no text"
}
```

### 1B · GURU BESAR: Microsoft Digital Hub (hand-off ke PK Pentadbiran)

**Gambar**
```
[BLOK GAYA GLOBAL, interior variant: cool daylight mixed with warm practicals] Inside the
Microsoft Digital Hub: white walls, blue accents, round tables, Minecraft Education poster.
The headmaster (GB_charsheet.png) stands beside a large touchscreen showing a glowing
"Showcase School" badge hologram. Year 5 pupils in [PAKAIAN murid] work on laptops behind
him. He gently pushes the [BLOK TERAS SKeSO] forward toward the exit door.
Attach: GB_charsheet.png, REF_TERAS.png, murid_charsheet.png, Digital Hub photo.
```
**Video (JSON)**
```json
{
  "shot_id": "1B_gb_hub",
  "duration_s": 6,
  "start_frame": "1B_mula.png",
  "end_frame": "1B_akhir.png (orb exits through the doorway, blurred corridor)",
  "action": "He taps the screen; the hologram badge brightens; he releases the orb, which flies past camera out of the room.",
  "camera": {"movement": "dolly left past pupils, then whip-pan following the orb", "lens": "35mm", "speed": "medium then fast whip"},
  "transition_out": "whip-pan blur to match next shot",
  "negative": "no text on screens except the badge, no distorted children faces"
}
```

---

### 2A · PK PENTADBIRAN: menangkap Teras di Be Excellent Hub

**Gambar**
```
[BLOK GAYA GLOBAL, interior] Be Excellent Hub: marble-textured feature wall, wall-mounted TV,
round wooden tables with teal chairs, Google "Future Classroom" wall sign. Tuan Haji Mohd
Shffri @ Hafizzudin bin Abu Bakar (match PKP_charsheet.png), wearing [PAKAIAN pentadbir lelaki],
catches the [BLOK TERAS SKeSO] in one hand while holding a tablet in the other.
Attach: PKP_charsheet.png, REF_TERAS.png, Be Excellent Hub photo.
```
**Video (JSON)**
```json
{
  "shot_id": "2A_pkp_tangkap",
  "duration_s": 7,
  "start_frame": "2A_mula.png",
  "action": "Orb enters frame from left with whip blur; he catches it smoothly, places it above the tablet; the orb projects a translucent cyan dashboard hologram (timetable grid, attendance chart, app icons) above the table.",
  "camera": {"movement": "whip-pan settle, then slow push-in over his shoulder onto the hologram", "lens": "35mm to 50mm feel", "speed": "fast settle then slow"},
  "hologram_note": "abstract UI shapes only, no readable text",
  "negative": "no text, no glitchy hands"
}
```

### 2B · PK PENTADBIRAN: SKeSO App di hujung jari

**Gambar**
```
[BLOK GAYA GLOBAL, interior] Close-up: his hand (PKP_charsheet.png sleeve and watch) swipes
across the floating hologram panels arranged in a ring; the [BLOK TERAS SKeSO] sits at the
centre like a core. In the soft background two teachers in formal attire nod.
```
**Video (JSON)**
```json
{
  "shot_id": "2B_pkp_app",
  "duration_s": 6,
  "action": "Panels rotate around the orb like orbits; he flicks one panel and the orb launches upward through the ceiling light.",
  "camera": {"movement": "orbit 90 degrees around the hologram, then tilt up following the orb", "lens": "50mm macro feel", "speed": "smooth"},
  "transition_out": "flash of light upward"
}
```

---

### 3A · PK HAL EHWAL MURID: dataran perhimpunan

**Gambar**
```
[BLOK GAYA GLOBAL, morning sunlight] School assembly square, pupils in neat rows wearing
[PAKAIAN murid lelaki & perempuan], school flags on poles. Encik Razulddin bin Mustaffa
(match PKHEM_charsheet.png), wearing [PAKAIAN pentadbir lelaki], stands in front with a
tablet. The [BLOK TERAS SKeSO] descends from the sky toward him.
Attach: PKHEM_charsheet.png, REF_TERAS.png, murid_charsheet.png.
```
**Video (JSON)**
```json
{
  "shot_id": "3A_hem_dataran",
  "duration_s": 7,
  "action": "The orb lands above his tablet; a cyan scanning wave sweeps across the rows of pupils and small green check icons float above each row (digital attendance). Pupils smile.",
  "camera": {"movement": "crane down from high angle to eye level behind him, revealing the rows", "lens": "28mm", "speed": "slow majestic"},
  "negative": "no text, no distorted children, consistent uniforms"
}
```

### 3B · PK HEM: kebajikan murid

**Gambar**
```
[BLOK GAYA GLOBAL] Medium shot: he kneels to eye level with two Year 3 pupils
(murid_charsheet.png), showing them a NILAM reading app on the tablet; the [BLOK TERAS SKeSO]
floats beside them, glowing softly. Warm, caring mood.
```
**Video (JSON)**
```json
{
  "shot_id": "3B_hem_murid",
  "duration_s": 6,
  "action": "A pupil taps the screen and laughs; he gives a thumbs-up; he tosses the orb gently toward the sports field in the background.",
  "camera": {"movement": "slow lateral truck right, then rack focus to the field as the orb flies away", "lens": "85mm", "speed": "slow"},
  "transition_out": "orb flies into the distance (match cut to 4A)"
}
```

---

### 4A · PK KOKURIKULUM: padang sekolah

**Gambar**
```
[BLOK GAYA GLOBAL, late afternoon] School field with goal posts and running track. Encik Abu
Seman bin Mat Salleh (match PKKO_charsheet.png), in [PAKAIAN sukan/kokurikulum per charsheet],
controls a drone remote; a white drone hovers above. Pupils in purple "PE" sports shirts
stand ready behind him. The [BLOK TERAS SKeSO] arrives and docks onto the drone.
Attach: PKKO_charsheet.png, REF_TERAS.png, murid_sukan_charsheet.png.
```
**Video (JSON)**
```json
{
  "shot_id": "4A_koko_dron",
  "duration_s": 7,
  "action": "The drone with the orb rises; the view switches to an FPV dive over the pupils sprinting on the track, with cyan motion-analysis lines tracing their strides.",
  "camera": {"movement": "start ground-level low angle, then FPV drone rise and dive", "lens": "16mm FPV", "speed": "dynamic, energetic"},
  "negative": "no text, no extra drones"
}
```

### 4B · PK KOKURIKULUM: analisis teknik

**Gambar**
```
[BLOK GAYA GLOBAL] Beside the field, he stands next to a large transparent hologram screen
showing a pupil's softball swing as glowing skeleton lines; pupils watch excitedly; the
[BLOK TERAS SKeSO] hovers at the top corner of the screen.
```
**Video (JSON)**
```json
{
  "shot_id": "4B_koko_analisis",
  "duration_s": 6,
  "action": "He draws a curved trajectory with his finger; the hologram replays the swing; he throws the orb like a pass toward the school building.",
  "camera": {"movement": "push-in through the hologram screen, then follow the throw", "lens": "35mm", "speed": "medium"},
  "transition_out": "orb passes through a classroom window"
}
```

---

### 5A · PK PENDIDIKAN KHAS: Hub Digital PPKI

**Gambar**
```
[BLOK GAYA GLOBAL, soft warm interior] Special-education digital hub: bright classroom, colourful
tiled floor, Smart TV on the wall, iPads and Chromebooks on low tables. Encik Baharudin bin
Ismail (match PKPK_charsheet.png), wearing [PAKAIAN pentadbir lelaki], sits at pupil height
beside a smiling pupil with special needs (respectful, dignified, match murid_PPKI_charsheet.png).
The [BLOK TERAS SKeSO] floats in gently through the window, glowing soft cyan.
Attach: PKPK_charsheet.png, REF_TERAS.png, murid_PPKI_charsheet.png, Hub PPKI photo.
```
**Video (JSON)**
```json
{
  "shot_id": "5A_ppki_hub",
  "duration_s": 7,
  "action": "The orb slows and lowers in front of the pupil; the pupil reaches out and touches it; soft colourful light shapes (letters, numbers, stars) bloom from the iPad. The teacher smiles warmly.",
  "camera": {"movement": "slow dolly-in at child eye level, gentle", "lens": "50mm", "speed": "very slow, tender"},
  "tone": "warm, inclusive, joyful; never pitying",
  "negative": "no text, no exaggerated features, respectful portrayal"
}
```

### 5B · PK PENDIDIKAN KHAS: menghantar Teras pulang

**Gambar**
```
[BLOK GAYA GLOBAL] He and the pupil hold the [BLOK TERAS SKeSO] together, both looking up
as it begins to rise; classmates clap in the background.
```
**Video (JSON)**
```json
{
  "shot_id": "5B_ppki_lepas",
  "duration_s": 6,
  "action": "Together they release the orb; it rises and flies out the window toward the sunset.",
  "camera": {"movement": "tilt up from their hands to the window, light flare", "lens": "35mm", "speed": "slow then lift"},
  "transition_out": "sun flare white-out"
}
```

---

### 99 · PENUTUP: barisan pentadbir bersatu

**Gambar**
```
[BLOK GAYA GLOBAL, blue-hour sunset] Wide hero shot in front of the "1956" school arch. All
five administrators standing in a V formation: headmaster (GB_charsheet.png) centre, PK
Pentadbiran and PK HEM on his left, PK Kokurikulum and PK Pendidikan Khas on his right,
all in [PAKAIAN pentadbir lelaki]. The [BLOK TERAS SKeSO] hovers above the headmaster.
Attach: all five charsheets, REF_TERAS.png, arch photo.
```
**Video (JSON)**
```json
{
  "shot_id": "99_penutup",
  "duration_s": 7,
  "action": "The orb rises, spins, and bursts into a ring of gold and cyan particles that form a large glowing SKeSO atom emblem in the sky; the five look up, then turn to camera.",
  "camera": {"movement": "slow pull-back and crane up to reveal the emblem above the arch", "lens": "24mm", "speed": "slow epic"},
  "negative": "no text, keep all five faces consistent, no extra people"
}
```

---

## 4. Tip penjanaan
- **Wajah lari?** Jana bingkai pertama semula dengan helaian karakter + 1 foto wajah jelas. Untuk video, guna mod *image-to-video*, bukan text-to-video.
- **Teras berubah rupa?** Sentiasa lampirkan `REF_TERAS.png`. Untuk syot hand-off, jana *bingkai akhir* juga (Veo / Kling first+last frame).
- **Kontinuiti:** objek keluar kiri bingkai di satu syot, mesti masuk dari kanan di syot berikutnya.
- Jana 2–4 versi setiap syot, pilih yang terbaik.
