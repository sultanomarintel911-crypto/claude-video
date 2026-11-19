import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/amiri-quran';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/cormorant-garamond/500-italic.css';
import '@fontsource/nunito/600.css';
import '@fontsource/nunito/800.css';
import {Ayat, C, FPS, H, HANDLE, INTRO, W} from './data';

export const GROUND = 1186;

// ---------- pembantu ----------
export const ease = Easing.bezier(0.33, 0, 0.2, 1);
/** 0→1 antara x0 dan x1, dengan easing. */
export const ramp = (x: number, x0: number, x1: number) =>
	interpolate(x, [x0, x1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
/** Muncul di s, hilang di e (pudar `d` saat). */
export const window_ = (x: number, s: number, e: number, d = 0.4) => Math.min(ramp(x, s - d / 2, s + d / 2), 1 - ramp(x, e - d / 2, e + d / 2));
export const pop = (x: number, s: number) => {
	const k = ramp(x, s, s + 0.45);
	return k + Math.sin(k * Math.PI) * 0.12;
};
export const rng = (seed: number) => () => {
	seed |= 0;
	seed = (seed + 0x6d2b79f5) | 0;
	let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
	t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
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

/** `bright` 0→1: matahari naik + sinar (babak rahmat/petunjuk). */
export const Sky: React.FC<{t: number; bright: number}> = ({t, bright: rahmat}) => {
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
export const Woman: React.FC<{x: number; s: number; drape: number; op?: number; t: number; shimmer?: number}> = ({x, s, drape, op = 1, t, shimmer = 0}) => {
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

export const Lantern: React.FC<{x: number; len: number; k: number; t: number}> = ({x, len, k, t}) => {
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

export const Texts: React.FC<{a: number; ay: Ayat}> = ({a, ay}) => (
	<>
		{ay.groups.map((g, gi) => {
			const s = ay.start(gi);
			const e = ay.end(gi);
			const vis = window_(a, s + 0.05, e - 0.05, 0.3);
			if (vis <= 0) return null;
			const ws = ay.words.slice(g.from - 1, g.to);
			const lastEnd = ws[ws.length - 1].end;
			const tr = parseTr(g.tr);
			const prog = interpolate(a, [s, lastEnd - 0.2], [0, tr.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
			const ar = ws.reduce((n, w) => n + w.ar.length, 0);
			const arSize = ar > 44 ? 74 : ar > 34 ? 82 : 98;
			const trSize = g.tr.length > 95 ? 39 : 44;
			return (
				<div key={gi} style={{position: 'absolute', left: 60, right: 60, top: 1262, opacity: vis, textAlign: 'center'}}>
					<div style={{direction: 'rtl', fontFamily: 'Amiri Quran', fontSize: arSize, lineHeight: 1.65, color: C.text}}>
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
					<div style={{fontFamily: 'Nunito', fontWeight: 600, fontSize: trSize, lineHeight: 1.42, color: C.text, marginTop: 6, padding: '0 20px'}}>
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

/** Tajuk: `utama` boleh ada *perkataan* untuk warna sorotan. */
export const Title: React.FC<{op: number; utama: string; sub: string}> = ({op, utama, sub}) =>
	op <= 0 ? null : (
		<div style={{position: 'absolute', top: 420, left: 0, right: 0, textAlign: 'center', opacity: op, transform: `translateY(${(1 - op) * 16}px)`}}>
			<div style={{fontFamily: 'Montserrat', fontWeight: 700, fontSize: 62, color: C.text, letterSpacing: 1}}>
				{parseTr(utama).map((w, i) => (
					<span key={i} style={{color: w.gold ? C.gold : C.text}}>
						{w.w}{' '}
					</span>
				))}
			</div>
			<div style={{fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontWeight: 500, fontSize: 44, color: C.gold, marginTop: 6}}>{sub}</div>
		</div>
	);

/** Rangka video: langit, babak, teks, tajuk, rujukan, nama akaun, audio. */
export const Shell: React.FC<{
	ay: Ayat;
	title: string;
	sub: string;
	bright: (a: number) => number;
	stage: (t: number, a: number) => React.ReactNode;
}> = ({ay, title, sub, bright, stage}) => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const a = t - INTRO;
	const END = ay.audioEnd;
	const titleOp = Math.max(1 - ramp(a, -0.5, 0.2), ramp(a, END + 1, END + 2));
	const refOp = ramp(a, -0.3, 0.4) * (1 - ramp(a, END + 0.6, END + 1.2));
	return (
		<AbsoluteFill style={{backgroundColor: C.bottom}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
				<Sky t={t} bright={bright(a)} />
				{stage(t, a)}
				<rect x={0} y={GROUND + 20} width={W} height={H - GROUND} fill="url(#fadeDown)" />
				<defs>
					<linearGradient id="fadeDown" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={C.bottom} stopOpacity="0" />
						<stop offset="0.4" stopColor={C.bottom} stopOpacity="0.55" />
						<stop offset="1" stopColor={C.bottom} stopOpacity="0.85" />
					</linearGradient>
				</defs>
			</svg>
			<Title op={titleOp} utama={title} sub={sub} />
			<Texts a={a} ay={ay} />
			<div style={{position: 'absolute', top: 1800, left: 0, right: 0, textAlign: 'center', fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: 36, color: C.dim, opacity: refOp}}>
				{ay.rujukan}
			</div>
			<div style={{position: 'absolute', top: 1500, left: 0, right: 0, textAlign: 'center', fontFamily: 'Cormorant Garamond', fontStyle: 'italic', fontSize: 46, color: C.gold, opacity: titleOp * ramp(a, END, END + 1)}}>
				{ay.rujukan}
			</div>
			{HANDLE && (
				<div style={{position: 'absolute', top: 196, left: 0, right: 0, textAlign: 'center', fontFamily: 'Montserrat', fontWeight: 700, fontSize: 28, letterSpacing: 5, color: C.text, opacity: 0.72, textShadow: '0 2px 12px rgba(0,0,0,0.35)'}}>
					{HANDLE.toUpperCase()}
				</div>
			)}
			<Sequence from={Math.round(INTRO * FPS)}>
				<Audio src={staticFile(ay.audioFile)} />
			</Sequence>
		</AbsoluteFill>
	);
};
