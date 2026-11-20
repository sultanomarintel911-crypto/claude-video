// HAKS — versi "gah": angkasa gelap + planet, huruf terbang masuk satu-satu,
// detik pendedahan, kemudian kembali ke angkasa (gelung 12 s yang lancar).
// Susun atur & tekstur planet dijana oleh Rust (gen/) → src/layout.json, public/planet.png.
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, Img, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/exo-2/900-italic.css';
import L from './layout.json';

export const GAH_FPS = 30;
export const GAH_SECONDS = 12;
export const GAH_FRAMES = GAH_FPS * GAH_SECONDS;

const W = 1080;
const H = 1920;
const TAU = Math.PI * 2;
const CX = 540;
const CY = 820;
const FONT = '"Exo 2", sans-serif';

const C = {cyan: '#2fd2ff', blue: '#1b7dff', yellow: '#ffd21f', amber: '#ffb800'};
const col = (c: string) => (c === 'y' ? C.yellow : C.cyan);

// ---------------------------------------------------------------- garis masa (saat)
const LAND = [2.45, 2.8, 3.15, 3.5]; // H A K S mendarat
const FLY = 0.62; // tempoh terbang
const GAH = 3.85; // detik pendedahan penuh
const OUT = 10.3; // mula keluar
const SHINES = [5.1, 8.3];

// ---------------------------------------------------------------- utiliti
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = (x: number) => {
  const c = clamp(x);
  return c * c * (3 - 2 * c);
};
const ramp = (s: number, a: number, b: number) => smooth((s - a) / (b - a));
const win = (s: number, a: number, b: number, c: number, d: number) => ramp(s, a, b) * (1 - ramp(s, c, d));
const outExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(x)));
const outCubic = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const outBack = (x: number) => {
  const c = clamp(x);
  const k = 1.9;
  return 1 + (k + 1) * Math.pow(c - 1, 3) + k * Math.pow(c - 1, 2);
};
const decay = (s: number, at: number, k: number) => (s < at ? 0 : Math.exp(-(s - at) * k));
const wave = (t: number, h: number, ph = 0) => 0.5 + 0.5 * Math.sin(TAU * (h * t + ph));
const frac = (x: number) => x - Math.floor(x);

type Circuit = {p: number[][]; c: string; w: number; dot: number; laps: number; ph: number; pl: number; dh: number; dp: number};
type Spark = {vx: number; vy: number; r: number; life: number; y: boolean};
type Env = {s: number; t: number};

// ================================================================ ANGKASA
const Space: React.FC<Env> = ({s, t}) => {
  const blue = win(s, GAH - 0.25, GAH + 0.9, OUT + 0.3, OUT + 1.4);
  const n1 = 0.5 + 0.5 * Math.sin(TAU * t);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 120% 90% at 50% 40%, #06102e 0%, #030818 55%, #01030b 100%)'}} />
      {/* nebula */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 45% 30% at ${28 + 3 * n1}% 30%, rgba(30,90,220,0.28), rgba(0,0,0,0) 70%),
            radial-gradient(ellipse 50% 28% at ${74 - 3 * n1}% 62%, rgba(20,140,255,0.18), rgba(0,0,0,0) 70%),
            radial-gradient(ellipse 30% 18% at 70% 18%, rgba(255,190,40,0.07), rgba(0,0,0,0) 70%)`,
        }}
      />
      {/* gaya poster biru, muncul pada detik gah */}
      <AbsoluteFill
        style={{
          opacity: blue,
          background: 'radial-gradient(ellipse 85% 50% at 50% 42%, rgba(26,100,225,0.95) 0%, rgba(11,58,156,0.85) 38%, rgba(7,42,120,0.45) 65%, rgba(4,26,79,0) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

const Stars: React.FC<Env> = ({s, t}) => {
  const warpDim = 1 - 0.5 * win(s, 0.6, 1.2, 2.2, 2.8);
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {L.stars.map((st, i) => {
        const a = st.a * (0.35 + 0.65 * wave(t, st.h, st.ph)) * warpDim;
        const c = st.y2 ? '#ffe9a8' : '#cfeeff';
        return (
          <g key={i}>
            {st.big && <circle cx={st.x} cy={st.y} r={st.r * 4} fill={c} opacity={a * 0.18} />}
            <circle cx={st.x} cy={st.y} r={st.r} fill={c} opacity={a} />
            {st.big && (
              <g opacity={a * 0.7} stroke={c} strokeWidth={0.8}>
                <line x1={st.x - st.r * 6} y1={st.y} x2={st.x + st.r * 6} y2={st.y} />
                <line x1={st.x} y1={st.y - st.r * 6} x2={st.x} y2={st.y + st.r * 6} />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};

// streak hiperangkasa + teras tenaga yang mengecas sebelum huruf tiba
const Warp: React.FC<Env> = ({s}) => {
  const env = win(s, 0.25, 0.9, 2.1, 2.7);
  if (env <= 0.001) return null;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {L.warp.map((w, i) => {
        const a = w.ang / 1000;
        const lt = s - 0.25 - w.del;
        if (lt < 0) return null;
        const d = w.d0 + 900 * lt * lt; // memecut keluar
        const len = w.len * clamp(lt * 1.5);
        const x0 = CX + Math.cos(a) * d;
        const y0 = CY + Math.sin(a) * d;
        const x1 = CX + Math.cos(a) * (d + len);
        const y1 = CY + Math.sin(a) * (d + len);
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={w.y ? C.yellow : '#bfefff'} strokeWidth={w.w} strokeLinecap="round" opacity={env * 0.8} />;
      })}
    </svg>
  );
};

const Core: React.FC<Env> = ({s}) => {
  const charge = ramp(s, 0.9, 2.4) * (1 - ramp(s, GAH - 0.05, GAH + 0.35));
  const flick = 0.85 + 0.15 * Math.sin(s * 47);
  if (charge <= 0.001) return null;
  const r = 40 + 160 * charge;
  return (
    <div
      style={{
        position: 'absolute', left: CX - r * 2, top: CY - r * 2, width: r * 4, height: r * 4, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(255,255,255,${charge * flick}) 0%, rgba(120,220,255,${0.8 * charge}) 12%, rgba(30,120,255,${0.35 * charge}) 35%, rgba(0,40,160,0) 70%)`,
        mixBlendMode: 'screen',
      }}
    />
  );
};

// ================================================================ PLANET
const PLANET = {cx: 540, cy: 2560, r: 1040};
const Planet: React.FC<Env> = ({s, t}) => {
  const lit = 0.65 + 0.35 * win(s, GAH - 0.2, GAH + 0.8, OUT + 0.3, OUT + 1.4);
  const tileW = 1600;
  const tileH = 400;
  const {cx, cy, r} = PLANET;
  return (
    <>
      {/* halo atmosfera */}
      <div
        style={{
          position: 'absolute', left: cx - r - 140, top: cy - r - 140, width: (r + 140) * 2, height: (r + 140) * 2, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(47,210,255,0) ${(r / (r + 140)) * 100 - 2}%, rgba(47,190,255,${0.55 * lit}) ${(r / (r + 140)) * 100}%, rgba(27,125,255,${0.18 * lit}) ${(r / (r + 140)) * 100 + 5}%, rgba(0,0,0,0) 100%)`,
        }}
      />
      <div style={{position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: '50%', overflow: 'hidden'}}>
        <div
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${staticFile('planet.png')})`,
            backgroundSize: `${tileW}px ${tileH}px`,
            backgroundRepeat: 'repeat-x',
            backgroundPosition: `${-t * tileW}px 0px`,
            filter: `brightness(${0.75 + 0.45 * lit}) saturate(1.15)`,
          }}
        />
        {/* grid latitud sci-fi */}
        <svg width={r * 2} height={r * 2} style={{position: 'absolute', inset: 0, opacity: 0.22 * lit}}>
          {[0.08, 0.16, 0.26, 0.38].map((k, i) => (
            <ellipse key={i} cx={r} cy={r} rx={r * 1.02} ry={r * k} fill="none" stroke={C.cyan} strokeWidth={2} transform={`translate(0 ${-r * 0.84 + r * k})`} />
          ))}
          {[-0.6, -0.3, 0, 0.3, 0.6].map((k, i) => (
            <ellipse key={`m${i}`} cx={r + r * k * 0.0} cy={r} rx={Math.abs(r * Math.sin(frac(k + t * 0.25) * Math.PI))} ry={r} fill="none" stroke={C.cyan} strokeWidth={1.5} />
          ))}
        </svg>
        {/* bayang sfera & cahaya pinggir */}
        <div
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 8%, rgba(0,0,0,0) 30%, rgba(1,6,24,0.55) 60%, rgba(1,4,16,0.92) 80%)',
            boxShadow: `inset 0 22px 50px rgba(150,230,255,${0.75 * lit}), inset 0 4px 10px rgba(220,250,255,${0.9 * lit})`,
          }}
        />
      </div>
    </>
  );
};

const Moon: React.FC<Env> = ({s, t}) => {
  const cx = 170;
  const cy = 1170;
  const r = 70;
  const bob = 8 * Math.sin(TAU * t);
  const ring = (front: boolean) => (
    <svg width={400} height={200} style={{position: 'absolute', left: cx - 200, top: cy - 100 + bob, overflow: 'visible'}}>
      <g transform="rotate(-18 200 100)">
        <path
          d={front ? 'M 50 100 A 150 34 0 0 0 350 100' : 'M 50 100 A 150 34 0 0 1 350 100'}
          fill="none" stroke={C.yellow} strokeWidth={5} opacity={front ? 0.95 : 0.5}
        />
        <path
          d={front ? 'M 30 100 A 170 42 0 0 0 370 100' : 'M 30 100 A 170 42 0 0 1 370 100'}
          fill="none" stroke={C.cyan} strokeWidth={2} opacity={front ? 0.8 : 0.4} strokeDasharray="6 8"
        />
      </g>
    </svg>
  );
  void s;
  return (
    <>
      {ring(false)}
      <div style={{position: 'absolute', left: cx - r, top: cy - r + bob, width: r * 2, height: r * 2, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 30px rgba(47,190,255,0.45)'}}>
        <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${staticFile('planet.png')})`, backgroundSize: '560px 140px', backgroundPosition: `${-t * 560 + 200}px 0px`, filter: 'hue-rotate(-12deg) brightness(1.1)'}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 70% 30%, rgba(0,0,0,0) 35%, rgba(1,5,20,0.85) 75%)', boxShadow: 'inset -6px 6px 14px rgba(160,235,255,0.7)'}} />
      </div>
      {ring(true)}
    </>
  );
};

// ================================================================ ELEMEN POSTER
const Slashes: React.FC<Env> = ({s, t}) => {
  const inn = outExpo((s - GAH) / 0.55);
  const out = ramp(s, OUT, OUT + 0.55);
  const slide = (1 - inn) * 1400 + out * 1400; // px sepanjang arah jalur
  if (inn <= 0.001 || out >= 0.999) return null;
  const sweep = -1.2 + frac(t * 2) * 3.4;
  const bands = (cx: number, cy: number, flip: boolean, key: string) => {
    const sg = flip ? -1 : 1;
    return (
      <g key={key} transform={`translate(${cx},${cy}) rotate(-56) translate(${-sg * slide},0)`}>
        {[-170, -128, -96, 118, 150, 196].map((o, i) => (
          <g key={i}>
            <rect x={-900} y={sg * o - 9} width={1800} height={18} fill={C.blue} opacity={0.22} />
            <rect x={-900} y={sg * o - 2.5} width={1800} height={5} fill="url(#gSweepBlue)" />
          </g>
        ))}
        <rect x={-900} y={sg * 40 - 70} width={1800} height={60} fill="#1d64e0" opacity={0.25} />
        <rect x={-150} y={sg * 20 - 60} width={430} height={120} fill="url(#gYellow)" />
        <rect x={-150} y={sg * 20 - 60} width={430} height={120} fill="url(#gSweepWhite)" opacity={0.8} />
        <rect x={-150} y={sg * 20 - 60} width={430} height={6} fill="#fff6c2" opacity={0.9} />
        <rect x={-760} y={sg * 30 - 70} width={360} height={140} fill="url(#gYellow)" />
        <rect x={-760} y={sg * 30 - 70} width={360} height={140} fill="url(#gSweepWhite)" opacity={0.8} />
      </g>
    );
  };
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="gYellow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffc400" />
          <stop offset="0.5" stopColor={C.yellow} />
          <stop offset="1" stopColor="#ffe55e" />
        </linearGradient>
        <linearGradient id="gSweepBlue" x1="0" y1="0" x2="1" y2="0" gradientTransform={`translate(${sweep - 1} 0)`}>
          <stop offset="0" stopColor={C.blue} stopOpacity={0.55} />
          <stop offset="0.45" stopColor={C.cyan} stopOpacity={0.9} />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity={1} />
          <stop offset="0.55" stopColor={C.cyan} stopOpacity={0.9} />
          <stop offset="1" stopColor={C.blue} stopOpacity={0.55} />
        </linearGradient>
        <linearGradient id="gSweepWhite" x1="0" y1="0" x2="1" y2="0" gradientTransform={`translate(${sweep - 1} 0)`}>
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

const Circuits: React.FC<Env> = ({s, t}) => {
  const list = L.circuits as Circuit[];
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {list.map((c, i) => {
        const st = 1.15 + (i % 7) * 0.09 + Math.floor(i / 7) * 0.05;
        const grow = outCubic((s - st) / 0.75); // lukis dari tepi skrin
        const shrink = ramp(s, OUT + 0.15 + (i % 5) * 0.06, OUT + 0.85 + (i % 5) * 0.06);
        const vis = grow * (1 - shrink);
        if (vis <= 0.001) return null;
        const d = c.p.map((p, j) => `${j ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
        const end = c.p[c.p.length - 1];
        const color = col(c.c);
        const head = frac(t * c.laps * 2 + c.ph);
        const off = c.pl - head * (1 + c.pl);
        const tw = 0.55 + 0.45 * wave(t, c.dh, c.dp);
        const dotIn = outBack((s - st - 0.6) / 0.3) * (1 - shrink);
        return (
          <g key={i}>
            <path d={d} pathLength={1} strokeDasharray={`${vis} 2`} stroke={color} strokeWidth={c.w * 4} opacity={0.12} fill="none" strokeLinejoin="round" />
            <path d={d} pathLength={1} strokeDasharray={`${vis} 2`} stroke={color} strokeWidth={c.w} opacity={0.8} fill="none" strokeLinejoin="round" />
            {vis >= 0.999 && (
              <path d={d} pathLength={1} stroke="#ffffff" strokeWidth={c.w * 1.6} strokeLinecap="round" fill="none" strokeDasharray={`${c.pl} 3`} strokeDashoffset={off} style={{filter: `drop-shadow(0 0 6px ${color})`}} />
            )}
            {dotIn > 0.01 && (
              <g transform={`translate(${end[0]} ${end[1]}) scale(${Math.max(0, dotIn)})`}>
                <circle r={c.dot * 2.4} fill={color} opacity={0.18 * tw} />
                <circle r={c.dot} fill={color} opacity={0.6 + 0.4 * tw} />
                <circle r={c.dot * 0.45} fill="#fff" opacity={0.7 * tw} />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};

const Tiles: React.FC<Env> = ({s, t}) => {
  const env = win(s, 1.6, 2.6, OUT + 0.2, OUT + 0.9);
  if (env <= 0.001) return null;
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: env}}>
      {L.pixels.map((p, i) => {
        const pop = ramp(s, 1.6 + (i % 9) * 0.07, 1.8 + (i % 9) * 0.07);
        return <rect key={i} x={p.x} y={p.y} width={p.s} height={p.s} rx={2} fill="#2a78ff" opacity={pop * p.a * (0.45 + 0.55 * wave(t, p.h * 2, p.ph))} />;
      })}
      {L.dots.map((d, i) => (
        <circle key={`d${i}`} cx={d.x} cy={d.y} r={d.r} fill={C.cyan} opacity={0.3 + 0.6 * wave(t, d.h * 2, d.ph)} />
      ))}
    </svg>
  );
};

const Particles: React.FC<Env> = ({s, t}) => {
  const env = 0.35 + 0.65 * win(s, GAH - 0.2, GAH + 0.6, OUT + 0.3, OUT + 1.2);
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: env}}>
      {L.particles.map((p, i) => {
        const y = (((p.y - t * p.laps * (H + 40)) % (H + 40)) + (H + 40)) % (H + 40) - 20;
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
};

const MeshWave: React.FC<Env> = ({s, t}) => {
  const env = win(s, GAH, GAH + 1.0, OUT + 0.2, OUT + 1.0);
  if (env <= 0.001) return null;
  const w = L.wave;
  const rows: string[] = [];
  const dots: React.ReactNode[] = [];
  for (let r = 0; r < w.rows; r++) {
    const z = r / (w.rows - 1);
    const pts: string[] = [];
    for (let c = 0; c <= w.cols; c++) {
      const u = c / w.cols;
      const x = -60 + u * (W + 120);
      let y = w.y - 90 - w.depth * (1 - z) + 72 * (0.5 - u);
      for (const k of w.comps) {
        y += k.a * (0.55 + 0.45 * z) * Math.sin((k.k / 10000) * (x + r * 38) - TAU * k.m * t + k.ph);
      }
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      if (c % 2 === r % 2) dots.push(<circle key={`${r}-${c}`} cx={x} cy={y} r={1.2 + 1.6 * z} fill="#9fe9ff" opacity={0.25 + 0.6 * z} />);
    }
    rows.push(pts.join(' '));
  }
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: env * 0.85, clipPath: `inset(0 ${(1 - outCubic((s - GAH) / 1.2)) * 100}% 0 0)`}}>
      {rows.map((p, i) => {
        const z = i / (rows.length - 1);
        const hero = i === 4 || i === 9 || i === rows.length - 1;
        return (
          <g key={i}>
            {hero && <polyline points={p} stroke={C.cyan} strokeWidth={10} opacity={0.18} fill="none" />}
            <polyline points={p} stroke={C.cyan} strokeWidth={hero ? 2.6 : 1} opacity={hero ? 0.9 : 0.2 + 0.3 * z} fill="none" />
          </g>
        );
      })}
      {dots}
    </svg>
  );
};

// ================================================================ CINCIN HUD
const arc = (r: number, a0: number, a1: number) => {
  const p = (a: number) => [CX + r * Math.cos((a * Math.PI) / 180), CY + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M${x0},${y0} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} 1 ${x1},${y1}`;
};
const Spin: React.FC<{deg: number; children: React.ReactNode}> = ({deg, children}) => <g transform={`rotate(${deg} ${CX} ${CY})`}>{children}</g>;

const HudRing: React.FC<Env> = ({s, t}) => {
  const draw = outCubic((s - 1.0) / 1.4); // lukis
  const pop = decay(s, GAH, 5); // denyut pada detik gah
  const out = ramp(s, OUT + 0.4, OUT + 1.0);
  const vis = draw * (1 - out);
  if (vis <= 0.001) return null;
  const scale = (0.75 + 0.25 * outCubic((s - 1.0) / 1.6)) * (1 + 0.08 * pop) * (1 - 0.35 * out);
  // putaran: laju tambahan semasa masuk, kemudian 1 pusingan/gelung (lancar)
  const spinBoost = 220 * (1 - outCubic((s - 1.0) / 2.6));
  const r1 = 360 * t + spinBoost;
  const r2 = -360 * t - spinBoost;
  const r3 = 180 * t;
  const glow = 0.75 + 0.25 * wave(t, 3) + 0.6 * pop;
  const dash = (k: number) => ({pathLength: 1, strokeDasharray: `${clamp(vis * 1.2 - k * 0.15)} 2`});
  return (
    <svg
      width={W}
      height={H}
      style={{position: 'absolute', inset: 0, opacity: Math.min(1, vis * 1.5), transform: `scale(${scale})`, transformOrigin: `${CX}px ${CY}px`, filter: `drop-shadow(0 0 ${12 * glow}px rgba(47,210,255,0.85))`}}
    >
      <defs>
        <radialGradient id="gCore">
          <stop offset="0" stopColor="#2a8cff" stopOpacity={0.35} />
          <stop offset="1" stopColor="#0a3fb8" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={CX} cy={CY} r={200} fill="url(#gCore)" opacity={vis} />
      <Spin deg={-90}>
        <circle cx={CX} cy={CY} r={300} stroke={C.blue} strokeWidth={5} fill="none" opacity={0.85} {...dash(0)} />
        <circle cx={CX} cy={CY} r={300} stroke={C.cyan} strokeWidth={1.5} fill="none" {...dash(0)} />
        <circle cx={CX} cy={CY} r={228} stroke={C.blue} strokeWidth={3} fill="none" opacity={0.55} {...dash(1)} />
      </Spin>
      <Spin deg={r1}>
        <path d={arc(330, -100, -35)} stroke={C.cyan} strokeWidth={22} fill="none" {...dash(1)} />
        <path d={arc(330, -100, -35)} stroke="#e8fbff" strokeWidth={5} fill="none" opacity={0.8} {...dash(1)} />
        <path d={arc(330, 105, 150)} stroke={C.cyan} strokeWidth={14} fill="none" opacity={0.9} {...dash(2)} />
        <path d={arc(330, 20, 48)} stroke={C.yellow} strokeWidth={16} fill="none" {...dash(2)} />
        <path d={arc(330, 196, 222)} stroke={C.yellow} strokeWidth={16} fill="none" {...dash(3)} />
        <path d={arc(330, -28, -8)} stroke={C.blue} strokeWidth={10} fill="none" {...dash(3)} />
      </Spin>
      <Spin deg={r2}>
        <path d={arc(372, 200, 300)} stroke={C.cyan} strokeWidth={4} strokeDasharray="3 9" fill="none" opacity={vis} />
        <path d={arc(372, 20, 120)} stroke={C.yellow} strokeWidth={4} strokeDasharray="3 9" fill="none" opacity={0.85 * vis} />
        <path d={arc(352, 150, 178)} stroke={C.yellow} strokeWidth={12} fill="none" {...dash(2)} />
        <path d={arc(352, -30, -2)} stroke={C.yellow} strokeWidth={12} fill="none" {...dash(2)} />
        <path d={arc(395, 240, 262)} stroke={C.cyan} strokeWidth={3} fill="none" opacity={0.7} {...dash(3)} />
        <path d={arc(395, 60, 82)} stroke={C.cyan} strokeWidth={3} fill="none" opacity={0.7} {...dash(3)} />
      </Spin>
      <Spin deg={r3}>
        {(L.ticks as [number, boolean][]).map(([a, long], i) => {
          if (i / L.ticks.length > vis * 1.1) return null;
          const rad = (a * Math.PI) / 180;
          const ro = long ? 278 : 266;
          return (
            <line key={i} x1={CX + 252 * Math.cos(rad)} y1={CY + 252 * Math.sin(rad)} x2={CX + ro * Math.cos(rad)} y2={CY + ro * Math.sin(rad)} stroke={C.cyan} strokeWidth={long ? 3 : 1.6} opacity={long ? 0.9 : 0.55} />
          );
        })}
      </Spin>
      <Spin deg={-r3 * 2}>
        <path d={arc(214, -60, 60)} stroke={C.cyan} strokeWidth={6} fill="none" opacity={0.6} {...dash(2)} />
        <path d={arc(214, 120, 240)} stroke={C.cyan} strokeWidth={6} fill="none" opacity={0.6} {...dash(2)} />
      </Spin>
    </svg>
  );
};

// ================================================================ DETIK GAH
const Rays: React.FC<Env> = ({s, t}) => {
  const env = win(s, GAH - 0.1, GAH + 0.25, OUT, OUT + 0.8);
  const burst = decay(s, GAH, 2.2);
  if (env <= 0.001) return null;
  const size = 2400;
  return (
    <div
      style={{
        position: 'absolute', left: CX - size / 2, top: CY - size / 2, width: size, height: size, borderRadius: '50%',
        background: `repeating-conic-gradient(from ${120 * t}deg at 50% 50%, rgba(140,220,255,0.0) 0deg, rgba(140,220,255,${0.22 + 0.5 * burst}) 3deg, rgba(140,220,255,0) 8deg, rgba(0,0,0,0) 20deg)`,
        WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 8%, rgba(0,0,0,0.5) 25%, rgba(0,0,0,0) 48%)',
        maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 8%, rgba(0,0,0,0.5) 25%, rgba(0,0,0,0) 48%)',
        opacity: env * (0.55 + 0.25 * wave(t, 2)),
        mixBlendMode: 'screen',
      }}
    />
  );
};

const Shockwaves: React.FC<Env> = ({s}) => {
  const rings: React.ReactNode[] = [];
  const add = (at: number, maxR: number, dur: number, color: string, wdt: number, key: string) => {
    const p = (s - at) / dur;
    if (p < 0 || p > 1) return;
    const e = outExpo(p);
    rings.push(<ellipse key={key} cx={CX} cy={CY} rx={maxR * e} ry={maxR * e * 0.92} fill="none" stroke={color} strokeWidth={wdt * (1 - p) + 1} opacity={1 - p} />);
  };
  add(GAH, 1300, 1.1, '#e9fbff', 14, 'g1');
  add(GAH + 0.08, 900, 1.0, C.yellow, 8, 'g2');
  add(GAH + 0.16, 600, 0.9, C.cyan, 6, 'g3');
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 0 14px rgba(47,210,255,0.9))'}}>
      {rings}
    </svg>
  );
};

const Flare: React.FC<Env> = ({s, t}) => {
  const grow = outExpo((s - GAH) / 0.6);
  const out = ramp(s, OUT + 0.2, OUT + 0.8);
  const env = grow * (1 - out);
  if (env <= 0.001) return null;
  const p = (0.7 + 0.3 * wave(t, 3, 0.25)) * env + 0.8 * decay(s, GAH, 3);
  const run = frac(t * 3);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: CY + 44, height: 4, transform: `scaleX(${env})`,
          background: 'linear-gradient(90deg, rgba(255,210,31,0.95) 0%, rgba(255,210,31,0.3) 22%, rgba(255,210,31,0.05) 40%, rgba(255,210,31,0.05) 60%, rgba(255,210,31,0.3) 78%, rgba(255,210,31,0.95) 100%)',
          boxShadow: '0 0 18px 4px rgba(255,190,20,0.55)',
        }}
      />
      {[run, 1 - run].map((r, i) => (
        <div key={i} style={{position: 'absolute', top: CY + 38, height: 16, width: 140, left: r * (W + 200) - 170, opacity: env, background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(255,215,60,0.6) 35%, rgba(255,200,0,0) 70%)'}} />
      ))}
      <div
        style={{
          position: 'absolute', left: CX - 460, width: 920, top: CY + 120, height: 76, mixBlendMode: 'screen',
          background: `radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,255,255,${clamp(p)}) 0%, rgba(255,222,90,${0.9 * clamp(p)}) 22%, rgba(255,175,0,${0.4 * clamp(p)}) 48%, rgba(255,170,0,0) 75%)`,
        }}
      />
      <div style={{position: 'absolute', left: CX - 520, width: 1040, top: CY + 155, height: 6, transform: `scaleX(${env})`, background: `linear-gradient(90deg, rgba(255,200,0,0), rgba(255,240,180,${clamp(p)}) 50%, rgba(255,200,0,0))`, filter: 'blur(1px)'}} />
    </AbsoluteFill>
  );
};

// ================================================================ HURUF HAKS
const LETTERS = ['H', 'A', 'K', 'S'];
// arah terbang masuk: [dx, dy, putaran, skala mula]
const FROM: [number, number, number, number][] = [
  [-1000, -260, -28, 2.0],
  [120, -1250, 18, 3.2],
  [-120, 1250, -18, 3.2],
  [1000, 260, 28, 2.0],
];

const LetterGlyph: React.FC<{ch: string; glow: number; shine: number; flash: number; ghost?: boolean}> = ({ch, glow, shine, flash, ghost}) => {
  const base: React.CSSProperties = {position: 'absolute', left: 0, top: 0, fontFamily: FONT, fontStyle: 'italic', fontWeight: 900, fontSize: 318, lineHeight: '320px', whiteSpace: 'nowrap'};
  if (ghost) return <span style={{...base, color: 'rgba(80,200,255,0.9)', filter: 'blur(6px)'}}>{ch}</span>;
  const extrude = Array.from({length: 20}, (_, i) => `${(i + 1) * 0.9}px ${(i + 1) * 1.15}px 0 ${i < 2 ? '#6cc4ff' : i < 8 ? '#1a5ee0' : i < 14 ? '#0e3a9e' : '#082670'}`).join(',');
  const sx = -40 + shine * 180;
  return (
    <>
      <span style={{...base, color: 'transparent', WebkitTextStroke: '26px rgba(47,160,255,0.55)', filter: `blur(${16 + 8 * glow}px)`}}>{ch}</span>
      <span style={{...base, color: '#1556d6', textShadow: `${extrude}, 0 22px 36px rgba(0,10,40,0.7)`}}>{ch}</span>
      <span style={{...base, color: 'transparent', WebkitTextStroke: '9px #3fc6ff', filter: `drop-shadow(0 0 ${10 * glow}px ${C.cyan})`}}>{ch}</span>
      <span
        style={{
          ...base,
          backgroundImage: 'linear-gradient(180deg, #ffffff 0%, #f5f8ff 28%, #cad7ee 46%, #7f98c4 50%, #f8fbff 53%, #dce6f6 70%, #9fb2d4 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
        }}
      >
        {ch}
      </span>
      {shine > 0 && shine < 1 && (
        <span
          style={{
            ...base,
            backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0) ${sx - 14}%, rgba(255,255,255,0.95) ${sx}%, rgba(160,230,255,0.6) ${sx + 5}%, rgba(255,255,255,0) ${sx + 16}%)`,
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          }}
        >
          {ch}
        </span>
      )}
      {flash > 0.01 && <span style={{...base, color: `rgba(255,255,255,${flash})`, textShadow: `0 0 ${40 * flash}px rgba(160,230,255,${flash})`}}>{ch}</span>}
    </>
  );
};

const Sparks: React.FC<{i: number; s: number}> = ({i, s}) => {
  const dt = s - LAND[i];
  if (dt < 0 || dt > 1) return null;
  const list = (L.sparks as Spark[][])[i];
  return (
    <svg width={10} height={10} style={{position: 'absolute', left: '50%', top: '50%', overflow: 'visible'}}>
      {list.map((p, k) => {
        if (dt > p.life) return null;
        const q = dt / p.life;
        const x = p.vx * dt * (1 - 0.45 * q);
        const y = p.vy * dt * (1 - 0.45 * q) + 260 * dt * dt;
        const c = p.y ? C.yellow : '#bff2ff';
        return <line key={k} x1={x} y1={y} x2={x - p.vx * 0.04} y2={y - p.vy * 0.04} stroke={c} strokeWidth={p.r} strokeLinecap="round" opacity={1 - q} />;
      })}
      {dt < 0.5 && (
        <ellipse cx={0} cy={0} rx={60 + 340 * outExpo(dt / 0.5)} ry={(60 + 340 * outExpo(dt / 0.5)) * 0.45} fill="none" stroke="#bff2ff" strokeWidth={8 * (1 - dt / 0.5) + 1} opacity={1 - dt / 0.5} style={{filter: 'drop-shadow(0 0 10px #2fd2ff)'}} />
      )}
    </svg>
  );
};

const letterState = (i: number, s: number) => {
  const land = LAND[i];
  const [dx, dy, rot, sc] = FROM[i];
  // masuk
  const pIn = (s - (land - FLY)) / FLY;
  // keluar: terbang ke arah kamera
  const outStart = OUT + 0.1 + i * 0.12;
  const pOut = (s - outStart) / 0.55;
  if (pIn <= 0 || pOut >= 1) return null;
  if (pIn < 1) {
    const e = outCubic(pIn);
    const k = 1 - e;
    return {x: dx * k, y: dy * k, rot: rot * k, scale: 1 + (sc - 1) * k * k, blur: 16 * k, opacity: clamp(pIn * 4), flying: true};
  }
  const imp = decay(s, land, 7);
  if (pOut > 0) {
    const e = Math.pow(clamp(pOut), 2);
    const dir = i < 2 ? -1 : 1;
    return {x: dir * 260 * e * (i % 3 === 0 ? 1.6 : 0.6), y: -60 * e, rot: dir * 10 * e, scale: 1 + 4.5 * e, blur: 18 * e, opacity: 1 - clamp(pOut * 1.2), flying: false};
  }
  return {x: 0, y: -14 * imp * Math.sin((s - land) * 30), rot: 0, scale: 1 + 0.1 * imp * Math.cos((s - land) * 22), blur: 0, opacity: 1, flying: false};
};

const Logo: React.FC<Env> = ({s, t}) => {
  const bob = 6 * Math.sin(TAU * t);
  const glow = 0.7 + 0.3 * wave(t, 3) + 0.8 * decay(s, GAH, 3);
  const shine = SHINES.map((a) => (s - a) / 0.8).find((p) => p > 0 && p < 1) ?? 0;
  const gahFlash = decay(s, GAH, 4.5);
  return (
    <div
      style={{
        position: 'absolute', left: 0, width: W, top: CY - 175, height: 320, display: 'flex', justifyContent: 'center',
        transform: `translateY(${bob}px) skewX(-4deg) scaleX(1.04)`,
      }}
    >
      {LETTERS.map((ch, i) => {
        const st = letterState(i, s);
        const hidden = <span key={i} style={{display: 'inline-block', position: 'relative', marginRight: -4, fontFamily: FONT, fontStyle: 'italic', fontWeight: 900, fontSize: 318, lineHeight: '320px', visibility: 'hidden'}}>{ch}</span>;
        if (!st) return hidden;
        const flash = Math.max(decay(s, LAND[i], 6) * (s >= LAND[i] ? 1 : 0), gahFlash * 0.8);
        // jejak cahaya semasa terbang
        const ghosts = st.flying
          ? [1, 2, 3, 4].map((g) => {
              const back = letterState(i, s - g * 0.035);
              if (!back) return null;
              return (
                <span key={g} style={{position: 'absolute', left: 0, top: 0, opacity: 0.4 / g, transform: `translate(${back.x - st.x}px, ${back.y - st.y}px) scale(${back.scale / st.scale})`}}>
                  <LetterGlyph ch={ch} glow={0} shine={0} flash={0} ghost />
                </span>
              );
            })
          : null;
        return (
          <span key={i} style={{display: 'inline-block', position: 'relative', marginRight: -4}}>
            <span style={{fontFamily: FONT, fontStyle: 'italic', fontWeight: 900, fontSize: 318, lineHeight: '320px', visibility: 'hidden'}}>{ch}</span>
            <span
              style={{
                position: 'absolute', inset: 0,
                transform: `translate(${st.x}px, ${st.y}px) rotate(${st.rot}deg) scale(${st.scale})`,
                filter: st.blur > 0.3 ? `blur(${st.blur}px)` : undefined,
                opacity: st.opacity,
              }}
            >
              {ghosts}
              <LetterGlyph ch={ch} glow={glow} shine={clamp(shine)} flash={flash} />
            </span>
            <Sparks i={i} s={s} />
          </span>
        );
      })}
    </div>
  );
};

// ================================================================ KOMPOSISI
const shake = (s: number) => {
  let x = 0;
  let y = 0;
  LAND.forEach((l, i) => {
    const d = decay(s, l, 9) * (8 + i * 2);
    x += d * Math.sin((s - l) * 71 + i);
    y += d * Math.cos((s - l) * 63 + i);
  });
  const g = decay(s, GAH, 5) * 22;
  x += g * Math.sin((s - GAH) * 57);
  y += g * Math.cos((s - GAH) * 49);
  return [x, y];
};

export const HaksGah: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame % GAH_FRAMES;
  const s = f / GAH_FPS;
  const t = f / GAH_FRAMES;
  const [handle] = useState(() => delayRender('Muat fon Exo 2'));
  useEffect(() => {
    document.fonts.load(`italic 900 318px ${FONT}`).then(() => document.fonts.ready).then(() => continueRender(handle));
  }, [handle]);
  const env: Env = {s, t};
  const [sx, sy] = shake(s);
  const zoom = 1 + 0.03 * (1 - Math.cos(TAU * t)) / 2 + 0.03 * decay(s, GAH, 3);
  const whiteFlash = 0.7 * decay(s, GAH, 11) * (s >= GAH ? 1 : 0);
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#01030b'}}>
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(${zoom})`}}>
        <Space {...env} />
        <Stars {...env} />
        <Planet {...env} />
        <Moon {...env} />
        <Warp {...env} />
        <Tiles {...env} />
        <Circuits {...env} />
        <MeshWave {...env} />
        <Particles {...env} />
        <Rays {...env} />
        <HudRing {...env} />
        <Core {...env} />
        <Shockwaves {...env} />
        <Flare {...env} />
        <Logo {...env} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 60% at 50% 46%, rgba(0,0,0,0) 55%, rgba(1,4,18,0.55) 100%)'}} />
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(${zoom})`}}>
        <Slashes {...env} />
      </AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: '#eaf8ff', opacity: whiteFlash, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};
