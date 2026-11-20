import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {geoMercator, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import countries from 'world-atlas/countries-50m.json';
import {at, CLIP_END, FPS, LEAD, CLIP_START} from './data';
import {backOut, BEBAS, BONE, center, ci, DIM, easeInOut, easeOut, GOTH, pop, RED, rise, SANS, TYPE, Typed, useP, Win} from './ui';

const abs = (fr: number) => fr / FPS + CLIP_START - LEAD;

// ================================================================ 0. INTRO
export const Intro: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const line = ci(fr, 4, 30, 0, 1, easeInOut);
  const up = P(72.1, 0.6, easeInOut);
  return (
    <Win a={70.4} b={75.3} fin={0.01} fout={0.25}>
      <AbsoluteFill style={{...center, transform: `translateY(${-up * 520}px) scale(${1 - up * 0.35})`, opacity: 1 - up * 0.15}}>
        <div style={{fontFamily: TYPE, color: DIM, fontSize: 34, letterSpacing: 8, marginBottom: 24, opacity: ci(fr, 30, 42)}}>— PETIKAN CERAMAH —</div>
        <div style={{width: 820 * line, height: 3, background: RED, boxShadow: `0 0 20px ${RED}`}} />
        <div style={{height: 110, marginTop: 30}}>
          <Typed text="KISAH DI SEBALIK LAGU" t={70.75} cps={22} style={{fontFamily: TYPE, color: BONE, fontSize: 62, letterSpacing: 4}} />
        </div>
        <div style={{width: 820 * line, height: 3, background: RED, boxShadow: `0 0 20px ${RED}`}} />
        <div style={{fontFamily: GOTH, color: BONE, fontSize: 64, marginTop: 34, opacity: ci(fr, 26, 40)}}>Ustaz Auni Mohamed</div>
      </AbsoluteFill>

      {/* "Antara lagu ... paling awal" */}
      <AbsoluteFill style={{...center, top: 120}}>
        <div style={{fontFamily: BEBAS, fontSize: 150, color: BONE, letterSpacing: 6, lineHeight: 1, ...rise(P(72.28))}}>ANTARA LAGU</div>
        <div
          style={{
            fontFamily: BEBAS,
            fontSize: 210,
            lineHeight: 1,
            letterSpacing: 6,
            color: 'transparent',
            WebkitTextStroke: `4px ${RED}`,
            ...pop(P(73.58, 0.5), 1.5),
          }}
        >
          PALING AWAL
        </div>
        <div style={{fontFamily: TYPE, fontSize: 40, color: DIM, marginTop: 20, letterSpacing: 4, opacity: P(74.3)}}>
          ...IALAH DARIPADA
        </div>
      </AbsoluteFill>
    </Win>
  );
};

// ======================================================= 1. MCR -> akronim
const ROWS = [
  {L: 'M', rest: 'Y', t: 78.48},
  {L: 'C', rest: 'HEMICAL', t: 78.72},
  {L: 'R', rest: 'OMANCE', t: 80.66},
];
export const MCR: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const slam = P(75.16, 0.35, backOut);
  const st = P(77.9, 0.55, easeInOut); // ke susunan menegak
  const q = P(77.16, 0.3, backOut) * (1 - st);
  const size = interpolate(st, [0, 1], [430, 250]);
  const lw = size * 0.44;
  return (
    <Win a={75.1} b={81.45} fin={0.01} fout={0.3}>
      {ROWS.map((r, i) => {
        const hx = 540 - 1.5 * lw + i * lw;
        const hy = 960 - size * 0.5;
        const sx = 110;
        const sy = 520 + i * 270;
        const left = interpolate(st, [0, 1], [hx, sx]);
        const top = interpolate(st, [0, 1], [hy, sy]);
        const rev = P(r.t, 0.5);
        return (
          <div key={r.L} style={{position: 'absolute', left, top, display: 'flex', alignItems: 'baseline', fontFamily: BEBAS, fontSize: size, lineHeight: 1}}>
            <span
              style={{
                display: 'inline-block',
                width: lw,
                textAlign: 'center',
                color: st > 0.5 ? RED : BONE,
                textShadow: `0 0 40px rgba(208,20,44,${0.5 + 0.3 * Math.sin(fr / 6)}), 10px 10px 0 ${st > 0.5 ? 'rgba(0,0,0,0.6)' : RED}`,
                transform: `scale(${interpolate(slam, [0, 1], [2.6, 1])})`,
                opacity: Math.min(1, slam * 2),
              }}
            >
              {r.L}
            </span>
            <span style={{display: 'inline-block', overflow: 'hidden', maxWidth: rev * 900, whiteSpace: 'nowrap', color: BONE, paddingLeft: 6}}>
              <span style={{display: 'inline-block', transform: `translateX(${(1 - rev) * -80}px)`, opacity: rev}}>{r.rest}</span>
            </span>
          </div>
        );
      })}
      {/* tanda soal "Tahu MCR?" */}
      <div
        style={{
          position: 'absolute',
          left: 540 + 1.5 * 430 * 0.44 - 20,
          top: 640,
          fontFamily: BEBAS,
          fontSize: 260,
          color: RED,
          transform: `scale(${q}) rotate(12deg)`,
          opacity: q,
        }}
      >
        ?
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1330, ...center, ...rise(P(79.2))}}>
        <div style={{display: 'flex', gap: 18}}>
          {['BAND ROCK', 'NEW JERSEY, AS', 'SEJAK 2001'].map((c, i) => (
            <div
              key={c}
              style={{
                fontFamily: TYPE,
                fontSize: 32,
                color: BONE,
                border: `2px solid rgba(238,231,216,0.5)`,
                padding: '10px 20px',
                opacity: P(79.2 + i * 0.25),
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>
    </Win>
  );
};

// ================================================== 2. The Black Parade
const Vinyl: React.FC<{r: number}> = ({r}) => (
  <svg width={760} height={760} viewBox="-380 -380 760 760" style={{transform: `rotate(${r}deg)`}}>
    <circle r={370} fill="#0d0d0f" stroke="rgba(238,231,216,0.15)" strokeWidth={3} />
    {Array.from({length: 22}).map((_, i) => (
      <circle key={i} r={140 + i * 10} fill="none" stroke="rgba(238,231,216,0.06)" strokeWidth={1.5} />
    ))}
    <path d="M -300 -120 A 330 330 0 0 1 -120 -300" stroke="rgba(238,231,216,0.18)" strokeWidth={14} fill="none" />
    <circle r={120} fill={RED} />
    <circle r={120} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={8} />
    <text y={-30} textAnchor="middle" fill={BONE} fontFamily="Bebas Neue" fontSize={40}>
      MCR
    </text>
    <text y={40} textAnchor="middle" fill={BONE} fontFamily="Special Elite" fontSize={20}>
      — 2006 —
    </text>
    <circle r={12} fill="#08080a" />
  </svg>
);
export const BlackParade: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const v = P(81.2, 0.9);
  const words = ['Welcome', 'to', 'the'];
  return (
    <Win a={81.2} b={83.55} fin={0.15} fout={0.3}>
      <AbsoluteFill style={{...center, opacity: 0.55 * v, transform: `scale(${0.8 + 0.2 * v})`}}>
        <Vinyl r={fr * 2.2} />
      </AbsoluteFill>
      <AbsoluteFill style={{...center, background: 'radial-gradient(circle, rgba(8,8,10,0.75) 0%, rgba(8,8,10,0) 60%)'}}>
        <div style={{fontFamily: TYPE, fontSize: 38, color: DIM, letterSpacing: 10, ...rise(P(81.4))}}>LAGU</div>
        <div style={{display: 'flex', gap: 22, marginTop: 18}}>
          {words.map((w, i) => (
            <span key={w} style={{fontFamily: GOTH, fontSize: 96, color: BONE, ...rise(P(81.5 + i * 0.1), 40)}}>
              {w}
            </span>
          ))}
        </div>
        <div style={{fontFamily: GOTH, fontSize: 250, color: BONE, lineHeight: 0.95, textShadow: `0 0 50px ${RED}`, ...pop(P(81.86, 0.4), 1.6)}}>
          Black
        </div>
        <div style={{fontFamily: GOTH, fontSize: 250, color: RED, lineHeight: 0.95, ...pop(P(82.14, 0.4), 1.6)}}>Parade</div>
        <div style={{width: 600 * P(82.4, 0.6), height: 3, background: BONE, marginTop: 28}} />
        <div style={{fontFamily: TYPE, fontSize: 30, color: BONE, marginTop: 18, letterSpacing: 4, opacity: P(82.5)}}>
          MY CHEMICAL ROMANCE · 2006
        </div>
      </AbsoluteFill>
    </Win>
  );
};

// ======================================================= 3. Saya minat
const Heart: React.FC<{s: number}> = ({s}) => (
  <svg width={150} height={140} viewBox="0 0 24 22" style={{transform: `scale(${s})`}}>
    <path d="M12 21 C 5 15, 0 11, 0 6 A 6 6 0 0 1 12 3.5 A 6 6 0 0 1 24 6 C 24 11, 19 15, 12 21 Z" fill={RED} />
  </svg>
);
const EQ: React.FC<{fr: number; on: number}> = ({fr, on}) => (
  <div style={{display: 'flex', alignItems: 'flex-end', gap: 8, height: 110}}>
    {Array.from({length: 7}).map((_, i) => (
      <div
        key={i}
        style={{width: 16, background: RED, height: 18 + on * (40 + 50 * Math.abs(Math.sin(fr / 4 + i * 1.3)) * (0.6 + 0.4 * random(`eq${i}${Math.floor(fr / 4)}`)))}}
      />
    ))}
  </div>
);
const Wave: React.FC<{fr: number; on: number}> = ({fr, on}) => {
  const pts = Array.from({length: 60}, (_, i) => {
    const x = i * 3.6;
    const y = 55 + on * Math.sin(i / 4 + fr / 5) * 30 * Math.sin((i / 59) * Math.PI);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={216} height={110}>
      <polyline points={pts} fill="none" stroke={RED} strokeWidth={6} strokeLinecap="round" />
    </svg>
  );
};
export const Minat: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const up = P(87.2, 0.5, easeInOut);
  const beat = 1 + 0.12 * Math.max(0, Math.sin((fr - at(86.52)) / 4.5)) * (fr > at(86.52) ? 1 : 0);
  const stamp = P(89.54, 0.3, backOut);
  return (
    <Win a={83.5} b={90.35} fin={0.2} fout={0.15}>
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: interpolate(up, [0, 1], [560, 330])}}>
        <div style={{transform: `scale(${1 - 0.45 * up})`, transformOrigin: '50% 0%', ...center}}>
          <div style={{fontFamily: TYPE, fontSize: 40, color: DIM, letterSpacing: 6, ...rise(P(83.58))}}>LAGU INI</div>
          <div style={{fontFamily: BEBAS, fontSize: 190, color: BONE, lineHeight: 1, marginTop: 10, ...pop(P(84.68), 1.4)}}>CUKUP SINONIM</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 30, marginTop: 20, ...rise(P(85.66))}}>
            <span style={{fontFamily: BEBAS, fontSize: 120, color: RED, lineHeight: 1}}>& SAYA MINAT</span>
            <div style={{opacity: P(86.52, 0.25)}}>
              <Heart s={beat * P(86.52, 0.35, backOut)} />
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{...center, top: 330, opacity: P(87.34)}}>
        <div style={{fontFamily: TYPE, fontSize: 40, color: DIM, letterSpacing: 6, marginBottom: 40}}>BUKAN SAHAJA...</div>
        <div style={{display: 'flex', gap: 40, position: 'relative'}}>
          {[
            {n: 'IRAMA', t: 88.02, icon: <EQ fr={fr} on={P(88.02)} />},
            {n: 'MELODI', t: 88.82, icon: <Wave fr={fr} on={P(88.82)} />},
          ].map((c) => {
            const p = P(c.t, 0.4, backOut);
            return (
              <div
                key={c.n}
                style={{
                  width: 400,
                  height: 380,
                  border: `3px solid ${p > 0.5 ? RED : 'rgba(238,231,216,0.25)'}`,
                  background: 'rgba(20,10,12,0.75)',
                  ...center,
                  gap: 26,
                  transform: `scale(${0.85 + 0.15 * p})`,
                  opacity: 0.35 + 0.65 * Math.min(1, p),
                }}
              >
                {c.icon}
                <div style={{fontFamily: BEBAS, fontSize: 110, color: BONE, lineHeight: 1}}>{c.n}</div>
                <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 44, color: RED, opacity: p}}>✓</div>
              </div>
            );
          })}
        <div
          style={{
            position: 'absolute',
            left: 230,
            top: 120,
            fontFamily: BEBAS,
            fontSize: 170,
            color: RED,
            border: `8px solid ${RED}`,
            padding: '0 40px',
            lineHeight: 1.1,
            background: 'rgba(8,8,10,0.85)',
            transform: `rotate(-8deg) scale(${interpolate(stamp, [0, 1], [2.5, 1])})`,
            opacity: Math.min(1, stamp * 2),
          }}
        >
          BAGUS!
        </div>
        </div>
      </AbsoluteFill>
    </Win>
  );
};

// ============================================== 4. TAPI... Dajjal, 70,000, Khurasan
const land = feature(countries as any, (countries as any).objects.countries) as any;
const KHURASAN: [number, number] = [59.6, 36.3]; // Mashhad, wilayah Khurasan

const MapK: React.FC<{p: number; fr: number}> = ({p, fr}) => {
  const Wm = 960;
  const Hm = 720;
  const proj = geoMercator()
    .center([56, 34])
    .scale(interpolate(p, [0, 1], [1100, 1650]))
    .translate([Wm / 2, Hm / 2]);
  const path = geoPath(proj);
  const [px, py] = proj(KHURASAN) as [number, number];
  const ring = (fr % 45) / 45;
  return (
    <svg width={Wm} height={Hm} style={{border: '2px solid rgba(238,231,216,0.25)', background: 'rgba(14,12,14,0.85)'}}>
      <defs>
        <radialGradient id="kglow">
          <stop offset="0%" stopColor={RED} stopOpacity={0.75} />
          <stop offset="100%" stopColor={RED} stopOpacity={0} />
        </radialGradient>
      </defs>
      {Array.from({length: 9}).map((_, i) => (
        <line key={`g${i}`} x1={0} x2={Wm} y1={i * 90} y2={i * 90} stroke="rgba(238,231,216,0.05)" />
      ))}
      {land.features.map((f: any, i: number) => (
        <path key={i} d={path(f) ?? ''} fill="#1b1a1d" stroke="rgba(238,231,216,0.35)" strokeWidth={1.2} />
      ))}
      <ellipse cx={px + 30} cy={py + 20} rx={230 * p} ry={150 * p} fill="url(#kglow)" />
      {/* arah pergerakan */}
      <path
        d={`M ${px} ${py} Q ${px - 220} ${py - 140} ${px - 420} ${py - 60}`}
        fill="none"
        stroke={BONE}
        strokeWidth={4}
        strokeDasharray="14 12"
        strokeDashoffset={-fr * 1.5}
        opacity={ci(p, 0.5, 1)}
      />
      <circle cx={px} cy={py} r={14 + ring * 70} fill="none" stroke={RED} strokeWidth={4} opacity={1 - ring} />
      <circle cx={px} cy={py} r={14} fill={RED} stroke={BONE} strokeWidth={4} />
      <text x={px + 30} y={py + 60} fill={BONE} fontFamily="Bebas Neue" fontSize={72} letterSpacing={3}>
        KHURASAN
      </text>
      <text x={px + 32} y={py + 96} fill={DIM} fontFamily="Special Elite" fontSize={24}>
        36°N · 59°E
      </text>
    </svg>
  );
};

export const Dajjal: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const tapiIn = P(90.38, 0.3, backOut);
  const tapiUp = P(90.85, 0.45, easeInOut);
  const dIn = P(93.24, 0.3, backOut);
  const phB = P(94.0, 0.5, easeInOut); // Dajjal naik, kaunter
  const phC = P(96.1, 0.6, easeInOut); // peta
  const n = Math.round(interpolate(P(94.08, 1.35, easeOut), [0, 1], [0, 70000]));
  const glitch = fr - at(93.24) >= 0 && fr - at(93.24) < 14 ? (random(`gl${fr}`) - 0.5) * 30 : 0;
  return (
    <Win a={90.3} b={98.8} fin={0.01} fout={0.3}>
      {/* TAPI */}
      <AbsoluteFill style={{...center, justifyContent: 'flex-start'}}>
        <div
          style={{
            marginTop: interpolate(tapiUp, [0, 1], [700, 290]),
            fontFamily: BEBAS,
            fontSize: interpolate(tapiUp, [0, 1], [420, 110]),
            lineHeight: 1,
            color: RED,
            letterSpacing: 10,
            opacity: Math.min(1, tapiIn * 2) * (1 - phC),
            transform: `scale(${interpolate(tapiIn, [0, 1], [1.8, 1])})`,
          }}
        >
          TAPI...
        </div>
        <div style={{height: 60, opacity: 1 - phB}}>
          <Typed text="IA MENCERITAKAN TENTANG" t={90.82} cps={30} style={{fontFamily: TYPE, fontSize: 42, color: BONE, letterSpacing: 3}} />
        </div>
      </AbsoluteFill>

      {/* KELUARNYA DAJJAL */}
      <AbsoluteFill style={{...center, justifyContent: 'flex-start'}}>
        <div
          style={{
            marginTop: interpolate(phB, [0, 1], [640, 470]) - phC * 90,
            transform: `scale(${1 - phB * 0.45 - phC * 0.1})`,
            transformOrigin: '50% 0%',
            ...center,
          }}
        >
          <div style={{fontFamily: BEBAS, fontSize: 150, color: BONE, letterSpacing: 12, lineHeight: 1, ...rise(P(92.62))}}>KELUARNYA</div>
          <div style={{position: 'relative', fontFamily: BEBAS, fontSize: 360, lineHeight: 0.95, opacity: Math.min(1, dIn * 2)}}>
            <span style={{position: 'absolute', left: glitch, color: '#00e5ff', opacity: glitch ? 0.6 : 0, mixBlendMode: 'screen'}}>DAJJAL</span>
            <span style={{position: 'absolute', left: -glitch, color: '#ff0040', opacity: glitch ? 0.8 : 0, mixBlendMode: 'screen'}}>DAJJAL</span>
            <span style={{position: 'relative', color: RED, display: 'inline-block', transform: `scale(${interpolate(dIn, [0, 1], [2.2, 1])})`, textShadow: '0 0 60px rgba(208,20,44,0.7)'}}>
              DAJJAL
            </span>
          </div>
        </div>
      </AbsoluteFill>

      {/* 70,000 YAHUDI */}
      <AbsoluteFill style={{...center, justifyContent: 'flex-start'}}>
        <div
          style={{
            marginTop: 880,
            opacity: phB * (1 - phC),
            display: 'flex',
            alignItems: 'baseline',
            gap: 30,
          }}
        >
          <span style={{fontFamily: SANS, fontWeight: 300, fontSize: 70, color: DIM}}>+</span>
          <span style={{fontFamily: BEBAS, fontSize: 280, color: BONE, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{n.toLocaleString('en-US')}</span>
        </div>
        <div
          style={{
            marginTop: -20,
            fontFamily: BEBAS,
            fontSize: 140,
            color: RED,
            letterSpacing: 24,
            ...pop(P(95.56, 0.35), 1.4),
            opacity: Math.min(1, P(95.56, 0.35) * 3) * (1 - phC),
          }}
        >
          YAHUDI
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 610}}>
        <div style={{fontFamily: BEBAS, fontSize: 100, color: BONE, letterSpacing: 6, lineHeight: 1, opacity: phC}}>
          + 70,000 <span style={{color: RED}}>YAHUDI</span>
        </div>
      </AbsoluteFill>

      {/* Peta Khurasan */}
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 800}}>
        <div style={{opacity: phC, transform: `translateY(${(1 - phC) * 80}px)`, ...center}}>
          <div style={{fontFamily: TYPE, fontSize: 36, color: BONE, letterSpacing: 6, marginBottom: 14}}>DARI ARAH ▸</div>
          <MapK p={phC} fr={fr} />
        </div>
      </AbsoluteFill>
    </Win>
  );
};

// ==================================================== 5. Perhatikan
export const Perhatikan: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const open = P(98.9, 0.5, easeInOut);
  const look = Math.sin(fr / 9) * 22;
  return (
    <Win a={98.75} b={100.85} fin={0.15} fout={0.2}>
      <AbsoluteFill style={{...center}}>
        <svg width={620} height={340} viewBox="-310 -170 620 340">
          <defs>
            <clipPath id="eyeclip">
              <path d={`M -280 0 Q 0 ${-210 * open} 280 0 Q 0 ${210 * open} -280 0 Z`} />
            </clipPath>
          </defs>
          <path d={`M -280 0 Q 0 ${-210 * open} 280 0 Q 0 ${210 * open} -280 0 Z`} fill="#141215" stroke={BONE} strokeWidth={8} />
          <g clipPath="url(#eyeclip)">
            <circle cx={look} cy={0} r={100} fill={RED} />
            <circle cx={look} cy={0} r={46} fill="#08080a" />
            <circle cx={look + 26} cy={-28} r={14} fill={BONE} />
          </g>
          {[-200, -100, 0, 100, 200].map((x) => (
            <line key={x} x1={x * 0.9} y1={-118 * open - 20} x2={x * 1.05} y2={-150 * open - 30} stroke={BONE} strokeWidth={6} opacity={open} />
          ))}
        </svg>
        <div style={{fontFamily: BEBAS, fontSize: 170, color: BONE, lineHeight: 1, marginTop: 40, ...rise(P(99.1))}}>PERHATIKAN</div>
        <div style={{fontFamily: BEBAS, fontSize: 200, color: RED, lineHeight: 1, ...pop(P(99.64), 1.5)}}>BETUL-BETUL</div>
      </AbsoluteFill>
    </Win>
  );
};

// ================================================ 6. Piramid penyambut
const TIERS = [
  {n: 'ELIT', t: 104.02},
  {n: 'TERNAMA', t: 105.62},
  {n: 'BANGSAWAN', t: 107.4},
  {n: 'ARTIS-ARTIS', t: 108.3},
];
export const Piramid: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const ax = 540;
  const ay = 640;
  const by = 1420;
  const bw = 940;
  const th = (by - ay) / 4;
  const xAt = (y: number) => ((y - ay) / (by - ay)) * (bw / 2);
  const gap = 10;
  const eye = P(110.36, 0.6);
  return (
    <Win a={100.8} b={113.95} fin={0.2} fout={0.3}>
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 280}}>
        <div style={{fontFamily: TYPE, fontSize: 40, color: DIM, letterSpacing: 6, ...rise(P(100.84))}}>DAJJAL</div>
        <div style={{fontFamily: BEBAS, fontSize: 150, color: BONE, lineHeight: 1, ...rise(P(101.42))}}>
          DISAMBUT <span style={{color: RED}}>OLEH</span>
        </div>
      </AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        {TIERS.map((T, i) => {
          const p = P(T.t, 0.45, backOut);
          const y0 = ay + i * th + (i ? gap / 2 : 0);
          const y1 = ay + (i + 1) * th - gap / 2;
          const pts = i === 0 ? `${ax},${y0} ${ax + xAt(y1)},${y1} ${ax - xAt(y1)},${y1}` : `${ax - xAt(y0)},${y0} ${ax + xAt(y0)},${y0} ${ax + xAt(y1)},${y1} ${ax - xAt(y1)},${y1}`;
          const ty = i === 0 ? y1 - 22 : (y0 + y1) / 2 + 30;
          const hot = fr >= at(T.t) && (i === 3 || fr < at(TIERS[i + 1].t));
          const sponsored = i === 3 ? P(109.28, 0.3) : 0;
          return (
            <g key={T.n} opacity={Math.min(1, p * 1.5)} transform={`translate(0 ${(1 - Math.min(1, p)) * 60})`}>
              <polygon points={pts} fill={hot ? 'rgba(208,20,44,0.85)' : 'rgba(30,26,30,0.95)'} stroke={BONE} strokeOpacity={0.5} strokeWidth={3} />
              <text x={ax} y={ty} textAnchor="middle" fill={BONE} fontFamily="Bebas Neue" fontSize={i === 0 ? 64 : 96} letterSpacing={6}>
                {T.n}
              </text>
              {i === 3 && (
                <g opacity={sponsored} transform={`translate(${ax + 300} ${y0 - 10}) rotate(-10) scale(${0.6 + 0.4 * sponsored})`}>
                  <rect x={-90} y={-38} width={180} height={64} fill="#08080a" stroke={RED} strokeWidth={5} />
                  <text x={0} y={12} textAnchor="middle" fill={RED} fontFamily="Bebas Neue" fontSize={52} letterSpacing={4}>
                    DITAJA
                  </text>
                </g>
              )}
              <text x={ax - xAt(y1) - 6} y={y1 - 12} textAnchor="end" fill={DIM} fontFamily="Special Elite" fontSize={26}>
                {`0${i + 1}`}
              </text>
            </g>
          );
        })}
        {/* mata di puncak */}
        <g opacity={eye} transform={`translate(${ax} ${ay + 62}) scale(0.6)`}>
          <path d={`M -44 0 Q 0 ${-34 * eye} 44 0 Q 0 ${34 * eye} -44 0 Z`} fill={BONE} />
          <circle r={15} fill="#08080a" />
          {Array.from({length: 12}).map((_, k) => {
            const a = (k / 12) * Math.PI * 2 + fr / 40;
            return <line key={k} x1={Math.cos(a) * 60} y1={Math.sin(a) * 60} x2={Math.cos(a) * (80 + 20 * eye)} y2={Math.sin(a) * (80 + 20 * eye)} stroke={RED} strokeWidth={4} />;
          })}
        </g>
        {/* penaja: Freemason / Illuminati */}
        {[
          {n: 'FREEMASON', t: 111.28, x: 230},
          {n: 'ILLUMINATI', t: 112.42, x: 850},
        ].map((b) => {
          const p = P(b.t, 0.4, backOut);
          const by2 = 560;
          return (
            <g key={b.n} opacity={Math.min(1, p * 1.5)}>
              <line x1={b.x} y1={by2 + 40} x2={b.x < ax ? ax - 300 : ax + 300} y2={1320} stroke={RED} strokeWidth={3} strokeDasharray="10 10" strokeDashoffset={-fr} opacity={ci(p, 0.6, 1)} />
              <g transform={`translate(${b.x} ${by2}) scale(${0.5 + 0.5 * p})`}>
                <rect x={-175} y={-50} width={350} height={92} fill="#08080a" stroke={BONE} strokeWidth={3} />
                <text x={0} y={22} textAnchor="middle" fill={BONE} fontFamily="Bebas Neue" fontSize={70} letterSpacing={4}>
                  {b.n}
                </text>
              </g>
            </g>
          );
        })}
        <text x={ax} y={572} textAnchor="middle" fill={RED} fontFamily="Special Elite" fontSize={34} opacity={P(111.9)}>
          atau
        </text>
      </svg>
    </Win>
  );
};

// ================================================= 7. Perarakan
const Marcher: React.FC<{x: number; y: number; s: number; step: number; hue: string}> = ({x, y, s, step, hue}) => (
  <g transform={`translate(${x} ${y + Math.abs(Math.sin(step)) * -6 * s}) scale(${s})`}>
    <rect x={-14} y={-150} width={28} height={36} fill={hue} />
    <rect x={-20} y={-116} width={40} height={6} fill={hue} />
    <circle cx={0} cy={-98} r={13} fill={hue} />
    <path d="M -20 -84 L 20 -84 L 24 -30 L -24 -30 Z" fill={hue} />
    <line x1={-8} y1={-30} x2={-8 + Math.sin(step) * 14} y2={0} stroke={hue} strokeWidth={11} />
    <line x1={8} y1={-30} x2={8 - Math.sin(step) * 14} y2={0} stroke={hue} strokeWidth={11} />
    <line x1={24} y1={-80} x2={30} y2={-160} stroke={hue} strokeWidth={4} />
  </g>
);
export const Perarakan: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const rows = [
    {y: 1020, s: 0.7, n: 14, sp: 2.0, c: 'rgba(238,231,216,0.18)'},
    {y: 1180, s: 0.95, n: 11, sp: 2.8, c: 'rgba(238,231,216,0.32)'},
    {y: 1390, s: 1.3, n: 8, sp: 3.8, c: 'rgba(12,10,12,1)'},
  ];
  return (
    <Win a={113.9} b={117.0} fin={0.2} fout={0.25}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <rect x={0} y={1390} width={1080} height={20} fill="rgba(208,20,44,0.5)" />
        {rows.map((r, ri) =>
          Array.from({length: r.n}).map((_, i) => {
            const spacing = 1300 / r.n;
            const x = ((i * spacing + fr * r.sp) % 1300) - 110;
            return <Marcher key={`${ri}-${i}`} x={x} y={r.y} s={r.s} step={fr / 3.5 + i} hue={ri === 2 ? (i % 3 === 0 ? RED : '#1d1a1d') : r.c} />;
          })
        )}
        {/* bendera */}
        <g transform={`translate(${((fr * 3.8 + 600) % 1300) - 110} 1210)`}>
          <line x1={0} y1={0} x2={0} y2={-330} stroke={BONE} strokeWidth={5} />
          <path d={`M 0 -330 Q 60 ${-320 + Math.sin(fr / 4) * 14} 120 -330 L 120 -250 Q 60 ${-240 + Math.sin(fr / 4) * 14} 0 -250 Z`} fill={RED} />
        </g>
      </svg>
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 330}}>
        <div style={{fontFamily: TYPE, fontSize: 40, color: DIM, letterSpacing: 6, ...rise(P(114.0))}}>ADA SATU</div>
        <div style={{fontFamily: BEBAS, fontSize: 200, color: BONE, lineHeight: 1, ...pop(P(115.06, 0.35), 1.5)}}>PERARAKAN</div>
        <div style={{fontFamily: BEBAS, fontSize: 170, color: RED, lineHeight: 1, ...pop(P(115.78, 0.35), 1.6)}}>BESAR-BESARAN</div>
      </AbsoluteFill>
    </Win>
  );
};

// =============================================== 8. Fail rumusan
const FACTS = [
  {k: 'PERISTIWA', v: 'KELUARNYA DAJJAL', t: 118.6},
  {k: 'BERSAMA', v: '70,000 YAHUDI', t: 119.74},
  {k: 'PAKAIAN', v: 'TAYALISAH', note: 'sejenis selendang / kain penutup', t: 121.84},
  {k: 'DARI ARAH', v: 'KHURASAN', t: 124.44},
];
export const Fail: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const card = P(117.0, 0.5);
  return (
    <Win a={116.9} b={125.95} fin={0.2} fout={0.3}>
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 280}}>
        <div style={{fontFamily: BEBAS, fontSize: 130, color: BONE, lineHeight: 1, ...rise(P(116.96))}}>
          INILAH <span style={{color: RED}}>GAMBARNYA</span>
        </div>
        <div
          style={{
            marginTop: 40,
            width: 940,
            border: `3px solid ${RED}`,
            background: 'rgba(14,10,12,0.9)',
            padding: '30px 40px 40px',
            opacity: card,
            transform: `translateY(${(1 - card) * 60}px)`,
            position: 'relative',
          }}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: TYPE, fontSize: 28, color: DIM, letterSpacing: 3, borderBottom: '2px dashed rgba(238,231,216,0.25)', paddingBottom: 18}}>
            <span>FAIL // AKHIR ZAMAN</span>
            <span style={{color: RED}}>NO. 01</span>
          </div>
          {FACTS.map((f, i) => {
            const p = P(f.t, 0.35, backOut);
            const on = fr >= at(f.t);
            return (
              <div key={f.k} style={{display: 'flex', alignItems: 'center', gap: 30, marginTop: 34, opacity: 0.25 + 0.75 * Math.min(1, p)}}>
                <div
                  style={{
                    width: 84,
                    height: 84,
                    border: `3px solid ${on ? RED : 'rgba(238,231,216,0.3)'}`,
                    background: on ? RED : 'transparent',
                    ...center,
                    fontFamily: BEBAS,
                    fontSize: 56,
                    color: BONE,
                    flexShrink: 0,
                  }}
                >
                  {on ? '✓' : `0${i + 1}`}
                </div>
                <div>
                  <div style={{fontFamily: TYPE, fontSize: 28, color: DIM, letterSpacing: 4}}>{f.k}</div>
                  <div style={{fontFamily: BEBAS, fontSize: 96, color: BONE, lineHeight: 1, transform: `translateX(${(1 - Math.min(1, p)) * 50}px)`}}>
                    {on ? f.v : '—'}
                  </div>
                  {f.note && <div style={{fontFamily: TYPE, fontSize: 26, color: DIM, opacity: P(f.t + 0.4)}}>({f.note})</div>}
                </div>
              </div>
            );
          })}
          {/* cop */}
          <div
            style={{
              position: 'absolute',
              right: 30,
              bottom: 40,
              fontFamily: BEBAS,
              fontSize: 64,
              color: RED,
              border: `5px solid ${RED}`,
              padding: '0 18px',
              transform: `rotate(-12deg) scale(${interpolate(P(124.8, 0.3, backOut), [0, 1], [2.4, 1])})`,
              opacity: Math.min(1, P(124.8, 0.3) * 2) * 0.9,
            }}
          >
            PERHATIAN
          </div>
        </div>
      </AbsoluteFill>
    </Win>
  );
};

// =============================================== 9. Diulang balik
export const Ulang: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const rot = (fr - at(125.9)) * 3 + P(126.36, 0.6) * 180;
  return (
    <Win a={125.85} b={CLIP_END + 0.3} fin={0.2} fout={0.35}>
      <AbsoluteFill style={{...center}}>
        <svg width={900} height={900} viewBox="-280 -280 560 560" style={{position: 'absolute', transform: `rotate(${rot}deg)`, opacity: 0.5 * P(125.9)}}>
          {[0, 180].map((a) => (
            <g key={a} transform={`rotate(${a})`}>
              <path d="M 230 0 A 230 230 0 0 1 -190 130" fill="none" stroke={RED} strokeWidth={18} strokeLinecap="round" />
              <polygon points="-230,110 -170,170 -150,90" fill={RED} />
            </g>
          ))}
        </svg>
        <div style={{fontFamily: TYPE, fontSize: 40, color: DIM, letterSpacing: 6, ...rise(P(125.9))}}>BENDA INI</div>
        <div style={{fontFamily: BEBAS, fontSize: 200, color: BONE, lineHeight: 1, ...pop(P(126.36, 0.35), 1.6)}}>DIULANG</div>
        <div style={{fontFamily: BEBAS, fontSize: 120, color: RED, lineHeight: 1, letterSpacing: 8, ...rise(P(127.02))}}>BALIK SAHAJA.</div>
      </AbsoluteFill>
    </Win>
  );
};

// =============================================== 10. Penutup
export const Outro: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const t0 = CLIP_END + 0.25;
  const fade = ci(fr, at(CLIP_END + 3.2), at(CLIP_END + 4.0), 1, 0);
  return (
    <Win a={t0} b={CLIP_END + 4.1} fin={0.3} fout={0.01}>
      <AbsoluteFill style={{...center, opacity: fade}}>
        <div style={{fontFamily: TYPE, fontSize: 36, color: DIM, letterSpacing: 8, ...rise(P(t0 + 0.1))}}>KISAH DI SEBALIK LAGU</div>
        <div style={{width: 700 * P(t0 + 0.2, 0.8), height: 3, background: RED, margin: '30px 0'}} />
        <div style={{fontFamily: GOTH, fontSize: 92, color: BONE, lineHeight: 1.05, textAlign: 'center', ...rise(P(t0 + 0.3))}}>
          Welcome to the
          <br />
          <span style={{color: RED, fontSize: 150}}>Black Parade</span>
        </div>
        <div style={{fontFamily: BEBAS, fontSize: 64, color: BONE, letterSpacing: 10, marginTop: 20, ...rise(P(t0 + 0.6))}}>MY CHEMICAL ROMANCE</div>
        <div style={{width: 700 * P(t0 + 0.2, 0.8), height: 3, background: RED, margin: '30px 0'}} />
        <div style={{fontFamily: TYPE, fontSize: 30, color: DIM, letterSpacing: 4, ...rise(P(t0 + 1.0))}}>PETIKAN CERAMAH</div>
        <div style={{fontFamily: GOTH, fontSize: 80, color: BONE, marginTop: 6, ...rise(P(t0 + 1.2))}}>Ustaz Auni Mohamed</div>
      </AbsoluteFill>
    </Win>
  );
};

export {abs};
