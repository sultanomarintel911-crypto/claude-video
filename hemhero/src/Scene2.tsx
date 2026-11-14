import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/cinzel/900.css';
import {f} from './data';
import {Dust, Flash, Glint, Grain, HeroRays, lerp, Letterbox, Shot, Vignette} from './Video';

// Masa babak (saat) -- mesti sama dengan scripts/audio2.py
export const T2 = {
  title: 0.0,
  s1a: 2.0, // fail misi diangkat
  s1b: 3.8, // halaman diselak pantas
  s2: 6.0, // rondaan perhimpunan
  s3: 11.0, // operasi kantin
  s4: 16.0, // pemeriksaan tandas/sinki
  s5: 20.4, // kebajikan murid
  s6: 24.4, // pejabat
  ring: 26.6, // telefon berbunyi
  end: 29.6,
  fin: 30.0,
};

const S = (a: number, b: number) => ({from: f(a), durationInFrames: f(b) - f(a)});
const WARM = 'contrast(1.1) saturate(1.12) sepia(0.06)';
const SOFT = 'contrast(1.05) saturate(1.05) sepia(0.14) brightness(1.03)';

/** Kad tajuk: potret sebenar + "MISSION: STUDENT AFFAIRS" dicop masuk. */
const TitleCard: React.FC = () => {
  const fr = useCurrentFrame();
  const st = lerp(fr, 18, 26, 0, 1, Easing.out(Easing.back(2.2)));
  const shake = fr >= 18 && fr < 28 ? (random(`t${fr}`) - 0.5) * (28 - fr) * 2.4 : 0;
  const m = lerp(fr, 4, 16, 0, 1, Easing.out(Easing.cubic));
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 45%, #24324f 0%, #0a0f1a 60%, #04060a 100%)'}}>
      <HeroRays cx="27%" cy="35%" intensity={0.45} />
      <div style={{position: 'absolute', left: 180, bottom: -30, height: 1060, transform: `scale(${lerp(fr, 0, 60, 1.0, 1.05, Easing.linear)})`, transformOrigin: '50% 100%'}}>
        <Img src={staticFile('img/potret_alpha.png')} style={{height: '100%', filter: 'drop-shadow(0 0 36px rgba(255,190,100,0.4)) contrast(1.05)'}} />
      </div>
      <div style={{position: 'absolute', right: 110, top: 330, width: 900, textAlign: 'center', transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
        <div style={{fontFamily: 'Cinzel', fontWeight: 900, fontSize: 64, letterSpacing: 18, color: '#e8eefc', opacity: m, transform: `translateY(${(1 - m) * 30}px)`, textShadow: '0 4px 18px rgba(0,0,0,0.8)'}}>
          MISSION:
        </div>
        <div
          style={{
            fontFamily: 'Cinzel',
            fontWeight: 900,
            fontSize: 108,
            lineHeight: 1.02,
            marginTop: 14,
            opacity: Math.min(1, st * 1.4),
            transform: `scale(${2.2 - 1.2 * st}) rotate(${(1 - st) * -6}deg)`,
            backgroundImage: 'linear-gradient(100deg, #8a5a14 0%, #f7d27a 35%, #fff6d8 50%, #f0c055 62%, #9a6516 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.75)) drop-shadow(0 0 22px rgba(255,190,90,0.35))',
          }}
        >
          STUDENT
          <br />
          AFFAIRS
        </div>
      </div>
      <Flash at={18} len={6} peak={0.35} color="#ffe2a8" />
    </AbsoluteFill>
  );
};

/** Halaman fail diselak pantas (3D). */
const PageFlip: React.FC<{dur: number}> = ({dur}) => {
  const fr = useCurrentFrame();
  const flips = 16;
  const lines = (seed: string) =>
    new Array(13).fill(0).map((_, i) => (
      <div
        key={i}
        style={{
          height: 10,
          margin: '22px 0',
          width: `${55 + random(`${seed}${i}`) * 40}%`,
          background: i === 0 ? 'rgba(120,20,30,0.55)' : 'rgba(40,40,50,0.28)',
          borderRadius: 4,
        }}
      />
    ));
  const page = (seed: string, extra?: React.ReactNode) => (
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #e9dfc7, #f7f0dd 12%, #f9f3e3)', padding: '70px 80px', boxSizing: 'border-box', backfaceVisibility: 'hidden'}}>
      {lines(seed)}
      {extra}
    </div>
  );
  const cam = lerp(fr, 0, dur, 1.0, 1.18, Easing.out(Easing.cubic));
  return (
    <AbsoluteFill style={{background: '#2a0b10', perspective: 2200, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${cam}) rotate(${lerp(fr, 0, dur, -4, -1)}deg) translateY(30px)`}}>
        {/* kulit buku */}
        <div style={{position: 'absolute', left: 140, right: 140, top: 70, bottom: 30, background: 'linear-gradient(135deg, #5a1520, #3b0c13)', borderRadius: 18, boxShadow: '0 40px 80px rgba(0,0,0,0.7)'}} />
        {/* halaman kiri & kanan */}
        <div style={{position: 'absolute', left: 175, width: 790, top: 95, bottom: 55}}>{page('L')}</div>
        <div style={{position: 'absolute', left: 965, width: 790, top: 95, bottom: 55}}>
          {page('R', (
            <div style={{position: 'absolute', right: 90, bottom: 80, width: 170, height: 170, borderRadius: '50%', border: '10px solid rgba(170,25,35,0.75)', transform: 'rotate(-14deg)', opacity: fr > 50 ? 1 : 0}} />
          ))}
        </div>
        {/* halaman yang sedang diselak */}
        {new Array(flips).fill(0).map((_, k) => {
          const start = 4 + k * 3.6 * (1 + 0.012 * k);
          const r = interpolate(fr, [start, start + 7], [0, -180], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
          if (r === -180 && k < flips - 1) return null;
          const shade = Math.sin((-r / 180) * Math.PI);
          return (
            <div
              key={k}
              style={{
                position: 'absolute',
                left: 965,
                width: 790,
                top: 95,
                bottom: 55,
                transformOrigin: '0% 50%',
                transform: `rotateY(${r}deg)`,
                transformStyle: 'preserve-3d',
                zIndex: 10 + k,
              }}
            >
              {page(`F${k}`)}
              <div style={{position: 'absolute', inset: 0, background: `rgba(0,0,0,${shade * 0.35})`}} />
            </div>
          );
        })}
        {/* lurah tengah */}
        <div style={{position: 'absolute', left: 925, width: 80, top: 95, bottom: 55, background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.35), transparent)', zIndex: 100}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(255,220,160,0.18), transparent 60%)', mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

/** Kesan "lawak" squash pada snap-zoom. */
const bounce = (fr: number, at: number) => {
  const dt = fr - at;
  if (dt < 0) return 1;
  return 1 + Math.sin(dt * 0.9) * Math.exp(-dt * 0.22) * 0.06;
};

/** Gegaran ketika telefon berbunyi (selari audio2.py). */
const ringShake = (fr: number) => {
  const t = fr / 30 - T2.ring;
  for (const a of [0, 0.6, 1.6, 2.2]) if (t >= a && t < a + 0.42) return 1;
  return 0;
};

export const MissionHem: React.FC = () => {
  const fr = useCurrentFrame();
  const rs = ringShake(fr);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence {...S(T2.title, T2.s1a)}>
        <TitleCard />
      </Sequence>

      {/* SYOT 1: fail misi */}
      <Sequence {...S(T2.s1a, T2.s1b)}>
        <Shot src="img/s2_p1_fail.jpg" dur={f(T2.s1b - T2.s1a)} from={{s: 1.02, x: 0.45, y: 0.5}} to={{s: 1.4, x: 0.68, y: 0.62}} e={Easing.inOut(Easing.cubic)} grade={WARM} blurIn={5}>
          <HeroRays cx="70%" cy="55%" intensity={lerp(fr - f(T2.s1a), 10, 40, 0, 0.35)} />
        </Shot>
        <Flash at={f(T2.s1b - T2.s1a) - 3} len={4} peak={0.5} />
      </Sequence>
      <Sequence {...S(T2.s1b, T2.s2)}>
        <PageFlip dur={f(T2.s2 - T2.s1b)} />
      </Sequence>

      {/* SYOT 2: rondaan perhimpunan */}
      <Sequence {...S(T2.s2, T2.s2 + 2.0)}>
        <Shot src="img/s2_p2_perhimpunan.jpg" dur={f(2.0)} from={{s: 1.4, x: 0.7, y: 0.55, ox: 260}} to={{s: 1.3, x: 0.7, y: 0.55, ox: -160}} e={Easing.linear} shake={3} grade={WARM} blurIn={5} />
      </Sequence>
      <Sequence {...S(T2.s2 + 2.0, T2.s2 + 3.35)}>
        <Shot src="img/s2_p2_perhimpunan.jpg" dur={f(1.35)} from={{s: 1.1, x: 0.2, y: 0.3}} to={{s: 1.4, x: 0.22, y: 0.32}} e={Easing.out(Easing.cubic)} grade={WARM} />
      </Sequence>
      <Sequence {...S(T2.s2 + 3.35, T2.s2 + 4.3)}>
        <Shot src="img/s2_p2_perhimpunan.jpg" dur={f(0.95)} from={{s: 1.4, x: 0.97, y: 0.45}} to={{s: 1.75 * bounce(fr - f(T2.s2 + 3.35), 3), x: 0.97, y: 0.45}} e={Easing.out(Easing.exp)} grade={WARM} />
      </Sequence>
      <Sequence {...S(T2.s2 + 4.3, T2.s3)}>
        <Shot src="img/s2_p2_perhimpunan.jpg" dur={f(0.7)} from={{s: 1.5, x: 0.6, y: 0.5}} to={{s: 1.0, x: 0.6, y: 0.5}} e={Easing.out(Easing.back(1.4))} grade={WARM} blurOut={4} />
      </Sequence>

      {/* SYOT 3: operasi kantin */}
      <Sequence {...S(T2.s3, T2.s3 + 1.35)}>
        <Shot src="img/s2_p3_kantin.jpg" dur={f(1.35)} from={{s: 1.25, x: 0.55, y: 0.5, ox: 120}} to={{s: 1.1, x: 0.55, y: 0.5, ox: -40}} e={Easing.out(Easing.cubic)} shake={4} grade={WARM} blurIn={5} />
      </Sequence>
      <Sequence {...S(T2.s3 + 1.35, T2.s3 + 2.5)}>
        <Shot src="img/s2_p3_kantin.jpg" dur={f(1.15)} from={{s: 1.3, x: 0.82, y: 0.38}} to={{s: 1.85 * bounce(fr - f(T2.s3 + 1.35), 3), x: 0.82, y: 0.38}} e={Easing.out(Easing.exp)} grade={WARM} />
      </Sequence>
      <Sequence {...S(T2.s3 + 2.5, T2.s3 + 3.9)}>
        <Shot src="img/s2_p3_kantin.jpg" dur={f(1.4)} from={{s: 1.3, x: 0.38, y: 0.4}} to={{s: 1.65, x: 0.4, y: 0.42}} e={Easing.out(Easing.exp)} grade={WARM} />
      </Sequence>
      <Sequence {...S(T2.s3 + 3.9, T2.s4)}>
        <Shot src="img/s2_p3_kantin.jpg" dur={f(1.1)} from={{s: 1.5, x: 0.7, y: 0.5, ox: 0}} to={{s: 1.08, x: 0.6, y: 0.5, ox: -40}} e={Easing.out(Easing.back(1.3))} grade={WARM} blurIn={4} />
      </Sequence>

      {/* SYOT 4: pemeriksaan kebersihan */}
      <Sequence {...S(T2.s4, T2.s4 + 2.4)}>
        <Shot src="img/s2_p4_tandas.jpg" dur={f(2.4)} from={{s: 1.45, x: 0.2, y: 0.8, ox: 120}} to={{s: 1.35, x: 0.5, y: 0.7, ox: -60}} e={Easing.inOut(Easing.sin)} grade="contrast(1.08) saturate(1.05) brightness(1.04)" blurIn={5}>
          <Glint at={f(1.0)} x0={0.05} x1={0.45} y0={0.6} y1={0.95} len={18} />
        </Shot>
      </Sequence>
      <Sequence {...S(T2.s4 + 2.4, T2.s5)}>
        <Shot src="img/s2_p4_tandas.jpg" dur={f(2.0)} from={{s: 1.15, x: 0.66, y: 0.42}} to={{s: 1.45, x: 0.66, y: 0.42}} e={Easing.out(Easing.exp)} grade="contrast(1.08) saturate(1.08) brightness(1.04)">
          <Glint at={4} x0={0.42} x1={0.58} y0={0.45} y1={0.66} len={10} />
          <AbsoluteFill
            style={{
              background: 'radial-gradient(ellipse at 13% 38%, rgba(120,255,140,0.55), transparent 22%)',
              mixBlendMode: 'screen',
              opacity: interpolate(fr - f(T2.s4 + 3.2), [0, 3, 18], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            }}
          />
        </Shot>
      </Sequence>

      {/* SYOT 5: kebajikan murid (lembut, hangat) */}
      <Sequence {...S(T2.s5, T2.s6)}>
        <Shot src="img/s2_p5_kebajikan.jpg" dur={f(T2.s6 - T2.s5)} from={{s: 1.55, x: 0.52, y: 0.85}} to={{s: 1.06, x: 0.5, y: 0.45}} e={Easing.inOut(Easing.sin)} grade={SOFT} blurIn={8}>
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at 60% 20%, rgba(255,220,160,0.35), transparent 60%)', mixBlendMode: 'screen'}} />
          <Dust n={30} />
        </Shot>
      </Sequence>

      {/* SYOT 6: pejabat -> telefon berbunyi */}
      <Sequence {...S(T2.s6, T2.ring)}>
        <Shot src="img/s2_p6_pejabat.jpg" dur={f(T2.ring - T2.s6)} from={{s: 1.05, x: 0.4, y: 0.3}} to={{s: 1.2, x: 0.4, y: 0.3}} e={Easing.inOut(Easing.sin)} grade={SOFT} blurIn={5} />
      </Sequence>
      <Sequence {...S(T2.ring, T2.ring + 1.0)}>
        <Shot src="img/s2_p6_pejabat.jpg" dur={f(1.0)} from={{s: 1.3, x: 0.9, y: 0.88}} to={{s: 1.65, x: 0.9, y: 0.88}} e={Easing.out(Easing.exp)} shake={rs * 22} grade={WARM} />
        <Flash at={0} len={4} peak={0.4} />
      </Sequence>
      <Sequence {...S(T2.ring + 1.0, T2.fin)}>
        <Shot src="img/s2_p6_pejabat.jpg" dur={f(T2.fin - T2.ring - 1.0)} from={{s: 1.45, x: 0.38, y: 0.22}} to={{s: 1.75, x: 0.38, y: 0.22}} e={Easing.out(Easing.cubic)} shake={rs * 8} grade={WARM} blurIn={4} />
      </Sequence>

      <Vignette />
      <Grain />
      <Letterbox h={40} />
      <AbsoluteFill
        style={{
          background: '#000',
          opacity: interpolate(fr, [0, 6, f(T2.end) - 2, f(T2.end)], [1, 0, 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        }}
      />
      <Audio src={staticFile('sfx/runut2.wav')} />
    </AbsoluteFill>
  );
};
