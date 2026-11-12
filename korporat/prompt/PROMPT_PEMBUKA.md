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
| `00_akhir.png` | Bingkai akhir: emblem besar terapung di langit kiri, bangunan dan papan tanda jelas |
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
      "aksi": "Emblem SKeSO kelihatan kecil jauh di langit kanan atas, berputar perlahan dengan ekor cahaya emas dan biru.",
      "kamera": "Kamera hampir statik, sedikit dongak ke langit."
    },
    {
      "masa": "2–4.5 saat",
      "aksi": "Emblem meluncur melengkung merentasi langit di atas bumbung bangunan ke arah kiri, semakin besar dan dekat, ekor cahaya memanjang.",
      "kamera": "Pan perlahan ke kiri mengikut emblem, dengan sedikit tolak masuk."
    },
    {
      "masa": "4.5–6 saat",
      "aksi": "Emblem berhenti dan terapung di langit kiri, menghadap kamera, cahaya biru berdenyut sekali. Bangunan dan mural kekal jelas.",
      "kamera": "Berhenti perlahan dan tahan komposisi akhir sama seperti imej akhir."
    }
  ],
  "emblem": "Kekalkan rupa emblem tepat seperti dalam imej: cincin logam gelap dan emas, simbol atom biru, lencana sekolah di tengah, tulisan 'SKeSO · Be Excellent' dan 'Merentas Kecemerlangan'. Jangan ubah tulisan atau ikon.",
  "pencahayaan": "Siang cerah, langit biru berawan seperti foto asal.",
  "negatif": "Jangan ubah bangunan, jangan tambah bangunan lain, jangan herotkan tulisan pada mural atau emblem, tiada orang tambahan."
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
