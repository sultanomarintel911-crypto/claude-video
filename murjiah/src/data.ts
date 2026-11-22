// Masa dalam SAAT mengikut fail audio naratif (bermula 0).
export const FPS = 30;
export const W = 1080;
export const H = 1920;

import WARP from './warp.json';

// Semua masa dalam fail ini & scenes.tsx ditulis mengikut audio VERSI 1.
// Audio versi 2 (dikemas kini) dibaca dengan rentak berbeza: warp() memetakan masa v1 -> v2
// melalui 176 perkataan yang dipadankan (interpolasi linear).
const WA = (WARP as number[][]).map((p) => p[0]);
const WB = (WARP as number[][]).map((p) => p[1]);
export const warp = (t: number) => {
  if (t <= WA[0]) return t + (WB[0] - WA[0]);
  if (t >= WA[WA.length - 1]) return t + (WB[WB.length - 1] - WA[WA.length - 1]);
  let i = 1;
  while (WA[i] < t) i++;
  const k = (t - WA[i - 1]) / (WA[i] - WA[i - 1]);
  return WB[i - 1] + k * (WB[i] - WB[i - 1]);
};

export const AUDIO_LEN = 101.52; // panjang audio v2
export const CLIP_START = 0;
export const CLIP_END = AUDIO_LEN - (WB[WB.length - 1] - WA[WA.length - 1]); // dalam masa v1
export const LEAD = 1.4; // tajuk sebelum suara
export const OUTRO = 4.0;
export const at = (t: number) => Math.round((warp(t) - CLIP_START + LEAD) * FPS);
export const TOTAL = Math.round((AUDIO_LEN + LEAD + OUTRO) * FPS);

export const TITLE = 'Racun Yang Halus';

const RAW: [string, number][] = [
  ['|Assalamu\'alaikum,', 0.00], ['pernah', 2.12], ['dengar', 2.32], ['orang', 2.66], ['kata', 2.92],
  ['|yang', 3.66], ['penting', 3.98], ['hati', 4.70], ['baik', 5.10], ['atau', 5.60],
  ['|saya', 6.32], ['tak', 6.92], ['tutup', 7.18], ['aurat,', 7.42],
  ['|tapi', 8.10], ['saya', 8.46], ['solat?', 8.78],
  ['|Kedengarannya', 10.10], ['biasa', 10.60], ['tapi', 11.52], ['di sinilah', 12.04],
  ['|bermulanya', 12.86], ['satu', 13.56], ['racun', 13.98], ['yang', 14.58], ['sangat', 14.94], ['halus.', 15.24],
  ['|Hari', 16.86], ['ini', 17.02], ['ramai', 17.52], ['yang', 18.18], ['mengaku', 18.34], ['‘spiritual’', 18.66],
  ['|tapi', 19.38], ['tak', 20.38], ['mahu', 20.74], ['beragama.', 21.04],
  ['|Ada', 22.54], ['yang', 22.60], ['selesa', 22.82], ['menggelar', 23.30], ['diri', 23.74],
  ['|muslim', 24.48], ['yang', 24.94], ['tidak', 25.14], ['mengamalkan.', 25.34],
  ['|Islam', 26.86], ['tinggal', 27.32], ['pada', 27.86], ['nama', 28.04],
  ['|tapi', 28.80], ['tidak', 29.26], ['lagi', 29.52], ['dalam', 29.76], ['kehidupan.', 29.98],
  ['|Lama-kelamaan,', 31.56], ['garis', 32.88], ['halal', 33.18], ['dan', 33.60], ['haram', 33.80],
  ['|jadi', 34.28], ['kabur.', 34.56],
  ['|Yang', 35.80], ['haram', 35.92], ['dibuat', 36.52], ['bergurau.', 36.84],
  ['|Yang', 37.96], ['suci', 38.20], ['dijadikan', 38.88], ['hiburan.', 39.38],
  ['|Ulama', 41.24], ['menamakan', 41.56], ['pemikiran', 42.08], ['ini', 42.54],
  ['|Murji\'ah.', 43.24],
  ['|Fahamannya', 44.86], ['menganggap', 45.42], ['iman', 45.84], ['cukup', 46.30], ['di', 46.72], ['hati', 46.84],
  ['|dan', 47.52], ['amal', 47.94], ['tidak', 48.56], ['penting.', 48.82],
  ['|Kononnya', 50.04], ['dosa', 50.78], ['tidak', 51.30], ['menjejaskan', 51.52], ['iman.', 52.22],
  ['|Sedangkan', 53.86], ['Allah', 54.18], ['berfirman', 54.44], ['dalam', 55.02], ['surah', 55.28], ['al-\'Asr,', 55.56],
  ['|semua', 56.80], ['manusia', 57.26], ['dalam', 57.76], ['kerugian.', 57.98],
  ['|Kecuali', 58.80], ['mereka', 59.64], ['yang', 60.02],
  ['|beriman', 60.22], ['dan', 60.76], ['beramal', 61.28], ['soleh.', 61.72],
  ['|Iman', 62.98], ['dan', 63.34], ['amal', 63.58], ['tidak', 64.32], ['boleh', 64.66], ['dipisahkan.', 64.88],
  ['|Allah', 66.88], ['juga', 67.02], ['menyuruh', 67.32],
  ['|masuklah', 67.94], ['ke', 68.68], ['dalam', 68.76], ['Islam', 68.96],
  ['|secara', 69.38], ['keseluruhan.', 69.76],
  ['|Bukan', 71.24], ['memilih', 71.42], ['yang', 71.92], ['kita', 72.04], ['suka', 72.28],
  ['|dan', 72.64], ['meninggalkan', 73.22], ['yang', 73.86], ['kita', 73.96], ['tak', 74.22], ['suka.', 74.44],
  ['|Kita', 75.84], ['semua', 75.94], ['tidak', 76.20], ['sempurna.', 76.46],
  ['|Ada', 77.76], ['yang', 77.86], ['masih', 78.02], ['belajar', 78.34], ['menutup', 78.76], ['aurat.', 79.16],
  ['|Ada', 80.18], ['yang', 80.34], ['masih', 80.50], ['bertatih', 80.74], ['menjaga', 81.42], ['solat.', 81.82],
  ['|Itu', 82.94], ['tidak', 83.08], ['mengapa.', 83.34],
  ['|Yang', 84.54], ['bahaya', 84.66], ['adalah', 85.44],
  ['|bila', 86.00], ['kita', 86.40], ['berhenti', 86.68], ['berusaha', 87.14],
  ['|dan', 87.92], ['mula', 88.54], ['menganggap', 88.82],
  ['|dosa', 89.46], ['itu', 89.92], ['perkara', 90.22], ['biasa.', 90.58],
  ['|Jadi,', 92.52], ['teruskan', 93.20], ['solat', 93.52],
  ['|dan', 94.10], ['teruskan', 94.56], ['memperbaiki', 95.10], ['yang', 95.70], ['lain.', 95.90],
  ['|Semoga', 97.12], ['Allah', 97.36], ['tetapkan', 97.62], ['hati', 98.14],
  ['|kita', 98.48], ['di', 98.76], ['atas', 98.98], ['agama-Nya.', 99.22],
  ['|Wallahu', 100.76], ['a\'lam.', 101.18],
];

export type Word = {w: string; s: number; e: number};
export type Line = {words: Word[]; s: number; e: number; en?: string};

// Terjemahan Bahasa Inggeris (satu bagi setiap baris kapsyen, ikut urutan RAW)
export const EN: string[] = ['Assalamu’alaikum. Ever heard people say,',
  '“What matters is a good heart,” or',
  '“I don’t cover my aurah,',
  'but I do pray”?',
  'It sounds harmless, but this is where',
  'a very subtle poison begins.',
  'Today, many claim to be ‘spiritual’',
  'but don’t want religion.',
  'Some are comfortable calling themselves',
  'non-practising Muslims.',
  'Islam remains only in name,',
  'but no longer in their lives.',
  'Over time, the line between halal and haram',
  'becomes blurred.',
  'The forbidden becomes a joke.',
  'The sacred becomes entertainment.',
  'Scholars call this way of thinking',
  'Murji’ah.',
  'It holds that faith in the heart is enough',
  'and deeds don’t matter.',
  'Supposedly, sins don’t affect faith.',
  'Yet Allah says in Surah al-‘Asr:',
  'all of mankind is in loss,',
  'except those who',
  'believe and do righteous deeds.',
  'Faith and deeds cannot be separated.',
  'Allah also commands us',
  'to enter into Islam',
  'completely.',
  'Not picking what we like',
  'and leaving what we don’t.',
  'None of us is perfect.',
  'Some are still learning to cover their aurah.',
  'Some are still taking small steps with prayer.',
  'That is okay.',
  'What is dangerous',
  'is when we stop trying',
  'and start to think',
  'that sin is normal.',
  'So keep praying,',
  'and keep improving the rest.',
  'May Allah keep our hearts',
  'firm upon His religion.',
  'And Allah knows best.'];
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
    L.e = Math.min(nx, L.e + 1.5);
    L.en = EN[i];
  });
  return lines;
})();

export const CHAPTERS: [string, number][] = [
  ['DAKWAAN', 0],
  ['RACUN', 9.9],
  ['MURJI\'AH', 40.8],
  ['DALIL', 53.6],
  ['MUHASABAH', 75.6],
  ['PESAN', 92.3],
];

export const SFX: [string, number, number][] = [
  ['whoosh_pendek.wav', -1.2, 0.12],
  ['swish_teks.wav', 3.6, 0.1], ['swish_teks.wav', 6.25, 0.1],
  ['whoosh_pendek.wav', 9.8, 0.1],
  ['whoosh_pendek.wav', 16.5, 0.1],
  ['whoosh_pendek.wav', 22.2, 0.1],
  ['whoosh_pendek.wav', 31.3, 0.1],
  ['whoosh_panjang.wav', 42.6, 0.14],
  ['whoosh_panjang.wav', 52.1, 0.14], ['impact_lembut.wav', 52.62, 0.32],
  ['whoosh_pendek.wav', 54.0, 0.1],
  ['whoosh_pendek.wav', 62.7, 0.1],
  ['whoosh_pendek.wav', 66.5, 0.1],
  ['whoosh_pendek.wav', 75.5, 0.1],
  ['whoosh_pendek.wav', 84.2, 0.1],
  ['whoosh_pendek.wav', 92.2, 0.1],
  ['whoosh_pendek.wav', 100.4, 0.1],
];
