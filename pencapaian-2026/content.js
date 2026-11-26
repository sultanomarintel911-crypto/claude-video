// Kandungan video pencapaian. Tambah program/anugerah baharu di sini (berperingkat).
// crop: piksel dipotong dari ATAS gambar asal (2000×1333 → 16:9 perlu buang 208 px tinggi);
//       dipilih supaya semua orang (hingga kasut) dan tajuk skrin kekal kelihatan.
export const PROGRAM = {
  nama: 'TERAFECTA',
  sub: 'DIGITAL LUMINARIES AWARDS',
  sekolah: 'SK SULTAN OMAR, DUNGUN',
};

// Susunan: kecil → besar, klimaks pada anugerah khas.
export const AWARDS = [
  { foto: 'foto/5.jpg', crop: 90, warna: 'pink',
    ribbon: 'TEMPAT KELIMA', title: ['PEMBACA BESTARI'],
    sub: 'Pemerkasaan Bacaan Murid · Bahasa Inggeris (Sek. Rendah)' },
  { foto: 'foto/3.jpg', crop: 80, warna: 'sky',
    ribbon: 'NAIB JOHAN', title: ['PEMBANGUNAN', 'APLIKASI ANDROID'],
    sub: 'Anugerah Pendidikan Digital · Sekolah Rendah' },
  { foto: 'foto/4.jpg', crop: 40, warna: 'mint',
    ribbon: 'ANUGERAH SEKOLAH', title: ['EKOSISTEM', 'DIGITAL TERBAIK'],
    sub: 'Sekolah Rendah' },
  { foto: 'foto/2.jpg', crop: 40, warna: 'purple',
    ribbon: 'ANUGERAH KHAS', title: ['PEMBUDAYAAN PENDIDIKAN', 'DIGITAL TERBAIK'],
    sub: 'Anugerah Sekolah' },
  { foto: 'foto/1.jpg', crop: 80, warna: 'gold',
    ribbon: 'ANUGERAH KHAS TERAFECTA', title: ['MICROSOFT ELEVATE', 'SHOWCASE SCHOOL'],
    sub: 'Sumbangan RM400 untuk sekolah' },
];

// Masa (saat): 106.67 BPM → 1 bar = 2.25 s; setiap bahagian = 4 bar = 9 s.
export const SEC = 9, INTRO = 9;
export const DUR = INTRO + AWARDS.length * SEC + 9;   // + penutup
