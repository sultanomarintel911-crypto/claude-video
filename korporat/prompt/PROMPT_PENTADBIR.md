# Pakej Prompt: Perkenalan Barisan Pentadbir SKeSO

Setiap pentadbir mendapat **2 syot (±8 s)** yang sesuai dengan watak dan portfolio masing-masing:
- **Syot A:** watak dan perkenalan
- **Syot B:** aksi portfolio

Setiap syot ada dua bahagian:
1. **Prompt imej permulaan.** Jana gambar dulu, dengan helaian karakter dilampirkan.
2. **Prompt JSON video.** Image-to-video, guna imej permulaan tadi.

**Nota panel hologram:** semua panel dan skrin dibiarkan **kelabu gelap dan kosong**. Kandungan
sebenar (SKeSO App, Google Classroom, data DELIMa, lencana Showcase dan lain-lain) akan saya
masukkan semasa suntingan. Hasilnya tulisan tepat dan tidak herot.

---

## Blok tetap (salin ke setiap prompt imej)

**GAYA**
> Foto sinematik fotorealistik 16:9, kanta 35–50mm, kedalaman medan cetek, cahaya semula jadi yang lembut, gred warna biru-teal dan hangat, butiran kulit semula jadi, suasana sekolah rendah di Dungun, Terengganu.

**PAKAIAN** (tukar ikut helaian karakter sebenar)
- Pentadbir: ikut `[NAMA]_charsheet`: wajah, cermin mata, songkok, sut, tali leher, tanda nama.
- Murid lelaki: blazer **merah marun** (2 butang, kolar lapel), kemeja berkolar terang, tali leher marun, seluar panjang biru tua. Rujuk `CHARSHEET_MURID.md` (M1, M3).
- Murid perempuan: blazer **merah marun**, kemeja biru muda, tali leher marun, kain labuh biru tua, tudung bawal **biru tua**. Rujuk M2, M4.
- Murid aktiviti / sukan: baju-T **ungu-magenta** bertulisan skrip putih "SKeSO" di belakang, seluar trek gelap. Rujuk M5.
- Murid PPKI: seragam blazer marun, digambarkan dengan hormat. Rujuk M6.

**NEGATIF**
> Tiada tulisan, tiada sari kata, tiada tera air, tiada logo tambahan, jari tidak herot, wajah tidak berubah, bukan gaya kartun.

---

## 1. GURU BESAR: Encik Rusmadi bin Abdullah
*Watak: peneraju visi digital, tenang, berwibawa.*

### 1A · Berjalan di koridor
**Imej permulaan**
> [GAYA] Syot sederhana luas. Guru Besar (rujuk GB_charsheet) berjalan di koridor sekolah bertiang kuning pada waktu pagi, cahaya matahari masuk dari sisi. Di belakangnya pintu bilik bertanda "Microsoft Digital Hub". Riak wajah yakin dan mesra. Lampirkan: GB_charsheet, foto koridor sekolah.

```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 8 saat, satu syot berterusan.",
  "rujukan": "Gunakan imej permulaan. Kekalkan wajah, cermin mata, songkok, pakaian dan tanda nama Guru Besar serta susun atur koridor.",
  "urutan": [
    {
      "masa": "0–3 saat",
      "aksi": "Guru Besar berjalan perlahan ke arah kamera di sepanjang koridor dengan langkah yakin. Cahaya pagi menyinari sisi wajahnya.",
      "kamera": "Kamera bergerak ke belakang secara perlahan (dolly mundur), mengekalkan jarak yang sama dengan Guru Besar."
    },
    {
      "masa": "3–5 saat",
      "aksi": "Guru Besar berhenti, menoleh sedikit ke arah pintu Digital Hub, kemudian kembali memandang lensa.",
      "kamera": "Kamera berhenti dan melengkung sedikit ke kanan untuk menampakkan pintu di belakangnya."
    },
    {
      "masa": "5–8 saat",
      "aksi": "Guru Besar tersenyum kecil dan mengangguk sekali dengan berwibawa. Tangan dirapatkan di hadapan.",
      "kamera": "Tolak masuk perlahan ke syot separuh badan. Tahan komposisi akhir selama dua saat."
    }
  ],
  "suasana": "Tenang, berwibawa, inspirasi."
}
```

### 1B · Di bilik Guru Besar, memandang masa depan
**Imej permulaan**
> [GAYA] Bilik Guru Besar yang kemas, tingkap besar menghadap padang sekolah. Guru Besar berdiri di tepi tingkap memegang tablet. Di atas meja ada piala dan bingkai sijil (kabur). Lampirkan: GB_charsheet.

```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 8 saat, satu syot berterusan.",
  "rujukan": "Gunakan imej permulaan. Kekalkan wajah, pakaian, tanda nama, kedudukan tingkap dan meja.",
  "urutan": [
    {
      "masa": "0–3 saat",
      "aksi": "Guru Besar memandang ke luar tingkap ke arah padang sekolah, termenung seketika.",
      "kamera": "Bermula dari belakang bahu Guru Besar, padang kelihatan kabur di luar tingkap."
    },
    {
      "masa": "3–5 saat",
      "aksi": "Guru Besar berpaling ke dalam bilik dan mengetik tablet sekali. Bingkai hologram biru muncul di hadapannya.",
      "kamera": "Melengkung perlahan ke hadapan Guru Besar sehingga wajah dan tablet kelihatan."
    },
    {
      "masa": "5–8 saat",
      "aksi": "Bingkai hologram terbuka menjadi panel segi empat kelabu gelap yang kosong. Guru Besar memandang panel dengan yakin.",
      "kamera": "Alih fokus dari wajah ke panel. Kekalkan keseluruhan bingkai hologram dalam syot dan tahan dua saat."
    }
  ],
  "panel": "Bahagian dalam panel kekal kelabu gelap dan kosong, tanpa tulisan, ikon atau logo. Cahaya biru hanya pada bingkai luar."
}
```

---

## 2. PK PENTADBIRAN: Tn Hj Mohd Shffri @ Hafizzudin bin Abu Bakar
*Watak: pengurus sistem, teliti, cekap. Pengurusan pintar dan data.*

### 2A · Di meja pentadbiran
**Imej permulaan**
> [GAYA] PK Pentadbiran (rujuk PKP_charsheet) duduk di meja pejabat yang kemas, tablet di atas meja, rak fail tersusun di belakang (kabur). Cahaya tingkap lembut. Lampirkan: PKP_charsheet.

```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 8 saat, satu syot berterusan.",
  "rujukan": "Gunakan imej permulaan. Kekalkan wajah, pakaian dan tanda nama guru serta kedudukan meja dan tablet.",
  "urutan": [
    {
      "masa": "0–2 saat",
      "aksi": "Guru duduk di mejanya dan memandang lensa seketika dengan yakin. Guru kembali memandang tablet lalu mengetik skrin sekali. Bingkai hologram biru muncul di atas tablet.",
      "kamera": "Mulakan dari sudut serong dengan fokus pada wajah guru. Alih fokus ke jari ketika guru mengetik."
    },
    {
      "masa": "2–4 saat",
      "aksi": "Guru meleret jari pada skrin fizikal tablet. Bingkai hologram terbuka sepenuhnya menjadi panel segi empat dengan permukaan kelabu gelap yang rata dan kosong.",
      "kamera": "Bergerak melengkung secara perlahan sehingga kamera hampir tegak menghadap panel."
    },
    {
      "masa": "4–8 saat",
      "aksi": "Guru menurunkan tangan ke atas meja dan memandang panel. Panel kekal stabil dan keempat-empat penjurunya jelas.",
      "kamera": "Bergerak lurus ke arah panel sambil mengalihkan fokus daripada guru ke panel. Kekalkan keseluruhan bingkai hologram dalam syot dan tahan komposisi akhir selama dua saat."
    }
  ],
  "panel": "Bahagian dalam panel kekal kelabu gelap dan kosong, tanpa tulisan, ikon atau logo. Cahaya biru hanya pada bingkai luar."
}
```
*(Panel ini akan diisi dengan paparan SKeSO App atau jadual waktu digital.)*

### 2B · Taklimat di Be Excellent Hub
**Imej permulaan**
> [GAYA] Be Excellent Hub: dinding bercorak marmar, TV besar di dinding, meja bulat kayu dan kerusi teal. PK Pentadbiran berdiri di sebelah TV sambil menunjuk ke skrin; dua orang guru duduk mendengar. Skrin TV gelap. Lampirkan: PKP_charsheet, foto Be Excellent Hub.

```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 8 saat, satu syot berterusan.",
  "rujukan": "Gunakan imej permulaan. Kekalkan wajah, pakaian dan tanda nama PK Pentadbiran, susun atur bilik dan kedudukan TV.",
  "urutan": [
    {
      "masa": "0–3 saat",
      "aksi": "PK Pentadbiran menerangkan sesuatu sambil menunjuk ke skrin TV. Dua guru mengangguk.",
      "kamera": "Syot luas dari belakang guru yang duduk, bergerak perlahan ke kanan (truck)."
    },
    {
      "masa": "3–6 saat",
      "aksi": "PK Pentadbiran berpaling kepada guru dan tersenyum, tangan terbuka seolah-olah menjemput pandangan.",
      "kamera": "Tolak masuk perlahan ke arah PK Pentadbiran, fokus pada wajahnya."
    },
    {
      "masa": "6–8 saat",
      "aksi": "PK Pentadbiran memandang lensa seketika dengan yakin.",
      "kamera": "Tahan komposisi separuh badan dengan skrin TV kelihatan di sebelah."
    }
  ],
  "skrin": "Skrin TV kekal kelabu gelap rata, tanpa tulisan atau imej, keempat-empat penjuru jelas."
}
```

---

## 3. PK HAL EHWAL MURID: Encik Razulddin bin Mustaffa
*Watak: penyayang, tegas tetapi mesra. Kebajikan dan disiplin murid.*

### 3A · Dataran perhimpunan
**Imej permulaan**
> [GAYA, cahaya pagi keemasan] Dataran perhimpunan sekolah. Murid (rujuk murid_charsheet) berbaris kemas, tiang bendera di belakang. PK HEM (rujuk PKHEM_charsheet) berdiri di hadapan barisan memegang tablet. Lampirkan: PKHEM_charsheet, murid_charsheet.

```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 8 saat, satu syot berterusan.",
  "rujukan": "Gunakan imej permulaan. Kekalkan wajah, pakaian, tanda nama PK HEM, pakaian seragam murid dan susunan barisan.",
  "urutan": [
    {
      "masa": "0–3 saat",
      "aksi": "PK HEM memandang barisan murid, kemudian mengetik tablet sekali. Bingkai hologram biru kecil muncul di atas tablet.",
      "kamera": "Mulakan dari sudut tinggi di atas barisan murid (crane), turun perlahan ke paras mata di belakang bahu PK HEM."
    },
    {
      "masa": "3–5 saat",
      "aksi": "Bingkai hologram terbuka menjadi panel segi empat kelabu gelap yang kosong. Murid di barisan hadapan tersenyum.",
      "kamera": "Kamera berhenti di belakang bahu, panel dan barisan murid kelihatan serentak."
    },
    {
      "masa": "5–8 saat",
      "aksi": "PK HEM menoleh ke lensa dan tersenyum mesra.",
      "kamera": "Melengkung perlahan ke hadapan PK HEM. Tahan dua saat."
    }
  ],
  "panel": "Panel kelabu gelap dan kosong, tanpa tulisan atau ikon. Cahaya biru hanya pada bingkai luar."
}
```
*(Panel ini akan diisi dengan e-rekod kehadiran atau data HEM.)*

### 3B · Bersama murid di koridor
**Imej permulaan**
> [GAYA] Koridor sekolah yang terang. PK HEM membongkok ke paras mata dua murid Tahun 3 (seorang lelaki, seorang perempuan); seorang murid memegang tablet. Suasana mesra dan penyayang. Lampirkan: PKHEM_charsheet, murid_charsheet.

```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 8 saat, satu syot berterusan.",
  "rujukan": "Gunakan imej permulaan. Kekalkan wajah dan pakaian PK HEM serta kedua-dua murid.",
  "urutan": [
    {
      "masa": "0–3 saat",
      "aksi": "Murid menunjukkan skrin tablet kepada PK HEM dengan gembira. PK HEM mendengar dengan teliti.",
      "kamera": "Syot sederhana pada paras mata murid, bergerak perlahan ke kiri."
    },
    {
      "masa": "3–6 saat",
      "aksi": "PK HEM tersenyum dan memberi isyarat ibu jari ke atas. Murid ketawa kecil.",
      "kamera": "Alih fokus dari tablet ke wajah PK HEM."
    },
    {
      "masa": "6–8 saat",
      "aksi": "PK HEM menepuk bahu murid dengan lembut dan berdiri.",
      "kamera": "Tilt naik perlahan mengikut PK HEM berdiri. Tahan komposisi akhir."
    }
  ],
  "skrin": "Skrin tablet dipalingkan dari kamera atau kelihatan gelap, tiada tulisan."
}
```

---

## 4. PK KOKURIKULUM: Encik Abu Seman bin Mat Salleh
*Watak: bertenaga, sukan, membina bakat. Kokurikulum dan sukan.*

### 4A · Di padang sekolah
**Imej permulaan**
> [GAYA, cahaya petang keemasan] Padang sekolah dengan trek larian. PK Kokurikulum (rujuk PKKO_charsheet, pakaian sukan/kokurikulum mengikut helaian) berdiri di tepi trek memegang tablet. Murid berbaju-T ungu-magenta "SKeSO" (rujuk M5) bersedia di garisan permulaan. Lampirkan: PKKO_charsheet, charsheet M5.

```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 8 saat, satu syot berterusan.",
  "rujukan": "Gunakan imej permulaan. Kekalkan wajah dan pakaian PK Kokurikulum, baju sukan murid dan susun atur padang.",
  "urutan": [
    {
      "masa": "0–2 saat",
      "aksi": "PK Kokurikulum mengangkat tangan memberi isyarat mula. Murid mula berlari.",
      "kamera": "Sudut rendah dari tepi trek, PK Kokurikulum di latar depan."
    },
    {
      "masa": "2–5 saat",
      "aksi": "PK Kokurikulum merakam larian murid menggunakan tablet, mengikut gerakan mereka.",
      "kamera": "Pan perlahan mengikut murid berlari, kemudian kembali kepada PK Kokurikulum."
    },
    {
      "masa": "5–8 saat",
      "aksi": "PK Kokurikulum menurunkan tablet, memandang lensa dan tersenyum bangga.",
      "kamera": "Tolak masuk ke syot separuh badan. Tahan dua saat."
    }
  ],
  "suasana": "Bertenaga, ceria, cahaya petang keemasan."
}
```

### 4B · Analisis teknik bersama murid
**Imej permulaan**
> [GAYA] Di bawah khemah tepi padang. PK Kokurikulum berdiri di sebelah panel hologram besar berbingkai biru, tiga murid berbaju-T ungu "SKeSO" (rujuk M5) memerhati dengan teruja. Lampirkan: PKKO_charsheet, charsheet M5.

```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 8 saat, satu syot berterusan.",
  "rujukan": "Gunakan imej permulaan. Kekalkan wajah dan pakaian semua watak serta kedudukan panel hologram.",
  "urutan": [
    {
      "masa": "0–3 saat",
      "aksi": "PK Kokurikulum menunjuk ke arah panel hologram sambil menerangkan. Murid mengangguk.",
      "kamera": "Syot luas dari sisi, bergerak melengkung perlahan ke hadapan panel."
    },
    {
      "masa": "3–6 saat",
      "aksi": "PK Kokurikulum melukis garis lengkung di udara dengan jarinya di hadapan panel. Seorang murid meniru gerakan memukul.",
      "kamera": "Kamera hampir tegak menghadap panel, watak di sisi."
    },
    {
      "masa": "6–8 saat",
      "aksi": "Semua berpaling ke panel. Panel kekal stabil.",
      "kamera": "Tolak masuk perlahan ke panel. Kekalkan keseluruhan bingkai dalam syot dan tahan dua saat."
    }
  ],
  "panel": "Panel kelabu gelap dan kosong, tanpa tulisan atau ikon. Cahaya biru hanya pada bingkai luar."
}
```
*(Panel ini akan diisi dengan analisis gerakan sukan.)*

---

## 5. PK PENDIDIKAN KHAS: Encik Baharudin bin Ismail
*Watak: penyabar, penyayang, inklusif. Pendidikan khas digital.*

### 5A · Membimbing murid di Hub Digital PPKI
**Imej permulaan**
> [GAYA, cahaya hangat dalam bilik] Hub Digital PPKI: lantai berwarna-warni, Smart TV di dinding, iPad dan Chromebook di atas meja rendah. PK Pendidikan Khas (rujuk PKPK_charsheet) duduk di paras murid di sebelah seorang murid berkeperluan khas yang tersenyum (rujuk murid_PPKI_charsheet), menggambarkannya dengan penuh hormat dan bermaruah. Lampirkan: PKPK_charsheet, murid_PPKI_charsheet, foto Hub PPKI.

```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 8 saat, satu syot berterusan.",
  "rujukan": "Gunakan imej permulaan. Kekalkan wajah, pakaian dan tanda nama PK Pendidikan Khas, wajah dan pakaian murid serta susun atur bilik.",
  "urutan": [
    {
      "masa": "0–3 saat",
      "aksi": "Murid menyentuh skrin iPad. PK Pendidikan Khas membimbing tangan murid dengan lembut.",
      "kamera": "Syot dekat pada tangan dan iPad, paras mata murid."
    },
    {
      "masa": "3–6 saat",
      "aksi": "Murid tersenyum gembira melihat skrin. PK Pendidikan Khas tersenyum memandang murid.",
      "kamera": "Tilt naik perlahan dan alih fokus dari tangan ke wajah kedua-duanya."
    },
    {
      "masa": "6–8 saat",
      "aksi": "PK Pendidikan Khas memandang lensa dengan senyuman hangat.",
      "kamera": "Tolak masuk sangat perlahan. Tahan dua saat."
    }
  ],
  "skrin": "Skrin iPad dipalingkan sedikit dari kamera, tiada tulisan kelihatan.",
  "nada": "Hangat, inklusif, gembira. Bukan simpati berlebihan."
}
```

### 5B · Kelas PPKI yang ceria
**Imej permulaan**
> [GAYA] Kelas PPKI yang terang. PK Pendidikan Khas berdiri di tengah kelas di sebelah Smart TV; empat murid PPKI di meja masing-masing menggunakan Chromebook. Smart TV gelap. Lampirkan: PKPK_charsheet, murid_PPKI_charsheet.

```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 8 saat, satu syot berterusan.",
  "rujukan": "Gunakan imej permulaan. Kekalkan wajah dan pakaian semua watak serta kedudukan Smart TV dan meja.",
  "urutan": [
    {
      "masa": "0–3 saat",
      "aksi": "Murid-murid menggunakan Chromebook dengan tekun. PK Pendidikan Khas berjalan perlahan di antara meja.",
      "kamera": "Syot luas, bergerak perlahan ke hadapan (dolly in) di antara meja."
    },
    {
      "masa": "3–6 saat",
      "aksi": "Seorang murid mengangkat tangan dengan gembira. PK Pendidikan Khas menghampiri dan memberi pujian.",
      "kamera": "Melengkung perlahan ke kanan mengikut PK Pendidikan Khas."
    },
    {
      "masa": "6–8 saat",
      "aksi": "PK Pendidikan Khas berdiri tegak di sebelah Smart TV dan memandang lensa.",
      "kamera": "Tahan syot separuh badan dengan Smart TV kelihatan di sebelah."
    }
  ],
  "skrin": "Smart TV kekal kelabu gelap rata, tanpa tulisan atau imej, keempat-empat penjuru jelas."
}
```

---

## 6. PENUTUP: barisan pentadbir bersama

**Imej permulaan**
> [GAYA, cahaya senja keemasan] Pintu gerbang sekolah bertanda "1956". Kelima-lima pentadbir berdiri sebaris: Guru Besar di tengah, PK Pentadbiran dan PK HEM di kiri, PK Kokurikulum dan PK Pendidikan Khas di kanan. Lampirkan: kelima-lima charsheet, foto gerbang 1956.

```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 8 saat, satu syot berterusan, gerak perlahan (slow motion).",
  "rujukan": "Gunakan imej permulaan. Kekalkan wajah, pakaian dan kedudukan kelima-lima pentadbir serta pintu gerbang.",
  "urutan": [
    {
      "masa": "0–4 saat",
      "aksi": "Kelima-lima pentadbir berjalan serentak keluar dari pintu gerbang ke arah kamera dengan yakin.",
      "kamera": "Sudut rendah, kamera bergerak mundur perlahan pada kelajuan yang sama dengan langkah mereka."
    },
    {
      "masa": "4–8 saat",
      "aksi": "Mereka berhenti serentak dan memandang lensa. Guru Besar tersenyum kecil.",
      "kamera": "Kamera berhenti dan naik perlahan (crane up) untuk menampakkan pintu gerbang dan langit senja. Tahan dua saat."
    }
  ],
  "suasana": "Megah, bersatu, cahaya matahari terbenam di belakang (rim light)."
}
```

---

## Tip
- Jana imej permulaan **dulu**. Pastikan wajah tepat sebelum tukar ke video.
- Jika wajah berubah dalam video, pendekkan tempoh atau kurangkan pergerakan kamera.
- Jana 2–3 versi setiap syot, pilih yang terbaik.
- Lower-third nama dan jawatan saya tambah semasa suntingan.
