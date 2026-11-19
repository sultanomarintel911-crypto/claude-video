export const FPS = 30;
export const W = 1080;
export const H = 1920;

/** Saat sebelum bacaan bermula (tajuk pembukaan). */
export const INTRO = 2.6;
/** Saat selepas bacaan tamat (penutup). */
export const OUTRO = 4.2;

/** Nama akaun yang dipapar sepanjang video ('' = tiada). */
export const HANDLE = '@abraryusof';

export type Word = {ar: string; start: number; end: number};
/**
 * Frasa: `from`/`to` = nombor perkataan (1-based, inklusif).
 * `tr` = terjemahan Basmeih bagi frasa itu; *perkataan* = sorotan. `scene` = nama babak.
 */
export type Group = {from: number; to: number; tr: string; scene: string};

type AyatJson = {key: string; rujukan: string; audioFile: string; duration: number; arFont?: string; words: {ar: string; start: number; end: number}[]};

export const makeAyat = (json: AyatJson, groups: Group[]) => {
	const words: Word[] = json.words.map((w) => ({ar: w.ar, start: w.start / 1000, end: w.end / 1000}));
	const audioEnd = json.duration;
	const start = (i: number) => words[groups[i].from - 1].start;
	const end = (i: number) => (i + 1 < groups.length ? start(i + 1) : audioEnd + 0.6);
	/** Masa mula setiap babak, ikut nama. */
	const S: Record<string, number> = Object.fromEntries(groups.map((g, i) => [g.scene, start(i)]));
	return {
		key: json.key,
		rujukan: json.rujukan,
		audioFile: json.audioFile,
		/** Amiri Quran untuk ayat; Amiri biasa untuk hadis. */
		arFont: json.arFont ?? 'Amiri Quran',
		/** Hadis: audio ambien bermula dari frame 0 (tiada bacaan). */
		ambient: json.audioFile.startsWith('ambien'),
		words,
		groups,
		audioEnd,
		start,
		end,
		S,
		duration: Math.ceil((INTRO + audioEnd + OUTRO) * FPS),
	};
};
export type Ayat = ReturnType<typeof makeAyat>;

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
