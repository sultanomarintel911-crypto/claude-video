# 1A · Guru Besar menyambut di Gerbang 1956

**Bingkai pertama:** `bingkai/1A_gb_gerbang_mula.png`. Foto gerbang sebenar, dan GB ditampal
daripada lembaran watak (pandangan hadapan).

## Langkah 1 (disyorkan): kemaskan bingkai dengan AI imej
Muat naik `1A_gb_gerbang_mula.png` + lembaran watak RUSMADI ke Nano Banana / Gemini, prompt:

> Kekalkan gambar ini sepenuhnya: pintu gerbang, tulisan "SK SULTAN OMAR 1956", tiang "HADIR
> DENGAN HARAPAN", jalan, langit dan bangunan. Kekalkan wajah, cermin mata, songkok, sut hitam,
> tali leher merah dan tanda nama Guru Besar tepat seperti lembaran watak. Hanya selaraskan
> pencahayaan siang pada Guru Besar supaya sepadan dengan latar, tambah bayang lembut di kaki,
> dan jadikan postur sedikit lebih semula jadi (bahu santai, tangan dirapatkan di hadapan).
> Fotorealistik, 16:9. Tiada tulisan tambahan.

## Langkah 2: image-to-video

```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 8 saat, satu syot berterusan.",
  "rujukan": "Gunakan imej permulaan. Kekalkan wajah, cermin mata, songkok hitam, sut hitam, kemeja putih, tali leher merah dan tanda nama Guru Besar. Pintu gerbang sekolah ialah lokasi sebenar dan MESTI kekal sama: bumbung merah, papan 'SK SULTAN OMAR 1956', tiang bertulisan 'HADIR DENGAN HARAPAN' dan 'PULANG DENGAN ...', jalan dan bangunan di belakang. Jangan ubah atau tambah bangunan.",
  "urutan": [
    {
      "masa": "0–2 saat",
      "aksi": "Guru Besar berdiri tegak di hadapan pintu gerbang, memandang lensa dengan tenang dan berwibawa.",
      "kamera": "Syot separuh badan hingga lutut, kamera statik pada paras mata."
    },
    {
      "masa": "2–5 saat",
      "aksi": "Guru Besar tersenyum mesra, kemudian membuka tangan kanan ke sisi dengan sopan seolah-olah menjemput penonton masuk ke sekolah. Kepala sedikit tunduk tanda hormat.",
      "kamera": "Tolak masuk sangat perlahan ke arah Guru Besar."
    },
    {
      "masa": "5–8 saat",
      "aksi": "Guru Besar menurunkan tangan, merapatkan kedua-dua tangan di hadapan, dan kekal tersenyum memandang lensa. Pintu gerbang dan papan '1956' kekal jelas di belakang.",
      "kamera": "Berhenti perlahan dan tahan komposisi akhir selama dua saat."
    }
  ],
  "pencahayaan": "Siang cerah, langit biru berawan, cahaya semula jadi lembut, bayang lembut di kaki.",
  "suasana": "Mesra, berwibawa, mengalu-alukan.",
  "negatif": "Jangan ubah wajah, jangan tambah orang lain, jangan herotkan tulisan pada gerbang, jangan ubah pakaian, tiada tulisan tambahan."
}
```

## Tip
- Jika gerbang berubah, tukar kamera kepada **statik sepenuhnya**.
- Lower-third "RUSMADI BIN ABDULLAH · GURU BESAR" saya tambah semasa suntingan.
