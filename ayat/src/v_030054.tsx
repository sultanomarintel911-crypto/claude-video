/**
 * Ar-Rum 30:54 — "Allah menciptakan kamu daripada lemah, kemudian kuat, kemudian lemah dan beruban."
 * Tema Subuh (2D vektor). Simbolik: sebatang pokok sebagai kitaran hidup — benih → pokok kuat →
 * daun memutih (uban) & gugur → bunga pelbagai jenis mekar → matahari naik. Tiada watak manusia.
 * Kesan: debunga bercahaya, cahaya hangat bergerak, butiran filem, denyut cahaya pada perkataan kunci.
 */
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, H, W, makeAyat} from './data';
import data from './data/030054.json';
import {GROUND, Shell, pop, ramp, rng, window_} from './core';

export const ay = makeAyat(data, [
	{from: 1, to: 5, tr: 'Allah yang menciptakan kamu bermula dengan *keadaan lemah*,', scene: 'lemah'},
	{from: 6, to: 11, tr: 'selepas berkeadaan lemah itu Ia menjadikan kamu *kuat*.', scene: 'kuat'},
	{from: 12, to: 18, tr: 'Setelah itu Ia menjadikan kamu *lemah pula* serta *tua beruban*.', scene: 'tua'},
	{from: 19, to: 21, tr: 'Ia menciptakan *apa yang dikehendaki-Nya*,', scene: 'cipta'},
	{from: 22, to: 24, tr: 'dan Dia lah jua yang *Maha Mengetahui*, lagi *Maha Kuasa*.', scene: 'kuasa'},
]);
const S = ay.S;
const Wd = ay.words;
const END = ay.audioEnd;

// ---------- warna ----------
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, k: number) => {
	const x = hex(a);
	const y = hex(b);
	return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(',')})`;
};
const LEAF = ['#ec7a62', '#f59a7e', '#ffb48c', '#ff9f8a', '#e8836f'];
const UBAN = '#f6f1ec';

// ---------- pokok (dijana sekali, deterministik) ----------
const BASE = {x: 540, y: GROUND - 6};
const MAXD = 6;
type Seg = {x0: number; y0: number; x1: number; y1: number; d: number; w: number};
const {SEGS, LEAVES} = (() => {
	const r = rng(3054);
	const segs: Seg[] = [];
	const leaves: {x: number; y: number; r: number; d: number; c: string; fall: boolean; ph: number}[] = [];
	const grow = (x: number, y: number, ang: number, len: number, w: number, d: number) => {
		const x1 = x + Math.cos(ang) * len;
		const y1 = y + Math.sin(ang) * len;
		segs.push({x0: x, y0: y, x1, y1, d, w});
		if (d >= 3) {
			for (const t of [1, 0.55]) {
				leaves.push({
					x: x + (x1 - x) * t + (r() - 0.5) * 26,
					y: y + (y1 - y) * t + (r() - 0.5) * 26,
					r: 15 + r() * 14 - d,
					d,
					c: LEAF[Math.floor(r() * LEAF.length)],
					fall: r() < 0.45,
					ph: r(),
				});
			}
		}
		if (d >= MAXD) return;
		const n = d >= 2 && r() < 0.35 ? 3 : 2;
		for (let i = 0; i < n; i++) {
			const spread = (n === 3 ? [-1, 0, 1][i] : i ? 1 : -1) * (0.32 + r() * 0.22);
			grow(x1, y1, ang + spread + (r() - 0.5) * 0.15, len * (0.7 + r() * 0.1), w * 0.66, d + 1);
		}
	};
	grow(BASE.x, BASE.y, -Math.PI / 2, 215, 34, 0);
	return {SEGS: segs, LEAVES: leaves};
})();

// ---------- bunga (babak cipta) ----------
const FLOWERS = (() => {
	const r = rng(54);
	const cols = ['#ffd1dc', '#ffb48c', '#f6e27a', '#c9a7ff', '#ffffff', '#ff8f8f', '#9fe0d0'];
	return Array.from({length: 26}, (_, i) => {
		let x = 50 + r() * 980;
		if (Math.abs(x - 540) < 110) x += x < 540 ? -120 : 120;
		return {x, y: GROUND - 34 + r() * 50, h: 34 + r() * 46, type: Math.floor(r() * 3), c: cols[Math.floor(r() * cols.length)], t: i / 26, s: 0.8 + r() * 0.5};
	});
})();

const Flower: React.FC<{f: (typeof FLOWERS)[number]; k: number; t: number}> = ({f, k, t}) => {
	if (k <= 0) return null;
	const sway = Math.sin(t * 1.6 + f.x) * 4;
	const head = Math.min(1, k);
	return (
		<g transform={`translate(${f.x} ${f.y}) scale(${f.s})`}>
			<path d={`M0 0 Q ${sway / 2} ${-f.h / 2} ${sway} ${-f.h * Math.min(1, k * 1.4)}`} stroke="#6b8f5e" strokeWidth={3} fill="none" />
			<g transform={`translate(${sway} ${-f.h * Math.min(1, k * 1.4)}) scale(${head})`}>
				{f.type === 0 &&
					Array.from({length: 6}, (_, i) => <ellipse key={i} cx={0} cy={-9} rx={5} ry={10} fill={f.c} transform={`rotate(${i * 60 + t * 10})`} />)}
				{f.type === 1 && <path d="M -10 0 L -11 -14 L -5 -8 L 0 -18 L 5 -8 L 11 -14 L 10 0 Q 0 8 -10 0 Z" fill={f.c} />}
				{f.type === 2 && [0, 1, 2, 3].map((i) => <circle key={i} cx={Math.cos(i * 1.57) * 6} cy={Math.sin(i * 1.57) * 6} r={7} fill={f.c} />)}
				<circle cx={0} cy={0} r={f.type === 1 ? 0 : 4.5} fill={C.goldDeep} />
			</g>
		</g>
	);
};

// ---------- babak ----------
const Stage: React.FC<{t: number; a: number}> = ({t, a}) => {
	const frame = useCurrentFrame();
	// benih & anak pokok
	const seed = ramp(a, -0.4, 0.4);
	const sprout = ramp(a, Wd[2].start, Wd[4].start + 0.6) * (1 - ramp(a, S.kuat + 0.4, S.kuat + 1.6));
	const weakWind = window_(a, Wd[4].start - 0.2, S.kuat + 0.6, 0.6);

	// pertumbuhan pokok
	const g = Math.max(ramp(a, S.kuat, Wd[10].start + 0.9), ramp(a, END + 0.2, END + 1.2));
	const strongHit = Math.max(0, 1 - Math.abs(a - Wd[10].start) / 0.7);
	const strong = Math.max(ramp(a, S.kuat + 1, Wd[10].start + 0.8), ramp(a, END, END + 1)) * (1 - ramp(a, Wd[16].start, Wd[17].end) * 0.25);
	const uban = ramp(a, Wd[16].start, Wd[17].end);
	const fallStart = Wd[16].start + 0.3;

	// cipta & kuasa
	const seedsFall = window_(a, S.cipta - 0.2, S.kuasa + 0.5, 0.6);
	const pollen = Math.max(window_(a, S.kuat + 1.5, Wd[16].start, 1), window_(a, S.cipta, END + 4, 1));
	const kuasaRing = [Wd[22].start, Wd[23].start].map((s) => a - s);

	const G = g * (MAXD + 1);
	const swayTree = Math.sin(t * 0.9) * (0.6 + uban * 0.8);

	return (
		<g>
			<defs>
				<filter id="grain" x="0" y="0" width="100%" height="100%">
					<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 24} />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<radialGradient id="leak">
					<stop offset="0" stopColor="#ffcf9e" stopOpacity="0.55" />
					<stop offset="1" stopColor="#ffcf9e" stopOpacity="0" />
				</radialGradient>
			</defs>

			{/* bunga */}
			{FLOWERS.map((f, i) => (
				<Flower key={i} f={f} t={t} k={Math.max(ramp(a, S.cipta + 0.2 + f.t * 3.6, S.cipta + 0.9 + f.t * 3.6), ramp(a, END + 0.5, END + 1.5))} />
			))}

			{/* benih */}
			{seed > 0 && g < 0.2 && (
				<g opacity={1 - ramp(a, S.kuat, S.kuat + 1)}>
					<circle cx={BASE.x} cy={BASE.y - 6} r={60} fill="url(#glow)" opacity={0.55 * seed} />
					<ellipse cx={BASE.x} cy={BASE.y - 6} rx={13 * seed} ry={9 * seed} fill="#7a4a3a" stroke={C.rim} strokeWidth={2} />
				</g>
			)}
			{/* anak pokok yang lemah, ditiup angin */}
			{sprout > 0 && (
				<g transform={`translate(${BASE.x} ${BASE.y - 8}) rotate(${Math.sin(t * 6) * 9 * weakWind + Math.sin(t * 2) * 3}) scale(2.2)`}>
					<path d={`M0 0 Q 4 ${-40 * sprout} 0 ${-80 * sprout}`} stroke="#8fae78" strokeWidth={5} fill="none" strokeLinecap="round" />
					<ellipse cx={-14 * sprout} cy={-78 * sprout} rx={16 * sprout} ry={7 * sprout} fill="#a8cf8a" transform={`rotate(-25 ${-14 * sprout} ${-78 * sprout})`} />
					<ellipse cx={14 * sprout} cy={-84 * sprout} rx={16 * sprout} ry={7 * sprout} fill="#a8cf8a" transform={`rotate(25 ${14 * sprout} ${-84 * sprout})`} />
				</g>
			)}
			{/* angin */}
			{weakWind > 0 &&
				[0, 1, 2].map((i) => {
					const p = ((a * 0.9 + i / 3) % 1);
					const x = -100 + p * 1300;
					const y = BASE.y - 140 - i * 60;
					return <path key={i} d={`M ${x} ${y} q 60 -18 120 0 t 120 0`} stroke="#fff4ea" strokeWidth={3} fill="none" opacity={weakWind * Math.sin(p * Math.PI) * 0.6} strokeLinecap="round" />;
				})}

			{/* pokok */}
			{g > 0 && (
				<g transform={`rotate(${swayTree} ${BASE.x} ${BASE.y})`}>
					{SEGS.map((s, i) => {
						const k = Math.max(0, Math.min(1, G - s.d));
						if (k <= 0) return null;
						const w = s.w * (0.35 + 0.65 * strong) * (1 + strongHit * 0.12);
						return (
							<line
								key={i}
								x1={s.x0}
								y1={s.y0}
								x2={s.x0 + (s.x1 - s.x0) * k}
								y2={s.y0 + (s.y1 - s.y0) * k}
								stroke={mix('#3a1a35', '#6d5560', uban * 0.6)}
								strokeWidth={Math.max(1.5, w)}
								strokeLinecap="round"
							/>
						);
					})}
					{LEAVES.map((l, i) => {
						const k = pop(G, l.d + 1);
						if (k <= 0) return null;
						const ft = a - (fallStart + l.ph * 3.2);
						const falling = l.fall && ft > 0 && a < END + 0.2;
						const fy = falling ? ft * 140 + ft * ft * 30 : 0;
						const fx = falling ? Math.sin(ft * 3 + l.ph * 6) * 30 : 0;
						const op = falling ? Math.max(0, 1 - ft / 3.5) : 1;
						if (op <= 0) return null;
						const ub = Math.min(1, uban * 1.3 - l.ph * 0.3);
						return (
							<circle
								key={i}
								cx={l.x + fx}
								cy={Math.min(l.y + fy, BASE.y + 10)}
								r={l.r * Math.min(1.12, k) * (1 + strongHit * 0.15)}
								fill={mix(l.c, UBAN, Math.max(0, ub))}
								opacity={0.92 * op}
							/>
						);
					})}
				</g>
			)}
			{/* denyut "قُوَّةً" */}
			{strongHit > 0 && (
				<circle cx={BASE.x} cy={BASE.y - 330} r={160 + (1 - strongHit) * 360} stroke={C.gold} strokeWidth={5} fill="none" opacity={strongHit} />
			)}

			{/* benih jatuh (cipta) */}
			{seedsFall > 0 &&
				Array.from({length: 14}, (_, i) => {
					const r = rng(i * 17 + 2);
					const x0 = 360 + r() * 360;
					const p = ((a - S.cipta) * 0.45 + r()) % 1;
					return <circle key={i} cx={x0 + (r() - 0.5) * 600 * p} cy={520 + p * 620} r={4} fill="#ffe2b0" opacity={seedsFall * Math.sin(p * Math.PI)} />;
				})}

			{/* debunga bercahaya */}
			{pollen > 0 &&
				Array.from({length: 40}, (_, i) => {
					const r = rng(i * 29 + 7);
					const x = r() * W + Math.sin(t * 0.6 + i) * 25;
					const y = ((1200 - ((a * (18 + r() * 30) + r() * 900) % 900)));
					return (
						<g key={i} opacity={pollen * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * 3 + i)))}>
							<circle cx={x} cy={y} r={2.5} fill="#fff1dc" />
							<circle cx={x} cy={y} r={10} fill="url(#glow)" opacity={0.4} />
						</g>
					);
				})}

			{/* cincin "ٱلْعَلِيمُ" & "ٱلْقَدِيرُ" */}
			{kuasaRing.map((r, i) =>
				r > 0 && r < 1.8 ? <circle key={i} cx={540} cy={GROUND - 120} r={150 + r * 420} stroke="#fff4e8" strokeWidth={4} fill="none" opacity={(1 - r / 1.8) * 0.8} /> : null,
			)}

			{/* kesan: cahaya hangat bergerak + butiran filem */}
			<ellipse cx={300 + Math.sin(t * 0.25) * 420} cy={500 + Math.cos(t * 0.2) * 220} rx={520} ry={380} fill="url(#leak)" style={{mixBlendMode: 'screen'}} opacity={0.5} />
			<rect width={W} height={H} filter="url(#grain)" opacity={0.07} style={{mixBlendMode: 'overlay'}} />
		</g>
	);
};

export const AyatKitaranHidup: React.FC = () => (
	<Shell
		ay={ay}
		title="Kitaran *Kehidupan*"
		sub="pesanan Allah yang kekal dalam Al-Quran"
		bright={(a) => Math.max(ramp(a, S.kuasa + 0.2, S.kuasa + 1.6), window_(a, Wd[10].start - 0.2, S.tua, 1) * 0.35) * (1 - ramp(a, END + 2, END + 3.2) * 0.5)}
		stage={(t, a) => <Stage t={t} a={a} />}
		titleTop={262}
	/>
);
