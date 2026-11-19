import React from 'react';
import {C, H, W, makeAyat} from "./data";
import data from './data/002120.json';
import {GROUND, Shell, ramp, rng, window_} from './core';

/**
 * Al-Baqarah 2:120. Simbolik sahaja: jalan lurus (petunjuk), dua simpang (jalan lain),
 * tanglung (cahaya iman). Tiada watak, tiada simbol agama lain.
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

const VY = GROUND - 140; // titik hilang jalan (ufuk, depan matahari)
const BOT = 1270;
const LX = 540;
const LY = 1168; // kedudukan tanglung

/** 0→1: jalan utama bercahaya (petunjuk), juga pembukaan & penutup. */
const roadGlow = (a: number) =>
	Math.max(1 - ramp(a, -0.4, 0.6), window_(a, WORDS[12].start, S.nafsu + 0.2, 0.9), ramp(a, END + 0.2, END + 1.4));
/** Kegelapan (amaran). */
const darkness = (a: number) =>
	Math.max(window_(a, S.nafsu + 0.3, S.ilmu + 0.2, 1.2) * 0.42, window_(a, S.pelindung + 0.2, END + 0.3, 1.2) * 0.55);
const bright = (a: number) => Math.max(window_(a, S.petunjuk + 0.3, S.nafsu + 0.2, 1.2), ramp(a, END + 0.4, END + 1.6) * 0.8);

const StandLantern: React.FC<{s: number; glow: number; sway: number}> = ({s, glow, sway}) => (
	<g transform={`translate(${LX} ${LY}) rotate(${sway}) scale(${s})`}>
		<circle cx={0} cy={-46} r={70 + glow * 90} fill="url(#glow)" opacity={0.35 + glow * 0.55} />
		<ellipse cx={0} cy={2} rx={34} ry={6} fill="#000" opacity={0.3} />
		<path d="M -14 -88 L 14 -88 L 22 -74 L -22 -74 Z" fill={C.goldDeep} />
		<path d="M -26 -72 L 26 -72 L 20 -22 L -20 -22 Z" fill={C.gold} />
		<path d="M -10 -66 L 10 -66 L 8 -28 L -8 -28 Z" fill={C.creamLight} opacity={0.7 + glow * 0.3} />
		<path d="M -22 -20 L 22 -20 L 16 0 L -16 0 Z" fill={C.goldDeep} />
		<path d="M -6 -96 Q 0 -110 6 -96" stroke={C.goldDeep} strokeWidth={4} fill="none" />
	</g>
);

const Stage: React.FC<{t: number; a: number}> = ({t, a}) => {
	const dark = darkness(a);
	const glow = roadGlow(a);

	// Simpang kiri & kanan muncul pada "ٱلْيَهُودُ" dan "ٱلنَّصَـٰرَىٰ"
	const branchOut = 1 - ramp(a, S.petunjuk + 0.4, S.petunjuk + 1.6) * 0.7 + ramp(a, S.nafsu, S.nafsu + 1) * 0.5;
	const outroFade = 1 - ramp(a, END - 0.2, END + 1);
	const left = ramp(a, WORDS[3].start, WORDS[3].start + 1) * outroFade;
	const right = ramp(a, WORDS[5].start, WORDS[5].start + 1) * outroFade;

	// "tattabi' millatahum": tarikan ke tepi
	const pull = window_(a, S.ikut + 0.1, S.petunjuk + 0.1, 0.6);
	const sway = Math.sin(a * 2.4) * 6 * pull + Math.sin(t * 1.3) * 1.5;

	// Kabus hawa nafsu
	const fog = window_(a, S.nafsu + 0.2, S.ilmu + 1.5, 1.6) * (1 - 0.4 * ramp(a, S.ilmu + 0.4, S.ilmu + 1.4));

	// Wahyu/ilmu turun ke tanglung
	const ilmu = window_(a, S.ilmu + 0.1, S.pelindung + 0.3, 0.8);
	const beam = ramp(a, S.ilmu, S.ilmu + 1.4);
	const ilmuFlash = Math.max(0, 1 - Math.abs(a - WORDS[22].start) / 0.6);

	// Kubah pelindung yang pecah: tiada pelindung selain Allah
	const domeIn = ramp(a, S.pelindung + 0.2, S.pelindung + 1.2);
	const breakT = WORDS[28].start; // "وَلِىٍّ"
	const shatter = ramp(a, breakT, breakT + 2.2);

	const flicker = dark > 0.05 ? 0.75 + 0.25 * Math.sin(t * 17) * Math.sin(t * 5.3) : 1;
	const lanternGlow = Math.max(glow * 0.7, ilmu * (0.6 + ilmuFlash * 0.4), 0.25) * flicker;

	const road = `M ${LX - 230} ${BOT} L ${LX + 230} ${BOT} L ${LX + 5} ${VY} L ${LX - 5} ${VY} Z`;

	return (
		<g>
			{/* jalan utama */}
			<path d={road} fill={C.hillMid} />
			<path d={road} fill="#7b3f63" opacity={0.6} />
			<defs>
				<clipPath id="roadClip">
					<rect x={0} y={BOT - (BOT - VY) * glow} width={W} height={(BOT - VY) * glow + 10} />
				</clipPath>
				<linearGradient id="roadGold" x1="0" y1="1" x2="0" y2="0">
					<stop offset="0" stopColor={C.gold} stopOpacity="0.55" />
					<stop offset="1" stopColor={C.sun} stopOpacity="0.95" />
				</linearGradient>
			</defs>
			<path d={road} fill="url(#roadGold)" clipPath="url(#roadClip)" opacity={glow} />
			{/* garis tengah jalan */}
			{[0, 1, 2, 3, 4].map((i) => {
				const p0 = ((i / 5 + t * 0.08) % 1) ** 2;
				const p1 = Math.min(1, p0 + 0.05);
				const y0 = VY + (BOT - VY) * p0;
				const y1 = VY + (BOT - VY) * p1;
				return <line key={i} x1={LX} y1={y0} x2={LX} y2={y1} stroke={C.creamLight} strokeWidth={1 + p0 * 6} opacity={0.35 + glow * 0.4} strokeLinecap="round" />;
			})}

			{/* simpang ke tepi (jalan lain) */}
			{[
				{k: left, d: `M ${LX - 90} 1205 Q 300 1150 -40 1090`, side: -1},
				{k: right, d: `M ${LX + 90} 1205 Q 780 1150 1120 1090`, side: 1},
			].map((b, i) =>
				b.k > 0 ? (
					<g key={i} opacity={Math.min(1, branchOut)}>
						<path d={b.d} stroke="#4a2440" strokeWidth={46} fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - b.k} />
						<path d={b.d} stroke="#8a5a7a" strokeWidth={3} strokeDasharray="0.02 0.03" pathLength={1} fill="none" opacity={0.6 * b.k} />
						{pull > 0 &&
							[0, 1, 2].map((j) => {
								const p = (a * 0.5 + j / 3) % 1;
								const x = LX + b.side * (130 + p * 360);
								const y = 1200 - p * 85;
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
						const x = LX + side * (720 - 520 * reach * ramp(a, S.nafsu, S.nafsu + 2.5)) + Math.sin(t * 0.7 + i) * 30;
						const y = 860 + r() * 360;
						return <ellipse key={i} cx={x} cy={y} rx={240 + r() * 160} ry={70 + r() * 50} fill="#3a2038" opacity={0.75} />;
					})}
				</g>
			)}

			{/* kegelapan amaran */}
			<rect width={W} height={H} fill="#0d0612" opacity={dark} />

			{/* wahyu / ilmu turun */}
			{ilmu > 0 && (
				<g opacity={ilmu}>
					<path d={`M ${LX - 24 * beam} 0 L ${LX + 24 * beam} 0 L ${LX + 110 * beam} ${LY} L ${LX - 110 * beam} ${LY} Z`} fill="url(#soft)" filter="url(#blur8)" />
					<rect x={LX - 4} y={0} width={8} height={(LY - 60) * beam} fill={C.gold} opacity={0.8} filter="url(#blur3)" />
					{ilmuFlash > 0 && <circle cx={LX} cy={LY - 50} r={60 + (1 - ilmuFlash) * 260} stroke={C.gold} strokeWidth={4} fill="none" opacity={ilmuFlash} />}
				</g>
			)}

			<StandLantern s={1.55} glow={lanternGlow} sway={sway} />

			{/* kubah pelindung pecah */}
			{domeIn > 0 && shatter < 1 && (
				<g opacity={1 - shatter}>
					<path
						d={`M ${LX - 150} ${LY + 4} A 150 230 0 0 1 ${LX + 150} ${LY + 4}`}
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
							const d = shatter * (120 + r() * 220);
							const x = LX + Math.cos(ang) * (150 + d);
							const y = LY + 4 + Math.sin(ang) * (230 + d) + shatter * shatter * 160;
							return <rect key={i} x={x - 6} y={y - 3} width={12} height={6} fill={C.gold} transform={`rotate(${r() * 180 + shatter * 300} ${x} ${y})`} opacity={0.9} />;
						})}
				</g>
			)}
		</g>
	);
};

export const AyatYahudiNasrani: React.FC = () => (
	<Shell ay={ay} title="Teguh di Atas *Petunjuk*" sub="pesanan Allah yang kekal dalam Al-Quran" bright={bright} stage={(t, a) => <Stage t={t} a={a} />} />
);
