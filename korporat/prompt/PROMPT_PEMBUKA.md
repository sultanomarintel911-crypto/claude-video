# Prompt Pembuka: Emblem SKeSO tiba di bangunan sekolah sebenar

## Kenapa prompt lama jadi "sekolah lain"
Prompt lama ialah **text-to-video**: AI tiada gambar sekolah, jadi ia mereka bangunan sendiri.
Untuk mengekalkan bangunan sebenar, kita guna **image-to-video dengan bingkai pertama DAN
bingkai akhir**. Kedua-dua bingkai ialah foto sebenar bangunan 1956, dengan emblem SKeSO
ditampal di atasnya.

## Fail (folder `bingkai/`)
| Fail | Kegunaan |
|---|---|
| `00_mula.png` | Bingkai pertama: emblem kecil jauh di langit kanan atas, ekor cahaya |
| `00_akhir.png` | Bingkai akhir: emblem **kecil** menjauh di langit kiri (arah gerbang) |
| `emblem_SKeSO_potong.png` | Emblem sahaja (latar telus), untuk rujukan tambahan |

Muat naik **00_mula.png sebagai first frame** dan **00_akhir.png sebagai last frame**.
Kling dan Veo kedua-duanya ada pilihan ini.

## Prompt JSON (image-to-video)

```json
{
  "format": "Video fotorealistik sinematik 16:9, sekitar 6 saat, satu syot berterusan.",
  "rujukan": "Gunakan imej permulaan dan imej akhir. Bangunan sekolah ialah bangunan sebenar dan MESTI kekal sama: bangunan dua tingkat kuning dengan tiang merah, tulisan '1956' di dinding, mural biru bertulisan 'S K SULTAN OMAR Terengganu', pokok palma dan pokok renek di hadapan. Jangan ubah, jangan tambah atau buang bangunan.",
  "urutan": [
    {
      "masa": "0–2 saat",
      "aksi": "Emblem SKeSO bersaiz sederhana terapung di langit kanan atas bangunan, berputar perlahan dengan ekor cahaya emas dan biru.",
      "kamera": "Kamera statik, sedikit dongak ke langit."
    },
    {
      "masa": "2–5 saat",
      "aksi": "Emblem meluncur melengkung merentasi langit ke arah kiri dan menjauh dari kamera, SEMAKIN KECIL, ekor cahaya memanjang di belakangnya.",
      "kamera": "Pan perlahan ke kiri mengikut emblem."
    },
    {
      "masa": "5–6 saat",
      "aksi": "Emblem menjadi kecil di langit kiri seperti bintang bercahaya, terus bergerak menjauh. Bangunan dan mural kekal jelas.",
      "kamera": "Berhenti dan tahan komposisi seperti imej akhir."
    }
  ],
  "emblem": "Saiz emblem TIDAK melebihi satu perlima tinggi bingkai pada bila-bila masa, dan semakin kecil sepanjang syot. Kekalkan rupa emblem seperti imej: cincin logam gelap dan emas, simbol atom biru, lencana sekolah di tengah.",
  "pencahayaan": "Siang cerah, langit biru berawan seperti foto asal.",
  "audio": "Tiada dialog, tiada narasi, tiada suara manusia. Hanya bunyi ambien semula jadi yang perlahan.",
  "negatif": "Jangan besarkan emblem, jangan ubah bangunan, jangan tambah bangunan lain, jangan herotkan tulisan pada mural, tiada orang tambahan."
}
```

## Tip
- Jika AI masih mengubah bangunan, **kurangkan pergerakan kamera** (contohnya "kamera statik").
  Semakin sedikit kamera bergerak, semakin setia bangunan kepada foto.
- Jika tulisan emblem herot, saya boleh **tampal emblem asal semula** semasa suntingan (motion
  tracking), jadi emblem dalam video sentiasa tajam.
- **Alternatif paling selamat:** jana sahaja video bangunan dengan gerakan kamera perlahan
  (tanpa emblem). Saya animasikan emblem dan ekor cahaya sendiri di Remotion. Hasilnya
  bangunan 100% sebenar dan emblem 100% tepat.
