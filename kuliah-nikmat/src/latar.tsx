// Latar asli (dilukis dengan SVG/CSS — tiada isu hak cipta). Pilih melalui LATAR di data.ts.
import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {FPS} from './data';

// ------------------------------------------------------------ A. Masjid waktu senja
const Masjid: React.FC<{color: string}> = ({color}) => (
  <svg width={1080} height={520} viewBox="0 0 1080 520" style={{position: 'absolute', left: 0, bottom: 0}}>
    <g fill={color}>
      {/* menara kiri & kanan */}
      {[150, 930].map((x) => (
        <g key={x}>
          <rect x={x - 22} y={110} width={44} height={410} />
          <rect x={x - 32} y={200} width={64} height={14} />
          <rect x={x - 30} y={330} width={60} height={12} />
          <path d={`M${x - 22} 110 Q${x} 40 ${x + 22} 110 Z`} />
          <rect x={x - 2} y={18} width={4} height={40} />
        </g>
      ))}
      {/* kubah besar */}
      <path d="M330 330 Q330 150 540 120 Q750 150 750 330 Z" />
      <rect x={536} y={60} width={8} height={64} />
      <path d="M540 40 a16 16 0 1 0 12 26 a12 12 0 1 1 -12 -26 Z" />
      {/* kubah kecil */}
      <path d="M240 400 Q240 300 320 290 Q400 300 400 400 Z" />
      <path d="M680 400 Q680 300 760 290 Q840 300 840 400 Z" />
      <rect x={200} y={330} width={680} height={190} />
      <rect x={0} y={440} width={1080} height={80} />
    </g>
    {/* tingkap bercahaya */}
    {[420, 480, 540, 600, 660].map((x) => (
      <path key={x} d={`M${x - 16} 470 L${x - 16} 420 Q${x} 396 ${x + 16} 420 L${x + 16} 470 Z`} fill="rgba(255,214,140,0.55)" />
    ))}
  </svg>
);
export const LatarSenja: React.FC = () => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #071a2e 0%, #10324a 38%, #3d4a5c 62%, #a8714a 84%, #e0a95e 100%)'}}>
      {Array.from({length: 70}).map((_, i) => {
        const x = random(`sx${i}`) * 1080;
        const y = random(`sy${i}`) * 1000;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.6 + random(`st${i}`)) + i));
        const r = 1 + random(`sr${i}`) * 2.2;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: r, background: '#fff6dc', opacity: tw * (1 - y / 1200)}} />;
      })}
      {/* bulan sabit */}
      <div style={{position: 'absolute', left: 120, top: 560, width: 130, height: 130, borderRadius: 65, boxShadow: '28px -10px 0 0 #fbeec4', transform: `rotate(${-10 + Math.sin(t * 0.2) * 2}deg)`, filter: 'drop-shadow(0 0 30px rgba(251,238,196,0.5))'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 700, background: 'radial-gradient(ellipse at 50% 100%, rgba(255,190,110,0.35) 0%, rgba(0,0,0,0) 65%)'}} />
      <Masjid color="#0a1420" />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(4,10,18,0.55) 0%, rgba(4,10,18,0.2) 45%, rgba(4,10,18,0.35) 100%)'}} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ B. Pelita & cahaya lembut
const Pelita: React.FC<{x: number; len: number; s: number; t: number; ph: number}> = ({x, len, s, t, ph}) => {
  const sw = Math.sin(t * 0.9 + ph) * 3;
  return (
    <div style={{position: 'absolute', left: x, top: 0, transformOrigin: '0 0', transform: `rotate(${sw}deg)`}}>
      <div style={{width: 2, height: len, background: 'rgba(230,195,106,0.7)', marginLeft: -1}} />
      <svg width={90 * s} height={150 * s} viewBox="0 0 90 150" style={{marginLeft: -45 * s, marginTop: -4, filter: 'drop-shadow(0 0 26px rgba(255,190,90,0.75))'}}>
        <path d="M45 0 L58 18 L32 18 Z" fill="#c99a3c" />
        <path d="M30 18 L60 18 L80 60 L66 120 L24 120 L10 60 Z" fill="#c99a3c" />
        <path d="M34 26 L56 26 L70 60 L58 110 L32 110 L20 60 Z" fill="#ffd98a" />
        <path d="M45 30 L45 108 M28 60 L62 60" stroke="#c99a3c" strokeWidth={3} />
        <path d="M24 120 L66 120 L56 136 L34 136 Z" fill="#c99a3c" />
        <circle cx={45} cy={144} r={5} fill="#c99a3c" />
      </svg>
    </div>
  );
};
export const LatarPelita: React.FC = () => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 30%, #2a1f14 0%, #160f0a 55%, #0a0706 100%)'}}>
      {Array.from({length: 26}).map((_, i) => {
        const r = 40 + random(`br${i}`) * 110;
        const x = (random(`bx${i}`) * 1300 + t * (6 + random(`bv${i}`) * 10)) % 1300 - 110;
        const y = 200 + random(`by${i}`) * 1700 - ((t * (8 + random(`bw${i}`) * 12)) % 300);
        const o = 0.05 + 0.12 * random(`bo${i}`) * (0.7 + 0.3 * Math.sin(t + i));
        return <div key={i} style={{position: 'absolute', left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle, rgba(255,196,110,${o * 2}) 0%, rgba(255,196,110,${o}) 45%, rgba(255,196,110,0) 70%)`}} />;
      })}
      <Pelita x={130} len={300} s={0.9} t={t} ph={0} />
      <Pelita x={330} len={120} s={0.65} t={t} ph={1.3} />
      <Pelita x={760} len={170} s={0.7} t={t} ph={2.1} />
      <Pelita x={960} len={360} s={0.95} t={t} ph={0.7} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.65) 100%)'}} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------ C. Gerbang mihrab
export const LatarGerbang: React.FC = () => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  const arch = (w: number, h: number) => {
    const x0 = 540 - w / 2;
    const x1 = 540 + w / 2;
    const top = 1920 - h;
    return `M${x0} 1920 L${x0} ${top + w * 0.55} Q${x0} ${top + w * 0.1} 540 ${top} Q${x1} ${top + w * 0.1} ${x1} ${top + w * 0.55} L${x1} 1920`;
  };
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #06222c 0%, #0b3a3f 50%, #0d2a2a 100%)'}}>
      {/* sinar cahaya dari atas */}
      <AbsoluteFill style={{background: `conic-gradient(from 180deg at 50% -10%, rgba(0,0,0,0) 160deg, rgba(255,226,160,0.10) ${172 + Math.sin(t * 0.3) * 3}deg, rgba(0,0,0,0) 180deg, rgba(255,226,160,0.08) ${190 + Math.sin(t * 0.25) * 3}deg, rgba(0,0,0,0) 200deg)`}} />
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        {[0, 1, 2, 3, 4].map((i) => {
          const k = 1 - i * 0.16;
          return <path key={i} d={arch(1000 * k, 1800 * k)} fill="none" stroke="#e6c36a" strokeOpacity={0.32 - i * 0.05} strokeWidth={6 - i} />;
        })}
        <path d={arch(1000, 1800) + ' Z'} fill="rgba(230,195,106,0.03)" />
      </svg>
      {Array.from({length: 30}).map((_, i) => {
        const x = random(`dx${i}`) * 1080;
        const y = (random(`dy${i}`) * 1920 - t * (10 + random(`dv${i}`) * 20)) % 1920;
        return <div key={i} style={{position: 'absolute', left: x, top: (y + 1920) % 1920, width: 4, height: 4, borderRadius: 2, background: '#ffe3a0', opacity: 0.25 + 0.3 * Math.sin(t * 2 + i)}} />;
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%)'}} />
    </AbsoluteFill>
  );
};
