import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/amiri-quran';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/800.css';
import {AUDIO_END, AUDIO_FILE, C, HANDLE, FPS, GROUPS, H, INTRO, RUJUKAN, W, WORDS, groupEnd, groupStart} from './data';

// ---------- pembantu ----------
const ease = Easing.bezier(0.33, 0, 0.2, 1);
/** 0→1 antara x0 dan x1, dengan easing. */
const ramp = (x: number, x0: number, x1: number) =>
	interpolate(x, [x0, x1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
/** Muncul di s, hilang di e (pudar `d` saat). */
const window_ = (x: number, s: number, e: number, d = 0.4) => Math.min(ramp(x, s - d / 2, s + d / 2), 1 - ramp(x, e - d / 2, e + d / 2));
const pop = (x: number, s: number) => {
	const k = ramp(x, s, s + 0.45);
	return k + Math.sin(k * Math.PI) * 0.12;
};
const rng = (seed: number) => () => {
	seed |= 0;
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const GROUND = 1186;
const G = (k: string) => GROUPS.find((g) => g.scene === k)!;
const S = {
	wahyu: groupStart(G('wahyu')),
	wanita: groupStart(G('wanita')),
	labuh: groupStart(G('labuh')),
	dikenali: groupStart(G('dikenali')),
	dilindungi: groupStart(G('dilindungi')),
	rahmat: groupStart(G('rahmat')),
};

// ---------- langit ----------
const SPARKS = (() => {
	const r = rng(59);
	return Array.from({length: 34}, () => ({x: r() * W, y: 60 + Math.pow(r(), 1.6) * 560, s: 1 + r() * 2.2, ph: r() * 6.28, sp: 0.6 + r() * 1.6}));
})();
const CLOUDS = [
	{y: 430, w: 420, x0: 120, sp: 9},
	{y: 560, w: 300, x0: 760, sp: -7},
	{y: 700, w: 520, x0: 520, sp: 6},
	{y: 820, w: 260, x0: 60, sp: -10},
	{y: 930, w: 380, x0: 880, sp: 8},
];

const Sky: React.FC<{t: number; a: number}> = ({t, a}) => {
	const rahmat = ramp(a, S.rahmat, S.rahmat + 1.6) * (1 - ramp(a, AUDIO_END + 1.5, AUDIO_END + 3));
	const sunY = GROUND - 120 - rahmat * 90;
	return (
		<>
			<defs>
				<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={C.skyTop} />
					<stop offset="0.3" stopColor={C.skyMid} />
					<stop offset="0.5" stopColor={C.skyLow} />
					<stop offset="0.6" stopColor={C.horizon} />
					<stop offset="1" stopColor={C.hillNear} />
				</linearGradient>
				<radialGradient id="glow">
					<stop offset="0" stopColor={C.gold} stopOpacity="0.9" />
					<stop offset="1" stopColor={C.gold} stopOpacity="0" />
				</radialGradient>
				<radialGradient id="sunGlow">
					<stop offset="0" stopColor={C.sun} stopOpacity="0.95" />
					<stop offset="0.35" stopColor={C.horizon} stopOpacity="0.55" />
					<stop offset="1" stopColor={C.horizon} stopOpacity="0" />
				</radialGradient>
				<radialGradient id="soft">
					<stop offset="0" stopColor="#fff4e8" stopOpacity="0.7" />
					<stop offset="1" stopColor="#fff4e8" stopOpacity="0" />
				</radialGradient>
				<filter id="blur8">
					<feGaussianBlur stdDeviation="8" />
				</filter>
				<filter id="blur3">
					<feGaussianBlur stdDeviation="3" />
				</filter>
				<filter id="blur14">
					<feGaussianBlur stdDeviation="14" />
				</filter>
			</defs>
			<rect width={W} height={H} fill="url(#sky)" />
			{SPARKS.map((s, i) => {
				const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
				return <circle key={i} cx={s.x} cy={s.y} r={s.s * 0.7} fill="#fff4ea" opacity={tw * 0.7} />;
			})}
			{/* matahari terbit di ufuk */}
			<circle cx={540} cy={sunY} r={520 + rahmat * 80} fill="url(#sunGlow)" opacity={0.75 + rahmat * 0.25} />
			{rahmat > 0 &&
				Array.from({length: 14}, (_, i) => {
					const ang = (i / 14) * Math.PI * 2 + t * 0.08;
					return (
						<path
							key={i}
							d={`M 540 ${sunY} L ${540 + Math.cos(ang - 0.06) * 1400} ${sunY + Math.sin(ang - 0.06) * 1400} L ${540 + Math.cos(ang + 0.06) * 1400} ${sunY + Math.sin(ang + 0.06) * 1400} Z`}
							fill="#fff0dc"
							opacity={0.09 * rahmat}
						/>
					);
				})}
			<circle cx={540} cy={sunY} r={150} fill={C.sun} />
			{/* awan */}
			{CLOUDS.map((c, i) => {
				const x = ((c.x0 + t * c.sp) % (W + c.w * 2) + W + c.w * 2) % (W + c.w * 2) - c.w;
				return (
					<g key={i} opacity={0.5} filter="url(#blur3)">
						<rect x={x - c.w / 2} y={c.y} width={c.w} height={30} rx={15} fill="#f7b49a" />
						<rect x={x - c.w / 4} y={c.y - 16} width={c.w * 0.45} height={30} rx={15} fill="#f7b49a" />
					</g>
				);
			})}
			{/* bukit berlapis */}
			<path d={`M0 ${GROUND - 120} C 200 ${GROUND - 190}, 420 ${GROUND - 120}, 620 ${GROUND - 160} S 940 ${GROUND - 200}, 1080 ${GROUND - 140} L1080 ${H} L0 ${H}Z`} fill={C.hillFar} />
			<path d={`M0 ${GROUND - 60} C 220 ${GROUND - 120}, 470 ${GROUND - 50}, 700 ${GROUND - 95} S 980 ${GROUND - 110}, 1080 ${GROUND - 70} L1080 ${H} L0 ${H}Z`} fill={C.hillMid} />
			<path d={`M0 ${GROUND + 10} C 300 ${GROUND - 30}, 720 ${GROUND + 6}, 1080 ${GROUND - 18} L1080 ${H} L0 ${H}Z`} fill={C.hillNear} />
		</>
	);
};

// ---------- watak wanita (tanpa wajah) ----------
const Woman: React.FC<{x: number; s: number; drape: number; op?: number; t: number; shimmer?: number}> = ({x, s, drape, op = 1, t, shimmer = 0}) => {
	const hem = -232 + drape * 172; // tudung pendek (dada) → labuh (betis)
	const wR = 50 + (hem + 232) * 0.32;
	const wob = Math.sin(t * 1.7 + x) * 7 * drape;
	const drapePath = `M -37 -300 C -40 -354 40 -354 37 -300 C 42 -270 58 -250 ${wR} ${hem} Q ${wob} ${hem + 24} ${-wR} ${hem} C -58 -250 -42 -270 -37 -300 Z`;
	return (
		<g transform={`translate(${x} ${GROUND}) scale(${s})`} opacity={op}>
			<ellipse cx={0} cy={2} rx={95} ry={10} fill="#000" opacity={0.25} />
			<path d="M -44 -250 C -58 -150 -76 -60 -86 0 L 86 0 C 76 -60 58 -150 44 -250 Z" fill={C.cream} stroke={C.rim} strokeWidth={2.5} strokeOpacity={0.55} />
			<ellipse cx={-26} cy={-2} rx={16} ry={6} fill={C.jilbab} />
			<ellipse cx={26} cy={-2} rx={16} ry={6} fill={C.jilbab} />
			<path d={drapePath} fill={C.jilbab} stroke={C.rim} strokeWidth={3} strokeOpacity={0.7} />
			{shimmer > 0 && (
				<path
					d={`M ${wR} ${hem} Q ${wob} ${hem + 24} ${-wR} ${hem}`}
					stroke={C.gold}
					strokeWidth={5}
					fill="none"
					opacity={shimmer}
					strokeLinecap="round"
				/>
			)}
			<ellipse cx={0} cy={-298} rx={21} ry={27} fill={C.creamLight} />
		</g>
	);
};

const Lantern: React.FC<{x: number; len: number; k: number; t: number}> = ({x, len, k, t}) => {
	if (k <= 0) return null;
	const sw = Math.sin(t * 1.3 + x) * 3;
	return (
		<g transform={`translate(${x} 0) rotate(${sw} 0 0)`} opacity={Math.min(1, k)}>
			<line x1={0} y1={0} x2={0} y2={len * Math.min(1, k)} stroke={C.gold} strokeWidth={2} opacity={0.6} />
			<g transform={`translate(0 ${len * Math.min(1, k)}) scale(${k})`}>
				<circle cx={0} cy={40} r={90} fill="url(#glow)" opacity={0.45} />
				<path d="M -14 0 L 14 0 L 22 14 L -22 14 Z" fill={C.goldDeep} />
				<path d="M -26 16 L 26 16 L 20 66 L -20 66 Z" fill={C.gold} opacity={0.95} />
				<path d="M -10 22 L 10 22 L 8 60 L -8 60 Z" fill={C.creamLight} />
				<path d="M -22 68 L 22 68 L 0 88 Z" fill={C.goldDeep} />
			</g>
		</g>
	);
};

// ---------- babak ----------
const Stage: React.FC<{t: number; a: number}> = ({t, a}) => {
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

// ---------- teks ----------
const parseTr = (s: string) => {
	const out: {w: string; gold: boolean}[] = [];
	let gold = false;
	for (const raw of s.split(' ')) {
		let w = raw;
		const open = w.startsWith('*');
		if (open) {
			gold = true;
			w = w.slice(1);
		}
		const close = w.includes('*');
		w = w.replace('*', '');
		out.push({w, gold});
		if (close) gold = false;
	}
	return out;
};

const Texts: React.FC<{a: number}> = ({a}) => (
	<>
		{GROUPS.map((g, gi) => {
			const s = groupStart(g);
			const e = groupEnd(gi);
			const vis = window_(a, s + 0.05, e - 0.05, 0.3);
			if (vis <= 0) return null;
			const ws = WORDS.slice(g.from - 1, g.to);
			const lastEnd = ws[ws.length - 1].end;
			const tr = parseTr(g.tr);
			const prog = interpolate(a, [s, lastEnd - 0.2], [0, tr.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
			const ar = ws.reduce((n, w) => n + w.ar.length, 0);
			const arSize = ar > 40 ? 84 : 98;
			return (
				<div key={gi} style={{position: 'absolute', left: 60, right: 60, top: 1262, opacity: vis, textAlign: 'center'}}>
					<div style={{direction: 'rtl', fontFamily: 'Amiri Quran', fontSize: arSize, lineHeight: 1.75, color: C.text}}>
						{ws.map((w, i) => {
							const said = a >= w.start - 0.05;
							const now = a >= w.start - 0.05 && a < w.end;
							return (
								<span
									key={i}
									style={{
										opacity: said ? 1 : 0.22,
										color: now ? C.gold : C.text,
										textShadow: now ? `0 0 28px ${C.goldDeep}` : 'none',
										transition: 'none',
									}}
								>
									{w.ar}
									{i < ws.length - 1 ? ' ' : ''}
								</span>
							);
						})}
					</div>
					<div style={{fontFamily: 'Nunito', fontWeight: 600, fontSize: 44, lineHeight: 1.45, color: C.text, marginTop: 6, padding: '0 20px'}}>
						{tr.map((w, i) => {
							const k = Math.max(0, Math.min(1, prog - i));
							return (
								<span key={i} style={{opacity: k, display: 'inline-block', transform: `translateY(${(1 - k) * 12}px)`, color: w.gold ? C.gold : C.text, fontWeight: w.gold ? 800 : 600, marginRight: 11}}>
									{w.w}
								</span>
							);
						})}
					</div>
				</div>
			);
		})}
	</>
);

const Title: React.FC<{op: number}> = ({op}) =>
	op <= 0 ? null : (
		<div style={{position: 'absolute', top: 420, left: 0, right: 0, textAlign: 'center', opacity: op, transform: `translateY(${(1 - op) * 16}px)`}}>
			<div style={{fontFamily: 'Montserrat', fontWeight: 700, fontSize: 62, color: C.text, letterSpacing: 1}}>
				Labuhkan <span style={{color: C.gold}}>Tudungmu</span>
			</div>
			<div style={{fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontWeight: 500, fontSize: 44, color: C.gold, marginTop: 6}}>
				pesanan Allah yang kekal dalam Al-Quran
			</div>
		</div>
	);

export const Video: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const a = t - INTRO;
	const titleOp = Math.max(1 - ramp(a, -0.5, 0.2), ramp(a, AUDIO_END + 1, AUDIO_END + 2));
	const refOp = ramp(a, -0.3, 0.4) * (1 - ramp(a, AUDIO_END + 0.6, AUDIO_END + 1.2));
	return (
		<AbsoluteFill style={{backgroundColor: C.bottom}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
				<Sky t={t} a={a} />
				<Stage t={t} a={a} />
				<rect x={0} y={GROUND + 20} width={W} height={H - GROUND} fill="url(#fadeDown)" />
				<defs>
					<linearGradient id="fadeDown" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={C.bottom} stopOpacity="0" />
						<stop offset="0.4" stopColor={C.bottom} stopOpacity="0.55" />
						<stop offset="1" stopColor={C.bottom} stopOpacity="0.85" />
					</linearGradient>
				</defs>
			</svg>
			<Title op={titleOp} />
			<Texts a={a} />
			<div style={{position: 'absolute', top: 1760, left: 0, right: 0, textAlign: 'center', fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: 36, color: C.dim, opacity: refOp}}>
				{RUJUKAN}
			</div>
			<div style={{position: 'absolute', top: 1500, left: 0, right: 0, textAlign: 'center', fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: 46, color: C.gold, opacity: titleOp * ramp(a, AUDIO_END, AUDIO_END + 1)}}>
				{RUJUKAN}
			</div>
			{HANDLE && (
				<div style={{position: 'absolute', top: 196, left: 0, right: 0, textAlign: 'center', fontFamily: 'Montserrat', fontWeight: 700, fontSize: 28, letterSpacing: 5, color: C.text, opacity: 0.72, textShadow: '0 2px 12px rgba(0,0,0,0.35)'}}>
					{HANDLE.toUpperCase()}
				</div>
			)}
			<Sequence from={Math.round(INTRO * FPS)}>
				<Audio src={staticFile(AUDIO_FILE)} />
			</Sequence>
		</AbsoluteFill>
	);
};
