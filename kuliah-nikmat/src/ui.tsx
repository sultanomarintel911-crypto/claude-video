import React from 'react';
import {AbsoluteFill, Easing, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {at, CHAPTERS, CLIP_END, CLIP_START, FPS, HEADER_TAG, HEADER_TITLE, IMPACTS, LINES, PENYAMPAI, TOTAL} from './data';

// Tema kuliah: hijau zamrud + emas + krim. Kontras tinggi, mudah dibaca semua peringkat umur.
export const BG = '#04201a';
export const CREAM = '#fbf5e6';
export const GOLD = '#e6c36a';
export const GOLD_D = '#b8913c';
export const GREEN = '#3fcf8e';
export const DIM = '#a9bfb3';
export const CARD = 'rgba(6, 46, 37, 0.92)';

export const ARAB = "'Amiri', serif";
export const SANS = "'Montserrat', sans-serif";

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const backOut = Easing.bezier(0.34, 1.56, 0.64, 1);

export const ci = (fr: number, a: number, b: number, x = 0, y = 1, easing?: (t: number) => number) =>
  interpolate(fr, [a, b], [x, y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

export const useP = () => {
  const fr = useCurrentFrame();
  return (t: number, d = 0.5, e: (x: number) => number = easeOut) => ci(fr, at(t), at(t) + d * FPS, 0, 1, e);
};

export const pop = (p: number, from = 1.3): React.CSSProperties => ({
  opacity: Math.min(1, p * 2.5),
  transform: `scale(${interpolate(p, [0, 1], [from, 1])})`,
  filter: `blur(${(1 - Math.min(1, p)) * 8}px)`,
});
export const rise = (p: number, dy = 40): React.CSSProperties => ({
  opacity: p,
  transform: `translateY(${(1 - p) * dy}px)`,
});

// Corak geometri Islam (bintang 8 bucu) sebagai jubin SVG
const STAR = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? 46 : 24;
    const a = (i / 16) * Math.PI * 2 - Math.PI / 8;
    pts.push(`${(60 + r * Math.cos(a)).toFixed(1)},${(60 + r * Math.sin(a)).toFixed(1)}`);
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><g fill='none' stroke='%23e6c36a' stroke-width='1.4'><polygon points='${pts.join(' ')}'/><rect x='35' y='35' width='50' height='50' transform='rotate(45 60 60)'/><rect x='35' y='35' width='50' height='50'/><path d='M0 0L18 18M120 0L102 18M0 120L18 102M120 120L102 102'/></g></svg>`;
  return `url("data:image/svg+xml;utf8,${svg}")`;
})();

export const Background: React.FC = () => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 35%, #0b3d31 0%, ${BG} 60%, #020f0c 100%)`}}>
      <AbsoluteFill style={{backgroundImage: STAR, backgroundSize: '120px 120px', backgroundPosition: `${t * 4}px ${t * 6}px`, opacity: 0.07}} />
      {[0, 1].map((i) => {
        const x = 540 + Math.sin(t * 0.11 + i * 2.6) * 340;
        const y = 950 + Math.cos(t * 0.08 + i * 1.9) * 520;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - 650,
              top: y - 650,
              width: 1300,
              height: 1300,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(230,195,106,${i ? 0.08 : 0.11}) 0%, rgba(0,0,0,0) 60%)`,
            }}
          />
        );
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.6) 100%)'}} />
    </AbsoluteFill>
  );
};

export const useShake = () => {
  const fr = useCurrentFrame();
  let x = 0;
  let y = 0;
  for (const [t, k] of IMPACTS) {
    const d = fr - at(t);
    if (d < 0 || d > 14) continue;
    const a = k * 14 * Math.exp(-d / 3.2);
    x += (random(`sx${t}${d}`) - 0.5) * 2 * a;
    y += (random(`sy${t}${d}`) - 0.5) * 2 * a;
  }
  return `translate(${x}px, ${y}px)`;
};

// ------------------------------------------------- kepala & bar kemajuan
export const Header: React.FC = () => {
  const fr = useCurrentFrame();
  const vis = ci(fr, at(CLIP_START + 1.0), at(CLIP_START + 1.6)) * ci(fr, at(CLIP_END + 0.2), at(CLIP_END + 0.8), 1, 0);
  const t0 = at(CHAPTERS[0][1]);
  const t1 = at(CLIP_END);
  const prog = ci(fr, t0, t1);
  const cur = CHAPTERS.filter(([, t]) => fr >= at(t)).length - 1;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 70, opacity: vis}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: 3}}>
        <span style={{color: CREAM}}>{HEADER_TITLE}</span>
        <span style={{color: GOLD, fontSize: 28}}>{HEADER_TAG}</span>
      </div>
      <div style={{position: 'relative', height: 6, borderRadius: 3, background: 'rgba(251,245,230,0.15)', marginTop: 16}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 3, width: `${prog * 100}%`, background: GOLD}} />
        {CHAPTERS.map(([n, t], i) => {
          const x = (at(t) - t0) / (t1 - t0);
          return <div key={n} style={{position: 'absolute', left: `${x * 100}%`, top: -5, width: 16, height: 16, marginLeft: -8, borderRadius: 8, background: i <= cur ? GOLD : '#2b4d43', border: `3px solid ${BG}`}} />;
        })}
      </div>
      {cur >= 0 && (
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, color: GOLD, marginTop: 14, letterSpacing: 4}}>
          {`BAHAGIAN ${cur + 1}/${CHAPTERS.length} · ${CHAPTERS[cur][0]}`}
        </div>
      )}
    </div>
  );
};

// ------------------------------------------- penyampai dalam bingkai bulat
export const SPK = {cx: 870, cy: 345, d: 300};
export const Speaker: React.FC = () => {
  const fr = useCurrentFrame();
  const a = at(CLIP_START);
  const b = at(CLIP_END);
  if (fr < a - 1 || fr > b + 20) return null;
  const pin = ci(fr, a, a + 18, 0, 1, backOut);
  const pout = ci(fr, b, b + 15, 1, 0, easeInOut);
  const s = Math.min(pin, 1) * pout;
  const ring = (fr % 60) / 60;
  const {cx, cy, d} = SPK;
  return (
    <div style={{position: 'absolute', left: cx - d / 2, top: cy - d / 2, width: d, height: d, transform: `scale(${s})`, opacity: Math.min(1, pin * 2) * pout}}>
      <div style={{position: 'absolute', inset: -16 - ring * 26, borderRadius: '50%', border: `3px solid ${GOLD}`, opacity: 0.5 * (1 - ring)}} />
      <div style={{position: 'absolute', inset: -10, borderRadius: '50%', background: `conic-gradient(${GOLD}, ${GOLD_D}, ${GOLD}, #fff1c2, ${GOLD})`, boxShadow: '0 12px 50px rgba(0,0,0,0.6)'}} />
      <div style={{position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', background: '#000'}}>
        <Sequence from={a} durationInFrames={b - a}>
          <OffthreadVideo src={staticFile('video/penyampai.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 38%', transform: 'scale(1.06)'}} />
        </Sequence>
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: d - 14,
          transform: 'translateX(-50%)',
          background: GOLD,
          color: BG,
          fontFamily: SANS,
          padding: '6px 20px 8px',
          borderRadius: 18,
          whiteSpace: 'nowrap',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{fontWeight: 800, fontSize: 18, letterSpacing: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
          <span style={{width: 10, height: 10, borderRadius: 5, background: '#d6303b', opacity: Math.floor(fr / 15) % 2 ? 1 : 0.35}} />
          PENYAMPAI
        </div>
        <div style={{fontWeight: 900, fontSize: 25, lineHeight: 1.15}}>{PENYAMPAI}</div>
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
    <div style={{position: 'absolute', left: 50, right: 50, top: 1580, display: 'flex', justifyContent: 'center', opacity: pin * (1 - pout)}}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '4px 14px',
          background: 'rgba(2,15,12,0.72)',
          borderRadius: 24,
          padding: '18px 26px',
          border: '2px solid rgba(230,195,106,0.25)',
        }}
      >
        {L.words.map((w, i) => {
          const said = fr >= at(w.s);
          const now = said && fr < at(w.e);
          return (
            <span
              key={i}
              style={{
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 64,
                lineHeight: 1.2,
                padding: '0 10px',
                borderRadius: 10,
                color: now ? BG : said ? CREAM : 'rgba(251,245,230,0.4)',
                background: now ? GOLD : 'transparent',
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const Win: React.FC<{a: number; b: number; fin?: number; fout?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  a,
  b,
  fin = 0.35,
  fout = 0.35,
  children,
  style,
}) => {
  const fr = useCurrentFrame();
  if (fr < at(a) || fr > at(b)) return null;
  const o = ci(fr, at(a), at(a) + fin * FPS) * ci(fr, at(b) - fout * FPS, at(b), 1, 0);
  return <AbsoluteFill style={{opacity: o, ...style}}>{children}</AbsoluteFill>;
};

export const center: React.CSSProperties = {display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'};

/** Tajuk babak di kiri bingkai penyampai */
export const SceneTitle: React.FC<{t: number; kicker: string; title: React.ReactNode}> = ({t, kicker, title}) => {
  const P = useP();
  return (
    <div style={{position: 'absolute', left: 60, top: 250, width: 640}}>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: GOLD, letterSpacing: 5, ...rise(P(t))}}>{kicker}</div>
      <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 70, color: CREAM, lineHeight: 1.08, marginTop: 8, ...rise(P(t + 0.15))}}>{title}</div>
      <div style={{width: 140 * P(t + 0.3, 0.6), height: 6, borderRadius: 3, background: GOLD, marginTop: 18}} />
    </div>
  );
};

export {TOTAL};
