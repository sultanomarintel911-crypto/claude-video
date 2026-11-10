import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {FPS, H, Rect, W} from './data';

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const ci = (fr: number, a: number, b: number, x = 0, y = 1, easing?: (t: number) => number) =>
  interpolate(fr, [a, b], [x, y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

export const SERIF = "'Cinzel', serif";
export const SANS = "'Montserrat', sans-serif";
export const GOLD_GRAD = 'linear-gradient(180deg,#fff6cf 0%,#f9d77e 26%,#d39a32 52%,#f6cd6b 72%,#fff1bd 100%)';
export const GOLD = '#f2c35b';

export const inRect = (r: Rect, x: number, y: number, pad = 0) =>
  x > r[0] - pad && x < r[2] + pad && y > r[1] - pad && y < r[3] + pad;
export const overlap = (a: Rect, b: Rect) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];

// ------------------------------------------------------------ teks emas
export const Gold: React.FC<{
  size: number;
  weight?: number;
  font?: string;
  spacing?: number;
  shine?: number; // 0..1 sapuan kilauan, <0 tiada
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({size, weight = 900, font = SERIF, spacing = 0, shine = -1, style, children}) => {
  const p = shine * 150 - 25;
  const shineLayer =
    shine >= 0 && shine <= 1
      ? `linear-gradient(105deg, rgba(255,255,255,0) ${p - 9}%, rgba(255,255,255,0.95) ${p}%, rgba(255,255,255,0) ${p + 9}%), `
      : '';
  return (
    <div
      style={{
        fontFamily: font,
        fontWeight: weight,
        fontSize: size,
        letterSpacing: spacing,
        lineHeight: 1.04,
        backgroundImage: shineLayer + GOLD_GRAD,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
        filter: 'drop-shadow(0 0 20px rgba(255,180,60,0.45)) drop-shadow(0 4px 3px rgba(0,0,0,0.7))',
        whiteSpace: 'pre',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ------------------------------------------------------------ latar & zarah
export const Stars: React.FC<{n?: number; seed?: string; drift?: number; opacity?: number}> = ({
  n = 220,
  seed = 'bintang',
  drift = 8,
  opacity = 1,
}) => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity}}>
      {Array.from({length: n}).map((_, i) => {
        const x = random(seed + 'x' + i) * W;
        const y = random(seed + 'y' + i) * H;
        const r = 0.6 + random(seed + 'r' + i) ** 3 * 2.8;
        const tw = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin((fr / 14) * (0.5 + random(seed + 't' + i)) + i));
        const dx = (fr / FPS) * drift * (0.3 + random(seed + 'd' + i));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (x + dx) % W,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: '#fff',
              opacity: tw,
              boxShadow: r > 2 ? `0 0 ${r * 5}px rgba(255,225,170,0.9)` : undefined,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const Rays: React.FC<{cx: number; cy: number; opacity?: number; speed?: number; color?: string}> = ({
  cx,
  cy,
  opacity = 1,
  speed = 0.12,
  color = '255,205,120',
}) => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity,
        background: `repeating-conic-gradient(from ${fr * speed}deg at ${cx}px ${cy}px, rgba(${color},0.20) 0deg 4deg, rgba(${color},0) 8deg 18deg)`,
        WebkitMaskImage: `radial-gradient(circle at ${cx}px ${cy}px, black 0%, rgba(0,0,0,0.55) 32%, transparent 72%)`,
      }}
    />
  );
};

export const Glow: React.FC<{cx: number; cy: number; r: number; color?: string; opacity?: number}> = ({
  cx,
  cy,
  r,
  color = '255,190,90',
  opacity = 1,
}) => (
  <AbsoluteFill
    style={{opacity, background: `radial-gradient(circle at ${cx}px ${cy}px, rgba(${color},0.55) 0%, rgba(${color},0.18) ${r * 0.45}px, transparent ${r}px)`}}
  />
);

export const Embers: React.FC<{n?: number; seed?: string; exclude?: Rect[]; opacity?: number}> = ({
  n = 70,
  seed = 'bara',
  exclude = [],
  opacity = 1,
}) => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  return (
    <AbsoluteFill style={{opacity}}>
      {Array.from({length: n}).map((_, i) => {
        const v = 40 + random(seed + 'v' + i) * 120;
        const span = H * 1.4;
        const y = H + 40 - ((random(seed + 'y' + i) * span + v * t) % span);
        const x = random(seed + 'x' + i) * W + 30 * Math.sin(t * 1.2 + i);
        if (exclude.some((r) => inRect(r, x, y, 40))) return null;
        const s = 2 + random(seed + 's' + i) * 4;
        const b = 0.4 + 0.6 * Math.abs(Math.sin(t * (2 + random(seed + 'b' + i) * 4) + i));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: '50%',
              background: '#ffd27a',
              opacity: b,
              boxShadow: `0 0 ${s * 4}px ${s}px rgba(255,150,40,0.7)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const CONF_COLS = ['#f6c552', '#ffffff', '#e8455c', '#3f8cff', '#45d48a', '#ff8ad0', '#ffe39a'];
export const Confetti: React.FC<{start?: number; exclude?: Rect[]; n?: number; seed?: string; rain?: number}> = ({
  start = 0,
  exclude = [],
  n = 160,
  seed = 'konfeti',
  rain = 90,
}) => {
  const fr = useCurrentFrame();
  const t = (fr - start) / FPS;
  if (t < 0) return null;
  const k = 2.4;
  const g = 520;
  const els: React.ReactNode[] = [];
  for (let i = 0; i < n + rain; i++) {
    const R = (s: string) => random(`${seed}-${s}-${i}`);
    let x: number;
    let y: number;
    if (i < n) {
      const side = i % 2 === 0 ? 1 : -1;
      const x0 = side === 1 ? -20 : W + 20;
      const vx = side * (450 + R('vx') * 1700);
      const vy = -(900 + R('vy') * 900);
      const e = 1 - Math.exp(-k * t);
      x = x0 + (vx * e) / k + 30 * Math.sin(R('p') * 6 + t * 4) * (1 - Math.exp(-t));
      y = H + 20 + (g / k) * t + ((vy - g / k) * e) / k;
    } else {
      x = R('x') * W + 40 * Math.sin(R('p') * 6 + t * 2);
      y = -30 - R('y') * 1400 + (110 + R('vy') * 120) * t;
    }
    if (x < -30 || x > W + 30 || y < -30 || y > H + 30) continue;
    if (exclude.some((r) => inRect(r, x, y, 55))) continue;
    const flip = Math.cos(R('f') * 6 + t * (4 + R('fs') * 6));
    const rot = R('r') * 360 + t * (R('sp') - 0.5) * 720;
    const w = 10 + R('w') * 12;
    const h = 6 + R('h') * 8;
    els.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: w,
          height: h,
          background: CONF_COLS[Math.floor(R('c') * CONF_COLS.length)],
          transform: `rotate(${rot}deg) scaleY(${flip})`,
          filter: `brightness(${0.6 + 0.4 * Math.abs(flip)})`,
        }}
      />,
    );
  }
  return <AbsoluteFill>{els}</AbsoluteFill>;
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.7}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,${strength}) 100%)`, pointerEvents: 'none'}} />
);

export const Letterbox: React.FC<{h?: number}> = ({h = 64}) => (
  <AbsoluteFill>
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: h, background: '#000'}} />
    <div style={{position: 'absolute', left: 0, bottom: 0, width: W, height: h, background: '#000'}} />
  </AbsoluteFill>
);

export const Flash: React.FC<{at?: number; len?: number; color?: string; max?: number}> = ({at = 0, len = 14, color = '#fff', max = 1}) => {
  const fr = useCurrentFrame();
  const o = fr < at ? 0 : max * (1 - ci(fr, at, at + len, 0, 1, Easing.out(Easing.quad)));
  return o > 0.001 ? <AbsoluteFill style={{background: color, opacity: o}} /> : null;
};

// ------------------------------------------------------------ Ken Burns sedar-wajah
export function kbLayout(iw: number, ih: number, face: Rect, z: number, tx: number, ty: number) {
  const s = Math.max(W / iw, H / ih) * z;
  const fw = iw * s;
  const fh = ih * s;
  const fcx = ((face[0] + face[2]) / 2) * fw;
  const fcy = ((face[1] + face[3]) / 2) * fh;
  const left = Math.min(0, Math.max(W - fw, tx - fcx));
  const top = Math.min(0, Math.max(H - fh, ty - fcy));
  const rect: Rect = [left + face[0] * fw, top + face[1] * fh, left + face[2] * fw, top + face[3] * fh];
  return {fw, fh, left, top, rect};
}

export const KenBurns: React.FC<{
  src: string;
  iw: number;
  ih: number;
  face: Rect;
  dur: number;
  z0: number;
  z1: number;
  fx0: number;
  fx1: number;
  fy: number;
}> = ({src, iw, ih, face, dur, z0, z1, fx0, fx1, fy}) => {
  const fr = useCurrentFrame();
  const p = ci(fr, 0, dur, 0, 1, easeInOut);
  const L = kbLayout(iw, ih, face, z0 + (z1 - z0) * p, (fx0 + (fx1 - fx0) * p) * W, fy * H);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <Img src={staticFile(src)} style={{position: 'absolute', left: L.left, top: L.top, width: L.fw, height: L.fh}} />
    </AbsoluteFill>
  );
};

// kesatuan kotak wajah sepanjang syot (untuk memilih tempat kapsyen)
export function faceUnion(iw: number, ih: number, face: Rect, z0: number, z1: number, fx0: number, fx1: number, fy: number): Rect {
  let u: Rect = [1e9, 1e9, -1e9, -1e9];
  for (let i = 0; i <= 10; i++) {
    const p = i / 10;
    const r = kbLayout(iw, ih, face, z0 + (z1 - z0) * p, (fx0 + (fx1 - fx0) * p) * W, fy * H).rect;
    u = [Math.min(u[0], r[0]), Math.min(u[1], r[1]), Math.max(u[2], r[2]), Math.max(u[3], r[3])];
  }
  return u;
}

export type Slot = {side: 'left' | 'right'; v: 'top' | 'bottom'; rect: Rect};
export function pickCaptionSlot(face: Rect, w = 900, h = 250, margin = 110): Slot {
  const fcx = (face[0] + face[2]) / 2;
  const prefer: Array<['left' | 'right', 'top' | 'bottom']> =
    fcx > W / 2
      ? [['left', 'bottom'], ['left', 'top'], ['right', 'bottom'], ['right', 'top']]
      : [['right', 'bottom'], ['right', 'top'], ['left', 'bottom'], ['left', 'top']];
  const pad = 50;
  const fe: Rect = [face[0] - pad, face[1] - pad, face[2] + pad, face[3] + pad];
  for (const [side, v] of prefer) {
    const x0 = side === 'left' ? margin : W - margin - w;
    const y0 = v === 'bottom' ? H - margin - h : margin;
    const rect: Rect = [x0, y0, x0 + w, y0 + h];
    if (!overlap(rect, fe)) return {side, v, rect};
  }
  const x0 = fcx > W / 2 ? margin : W - margin - w;
  return {side: fcx > W / 2 ? 'left' : 'right', v: 'bottom', rect: [x0, H - margin - h, x0 + w, H - margin]};
}

// ------------------------------------------------------------ kapsyen & lencana
export const Caption: React.FC<{slot: Slot; kicker: string; title: string; sub?: string; delay?: number}> = ({
  slot,
  kicker,
  title,
  sub,
  delay = 8,
}) => {
  const fr = useCurrentFrame();
  const a = ci(fr, delay, delay + 16, 0, 1, easeOut);
  const b = ci(fr, delay + 5, delay + 22, 0, 1, easeOut);
  const c = ci(fr, delay + 10, delay + 26, 0, 1, easeOut);
  const right = slot.side === 'right';
  const dir = right ? 1 : -1;
  const [x0, y0, x1, y1] = slot.rect;
  return (
    <div
      style={{
        position: 'absolute',
        left: x0,
        top: y0,
        width: x1 - x0,
        height: y1 - y0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: slot.v === 'bottom' ? 'flex-end' : 'flex-start',
        alignItems: right ? 'flex-end' : 'flex-start',
        textAlign: right ? 'right' : 'left',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 16, flexDirection: right ? 'row-reverse' : 'row', opacity: a, transform: `translateX(${dir * 40 * (1 - a)}px)`}}>
        <div style={{width: 70 * a, height: 3, background: GOLD_GRAD, boxShadow: '0 0 12px rgba(255,190,80,0.8)'}} />
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: 6, color: GOLD, textShadow: '0 2px 8px rgba(0,0,0,0.9)'}}>{kicker}</div>
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 800,
          fontSize: 60,
          color: '#fff',
          marginTop: 10,
          lineHeight: 1.08,
          opacity: b,
          transform: `translateX(${dir * 60 * (1 - b)}px)`,
          textShadow: '0 4px 18px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,1)',
        }}
      >
        {title}
      </div>
      {sub ? (
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 28, color: '#e8e2d4', marginTop: 10, opacity: c, transform: `translateX(${dir * 40 * (1 - c)}px)`, textShadow: '0 2px 10px rgba(0,0,0,0.95)'}}>
          {sub}
        </div>
      ) : null}
    </div>
  );
};

export const Badge: React.FC<{text: string; x: number; y: number; delay?: number; size?: number}> = ({text, x, y, delay = 26, size = 190}) => {
  const fr = useCurrentFrame();
  const p = ci(fr, delay, delay + 14, 0, 1, Easing.out(Easing.back(2.2)));
  const shine = ci(fr, delay + 14, delay + 40);
  if (p <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, transform: `scale(${p}) rotate(${(1 - p) * -40}deg)`}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, #fff4c4 0%, #f5c24f 35%, #b67818 75%, #7a4a08 100%)',
          boxShadow: '0 0 40px rgba(255,190,70,0.7), inset 0 0 0 6px rgba(255,240,190,0.7), inset 0 0 0 12px rgba(150,95,10,0.6)',
        }}
      />
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{fontSize: size * 0.13, color: '#5a3500', letterSpacing: 2}}>★ ★ ★</div>
        <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: size * (text.length > 5 ? 0.17 : 0.2), color: '#4a2a00', textShadow: '0 1px 0 rgba(255,240,200,0.8)'}}>{text}</div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: size * 0.07, color: '#5a3500', letterSpacing: 3}}>2026</div>
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `linear-gradient(110deg, transparent ${shine * 140 - 30}%, rgba(255,255,255,0.75) ${shine * 140 - 20}%, transparent ${shine * 140 - 10}%)`,
        }}
      />
    </div>
  );
};

// Potongan latar (cutout) seorang murid, dengan kedudukan wajah dikira
export function cutLayout(cut: {w: number; h: number; face: Rect}, cx: number, top: number, height: number) {
  const s = height / cut.h;
  const w = cut.w * s;
  const left = cx - w / 2;
  const face: Rect = [left + cut.face[0] * w, top + cut.face[1] * height, left + cut.face[2] * w, top + cut.face[3] * height];
  return {left, top, w, h: height, face};
}
