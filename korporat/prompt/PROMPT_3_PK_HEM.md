# 3 · PK Hal Ehwal Murid: Cikgu Roazmi (PK HEM baharu)

**Watak:** penyayang, tegas tetapi mesra. Kebajikan, disiplin dan rekod kehadiran murid.
**Rupa (lembaran watak):** tanpa songkok, rambut hitam pendek, cermin mata berbingkai hitam
nipis, sut hitam dua butang, kemeja **jalur biru**, tali leher **merah bercorak**, tanda nama
hitam "ROAZMI" dengan jata negara, kasut kulit hitam bertali.

> PK HEM dalam video lama (Razulddin bin Mustaffa) **diganti**. Semua syot dan kad nama
> beliau dalam video korporat akan dibuang dan diganti dengan scene ini.

---

## 3A · Rondaan pagi di koridor (kehadiran digital)

**Bingkai pertama:** `bingkai/3A_hem_mula.png`. Koridor kuning sebenar, dan Cikgu Roazmi ditampal
daripada lembaran watak (pandangan hadapan).

### Langkah 1: kemaskan bingkai (Nano Banana / Gemini)
Lampirkan `3A_hem_mula.png` + lembaran watak CIKGU ROAZMI:

> Kekalkan koridor ini sepenuhnya: bumbung jalur, tiang dan pagar kuning-merah, pintu kuning,
> bendera dan bangunan di kiri. Kekalkan wajah, cermin mata, sut hitam, kemeja jalur biru, tali
> leher merah dan tanda nama ROAZMI tepat seperti lembaran watak. Letakkan tablet hitam di
> tangan kirinya. Pencahayaan pagi semula jadi dari kiri, bayang lembut di lantai, postur santai
> seperti sedang berjalan. Fotorealistik 16:9. Tiada tulisan tambahan.

### Langkah 2: image-to-video
```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 8 saat, satu syot berterusan.",
  "rujukan": "Gunakan imej permulaan. Kekalkan wajah, cermin mata, sut hitam, kemeja jalur biru, tali leher merah dan tanda nama guru. Koridor ini lokasi sebenar dan MESTI kekal sama: pintu kuning, tiang dan pagar kuning-merah, bumbung jalur.",
  "urutan": [
    {
      "masa": "0–3 saat",
      "aksi": "Guru berjalan perlahan ke arah kamera di sepanjang koridor sambil memegang tablet. Bunyi riuh murid kedengaran dari kelas.",
      "kamera": "Kamera bergerak ke belakang perlahan (dolly mundur), mengekalkan jarak yang sama dengan guru."
    },
    {
      "masa": "3–5 saat",
      "aksi": "Guru berhenti di hadapan pintu kelas kuning, menjenguk sekilas ke dalam kelas sambil tersenyum, kemudian mengetik tablet sekali. Bingkai hologram biru kecil muncul di atas tablet.",
      "kamera": "Kamera berhenti dan melengkung sedikit ke kanan supaya pintu kelas dan tablet kelihatan."
    },
    {
      "masa": "5–8 saat",
      "aksi": "Bingkai hologram terbuka menjadi panel segi empat kecil kelabu gelap yang kosong di atas tablet. Guru menoleh ke lensa dan mengangguk mesra.",
      "kamera": "Tolak masuk perlahan ke syot separuh badan. Kekalkan panel dalam syot dan tahan dua saat."
    }
  ],
  "panel": "Bahagian dalam panel kekal kelabu gelap dan kosong, tanpa tulisan atau ikon. Cahaya biru hanya pada bingkai luar.",
  "pencahayaan": "Cahaya pagi semula jadi dari sisi kiri, langit cerah.",
  "negatif": "Jangan ubah wajah, jangan tambah songkok, jangan ubah warna kemeja atau tali leher, jangan ubah koridor, tiada tulisan tambahan."
}
```
*(Panel akan diisi dengan e-Rekod Kehadiran / data HEM semasa suntingan.)*

---

## 3B · Bersama murid (kebajikan)

Imej permulaan perlu **dijana** dengan lembaran watak + `CHARSHEET_MURID.md` (M3 & M4, seragam
harian) + latar `3A_latar_koridor.jpg`.

### Langkah 1: imej permulaan
> Gunakan foto koridor ini sebagai latar dan kekalkan sepenuhnya. Cikgu Roazmi (tepat seperti
> lembaran watak: wajah, cermin mata, sut hitam, kemeja jalur biru, tali leher merah, tanda nama
> ROAZMI) membongkok ke paras mata dua murid Tahap 1 di hadapan pintu kuning. Murid lelaki:
> kemeja putih lengan pendek, lencana perisai hijau di poket kiri, tag nama kuning, tali leher hijau
> tua, seluar biru tua. Murid perempuan: baju kurung putih labuh, tudung labuh putih dengan lencana
> hijau. Murid lelaki memegang tablet (skrin dipalingkan dari kamera). Suasana mesra dan penyayang.
> Fotorealistik 16:9, cahaya pagi.

### Langkah 2: image-to-video
```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 8 saat, satu syot berterusan.",
  "rujukan": "Gunakan imej permulaan. Kekalkan wajah dan pakaian Cikgu Roazmi dan kedua-dua murid, serta koridor kuning.",
  "urutan": [
    {
      "masa": "0–3 saat",
      "aksi": "Murid lelaki menunjukkan skrin tablet kepada guru dengan gembira. Guru mendengar dengan teliti.",
      "kamera": "Syot sederhana pada paras mata murid, bergerak perlahan ke kiri."
    },
    {
      "masa": "3–6 saat",
      "aksi": "Guru tersenyum dan memberi isyarat ibu jari ke atas. Murid perempuan ketawa kecil.",
      "kamera": "Alih fokus dari tablet ke wajah guru."
    },
    {
      "masa": "6–8 saat",
      "aksi": "Guru menepuk bahu murid lelaki dengan lembut dan berdiri tegak.",
      "kamera": "Tilt naik perlahan mengikut guru berdiri. Tahan komposisi akhir."
    }
  ],
  "skrin": "Skrin tablet dipalingkan dari kamera, tiada tulisan kelihatan.",
  "negatif": "Jangan ubah wajah, jangan herotkan murid, pakaian seragam konsisten, tiada tulisan."
}
```

---

## Perlu disahkan
- **Nama penuh Cikgu Roazmi** untuk lower-third (contoh: "ROAZMI BIN ... · PENOLONG KANAN HAL EHWAL MURID").
- Ada foto **dataran perhimpunan** sebenar? Jika ada, saya buat versi 3A di dataran (barisan murid + imbasan kehadiran).
