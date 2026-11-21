// Masa dalam SAAT mengikut video ceramah asal (abs). at() menukar kepada bingkai video ini.
// Teks kepala (atas skrin) — tukar ikut topik
export const HEADER_TITLE = 'KISAH DI SEBALIK LAGU';
export const HEADER_TAG = 'MCR';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

export const CLIP_START = 72.0; // mesti sama dengan scripts/prep.py
export const CLIP_END = 128.0;
export const LEAD = 1.5; // intro sebelum suara bermula
export const OUTRO = 4.0;
export const TOTAL = Math.round((CLIP_END - CLIP_START + LEAD + OUTRO) * FPS);

export const at = (abs: number) => Math.round((abs - CLIP_START + LEAD) * FPS);

// Transkrip (Whisper medium, disemak & dibetulkan ejaan). '|' di depan perkataan = baris kapsyen baharu.
const RAW: [string, number][] = [
  ['|Antara', 72.28], ['lagu', 72.68], ['lain', 73.08], ['yang', 73.28], ['paling', 73.58], ['awal', 73.98],
  ['ialah', 74.32], ['daripada', 74.58], ['MCR.', 75.16],
  ['|Tahu', 77.0], ['MCR?', 77.16], ['My', 78.48], ['Chemical,', 78.72], ['|My', 79.84], ['Chemical', 80.22], ['Romance.', 80.66],
  ['|Lagu', 81.4], ['The', 81.58], ['Black', 81.86], ['Parade.', 82.14],
  ['|Lagu', 83.58], ['The', 84.0], ['Black', 84.2], ['Parade', 84.42], ['cukup', 84.68], ['sinonim', 85.22],
  ['|dan', 85.66], ['memang', 85.82], ['saya', 86.2], ['minat.', 86.52],
  ['|Bukan', 87.34], ['sahaja', 87.68], ['irama', 88.02], ['dan', 88.48], ['melodi,', 88.82], ['dia', 89.3], ['bagus.', 89.54],
  ['|Tapi', 90.38], ['dia', 90.6], ['menceritakan', 90.82], ['tentang', 91.72], ['bab', 92.16],
  ['|keluarnya', 92.62], ['Dajjal', 93.24], ['dengan', 93.72], ['70,000', 94.08], ['Yahudi', 95.56],
  ['|daripada', 96.2], ['Khurasan.', 96.7],
  ['|Cuba', 98.86], ['perhatikan', 99.1], ['betul-betul', 99.64], ['bab', 100.36], ['dia.', 100.5],
  ['|Memang', 100.84], ['dia', 101.22], ['disambut', 101.42], ['oleh', 102.04],
  ['|ahli-ahli', 102.48], ['golongan', 103.34], ['elit.', 104.02],
  ['|Golongan-golongan', 104.6], ['ternama,', 105.62],
  ['|golongan-golongan', 106.4], ['bangsawan,', 107.4],
  ['|artis-artis', 108.3], ['yang', 109.06], ['ditaja', 109.28], ['oleh', 109.78], ['dia.', 110.08],
  ['|Sama', 110.36], ['ada', 110.58], ['belah', 110.96], ['Freemason', 111.28], ['ataupun', 111.9], ['Illuminati.', 112.42],
  ['|Yang', 113.98], ['mana', 114.06], ['ada', 114.4], ['satu', 114.68], ['perarakan', 115.06], ['besar-besaran.', 115.78],
  ['|Inilah', 116.96], ['gambarnya', 117.3], ['keluarnya', 117.98], ['Dajjal', 118.6],
  ['|bersama', 119.04], ['70,000', 119.74], ['Yahudi', 120.7],
  ['|yang', 121.12], ['memakai', 121.38], ['tayalisah', 121.84],
  ['|dari', 123.54], ['arah', 123.88], ['Khurasan.', 124.44],
  ['|Benda', 125.9], ['ini', 126.12], ['diulang', 126.36], ['balik', 127.02], ['sahaja.', 127.46],
];

export type Word = {w: string; s: number; e: number};
export type Line = {words: Word[]; s: number; e: number};

export const LINES: Line[] = (() => {
  const lines: Line[] = [];
  RAW.forEach(([w, s], i) => {
    const next = RAW[i + 1]?.[1] ?? s + 0.6;
    const e = Math.min(next, s + 0.75);
    if (w.startsWith('|') || !lines.length) lines.push({words: [], s, e});
    const L = lines[lines.length - 1];
    L.words.push({w: w.replace('|', ''), s, e});
    L.e = e;
  });
  // kapsyen kekal sehingga baris seterusnya (maks 1.4 s selepas perkataan terakhir)
  lines.forEach((L, i) => {
    const nx = lines[i + 1]?.s ?? L.e + 1.4;
    L.e = Math.min(nx, L.e + 1.4);
  });
  return lines;
})();

// Bab (untuk bar kemajuan di atas)
export const CHAPTERS: [string, number][] = [
  ['MCR', 72.28],
  ['LAGU', 81.4],
  ['MESEJ', 90.38],
  ['PENYAMBUT', 100.84],
  ['PERARAKAN', 113.98],
  ['RUMUSAN', 116.96],
];

// Hentakan (gegar skrin): [masa abs, kekuatan]
export const IMPACTS: [number, number][] = [
  [75.16, 1], [81.86, 0.6], [90.38, 0.7], [93.24, 1], [115.06, 0.35], [115.78, 0.6], [118.6, 0.4],
  [119.74, 0.3], [121.84, 0.3], [124.44, 0.4], [126.36, 0.5],
];

// Kesan bunyi: [fail, masa abs, kelantangan]
export const SFX: [string, number, number][] = [
  ['dengung.wav', 70.5, 0.22],
  ['taip.wav', 70.75, 0.18], ['taip.wav', 70.95, 0.18], ['taip.wav', 71.15, 0.18], ['taip.wav', 71.35, 0.18],
  ['swish_teks.wav', 72.28, 0.3], ['swish_teks.wav', 73.58, 0.3],
  ['riser.wav', 73.7, 0.18],
  ['impact_besar.wav', 75.12, 0.42], ['braam.wav', 75.12, 0.16],
  ['pop_bintang.wav', 77.16, 0.3],
  ['whoosh_pendek.wav', 78.2, 0.25],
  ['swish_teks.wav', 78.48, 0.25], ['swish_teks.wav', 78.72, 0.25], ['swish_teks.wav', 80.66, 0.25],
  ['whoosh_panjang.wav', 81.0, 0.25], ['impact_lembut.wav', 81.86, 0.35],
  ['whoosh_pendek.wav', 83.4, 0.22], ['swish_teks.wav', 84.68, 0.25], ['degupan.wav', 86.45, 0.35],
  ['blip.wav', 88.02, 0.4], ['blip.wav', 88.82, 0.4], ['kilauan.wav', 89.5, 0.28], ['impact_lembut.wav', 89.5, 0.25],
  ['stinger.wav', 90.3, 0.32], ['sedutan.wav', 91.9, 0.2],
  ['sub_drop.wav', 93.2, 0.45], ['impact_besar.wav', 93.2, 0.38],
  ['blip.wav', 94.1, 0.25], ['blip.wav', 94.4, 0.25], ['blip.wav', 94.7, 0.25], ['blip.wav', 95.0, 0.25], ['blip.wav', 95.3, 0.25],
  ['impact_lembut.wav', 95.5, 0.3],
  ['whoosh_panjang.wav', 95.9, 0.25], ['detik.wav', 96.7, 0.3],
  ['whoosh_pendek.wav', 98.7, 0.25],
  ['whoosh_pendek.wav', 100.7, 0.22],
  ['swish_teks.wav', 104.02, 0.28], ['swish_teks.wav', 105.62, 0.28], ['swish_teks.wav', 107.4, 0.28], ['swish_teks.wav', 108.3, 0.28],
  ['kamera.wav', 109.28, 0.35],
  ['hum.wav', 110.4, 0.18], ['impact_lembut.wav', 111.28, 0.28], ['impact_lembut.wav', 112.42, 0.28],
  ['drumroll.wav', 113.9, 0.22], ['taiko.wav', 115.04, 0.3], ['taiko.wav', 115.76, 0.4],
  ['braam.wav', 116.9, 0.16], ['taip.wav', 117.0, 0.15], ['taip.wav', 117.3, 0.15],
  ['kamera.wav', 118.6, 0.3], ['kamera.wav', 119.74, 0.3], ['kamera.wav', 121.84, 0.3], ['kamera.wav', 124.44, 0.3],
  ['warp.wav', 125.85, 0.22], ['impact_lembut.wav', 126.36, 0.3],
  ['koir.wav', 127.8, 0.16], ['kilauan.wav', 128.3, 0.2],
];
