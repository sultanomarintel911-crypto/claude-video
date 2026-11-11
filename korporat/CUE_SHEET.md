# Helaian Isyarat: Video Korporat SKeSO 2026 (Versi Digital)

**Asas:** `KORPORAT BARU 2026.mp4` (3:26). Isi asal dikekalkan, dipadatkan dan diberi lapisan digital.
**Tambahan:** bahagian *Pembudayaan Digital* dan klimaks *Anugerah Emas DUTA 2026*.
**Format:** 1920×1080, 30 fps, ±4:21. Dibina dengan Remotion.

## Garis masa

| Masa | Babak | Sumber | Tenaga muzik |
|---|---|---|---|
| 0:00.0 | Imbasan biometrik GB (BARU) | biometrik.mp4 0.4–8.6 ×1.35 | 0 |
| 0:06.1 | Welcome + logo | korporat 0–8.4 | 1 |
| 0:14.5 | Dron awan | korporat 9–11.6 | 1 |
| 0:17.1 | Ketibaan GB (dipendekkan 6 s → 4 s) | korporat 12.2–14, 15.2–17.4 | 2 |
| 0:21.1 | Dron sekolah, gerbang, papan tanda | korporat 18–25 | 2 |
| 0:28.1 | Gerbang senja (1 syot terbaik) | korporat 28–31 | 2 |
| 0:31.1 | 01 Pengenalan: sejarah, lokasi, visi misi | korporat 32.2–43.9 | 1 |
| 0:42.8 | Enrolmen | korporat 44–47 | 1 |
| 0:45.8 | 02 Barisan kepimpinan (adegan ×1.6, kad nama kekal) | korporat 48–110 | 2 |
| 1:28.6 | 03 Hala tuju SKESO, VO asal penuh | korporat 110–176.2 | 0 |
| 2:34.8 | 04 Digitalisasi SKeSO + Showcase School | korporat 176.2–185.5 | 2 |
| 2:44.1 | Era kertas, "Namun itu kisah dulu" (BARU) | walk 27–35.2 | 0 |
| 2:52.3 | Inovasi E-Learning Walk (BARU) | walk 35.2–52.8 | 1 |
| 3:09.9 | Inovasi SKeSO App (BARU) | walk 105.2–114.6 | 1 |
| 3:19.3 | Connecting the Dots (BARU) | walk 131.2–140.5 | 1 |
| 3:28.6 | Data: Showcase, 100% guru, 97% DELIMa, 789 penyertaan (BARU) | grafik | 3 |
| 3:43.6 | Hub, Podcast, Digital Hub | korporat 186–195.6 | 3 |
| 3:53.2 | 05 Pencapaian: TITC Johan | korporat 196–202 | 3 |
| 3:59.2 | **ANUGERAH EMAS DUTA 2026** (BARU) | video distabilkan + foto | 3 |
| 4:13.2 | Maklumat sekolah | korporat 202.2–205.9 | 1 |
| 4:16.9 | Penutup | grafik | 0 |

Sumber kebenaran: `src/timeline.json` (dibaca oleh video dan oleh `scripts/muzik.py`).

## Lapisan digital
- HUD tepi skrin (bracket, kod masa, koordinat Dungun)
- Glitch dan gegaran warna pada setiap potongan, dengan whoosh
- Tag bab bertaip (01–05), label modul inovasi
- Garisan imbasan + vignet halus

## Audio
- **Muzik baharu:** sci-fi D minor, 120 BPM, disintesis sepenuhnya oleh `scripts/muzik.py` (100% asli, bebas royalti). Lapisan muzik ikut tenaga babak. Ada impact, riser, braaam emas dan bunyi bip imbasan.
- **Suara latar asal** diasingkan daripada muzik lama dengan Demucs (`scripts/prep.py`). Muzik direndahkan secara automatik bawah VO.

## Arahan

Letakkan bahan Drive dalam `../bahan_korporat/`, kemudian:

```bash
python3 scripts/prep.py
```

```bash
python3 scripts/muzik.py
```

```bash
npm run preview
```

Render akhir hanya selepas pratonton diluluskan:

```bash
npm run final
```
