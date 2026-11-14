import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/cinzel/700.css';
import '@fontsource/cinzel/900.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/800.css';
import {f, W, H} from './data';
import {Dust, Flash, Grain, lerp, Letterbox, Shot, Vignette} from './Video';

const S = (a: number, b: number) => ({from: f(a), durationInFrames: f(b) - f(a)});
const clampI = (fr: number, inp: number[], out: number[]) =>
  interpolate(fr, inp, out, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const GOLDEN = 'contrast(1.08) saturate(1.12) sepia(0.18) brightness(1.03)';
const MEMORY = 'contrast(0.95) saturate(0.75) sepia(0.45) brightness(1.08)';
const DAY = 'contrast(1.06) saturate(1.05)';

/** Suar lensa hangat bergerak perlahan. */
const LensFlare: React.FC<{x: number; y: number; strength?: number}> = ({x, y, strength = 1}) => {
  const fr = useCurrentFrame();
  const px = x * W + Math.sin(fr / 40) * 25;
  const py = y * H + Math.cos(fr / 55) * 12;
  const cx = W / 2;
  const cy = H / 2;
  const ghosts = [0.35, 0.6, 1.25, 1.6];
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', pointerEvents: 'none', opacity: strength}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at ${px}px ${py}px, rgba(255,226,160,0.95), rgba(255,170,70,0.45) 9%, rgba(255,140,40,0.12) 30%, transparent 55%)`}} />
      <div style={{position: 'absolute', left: px - 700, top: py - 3, width: 1400, height: 6, background: 'linear-gradient(90deg, transparent, rgba(255,210,150,0.5), transparent)', filter: 'blur(2px)'}} />
      {ghosts.map((g, i) => {
        const gx = px + (cx - px) * g * 2;
        const gy = py + (cy - py) * g * 2;
        const r = [60, 28, 90, 40][i];
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: gx - r,
              top: gy - r,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(${i % 2 ? '160,220,255' : '255,200,120'},0.18), transparent 70%)`,
              border: '1px solid rgba(255,220,170,0.08)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Lapisan 'bloom' lembut (sorotan cahaya kembang). */
const Bloom: React.FC<{amount: number; color?: string}> = ({amount, color = '255,214,150'}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, rgba(${color},${0.55 * amount}), rgba(${color},${0.2 * amount}) 45%, transparent 80%)`, mixBlendMode: 'screen'}} />
);

/** Bingkai imbas kembali: gred memori, kelipan filem, tepi lembut. */
const Memory: React.FC<{src: string; dur: number; from: any; to: any}> = ({src, dur, from, to}) => {
  const fr = useCurrentFrame();
  const flick = 0.92 + random(`fl${fr}`) * 0.08;
  return (
    <AbsoluteFill style={{opacity: flick}}>
      <Shot src={src} dur={dur} from={from} to={to} e={Easing.inOut(Easing.sin)} grade={MEMORY} blurIn={8} blurOut={8} />
      <Bloom amount={0.6} />
      <AbsoluteFill style={{boxShadow: 'inset 0 0 220px 90px rgba(40,22,5,0.75)'}} />
      <Flash at={0} len={9} peak={0.7} color="#fff1d6" />
    </AbsoluteFill>
  );
};

const Title: React.FC<{text: string; from: number; to: number; bottom?: number; size?: number}> = ({text, from, to, bottom = 150, size = 92}) => {
  const fr = useCurrentFrame();
  const o = clampI(fr, [from, from + 18, to - 18, to], [0, 1, 1, 0]);
  const sp = lerp(fr, from, to, 26, 14, Easing.out(Easing.cubic));
  return (
    <>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: bottom + size * 2.2, opacity: o, background: 'linear-gradient(0deg, rgba(0,0,0,0.65), transparent)'}} />
    <div style={{position: 'absolute', left: 0, right: 0, bottom, textAlign: 'center', opacity: o}}>
      <div
        style={{
          display: 'inline-block',
          fontFamily: 'Cinzel',
          fontWeight: 700,
          fontSize: size,
          letterSpacing: sp,
          backgroundImage: 'linear-gradient(180deg, #fff6dc 0%, #f3cf7a 45%, #b07a22 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          color: 'transparent',
          filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.85)) drop-shadow(0 0 24px rgba(255,190,90,0.3))',
        }}
      >
        {text}
      </div>
    </div>
    </>
  );
};

// ============================================================
// BABAK 3: BEHIND THE SMILE
// ============================================================
export const T3 = {s1: 0.0, s2: 6.0, s3: 12.0, s3b: 13.8, s4: 15.5, s4b: 18.0, s5: 20.5, s6: 25.5, fade: 28.8, fin: 30};

export const BehindTheSmile: React.FC = () => {
  const fr = useCurrentFrame();
  const bob = Math.sin((fr / 30 / 0.78) * Math.PI * 2) * 3;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* SYOT 1: koridor sunyi, jalan perlahan */}
      <Sequence {...S(T3.s1, T3.s2)}>
        <Shot src="img/s3_p1_koridor.jpg" dur={f(6)} from={{s: 1.02, x: 0.38, y: 0.3, ox: 30, oy: bob}} to={{s: 1.18, x: 0.4, y: 0.3, ox: -30, oy: bob}} e={Easing.linear} grade={GOLDEN}>
          <Dust n={45} />
        </Shot>
        <LensFlare x={0.06} y={0.18} />
        <Title text="BEHIND THE SMILE" from={24} to={150} bottom={120} />
      </Sequence>

      {/* SYOT 2: imbas kembali perkhidmatan */}
      <Sequence {...S(T3.s2, 7.5)}>
        <Memory src="img/s3_p2_tumbuk.jpg" dur={f(1.5)} from={{s: 1.05, x: 0.45, y: 0.4}} to={{s: 1.18, x: 0.47, y: 0.4}} />
      </Sequence>
      <Sequence {...S(7.5, 9.0)}>
        <Memory src="img/s2_p2_perhimpunan.jpg" dur={f(1.5)} from={{s: 1.05, x: 0.3, y: 0.4}} to={{s: 1.18, x: 0.32, y: 0.4}} />
      </Sequence>
      <Sequence {...S(9.0, 10.5)}>
        <Memory src="img/s2_p5_kebajikan.jpg" dur={f(1.5)} from={{s: 1.05, x: 0.45, y: 0.5}} to={{s: 1.18, x: 0.45, y: 0.5}} />
      </Sequence>
      <Sequence {...S(10.5, T3.s3)}>
        <Memory src="img/s3_p4_sukan.jpg" dur={f(1.5)} from={{s: 1.05, x: 0.4, y: 0.35}} to={{s: 1.18, x: 0.42, y: 0.35}} />
      </Sequence>

      {/* SYOT 3: rakan guru */}
      <Sequence {...S(T3.s3, T3.s3b)}>
        <Shot src="img/s3_p3_guru.jpg" dur={f(1.8)} from={{s: 1.04, x: 0.5, y: 0.4}} to={{s: 1.12, x: 0.5, y: 0.4}} e={Easing.inOut(Easing.sin)} grade={GOLDEN} blurIn={6} />
        <Bloom amount={0.25} />
      </Sequence>
      <Sequence {...S(T3.s3b, T3.s4)}>
        <Shot src="img/s3_p3_guru.jpg" dur={f(1.7)} from={{s: 1.4, x: 0.55, y: 0.3}} to={{s: 1.52, x: 0.55, y: 0.3}} e={Easing.inOut(Easing.sin)} grade={GOLDEN} blurIn={4} />
        <Bloom amount={0.25} />
      </Sequence>

      {/* SYOT 4: kad penghargaan */}
      <Sequence {...S(T3.s4, T3.s4b)}>
        <Shot src="img/s3_p5_kad.jpg" dur={f(2.5)} from={{s: 1.0, x: 0.5, y: 0.5}} to={{s: 1.12, x: 0.55, y: 0.55}} e={Easing.inOut(Easing.sin)} grade={GOLDEN} blurIn={8}>
          <Dust n={30} />
        </Shot>
        <LensFlare x={0.18} y={0.12} strength={0.6} />
      </Sequence>
      <Sequence {...S(T3.s4b, T3.s5)}>
        <Shot src="img/s3_p5_kad.jpg" dur={f(2.5)} from={{s: 1.45, x: 0.52, y: 0.72}} to={{s: 1.6, x: 0.52, y: 0.72}} e={Easing.inOut(Easing.sin)} grade={GOLDEN} blurIn={5} />
        <Bloom amount={0.3} />
      </Sequence>

      {/* SYOT 5: close-up emosi */}
      <Sequence {...S(T3.s5, T3.s6)}>
        <Shot src="img/s3_p6_cu.jpg" dur={f(5)} from={{s: 1.0, x: 0.6, y: 0.4}} to={{s: 1.22, x: 0.6, y: 0.38}} e={Easing.inOut(Easing.sin)} grade={GOLDEN} blurIn={10} />
        <LensFlare x={0.1} y={0.2} strength={0.5} />
      </Sequence>

      {/* SYOT 6: kenangan terakhir, kamera menjauh, cahaya emas memenuhi bingkai */}
      <Sequence {...S(T3.s6, T3.fin)}>
        <Shot src="img/s3_p1_koridor.jpg" dur={f(4.5)} from={{s: 1.4, x: 0.4, y: 0.3}} to={{s: 1.0, x: 0.4, y: 0.3}} e={Easing.out(Easing.sin)} grade={GOLDEN} blurIn={10}>
          <Dust n={50} />
        </Shot>
        <LensFlare x={0.06} y={0.18} strength={1} />
        <Bloom amount={clampI(fr - f(T3.s6), [0, f(3.3)], [0.2, 1.4])} />
      </Sequence>

      <Vignette />
      <Grain />
      <Letterbox h={56} />
      <AbsoluteFill style={{background: '#000', opacity: clampI(fr, [0, 18, f(T3.fade), f(T3.fin)], [1, 0, 0, 1])}} />
      <Audio src={staticFile('sfx/runut3.wav')} />
    </AbsoluteFill>
  );
};

// ============================================================
// BABAK 4: THE NEXT CHAPTER
// ============================================================
export const T4 = {s1: 0.0, s2: 5.0, s2b: 7.3, s3: 9.5, s4: 13.5, tr: 18.0, s5: 18.6, card: 23.0, fade: 29.0, fin: 30};

const GoldParticles: React.FC<{n?: number}> = ({n = 90}) => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen'}}>
      {new Array(n).fill(0).map((_, i) => {
        const x = random(`gx${i}`) * W + Math.sin(fr / 30 + i) * 12;
        const y = ((random(`gy${i}`) * H * 1.2 - fr * (0.4 + random(`gv${i}`) * 1.4)) % (H * 1.2) + H * 1.2) % (H * 1.2) - H * 0.1;
        const r = 1 + random(`gr${i}`) * 3.2;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(fr / (8 + random(`gt${i}`) * 14) + i));
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
              background: `rgba(255,${200 + Math.round(random(`gc${i}`) * 40)},120,${tw})`,
              boxShadow: `0 0 ${r * 4}px rgba(255,200,100,${tw * 0.8})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

const goldText: React.CSSProperties = {
  backgroundImage: 'linear-gradient(180deg, #fff3d0 0%, #f2cc72 40%, #c48a2a 70%, #f6d98a 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.9))',
};

/** Kad penghargaan hitam-emas (teks tepat). */
const TributeCard: React.FC = () => {
  const fr = useCurrentFrame();
  const appear = (i: number) => {
    const a = 10 + i * 9;
    return {opacity: clampI(fr, [a, a + 16], [0, 1]), transform: `translateY(${clampI(fr, [a, a + 20], [18, 0])}px)`};
  };
  const sweep = clampI(fr, [20, 70], [-40, 140]);
  const pill = (i: number, l1: string, l2: string, l3?: string) => (
    <div
      style={{
        ...appear(i),
        margin: '18px auto 0',
        width: 1080,
        padding: '16px 0 18px',
        borderRadius: 60,
        background: 'linear-gradient(180deg, #f6dc94 0%, #d9a845 50%, #b88326 100%)',
        boxShadow: '0 0 0 2px rgba(255,236,180,0.7) inset, 0 10px 30px rgba(0,0,0,0.6), 0 0 30px rgba(255,190,90,0.25)',
        color: '#2a1a05',
        fontFamily: 'Montserrat',
        fontWeight: 800,
        textAlign: 'center',
        lineHeight: 1.18,
      }}
    >
      <div style={{fontSize: 38}}>{l1}</div>
      <div style={{fontSize: l3 ? 30 : 36, fontWeight: l3 ? 800 : 800}}>{l2}</div>
      {l3 ? <div style={{fontSize: 30}}>{l3}</div> : null}
    </div>
  );
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #2a2112 0%, #0d0a05 55%, #000 100%)'}}>
      <AbsoluteFill style={{background: `linear-gradient(115deg, transparent ${sweep - 12}%, rgba(255,215,140,0.10) ${sweep}%, transparent ${sweep + 12}%)`}} />
      <GoldParticles />
      {/* bingkai emas */}
      <div style={{position: 'absolute', inset: 70, border: '2px solid rgba(230,190,110,0.55)', borderRadius: 26, boxShadow: '0 0 40px rgba(255,190,90,0.15) inset', opacity: clampI(fr, [0, 20], [0, 1])}} />
      <div style={{position: 'absolute', inset: 84, border: '1px solid rgba(230,190,110,0.25)', borderRadius: 20, opacity: clampI(fr, [0, 20], [0, 1])}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', transform: 'scale(1.1)', transformOrigin: '50% 0%'}}>
        <div style={{...appear(0), ...goldText, fontFamily: 'Cinzel', fontWeight: 900, fontSize: 116, letterSpacing: 10, transform: `${appear(0).transform} scale(${clampI(fr, [10, 40], [1.08, 1])})`}}>TERIMA KASIH</div>
        <div style={{...appear(1), fontFamily: 'Montserrat', fontWeight: 800, fontSize: 50, letterSpacing: 3, color: '#f5ead2', marginTop: 4, textShadow: '0 3px 12px rgba(0,0,0,0.9)'}}>
          ENCIK RAZULDDIN BIN MUSTAFFA
        </div>
        {pill(2, '1 DISEMBER 2017 – 14 NOVEMBER 2026', 'SK SULTAN OMAR')}
        {pill(3, '15 NOVEMBER 2026', 'SELAMAT MENERUSKAN PERKHIDMATAN', 'DI SK BATU 48')}
        <div style={{...appear(5), ...goldText, fontFamily: 'Montserrat', fontWeight: 600, fontSize: 34, letterSpacing: 4, marginTop: 30, lineHeight: 1.45}}>
          JASAMU DIKENANG.
          <br />
          PENGORBANANMU MENJADI INSPIRASI.
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const NextChapter: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* SYOT 1: perpisahan */}
      <Sequence {...S(T4.s1, T4.s2)}>
        <Shot src="img/s4_p1_lambai.jpg" dur={f(5)} from={{s: 1.3, x: 0.12, y: 0.55, ox: 0}} to={{s: 1.08, x: 0.45, y: 0.35}} e={Easing.inOut(Easing.sin)} grade={GOLDEN} blurIn={8}>
          <Dust n={30} />
        </Shot>
        <LensFlare x={0.95} y={0.05} strength={0.6} />
        <Title text="THE NEXT CHAPTER" from={20} to={130} bottom={110} size={84} />
      </Sequence>

      {/* SYOT 2: jabat tangan terakhir */}
      <Sequence {...S(T4.s2, T4.s2b)}>
        <Shot src="img/s4_p2_salam.jpg" dur={f(2.3)} from={{s: 1.05, x: 0.45, y: 0.35}} to={{s: 1.16, x: 0.45, y: 0.35}} e={Easing.inOut(Easing.sin)} grade={GOLDEN} blurIn={8} />
      </Sequence>
      <Sequence {...S(T4.s2b, T4.s3)}>
        <Shot src="img/s4_p2_salam.jpg" dur={f(2.2)} from={{s: 1.6, x: 0.62, y: 0.85}} to={{s: 1.75, x: 0.62, y: 0.85}} e={Easing.inOut(Easing.sin)} grade={GOLDEN} blurIn={5} />
        <Bloom amount={0.25} />
      </Sequence>

      {/* SYOT 3: selamat tinggal dari hati */}
      <Sequence {...S(T4.s3, T4.s4)}>
        <Shot src="img/s4_p3_pelukan.jpg" dur={f(4)} from={{s: 1.02, x: 0.4, y: 0.45}} to={{s: 1.22, x: 0.36, y: 0.42}} e={Easing.inOut(Easing.sin)} grade={GOLDEN} blurIn={8} />
        <LensFlare x={0.9} y={0.08} strength={0.45} />
      </Sequence>

      {/* SYOT 4: berjalan pergi (gerak perlahan, waktu emas) */}
      <Sequence {...S(T4.s4, T4.tr + 0.3)}>
        <Shot src="img/s4_p4_pergi.jpg" dur={f(4.8)} from={{s: 1.02, x: 0.55, y: 0.45}} to={{s: 1.3, x: 0.55, y: 0.4}} e={Easing.linear} grade={GOLDEN} blurIn={8}>
          <Dust n={45} />
        </Shot>
        <LensFlare x={0.62} y={0.12} strength={1} />
        <Bloom amount={clampI(fr - f(T4.s4), [f(3.5), f(4.8)], [0.2, 2.2])} />
      </Sequence>

      {/* SYOT 5: permulaan baharu di SK Batu 48 */}
      <Sequence {...S(T4.tr + 0.3, T4.card)}>
        <Shot src="img/s4_p5_batu48.jpg" dur={f(T4.card - T4.tr - 0.3)} from={{s: 1.45, x: 0.78, y: 0.45}} to={{s: 1.08, x: 0.5, y: 0.4}} e={Easing.inOut(Easing.cubic)} grade={DAY} blurIn={6} />
        <Bloom amount={clampI(fr - f(T4.tr + 0.3), [0, 14], [2.2, 0.15])} />
      </Sequence>

      {/* SYOT 6: kad penghargaan */}
      <Sequence {...S(T4.card, T4.fin)}>
        <TributeCard />
        <Flash at={0} len={14} color="#ffe6b0" peak={0.8} />
      </Sequence>

      <Vignette />
      <Grain />
      {fr < f(T4.card) ? <Letterbox h={56} /> : null}
      <AbsoluteFill style={{background: '#000', opacity: clampI(fr, [0, 18, f(T4.fade), f(T4.fin)], [1, 0, 0, 1])}} />
      <Audio src={staticFile('sfx/runut4.wav')} />
    </AbsoluteFill>
  );
};

// ============================================================
// BABAK 5: THE FINAL FAREWELL (bunyi sahaja, tiada teks)
// ============================================================
export const T5 = {p1: 0.0, p2: 3.5, p3: 6.5, p4: 9.5, p5: 12.5, walk: 15.0, p6: 18.0, p7: 21.0, p8: 23.5, p9: 26.0, fade: 29.2, fin: 30};

/** Pesawat berlepas: plat langit bersih + sprite pesawat bergerak naik & mengecil. */
const Takeoff: React.FC<{dur: number}> = ({dur}) => {
  const fr = useCurrentFrame();
  const t = lerp(fr, 0, dur, 0, 1, Easing.in(Easing.quad));
  const x = interpolate(t, [0, 1], [-520, 330]);
  const y = interpolate(t, [0, 1], [300, -110]);
  const sc = interpolate(t, [0, 1], [1.0, 0.28]);
  const jitter = (random(`pj${fr}`) - 0.5) * 1.2;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Shot src="img/s5_p9_bersih.jpg" dur={dur} from={{s: 1.0, x: 0.35, y: 0.7}} to={{s: 1.06, x: 0.35, y: 0.7}} e={Easing.linear} grade={GOLDEN}>
        <div
          style={{
            position: 'absolute',
            left: 782,
            top: 40,
            width: 1051,
            transform: `translate(${x}px, ${y + jitter}px) scale(${sc}) rotate(${-2 * t}deg)`,
            transformOrigin: '60% 50%',
            filter: `blur(${0.6 + t * 0.8}px) drop-shadow(0 0 12px rgba(255,190,120,0.35))`,
          }}
        >
          <Img src={staticFile('img/s5_pesawat.png')} style={{width: '100%'}} />
        </div>
      </Shot>
      <LensFlare x={0.82} y={0.45} strength={0.55} />
    </AbsoluteFill>
  );
};

export const FinalFarewell: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence {...S(T5.p1, T5.p2)}>
        <Shot src="img/s5_p1_pintu.jpg" dur={f(3.5)} from={{s: 1.0, x: 0.5, y: 0.6}} to={{s: 1.14, x: 0.5, y: 0.62}} e={Easing.linear} grade={DAY} blurIn={10} />
      </Sequence>
      <Sequence {...S(T5.p2, T5.p3)}>
        <Shot src="img/s5_p2_wajah.jpg" dur={f(3)} from={{s: 1.04, x: 0.45, y: 0.4}} to={{s: 1.2, x: 0.45, y: 0.42}} e={Easing.inOut(Easing.sin)} grade={DAY} blurIn={8} />
      </Sequence>
      <Sequence {...S(T5.p3, T5.p4)}>
        <Shot src="img/s5_p3_airmata.jpg" dur={f(3)} from={{s: 1.08, x: 0.55, y: 0.4}} to={{s: 1.25, x: 0.58, y: 0.42}} e={Easing.inOut(Easing.sin)} grade={DAY} blurIn={8} />
      </Sequence>
      <Sequence {...S(T5.p4, T5.p5)}>
        <Shot src="img/s5_p4_murid.jpg" dur={f(3)} from={{s: 1.18, x: 0.4, y: 0.45, ox: 70}} to={{s: 1.12, x: 0.4, y: 0.45, ox: -70}} e={Easing.inOut(Easing.sin)} grade={DAY} blurIn={8} />
      </Sequence>
      <Sequence {...S(T5.p5, T5.walk)}>
        <Shot src="img/s5_p5_lambai.jpg" dur={f(2.5)} from={{s: 1.04, x: 0.55, y: 0.3}} to={{s: 1.16, x: 0.55, y: 0.3}} e={Easing.inOut(Easing.sin)} grade={DAY} blurIn={8} />
      </Sequence>
      <Sequence {...S(T5.walk, T5.p6)}>
        <Shot src="img/s4_p4_pergi.jpg" dur={f(3)} from={{s: 1.35, x: 0.55, y: 0.5}} to={{s: 1.03, x: 0.55, y: 0.5}} e={Easing.out(Easing.sin)} grade={GOLDEN} blurIn={8} />
        <LensFlare x={0.62} y={0.1} strength={0.8} />
      </Sequence>
      <Sequence {...S(T5.p6, T5.p7)}>
        <Shot src="img/s5_p6_pesawat.jpg" dur={f(3)} from={{s: 1.0, x: 0.45, y: 0.55}} to={{s: 1.16, x: 0.42, y: 0.55}} e={Easing.linear} grade={GOLDEN} blurIn={10} />
        <LensFlare x={0.05} y={0.45} strength={0.6} />
      </Sequence>
      <Sequence {...S(T5.p7, T5.p8)}>
        <Shot src="img/s5_p7_toleh.jpg" dur={f(2.5)} from={{s: 1.06, x: 0.35, y: 0.45}} to={{s: 1.22, x: 0.35, y: 0.45}} e={Easing.inOut(Easing.sin)} grade="contrast(1.06) saturate(1.05) sepia(0.12)" blurIn={8} />
      </Sequence>
      <Sequence {...S(T5.p8, T5.p9)}>
        <Shot src="img/s5_p8_tangga.jpg" dur={f(2.5)} from={{s: 1.0, x: 0.55, y: 0.5}} to={{s: 1.16, x: 0.55, y: 0.45}} e={Easing.linear} grade="contrast(1.06) saturate(1.05) sepia(0.12)" blurIn={8} />
        {/* pintu ditutup: cahaya pintu malap */}
        <AbsoluteFill style={{background: 'rgba(0,0,0,0.35)', opacity: clampI(fr - f(T5.p8), [f(2.2), f(2.35)], [0, 1])}} />
      </Sequence>
      <Sequence {...S(T5.p9, T5.fin)}>
        <Takeoff dur={f(T5.fin - T5.p9)} />
      </Sequence>

      <Vignette />
      <Grain />
      <Letterbox h={56} />
      <AbsoluteFill style={{background: '#000', opacity: clampI(fr, [0, 20, f(T5.fade), f(T5.fin)], [1, 0, 0, 1])}} />
      <Audio src={staticFile('sfx/runut5.wav')} />
    </AbsoluteFill>
  );
};
