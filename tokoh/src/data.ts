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

export const T = {
  dron: 0,
  tajuk: 9.6,
  tajukHit: 11.56,
  clue0: 16.94,
  clueLen: SWELL,
  siluet: 16.94 + SWELL * 5, // 43.84
  siluetLen: 7.2,
  kira: 51.04,
  reveal: 54.04,
  montaj: 54.04 + 16 * BEAT, // 61.84
  shotLen: 8 * BEAT, // 3.90
  finale: 54.04 + 16 * BEAT + 10 * 8 * BEAT, // 100.85
  end: 113.5,
};
export const MUSIK_KEMENANGAN_MULA = T.reveal - 0.44;

export type Rect = [number, number, number, number]; // x0,y0,x1,y1

export const NAMA_1 = 'THORIQ';
export const NAMA_2 = 'YUSUF';
export const NAMA_BIN = 'BIN MOHAMMAD NOR BAKRI';
export const NAMA_PENUH = 'THORIQ YUSUF BIN MOHAMMAD NOR BAKRI';
export const KELAS = '6 IBNU MAJAH';

export type Clue = {teks: string; kunci: string; sub: string; bg: string; extra?: 'kaunter' | 'bintang' | 'trofi'};
export const CLUES: Clue[] = [
  {teks: 'Dia dipercayai memimpin rakan-rakannya setiap hari...', kunci: 'PENOLONG KETUA MURID', sub: 'SK Sultan Omar 2026', bg: 'img/blur_koridor.jpg'},
  {teks: 'Suaranya di sebalik kamera, semangatnya di padang...', kunci: 'PENGERUSI TV PSS', sub: '& Ketua Rumah Temenggung', bg: 'img/blur_sekolah.jpg'},
  {teks: 'Raketnya menggegarkan gelanggang...', kunci: 'JOHAN SKUASY', sub: 'Peringkat Daerah & Negeri', bg: 'img/blur_squash_match.jpg', extra: 'trofi'},
  {teks: 'Namanya tercatat di pentas negara...', kunci: 'PERTANDINGAN KEBANGSAAN', sub: 'daripada 18 penyertaan sepanjang 2026', bg: 'img/blur_handball_team.jpg', extra: 'kaunter'},
  {teks: 'Dan di sebalik semua itu... dia ulat buku sejati.', kunci: 'NILAM 4 BINTANG', sub: 'Pembaca tegar SK Sultan Omar', bg: 'img/blur_papan_skeso.jpg', extra: 'bintang'},
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
};

export type Shot =
  | {kind: 'foto'; photo: string; z0: number; z1: number; fx0: number; fx1: number; fy: number; kicker: string; title: string; sub: string; badge?: 'JOHAN' | 'KETIGA'}
  | {kind: 'video'; src: string; face: Rect; kicker: string; title: string; sub: string}
  | {kind: 'statistik'}
  | {kind: 'kebangsaan'};

// fx/fy: kedudukan sasaran wajah pada skrin (0..1); kapsyen diletakkan jauh dari wajah
export const SHOTS: Shot[] = [
  {kind: 'foto', photo: 'squash_match', z0: 1.0, z1: 1.18, fx0: 0.5, fx1: 0.6, fy: 0.3, kicker: 'SUKAN · SKUASY', title: 'Kejohanan Skuasy MSSD Dungun', sub: 'Peringkat Daerah 2026', badge: 'JOHAN'},
  {kind: 'foto', photo: 'hitting_ball', z0: 1.15, z1: 1.0, fx0: 0.42, fx1: 0.36, fy: 0.3, kicker: 'SUKAN · SKUASY', title: 'Kejohanan MSST Skuasy', sub: 'Peringkat Negeri Terengganu', badge: 'JOHAN'},
  {kind: 'foto', photo: 'squash_court', z0: 1.0, z1: 1.35, fx0: 0.56, fx1: 0.62, fy: 0.38, kicker: 'MEWAKILI TERENGGANU', title: 'Kejohanan Skuasy MSSM 2026', sub: 'Peringkat Kebangsaan · 6 – 13 Jun 2026'},
  {kind: 'foto', photo: 'handball_team', z0: 1.2, z1: 1.0, fx0: 0.6, fx1: 0.5, fy: 0.38, kicker: 'SUKAN · BOLA BALING', title: 'Zon Sura & MSSD Dungun', sub: 'Kejohanan Bola Baling 2026', badge: 'KETIGA'},
  {kind: 'statistik'},
  {kind: 'kebangsaan'},
  {kind: 'video', src: 'video/thoriq_pengawas.mp4', face: [0.42, 0.12, 0.58, 0.5], kicker: 'KEPIMPINAN', title: 'Penolong Ketua Murid', sub: 'SK Sultan Omar 2026'},
  {kind: 'foto', photo: 'standing', z0: 1.05, z1: 1.3, fx0: 0.62, fx1: 0.66, fy: 0.32, kicker: 'KEPIMPINAN & KOKURIKULUM', title: 'Ketua Rumah Temenggung', sub: 'Pengerusi TV PSS · AJK Tunas Kadet Remaja Sekolah'},
  {kind: 'foto', photo: 'kelas', z0: 1.0, z1: 1.9, fx0: 0.37, fx1: 0.62, fy: 0.36, kicker: 'KELUARGA KEDUA', title: '6 Ibnu Majah', sub: 'Majlis Apresiasi Tahun 6 · 2026'},
  {kind: 'foto', photo: 'graduation', z0: 1.0, z1: 1.2, fx0: 0.36, fx1: 0.33, fy: 0.42, kicker: 'RAJIN USAHA, TANGGA KEJAYAAN', title: 'Perjalanan baru bermula', sub: 'Teruskan melangkah, Thoriq!'},
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
