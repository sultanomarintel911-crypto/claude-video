import React from 'react';
import {C, W, makeAyat} from './data';
import data from './data/033059.json';
import {GROUND, Lantern, Shell, Woman, pop, ramp, rng, window_} from './core';

export const ay = makeAyat(data, [
	{from: 1, to: 3, tr: 'Wahai *Nabi*, suruhlah', scene: 'wahyu'},
	{from: 4, to: 7, tr: 'isteri-isterimu, anak-anak perempuanmu serta *perempuan-perempuan yang beriman*,', scene: 'wanita'},
	{from: 8, to: 11, tr: 'supaya *melabuhkan* pakaiannya bagi *menutup seluruh tubuhnya*;', scene: 'labuh'},
	{from: 12, to: 15, tr: 'cara yang demikian lebih sesuai untuk mereka *dikenal* (sebagai perempuan yang baik-baik)', scene: 'dikenali'},
	{from: 16, to: 17, tr: 'maka dengan itu mereka *tidak diganggu*.', scene: 'dilindungi'},
	{from: 18, to: 21, tr: 'Dan Allah adalah *Maha Pengampun*, lagi *Maha Mengasihani*.', scene: 'rahmat'},
]);
const S = ay.S;

// ---------- babak ----------
const Stage: React.FC<{t: number; a: number}> = ({t, a}) => {
	const WORDS = ay.words;
	const AUDIO_END = ay.audioEnd;
	// A: cahaya wahyu turun
	const wahyuK = window_(a, S.wahyu + 0.1, S.wanita + 0.6, 0.8);
	const beam = ramp(a, S.wahyu, S.wahyu + 1.2);

	// B: tanglung + barisan wanita
	const wanitaK = window_(a, S.wanita, S.labuh + 0.4, 0.6);
	const lanterns = [WORDS[3].start, WORDS[4].start, WORDS[5].start].map((s) => pop(a, s) * wanitaK);
	const rowIn = (i: number) => pop(a, WORDS[5].start + 0.2 + i * 0.16);
	const sideOut = 1 - ramp(a, S.labuh, S.labuh + 0.8);

	// C: tudung dilabuhkan
	const drape = ramp(a, WORDS[7].start + 0.3, WORDS[10].start + 1.2);
	const drapeAnim = drape > 0 && drape < 1 ? Math.sin(drape * Math.PI) : 0;
	const zoom = ramp(a, S.labuh, S.labuh + 1);
	const centerS = 0.86 + zoom * 0.34;

	// D: dikenali
	const aura = window_(a, S.dikenali + 0.2, S.dilindungi + 0.2, 1);
	const ringT = a - WORDS[14].start;

	// E: dilindungi
	const dome = ramp(a, S.dilindungi, S.dilindungi + 1);
	const domeOut = ramp(a, S.rahmat - 0.3, S.rahmat + 0.5);
	const hitT = WORDS[16].start + 1.25;
	const zIn = ramp(a, S.dilindungi + 0.3, hitT);
	const zOut = ramp(a, hitT, hitT + 1);
	const flash = Math.max(0, 1 - Math.abs(a - hitT) / 0.35);

	// F: rahmat
	const rain = window_(a, S.rahmat + 0.2, AUDIO_END + 2.6, 1.2);

	// Watak utama: muncul dalam barisan (B), kekal hingga penutup.
	const intro = 1 - ramp(a, -0.6, S.wahyu + 0.4);
	const outro = ramp(a, AUDIO_END + 0.4, AUDIO_END + 1.6);
	const mainOp = Math.max(intro, rowIn(2), outro);
	const mainDrape = Math.max(drape, intro, outro);
	const mainS = intro > 0 || outro > 0 ? Math.max(centerS, 1.2) : centerS;

	return (
		<g>
			{/* A */}
			{wahyuK > 0 && (
				<g opacity={wahyuK}>
					<path d={`M ${540 - 26 * beam} 0 L ${540 + 26 * beam} 0 L ${540 + 120 * beam} ${GROUND} L ${540 - 120 * beam} ${GROUND} Z`} fill="url(#soft)" filter="url(#blur8)" />
					<rect x={536} y={0} width={8} height={GROUND * beam} fill={C.gold} opacity={0.75} filter="url(#blur3)" />
					{[0, 1, 2].map((i) => {
						const p = ((a - S.wahyu - 0.8 + i * 1.1) % 3.3) / 3.3;
						if (a - S.wahyu - 0.8 < 0 || p < 0) return null;
						return <ellipse key={i} cx={540} cy={GROUND + 4} rx={40 + p * 420} ry={8 + p * 50} stroke={C.gold} strokeWidth={3} fill="none" opacity={(1 - p) * 0.8} />;
					})}
					<circle cx={540} cy={GROUND} r={110} fill="url(#glow)" opacity={beam * 0.7} />
				</g>
			)}

			{/* B */}
			<Lantern x={250} len={330} k={lanterns[0]} t={t} />
			<Lantern x={540} len={420} k={lanterns[1]} t={t} />
			<Lantern x={830} len={360} k={lanterns[2]} t={t} />
			{[0, 1, 3, 4].map((i) => {
				const k = rowIn(i) * sideOut;
				if (k <= 0) return null;
				const xs = [180, 360, 540, 720, 900];
				return (
					<g key={i} transform={`translate(0 ${(1 - Math.min(1, k)) * 40})`}>
						<Woman x={xs[i]} s={i % 2 ? 0.8 : 0.72} drape={0} op={Math.min(1, k) * (0.75 + 0.25 * sideOut)} t={t} />
					</g>
				);
			})}

			{/* D: aura & cincin */}
			{aura > 0 && (
				<g opacity={aura}>
					<circle cx={540} cy={GROUND - 210} r={330 + Math.sin(t * 2) * 14} fill="url(#glow)" opacity={0.28} />
					{Array.from({length: 7}, (_, i) => {
						const ang = t * 0.6 + (i / 7) * Math.PI * 2;
						return <circle key={i} cx={540 + Math.cos(ang) * 230} cy={GROUND - 220 + Math.sin(ang) * 120} r={4} fill={C.gold} opacity={0.5 + 0.5 * Math.sin(t * 3 + i)} />;
					})}
				</g>
			)}
			{ringT > 0 && ringT < 1.6 && (
				<circle cx={540} cy={GROUND - 210} r={140 + ringT * 220} stroke={C.gold} strokeWidth={4} fill="none" opacity={1 - ringT / 1.6} />
			)}

			{/* E: zigzag gangguan */}
			{zIn > 0 && zOut < 1 && (
				<g opacity={(1 - zOut) * 0.9}>
					{[-1, 1].map((side) =>
						[0, 1, 2].map((j) => {
							const reach = 540 + side * (300 + j * 18);
							const start = 540 + side * 700;
							const xHead = start + (reach - start) * zIn - side * zOut * 160;
							const y0 = GROUND - 380 + j * 120;
							const pts = Array.from({length: 7}, (_, k) => `${xHead + side * k * 34},${y0 + (k % 2 ? -22 : 22)}`).join(' ');
							return <polyline key={`${side}${j}`} points={pts} stroke={C.hillNear} strokeWidth={7} fill="none" strokeLinejoin="round" strokeLinecap="round" />;
						}),
					)}
				</g>
			)}

			{/* Watak utama */}
			<Woman x={540} s={mainS} drape={mainDrape} op={mainOp} t={t} shimmer={drapeAnim} />

			{/* C: anak panah "labuh" */}
			{drapeAnim > 0.02 && (
				<g opacity={drapeAnim} transform={`translate(${540 + 175} ${GROUND - 270 * centerS})`}>
					<line x1={0} y1={0} x2={0} y2={170 * drape + 20} stroke={C.gold} strokeWidth={4} strokeDasharray="4 12" strokeLinecap="round" />
					<path d={`M -14 ${170 * drape + 14} L 0 ${170 * drape + 36} L 14 ${170 * drape + 14}`} stroke={C.gold} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				</g>
			)}
			{drape > 0 &&
				drape < 1 &&
				Array.from({length: 10}, (_, i) => {
					const r = rng(i * 7 + 3);
					const ph = (a * 0.8 + r()) % 1;
					return <circle key={i} cx={540 + (r() - 0.5) * 260} cy={GROUND - 380 + ph * 330} r={2 + r() * 3} fill={C.gold} opacity={Math.sin(ph * Math.PI) * drapeAnim} />;
				})}

			{/* E: kubah perlindungan */}
			{dome > 0 && domeOut < 1 && (
				<g>
					<path
						d={`M ${540 - 270} ${GROUND} A 270 470 0 0 1 ${540 + 270} ${GROUND}`}
						fill={C.gold}
						fillOpacity={0.06 * dome + flash * 0.12}
						stroke={C.gold}
						strokeWidth={4 + flash * 6}
						pathLength={1}
						strokeDasharray="1 1"
						strokeDashoffset={1 - dome}
						opacity={0.85 * (1 - domeOut)}
					/>
				</g>
			)}

			{/* F: hujan cahaya */}
			{rain > 0 &&
				Array.from({length: 46}, (_, i) => {
					const r = rng(i * 13 + 1);
					const x = r() * W;
					const sp = 160 + r() * 200;
					const y = ((a - S.rahmat) * sp + r() * 1200) % 1250;
					return (
						<g key={i} opacity={rain * (0.4 + r() * 0.6)}>
							<circle cx={x} cy={y} r={2.4 + r() * 2.4} fill={C.gold} />
							<circle cx={x} cy={y} r={14} fill="url(#glow)" opacity={0.35} />
						</g>
					);
				})}
		</g>
	);
};

export const AyatTudung: React.FC = () => (
	<Shell
		ay={ay}
		title="Labuhkan *Tudungmu*"
		sub="pesanan Allah yang kekal dalam Al-Quran"
		bright={(a) => ramp(a, S.rahmat, S.rahmat + 1.6) * (1 - ramp(a, ay.audioEnd + 1.5, ay.audioEnd + 3))}
		stage={(t, a) => <Stage t={t} a={a} />}
	/>
);
