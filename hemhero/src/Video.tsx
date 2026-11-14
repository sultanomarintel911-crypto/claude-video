import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import '@fontsource/cinzel/700.css';
import '@fontsource/cinzel/900.css';
import {f, H, T, W} from './data';

const ease = Easing.bezier(0.45, 0, 0.25, 1);
const lerp = (fr: number, a: number, b: number, v0: number, v1: number, e = ease) =>
  interpolate(fr, [a, b], [v0, v1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

type Cam = {s: number; x: number; y: number; ox?: number; oy?: number; r?: number};

/** Gambar penuh skrin dengan gerakan kamera (zum ke titik fokus + anjakan). */
const Shot: React.FC<{
  src: string;
  dur: number;
  from: Cam;
  to: Cam;
  e?: (t: number) => number;
  shake?: number;
  grade?: string;
  children?: React.ReactNode;
  blurIn?: number;
  blurOut?: number;
}> = ({src, dur, from, to, e = ease, shake = 0, grade = '', children, blurIn = 0, blurOut = 0}) => {
  const fr = useCurrentFrame();
  const p = (k: keyof Cam) => lerp(fr, 0, dur, (from[k] as number) ?? 0, (to[k] as number) ?? 0, e);
  const s = p('s');
  const sx = shake ? (random(`x${fr}`) - 0.5) * shake : 0;
  const sy = shake ? (random(`y${fr}`) - 0.5) * shake : 0;
  const bIn = blurIn ? lerp(fr, 0, blurIn, 14, 0) : 0;
  const bOut = blurOut ? lerp(fr, dur - blurOut, dur, 0, 14) : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          transformOrigin: `${p('x') * 100}% ${p('y') * 100}%`,
          transform: `translate(${p('ox') + sx}px, ${p('oy') + sy}px) scale(${s}) rotate(${p('r')}deg)`,
          filter: `${grade} blur(${bIn + bOut}px)`,
        }}
      >
        <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Kilauan cahaya merentas kanta cermin mata. */
const Glint: React.FC<{at: number; x0: number; x1: number; y0: number; y1: number; len?: number}> = ({
  at,
  x0,
  x1,
  y0,
  y1,
  len = 14,
}) => {
  const fr = useCurrentFrame();
  const t = lerp(fr, at, at + len, 0, 1, Easing.inOut(Easing.quad));
  if (fr < at || fr > at + len + 8) return null;
  const op = fr > at + len ? lerp(fr, at + len, at + len + 8, 1, 0) : 1;
  const star = interpolate(fr, [at + len * 0.4, at + len * 0.6, at + len + 6], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: `${x0 * 100}%`,
          top: `${y0 * 100}%`,
          width: `${(x1 - x0) * 100}%`,
          height: `${(y1 - y0) * 100}%`,
          overflow: 'hidden',
          mixBlendMode: 'screen',
          opacity: op,
          borderRadius: '30%',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            height: '200%',
            width: '22%',
            left: `${-30 + t * 140}%`,
            transform: 'rotate(25deg)',
            background:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.15) 70%, transparent)',
            filter: 'blur(6px)',
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: `${(x0 + (x1 - x0) * 0.62) * 100}%`,
          top: `${(y0 + (y1 - y0) * 0.35) * 100}%`,
          width: 0,
          height: 0,
          opacity: star,
          mixBlendMode: 'screen',
        }}
      >
        {[0, 90].map((r) => (
          <div
            key={r}
            style={{
              position: 'absolute',
              left: -110,
              top: -3,
              width: 220,
              height: 6,
              transform: `rotate(${r + 15}deg) scaleX(${0.5 + star})`,
              background: 'radial-gradient(ellipse, rgba(255,255,255,1), rgba(255,240,200,0.5) 40%, transparent 70%)',
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            left: -40,
            top: -40,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,1), rgba(255,230,180,0.4) 35%, transparent 70%)',
          }}
        />
      </div>
    </>
  );
};

const Flash: React.FC<{at: number; len?: number; color?: string; peak?: number}> = ({
  at,
  len = 8,
  color = '#fff',
  peak = 1,
}) => {
  const fr = useCurrentFrame();
  const op = interpolate(fr, [at - 1, at, at + len], [0, peak, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return <AbsoluteFill style={{background: color, opacity: op, mixBlendMode: 'screen'}} />;
};

/** Sinar cahaya wira di belakang watak. */
const HeroRays: React.FC<{cx?: string; cy?: string; intensity: number}> = ({cx = '50%', cy = '35%', intensity}) => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: intensity, mixBlendMode: 'screen'}}>
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from ${fr * 0.25}deg at ${cx} ${cy}, rgba(255,190,90,0.0) 0deg, rgba(255,200,110,0.32) 4deg, rgba(255,190,90,0.0) 9deg, rgba(255,190,90,0) 15deg)`,
          maskImage: `radial-gradient(circle at ${cx} ${cy}, black 0%, transparent 65%)`,
          WebkitMaskImage: `radial-gradient(circle at ${cx} ${cy}, black 0%, transparent 65%)`,
          filter: 'blur(3px)',
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${cx} ${cy}, rgba(255,215,140,0.75), rgba(255,140,40,0.25) 25%, transparent 55%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Habuk terapung dalam cahaya. */
const Dust: React.FC<{n?: number; color?: string}> = ({n = 40, color = '255,235,200'}) => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none'}}>
      {new Array(n).fill(0).map((_, i) => {
        const x = ((random(`dx${i}`) * W + fr * (random(`vx${i}`) - 0.3) * 1.2) % W + W) % W;
        const y = ((random(`dy${i}`) * H - fr * random(`vy${i}`) * 0.8) % H + H) % H;
        const r = 1.5 + random(`r${i}`) * 3.5;
        const o = 0.25 + 0.5 * Math.abs(Math.sin(fr / 20 + i));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: `rgba(${color},${o})`,
              filter: `blur(${r > 3.5 ? 2 : 0.6}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Potret sebenar (latar dibuang) bangun dari kerusi, sudut kamera rendah. */
const StandUp: React.FC<{dur: number}> = ({dur}) => {
  const fr = useCurrentFrame();
  const rise = lerp(fr, 4, 46, 1, 0, Easing.bezier(0.3, 0, 0.1, 1));
  const push = lerp(fr, 0, dur, 1.0, 1.1, Easing.linear);
  const rays = lerp(fr, 18, 60, 0, 1);
  return (
    <AbsoluteFill style={{background: '#0b0d12', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${1.15 * push})`}}>
        <Img
          src={staticFile('img/p3_pejabat.jpg')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(16px) brightness(0.45) saturate(0.8)',
          }}
        />
      </AbsoluteFill>
      <HeroRays cx="50%" cy="30%" intensity={rays * 0.9} />
      <AbsoluteFill
        style={{
          transformOrigin: '50% 100%',
          transform: `translateY(${rise * 520}px) scale(${push}) perspective(1600px) rotateX(${6 - rise * 4}deg)`,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        <Img
          src={staticFile('img/potret_alpha.png')}
          style={{
            height: 1180,
            marginBottom: -70,
            filter: `drop-shadow(0 0 ${18 + rays * 30}px rgba(255,190,100,${0.35 + rays * 0.4})) contrast(1.05) saturate(1.05)`,
          }}
        />
      </AbsoluteFill>
      {/* cahaya sisi (rim light) hangat */}
      <AbsoluteFill
        style={{
          background: 'linear-gradient(90deg, rgba(255,170,80,0.18), transparent 30%, transparent 70%, rgba(80,140,255,0.15))',
          mixBlendMode: 'screen',
        }}
      />
      <Dust n={30} />
    </AbsoluteFill>
  );
};

/** Penutup: potret sebenar + tajuk. */
const EndCard: React.FC<{dur: number}> = ({dur}) => {
  const fr = useCurrentFrame();
  const push = lerp(fr, 0, dur, 1.0, 1.06, Easing.linear);
  const tIn = lerp(fr, 22, 40, 0, 1, Easing.out(Easing.cubic));
  const sweep = lerp(fr, 34, 64, -30, 130);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #1d2a44 0%, #0a0f1a 55%, #04060a 100%)'}}>
      <HeroRays cx="30%" cy="30%" intensity={0.55} />
      <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '30% 100%'}}>
        <div style={{position: 'absolute', left: 230, bottom: -20, height: 1100, width: 770}}>
          <Img
            src={staticFile('img/potret_alpha.png')}
            style={{height: '100%', filter: 'drop-shadow(0 0 40px rgba(255,190,100,0.45)) contrast(1.05)'}}
          />
          <Glint at={20} x0={0.17} x1={0.78} y0={0.34} y1={0.48} len={16} />
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          right: 120,
          top: 380,
          width: 820,
          textAlign: 'center',
          opacity: tIn,
          transform: `translateY(${(1 - tIn) * 40}px) scale(${1.15 - 0.15 * tIn})`,
        }}
      >
        <div
          style={{
            fontFamily: 'Cinzel',
            fontWeight: 900,
            fontSize: 132,
            lineHeight: 1.0,
            letterSpacing: 6,
            backgroundImage: `linear-gradient(100deg, #8a5a14 0%, #f7d27a 30%, #fff6d8 ${sweep}%, #f0c055 ${sweep + 12}%, #9a6516 100%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.7)) drop-shadow(0 0 22px rgba(255,190,90,0.35))',
          }}
        >
          THE HEM
          <br />
          HERO
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Grain: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile('img/grain.png')})`,
        backgroundSize: '512px 512px',
        backgroundPosition: `${Math.floor(random(`gx${fr}`) * 512)}px ${Math.floor(random(`gy${fr}`) * 512)}px`,
        opacity: 0.09,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};

const Letterbox: React.FC<{h: number}> = ({h}) => (
  <>
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: h, background: '#000'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: h, background: '#000'}} />
  </>
);

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none'}}
  />
);

const S = (a: number, b: number) => ({from: f(a), durationInFrames: f(b) - f(a)});

const WARM = 'contrast(1.12) saturate(1.12) sepia(0.08)';
const COOL = 'contrast(1.15) saturate(0.85) brightness(0.92) hue-rotate(-6deg)';
const HERO = 'contrast(1.15) saturate(1.1) sepia(0.12)';

export const HemHero: React.FC = () => {
  const fr = useCurrentFrame();
  // bar letterbox lebih tebal untuk gerak perlahan babak 5
  const lb = interpolate(fr, [f(T.s5a) - 6, f(T.s5a) + 6, f(T.s6a) - 4, f(T.s6a)], [40, 92, 92, 40], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // gegaran loceng (selari dengan pukulan dalam audio.py: 0.15 + k*0.42 s)
  const bellShake = (() => {
    const t = fr / 30;
    if (t > T.s2) return 0;
    let v = 0;
    for (let k = 0; k < 7; k++) {
      const dt = t - (0.15 + k * 0.42);
      if (dt >= 0) v += Math.exp(-dt * 12);
    }
    return v * 9;
  })();
  // langkah kaki babak 5 (0.25 + k*0.8 s)
  const step = (() => {
    const t = fr / 30 - T.s5a;
    let v = 0;
    for (let k = 0; k < 6; k++) {
      const dt = t - (0.25 + k * 0.8);
      if (dt >= 0) v += Math.exp(-dt * 9) * Math.sin(Math.min(dt * 20, Math.PI));
    }
    return v;
  })();

  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* SYOT 1: Loceng sekolah */}
      <Sequence {...S(T.s1, T.s2)}>
        <Shot
          src="img/p1_loceng.jpg"
          dur={f(T.s2 - T.s1)}
          from={{s: 1.5, x: 0.33, y: 0.5, r: -1}}
          to={{s: 1.18, x: 0.33, y: 0.48, r: 0.5}}
          shake={bellShake}
          grade={WARM}
          blurIn={10}
          blurOut={5}
        />
      </Sequence>

      {/* SYOT 2: Kekecohan (tracking pantas + snap zoom ke pengawas ketika wisel) */}
      <Sequence {...S(T.s2, T.s3a)}>
        <Shot
          src="img/p2_kecoh.jpg"
          dur={f(2.3)}
          from={{s: 1.35, x: 0.3, y: 0.5, ox: 160}}
          to={{s: 1.25, x: 0.55, y: 0.5, ox: -120}}
          e={Easing.linear}
          shake={10}
          grade={WARM}
          blurIn={5}
        />
        <Sequence from={f(2.3)}>
          <Shot
            src="img/p2_kecoh.jpg"
            dur={f(2.1)}
            from={{s: 1.3, x: 0.86, y: 0.42}}
            to={{s: 1.75, x: 0.86, y: 0.42}}
            e={Easing.out(Easing.exp)}
            shake={7}
            grade={WARM}
            blurOut={5}
          />
        </Sequence>
      </Sequence>

      {/* SYOT 3a: Pejabat yang tenang */}
      <Sequence {...S(T.s3a, T.s3b)}>
        <Shot
          src="img/p3_pejabat.jpg"
          dur={f(T.s3b - T.s3a)}
          from={{s: 1.08, x: 0.5, y: 0.3, oy: 30}}
          to={{s: 1.32, x: 0.5, y: 0.28, oy: 0}}
          e={Easing.inOut(Easing.sin)}
          grade={COOL}
          blurIn={4}
        >
          <Dust n={25} />
        </Shot>
      </Sequence>

      {/* SYOT 3b: ECU cermin mata + kilauan */}
      <Sequence {...S(T.s3b, T.s4a)}>
        <Shot
          src="img/p4_cermin.jpg"
          dur={f(T.s4a - T.s3b)}
          from={{s: 1.05, x: 0.62, y: 0.45}}
          to={{s: 1.28, x: 0.62, y: 0.42}}
          e={Easing.inOut(Easing.sin)}
          grade={COOL}
          blurIn={6}
        >
          <Glint at={f(1.25)} x0={0.62} x1={0.99} y0={0.28} y1={0.58} len={14} />
        </Shot>
        <Flash at={f(1.4)} len={6} peak={0.25} color="#ffe9c0" />
      </Sequence>

      {/* SYOT 4a: Bangun dari kerusi (potret sebenar), sudut rendah, cahaya wira */}
      <Sequence {...S(T.s4a, T.s4b)}>
        <StandUp dur={f(T.s4b - T.s4a)} />
      </Sequence>

      {/* SYOT 4b: Syot wira */}
      <Sequence {...S(T.s4b, T.s5a)}>
        <Shot
          src="img/p5_wira.jpg"
          dur={f(T.s5a - T.s4b)}
          from={{s: 1.25, x: 0.42, y: 0.25}}
          to={{s: 1.08, x: 0.42, y: 0.3}}
          e={Easing.out(Easing.cubic)}
          shake={interpolate(fr - f(T.s4b), [0, 12], [18, 0], {extrapolateRight: 'clamp'})}
          grade={HERO}
        >
          <HeroRays cx="35%" cy="15%" intensity={0.35} />
        </Shot>
        <Flash at={0} len={10} />
      </Sequence>

      {/* SYOT 5a: Tilt-up dari kasut ke wajah (foto sebenar, gerak perlahan) */}
      <Sequence {...S(T.s5a, T.s5b)}>
        <AbsoluteFill style={{overflow: 'hidden'}}>
          <AbsoluteFill
            style={{
              transform: `translateY(${lerp(fr - f(T.s5a), 0, f(T.s5b - T.s5a), -2808, -760, Easing.inOut(Easing.sin))}px) scale(1.25)`,
              transformOrigin: '50% 0%',
              filter: `${HERO} blur(${lerp(fr - f(T.s5a), 0, 6, 8, 0)}px)`,
              height: 2880,
              top: 0,
            }}
          >
            <Img
              src={staticFile('img/berdiri.jpg')}
              style={{width: '100%', height: 2880, objectFit: 'cover'}}
            />
          </AbsoluteFill>
          <HeroRays cx="50%" cy="0%" intensity={0.4} />
        </AbsoluteFill>
      </Sequence>

      {/* SYOT 5b: Berjalan di koridor (gerak perlahan, dolly masuk + hentakan langkah) */}
      <Sequence {...S(T.s5b, T.s6a)}>
        <Shot
          src="img/p6_barisan.jpg"
          dur={f(T.s6a - T.s5b)}
          from={{s: 1.5, x: 0.52, y: 0.1, oy: 110}}
          to={{s: 1.75, x: 0.52, y: 0.1, oy: 110}}
          e={Easing.linear}
          grade={HERO}
          shake={step * 4}
          blurIn={6}
        >
          <Dust n={35} />
        </Shot>
      </Sequence>

      {/* SYOT 6a: kekecohan sekejap (sebelum dia muncul) */}
      <Sequence {...S(T.s6a, T.s6b)}>
        <Shot
          src="img/p2_kecoh.jpg"
          dur={f(T.s6b - T.s6a)}
          from={{s: 1.4, x: 0.35, y: 0.55, ox: -80}}
          to={{s: 1.5, x: 0.4, y: 0.55, ox: 80}}
          e={Easing.linear}
          shake={14}
          grade={WARM}
          blurOut={4}
        />
      </Sequence>

      {/* SYOT 6b: SERTA-MERTA tersusun! snap-zoom out lawak, kemudian kilauan cermin mata */}
      <Sequence {...S(T.s6b, T.end)}>
        <Shot
          src="img/p6_barisan.jpg"
          dur={f(0.35)}
          from={{s: 1.6, x: 0.52, y: 0.4}}
          to={{s: 1.02, x: 0.52, y: 0.4}}
          e={Easing.out(Easing.back(1.6))}
          grade={WARM}
        />
        <Sequence from={f(0.35)}>
          <Shot
            src="img/p6_barisan.jpg"
            dur={f(T.end - T.s6b - 0.35)}
            from={{s: 1.02, x: 0.52, y: 0.22}}
            to={{s: 1.55, x: 0.52, y: 0.22}}
            e={Easing.inOut(Easing.sin)}
            grade={WARM}
          >
            <Glint at={f(2.05)} x0={0.46} x1={0.58} y0={0.15} y1={0.22} len={12} />
          </Shot>
        </Sequence>
        <Flash at={0} len={5} peak={0.6} />
      </Sequence>

      {/* PENUTUP */}
      <Sequence {...S(T.end, T.fin)}>
        <EndCard dur={f(T.fin - T.end)} />
        <Flash at={0} len={10} />
      </Sequence>

      <Vignette />
      <Grain />
      <Letterbox h={lb} />
      {/* pudar masuk & keluar */}
      <AbsoluteFill
        style={{
          background: '#000',
          opacity: interpolate(fr, [0, 8, f(T.fin) - 18, f(T.fin)], [1, 0, 0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />
      <Audio src={staticFile('sfx/runut.wav')} />
    </AbsoluteFill>
  );
};
