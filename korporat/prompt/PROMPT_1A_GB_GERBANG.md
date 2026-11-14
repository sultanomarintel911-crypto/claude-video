# 1A · Guru Besar menyambut di Gerbang 1956

**Bingkai pertama:** `bingkai/1A_gb_gerbang_mula.png`. Foto gerbang sebenar, dan GB ditampal
daripada lembaran watak (pandangan hadapan). Emblem SKeSO **kecil** terapung di atas
papan "1956", bersambung daripada syot pembuka.

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
      "aksi": "Guru Besar berdiri tegak di hadapan pintu gerbang, memandang lensa dengan tenang dan berwibawa. Emblem SKeSO kecil turun perlahan dari kiri dan berhenti di atas papan '1956'.",
      "kamera": "Syot separuh badan hingga lutut, kamera statik pada paras mata."
    },
    {
      "masa": "2–5 saat",
      "aksi": "Guru Besar tersenyum mesra, kemudian membuka tangan kanan ke sisi dengan sopan seolah-olah menjemput penonton masuk ke sekolah. Kepala sedikit tunduk tanda hormat.",
      "kamera": "Tolak masuk sangat perlahan ke arah Guru Besar."
    },
    {
      "masa": "5–8 saat",
      "aksi": "Guru Besar menurunkan tangan, merapatkan kedua-dua tangan di hadapan, dan kekal tersenyum memandang lensa. Emblem kecil berdenyut cahaya biru sekali, kemudian lebur menjadi kilauan halus pada papan '1956'. Pintu gerbang dan papan '1956' kekal jelas di belakang.",
      "kamera": "Berhenti perlahan dan tahan komposisi akhir selama dua saat."
    }
  ],
  "pencahayaan": "Siang cerah, langit biru berawan, cahaya semula jadi lembut, bayang lembut di kaki.",
  "emblem": "Emblem sentiasa KECIL (lebih kecil daripada kepala Guru Besar) dan berada di latar belakang, tidak menutup wajah atau papan nama sekolah.",
  "suasana": "Mesra, berwibawa, mengalu-alukan.",
  "audio": "Tiada dialog, tiada narasi, tiada suara manusia. Hanya bunyi ambien semula jadi yang perlahan.",
  "negatif": "Jangan besarkan emblem, jangan ubah wajah, jangan tambah orang lain, jangan herotkan tulisan pada gerbang, jangan ubah pakaian, tiada tulisan tambahan."
}
```

## Tip
- Jika gerbang berubah, tukar kamera kepada **statik sepenuhnya**.
- Lower-third "RUSMADI BIN ABDULLAH · GURU BESAR" saya tambah semasa suntingan.
