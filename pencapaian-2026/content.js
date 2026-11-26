// Kandungan video. Tambah program baharu sebagai satu BAB (berperingkat).
// Jenis item:
//   award : kad tajuk (reben + tajuk 3D + pil) → satu foto penuh skrin (9 s)
//   group : kad tajuk → beberapa foto berturut (2.25 s + 4.5 s setiap foto)
// Foto: { f: laluan, crop?: piksel dipotong dari atas (foto 3:2 → 16:9), fit?: 'cover' | 'contain' }
//   Lalai: foto lebar (≥ 1.45) = penuh skrin (cover); foto menegak / 4:3 = penuh tinggi + latar kabur (semua orang kelihatan).
export const SEKOLAH = 'SK SULTAN OMAR, DUNGUN';

export const CHAPTERS = [
  {
    nama: ['TERAFECTA'], sub: 'DIGITAL LUMINARIES AWARDS', ribbon: 'PENCAPAIAN ' + SEKOLAH, warna: 'pink',
    hero: { teks: ['ANUGERAH', 'DIRANGKUL!'] },   // "N ANUGERAH DIRANGKUL!" + piala
    items: [
      { jenis: 'award', warna: 'pink', ribbon: 'TEMPAT KELIMA', title: ['PEMBACA BESTARI'],
        sub: 'Pemerkasaan Bacaan Murid · Bahasa Inggeris (Sek. Rendah)', foto: [{ f: 'foto/5.jpg', crop: 90 }] },
      { jenis: 'award', warna: 'sky', ribbon: 'NAIB JOHAN', title: ['PEMBANGUNAN', 'APLIKASI ANDROID'],
        sub: 'Anugerah Pendidikan Digital · Sekolah Rendah', foto: [{ f: 'foto/3.jpg', crop: 80 }] },
      { jenis: 'award', warna: 'mint', ribbon: 'ANUGERAH SEKOLAH', title: ['EKOSISTEM', 'DIGITAL TERBAIK'],
        sub: 'Sekolah Rendah', foto: [{ f: 'foto/4.jpg', crop: 40 }] },
      { jenis: 'award', warna: 'purple', ribbon: 'ANUGERAH KHAS', title: ['PEMBUDAYAAN PENDIDIKAN', 'DIGITAL TERBAIK'],
        sub: 'Anugerah Sekolah', foto: [{ f: 'foto/2.jpg', crop: 40 }] },
      { jenis: 'award', warna: 'gold', ribbon: 'ANUGERAH KHAS TERAFECTA', title: ['MICROSOFT ELEVATE', 'SHOWCASE SCHOOL'],
        sub: 'Sumbangan RM400 untuk sekolah', foto: [{ f: 'foto/1.jpg', crop: 80 }], finale: true },
    ],
  },
  {
    nama: ['KONVENSYEN', 'DPD 2026'], sub: 'DASAR PENDIDIKAN DIGITAL', ribbon: 'PROGRAM YANG KAMI SERTAI', warna: 'sky',
    items: [
      { jenis: 'group', warna: 'mint', ribbon: 'PERTANDINGAN INOVASI 2026', title: ['SO ELITE', 'MY ADAB TRACKER'],
        sub: 'Indah Adab, Mulia Akhlak', foto: [
          { f: 'foto/dpd/pasukan.jpg' }, { f: 'foto/dpd/bentang4.jpg' }, { f: 'foto/dpd/bentang1.jpg' }, { f: 'foto/dpd/bentang7.jpg' }] },
      { jenis: 'group', warna: 'purple', ribbon: 'SEMANGAT PASUKAN', title: ['SATU PASUKAN!'],
        sub: 'Bersama kita cemerlang', foto: [{ f: 'foto/dpd/peluk.jpg' }] },
      { jenis: 'group', warna: 'pink', ribbon: 'KENANGAN MANIS', title: ['MAJLIS AMPD 2026'],
        sub: 'Kementerian Pendidikan', foto: [{ f: 'foto/dpd/ampd2.jpg' }] },
    ],
  },
  {
    // Bab gaya DOKUMENTARI SINEMATIK (warna filem, grain, letterbox, kamera perlahan)
    gaya: 'filem', nama: ['MAJLIS DUTA 2026'], sub: 'Digital Utilisation and Technology Awards', kecil: 'Kementerian Pendidikan',
    shots: [
      // video distabilkan (vid.stab) → bingkai JPEG: bahan/duta_vid/001.jpg … (lihat tools/duta_video.sh)
      { video: 'bahan/duta_vid', fps: 25, n: 150, dur: 6.0, lower: ['Detik Penyerahan', 'SK Sultan Omar, Terengganu'] },
      { f: 'foto/duta/3.jpg', crop: 100, gerak: 'masuk', dur: 5.25, lower: ['Anugerah Emas', 'Pendidikan Digital Terbaik · Sekolah Rendah'] },
      { f: 'foto/duta/2.jpg', crop: 100, gerak: 'kiri', dur: 4.5 },
      { f: 'foto/duta/1.jpg', crop: 100, gerak: 'keluar', dur: 4.5, lower: ['Sumbangan', 'RM1,200'] },
    ],
    akhir: { atas: 'ANUGERAH EMAS', tengah: 'Pendidikan Digital Terbaik · Sekolah Rendah', bawah: 'SK SULTAN OMAR · TERENGGANU', kecil: 'Majlis DUTA 2026' },
  },
];

// Penutup: kad polaroid (maks 5) + "TAHNIAH!"
export const OUTRO = ['foto/3.jpg', 'foto/1.jpg', 'foto/duta/3.jpg', 'foto/dpd/pasukan.jpg', 'foto/dpd/ampd2.jpg'];
