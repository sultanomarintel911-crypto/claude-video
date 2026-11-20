// Video gelung HAKS (9:16, 1080×1920).
// Semua gerakan dipacu fasa gelung t ∈ [0,1) dengan harmonik integer,
// jadi bingkai terakhir bersambung lancar ke bingkai pertama.
// Susun atur prosedur dijana oleh penjana Rust (gen/) → src/layout.json.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import '@fontsource/exo-2/900-italic.css';
import L from './layout.json';

export const FPS = 30;
export const LOOP_SECONDS = 10;
export const LOOP_FRAMES = FPS * LOOP_SECONDS;

const W = 1080;
const H = 1920;
const TAU = Math.PI * 2;
const CX = 540; // pusat cincin HUD & teks
const CY = 840;

const C = {
  cyan: '#2fd2ff',
  blue: '#1b7dff',
  deep: '#0a3fb8',
  yellow: '#ffd21f',
  amber: '#ffb800',
};
const col = (c: string) => (c === 'y' ? C.yellow : C.cyan);
const wave = (t: number, h: number, ph = 0) => 0.5 + 0.5 * Math.sin(TAU * (h * t + ph));
const frac = (x: number) => x - Math.floor(x);
/** Denyut licin 0→1→0 dalam tetingkap [a,b] fasa gelung (selain itu 0). */
const pulseWin = (t: number, a: number, b: number) => {
  if (t < a || t > b) return 0;
  return Math.sin(((t - a) / (b - a)) * Math.PI) ** 2;
};

type Circuit = {p: number[][]; c: string; w: number; dot: number; laps: number; ph: number; pl: number; dh: number; dp: number};

// ---------------------------------------------------------------- Latar
const Background: React.FC<{t: number}> = ({t}) => {
  const b = 0.92 + 0.08 * Math.cos(TAU * t);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 80% 55% at 50% 44%, rgba(22,92,214,${0.95 * b}) 0%, #0b3a9c 35%, #072a78 62%, #041a4f 100%)`,
      }}
    />
  );
};

// ---------------------------------------------------------------- Jalur serong
const Slashes: React.FC<{t: number}> = ({t}) => {
  // Kilauan menyusur jalur: satu laluan per gelung
  const g = frac(t);
  const sweep = -1.2 + g * 3.4; // posisi relatif gradien (melepasi hujung)
  const bands = (cx: number, cy: number, flip: boolean, key: string) => {
    const s = flip ? -1 : 1;
    return (
      <g key={key} transform={`translate(${cx},${cy}) rotate(-56)`}>
        {/* garis biru bercahaya */}
        {[-170, -128, -96, 118, 150, 196].map((o, i) => (
          <g key={i}>
            <rect x={-900} y={s * o - 9} width={1800} height={18} fill={C.blue} opacity={0.22} />
            <rect x={-900} y={s * o - 2.5} width={1800} height={5} fill="url(#sweepBlue)" />
          </g>
        ))}
        {/* panel biru separa telus */}
        <rect x={-900} y={s * 40 - 70} width={1800} height={60} fill="#1d64e0" opacity={0.28} />
        {/* jalur kuning tebal */}
        <rect x={-150} y={s * 20 - 60} width={430} height={120} fill="url(#yellowBar)" />
        <rect x={-150} y={s * 20 - 60} width={430} height={120} fill="url(#sweepWhite)" opacity={0.8} />
        <rect x={-150} y={s * 20 - 60} width={430} height={6} fill="#fff6c2" opacity={0.9} />
        <rect x={-760} y={s * 30 - 70} width={360} height={140} fill="url(#yellowBar)" />
        <rect x={-760} y={s * 30 - 70} width={360} height={140} fill="url(#sweepWhite)" opacity={0.8} />
      </g>
    );
  };
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="yellowBar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffc400" />
          <stop offset="0.5" stopColor={C.yellow} />
          <stop offset="1" stopColor="#ffe55e" />
        </linearGradient>
        <linearGradient id="sweepBlue" x1="0" y1="0" x2="1" y2="0" gradientTransform={`translate(${sweep - 1} 0)`}>
          <stop offset="0" stopColor={C.blue} stopOpacity={0.55} />
          <stop offset="0.45" stopColor={C.cyan} stopOpacity={0.9} />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity={1} />
          <stop offset="0.55" stopColor={C.cyan} stopOpacity={0.9} />
          <stop offset="1" stopColor={C.blue} stopOpacity={0.55} />
        </linearGradient>
        <linearGradient id="sweepWhite" x1="0" y1="0" x2="1" y2="0" gradientTransform={`translate(${sweep - 1} 0)`}>
          <stop offset="0.38" stopColor="#fff" stopOpacity={0} />
          <stop offset="0.5" stopColor="#fff" stopOpacity={0.9} />
          <stop offset="0.62" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
      <g style={{filter: 'drop-shadow(0 0 10px rgba(47,210,255,0.55))'}}>
        {bands(120, 150, false, 'tl')}
        {bands(980, 1730, true, 'br')}
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------- Litar
const Circuits: React.FC<{t: number}> = ({t}) => {
  const list = L.circuits as Circuit[];
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {list.map((c, i) => {
        const d = c.p.map((p, j) => `${j ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
        const end = c.p[c.p.length - 1];
        const color = col(c.c);
        const head = frac(t * c.laps + c.ph); // 0..1 sepanjang laluan
        const pl = c.pl;
        const off = pl - head * (1 + pl); // dash bergerak dari tepi ke titik hujung
        const tw = 0.55 + 0.45 * wave(t, c.dh, c.dp);
        return (
          <g key={i}>
            <path d={d} stroke={color} strokeWidth={c.w * 4} opacity={0.12} fill="none" strokeLinejoin="round" />
            <path d={d} stroke={color} strokeWidth={c.w} opacity={0.75} fill="none" strokeLinejoin="round" />
            <path
              d={d}
              pathLength={1}
              stroke="#ffffff"
              strokeWidth={c.w * 1.6}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${pl} 3`}
              strokeDashoffset={off}
              style={{filter: `drop-shadow(0 0 6px ${color})`}}
            />
            <circle cx={end[0]} cy={end[1]} r={c.dot * 2.4} fill={color} opacity={0.18 * tw} />
            <circle cx={end[0]} cy={end[1]} r={c.dot} fill={color} opacity={0.6 + 0.4 * tw} />
            <circle cx={end[0]} cy={end[1]} r={c.dot * 0.45} fill="#fff" opacity={0.7 * tw} />
          </g>
        );
      })}
    </svg>
  );
};

// ---------------------------------------------------------------- Piksel & titik
const Tiles: React.FC<{t: number}> = ({t}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
    {L.pixels.map((p, i) => (
      <rect key={i} x={p.x} y={p.y} width={p.s} height={p.s} rx={2} fill="#2a78ff" opacity={p.a * (0.45 + 0.55 * wave(t, p.h, p.ph))} />
    ))}
    {L.dots.map((d, i) => (
      <circle key={`d${i}`} cx={d.x} cy={d.y} r={d.r} fill={C.cyan} opacity={0.3 + 0.6 * wave(t, d.h, d.ph)} />
    ))}
  </svg>
);

// ---------------------------------------------------------------- Zarah
const Particles: React.FC<{t: number}> = ({t}) => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
    {L.particles.map((p, i) => {
      const y = ((p.y - t * p.laps * (H + 40)) % (H + 40) + (H + 40)) % (H + 40) - 20;
      const x = p.x + p.sw * Math.sin(TAU * (p.sh * t + p.ph));
      const a = 0.25 + 0.6 * wave(t, p.sh + 1, p.ph);
      const c = col(p.c);
      return (
        <g key={i}>
          <circle cx={x} cy={y} r={p.r * 3} fill={c} opacity={a * 0.15} />
          <circle cx={x} cy={y} r={p.r} fill={c} opacity={a} />
        </g>
      );
    })}
  </svg>
);

// ---------------------------------------------------------------- Cincin HUD
const arc = (r: number, a0: number, a1: number) => {
  const p = (a: number) => [CX + r * Math.cos((a * Math.PI) / 180), CY + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1}`;
};
const Spin: React.FC<{deg: number; children: React.ReactNode}> = ({deg, children}) => (
  <g transform={`rotate(${deg} ${CX} ${CY})`}>{children}</g>
);

const HudRing: React.FC<{t: number}> = ({t}) => {
  const r1 = 360 * t; // 1 pusingan/gelung
  const r2 = -360 * t;
  const r3 = 180 * t; // tanda detik simetri 180°
  const glow = 0.75 + 0.25 * wave(t, 2);
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, filter: `drop-shadow(0 0 ${12 * glow}px rgba(47,210,255,0.85))`}}>
      {/* lingkaran asas */}
      <circle cx={CX} cy={CY} r={300} stroke={C.blue} strokeWidth={5} fill="none" opacity={0.85} />
      <circle cx={CX} cy={CY} r={300} stroke={C.cyan} strokeWidth={1.5} fill="none" opacity={0.9} />
      <circle cx={CX} cy={CY} r={228} stroke={C.blue} strokeWidth={3} fill="none" opacity={0.55} />
      <circle cx={CX} cy={CY} r={200} fill="url(#core)" />
      <defs>
        <radialGradient id="core">
          <stop offset="0" stopColor="#2a8cff" stopOpacity={0.35} />
          <stop offset="1" stopColor="#0a3fb8" stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* lengkok tebal berputar arah jam */}
      <Spin deg={r1}>
        <path d={arc(330, -100, -35)} stroke={C.cyan} strokeWidth={22} fill="none" strokeLinecap="butt" />
        <path d={arc(330, -100, -35)} stroke="#e8fbff" strokeWidth={5} fill="none" opacity={0.8} />
        <path d={arc(330, 105, 150)} stroke={C.cyan} strokeWidth={14} fill="none" opacity={0.9} />
        <path d={arc(330, 20, 48)} stroke={C.yellow} strokeWidth={16} fill="none" />
        <path d={arc(330, 196, 222)} stroke={C.yellow} strokeWidth={16} fill="none" />
        <path d={arc(330, -28, -8)} stroke={C.blue} strokeWidth={10} fill="none" />
      </Spin>
      {/* lengkok putus-putus luar, lawan arah */}
      <Spin deg={r2}>
        <path d={arc(372, 200, 300)} stroke={C.cyan} strokeWidth={4} strokeDasharray="3 9" fill="none" />
        <path d={arc(372, 20, 120)} stroke={C.yellow} strokeWidth={4} strokeDasharray="3 9" fill="none" opacity={0.85} />
        <path d={arc(352, 150, 178)} stroke={C.yellow} strokeWidth={12} fill="none" />
        <path d={arc(352, -30, -2)} stroke={C.yellow} strokeWidth={12} fill="none" />
        <path d={arc(395, 240, 262)} stroke={C.cyan} strokeWidth={3} fill="none" opacity={0.7} />
        <path d={arc(395, 60, 82)} stroke={C.cyan} strokeWidth={3} fill="none" opacity={0.7} />
      </Spin>
      {/* tanda detik */}
      <Spin deg={r3}>
        {(L.ticks as [number, boolean][]).map(([a, long], i) => {
          const rad = (a * Math.PI) / 180;
          const ri = 252;
          const ro = long ? 278 : 266;
          return (
            <line
              key={i}
              x1={CX + ri * Math.cos(rad)}
              y1={CY + ri * Math.sin(rad)}
              x2={CX + ro * Math.cos(rad)}
              y2={CY + ro * Math.sin(rad)}
              stroke={C.cyan}
              strokeWidth={long ? 3 : 1.6}
              opacity={long ? 0.9 : 0.55}
            />
          );
        })}
      </Spin>
      <Spin deg={-r3 * 2}>
        <path d={arc(214, -60, 60)} stroke={C.cyan} strokeWidth={6} fill="none" opacity={0.6} />
        <path d={arc(214, 120, 240)} stroke={C.cyan} strokeWidth={6} fill="none" opacity={0.6} />
      </Spin>
    </svg>
  );
};

// ---------------------------------------------------------------- Suar mendatar
const Flare: React.FC<{t: number}> = ({t}) => {
  const p = 0.7 + 0.3 * wave(t, 2, 0.25);
  const run = frac(t * 2); // kilat bergerak sepanjang garis
  return (
    <AbsoluteFill>
      {/* garis kuning penuh lebar */}
      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: CY + 44, height: 4,
          background: `linear-gradient(90deg, rgba(255,210,31,0.95) 0%, rgba(255,210,31,0.15) 18%, rgba(255,210,31,0) 30%, rgba(255,210,31,0) 70%, rgba(255,210,31,0.15) 82%, rgba(255,210,31,0.95) 100%)`,
          boxShadow: '0 0 18px 4px rgba(255,190,20,0.55)',
        }}
      />
      {/* kilat bergerak */}
      {[run, 1 - run].map((r, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', top: CY + 38, height: 16, width: 140, left: r * (W + 200) - 170,
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,215,60,0.6) 35%, rgba(255,200,0,0) 70%)',
          }}
        />
      ))}
      {/* suar di bawah teks */}
      <div
        style={{
          position: 'absolute', left: CX - 460, width: 920, top: CY + 120, height: 76,
          background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,255,255,${p}) 0%, rgba(255,222,90,${0.9 * p}) 22%, rgba(255,175,0,${0.4 * p}) 48%, rgba(255,170,0,0) 75%)`,
          mixBlendMode: 'screen',
        }}
      />
      <div
        style={{
          position: 'absolute', left: CX - 520, width: 1040, top: CY + 155, height: 6,
          background: `linear-gradient(90deg, rgba(255,200,0,0), rgba(255,240,180,${p}) 50%, rgba(255,200,0,0))`,
          filter: 'blur(1px)',
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- Gelombang jaring
const MeshWave: React.FC<{t: number}> = ({t}) => {
  const w = L.wave;
  const rows: string[] = [];
  const dots: React.ReactNode[] = [];
  for (let r = 0; r < w.rows; r++) {
    const z = r / (w.rows - 1); // 0 = belakang, 1 = depan
    const pts: string[] = [];
    for (let c = 0; c <= w.cols; c++) {
      const u = c / w.cols;
      const x = -60 + u * (W + 120);
      let y = w.y - w.depth * (1 - z) + 120 * (0.5 - u) * 0.6;
      for (const k of w.comps) {
        y += k.a * (0.55 + 0.45 * z) * Math.sin((k.k / 10000) * (x + r * 38) - TAU * k.m * t + k.ph);
      }
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      if (c % 2 === r % 2) {
        dots.push(<circle key={`${r}-${c}`} cx={x} cy={y} r={1.2 + 1.6 * z} fill="#9fe9ff" opacity={0.25 + 0.6 * z} />);
      }
    }
    rows.push(pts.join(' '));
  }
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="meshFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.cyan} stopOpacity={0.35} />
          <stop offset="0.4" stopColor={C.cyan} stopOpacity={0.9} />
          <stop offset="1" stopColor={C.blue} stopOpacity={0.5} />
        </linearGradient>
      </defs>
      {rows.map((p, i) => {
        const z = i / (rows.length - 1);
        const hero = i === 4 || i === 9 || i === rows.length - 1;
        return (
          <g key={i}>
            {hero && <polyline points={p} stroke={C.cyan} strokeWidth={10} opacity={0.18} fill="none" />}
            <polyline points={p} stroke="url(#meshFade)" strokeWidth={hero ? 2.6 : 1} opacity={hero ? 0.95 : 0.25 + 0.3 * z} fill="none" />
          </g>
        );
      })}
      {dots}
    </svg>
  );
};

// ---------------------------------------------------------------- Logo HAKS
const LOGO_TEXT = 'HAKS';
const FONT = '"Exo 2", sans-serif';
const Logo: React.FC<{t: number}> = ({t}) => {
  const bob = 6 * Math.sin(TAU * t);
  const glow = 0.7 + 0.3 * wave(t, 2);
  // kilauan merentas huruf: sekali bagi setiap gelung (fasa 0.12–0.42)
  const s = Math.min(1, Math.max(0, (t - 0.12) / 0.3));
  const shineX = -40 + s * 180; // peratus
  const flash = pulseWin(t, 0.22, 0.34);
  const base: React.CSSProperties = {
    position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center',
    fontFamily: FONT, fontStyle: 'italic', fontWeight: 900, fontSize: 318, letterSpacing: -4, lineHeight: '320px', whiteSpace: 'nowrap',
  };
  const extrude = Array.from({length: 20}, (_, i) => `${(i + 1) * 0.9}px ${(i + 1) * 1.15}px 0 ${i < 2 ? '#6cc4ff' : i < 8 ? '#1a5ee0' : i < 14 ? '#0e3a9e' : '#082670'}`).join(',');
  return (
    <div
      style={{
        position: 'absolute', left: 0, width: W, top: CY - 175, height: 320,
        transform: `translateY(${bob}px) skewX(-4deg) scaleX(1.04)`,
      }}
    >
      {/* cahaya belakang */}
      <div style={{...base, color: 'transparent', WebkitTextStroke: '26px rgba(47,160,255,0.55)', filter: `blur(${16 + 8 * glow}px)`}}>{LOGO_TEXT}</div>
      {/* ekstrusi 3D */}
      <div style={{...base, color: '#1556d6', textShadow: `${extrude}, 0 22px 36px rgba(0,10,40,0.7)`}}>{LOGO_TEXT}</div>
      {/* garis luar biru terang */}
      <div style={{...base, color: 'transparent', WebkitTextStroke: '9px #3fc6ff', filter: `drop-shadow(0 0 ${10 * glow}px ${C.cyan})`}}>{LOGO_TEXT}</div>
      {/* isi krom */}
      <div
        style={{
          ...base,
          backgroundImage:
            'linear-gradient(180deg, #ffffff 0%, #f5f8ff 28%, #cad7ee 46%, #7f98c4 50%, #f8fbff 53%, #dce6f6 70%, #9fb2d4 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        }}
      >
        {LOGO_TEXT}
      </div>
      {/* kilauan bergerak */}
      <div
        style={{
          ...base,
          backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0) ${shineX - 12}%, rgba(255,255,255,0.95) ${shineX}%, rgba(160,230,255,0.6) ${shineX + 4}%, rgba(255,255,255,0) ${shineX + 14}%)`,
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          opacity: s > 0 && s < 1 ? 1 : 0,
        }}
      >
        {LOGO_TEXT}
      </div>
      {/* denyar ringan selepas kilauan */}
      <div style={{...base, color: `rgba(200,240,255,${0.18 * flash})`}}>{LOGO_TEXT}</div>
    </div>
  );
};

// ---------------------------------------------------------------- Komposisi
export const HaksLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const t = (frame % LOOP_FRAMES) / LOOP_FRAMES;
  const [handle] = useState(() => delayRender('Muat fon Exo 2'));
  useEffect(() => {
    document.fonts.load(`italic 900 300px ${FONT}`).then(() => document.fonts.ready).then(() => continueRender(handle));
  }, [handle]);
  const zoom = 1.012 + 0.012 * Math.sin(TAU * t);
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#041a4f'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <Background t={t} />
        <Tiles t={t} />
        <Circuits t={t} />
        <MeshWave t={t} />
        <Particles t={t} />
        <HudRing t={t} />
        <Flare t={t} />
        <Logo t={t} />
      </AbsoluteFill>
      {/* vinyet */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 55%, rgba(2,10,40,0.4) 100%)'}} />
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <Slashes t={t} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
