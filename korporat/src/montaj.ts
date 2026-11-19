// Garis masa montaj "Character Reveal" barisan pentadbir (suntingan kasar).
// Setiap kepingan: [fail, mula sumber, tamat sumber, kadar]. Kadar < 1 = gerak perlahan (speed ramp).
export const MFPS = 30;

export type Piece = {src: string; from: number; to: number; rate: number; zoom?: [number, number]; ox?: number; oy?: number};
export type Card = {at: number; no: string; nama: string; jawatan: string; side?: 'kiri' | 'kanan'};
export type Block =
  | {kind: 'klip'; id: string; pieces: Piece[]; card?: Card; tajuk?: string; whipOut?: boolean; dolly?: [number, number]}
  | {kind: 'tajuk'; id: string; dur: number; teks: string; kecil: string}
  | {kind: 'hologram'; id: string; dur: number; card: Card; foto: string; sisi: 'kiri' | 'kanan'; whipOut?: boolean}
  | {kind: 'data'; id: string; dur: number}
  | {kind: 'akhir'; id: string; dur: number};

export const BLOCKS: Block[] = [
  {kind: 'klip', id: 'dungun', pieces: [{src: 'montaj/dungun.mp4', from: 1.2, to: 4.6, rate: 1.15}], tajuk: 'DUNGUN · TERENGGANU'},
  {kind: 'klip', id: 'bangunan', pieces: [{src: 'montaj/bangunan.mp4', from: 0.4, to: 5.6, rate: 1.6}], tajuk: 'SK SULTAN OMAR · SEJAK 1956'},
  {kind: 'tajuk', id: 'tajuk', dur: 2.4, teks: 'BARISAN KEPIMPINAN', kecil: 'SKeSO // MISI DIGITAL'},
  {kind: 'hologram', id: 'gb', dur: 5.0, foto: 'montaj/wajah_gb.jpg', sisi: 'kanan', whipOut: true, card: {at: 0.9, no: '01', nama: 'RUSMADI BIN ABDULLAH', jawatan: 'GURU BESAR'}},
  {kind: 'hologram', id: 'pkp', dur: 5.0, foto: 'montaj/wajah_pkp.jpg', sisi: 'kiri', whipOut: true, card: {at: 0.9, no: '02', nama: 'TN HJ MOHD SHFFRI @ HAFIZZUDIN\nBIN ABU BAKAR', jawatan: 'PENOLONG KANAN PENTADBIRAN'}},
  {kind: 'hologram', id: 'hem', dur: 5.0, foto: 'montaj/wajah_hem.jpg', sisi: 'kanan', whipOut: true, card: {at: 0.9, no: '03', nama: 'ROAZMI BIN MOHAMAD', jawatan: 'PENOLONG KANAN HAL EHWAL MURID'}},
  {kind: 'hologram', id: 'ko', dur: 5.0, foto: 'montaj/wajah_ko.jpg', sisi: 'kiri', whipOut: true, card: {at: 0.9, no: '04', nama: 'ABU SEMAN BIN MAT SALLEH', jawatan: 'PENOLONG KANAN KOKURIKULUM'}},
  {kind: 'hologram', id: 'ppki', dur: 5.4, foto: 'montaj/wajah_ppki.jpg', sisi: 'kanan', card: {at: 0.9, no: '05', nama: 'BAHARUDIN BIN ISMAIL', jawatan: 'PENOLONG KANAN PENDIDIKAN KHAS'}},
  {kind: 'data', id: 'data', dur: 7.0},
  {kind: 'akhir', id: 'akhir', dur: 6.0},
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
