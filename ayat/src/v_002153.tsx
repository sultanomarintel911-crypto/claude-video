/**
 * Al-Baqarah 2:153 — Sabar & solat. Qari: Abdul Basit Abdul Samad (murattal).
 * Gaya "Kristal" (berbeza 100% daripada tema Subuh): adegan 3D Three.js, palet ais/cyan,
 * kad kaca untuk teks, fon Scheherazade New / Space Grotesk / DM Sans.
 * Simbolik: kristal = hati orang beriman; batu & hujan = ujian; cincin = sabar;
 * lima tiang = solat; pancaran dari atas = pertolongan Allah (Allah tidak digambarkan).
 */
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import '@fontsource/scheherazade-new/400.css';
import '@fontsource/scheherazade-new/700.css';
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/700.css';
import {FPS, H, HANDLE, INTRO, W, makeAyat} from './data';
import data from './data/002153.json';
import {parseTr, pop, ramp, rng, window_} from './core';

export const ay = makeAyat(data, [
	{from: 1, to: 3, tr: 'Wahai sekalian *orang-orang yang beriman*!', scene: 'seru'},
	{from: 4, to: 5, tr: 'Mintalah pertolongan dengan *bersabar*', scene: 'sabar'},
	{from: 6, to: 6, tr: 'dan dengan (mengerjakan) *sembahyang*;', scene: 'solat'},
	{from: 7, to: 10, tr: 'kerana sesungguhnya *Allah menyertai* (menolong) *orang-orang yang sabar*.', scene: 'bersama'},
]);
const S = ay.S;
const Wd = ay.words;
const END = ay.audioEnd;

const K = {
	bg: '#04070d',
	ice: '#7fe9ff',
	cyan: '#2cc9e8',
	deep: '#0b2a3a',
	white: '#eefcff',
	text: '#e9f6fb',
	dim: 'rgba(233,246,251,0.5)',
	rock: '#273240',
};

// ---------- 3D ----------
const CRY_Y = 1.7;

const Rig: React.FC<{a: number}> = ({a}) => {
	const {camera} = useThree();
	const toSeru = ramp(a, S.seru - 0.5, S.sabar);
	const toSolat = ramp(a, S.solat - 0.3, S.solat + 2.5);
	const toBersama = ramp(a, S.bersama - 0.2, END + 0.5);
	const toFig = ramp(a, S.sabar - 0.2, S.sabar + 2.2);
	const R = 19 - 5 * toSeru - 4.6 * toFig - 0.4 * toSolat + 2.4 * toBersama;
	const Y = 3 + 1.1 * toFig + 1.3 * toSolat + 2.6 * toBersama;
	const th = -0.25 + a * 0.02 + 0.5 * toSolat;
	const storm = window_(a, S.sabar + 0.2, S.solat + 0.8, 0.8);
	const shake = storm * 0.06;
	camera.position.set(Math.sin(th) * R + Math.sin(a * 23) * shake, Y + Math.sin(a * 31) * shake, Math.cos(th) * R);
	camera.lookAt(0, 0.75 + 0.15 * toFig + 0.3 * toBersama, 0);
	return null;
};

/** 0→1: kristal naik ke atas apabila orang beriman muncul (babak sabar). */
/** Ketinggian kristal (hati): turun ke sejadah semasa solat, naik semula dalam cahaya pertolongan. */
const heartY = (a: number) => CRY_Y - ramp(a, S.solat + 0.2, S.solat + 2.2) * 0.85 + ramp(a, S.bersama + 0.4, S.bersama + 2.6) * 0.45;

const Crystal: React.FC<{a: number; t: number}> = ({a, t}) => {
	const born = pop(a, S.seru + 0.2);
	const intro = 1 - ramp(a, -0.8, S.seru + 0.2);
	const s = Math.max(born, intro, ramp(a, END, END + 0.5));
	const glow = 0.25 + ramp(a, S.bersama, S.bersama + 2) * 1.4 + Math.max(0, 1 - Math.abs(a - Wd[9].start) / 0.8) * 0.8;
	const hitJ = window_(a, S.sabar + 0.2, Wd[4].start, 0.3) * 0.05;
	return (
		<group position={[Math.sin(t * 40) * hitJ, heartY(a) + Math.sin(t * 1.4) * 0.1, 0]} rotation={[0.3, t * 0.5, 0.15]} scale={0.95 * (1 - 0.18 * ramp(a, S.solat + 0.2, S.solat + 2.2)) * Math.max(0.001, s)}>
			<mesh>
				<icosahedronGeometry args={[1, 0]} />
				<meshStandardMaterial color={K.ice} emissive={K.cyan} emissiveIntensity={glow} metalness={0.2} roughness={0.12} flatShading transparent opacity={0.92} />
			</mesh>
			<mesh scale={1.012}>
				<icosahedronGeometry args={[1, 0]} />
				<meshBasicMaterial color={K.white} wireframe transparent opacity={0.55} />
			</mesh>
			<pointLight color={K.ice} intensity={6 + glow * 10} distance={9} />
		</group>
	);
};

// ---------- sejadah & mihrab (lambang solat) ----------
/** Arah kamera ≈ 1.13 rad (π/2 − th); mihrab di belakang kristal, menghadap kamera. */
const CAM_PHI = 1.13;
const FACE_Y = Math.PI / 2 - CAM_PHI;
const MIHRAB_POS: [number, number, number] = [-Math.cos(CAM_PHI) * 2.3, 0, -Math.sin(CAM_PHI) * 2.3];

const archShape = (w: number, h: number, spring: number) => {
	const sh = new THREE.Shape();
	sh.moveTo(-w / 2, 0);
	sh.lineTo(-w / 2, spring);
	sh.quadraticCurveTo(-w / 2, h - (h - spring) * 0.25, 0, h);
	sh.quadraticCurveTo(w / 2, h - (h - spring) * 0.25, w / 2, spring);
	sh.lineTo(w / 2, 0);
	sh.lineTo(-w / 2, 0);
	return sh;
};
const MIHRAB_GEO = (() => {
	const outer = archShape(2.1, 3.2, 1.9);
	const inner = archShape(1.45, 2.65, 1.55);
	outer.holes.push(new THREE.Path(inner.getPoints(40).map((p) => new THREE.Vector2(p.x, p.y + 0.001))));
	return new THREE.ExtrudeGeometry(outer, {depth: 0.32, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2, curveSegments: 40});
})();
const NICHE_GEO = new THREE.ShapeGeometry(archShape(1.45, 2.65, 1.55), 40);

const Mihrab: React.FC<{a: number}> = ({a}) => {
	const k = ramp(a, S.solat - 0.1, S.solat + 1.6);
	if (k <= 0) return null;
	const glow = 0.3 + ramp(a, S.bersama + 0.2, S.bersama + 2) * 1.2;
	return (
		<group position={[MIHRAB_POS[0], -3.4 * (1 - k), MIHRAB_POS[2]]} rotation={[0, FACE_Y, 0]}>
			<mesh geometry={NICHE_GEO} position={[0, 0, 0.02]}>
				<meshBasicMaterial color={K.ice} transparent opacity={0.18 + 0.25 * glow} side={THREE.DoubleSide} />
			</mesh>
			<mesh geometry={MIHRAB_GEO}>
				<meshStandardMaterial color="#0f3445" emissive={K.cyan} emissiveIntensity={glow * 0.6} metalness={0.4} roughness={0.3} />
			</mesh>
			<pointLight position={[0, 1.6, 0.8]} color={K.ice} intensity={3 + glow * 6} distance={6} />
		</group>
	);
};

const Sejadah: React.FC<{a: number}> = ({a}) => {
	const k = ramp(a, S.solat, S.solat + 1.2);
	if (k <= 0) return null;
	const L = 2.1 * k;
	// terbentang dari hujung mihrab ke arah kamera
	return (
		<group rotation={[0, FACE_Y, 0]}>
			<mesh position={[0, 0.008, -1.0 + L / 2]}>
				<boxGeometry args={[1.0, 0.014, L]} />
				<meshStandardMaterial color={K.cyan} emissive={K.cyan} emissiveIntensity={0.7} />
			</mesh>
			<mesh position={[0, 0.018, -1.0 + L / 2]}>
				<boxGeometry args={[0.9, 0.014, Math.max(0.001, L - 0.1)]} />
				<meshStandardMaterial color="#0d3a4a" emissive="#0a5566" emissiveIntensity={0.35} roughness={0.8} />
			</mesh>
		</group>
	);
};

const Shield: React.FC<{a: number; t: number}> = ({a, t}) => {
	const k = ramp(a, S.sabar + 0.3, Wd[4].start + 0.4) * (1 - ramp(a, S.solat, S.solat + 1.2) * 0.8);
	const flash = Math.max(0, 1 - Math.abs(a - Wd[4].start) / 0.5);
	if (k <= 0.001) return null;
	return (
		<group position={[0, heartY(a), 0]}>
			{[0, 1, 2].map((i) => (
				<mesh key={i} rotation={[Math.PI / 2 + i * 0.9 + t * 0.6 * (i % 2 ? -1 : 1), i * 0.7 + t * 0.4, 0]} scale={k * (1 + flash * 0.15)}>
					<torusGeometry args={[1.75 + i * 0.12, 0.022 + flash * 0.02, 12, 140]} />
					<meshBasicMaterial color={i === 1 ? K.white : K.cyan} transparent opacity={0.85} />
				</mesh>
			))}
		</group>
	);
};

const ROCKS = (() => {
	const r = rng(153);
	return Array.from({length: 14}, (_, i) => ({t0: S.sabar + 0.1 + i * 0.27, ang: r() * Math.PI * 2, y: 0.6 + r() * 2.6, s: 0.18 + r() * 0.22, spin: r() * 6}));
})();

const Rocks: React.FC<{a: number}> = ({a}) => (
	<>
		{ROCKS.map((k, i) => {
			const p = (a - k.t0) / 1.0;
			if (p < 0 || p > 2.2) return null;
			const r = p < 1 ? 9 - 7.1 * p : 1.9 + (p - 1) * 5;
			const fade = p < 1 ? Math.min(1, p * 4) : Math.max(0, 1 - (p - 1) / 1.2);
			const ang = k.ang + (p > 1 ? 0.6 : 0);
			return (
				<mesh key={i} position={[Math.cos(ang) * r, k.y + (p > 1 ? (p - 1) * 1.2 : 0), Math.sin(ang) * r]} rotation={[k.spin + a * 2, k.spin + a * 3, 0]} scale={k.s}>
					<dodecahedronGeometry args={[1, 0]} />
					<meshStandardMaterial color={K.rock} roughness={0.9} flatShading transparent opacity={fade} />
				</mesh>
			);
		})}
	</>
);

const RAIN = (() => {
	const r = rng(7);
	return Array.from({length: 160}, () => ({x: (r() - 0.5) * 18, z: (r() - 0.5) * 18, o: r() * 12, sp: 11 + r() * 6}));
})();

const Rain: React.FC<{a: number}> = ({a}) => {
	const k = window_(a, S.sabar, S.bersama + 0.4, 1);
	if (k <= 0) return null;
	return (
		<>
			{RAIN.map((d, i) => {
				const y = 11 - ((a * d.sp + d.o) % 12);
				return (
					<mesh key={i} position={[d.x + y * 0.12, y, d.z]} rotation={[0, 0, 0.12]}>
						<boxGeometry args={[0.012, 0.55, 0.012]} />
						<meshBasicMaterial color="#9fdcff" transparent opacity={0.45 * k} />
					</mesh>
				);
			})}
		</>
	);
};

const Pillars: React.FC<{a: number}> = ({a}) => (
	<>
		{Array.from({length: 5}, (_, i) => {
			const h = ramp(a, S.solat + 0.1 + i * 0.32, S.solat + 0.9 + i * 0.32) * 2.8;
			if (h <= 0.01) return null;
			// kamera berada pada sudut 0.92–1.35 rad (π/2 − th) semasa tiang kelihatan: letak di antara dua tiang
			const ang = (i / 5) * Math.PI * 2 + 1.13 + Math.PI / 10; // 18° dari arah kamera: tiada tiang di depan kristal atau di dalam mihrab
			const x = Math.cos(ang) * 5;
			const z = Math.sin(ang) * 5;
			return (
				<group key={i} position={[x, 0, z]}>
					<mesh position={[0, h / 2, 0]}>
						<boxGeometry args={[0.34, h, 0.34]} />
						<meshStandardMaterial color="#123848" emissive={K.cyan} emissiveIntensity={0.35} metalness={0.4} roughness={0.3} />
					</mesh>
					<mesh position={[0, h + 0.22, 0]}>
						<octahedronGeometry args={[0.2, 0]} />
						<meshBasicMaterial color={K.white} />
					</mesh>
					<pointLight position={[0, h + 0.3, 0]} color={K.ice} intensity={2} distance={3} />
				</group>
			);
		})}
	</>
);

const Heaven: React.FC<{a: number}> = ({a}) => {
	const k = Math.max(ramp(a, S.bersama + 0.2, S.bersama + 2), 0) * (1 - ramp(a, END + 2.2, END + 3.4) * 0.5);
	if (k <= 0) return null;
	return (
		<>
			<mesh position={[0, 7, 0]}>
				<cylinderGeometry args={[0.5, 3.2, 12, 48, 1, true]} />
				<meshBasicMaterial color={K.white} transparent opacity={0.11 * k} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
			</mesh>
			<mesh position={[0, 7, 0]}>
				<cylinderGeometry args={[0.2, 1.4, 12, 48, 1, true]} />
				<meshBasicMaterial color={K.ice} transparent opacity={0.16 * k} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
			</mesh>
			<spotLight position={[0, 12, 0]} angle={0.4} penumbra={0.8} intensity={60 * k} color={K.white} distance={30} />
		</>
	);
};

const Ripples: React.FC<{a: number}> = ({a}) => (
	<>
		{[Wd[6].start, Wd[7].start, Wd[9].start, Wd[9].start + 0.7].map((s, i) => {
			const p = (a - s) / 2.4;
			if (p < 0 || p > 1) return null;
			return (
				<mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
					<ringGeometry args={[0.6 + p * 7, 0.66 + p * 7.1, 96]} />
					<meshBasicMaterial color={K.ice} transparent opacity={(1 - p) * 0.8} />
				</mesh>
			);
		})}
	</>
);

const Dust: React.FC<{a: number}> = ({a}) => {
	const base = useMemo(() => {
		const r = rng(99);
		return Array.from({length: 500}, () => [(r() - 0.5) * 22, r() * 10, (r() - 0.5) * 22, 0.2 + r() * 0.6]);
	}, []);
	const pos = new Float32Array(base.length * 3);
	base.forEach((p, i) => {
		pos[i * 3] = p[0] + Math.sin(a * 0.3 + i) * 0.2;
		pos[i * 3 + 1] = (p[1] + a * p[3]) % 10;
		pos[i * 3 + 2] = p[2];
	});
	return (
		<points key={Math.round(a * FPS)}>
			<bufferGeometry>
				<bufferAttribute attach="attributes-position" args={[pos, 3]} />
			</bufferGeometry>
			<pointsMaterial color={K.ice} size={0.045} transparent opacity={0.75} sizeAttenuation />
		</points>
	);
};

const Scene: React.FC<{a: number; t: number}> = ({a, t}) => (
	<>
		<color attach="background" args={[K.bg]} />
		<fog attach="fog" args={[K.bg, 14, 42]} />
		<ambientLight intensity={0.35} />
		<directionalLight position={[4, 8, 6]} intensity={1.2} color="#cfefff" />
		<Rig a={a} />
		<mesh rotation={[-Math.PI / 2, 0, 0]}>
			<planeGeometry args={[80, 80]} />
			<meshStandardMaterial color="#071019" metalness={0.6} roughness={0.35} />
		</mesh>
		<gridHelper args={[60, 60, '#1f7d96', '#0e3646']} position={[0, 0.01, 0]} />
		<Dust a={a} />
		<Crystal a={a} t={t} />
		<Mihrab a={a} />
		<Sejadah a={a} />
		<Shield a={a} t={t} />
		<Rocks a={a} />
		<Rain a={a} />
		<Pillars a={a} />
		<Heaven a={a} />
		<Ripples a={a} />
	</>
);

// ---------- teks ----------
const Card: React.FC<{a: number}> = ({a}) => {
	const cardOp = ramp(a, -0.4, 0.3) * (1 - ramp(a, END + 0.3, END + 1));
	return (
		<div
			style={{
				position: 'absolute',
				left: 48,
				right: 48,
				top: 1250,
				height: 520,
				borderRadius: 36,
				background: 'linear-gradient(160deg, rgba(127,233,255,0.12), rgba(8,22,32,0.55))',
				border: '1.5px solid rgba(127,233,255,0.35)',
				boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
				backdropFilter: 'blur(18px)',
				opacity: cardOp,
				overflow: 'hidden',
			}}
		>
			{ay.groups.map((g, gi) => {
				const s = ay.start(gi);
				const e = ay.end(gi);
				const vis = window_(a, s + 0.05, e - 0.05, 0.35);
				if (vis <= 0) return null;
				const ws = ay.words.slice(g.from - 1, g.to);
				const tr = parseTr(g.tr);
				const lastEnd = ws[ws.length - 1].end;
				const prog = interpolate(a, [s, lastEnd - 0.2], [0, tr.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
				return (
					<div key={gi} style={{position: 'absolute', inset: '40px 40px 70px', display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: vis, transform: `scale(${0.97 + 0.03 * vis})`}}>
						<div style={{direction: 'rtl', textAlign: 'center', fontFamily: 'Scheherazade New', fontWeight: 700, fontSize: 96, lineHeight: 1.5, color: K.text}}>
							{ws.map((w, i) => {
								const said = a >= w.start - 0.05;
								const now = said && a < w.end;
								return (
									<span
										key={i}
										style={{
											display: 'inline-block',
											margin: '0 10px',
											opacity: said ? 1 : 0.18,
											color: now ? K.ice : K.text,
											transform: `translateY(${now ? -6 : 0}px) scale(${now ? 1.06 : 1})`,
											textShadow: now ? `0 0 26px ${K.cyan}, 0 6px 0 #0b3a4c` : '0 4px 0 rgba(0,0,0,0.35)',
										}}
									>
										{w.ar}
									</span>
								);
							})}
						</div>
						<div style={{textAlign: 'center', fontFamily: 'DM Sans', fontWeight: 500, fontSize: 40, lineHeight: 1.4, color: K.text, marginTop: 34}}>
							{tr.map((w, i) => {
								const k = Math.max(0, Math.min(1, prog - i));
								return (
									<span key={i} style={{display: 'inline-block', marginRight: 11, opacity: k, filter: `blur(${(1 - k) * 8}px)`, color: w.gold ? K.ice : K.text, fontWeight: w.gold ? 700 : 500}}>
										{w.w}
									</span>
								);
							})}
						</div>
					</div>
				);
			})}
			<div style={{position: 'absolute', bottom: 26, left: 0, right: 0, textAlign: 'center', fontFamily: 'Space Grotesk', fontWeight: 500, fontSize: 26, letterSpacing: 6, color: K.dim}}>
				AL-BAQARAH · 153
			</div>
		</div>
	);
};

const extrude = (n: number, c: string) => Array.from({length: n}, (_, i) => `0 ${i + 1}px 0 ${c}`).join(', ');

const Title: React.FC<{a: number}> = ({a}) => {
	const op = Math.max(1 - ramp(a, -0.4, 0.4), ramp(a, END + 0.8, END + 1.8));
	if (op <= 0) return null;
	return (
		<div style={{position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', opacity: op, perspective: 900}}>
			<div
				style={{
					fontFamily: 'Space Grotesk',
					fontWeight: 700,
					fontSize: 190,
					letterSpacing: 18,
					color: K.white,
					transform: `rotateX(${22 - op * 6}deg) translateY(${(1 - op) * 30}px)`,
					textShadow: `${extrude(12, '#1b6f86')}, 0 18px 40px rgba(44,201,232,0.45)`,
				}}
			>
				SABAR
			</div>
			<div style={{fontFamily: 'Space Grotesk', fontWeight: 500, fontSize: 40, letterSpacing: 10, color: K.ice, marginTop: 18}}>& SOLAT · KUNCI PERTOLONGAN</div>
		</div>
	);
};

export const AyatSabar: React.FC = () => {
	const f = useCurrentFrame();
	const t = f / FPS;
	const a = t - INTRO;
	return (
		<AbsoluteFill style={{backgroundColor: K.bg}}>
			<ThreeCanvas width={W} height={H} camera={{fov: 42, position: [0, 3, 19], near: 0.1, far: 120}}>
				<Scene a={a} t={t} />
			</ThreeCanvas>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
			<Title a={a} />
			<Card a={a} />
			{HANDLE && (
				<div style={{position: 'absolute', top: 120, left: 64, display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 28, letterSpacing: 4, color: K.text, opacity: 0.8}}>
					<span style={{width: 14, height: 14, borderRadius: 7, background: K.ice, boxShadow: `0 0 14px ${K.cyan}`}} />
					{HANDLE.toUpperCase()}
				</div>
			)}
			<Sequence from={Math.round(INTRO * FPS)}>
				<Audio src={staticFile(ay.audioFile)} />
			</Sequence>
		</AbsoluteFill>
	);
};
