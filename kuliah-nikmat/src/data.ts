// Masa dalam SAAT mengikut rakaman asal (abs). at() menukar kepada bingkai video ini.
export const PENYAMPAI = 'Ustaz Mohd Yusof bin Ismail';
export const HEADER_TITLE = 'KULIAH HADIS';
export const HEADER_TAG = 'NIKMAT & SYUKUR';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const CLIP_START = 10.8; // mesti sama dengan potongan audio/video penyampai
export const CLIP_END = 86.3;
export const LEAD = 2.5;
export const OUTRO = 4.5;
// Bahagian ustaz tersangkut/jeda panjang yang dipotong dari audio & video penyampai (masa abs)
export const CUTS: [number, number][] = [
  [74.06, 74.99], // "makan… makanan…" diulang
  [77.02, 77.47], // bunyi sebelum "asalkan"
  [78.95, 79.3], // jeda panjang
];
/** masa abs -> masa selepas suntingan */
export const ed = (t: number) => CUTS.reduce((acc, [a, b]) => acc - Math.min(Math.max(t - a, 0), b - a), t);

export const TOTAL = Math.round((ed(CLIP_END) - CLIP_START + LEAD + OUTRO) * FPS);

export const at = (abs: number) => Math.round((ed(abs) - CLIP_START + LEAD) * FPS);

// Kapsyen (bahagian huraian Bahasa Melayu sahaja; bahagian hadis dipaparkan dalam kad hadis).
const RAW: [string, number][] = [
  ['|Yakni', 46.22], ['di', 47.06], ['mana', 47.18], ['hamba-hamba-Nya', 47.44],
  ['|membuat', 48.06], ['perkara', 48.42], ['yang', 48.86], ['baik', 49.06], ['dan', 49.34], ['berpakaian', 49.74], ['cantik,', 50.32],
  ['|makan', 52.1], ['makanan', 52.2], ['yang', 52.68], ['halal', 52.88],
  ['|dan', 53.22], ['rumah', 53.4], ['tangga', 53.68], ['yang', 53.98], ['bahagia', 54.18], ['dan', 54.52], ['lain-lain.', 54.7],
  ['|Jadi,', 56.96], ['pengajaran', 57.68], ['hadisnya,', 58.4],
  ['|setiap', 59.14], ['umat', 59.46], ['Islam', 59.66], ['hendaklah', 60.0],
  ['|mensyukuri', 60.36], ['segala', 61.18], ['nikmat', 61.54],
  ['|yang', 61.98], ['diterima', 62.1], ['daripada', 62.56], ['Allah', 62.88], ['SWT', 63.14],
  ['|dengan', 63.76], ['membelanjakan', 64.44],
  ['|pada', 65.76], ['perkara', 66.18], ['yang', 66.5], ['diharuskan', 66.64], ['oleh', 67.14], ['syarak.', 67.34],
  ['|Islam', 68.16], ['tidak', 68.38], ['melarang', 68.64], ['umatnya', 68.94],
  ['|memakai', 69.44], ['pakaian', 69.92], ['yang', 70.44], ['indah,', 70.7],
  ['|berumah', 71.84], ['besar', 72.14], ['lagi', 72.5], ['cantik', 72.8],
  ['|dan', 73.86], ['makan', 74.99], ['makanan', 75.3], ['yang', 75.6], ['lazat', 75.75], ['dan', 76.0], ['lain-lain.', 76.2],
  ['|Asalkan', 77.5], ['semua', 77.84], ['perkara', 79.38], ['tersebut', 79.98],
  ['|dinikmati', 80.44], ['dengan', 80.98], ['cara', 81.28], ['halal', 81.5],
  ['|serta', 81.96], ['tidak', 82.32], ['menyalahi', 82.64], ['hukum', 83.18], ['syarak.', 83.5],
  ['|Wallahu', 83.9], ["a'lam.", 84.8],
];

export type Word = {w: string; s: number; e: number};
export type Line = {words: Word[]; s: number; e: number};

export const LINES: Line[] = (() => {
  const lines: Line[] = [];
  RAW.forEach(([w, s], i) => {
    const next = RAW[i + 1]?.[1] ?? s + 0.6;
    const e = Math.min(next, s + 0.8);
    if (w.startsWith('|') || !lines.length) lines.push({words: [], s, e});
    const L = lines[lines.length - 1];
    L.words.push({w: w.replace('|', ''), s, e});
    L.e = e;
  });
  lines.forEach((L, i) => {
    const nx = lines[i + 1]?.s ?? L.e + 1.4;
    L.e = Math.min(nx, L.e + 1.6);
  });
  return lines;
})();

// Hadis (bahasa Arab, berbaris) — masa setiap perkataan dibaca
export const SANAD_AR: [string, number][] = [
  ['عَنْ', 14.38], ['عَمْرِو', 14.64], ['بْنِ', 15.18], ['شُعَيْبٍ', 15.4], ['عَنْ', 15.86], ['أَبِيهِ', 16.48],
  ['عَنْ', 17.08], ['جَدِّهِ', 17.34], ['رَضِيَ', 17.92], ['اللَّهُ', 18.24], ['عَنْهُ', 18.48], ['قَالَ', 18.9],
];
export const QALA_AR: [string, number][] = [
  ['قَالَ', 19.26], ['رَسُولُ', 20.1], ['اللَّهِ', 20.5], ['ﷺ', 20.72],
];
export const MATAN_AR: [string, number][] = [
  ['إِنَّ', 21.28], ['اللَّهَ', 21.6], ['يُحِبُّ', 22.02], ['أَنْ', 22.48], ['يُرَى', 22.72],
  ['أَثَرُ', 23.42], ['نِعْمَتِهِ', 24.08], ['عَلَى', 25.1], ['عَبْدِهِ', 25.94],
];
export const RIWAYAT_AR = 'رَوَاهُ التِّرْمِذِيُّ وَقَالَ: حَدِيثٌ حَسَنٌ صَحِيحٌ';
export const RIWAYAT_T = 27.14;

// Maksud (Bahasa Melayu) — muncul ikut bacaan terjemahan
export const SANAD_MS: [string, number][] = [
  ['’Amru bin Syu’aib', 30.52],
  ['ayahnya', 32.44],
  ['datuknya r.a.', 33.6],
];
export const MAKSUD: {t: number; text: string; key?: boolean}[] = [
  {t: 37.22, text: 'Rasulullah ﷺ bersabda:'},
  {t: 38.82, text: '“Sesungguhnya Allah mencintai dan suka'},
  {t: 41.54, text: 'bila melihat kesan nikmat', key: true},
  {t: 44.26, text: 'yang Dia berikan kepada hamba‑Nya.”'},
];

export const CHAPTERS: [string, number][] = [
  ['HADIS', 12.1],
  ['MAKSUD', 30.5],
  ['CONTOH', 46.2],
  ['PENGAJARAN', 56.96],
  ['SYARAT', 77.14],
];

// Video kuliah bertenang: tiada gegaran skrin
export const IMPACTS: [number, number][] = [];

export const SFX: [string, number, number][] = [
  ['dengung.wav', 8.4, 0.12],
  ['swish_teks.wav', 8.9, 0.18],
  ['swish_teks.wav', 12.0, 0.15],
  ['swish_teks.wav', 14.3, 0.12],
  ['whoosh_pendek.wav', 30.2, 0.12],
  ['swish_teks.wav', 37.1, 0.12],
  ['whoosh_pendek.wav', 45.9, 0.12],
  ['whoosh_pendek.wav', 56.6, 0.12], ['swish_teks.wav', 60.36, 0.14], ['swish_teks.wav', 64.44, 0.14],
  ['whoosh_pendek.wav', 67.9, 0.12],
  ['whoosh_pendek.wav', 76.9, 0.12],
];
