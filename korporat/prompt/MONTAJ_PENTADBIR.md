# Character Reveal Sequence: Barisan Pentadbir SKeSO

Gaya trailer Hollywood. Watak diperkenalkan seorang demi seorang: **reveal dramatik → nama
menghentam skrin → aksi/perangai unik**. Peralihan antara watak menggunakan **whip pan**.

**Benang cerita:** Guru Besar menghantar satu **arahan** dari tabletnya. Setiap Penolong Kanan
menerimanya di lokasi masing-masing → **dolly zoom** (terkejut) → terus bertindak.

**Tempoh:** ±60–70 saat.

---

## 1. Siapa buat apa

| Teknik | Dijana AI (klip) | Dibuat semasa suntingan (saya, Remotion) |
|---|---|---|
| Low-angle hero shot | ✅ sudut kamera dalam prompt | gred warna "elit" (teal-oren, kontras) |
| Dolly zoom | ✅ diminta dalam prompt | boleh ditambah secara digital jika AI gagal |
| Speed ramp | jana pada kelajuan **biasa** | ✅ saya perlahankan/lajukan ikut rentak muzik |
| Whip pan | klip **berakhir** dengan whip pan ke kanan | ✅ kabur gerak + whoosh menyambung klip |
| Nama atas skrin | ❌ jangan biar AI tulis | ✅ kad nama menghentam + SFX |
| Muzik orkestra trailer | — | ✅ disegerakkan: hentakan pada setiap nama, bass drop pada finale |

**Peraturan untuk semua klip AI:** jana pada kelajuan biasa, 8 saat, satu syot, **tiada tulisan**.

---

## 2. Struktur dan rentak

| Masa | Babak | Teknik | Muzik |
|---|---|---|---|
| 0:00–0:06 | Emblem jatuh ke gerbang 1956 | pan + menjauh | dengungan rendah, denyut |
| 0:06–0:16 | **GURU BESAR**: hero walk, hantar arahan | low-angle, slow-mo → speed ramp | dram besar #1, nama HENTAM |
| 0:16–0:28 | **PK PENTADBIRAN**: terima arahan, buka panel | whip pan masuk, dolly zoom, speed ramp | hentakan #2 |
| 0:28–0:40 | **PK HEM**: terima arahan, rondaan | whip pan, dolly zoom, low-angle walk | hentakan #3 |
| 0:40–0:52 | **PK KOKURIKULUM**: sepakan masuk gawang | whip pan, speed ramp, sorakan | hentakan #4, brass |
| 0:52–1:02 | **PK PENDIDIKAN KHAS**: murid PPKI sentuh iPad | whip pan, dolly-in lembut | muzik reda seketika (emosi) |
| 1:02–1:10 | **FINALE**: kelima-lima berjalan serentak | low-angle hero, slow-mo | **BASS DROP**, tajuk |

---

## 3. Kad nama (dibuat semasa suntingan)

Ringkas dan rasmi: **nama + jawatan sahaja**, tiada baris tambahan.

```
RUSMADI BIN ABDULLAH
GURU BESAR
```

---

## 4. Prompt klip

Gunakan bingkai/latar yang sudah disediakan dalam `bingkai/`. Langkah 1 (kemaskan bingkai dengan
Nano Banana) sama seperti fail prompt setiap watak.

### 4.1 · GURU BESAR: arahan dihantar
**Klip sedia ada:** `Man_animating_hovering_object` (7.8 s). GB di gerbang senja, emblem SKeSO
terapung di tapak tangan, kamera tolak masuk ke syot dekat.
**Sambungan (4.1b):** bingkai pertama = `bingkai/1B_gb_sambungan_mula.png` (bingkai terakhir klip
tadi, dengan tulisan "Teras" yang dijana AI dibuang).

```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 6 saat, satu syot berterusan, gaya trailer filem aksi, sambungan terus daripada imej permulaan.",
  "rujukan": "Gunakan imej permulaan. Kekalkan wajah, cermin mata, songkok, sut hitam, kemeja putih dan tali leher merah Guru Besar, emblem bulat biru-emas di atas tapak tangannya, cahaya senja dan pintu gerbang kabur di latar.",
  "urutan": [
    {
      "masa": "0–2 saat",
      "aksi": "Guru Besar menurunkan pandangan daripada emblem dan memandang terus ke lensa dengan tegas dan yakin. Emblem terus berputar perlahan di atas tapak tangannya.",
      "kamera": "Kamera statik pada syot dekat, sedikit dari bawah (low-angle)."
    },
    {
      "masa": "2–4 saat",
      "aksi": "Guru Besar menolak tapak tangannya ke hadapan dengan tegas. Emblem memancar terang dan berpecah menjadi empat jalur cahaya biru-emas yang meluncur laju ke empat arah berbeza, meninggalkan ekor cahaya di udara senja.",
      "kamera": "Tarik ke belakang (pull back) dengan pantas ke syot separuh badan, menampakkan jalur cahaya terbang keluar dari bingkai."
    },
    {
      "masa": "4–6 saat",
      "aksi": "Guru Besar menurunkan tangan, berdiri tegak memerhati jalur cahaya terakhir hilang ke kanan, kemudian tersenyum kecil.",
      "kamera": "Whip pan pantas ke kanan mengikut jalur cahaya terakhir, dengan kabur gerak yang kuat."
    }
  ],
  "pencahayaan": "Matahari terbenam di belakang, rim light keemasan, kontras tinggi, gred teal-oren.",
  "audio": "Tiada dialog, tiada narasi, tiada suara manusia. Hanya bunyi ambien semula jadi yang perlahan.",
  "negatif": "Jangan ubah wajah, jangan tambah tulisan atau label di atas emblem, jangan tambah orang lain, jangan herotkan tangan."
}
```
*Empat jalur cahaya = arahan kepada empat Penolong Kanan. Setiap scene PK seterusnya dibuka
dengan jalur cahaya itu tiba (saya tambah semasa suntingan) sebelum dolly zoom.*

### 4.2 · PK PENTADBIRAN: arahan diterima (dolly zoom)

**Langkah 1: imej permulaan (Nano Banana / Gemini)**
Lampirkan `bingkai/2A_pkp_mula.png` + lembaran watak CIKGU SHFFRI:

> Gunakan bilik dalam gambar ini (Be Excellent Hub: dinding marmar, TV hitam, panel kayu berlampu,
> tulisan Google Future Classroom, meja bulat dan kerusi teal) dan kekalkan sepenuhnya. Jadikan
> **syot sederhana dekat (paras pinggang ke atas)**: Cikgu Shffri berdiri di sebelah kanan TV,
> badan serong 45°, memegang tablet hitam dengan kedua-dua tangan di paras dada sambil membaca
> skrin dengan tenang. Kekalkan wajah, cermin mata, rambut tanpa songkok, sut hitam, kemeja biru
> muda, tali leher merah bercorak dan tanda nama SHFFRI tepat seperti lembaran watak. Kamera
> sedikit dari bawah. Pencahayaan dalam bilik lembut, gred teal-oren sinematik. Fotorealistik
> 16:9. Tiada tulisan tambahan.

**Langkah 2: image-to-video**
```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 8 saat, satu syot berterusan, gaya trailer filem aksi.",
  "rujukan": "Gunakan imej permulaan. Kekalkan wajah, cermin mata, rambut, sut hitam, kemeja biru muda, tali leher merah bercorak dan tanda nama guru. Be Excellent Hub lokasi sebenar dan MESTI kekal sama: dinding marmar, TV, panel kayu berlampu, tulisan Google Future Classroom. Jangan tambah songkok.",
  "urutan": [
    {
      "masa": "0–1.5 saat",
      "aksi": "Satu jalur cahaya biru-emas meluncur masuk dari kiri bingkai dan menyambar tablet di tangan guru. Skrin tablet menyala terang, memancarkan cahaya biru ke wajahnya.",
      "kamera": "Kamera statik, syot sederhana dekat."
    },
    {
      "masa": "1.5–3.5 saat",
      "aksi": "Mata guru membesar dan keningnya terangkat, terkejut membaca arahan pada skrin.",
      "kamera": "Dolly zoom (kesan vertigo): kamera bergerak ke hadapan sambil zum keluar; wajah guru kekal sama saiz manakala TV dan dinding marmar di belakang meregang menjauh."
    },
    {
      "masa": "3.5–6 saat",
      "aksi": "Riak terkejut bertukar menjadi senyuman yakin. Guru meleret jari pada tablet dengan pantas ke arah TV; panel hologram segi empat besar terbuka di hadapan TV, permukaan kelabu gelap dan kosong.",
      "kamera": "Melengkung pantas ke kiri sehingga guru dan panel berada dalam satu bingkai."
    },
    {
      "masa": "6–8 saat",
      "aksi": "Guru berdiri tegak di sebelah panel dan memandang lensa dengan yakin.",
      "kamera": "Turun ke sudut rendah (low-angle hero shot), tahan sekejap, kemudian whip pan pantas ke kanan dengan kabur gerak yang kuat."
    }
  ],
  "panel": "Bahagian dalam panel kekal kelabu gelap dan kosong, tanpa tulisan, ikon atau logo. Cahaya biru hanya pada bingkai luar.",
  "pencahayaan": "Cahaya dalam bilik lembut, lampu jalur kayu hangat, pantulan biru dari tablet pada wajah, gred teal-oren.",
  "audio": "Tiada dialog, tiada narasi, tiada suara manusia. Hanya bunyi ambien semula jadi yang perlahan.",
  "negatif": "Jangan ubah wajah atau bilik, jangan tambah songkok, jangan tambah orang lain, tiada tulisan."
}
```
*Suntingan: whip pan masuk dari klip GB → jalur cahaya tiba → dolly zoom → panel diisi paparan
SKeSO App → kad nama "TN HJ MOHD SHFFRI @ HAFIZZUDIN BIN ABU BAKAR / PENOLONG KANAN PENTADBIRAN"
menghentam pada rentak → whip pan keluar.*

### 4.3 · PK HEM: arahan diterima di koridor (dolly zoom)
Bingkai pertama: `bingkai/3_hem_hero_mula.webp` (hero shot sedia ada: koridor mural Israk dan
Mikraj di kiri, papan kenyataan di kanan, tablet di bawah lengan kanan).
```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 8 saat, satu syot berterusan, gaya trailer filem aksi.",
  "rujukan": "Gunakan imej permulaan. Kekalkan wajah, cermin mata, rambut tanpa songkok, sut hitam, kemeja jalur biru, tali leher merah bercorak, tanda nama ROAZMI dan tablet hitam. Koridor ini lokasi sebenar dan MESTI kekal sama: mural Israk dan Mikraj di dinding kiri, papan kenyataan dan bingkai visi sekolah di kanan, bangku kayu.",
  "urutan": [
    {
      "masa": "0–1.5 saat",
      "aksi": "Guru berdiri tegak dengan tablet di bawah lengan. Satu jalur cahaya biru-emas meluncur masuk dari hujung koridor di belakangnya dan menyambar tablet; tablet bergetar dan memancarkan cahaya biru.",
      "kamera": "Kamera statik, sudut rendah (low-angle hero shot) seperti imej permulaan."
    },
    {
      "masa": "1.5–3.5 saat",
      "aksi": "Guru mengangkat tablet ke paras dada dan memandang skrin yang menyala; matanya membesar, terkejut membaca arahan.",
      "kamera": "Dolly zoom (kesan vertigo): kamera bergerak ke hadapan sambil zum keluar; wajah guru kekal sama saiz manakala koridor di belakang meregang memanjang."
    },
    {
      "masa": "3.5–6.5 saat",
      "aksi": "Guru mengangguk tegas, menyelitkan tablet kembali di bawah lengan dan mula berjalan laju ke arah kamera dengan penuh tekad.",
      "kamera": "Sudut rendah dari paras pinggang, kamera mundur pantas seiring langkahnya."
    },
    {
      "masa": "6.5–8 saat",
      "aksi": "Guru berhenti dekat dengan kamera dan memandang lensa dengan yakin.",
      "kamera": "Tahan sekejap, kemudian whip pan pantas ke kanan dengan kabur gerak yang kuat."
    }
  ],
  "pencahayaan": "Cahaya siang lembut dari hujung koridor, pantulan biru dari tablet pada wajah, gred teal-oren.",
  "audio": "Tiada dialog, tiada narasi, tiada suara manusia. Hanya bunyi ambien semula jadi yang perlahan.",
  "negatif": "Jangan ubah wajah atau tanda nama, jangan tambah songkok, jangan ubah mural atau koridor, tiada orang tambahan, tiada tulisan tambahan."
}
```
*Suntingan: whip pan masuk dari PKP → jalur cahaya → dolly zoom (digital jika AI gagal) → speed ramp
pada langkah pertama → kad nama "ROAZMI ... / PENOLONG KANAN HAL EHWAL MURID" → whip pan keluar.*

### 4.4 · PK KOKURIKULUM: sepakan (speed ramp semasa suntingan)
Imej permulaan: jana seperti `PROMPT_4_PK_KO.md` (4A).
```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 8 saat, satu syot berterusan, kelajuan biasa, gaya trailer filem aksi.",
  "rujukan": "Gunakan imej permulaan. Kekalkan wajah, songkok, baju sukan ungu, seluar trek PK Kokurikulum, pakaian murid, gawang dan bangunan sekolah.",
  "urutan": [
    {
      "masa": "0–2 saat",
      "aksi": "PK Kokurikulum memandang gawang dengan fokus tajam, berundur dua langkah.",
      "kamera": "Sudut sangat rendah di sebelah bola (low-angle hero shot), PK Kokurikulum menjulang ke langit."
    },
    {
      "masa": "2–4 saat",
      "aksi": "Dia berlari dan menyepak bola dengan kuat; bola meluncur masuk ke sudut atas gawang, jaring bergegar.",
      "kamera": "Kamera mengikut bola dengan pan pantas ke gawang."
    },
    {
      "masa": "4–6 saat",
      "aksi": "Murid di tepi padang melompat, bersorak dan bertepuk tangan.",
      "kamera": "Berpusing pantas ke arah murid."
    },
    {
      "masa": "6–8 saat",
      "aksi": "PK Kokurikulum mengangkat ibu jari dan memandang lensa dengan bangga.",
      "kamera": "Tolak masuk ke syot separuh badan, kemudian whip pan pantas ke kanan dengan kabur gerak."
    }
  ],
  "fizik": "Hanya satu bola, bergerak realistik dan masuk ke dalam gawang.",
  "audio": "Tiada dialog, tiada narasi, tiada suara manusia. Hanya bunyi ambien semula jadi yang perlahan.",
  "negatif": "Jangan ubah wajah, jangan tambah bola kedua, jangan herotkan kaki, tiada tulisan."
}
```
*Speed ramp:* saya perlahankan detik kaki menyentuh bola (×0.25), kemudian lajukan bola ke gawang (×2), diselaraskan dengan hentakan dram.

### 4.5 · PK PENDIDIKAN KHAS: detik emosi
⏳ Menunggu lembaran watak Encik Baharudin bin Ismail. Lokasi: `lokasi/17_hub_ppki_microsoft.jpg`.
```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 8 saat, satu syot berterusan, gaya trailer, nada hangat.",
  "rujukan": "Gunakan imej permulaan. Kekalkan wajah dan pakaian PK Pendidikan Khas dan murid, serta Hub Digital PPKI.",
  "urutan": [
    {
      "masa": "0–3 saat",
      "aksi": "Murid PPKI menyentuh skrin iPad dengan teragak-agak; PK Pendidikan Khas membimbing tangannya dengan lembut.",
      "kamera": "Dolly-in sangat perlahan pada paras mata murid, kedalaman medan cetek."
    },
    {
      "masa": "3–6 saat",
      "aksi": "Murid tersenyum lebar dan ketawa gembira; PK Pendidikan Khas tersenyum bangga memandang murid.",
      "kamera": "Alih fokus perlahan dari tangan ke wajah kedua-duanya. Gerak perlahan."
    },
    {
      "masa": "6–8 saat",
      "aksi": "PK Pendidikan Khas berdiri dan memandang lensa dengan senyuman hangat.",
      "kamera": "Sudut rendah lembut (low-angle), tahan dua saat."
    }
  ],
  "nada": "Hangat, inklusif, bermaruah. Bukan simpati berlebihan.",
  "audio": "Tiada dialog, tiada narasi, tiada suara manusia. Hanya bunyi ambien semula jadi yang perlahan.",
  "negatif": "Jangan herotkan wajah murid, tiada tulisan."
}
```

### 4.6 · FINALE: barisan pentadbir
Imej permulaan: jana dengan kelima-lima lembaran watak + `lokasi/01_gerbang_1956_senja.jpg`.
```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 8 saat, satu syot berterusan, gerak perlahan, gaya poster filem aksi.",
  "rujukan": "Gunakan imej permulaan. Kekalkan wajah, pakaian dan kedudukan kelima-lima pentadbir serta pintu gerbang 1956.",
  "urutan": [
    {
      "masa": "0–5 saat",
      "aksi": "Kelima-lima pentadbir berjalan serentak keluar dari pintu gerbang ke arah kamera dalam formasi V, Guru Besar di tengah hadapan. Langkah yakin dan seragam.",
      "kamera": "Sudut sangat rendah dari paras tanah (low-angle hero shot), kamera mundur perlahan. Gerak perlahan."
    },
    {
      "masa": "5–8 saat",
      "aksi": "Mereka berhenti serentak dan memandang lensa. Matahari terbenam di belakang memancar di celah mereka.",
      "kamera": "Kamera naik perlahan (crane up) menampakkan gerbang dan langit senja. Tahan dua saat."
    }
  ],
  "pencahayaan": "Matahari terbenam di belakang (rim light kuat), suar kanta, gred teal-oren.",
  "audio": "Tiada dialog, tiada narasi, tiada suara manusia. Hanya bunyi ambien semula jadi yang perlahan.",
  "negatif": "Jangan ubah wajah, tiada orang tambahan, tiada tulisan."
}
```

---

## 5. Muzik
Muzik **orkestra trailer** (dram besar, brass, bass drop) tidak dapat saya sintesis setanding
studio. Pilih satu lagu bebas royalti, contohnya di Pixabay Music dengan kata kunci
**"epic trailer"**, **"cinematic action trailer"** atau **"hybrid orchestral"**. Pilih lagu yang
ada **hentakan berulang** dan **bass drop / klimaks** sekitar 50–60 saat. Saya akan potong dan
selaraskan setiap reveal, speed ramp dan whip pan dengan rentaknya, serta tambah SFX
(whoosh, hit, riser, braaam).
