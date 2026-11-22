import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {at, CHAPTERS, CLIP_END, FPS, LINES} from './data';

// Gaya "studio lembut + tanah liat turquoise 3D" (ORANGE kini bermaksud warna utama: turquoise)
export const PEACH = '#e3f4f1';
export const PAPER = '#fbfffe';
export const ORANGE = '#2bb3a6';
export const ORANGE_D = '#1c8c82';
export const YELLOW = '#f7b733';
export const INK = '#173b3a';
export const MUTED = '#5d8783';
export const GREEN = '#34a853';
export const RED = '#e0362c';

export const POP = "'Poppins', sans-serif";
export const ARAB = "'Amiri', serif";

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const backOut = Easing.bezier(0.34, 1.56, 0.64, 1);
export const ci = (fr: number, a: number, b: number, x = 0, y = 1, e?: (t: number) => number) =>
  interpolate(fr, [a, b], [x, y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
export const useP = () => {
  const fr = useCurrentFrame();
  return (t: number, d = 0.5, e: (x: number) => number = easeOut) => ci(fr, at(t), at(t) + d * FPS, 0, 1, e);
};
export const center: React.CSSProperties = {display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'};
export const rise = (p: number, dy = 50): React.CSSProperties => ({opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * dy}px)`});
export const pop = (p: number, from = 0.6): React.CSSProperties => ({
  opacity: Math.min(1, p * 2),
  transform: `scale(${interpolate(p, [0, 1], [from, 1])})`,
});

// ------------------------------------------------------------------ bentuk tanah liat
export const Clay: React.FC<{size: number; color?: 'o' | 'y' | 'p'; style?: React.CSSProperties}> = ({size, color = 'o', style}) => {
  const g =
    color === 'y'
      ? 'radial-gradient(circle at 34% 28%, #fff1c9 0%, #ffd36b 22%, #f7b733 52%, #c98412 100%)'
      : color === 'p'
        ? 'radial-gradient(circle at 34% 28%, #ffffff 0%, #e5f7f4 30%, #c9ebe5 70%, #8fcfc5 100%)'
        : 'radial-gradient(circle at 34% 28%, #d4f5f0 0%, #5fd0c4 22%, #2bb3a6 55%, #137068 100%)';
  return <div style={{width: size, height: size, borderRadius: '50%', background: g, boxShadow: `0 ${size * 0.18}px ${size * 0.35}px rgba(20,90,85,0.25)`, ...style}} />;
};

/** Awan tanah liat (gabungan sfera) */
export const ClayCloud: React.FC<{w: number; style?: React.CSSProperties}> = ({w, style}) => (
  <div style={{position: 'relative', width: w, height: w * 0.62, ...style}}>
    <Clay size={w * 0.5} style={{position: 'absolute', left: w * 0.05, top: w * 0.18}} />
    <Clay size={w * 0.62} style={{position: 'absolute', left: w * 0.25, top: 0}} />
    <Clay size={w * 0.46} style={{position: 'absolute', left: w * 0.52, top: w * 0.16}} />
  </div>
);

// ------------------------------------------------------------------ latar studio
const FLOATS: {x: number; y: number; s: number; c: 'o' | 'y' | 'p'; z: number; ph: number; kind?: 'cloud' | 'card'}[] = [
  {x: -60, y: 180, s: 190, c: 'o', z: 0.4, ph: 0},
  {x: 930, y: 260, s: 120, c: 'y', z: 0.7, ph: 1.2},
  {x: 880, y: 1380, s: 260, c: 'o', z: 0.3, ph: 2.1, kind: 'cloud'},
  {x: -40, y: 1500, s: 110, c: 'p', z: 0.8, ph: 0.6},
  {x: 70, y: 980, s: 60, c: 'y', z: 1, ph: 2.8},
  {x: 990, y: 820, s: 70, c: 'o', z: 1, ph: 1.7, kind: 'card'},
];
export const Background: React.FC = () => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  const dots = 'radial-gradient(circle, rgba(43,179,166,0.22) 2px, transparent 2.6px)';
  return (
    <AbsoluteFill style={{background: PEACH, overflow: 'hidden'}}>
      {/* dinding & lantai studio */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #eef9f7 0%, #dcf0ec 62%, #cfe8e3 63%, #e6f5f2 100%)'}} />
      <div style={{position: 'absolute', left: -200, right: -200, top: 1170, height: 140, background: 'radial-gradient(ellipse at 50% 0%, rgba(20,90,85,0.18) 0%, rgba(0,0,0,0) 70%)'}} />
      {/* cahaya tingkap */}
      <div style={{position: 'absolute', left: 540 + Math.sin(t * 0.1) * 40, top: -300, width: 900, height: 1700, transform: 'rotate(18deg)', background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 40%, rgba(255,255,255,0) 100%)'}} />
      {/* titik halftone di penjuru */}
      <div style={{position: 'absolute', left: -40, top: -40, width: 420, height: 420, backgroundImage: dots, backgroundSize: '22px 22px', WebkitMaskImage: 'radial-gradient(circle at 0% 0%, #000 0%, transparent 70%)'}} />
      <div style={{position: 'absolute', right: -40, bottom: -40, width: 480, height: 480, backgroundImage: dots, backgroundSize: '22px 22px', WebkitMaskImage: 'radial-gradient(circle at 100% 100%, #000 0%, transparent 70%)'}} />
      {/* objek terapung (kedalaman: z kecil = jauh & kabur) */}
      {FLOATS.map((f, i) => {
        const dy = Math.sin(t * (0.5 + f.z * 0.3) + f.ph) * 22 * f.z;
        const dx = Math.cos(t * 0.3 + f.ph) * 12 * f.z;
        const blur = (1 - f.z) * 8;
        const rot = Math.sin(t * 0.4 + f.ph) * 10;
        return (
          <div key={i} style={{position: 'absolute', left: f.x + dx, top: f.y + dy, filter: `blur(${blur}px)`, transform: `rotate(${rot}deg)`}}>
            {f.kind === 'cloud' ? (
              <ClayCloud w={f.s} />
            ) : f.kind === 'card' ? (
              <div style={{width: f.s, height: f.s * 1.25, borderRadius: 12, background: 'linear-gradient(145deg,#5ccdc1,#2bb3a6)', boxShadow: '0 18px 30px rgba(20,90,85,0.3)'}} />
            ) : (
              <Clay size={f.s} color={f.c} />
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ kad kertas 3D
export const Tilt: React.FC<{p: number; children: React.ReactNode; amp?: number; style?: React.CSSProperties}> = ({p, children, amp = 1, style}) => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  const ry = Math.sin(t * 0.55) * 6 * amp;
  const rx = 4 + Math.cos(t * 0.45) * 3 * amp;
  return (
    <div style={{perspective: 1600, ...style}}>
      <div
        style={{
          transform: `rotateX(${rx + (1 - p) * 55}deg) rotateY(${ry}deg) translateY(${(1 - p) * 120}px) scale(${0.85 + 0.15 * p})`,
          opacity: Math.min(1, p * 1.6),
          transformStyle: 'preserve-3d',
        }}
      >
        {children}
      </div>
    </div>
  );
};
export const Card: React.FC<{children: React.ReactNode; style?: React.CSSProperties; tone?: 'paper' | 'orange'}> = ({children, style, tone = 'paper'}) => (
  <div
    style={{
      background: tone === 'orange' ? 'linear-gradient(150deg, #57cabe 0%, #2bb3a6 60%, #1f9a8f 100%)' : PAPER,
      color: tone === 'orange' ? '#fff' : INK,
      borderRadius: 40,
      padding: '36px 44px',
      boxShadow: '0 40px 70px rgba(20,90,85,0.22), 0 8px 18px rgba(20,90,85,0.12), inset 0 2px 0 rgba(255,255,255,0.7)',
      ...style,
    }}
  >
    {children}
  </div>
);
/** Butang pil 3D tersemperit (gaya "Learn") */
export const Pill3D: React.FC<{children: React.ReactNode; size?: number; tone?: 'o' | 'g' | 'r'; style?: React.CSSProperties}> = ({children, size = 60, tone = 'o', style}) => {
  const c = tone === 'g' ? ['#5cc46f', '#34a853', '#237a37'] : tone === 'r' ? ['#ff7a6b', '#e0362c', '#a8211a'] : ['#5fd0c4', '#2bb3a6', '#178077'];
  return (
    <div
      style={{
        display: 'inline-block',
        fontFamily: POP,
        fontWeight: 800,
        fontSize: size,
        color: '#fff',
        padding: `${size * 0.22}px ${size * 0.6}px`,
        borderRadius: size,
        background: `linear-gradient(180deg, ${c[0]} 0%, ${c[1]} 60%)`,
        boxShadow: `0 ${size * 0.16}px 0 ${c[2]}, 0 ${size * 0.45}px ${size * 0.6}px rgba(20,90,85,0.3), inset 0 3px 0 rgba(255,255,255,0.45)`,
        textShadow: `0 2px 0 ${c[2]}`,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ------------------------------------------------------------------ kepala & kapsyen
export const Header: React.FC = () => {
  const fr = useCurrentFrame();
  const vis = ci(fr, at(0), at(0.6)) * ci(fr, at(CLIP_END + 0.3), at(CLIP_END + 0.9), 1, 0);
  const t0 = at(0);
  const t1 = at(CLIP_END);
  const prog = ci(fr, t0, t1);
  const cur = CHAPTERS.filter(([, t]) => fr >= at(t)).length - 1;
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 70, opacity: vis, display: 'flex', alignItems: 'center', gap: 22}}>
      <div style={{fontFamily: POP, fontWeight: 800, fontSize: 24, color: '#fff', background: ORANGE, borderRadius: 30, padding: '8px 20px', letterSpacing: 2, boxShadow: `0 5px 0 ${ORANGE_D}`}}>TAZKIRAH</div>
      <div style={{flex: 1}}>
        <div style={{fontFamily: POP, fontWeight: 700, fontSize: 24, color: MUTED, letterSpacing: 3}}>{cur >= 0 ? CHAPTERS[cur][0] : ''}</div>
        <div style={{height: 8, borderRadius: 4, background: 'rgba(93,135,131,0.2)', marginTop: 8, overflow: 'hidden'}}>
          <div style={{width: `${prog * 100}%`, height: '100%', borderRadius: 4, background: `linear-gradient(90deg, ${YELLOW}, ${ORANGE})`}} />
        </div>
      </div>
    </div>
  );
};

// Kapsyen bawah = terjemahan Bahasa Inggeris (infografik di atas sudah memaparkan teks Melayu)
export const Subtitles: React.FC = () => {
  const fr = useCurrentFrame();
  const L = LINES.find((l) => fr >= at(l.s) - 3 && fr < at(l.e));
  if (!L || !L.en) return null;
  const pin = ci(fr, at(L.s) - 3, at(L.s) + 5);
  const pout = ci(fr, at(L.e) - 5, at(L.e));
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1520, display: 'flex', justifyContent: 'center', opacity: pin * (1 - pout), transform: `translateY(${(1 - pin) * 14}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(251,255,254,0.94)', borderRadius: 28, padding: '16px 28px', boxShadow: '0 18px 36px rgba(20,90,85,0.16)'}}>
        <span style={{fontFamily: POP, fontWeight: 800, fontSize: 22, color: '#fff', background: ORANGE, borderRadius: 10, padding: '4px 10px', letterSpacing: 2, flexShrink: 0}}>EN</span>
        <span style={{fontFamily: POP, fontWeight: 600, fontSize: 44, lineHeight: 1.25, color: INK, textAlign: 'center'}}>{L.en}</span>
      </div>
    </div>
  );
};

export const Win: React.FC<{a: number; b: number; fin?: number; fout?: number; children: React.ReactNode}> = ({a, b, fin = 0.3, fout = 0.35, children}) => {
  const fr = useCurrentFrame();
  if (fr < at(a) || fr > at(b)) return null;
  const o = ci(fr, at(a), at(a) + fin * FPS) * ci(fr, at(b) - fout * FPS, at(b), 1, 0);
  const s = ci(fr, at(b) - fout * FPS, at(b), 1, 0.92, easeInOut);
  return <AbsoluteFill style={{opacity: o, transform: `scale(${s})`}}>{children}</AbsoluteFill>;
};

/** Teks Arab dengan sorotan kumpulan perkataan */
export const Arab: React.FC<{text: string; size: number; color?: string; style?: React.CSSProperties}> = ({text, size, color = INK, style}) => (
  <div dir="rtl" style={{fontFamily: ARAB, fontSize: size, color, lineHeight: 1.8, textAlign: 'center', ...style}}>
    {text}
  </div>
);

export const Kicker: React.FC<{p: number; children: React.ReactNode; style?: React.CSSProperties}> = ({p, children, style}) => (
  <div style={{fontFamily: POP, fontWeight: 700, fontSize: 40, color: MUTED, ...rise(p, 30), ...style}}>{children}</div>
);
