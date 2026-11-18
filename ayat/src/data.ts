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
	skyTop: '#060d1f',
	skyMid: '#0d2238',
	skyLow: '#163a4c',
	hillFar: '#0f2b3a',
	hillNear: '#0a1e2a',
	gold: '#f0c878',
	goldDeep: '#d9a441',
	cream: '#efe4cf',
	creamLight: '#f8f0e0',
	jilbab: '#d8c3a0',
	text: '#f4ecdc',
	dim: 'rgba(244,236,220,0.55)',
};
