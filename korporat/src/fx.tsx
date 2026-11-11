// Elemen grafik digital: HUD, glitch, tag bab, lower-third, rangkaian titik.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import {FPS, H, SEGS, W} from './data';

export const C = {
  cyan: '#38e8ff',
  biru: '#2a7bff',
  ungu: '#b04cff',
  emas: '#ffcf4a',
  putih: '#eaf6ff',
};
export const MONO = "'JetBrains Mono', monospace";
export const ORB = "'Orbitron', sans-serif";
export const SANS = "'Montserrat', sans-serif";

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const typed = (txt: string, frame: number, cps = 32) => {
  const n = Math.max(0, Math.floor((frame / FPS) * cps));
  return txt.slice(0, n) + (n < txt.length && frame % 8 < 5 ? '▌' : '');
};

const tc = (frame: number) => {
  const s = Math.floor(frame / FPS);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 60))}:${p(s % 60)}:${p(frame % FPS)}`;
};

// ---------- HUD global (halus, di tepi skrin) ----------
const SEMBUNYI_HUD = new Set(['bio', 'statistik', 'emas', 'tutup']);
export const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const s = SEGS.find((x) => frame >= x.f0 && frame < x.f0 + x.fd);
  const hidden = !s || SEMBUNYI_HUD.has(s.kind);
  // pudar masuk/keluar sekitar babak yang disembunyikan
  let op = 1;
  for (const x of SEGS) {
    if (!SEMBUNYI_HUD.has(x.kind)) continue;
    const a = interpolate(frame, [x.f0 - 8, x.f0, x.f0 + x.fd, x.f0 + x.fd + 10], [1, 0, 0, 1], clamp);
    op = Math.min(op, a);
  }
  if (hidden && op <= 0) return null;
  const blink = frame % 30 < 18;
  const br = (style: React.CSSProperties) => (
    <div style={{position: 'absolute', width: 46, height: 46, borderColor: C.cyan, borderStyle: 'solid', borderWidth: 0, opacity: 0.75, ...style}} />
  );
  const lbl: React.CSSProperties = {position: 'absolute', fontFamily: MONO, fontSize: 17, color: C.putih, letterSpacing: 2, textShadow: '0 0 8px rgba(56,232,255,.8)'};
  return (
    <AbsoluteFill style={{opacity: op * 0.85, pointerEvents: 'none'}}>
      {br({left: 26, top: 26, borderLeftWidth: 3, borderTopWidth: 3})}
      {br({right: 26, top: 26, borderRightWidth: 3, borderTopWidth: 3})}
      {br({left: 26, bottom: 26, borderLeftWidth: 3, borderBottomWidth: 3})}
      {br({right: 26, bottom: 26, borderRightWidth: 3, borderBottomWidth: 3})}
      <div style={{...lbl, left: 86, bottom: 34}}>
        <span style={{color: '#ff3b5c', opacity: blink ? 1 : 0.2}}>●</span> SKeSO://DIGITAL&nbsp;&nbsp;{tc(frame)}
      </div>
      <div style={{...lbl, right: 86, bottom: 34, opacity: 0.8}}>4.76°N 103.42°E · DUNGUN</div>
    </AbsoluteFill>
  );
};

// ---------- Lapisan imbasan & vignet ----------
export const Grade: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background:
        'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,8,20,.55) 100%), repeating-linear-gradient(0deg, rgba(255,255,255,.035) 0px, rgba(255,255,255,.035) 1px, transparent 1px, transparent 4px)',
    }}
  />
);

// ---------- Glitch pada setiap potongan ----------
export const CUTS = SEGS.slice(1).map((s) => s.f0);
export const glitchAmt = (frame: number) => {
  let g = 0;
  for (const c of CUTS) {
    const d = frame - c;
    if (d >= -3 && d < 7) g = Math.max(g, d < 0 ? (d + 4) / 4 : 1 - d / 7);
  }
  return g;
};
export const GlitchOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const g = glitchAmt(frame);
  if (g <= 0) return null;
  const bars = Array.from({length: 9}, (_, i) => {
    const y = random(`y${frame}-${i}`) * H;
    const h = 4 + random(`h${frame}-${i}`) * 60;
    const x = (random(`x${frame}-${i}`) - 0.5) * 200 * g;
    const col = i % 3 === 0 ? C.cyan : i % 3 === 1 ? C.ungu : '#ffffff';
    return <div key={i} style={{position: 'absolute', left: x, top: y, width: W, height: h, background: col, opacity: 0.25 * g, mixBlendMode: 'screen'}} />;
  });
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {bars}
      <AbsoluteFill style={{background: C.cyan, opacity: 0.12 * g, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

// ---------- Tag bab (atas kiri) ----------
export const BabTag: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const len = 4.2 * FPS;
  const op = interpolate(frame, [6, 14, len - 12, len], [0, 1, 1, 0], clamp);
  if (frame > len) return null;
  const w = interpolate(frame, [6, 26], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const [no, ...rest] = text.split(' // ');
  return (
    <div style={{position: 'absolute', left: 86, top: 150, opacity: op, display: 'flex', alignItems: 'center', gap: 18}}>
      <div style={{fontFamily: ORB, fontWeight: 900, fontSize: 30, color: '#001018', background: C.cyan, padding: '6px 14px', boxShadow: `0 0 24px ${C.cyan}`}}>{no}</div>
      <div style={{overflow: 'hidden', width: 820 * w}}>
        <div style={{fontFamily: ORB, fontWeight: 700, fontSize: 30, color: C.putih, letterSpacing: 4, whiteSpace: 'nowrap', textShadow: '0 0 14px rgba(56,232,255,.9), 0 2px 6px #000', padding: '6px 18px', background: 'linear-gradient(90deg, rgba(0,20,40,.8), rgba(0,20,40,0))', borderLeft: `3px solid ${C.cyan}`}}>
          {typed(rest.join(' // '), frame - 10, 40)}
        </div>
      </div>
    </div>
  );
};

// ---------- Lower-third label digital ----------
export const Label: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const len = 5 * FPS;
  if (frame > len) return null;
  const op = interpolate(frame, [8, 16, len - 12, len], [0, 1, 1, 0], clamp);
  const x = interpolate(frame, [8, 24], [-40, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{position: 'absolute', right: 86, top: 150, opacity: op, transform: `translateX(${-x}px)`}}>
      <div style={{fontFamily: MONO, fontSize: 18, color: C.cyan, letterSpacing: 3, textAlign: 'right'}}>// MODUL AKTIF</div>
      <div style={{fontFamily: ORB, fontWeight: 900, fontSize: 38, color: C.putih, letterSpacing: 3, textShadow: '0 0 18px rgba(56,232,255,.9), 0 3px 8px #000', padding: '6px 18px', background: 'linear-gradient(270deg, rgba(0,20,40,.85), rgba(0,20,40,0))', borderRight: `4px solid ${C.cyan}`}}>
        {typed(text, frame - 12, 45)}
      </div>
    </div>
  );
};

// ---------- Rangkaian titik bercahaya (latar) ----------
export const Network: React.FC<{n?: number; color?: string; op?: number; seed?: string}> = ({n = 46, color = C.cyan, op = 0.7, seed = 'net'}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const pts = Array.from({length: n}, (_, i) => {
    const bx = random(`${seed}x${i}`) * W;
    const by = random(`${seed}y${i}`) * H;
    const sp = 0.2 + random(`${seed}s${i}`) * 0.5;
    const ph = random(`${seed}p${i}`) * 6.28;
    return [bx + Math.sin(t * sp + ph) * 60, by + Math.cos(t * sp * 0.8 + ph) * 45] as const;
  });
  const lines: React.ReactNode[] = [];
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
      if (d < 260) lines.push(<line key={`${i}-${j}`} x1={pts[i][0]} y1={pts[i][1]} x2={pts[j][0]} y2={pts[j][1]} stroke={color} strokeWidth={1.2} opacity={(1 - d / 260) * 0.6} />);
    }
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: op}}>
      {lines}
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={2.6} fill={color} style={{filter: `drop-shadow(0 0 6px ${color})`}} />
      ))}
    </svg>
  );
};

export const Particles: React.FC<{n?: number; color?: string; seed?: string; rise?: number}> = ({n = 70, color = C.emas, seed = 'pt', rise = 90}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: n}, (_, i) => {
        const x = random(`${seed}x${i}`) * W + Math.sin(t + i) * 20;
        const y = (((random(`${seed}y${i}`) * H - t * rise * (0.5 + random(`${seed}v${i}`))) % H) + H) % H;
        const r = 1.5 + random(`${seed}r${i}`) * 3.5;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i));
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%', background: color, opacity: tw, boxShadow: `0 0 ${r * 4}px ${color}`}} />;
      })}
    </AbsoluteFill>
  );
};
