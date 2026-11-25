# Kesan HyperFrames untuk video korporat

Tiga projek [HyperFrames](https://github.com/heygen-com/hyperframes) (HTML -> video) yang
menghasilkan lapisan kesan untuk Remotion. Blok disalin dari `registry/blocks/` repo HyperFrames.

| Projek | Blok | Keluaran | Digunakan di |
| --- | --- | --- | --- |
| `terowong/` | gallery-tunnel | `public/video/hf_terowong.mp4` | pembuka bab 04 // PENCAPAIAN |
| `suar/` | vfx-anamorphic-flare | `public/video/hf_suar.mp4` | syot GB keluar kereta, galeri Terafecta |
| `cahaya/` | organic-light-leak-overlay | `public/video/hf_cahaya.webm` (alfa) | jambatan senja, GB keluar kereta, hujung terowong |

Telemetri dimatikan (`hyperframes telemetry disable`, `HYPERFRAMES_NO_TELEMETRY=1`).
`terowong/assets/` tidak disimpan dalam git (foto anugerah); salin semula dari
`public/img/dscf24{68,70,73}.jpg`, `public/montaj/terafecta_{1..4}.jpg` dan `public/montaj/badge_rasmi.png`.

```bash
export HYPERFRAMES_NO_TELEMETRY=1
npx hyperframes@0.9.95 render terowong -c compositions/gallery-tunnel.html --variables-file terowong/vars.json --end 4.2 -o ../public/video/hf_terowong.mp4
npx hyperframes@0.9.95 render suar -c compositions/vfx-anamorphic-flare.html --variables-file suar/vars.json --end 8 -o ../public/video/hf_suar.mp4
npx hyperframes@0.9.95 render cahaya --format webm -o ../public/video/hf_cahaya.webm
```
