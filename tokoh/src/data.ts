// Garis masa & data video Tokoh Murid 2026.
// Semua masa dalam saat; diselaraskan dengan peta muzik:
//  - misteri.mp3 (89 BPM): "hentakan" setiap 5.38 s bermula 0.80 s
//  - kemenangan.mp3 (123 BPM): rentak pertama 0.44 s, 1 rentak = 0.4876 s
export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const f = (sec: number) => Math.round(sec * FPS);

export const BEAT = 0.4876;
export const SWELL = 5.38;

export const N_SHOTS = 11;
export const T = {
  buka: 0, // pembukaan sci-fi (hentakan muzik 0.80 & 6.18)
  tajuk: 11.2,
  tajukHit: 11.56, // hentakan muzik
  dron: 16.94, // "Di bumi bertuah ini..."
  fail: 16.94 + SWELL * 2, // 27.70 teaser tanpa wajah; sifat pada hentakan 27.70, 33.08, 38.46
  sah: 46.7, // IDENTITI DISAHKAN
  warp: 47.85, // lompatan hiperangkasa
  siluet: 16.94 + SWELL * 6, // 49.22
  siluetLen: 7.2,
  kira: 56.42,
  reveal: 59.42,
  montaj: 59.42 + 16 * BEAT, // 67.22
  shotLen: 8 * BEAT, // 3.90
  finale: 59.42 + 16 * BEAT + N_SHOTS * 8 * BEAT,
  end: 59.42 + 16 * BEAT + N_SHOTS * 8 * BEAT + 12.4,
};
export const MUSIK_KEMENANGAN_MULA = T.reveal - 0.44;

export type Rect = [number, number, number, number]; // x0,y0,x1,y1

export const NAMA_1 = 'THORIQ';
export const NAMA_2 = 'YUSUF';
export const NAMA_BIN = 'BIN MOHAMMAD NOR BAKRI';
export const NAMA_PENUH = 'THORIQ YUSUF BIN MOHAMMAD NOR BAKRI';
export const KELAS = '6 IBNU MAJAH';

// "Di bumi bertuah ini..." - [mula, tamat, fail, mula dalam fail]
export const DRON_KLIP: Array<[number, number, string, number]> = [
  [16.94, 23.0, 'video/intro_dron.mp4', 0],
  [23.07, 25.3, 'video/bendera.mp4', 0],
  [25.3, 27.7, 'video/intro_dron.mp4', 7.6],
];

// Teaser tanpa wajah: hanya sifat, tiada butiran (biar misteri)
export const SIFAT_MASA = [16.94 + SWELL * 2, 16.94 + SWELL * 3, 16.94 + SWELL * 4]; // 27.70, 33.08, 38.46
export const SIFAT = ['PEMIMPIN', 'PEJUANG', 'PENCINTA ILMU'];
// Gaya trailer: klip -> GELAP -> klip -> GELAP ... [mula, tamat, fail, mula dalam fail]
export const TEASER: Array<[number, number, string, number]> = [
  // blok 1 (hentakan 27.70)
  [27.7, 29.5, 'video/tangga.mp4', 0.6],
  [30.3, 32.25, 'video/bayang_koridor.mp4', 2.6],
  // blok 2 (33.08)
  [33.08, 34.8, 'video/raket.mp4', 1.0],
  [35.6, 37.6, 'video/tali_kasut.mp4', 0.2],
  // blok 3 (38.46)
  [38.46, 40.3, 'video/sekolah_senja.mp4', 1.6],
  [41.1, 42.9, 'video/tangga.mp4', 3.4],
  // blok 4 (43.84): kelipan pantas
  [43.84, 44.4, 'video/raket.mp4', 3.6],
  [44.75, 45.3, 'video/bayang_koridor.mp4', 3.6],
  [45.6, 46.1, 'video/tali_kasut.mp4', 3.4],
];
// Kad teks di atas skrin gelap [mula, tamat, teks, kecil?]
export const KAD: Array<[number, number, string, string]> = [
  [29.5, 30.3, 'PEMIMPIN', 'SIFAT DIKESAN'],
  [34.8, 35.6, 'PEJUANG', 'SIFAT DIKESAN'],
  [40.3, 41.1, 'PENCINTA ILMU', 'SIFAT DIKESAN'],
  [46.1, 46.7, 'SATU NAMA...', ''],
];

// Kotak wajah Thoriq (dinormalkan 0..1 kepada saiz gambar) - zon larangan animasi
export type Photo = {src: string; iw: number; ih: number; face: Rect};
export const PHOTOS: Record<string, Photo> = {
  squash_match: {src: 'img/squash_match.jpg', iw: 2560, ih: 1429, face: [0.445, 0.14, 0.515, 0.25]},
  hitting_ball: {src: 'img/hitting_ball.jpg', iw: 2560, ih: 1429, face: [0.37, 0.11, 0.49, 0.33]},
  squash_court: {src: 'img/squash_court.jpg', iw: 2560, ih: 1429, face: [0.535, 0.43, 0.59, 0.51]},
  handball_team: {src: 'img/handball_team.jpg', iw: 2560, ih: 1429, face: [0.465, 0.34, 0.53, 0.45]},
  standing: {src: 'img/standing.jpg', iw: 2560, ih: 1429, face: [0.47, 0.31, 0.537, 0.44]},
  graduation: {src: 'img/graduation.jpg', iw: 2560, ih: 1707, face: [0.27, 0.43, 0.365, 0.6]},
  kelas: {src: 'img/kelas.jpg', iw: 2560, ih: 1828, face: [0.33, 0.285, 0.4, 0.38]},
  olahraga_1: {src: 'img/olahraga_1.jpg', iw: 1706, ih: 2560, face: [0.47, 0.385, 0.58, 0.49]},
  olahraga_2: {src: 'img/olahraga_2.jpg', iw: 1720, ih: 2560, face: [0.455, 0.33, 0.585, 0.45]},
  olahraga_3: {src: 'img/olahraga_3.jpg', iw: 2560, ih: 1707, face: [0.565, 0.42, 0.615, 0.51]},
  olahraga_4: {src: 'img/olahraga_4.jpg', iw: 1706, ih: 2560, face: [0.39, 0.36, 0.535, 0.49]},
  pelantikan: {src: 'img/pelantikan.jpg', iw: 1280, ih: 960, face: [0.395, 0.297, 0.449, 0.38]},
};

export type Shot =
  | {kind: 'foto'; photo: string; z0: number; z1: number; fx0: number; fx1: number; fy: number; kicker: string; title: string; sub: string; badge?: 'JOHAN' | 'KETIGA'; parallax?: boolean; kata?: string}
  | {kind: 'video'; src: string; face: Rect; kicker: string; title: string; sub: string}
  | {kind: 'triptik'; photos: string[]; kicker: string; title: string; sub: string}
  | {kind: 'statistik'}
  | {kind: 'kebangsaan'};

// fx/fy: kedudukan sasaran wajah pada skrin (0..1); kapsyen diletakkan jauh dari wajah
export const SHOTS: Shot[] = [
  {kind: 'foto', photo: 'squash_match', z0: 1.0, z1: 1.18, fx0: 0.5, fx1: 0.6, fy: 0.3, kicker: 'SUKAN · SKUASY', title: 'Kejohanan Skuasy MSSD Dungun', sub: 'Peringkat Daerah 2026', parallax: true, kata: 'JOHAN'},
  {kind: 'foto', photo: 'hitting_ball', z0: 1.15, z1: 1.0, fx0: 0.42, fx1: 0.36, fy: 0.3, kicker: 'SUKAN · SKUASY', title: 'Kejohanan MSST Skuasy', sub: 'Peringkat Negeri Terengganu', parallax: true, kata: 'JOHAN'},
  {kind: 'foto', photo: 'squash_court', z0: 1.0, z1: 1.35, fx0: 0.56, fx1: 0.62, fy: 0.38, kicker: 'MEWAKILI TERENGGANU', title: 'Kejohanan Skuasy MSSM 2026', sub: 'Peringkat Kebangsaan · 6 – 13 Jun 2026'},
  {kind: 'foto', photo: 'handball_team', z0: 1.2, z1: 1.0, fx0: 0.6, fx1: 0.5, fy: 0.38, kicker: 'SUKAN · BOLA BALING', title: 'Zon Sura & MSSD Dungun', sub: 'Kejohanan Bola Baling 2026', parallax: true, kata: 'KETIGA'},
  {kind: 'foto', photo: 'olahraga_3', z0: 1.0, z1: 1.25, fx0: 0.56, fx1: 0.62, fy: 0.36, kicker: 'SUKAN · OLAHRAGA', title: 'Kejohanan Olahraga MSSD Dungun', sub: 'Peringkat Daerah · 5 – 9 Julai 2026', parallax: true, kata: 'BERANI'},
  {kind: 'triptik', photos: ['olahraga_4', 'olahraga_1', 'olahraga_2'], kicker: 'OLAHRAGA · LARI BERPAGAR', title: 'Langkah Tanpa Gentar', sub: 'MSSD Dungun 2026'},
  {kind: 'statistik'},
  {kind: 'kebangsaan'},
  {kind: 'foto', photo: 'pelantikan', z0: 1.0, z1: 1.18, fx0: 0.5, fx1: 0.56, fy: 0.3, kicker: 'MAJLIS WATIKAH PELANTIKAN PENGAWAS', title: 'Penolong Ketua Murid', sub: 'Ketua Rumah Temenggung · Pengerusi TV PSS', parallax: true, kata: 'PEMIMPIN'},
  {kind: 'foto', photo: 'kelas', z0: 1.0, z1: 1.9, fx0: 0.37, fx1: 0.62, fy: 0.36, kicker: 'KELUARGA KEDUA', title: '6 Ibnu Majah', sub: 'SK Sultan Omar · 2026'},
  {kind: 'foto', photo: 'graduation', z0: 1.0, z1: 1.2, fx0: 0.36, fx1: 0.33, fy: 0.42, kicker: 'RAJIN USAHA, TANGGA KEJAYAAN', title: 'Perjalanan baru bermula', sub: 'Teruskan melangkah, Thoriq!', parallax: true},
];

export const STATS = [
  {n: 18, l: 'PENYERTAAN'},
  {n: 6, l: 'KEBANGSAAN'},
  {n: 4, l: 'NEGERI'},
  {n: 4, l: 'PODIUM'},
];

export const KEBANGSAAN = [
  ['Kangaroo Maths 2026', 'Persatuan STEM'],
  ['Minecraft Education Challenge', 'Kelab Komputer / ICT'],
  ['My Cyber Hero 2026', 'Kelab Komputer / ICT'],
  ['Program Jom Berus Gigi', 'Doktor Muda'],
  ['Kuiz Cabaran Minda', 'Badan Beruniform'],
  ['Kejohanan Skuasy MSSM', 'Sukan · Skuasy'],
];

// Potongan latar: kedudukan wajah dalam gambar potongan (0..1)
export const CUT_GRAD = {src: 'img/cut_graduation.png', w: 758, h: 1322, face: [0.344, 0.138, 0.72, 0.395] as Rect};
export const CUT_STAND = {src: 'img/cut_standing.png', w: 534, h: 1123, face: [0.161, 0.056, 0.507, 0.234] as Rect};
