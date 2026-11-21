import {getInputProps} from 'remotion';
// Masa dalam SAAT mengikut rakaman asal (abs), dalam garis masa `ffmpeg -ss` (= pemain video).
// Nota: strim audio sumber bermula 0.29 s lewat; transkrip Whisper fail penuh adalah ~0.58 s lebih awal
// daripada garis masa ini, jadi masa dari transkrip penuh telah dianjak +0.58 s. at() menukar kepada bingkai video ini.
export const PENYAMPAI = 'Ustaz Mohd Yusof Bin Ismail';
export const HEADER_TITLE = 'PERKONGSIAN HADIS';
export const HEADER_TAG = 'NIKMAT & SYUKUR';

// Latar: 'bukit' | 'asal' | 'senja' | 'pelita' | 'gerbang'
export const LATAR: string = ((getInputProps() as {latar?: string}).latar) ?? 'bukit';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const CLIP_START = 10.8; // mesti sama dengan potongan audio/video penyampai
export const CLIP_END = 84.9; // tamat selepas "...hukum syarak" (1:15 dalam video); rakaman selepasnya tidak lengkap
export const LEAD = 2.5;
export const OUTRO = 6.0;
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
  ['|Jadi,', 57.54], ['pengajaran', 58.26], ['hadisnya,', 58.98],
  ['|setiap', 59.72], ['umat', 60.04], ['Islam', 60.24], ['hendaklah', 60.58],
  ['|mensyukuri', 60.94], ['segala', 61.76], ['nikmat', 62.12],
  ['|yang', 62.56], ['diterima', 62.68], ['daripada', 63.14], ['Allah', 63.46], ['SWT', 63.72],
  ['|dengan', 64.34], ['membelanjakan', 65.02],
  ['|pada', 66.34], ['perkara', 66.76], ['yang', 67.08], ['diharuskan', 67.22], ['oleh', 67.72], ['syarak.', 67.92],
  ['|Islam', 68.74], ['tidak', 68.96], ['melarang', 69.22], ['umatnya', 69.52],
  ['|memakai', 70.02], ['pakaian', 70.50], ['yang', 71.02], ['indah,', 71.28],
  ['|berumah', 72.42], ['besar', 72.72], ['lagi', 73.08], ['cantik', 73.38],
  ['|dan', 73.88], ['makan', 75.07], ['makanan', 75.41], ['yang', 75.91], ['lazat', 76.09], ['dan', 76.43], ['lain-lain.', 76.65],
  ['|Asalkan', 77.5], ['semua', 78.42], ['perkara', 79.96], ['tersebut', 80.56],
  ['|dinikmati', 81.02], ['dengan', 81.56], ['cara', 81.86], ['halal', 82.08],
  ['|serta', 82.54], ['tidak', 82.90], ['menyalahi', 83.22], ['hukum', 83.76], ['syarak.', 84.08],
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
  ['PENGAJARAN', 57.54],
  ['SYARAT', 77.5],
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
  ['whoosh_pendek.wav', 57.18, 0.12], ['swish_teks.wav', 60.94, 0.14], ['swish_teks.wav', 65.02, 0.14],
  ['whoosh_pendek.wav', 68.48, 0.12],
  ['whoosh_pendek.wav', 77.48, 0.12],
];
