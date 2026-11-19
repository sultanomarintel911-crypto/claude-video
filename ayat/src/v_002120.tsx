import React from 'react';
import {C, H, W, makeAyat} from "./data";
import data from './data/002120.json';
import {Shell, pop, ramp, rng, window_} from './core';

/**
 * Al-Baqarah 2:120. Lambang mudah faham: Islam di puncak gunung paling tinggi (Al-Quran bercahaya),
 * jalan utama mendaki ke puncak; dua simpang menurun ke lembah dengan papan tanda ✡ dan ✝
 * (dilukis sempurna, tidak dirosakkan); cahaya (nur) = hati orang beriman yang mendaki.
 */
export const ay = makeAyat(data, [
	{from: 1, to: 6, tr: 'Orang-orang Yahudi dan Nasrani *tidak sekali-kali akan bersetuju atau suka* kepadamu (wahai Muhammad)', scene: 'redha'},
	{from: 7, to: 9, tr: 'sehingga engkau *menurut agama mereka* (yang telah terpesong itu).', scene: 'ikut'},
	{from: 10, to: 15, tr: 'Katakanlah: "Sesungguhnya petunjuk Allah (agama Islam) itulah *petunjuk yang benar*."', scene: 'petunjuk'},
	{from: 16, to: 18, tr: 'Dan demi sesungguhnya jika engkau *menurut kehendak hawa nafsu mereka*', scene: 'nafsu'},
	{from: 19, to: 23, tr: 'sesudah datangnya (wahyu yang memberi) *pengetahuan* kepadamu (tentang kebenaran),', scene: 'ilmu'},
	{from: 24, to: 31, tr: 'maka tiadalah engkau akan peroleh dari Allah (sesuatupun) yang dapat *mengawal* dan *memberi pertolongan* kepadamu.', scene: 'pelindung'},
]);
const S = ay.S;
const WORDS = ay.words;
const END = ay.audioEnd;

// ---------- geometri ----------
const PEAK = {x: 540, y: 640};
/** Jalan utama berzigzag dari kaki gunung ke puncak. */
const PATH: [number, number][] = [
	[540, 1262],
	[400, 1160],
	[650, 1050],
	[455, 950],
	[610, 855],
	[505, 765],
	[540, 690],
];
const SEG = PATH.slice(1).map((p, i) => Math.hypot(p[0] - PATH[i][0], p[1] - PATH[i][1]));
const TOTAL = SEG.reduce((x, y) => x + y, 0);
const along = (k: number): [number, number] => {
	let d = Math.max(0, Math.min(1, k)) * TOTAL;
	for (let i = 0; i < SEG.length; i++) {
		if (d <= SEG[i]) {
			const f = d / SEG[i];
			return [PATH[i][0] + (PATH[i + 1][0] - PATH[i][0]) * f, PATH[i][1] + (PATH[i + 1][1] - PATH[i][1]) * f];
		}
		d -= SEG[i];
	}
	return PATH[PATH.length - 1];
};
const PATH_D = 'M ' + PATH.map((p) => p.join(' ')).join(' L ');
const BRANCH = [
	{d: 'M 470 1205 C 330 1215, 220 1232, 40 1236', post: [190, 1214], sym: 'david', side: -1},
	{d: 'M 610 1205 C 750 1215, 860 1232, 1040 1236', post: [890, 1214], sym: 'salib', side: 1},
] as const;

/** 0→1: jalan utama bercahaya (petunjuk), juga pembukaan & penutup. */
const roadGlow = (a: number) =>
	Math.max(1 - ramp(a, -0.4, 0.6), window_(a, WORDS[12].start, S.nafsu + 0.2, 0.9), ramp(a, END + 0.2, END + 1.6));
/** Kegelapan (amaran). */
const darkness = (a: number) =>
	Math.max(window_(a, S.nafsu + 0.3, S.ilmu + 0.2, 1.2) * 0.42, window_(a, S.pelindung + 0.2, END + 0.3, 1.2) * 0.55);
const bright = (a: number) => Math.max(window_(a, S.petunjuk + 0.3, S.nafsu + 0.2, 1.2), ramp(a, END + 0.4, END + 1.6) * 0.8);
/** Kedudukan nur di jalan (0 = kaki gunung, 1 = puncak). */
const climb = (a: number) =>
	Math.max(0.04, 0.04 + ramp(a, WORDS[12].start, S.nafsu) * 0.36 + ramp(a, S.ilmu + 0.5, S.pelindung) * 0.3 + ramp(a, END, END + 2.2) * 0.26);

const Quran: React.FC<{glow: number; t: number}> = ({glow, t}) => (
	<g transform={`translate(${PEAK.x} ${PEAK.y - 26})`}>
		<circle cx={0} cy={-20} r={150 + glow * 120} fill="url(#glow)" opacity={0.35 + glow * 0.55} />
		{glow > 0.05 &&
			Array.from({length: 10}, (_, i) => {
				const ang = (i / 10) * Math.PI * 2 + t * 0.15;
				return <path key={i} d={`M 0 -20 L ${Math.cos(ang - 0.05) * 320} ${-20 + Math.sin(ang - 0.05) * 320} L ${Math.cos(ang + 0.05) * 320} ${-20 + Math.sin(ang + 0.05) * 320} Z`} fill="#fff4e0" opacity={0.12 * glow} />;
			})}
		{/* rehal */}
		<path d="M -46 28 L 30 -14 M 46 28 L -30 -14" stroke="#7a4a3a" strokeWidth={9} strokeLinecap="round" />
		{/* mushaf terbuka */}
		<path d="M 0 -6 C -20 -18, -50 -20, -70 -12 L -64 -52 C -44 -60, -18 -56, 0 -44 Z" fill="#fbf1e2" stroke={C.gold} strokeWidth={3} />
		<path d="M 0 -6 C 20 -18, 50 -20, 70 -12 L 64 -52 C 44 -60, 18 -56, 0 -44 Z" fill="#fbf1e2" stroke={C.gold} strokeWidth={3} />
		{[0, 1, 2].map((i) => (
			<g key={i} stroke="#c9905f" strokeWidth={2.2} strokeLinecap="round" opacity={0.8}>
				<line x1={-56} y1={-44 + i * 9} x2={-12} y2={-38 + i * 9} />
				<line x1={12} y1={-38 + i * 9} x2={56} y2={-44 + i * 9} />
			</g>
		))}
		<line x1={0} y1={-44} x2={0} y2={-6} stroke={C.goldDeep} strokeWidth={3} />
	</g>
);

const Signpost: React.FC<{x: number; y: number; sym: string; k: number}> = ({x, y, sym, k}) => (
	<g transform={`translate(${x} ${y}) scale(${k})`} opacity={Math.min(1, k)}>
		<rect x={-5} y={-150} width={10} height={150} fill="#3a1a35" />
		<rect x={-62} y={-205} width={124} height={92} rx={10} fill="#4a2440" stroke="#9a6a88" strokeWidth={3} />
		{sym === 'david' ? (
			<g transform="translate(0 -159)" stroke="#f3e6da" strokeWidth={5} fill="none" strokeLinejoin="round">
				<path d="M 0 -32 L 28 16 L -28 16 Z" />
				<path d="M 0 32 L 28 -16 L -28 -16 Z" />
			</g>
		) : (
			<g transform="translate(0 -159)" fill="#f3e6da">
				<rect x={-5} y={-34} width={10} height={68} rx={2} />
				<rect x={-24} y={-16} width={48} height={10} rx={2} />
			</g>
		)}
	</g>
);

const Stage: React.FC<{t: number; a: number}> = ({t, a}) => {
	const dark = darkness(a);
	const glow = roadGlow(a);

	// Simpang ke lembah muncul pada "ٱلْيَهُودُ" dan "ٱلنَّصَـٰرَىٰ"
	const branchOut = 1 - ramp(a, S.petunjuk + 0.4, S.petunjuk + 1.6) * 0.6 + ramp(a, S.nafsu, S.nafsu + 1) * 0.4;
	const outroFade = 1 - ramp(a, END - 0.2, END + 1);
	const ks = [pop(a, WORDS[3].start) * outroFade, pop(a, WORDS[5].start) * outroFade];

	// "tattabi' millatahum": tarikan ke tepi
	const pull = window_(a, S.ikut + 0.1, S.petunjuk + 0.1, 0.6);

	// Kabus hawa nafsu
	const fog = window_(a, S.nafsu + 0.2, S.ilmu + 1.5, 1.6) * (1 - 0.4 * ramp(a, S.ilmu + 0.4, S.ilmu + 1.4));

	// Wahyu/ilmu turun ke Al-Quran di puncak
	const ilmu = window_(a, S.ilmu + 0.1, S.pelindung + 0.3, 0.8);
	const beam = ramp(a, S.ilmu, S.ilmu + 1.4);
	const ilmuFlash = Math.max(0, 1 - Math.abs(a - WORDS[22].start) / 0.6);
	const quranGlow = Math.max(0.25, glow, ilmu, ramp(a, END, END + 1.5));

	// nur (hati orang beriman)
	const [nx, ny0] = along(climb(a));
	const sway = Math.sin(a * 2.4) * 26 * pull;
	const ny = ny0 - 26 + Math.sin(t * 2) * 4;
	const flicker = dark > 0.05 ? 0.7 + 0.3 * Math.sin(t * 17) * Math.sin(t * 5.3) : 1;
	const nurGlow = Math.max(0.45, glow * 0.8, ilmu) * flicker;

	// Kubah pelindung yang pecah: tiada pelindung selain Allah
	const domeIn = ramp(a, S.pelindung + 0.2, S.pelindung + 1.2);
	const breakT = WORDS[28].start; // "وَلِىٍّ"
	const shatter = ramp(a, breakT, breakT + 2.2);

	return (
		<g>
			<defs>
				<linearGradient id="gunung" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#8e4466" />
					<stop offset="0.45" stopColor="#5e2a4d" />
					<stop offset="1" stopColor="#2a1327" />
				</linearGradient>
			</defs>
			{/* gunung: Islam paling tinggi */}
			<path d={`M -80 1250 C 120 1120, 280 960, 400 840 C 460 770, 500 700, ${PEAK.x} ${PEAK.y} C 580 700, 620 770, 690 850 C 800 960, 960 1120, 1160 1250 Z`} fill="url(#gunung)" />
			<path d={`M 470 735 C 495 700, 515 670, ${PEAK.x} ${PEAK.y} C 565 670, 585 700, 612 738 C 590 728, 570 742, 548 726 C 528 742, 500 726, 470 735 Z`} fill="#f6dcc6" opacity={0.75} />
			<path d={`M -80 1250 C 120 1120, 280 960, 400 840 C 460 770, 500 700, ${PEAK.x} ${PEAK.y}`} stroke={C.rim} strokeWidth={3} fill="none" opacity={0.45} />

			{/* jalan utama ke puncak */}
			<path d={PATH_D} stroke="#2a1327" strokeWidth={30} fill="none" strokeLinejoin="round" strokeLinecap="round" />
			<path d={PATH_D} stroke="#7b3f63" strokeWidth={20} fill="none" strokeLinejoin="round" strokeLinecap="round" />
			<path d={PATH_D} stroke={C.gold} strokeWidth={14} fill="none" strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - glow} opacity={0.85 * glow + 0.15} />

			{/* simpang ke lembah + papan tanda */}
			{BRANCH.map((b, i) =>
				ks[i] > 0 ? (
					<g key={i} opacity={Math.min(1, branchOut)}>
						<path d={b.d} stroke="#4a2440" strokeWidth={34} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - Math.min(1, ks[i])} />
						<Signpost x={b.post[0]} y={b.post[1]} sym={b.sym} k={ks[i]} />
						{pull > 0 &&
							[0, 1, 2].map((j) => {
								const p = (a * 0.5 + j / 3) % 1;
								const x = 540 + b.side * (110 + p * 300);
								const y = 1208 + p * 22;
								return (
									<path
										key={j}
										d={`M ${x - b.side * 14} ${y - 14} L ${x} ${y} L ${x - b.side * 14} ${y + 14}`}
										stroke={C.creamLight}
										strokeWidth={5}
										fill="none"
										strokeLinecap="round"
										strokeLinejoin="round"
										opacity={pull * Math.sin(p * Math.PI) * 0.8}
									/>
								);
							})}
					</g>
				) : null,
			)}

			{/* kabus */}
			{fog > 0 && (
				<g filter="url(#blur14)" opacity={fog}>
					{Array.from({length: 9}, (_, i) => {
						const r = rng(i * 11 + 5);
						const side = i % 2 ? 1 : -1;
						const reach = 0.55 + r() * 0.35;
						const x = 540 + side * (720 - 520 * reach * ramp(a, S.nafsu, S.nafsu + 2.5)) + Math.sin(t * 0.7 + i) * 30;
						const y = 860 + r() * 360;
						return <ellipse key={i} cx={x} cy={y} rx={240 + r() * 160} ry={70 + r() * 50} fill="#3a2038" opacity={0.75} />;
					})}
				</g>
			)}

			{/* kegelapan amaran (Al-Quran di puncak tetap bercahaya) */}
			<rect width={W} height={H} fill="#0d0612" opacity={dark} />

			{/* wahyu / ilmu turun ke Al-Quran */}
			{ilmu > 0 && (
				<g opacity={ilmu}>
					<path d={`M ${PEAK.x - 24 * beam} 0 L ${PEAK.x + 24 * beam} 0 L ${PEAK.x + 100 * beam} ${PEAK.y} L ${PEAK.x - 100 * beam} ${PEAK.y} Z`} fill="url(#soft)" filter="url(#blur8)" />
					<rect x={PEAK.x - 4} y={0} width={8} height={(PEAK.y - 80) * beam} fill={C.gold} opacity={0.8} filter="url(#blur3)" />
					{ilmuFlash > 0 && <circle cx={PEAK.x} cy={PEAK.y - 40} r={60 + (1 - ilmuFlash) * 260} stroke={C.gold} strokeWidth={4} fill="none" opacity={ilmuFlash} />}
				</g>
			)}
			<Quran glow={quranGlow} t={t} />

			{/* nur: hati orang beriman */}
			<g transform={`translate(${nx + sway} ${ny})`}>
				<circle r={58 + nurGlow * 40} fill="url(#glow)" opacity={0.5 + nurGlow * 0.4} />
				<circle r={13} fill="#fff6e8" opacity={0.95 * flicker} />
			</g>

			{/* kubah pelindung pecah */}
			{domeIn > 0 && shatter < 1 && (
				<g opacity={1 - shatter} transform={`translate(${nx} ${ny0})`}>
					<path
						d="M -110 4 A 110 160 0 0 1 110 4"
						stroke={C.gold}
						strokeWidth={4}
						fill="none"
						pathLength={1}
						strokeDasharray={shatter > 0 ? '0.03 0.04' : '1 1'}
						strokeDashoffset={shatter > 0 ? 0 : 1 - domeIn}
						opacity={0.8}
					/>
					{shatter > 0 &&
						Array.from({length: 18}, (_, i) => {
							const ang = Math.PI + (i / 17) * Math.PI;
							const r = rng(i * 3 + 9);
							const d = shatter * (100 + r() * 200);
							const x = Math.cos(ang) * (110 + d);
							const y = 4 + Math.sin(ang) * (160 + d) + shatter * shatter * 140;
							return <rect key={i} x={x - 6} y={y - 3} width={12} height={6} fill={C.gold} transform={`rotate(${r() * 180 + shatter * 300} ${x} ${y})`} opacity={0.9} />;
						})}
				</g>
			)}
		</g>
	);
};

export const AyatYahudiNasrani: React.FC = () => (
	<Shell ay={ay} title="Teguh di Atas *Petunjuk*" sub="pesanan Allah yang kekal dalam Al-Quran" bright={bright} stage={(t, a) => <Stage t={t} a={a} />} titleTop={300} />
);
