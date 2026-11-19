// Garis masa montaj "Character Reveal" barisan pentadbir (suntingan kasar).
// Setiap kepingan: [fail, mula sumber, tamat sumber, kadar]. Kadar < 1 = gerak perlahan (speed ramp).
export const MFPS = 30;

export type Piece = {src: string; from: number; to: number; rate: number; zoom?: [number, number]; ox?: number; oy?: number};
export type Card = {at: number; no: string; nama: string; jawatan: string; side?: 'kiri' | 'kanan'};
export type Block =
  | {kind: 'klip'; id: string; pieces: Piece[]; card?: Card; tajuk?: string; whipOut?: boolean; dolly?: [number, number]}
  | {kind: 'tajuk'; id: string; dur: number; teks: string; kecil: string}
  | {kind: 'hologram'; id: string; dur: number; card: Card; foto: string}
  | {kind: 'data'; id: string; dur: number}
  | {kind: 'akhir'; id: string; dur: number};

export const BLOCKS: Block[] = [
  {kind: 'klip', id: 'dungun', pieces: [{src: 'montaj/dungun.mp4', from: 1.2, to: 4.6, rate: 1.15}], tajuk: 'DUNGUN · TERENGGANU'},
  {kind: 'klip', id: 'bangunan', pieces: [{src: 'montaj/bangunan.mp4', from: 0.4, to: 5.6, rate: 1.6}], tajuk: 'SK SULTAN OMAR · SEJAK 1956'},
  {kind: 'tajuk', id: 'tajuk', dur: 2.4, teks: 'BARISAN KEPIMPINAN', kecil: 'SKeSO // MISI DIGITAL'},
  {
    kind: 'klip',
    id: 'gb',
    pieces: [
      {src: 'montaj/gb_a.mp4', from: 5.0, to: 7.8, rate: 1, zoom: [1.14, 1.2], oy: 0.75},
      {src: 'montaj/gb_b.mp4', from: 0.0, to: 3.7, rate: 1},
      {src: 'montaj/gb_b.mp4', from: 3.7, to: 4.7, rate: 2.2},
      {src: 'montaj/gb_b.mp4', from: 5.0, to: 7.8, rate: 0.75},
    ],
    card: {at: 6.6, no: '01', nama: 'RUSMADI BIN ABDULLAH', jawatan: 'GURU BESAR'},
    whipOut: true,
  },
  {
    kind: 'klip',
    id: 'pkp',
    pieces: [
      {src: 'montaj/pkp.mp4', from: 0.6, to: 2.5, rate: 1, zoom: [1.12, 1.12], ox: 0.7},
      {src: 'montaj/pkp.mp4', from: 2.5, to: 3.7, rate: 0.5},
      {src: 'montaj/pkp.mp4', from: 3.7, to: 7.8, rate: 1},
    ],
    dolly: [1.9, 4.3],
    card: {at: 5.3, no: '02', nama: 'TN HJ MOHD SHFFRI @ HAFIZZUDIN\nBIN ABU BAKAR', jawatan: 'PENOLONG KANAN PENTADBIRAN', side: 'kiri'},
    whipOut: true,
  },
  {
    kind: 'klip',
    id: 'hem',
    pieces: [
      {src: 'montaj/hem.mp4', from: 0.0, to: 1.4, rate: 1},
      {src: 'montaj/hem.mp4', from: 1.4, to: 3.4, rate: 0.55},
      {src: 'montaj/hem.mp4', from: 3.4, to: 7.4, rate: 1.25},
      {src: 'montaj/hem.mp4', from: 7.4, to: 7.85, rate: 1},
    ],
    dolly: [1.4, 5.0],
    card: {at: 5.6, no: '03', nama: 'ROAZMI BIN MOHAMAD', jawatan: 'PENOLONG KANAN HAL EHWAL MURID'},
    whipOut: true,
  },
  {
    kind: 'klip',
    id: 'ko',
    pieces: [
      {src: 'montaj/ko.mp4', from: 1.0, to: 2.2, rate: 1.3},
      {src: 'montaj/ko.mp4', from: 2.2, to: 3.0, rate: 0.28},
      {src: 'montaj/ko.mp4', from: 3.0, to: 4.6, rate: 2.0},
      {src: 'montaj/ko.mp4', from: 4.6, to: 7.6, rate: 1.0, zoom: [1.0, 1.25], ox: 0.55, oy: 0.35},
      {src: 'montaj/ko_vr.mp4', from: 5.0, to: 7.6, rate: 1},
    ],
    card: {at: 4.2, no: '04', nama: 'ABU SEMAN BIN MAT SALLEH', jawatan: 'PENOLONG KANAN KOKURIKULUM'},
    whipOut: true,
  },
  {kind: 'hologram', id: 'ppki', dur: 5.2, foto: 'montaj/baharudin_wajah.jpg', card: {at: 1.2, no: '05', nama: 'BAHARUDIN BIN ISMAIL', jawatan: 'PENOLONG KANAN PENDIDIKAN KHAS'}},
  {kind: 'data', id: 'data', dur: 7.0},
  {kind: 'akhir', id: 'akhir', dur: 5.0},
];

export const pieceDur = (p: Piece) => (p.to - p.from) / p.rate;
export const blockDur = (b: Block) => (b.kind === 'klip' ? b.pieces.reduce((a, p) => a + pieceDur(p), 0) : b.dur);

let acc = 0;
export const TL = BLOCKS.map((b) => {
  const d = blockDur(b);
  const r = {b, start: acc, dur: d, f0: Math.round(acc * MFPS), fd: Math.round((acc + d) * MFPS) - Math.round(acc * MFPS)};
  acc += d;
  return r;
});
export const MONTAJ_TOTAL = acc;
export const MONTAJ_F = Math.round(acc * MFPS);

// Data penyertaan (slaid DUTA 2025)
export const DATA_KAD = [
  {n: 100, s: '%', l: 'GURU BERTAULIAH', k: 'MICROSOFT · GEMINI'},
  {n: 97, s: '%', l: 'MURID AKTIF DELIMa', k: '998 / 1,029 MURID'},
  {n: 789, s: '', l: 'PENYERTAAN DIGITAL', k: 'NEGERI · KEBANGSAAN · 2025'},
  {n: 200, s: '', l: 'PERINGKAT KEBANGSAAN', k: 'PENYERTAAN MURID · 2025'},
];
export const DATA_JALUR = ['MICROSOFT SHOWCASE SCHOOL 2026–2027', 'ANUGERAH EMAS DUTA 2026', 'JOHAN TITC KEBANGSAAN 2025'];
