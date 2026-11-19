import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {C, FPS, H, INTRO, W, makeAyat} from './data';
import data from './data/hadis_bukhari_7320.json';
import {Shell, pop, ramp, window_} from './core';

/**
 * Hadis "lubang biawak" — Sahih al-Bukhari 7320 (Abu Sa'id al-Khudri).
 * Simbolik: jejak gelap (umat terdahulu) → lubang biawak; jejak terang (kita) memijak tepat di atasnya.
 * Tiada watak manusia. Masa perkataan dijana (tiada audio bacaan); bunyi = angin + tapak kaki.
 */
export const ay = makeAyat(data, [
	{from: 1, to: 5, tr: 'Sungguh, kamu *pasti akan mengikuti* jalan orang-orang sebelum kamu,', scene: 'jejak'},
	{from: 6, to: 9, tr: '*sejengkal demi sejengkal*, *sehasta demi sehasta*,', scene: 'jengkal'},
	{from: 10, to: 15, tr: 'sehingga jika mereka masuk ke *lubang biawak* sekalipun, *kamu tetap mengikuti mereka*.', scene: 'lubang'},
	{from: 16, to: 21, tr: 'Kami bertanya: "Wahai Rasulullah, adakah mereka itu *Yahudi dan Nasrani*?"', scene: 'tanya'},
	{from: 22, to: 23, tr: 'Baginda menjawab: "*Siapa lagi* (kalau bukan mereka)?"', scene: 'jawab'},
]);
const S = ay.S;
const Wd = ay.words;
const END = ay.audioEnd;

// ---------- laluan jejak (bezier) ----------
const P = [
	[80, 1222],
	[300, 1050],
	[600, 1128],
	[812, 1016],
] as const;
const bez = (t: number) => {
	const u = 1 - t;
	const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
	return [k.reduce((s, c, i) => s + c * P[i][0], 0), k.reduce((s, c, i) => s + c * P[i][1], 0)];
};
const tan = (t: number) => {
	const [x0, y0] = bez(Math.max(0, t - 0.01));
	const [x1, y1] = bez(Math.min(1, t + 0.01));
	return Math.atan2(y1 - y0, x1 - x0);
};
const N = 14;
const PRINTS = Array.from({length: N}, (_, k) => {
	const t = (k / (N - 1)) * 0.93;
	const [x, y] = bez(t);
	const ang = tan(t);
	const side = k % 2 ? 1 : -1;
	const sc = Math.max(0.8, Math.min(1.6, 0.8 + ((y - 1016) / 206) * 0.8));
	return {x: x + Math.cos(ang + Math.PI / 2) * 14 * side * sc, y: y + Math.sin(ang + Math.PI / 2) * 14 * side * sc, deg: (ang * 180) / Math.PI + 90, sc};
});
const HOLE = {x: 818, y: 1014};

// ---------- masa ----------
/** Jejak gelap: 0..8 dalam babak 1, 9..13 pada "حَتَّى لَوْ دَخَلُوا". */
const darkTime = (k: number) =>
	k <= 8 ? S.jejak + 0.4 + (k / 8) * (S.jengkal - S.jejak - 0.8) : Wd[9].start + ((k - 9) / 4) * (Wd[11].end - Wd[9].start);
/** Jejak terang: 2 langkah setiap perkataan 6–9, kemudian 9..13 pada "تَبِعْتُمُوهُمْ". */
const lightTime = (k: number) => (k <= 7 ? Wd[5 + Math.floor(k / 2)].start + (k % 2) * 0.34 : k === 8 ? Wd[8].end + 0.05 : Wd[14].start + ((k - 9) / 4) * 1.3);

const Foot: React.FC<{x: number; y: number; deg: number; sc: number; fill: string; op: number; k: number}> = ({x, y, deg, sc, fill, op, k}) => (
	<g transform={`translate(${x} ${y}) rotate(${deg}) scale(${sc * (0.7 + 0.3 * k)})`} opacity={op}>
		<ellipse cx={0} cy={-6} rx={8} ry={13} fill={fill} />
		<ellipse cx={0} cy={13} rx={6} ry={7} fill={fill} />
	</g>
);

const Lizard: React.FC<{x: number; y: number; s: number; op: number; walk: number}> = ({x, y, s, op, walk}) => {
	const l = Math.sin(walk * 14) * 5;
	return (
		<g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
			<path d="M 22 0 C 44 -2, 60 8, 84 4" stroke="#3a1a35" strokeWidth={7} fill="none" strokeLinecap="round" />
			<line x1={-14} y1={0} x2={-20 + l} y2={13} stroke="#3a1a35" strokeWidth={5} strokeLinecap="round" />
			<line x1={-14} y1={0} x2={-20 - l} y2={-13} stroke="#3a1a35" strokeWidth={5} strokeLinecap="round" />
			<line x1={12} y1={0} x2={18 - l} y2={13} stroke="#3a1a35" strokeWidth={5} strokeLinecap="round" />
			<line x1={12} y1={0} x2={18 + l} y2={-13} stroke="#3a1a35" strokeWidth={5} strokeLinecap="round" />
			<ellipse cx={0} cy={0} rx={28} ry={10} fill="#3a1a35" />
			<ellipse cx={-34} cy={0} rx={12} ry={8} fill="#3a1a35" />
		</g>
	);
};

const darkness = (a: number) => Math.max(window_(a, S.tanya + 0.2, END + 0.6, 1.2) * 0.25, window_(a, S.jawab, END + 0.6, 1) * 0.2);

const Stage: React.FC<{t: number; a: number}> = ({t, a}) => {
	const outro = ramp(a, END + 0.3, END + 1.4);
	const holeRing = a - Wd[12].start; // "جُحْرَ"
	const jawabRing = a - Wd[22].start; // "فَمَنْ"

	// biawak: muncul dari kanan, masuk ke lubang pada "ضَبٍّ"
	const lz0 = Wd[13].start - 0.5;
	const walk = ramp(a, lz0, lz0 + 1.2);
	const sink = ramp(a, lz0 + 1.1, lz0 + 1.6);
	const lzOp = Math.min(ramp(a, lz0, lz0 + 0.3), 1 - sink);

	// tanya: jejak gelap berdenyut
	const ask = window_(a, S.tanya + 0.2, S.jawab + 0.6, 0.8);

	return (
		<g>
			<defs>
				<linearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#dca382" />
					<stop offset="0.25" stopColor="#b9766c" />
					<stop offset="1" stopColor="#5a2a4a" />
				</linearGradient>
			</defs>
			{/* bukit pasir */}
			<path d={`M0 986 C 260 940, 560 1012, 1080 958 L1080 ${H} L0 ${H}Z`} fill="url(#sand)" />
			<path d="M0 986 C 260 940, 560 1012, 1080 958" stroke="#f6c9a6" strokeWidth={3} fill="none" opacity={0.5} />

			{/* lubang biawak */}
			<g>
				<ellipse cx={HOLE.x + 4} cy={HOLE.y - 6} rx={92} ry={32} fill="#c38770" />
				<ellipse cx={HOLE.x} cy={HOLE.y} rx={54} ry={17} fill="#1a0b17" />
				{holeRing > 0 && holeRing < 1.4 && (
					<ellipse cx={HOLE.x} cy={HOLE.y} rx={50 + holeRing * 120} ry={17 + holeRing * 40} stroke={C.gold} strokeWidth={4} fill="none" opacity={1 - holeRing / 1.4} />
				)}
				{jawabRing > 0 &&
					[0, 0.5, 1].map((d) => {
						const r = jawabRing - d;
						if (r < 0 || r > 1.8) return null;
						return <ellipse key={d} cx={HOLE.x} cy={HOLE.y} rx={50 + r * 160} ry={17 + r * 55} stroke="#1a0b17" strokeWidth={5} fill="none" opacity={(1 - r / 1.8) * 0.8} />;
					})}
			</g>

			{/* jejak gelap: umat terdahulu */}
			{PRINTS.map((p, k) => {
				const kk = Math.max(ramp(a, darkTime(k), darkTime(k) + 0.25), outro);
				if (kk <= 0) return null;
				const pulse = ask > 0 ? 0.25 * ask * (0.5 + 0.5 * Math.sin(t * 5 - k * 0.5)) : 0;
				return <Foot key={k} {...p} sc={p.sc * 1.12} fill="#2a1327" op={kk * (0.8 + pulse)} k={kk} />;
			})}

			{/* jejak terang: kita, memijak tepat di atasnya */}
			{PRINTS.map((p, k) => {
				const kk = Math.max(pop(a, lightTime(k)), outro);
				if (kk <= 0) return null;
				return <Foot key={k} {...p} sc={p.sc * 0.82} fill={C.creamLight} op={Math.min(1, kk)} k={Math.min(1, kk)} />;
			})}

			{/* ukuran jengkal / hasta */}
			{[0, 1, 2, 3].map((i) => {
				const s = Wd[5 + i].start;
				const k = window_(a, s + 0.1, s + 1.0, 0.3);
				if (k <= 0) return null;
				const p0 = PRINTS[i * 2];
				const p1 = PRINTS[i * 2 + 1];
				const big = i >= 2; // hasta lebih panjang
				const q1 = big ? PRINTS[Math.min(N - 1, i * 2 + 2)] : p1;
				const ox = 0;
				const oy = -46;
				return (
					<g key={i} opacity={k} stroke={C.gold} strokeWidth={4} strokeLinecap="round">
						<line x1={p0.x + ox} y1={p0.y + oy} x2={q1.x + ox} y2={q1.y + oy} />
						<line x1={p0.x + ox} y1={p0.y + oy - 10} x2={p0.x + ox} y2={p0.y + oy + 10} />
						<line x1={q1.x + ox} y1={q1.y + oy - 10} x2={q1.x + ox} y2={q1.y + oy + 10} />
					</g>
				);
			})}

			{/* biawak */}
			{lzOp > 0 && (
				<g>
					<Lizard x={HOLE.x + 230 - walk * 210} y={HOLE.y + 2 + sink * 10} s={1.35 - sink * 0.8} op={lzOp} walk={a} />
				</g>
			)}

			{/* malap amaran */}
			<rect width={W} height={H} fill="#0d0612" opacity={darkness(a) * (1 - outro)} />
		</g>
	);
};

/** Bunyi tapak kaki pada setiap langkah jejak terang. */
const Steps: React.FC = () => (
	<>
		{Array.from({length: N}, (_, k) => (
			<Sequence key={k} from={Math.round((INTRO + lightTime(k)) * FPS)} durationInFrames={8}>
				<Audio src={staticFile('tapak.wav')} volume={0.55} />
			</Sequence>
		))}
	</>
);

export const HadisLubangBiawak: React.FC = () => (
	<Shell
		ay={ay}
		title="Hingga ke *Lubang Biawak*"
		sub="peringatan Nabi ﷺ untuk umatnya"
		bright={(a) => ramp(a, END + 0.4, END + 1.6) * 0.6}
		stage={(t, a) => <Stage t={t} a={a} />}
		extra={<Steps />}
	/>
);
