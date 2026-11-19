import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {ci} from './components';
import {H, W} from './data';

export const MONO = "'JetBrains Mono', monospace";
export const ORB = "'Orbitron', sans-serif";
export const CYAN = '#62e6ff';
export const CYAN_DIM = 'rgba(98,230,255,0.35)';
export const RED = '#ff4d5e';

export const Scanlines: React.FC<{opacity?: number}> = ({opacity = 0.35}) => (
  <AbsoluteFill
    style={{
      background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 2px, transparent 4px)',
      opacity,
      pointerEvents: 'none',
    }}
  />
);

export const HexGrid: React.FC<{opacity?: number}> = ({opacity = 0.2}) => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity}}>
      <svg width={W} height={H}>
        <defs>
          <pattern id="hex" width="56" height="97" patternUnits="userSpaceOnUse" patternTransform={`translate(0 ${(fr * 0.4) % 97})`}>
            <path d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z M28 64 L28 97" fill="none" stroke={CYAN} strokeWidth="1" />
          </pattern>
          <radialGradient id="hexfade" cx="50%" cy="50%" r="60%">
            <stop offset="0" stopColor="#fff" stopOpacity="1" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="hexmask">
            <rect width={W} height={H} fill="url(#hexfade)" />
          </mask>
        </defs>
        <rect width={W} height={H} fill="url(#hex)" mask="url(#hexmask)" />
      </svg>
    </AbsoluteFill>
  );
};

// Gelang HUD berputar; p = 0..1 kemajuan "dilukis"
export const HudRings: React.FC<{cx: number; cy: number; r: number; p: number; color?: string}> = ({cx, cy, r, p, color = CYAN}) => {
  const fr = useCurrentFrame();
  const C = (rr: number) => 2 * Math.PI * rr;
  const ring = (rr: number, w: number, dash: string, rot: number, op = 1) => (
    <circle cx={cx} cy={cy} r={rr} fill="none" stroke={color} strokeWidth={w} strokeDasharray={dash} opacity={op * p} transform={`rotate(${rot} ${cx} ${cy})`} />
  );
  const ticks = Array.from({length: 72}).map((_, i) => {
    const a = (i / 72) * Math.PI * 2;
    const r0 = r * 1.18;
    const r1 = r0 + (i % 6 === 0 ? 18 : 8);
    return (
      <line key={i} x1={cx + Math.cos(a) * r0} y1={cy + Math.sin(a) * r0} x2={cx + Math.cos(a) * r1} y2={cy + Math.sin(a) * r1} stroke={color} strokeWidth={i % 6 === 0 ? 2 : 1} opacity={p * (i / 72 < p ? 0.8 : 0)} />
    );
  });
  return (
    <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, filter: `drop-shadow(0 0 8px ${color})`}}>
      {ring(r, 3, `${C(r) * p} ${C(r)}`, -90)}
      {ring(r * 0.86, 1.5, '6 10', fr * 0.6, 0.7)}
      {ring(r * 0.7, 8, `${C(r * 0.7) * 0.18} ${C(r * 0.7) * 0.07}`, -fr * 0.9, 0.45)}
      {ring(r * 1.08, 1, `${C(r * 1.08) * 0.3} ${C(r * 1.08) * 0.2}`, fr * 0.35, 0.8)}
      {ticks}
    </svg>
  );
};

export const RadarSweep: React.FC<{cx: number; cy: number; r: number; opacity?: number; color?: string}> = ({cx, cy, r, opacity = 1, color = '98,230,255'}) => {
  const fr = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - r,
        top: cy - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        opacity,
        background: `conic-gradient(from ${fr * 6}deg, rgba(${color},0.55) 0deg, rgba(${color},0) 70deg, rgba(${color},0) 360deg)`,
      }}
    />
  );
};

// Teks glitch: pemisahan RGB + gegaran rawak; intensity 0..1
export const GlitchText: React.FC<{
  children: string;
  size: number;
  font?: string;
  color?: string;
  intensity?: number;
  weight?: number;
  spacing?: number;
  seed?: string;
  style?: React.CSSProperties;
}> = ({children, size, font = ORB, color = CYAN, intensity = 0.3, weight = 900, spacing = 4, seed = 'g', style}) => {
  const fr = useCurrentFrame();
  const R = (k: string) => random(`${seed}-${k}-${Math.floor(fr / 2)}`);
  const on = R('on') < 0.25 + intensity * 0.6;
  const dx = on ? (R('dx') - 0.5) * 24 * intensity : 0;
  const sk = on && R('sk') < 0.3 ? (R('skv') - 0.5) * 20 * intensity : 0;
  const base: React.CSSProperties = {fontFamily: font, fontWeight: weight, fontSize: size, letterSpacing: spacing, whiteSpace: 'pre', lineHeight: 1.05};
  return (
    <div style={{position: 'relative', transform: `skewX(${sk}deg)`, ...style}}>
      <div style={{...base, position: 'absolute', left: dx + 3 * intensity, top: 0, color: 'rgba(255,40,80,0.75)', mixBlendMode: 'screen'}}>{children}</div>
      <div style={{...base, position: 'absolute', left: -dx - 3 * intensity, top: 0, color: 'rgba(40,220,255,0.75)', mixBlendMode: 'screen'}}>{children}</div>
      <div style={{...base, position: 'relative', color, textShadow: `0 0 18px ${color}`}}>{children}</div>
    </div>
  );
};

// Huruf berkocak (penyulitan) yang perlahan-lahan "terbuka" mengikut p (0..1)
const GLYPHS = '█▓▒░#$%&@*+=<>?/\\|ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export const Scramble: React.FC<{text: string; reveal: number; seed?: string; style?: React.CSSProperties}> = ({text, reveal, seed = 'sc', style}) => {
  const fr = useCurrentFrame();
  const n = Math.floor(text.length * reveal);
  const out = text
    .split('')
    .map((ch, i) => (ch === ' ' ? ' ' : i < n ? ch : GLYPHS[Math.floor(random(`${seed}-${i}-${Math.floor(fr / 3)}`) * GLYPHS.length)]))
    .join('');
  return <span style={{whiteSpace: 'pre', ...style}}>{out}</span>;
};

export const DataStream: React.FC<{x: number; y: number; rows: number; cols?: number; seed?: string; opacity?: number; color?: string}> = ({
  x,
  y,
  rows,
  cols = 22,
  seed = 'ds',
  opacity = 0.7,
  color = CYAN,
}) => {
  const fr = useCurrentFrame();
  const hex = '0123456789ABCDEF';
  return (
    <div style={{position: 'absolute', left: x, top: y, fontFamily: MONO, fontSize: 18, lineHeight: '26px', color, opacity}}>
      {Array.from({length: rows}).map((_, i) => {
        const tick = Math.floor(fr / 3) + i;
        const line = Array.from({length: cols})
          .map((__, j) => (j % 5 === 4 ? ' ' : hex[Math.floor(random(`${seed}-${tick}-${j}`) * 16)]))
          .join('');
        const hi = random(`${seed}-hi-${tick}`) < 0.12;
        return (
          <div key={i} style={{whiteSpace: 'pre', opacity: 0.35 + 0.65 * ((i + 1) / rows), color: hi ? '#fff' : undefined}}>
            {line}
          </div>
        );
      })}
    </div>
  );
};

// Baris terminal bertaip
export const TypedLine: React.FC<{text: string; start: number; cps?: number; size?: number; color?: string; cursor?: boolean}> = ({
  text,
  start,
  cps = 38,
  size = 28,
  color = CYAN,
  cursor = true,
}) => {
  const fr = useCurrentFrame();
  if (fr < start) return null;
  const n = Math.min(text.length, Math.floor(((fr - start) / 30) * cps));
  const blink = Math.floor(fr / 8) % 2 === 0;
  return (
    <div style={{fontFamily: MONO, fontSize: size, color, whiteSpace: 'pre', textShadow: `0 0 10px ${color}`, height: size * 1.5}}>
      {text.slice(0, n)}
      {cursor && (n < text.length || blink) ? <span style={{opacity: 0.9}}>▌</span> : null}
    </div>
  );
};

export const ProgressBar: React.FC<{x: number; y: number; w: number; p: number; label: string; color?: string}> = ({x, y, w, p, label, color = CYAN}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 22, color, marginBottom: 10, textShadow: `0 0 8px ${color}`}}>
      <span>{label}</span>
      <span>{Math.round(p * 100)}%</span>
    </div>
    <div style={{height: 12, border: `1.5px solid ${color}`, padding: 2}}>
      <div style={{height: '100%', width: `${p * 100}%`, background: `repeating-linear-gradient(90deg, ${color} 0 10px, transparent 10px 14px)`, boxShadow: `0 0 12px ${color}`}} />
    </div>
  </div>
);

// Jalur glitch skrin penuh (dipaparkan bila intensity > 0)
export const GlitchBands: React.FC<{intensity: number; seed?: string}> = ({intensity, seed = 'gb'}) => {
  const fr = useCurrentFrame();
  if (intensity <= 0.01) return null;
  const n = Math.floor(3 + intensity * 10);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {Array.from({length: n}).map((_, i) => {
        const R = (k: string) => random(`${seed}-${k}-${i}-${fr}`);
        if (R('on') > intensity) return null;
        const y = R('y') * H;
        const h = 4 + R('h') * 40 * intensity;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (R('x') - 0.5) * 120 * intensity,
              top: y,
              width: W,
              height: h,
              background: R('c') < 0.5 ? 'rgba(98,230,255,0.35)' : 'rgba(255,60,90,0.3)',
              mixBlendMode: 'screen',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Kurungan sudut (sasaran)
export const Brackets: React.FC<{rect: [number, number, number, number]; p: number; color?: string; len?: number}> = ({rect, p, color = CYAN, len = 34}) => {
  const [x0, y0, x1, y1] = rect;
  const s = 1 + (1 - p) * 0.4;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const b: React.CSSProperties = {position: 'absolute', width: len, height: len, borderColor: color, borderStyle: 'solid', filter: `drop-shadow(0 0 6px ${color})`};
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: p, transform: `scale(${s})`, transformOrigin: `${cx}px ${cy}px`}}>
      <div style={{...b, left: x0, top: y0, borderWidth: '3px 0 0 3px'}} />
      <div style={{...b, left: x1 - len, top: y0, borderWidth: '3px 3px 0 0'}} />
      <div style={{...b, left: x0, top: y1 - len, borderWidth: '0 0 3px 3px'}} />
      <div style={{...b, left: x1 - len, top: y1 - len, borderWidth: '0 3px 3px 0'}} />
    </div>
  );
};

export const fadeInOut = (fr: number, a: number, b: number, len = 8) => ci(fr, a, a + len) * (1 - ci(fr, b - len, b));
