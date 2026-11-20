// Maklumat Sekolah: latar & kad pegun; hanya glob yang berpusing dan dizum ke Dungun, Terengganu.
// Glob: three.js + tekstur bumi (contoh three.js). Peta dekat: sempadan negeri Natural Earth (domain awam).
import '@fontsource/russo-one/400.css';
import '@fontsource/oxanium/700.css';
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import React, {useMemo, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import peta from './peta_semenanjung.json';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CYAN = '#38e8ff';
const HIJAU = '#5dff9b';
const FPS = 30;

// Lensa glob (koordinat skrin 1920x1080)
const LX = 1415;
const LY = 545;
const LR = 455;
const KAN = 1000; // saiz kanvas lensa

const DUNGUN = {lon: 103.416, lat: 4.776};
const MALAYSIA = {lon: 102.3, lat: 4.4};

const useTeksturBumi = () => {
  const [handle] = useState(() => delayRender('tekstur bumi'));
  return useMemo(() => {
    const t = new THREE.TextureLoader().load(
      staticFile('montaj/bumi_4096.jpg'),
      () => requestAnimationFrame(() => requestAnimationFrame(() => continueRender(handle))),
      undefined,
      (e) => cancelRender(e),
    );
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [handle]);
};

// Arah titik (lat, lon) pada SphereGeometry three.js dengan tekstur equirectangular
const arah = (lat: number, lon: number) => {
  const phi = ((lon + 180) / 360) * Math.PI * 2;
  const theta = ((90 - lat) / 180) * Math.PI;
  return new THREE.Vector3(-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta));
};

const Bumi: React.FC<{tex: THREE.Texture}> = ({tex}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const p = arah(MALAYSIA.lat, MALAYSIA.lon);
  const ryAkhir = Math.atan2(-p.x, p.z);
  const henti = interpolate(t, [0, 4.0], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const putar = (1 - henti) * Math.PI * 2.4;
  const condong = interpolate(t, [0, 4.0], [0.35, (MALAYSIA.lat * Math.PI) / 180], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const atmos = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: {},
        vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: 'varying vec3 vN; void main(){ float i = pow(0.72 - dot(vN, vec3(0.0,0.0,1.0)), 3.0); gl_FragColor = vec4(0.25,0.85,1.0,1.0) * i; }',
      }),
    [],
  );
  return (
    <group>
      <group rotation={[condong, 0, 0]}>
        <group rotation={[0, ryAkhir + putar, 0]}>
          <mesh>
            <sphereGeometry args={[1, 128, 128]} />
            <meshStandardMaterial map={tex} roughness={0.85} metalness={0} emissive={new THREE.Color('#0b2a40')} emissiveIntensity={0.25} />
          </mesh>
        </group>
      </group>
      <mesh scale={1.12}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={atmos} attach="material" />
      </mesh>
    </group>
  );
};

const KameraZum: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const jarak = interpolate(t, [0, 4.0, 6.0], [3.15, 3.15, 1.12], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const {camera} = useThree();
  camera.position.set(0, 0, jarak);
  camera.lookAt(0, 0, 0);
  return null;
};

// ---------- Peta vektor (selepas zum glob) ----------
const unjur = (lon: number, lat: number, c: {lon: number; lat: number; k: number}) => ({
  x: KAN / 2 + (lon - c.lon) * c.k * Math.cos((4.5 * Math.PI) / 180),
  y: KAN / 2 - (lat - c.lat) * c.k,
});
const PetaVektor: React.FC<{t: number}> = ({t}) => {
  const p = interpolate(t, [6.0, 8.6], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const c = {
    lon: interpolate(p, [0, 1], [102.2, 103.3]),
    lat: interpolate(p, [0, 1], [4.1, 4.85]),
    k: interpolate(p, [0, 1], [118, 300]),
  };
  const tgOp = interpolate(t, [6.6, 7.4], [0, 1], clamp);
  const dgOp = interpolate(t, [7.8, 8.4], [0, 1], clamp);
  const d = unjur(DUNGUN.lon, DUNGUN.lat, c);
  const nadi = (k: number) => (t * 0.9 + k) % 1;
  const grid: React.ReactNode[] = [];
  for (let lon = 98; lon <= 108; lon++) {
    const a = unjur(lon, -2, c);
    const b = unjur(lon, 10, c);
    grid.push(<line key={'o' + lon} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={CYAN} strokeOpacity={0.12} strokeWidth={1} />);
  }
  for (let lat = -2; lat <= 10; lat++) {
    const a = unjur(96, lat, c);
    const b = unjur(110, lat, c);
    grid.push(<line key={'a' + lat} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={CYAN} strokeOpacity={0.12} strokeWidth={1} />);
  }
  type Neg = {nama: string; negara: string; cincin: number[][][]};
  const tgTitik = unjur(102.85, 5.15, c);
  return (
    <svg width={KAN} height={KAN} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <radialGradient id="laut" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#0a3a6a" />
          <stop offset="100%" stopColor="#041a33" />
        </radialGradient>
        <filter id="sinar" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect width={KAN} height={KAN} fill="url(#laut)" />
      {grid}
      {(peta as Neg[]).map((n, i) =>
        n.cincin.map((ring, j) => {
          const dpath = ring.map(([lon, lat], k) => {
            const q = unjur(lon, lat, c);
            return `${k ? 'L' : 'M'}${q.x.toFixed(1)},${q.y.toFixed(1)}`;
          }).join('') + 'Z';
          const tg = n.nama === 'Terengganu';
          const myr = n.negara === 'MYS';
          return (
            <path
              key={`${i}-${j}`}
              d={dpath}
              fill={tg ? `rgba(60,200,120,${0.12 + 0.26 * tgOp})` : myr ? 'rgba(40,120,90,0.55)' : 'rgba(30,70,70,0.35)'}
              stroke={tg ? HIJAU : CYAN}
              strokeOpacity={tg ? 0.5 + 0.5 * tgOp : myr ? 0.55 : 0.2}
              strokeWidth={tg ? 2.5 + 1.5 * tgOp : 1.2}
              filter={tg && tgOp > 0.1 ? 'url(#sinar)' : undefined}
            />
          );
        }),
      )}
      <g opacity={tgOp}>
        <text x={tgTitik.x - 40} y={tgTitik.y} fill="#eafff2" fontFamily="'Oxanium', sans-serif" fontWeight={700} fontSize={34} letterSpacing={4} textAnchor="middle" style={{filter: 'drop-shadow(0 0 8px #5dff9b)'}}>
          TERENGGANU
        </text>
      </g>
      <g opacity={dgOp}>
        {[0, 0.33, 0.66].map((k) => (
          <circle key={k} cx={d.x} cy={d.y} r={14 + nadi(k) * 70} fill="none" stroke={CYAN} strokeWidth={3} opacity={1 - nadi(k)} />
        ))}
        <circle cx={d.x} cy={d.y} r={10} fill="#fff" style={{filter: `drop-shadow(0 0 10px ${CYAN})`}} />
        <line x1={d.x + 14} y1={d.y} x2={d.x + 90} y2={d.y + 60} stroke={CYAN} strokeWidth={2} />
        <text x={d.x + 96} y={d.y + 72} fill="#fff" fontFamily="'Russo One', sans-serif" fontSize={46} letterSpacing={3} style={{filter: `drop-shadow(0 0 10px ${CYAN})`}}>
          DUNGUN
        </text>
        <text x={d.x + 98} y={d.y + 102} fill={CYAN} fontFamily="'JetBrains Mono', monospace" fontSize={20} letterSpacing={3}>
          4.78°U 103.42°T
        </text>
      </g>
    </svg>
  );
};

export const MaklumatGlob: React.FC<{fd: number}> = ({fd}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const tex = useTeksturBumi();
  const globOp = interpolate(t, [5.4, 6.1], [1, 0], clamp);
  const petaOp = interpolate(t, [5.4, 6.1], [0, 1], clamp);
  const masuk = interpolate(t, [0, 0.6], [0, 1], clamp);
  const out = interpolate(frame, [fd - 10, fd], [1, 0], clamp);
  const cincin = interpolate(t, [0, 1.2], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{background: '#06325a', opacity: out}}>
      <Img src={staticFile('montaj/maklumat_latar.jpg')} style={{position: 'absolute', inset: 0, width: 1920, height: 1080}} />
      {/* cahaya belakang glob */}
      <div style={{position: 'absolute', left: LX - LR * 1.35, top: LY - LR * 1.35, width: LR * 2.7, height: LR * 2.7, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,240,255,.35) 0%, rgba(56,232,255,.12) 45%, transparent 70%)'}} />
      {/* lensa glob */}
      <div style={{position: 'absolute', left: LX - KAN / 2, top: LY - KAN / 2, width: KAN, height: KAN, clipPath: `circle(${LR}px at ${KAN / 2}px ${KAN / 2}px)`, opacity: masuk}}>
        <div style={{position: 'absolute', inset: 0, opacity: globOp}}>
          <ThreeCanvas width={KAN} height={KAN} camera={{fov: 38, position: [0, 0, 3.15]}} gl={{antialias: true, alpha: true}}>
            <KameraZum />
            <ambientLight intensity={0.55} />
            <directionalLight position={[3, 2, 4]} intensity={2.4} />
            <directionalLight position={[-4, -1, 2]} intensity={0.6} color="#7fdcff" />
            <Bumi tex={tex} />
          </ThreeCanvas>
        </div>
        <div style={{position: 'absolute', inset: 0, opacity: petaOp}}>{petaOp > 0 && <PetaVektor t={t} />}</div>
        {/* garis imbasan semasa peralihan */}
        {t > 5.0 && t < 6.6 && <div style={{position: 'absolute', left: 0, top: interpolate(t, [5.0, 6.6], [0, KAN]), width: KAN, height: 5, background: 'rgba(160,250,255,.9)', boxShadow: `0 0 26px ${CYAN}`}} />}
      </div>
      {/* gelang HUD lensa */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <circle cx={LX} cy={LY} r={LR + 4} fill="none" stroke={CYAN} strokeWidth={4} strokeDasharray={`${2 * Math.PI * (LR + 4) * cincin} 9999`} transform={`rotate(-90 ${LX} ${LY})`} style={{filter: `drop-shadow(0 0 10px ${CYAN})`}} />
        <circle cx={LX} cy={LY} r={LR + 26} fill="none" stroke={CYAN} strokeOpacity={0.6} strokeWidth={2} strokeDasharray="40 18" transform={`rotate(${t * 12} ${LX} ${LY})`} />
        <ellipse cx={LX} cy={LY + 40} rx={LR + 90} ry={120} fill="none" stroke={HIJAU} strokeOpacity={0.55} strokeWidth={2.5} transform={`rotate(-14 ${LX} ${LY + 40})`} strokeDasharray="420 60" strokeDashoffset={-t * 120} />
      </svg>
      {/* tajuk */}
      <div style={{position: 'absolute', right: 70, top: 70, textAlign: 'right', opacity: interpolate(t, [0.3, 1.0], [0, 1], clamp)}}>
        <div style={{fontFamily: "'Russo One', sans-serif", fontSize: 104, lineHeight: 0.95, color: '#fff', WebkitTextStroke: '3px #0a2a4a', textShadow: '0 6px 18px rgba(0,20,50,.6)'}}>MAKLUMAT</div>
        <div style={{fontFamily: "'Russo One', sans-serif", fontSize: 104, lineHeight: 0.95, color: '#fff', WebkitTextStroke: '3px #0a2a4a', textShadow: '0 6px 18px rgba(0,20,50,.6)'}}>SEKOLAH</div>
      </div>
    </AbsoluteFill>
  );
};
