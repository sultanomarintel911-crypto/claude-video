import ayat from './ayat.json';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

/** Saat sebelum bacaan bermula (tajuk pembukaan). */
export const INTRO = 2.6;
/** Saat selepas bacaan tamat (penutup). */
export const OUTRO = 4.2;

export type Word = {ar: string; start: number; end: number};
export const WORDS: Word[] = ayat.words.map((w) => ({ar: w.ar, start: w.start / 1000, end: w.end / 1000}));
export const AUDIO_END = 29.07;
export const DURATION = Math.ceil((INTRO + AUDIO_END + OUTRO) * FPS);

export const RUJUKAN = 'Surah Al-Ahzab · 33:59';

/**
 * Kumpulan frasa. `from`/`to` = nombor perkataan (1-based, inklusif).
 * Terjemahan: Abdullah Muhammad Basmeih, dipecah ikut frasa. *perkataan* = sorot emas.
 */
export type Group = {from: number; to: number; tr: string; scene: SceneId};
export type SceneId = 'wahyu' | 'wanita' | 'labuh' | 'dikenali' | 'dilindungi' | 'rahmat';

export const GROUPS: Group[] = [
	{from: 1, to: 3, tr: 'Wahai *Nabi*, suruhlah', scene: 'wahyu'},
	{from: 4, to: 7, tr: 'isteri-isterimu, anak-anak perempuanmu serta *perempuan-perempuan yang beriman*,', scene: 'wanita'},
	{from: 8, to: 11, tr: 'supaya *melabuhkan* pakaiannya bagi *menutup seluruh tubuhnya*;', scene: 'labuh'},
	{from: 12, to: 15, tr: 'cara yang demikian lebih sesuai untuk mereka *dikenal* (sebagai perempuan yang baik-baik)', scene: 'dikenali'},
	{from: 16, to: 17, tr: 'maka dengan itu mereka *tidak diganggu*.', scene: 'dilindungi'},
	{from: 18, to: 21, tr: 'Dan Allah adalah *Maha Pengampun*, lagi *Maha Mengasihani*.', scene: 'rahmat'},
];

export const groupStart = (g: Group) => WORDS[g.from - 1].start;
export const groupEnd = (i: number) => (i + 1 < GROUPS.length ? groupStart(GROUPS[i + 1]) : AUDIO_END + 0.6);

export const C = {
	// Tema "Subuh": ungu tua → merah jambu → peach di ufuk.
	skyTop: '#1d0f2e',
	skyMid: '#6a2d5c',
	skyLow: '#e3866f',
	horizon: '#f8c38c',
	sun: '#ffe2b0',
	hillFar: '#a2506d',
	hillMid: '#5e2a4d',
	hillNear: '#2a1327',
	gold: '#ffb48c', // warna sorotan (koral-peach)
	goldDeep: '#ec7a62',
	cream: '#3a1a35', // jubah (siluet)
	creamLight: '#f6dcc6', // wajah / cahaya lembut
	jilbab: '#5c2a4e',
	rim: '#ffc9a0',
	text: '#fbeee4',
	dim: 'rgba(251,238,228,0.55)',
	bottom: '#170a19',
};
