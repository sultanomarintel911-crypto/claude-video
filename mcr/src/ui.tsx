import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {at, CHAPTERS, CLIP_END, FPS, IMPACTS, LINES, TOTAL} from './data';

export const BG = '#08080a';
export const BONE = '#eee7d8';
export const RED = '#d0142c';
export const DIM = '#8d8679';

export const BEBAS = "'Bebas Neue', sans-serif";
export const GOTH = "'UnifrakturMaguntia', serif";
export const TYPE = "'Special Elite', monospace";
export const SANS = "'Montserrat', sans-serif";

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const backOut = Easing.bezier(0.34, 1.56, 0.64, 1);

export const ci = (fr: number, a: number, b: number, x = 0, y = 1, easing?: (t: number) => number) =>
  interpolate(fr, [a, b], [x, y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

/** progres 0..1 bermula pada masa abs t, tempoh d saat */
export const useP = () => {
  const fr = useCurrentFrame();
  return (t: number, d = 0.45, e: (x: number) => number = easeOut) => ci(fr, at(t), at(t) + d * FPS, 0, 1, e);
};

/** Pop masuk: skala besar -> 1 + kabur hilang */
export const pop = (p: number, from = 1.8): React.CSSProperties => ({
  opacity: Math.min(1, p * 3),
  transform: `scale(${interpolate(p, [0, 1], [from, 1])})`,
  filter: `blur(${(1 - p) * 14}px)`,
});
export const rise = (p: number, dy = 60): React.CSSProperties => ({
  opacity: p,
  transform: `translateY(${(1 - p) * dy}px)`,
  filter: `blur(${(1 - p) * 8}px)`,
});

// ------------------------------------------------------------------ latar
export const Background: React.FC = () => {
  const fr = useCurrentFrame();
  const g = Math.floor(fr / 2) % 4;
  const ox = Math.floor(random(`gx${fr}`) * 512);
  const oy = Math.floor(random(`gy${fr}`) * 512);
  const flick = 0.92 + random(`fl${Math.floor(fr / 3)}`) * 0.08;
  const t = fr / FPS;
  return (
    <AbsoluteFill style={{background: BG}}>
      {/* asap merah */}
      {[0, 1, 2].map((i) => {
        const x = 540 + Math.sin(t * 0.13 + i * 2.1) * 380;
        const y = 900 + Math.cos(t * 0.09 + i * 1.7) * 600;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - 700,
              top: y - 700,
              width: 1400,
              height: 1400,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(${i === 1 ? '90,10,20' : '60,8,16'},${0.55 * flick}) 0%, rgba(0,0,0,0) 62%)`,
            }}
          />
        );
      })}
      {/* garis menegak samar (barisan perarakan) */}
      <AbsoluteFill
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, rgba(238,231,216,0.025) 0 2px, transparent 2px 90px)',
          backgroundPosition: `${(fr * 0.4) % 90}px 0`,
        }}
      />
      {/* bijian filem */}
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile(`img/grain${g}.png`)})`,
          backgroundPosition: `${ox}px ${oy}px`,
          mixBlendMode: 'overlay',
          opacity: 0.35,
        }}
      />
      {/* vignet */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.85) 100%)'}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------- gegar skrin
export const useShake = () => {
  const fr = useCurrentFrame();
  let x = 0;
  let y = 0;
  let r = 0;
  for (const [t, k] of IMPACTS) {
    const d = fr - at(t);
    if (d < 0 || d > 14) continue;
    const a = k * 26 * Math.exp(-d / 3.2);
    x += (random(`sx${t}${d}`) - 0.5) * 2 * a;
    y += (random(`sy${t}${d}`) - 0.5) * 2 * a;
    r += (random(`sr${t}${d}`) - 0.5) * 0.08 * a;
  }
  return `translate(${x}px, ${y}px) rotate(${r}deg)`;
};

/** Kilat putih/merah sekejap pada hentakan */
export const Flash: React.FC = () => {
  const fr = useCurrentFrame();
  let o = 0;
  for (const [t, k] of IMPACTS) {
    const d = fr - at(t);
    if (d >= 0 && d < 8) o = Math.max(o, k * 0.35 * (1 - d / 8));
  }
  return <AbsoluteFill style={{background: RED, opacity: o, mixBlendMode: 'screen'}} />;
};

// ----------------------------------------------------- kepala & kemajuan
export const Header: React.FC = () => {
  const fr = useCurrentFrame();
  const vis = ci(fr, at(72.0), at(72.6)) * ci(fr, at(CLIP_END + 0.1), at(CLIP_END + 0.7), 1, 0);
  const t0 = at(CHAPTERS[0][1]);
  const t1 = at(CLIP_END);
  const prog = ci(fr, t0, t1);
  const cur = CHAPTERS.filter(([, t]) => fr >= at(t)).length - 1;
  const blink = Math.floor(fr / 15) % 2 === 0;
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 92, opacity: vis}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: TYPE, color: BONE, fontSize: 30, letterSpacing: 3}}>
        <span>KISAH DI SEBALIK LAGU</span>
        <span style={{color: RED, display: 'flex', alignItems: 'center', gap: 12}}>
          <span style={{width: 16, height: 16, borderRadius: 8, background: RED, opacity: blink ? 1 : 0.25}} />
          MCR
        </span>
      </div>
      <div style={{position: 'relative', height: 4, background: 'rgba(238,231,216,0.15)', marginTop: 18}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${prog * 100}%`, background: RED, boxShadow: `0 0 14px ${RED}`}} />
        {CHAPTERS.map(([n, t], i) => {
          const x = (at(t) - t0) / (t1 - t0);
          return (
            <div key={n} style={{position: 'absolute', left: `${x * 100}%`, top: -6, width: 4, height: 16, background: i <= cur ? RED : 'rgba(238,231,216,0.4)'}} />
          );
        })}
      </div>
      <div style={{position: 'relative', height: 40, marginTop: 10}}>
        {CHAPTERS.map(([n, t], i) => {
          const x = (at(t) - t0) / (t1 - t0);
          const on = i === cur;
          if (!on) return null;
          return (
            <div
              key={n}
              style={{
                position: 'absolute',
                left: `${x * 100}%`,
                fontFamily: BEBAS,
                fontSize: 26,
                letterSpacing: 2,
                color: on ? BONE : 'rgba(238,231,216,0.3)',
                transform: i === CHAPTERS.length - 1 ? 'translateX(-60%)' : undefined,
              }}
            >
              {n}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --------------------------------------------------------- kapsyen bawah
export const Subtitles: React.FC = () => {
  const fr = useCurrentFrame();
  const L = LINES.find((l) => fr >= at(l.s) - 3 && fr < at(l.e));
  if (!L) return null;
  const pin = ci(fr, at(L.s) - 3, at(L.s) + 4);
  const pout = ci(fr, at(L.e) - 4, at(L.e));
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: 1585,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '6px 16px',
        opacity: pin * (1 - pout),
        transform: `translateY(${(1 - pin) * 20}px)`,
      }}
    >
      {L.words.map((w, i) => {
        const said = fr >= at(w.s);
        const now = said && fr < at(w.e);
        const k = ci(fr, at(w.s), at(w.s) + 4);
        return (
          <span
            key={i}
            style={{
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 58,
              lineHeight: 1.25,
              padding: '0 10px',
              borderRadius: 6,
              color: said ? BONE : 'rgba(238,231,216,0.28)',
              background: now ? RED : 'transparent',
              transform: `scale(${1 + (now ? 0.06 * (1 - k) + 0.04 : 0)})`,
              textShadow: '0 4px 18px rgba(0,0,0,0.8)',
            }}
          >
            {w.w}
          </span>
        );
      })}
    </div>
  );
};

/** Muncul hanya dalam tetingkap [a, b] (masa abs) dengan pudar masuk/keluar */
export const Win: React.FC<{a: number; b: number; fin?: number; fout?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  a,
  b,
  fin = 0.25,
  fout = 0.3,
  children,
  style,
}) => {
  const fr = useCurrentFrame();
  if (fr < at(a) || fr > at(b)) return null;
  const o = ci(fr, at(a), at(a) + fin * FPS) * ci(fr, at(b) - fout * FPS, at(b), 1, 0);
  const s = ci(fr, at(b) - fout * FPS, at(b), 1, 0.94, easeInOut);
  return <AbsoluteFill style={{opacity: o, transform: `scale(${s})`, filter: `blur(${(1 - o) * 10}px)`, ...style}}>{children}</AbsoluteFill>;
};

/** Teks ditaip huruf demi huruf */
export const Typed: React.FC<{text: string; t: number; cps?: number; style?: React.CSSProperties}> = ({text, t, cps = 28, style}) => {
  const fr = useCurrentFrame();
  const n = Math.floor(Math.max(0, (fr - at(t)) / FPS) * cps);
  const shown = text.slice(0, n);
  const caret = n < text.length || Math.floor(fr / 10) % 2 === 0;
  if (fr < at(t)) return null;
  return (
    <span style={style}>
      {shown}
      <span style={{opacity: caret ? 1 : 0, color: RED}}>▌</span>
    </span>
  );
};

export const center: React.CSSProperties = {display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'};
export {TOTAL};
