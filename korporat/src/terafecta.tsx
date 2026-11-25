// Babak Terafecta Digital Luminaries Awards: pameran 4 anugerah.
// Latar pentas: sinar berputar, lampu sorot, lantai grid 3D bergerak, zarah emas.
// Setiap kad foto masuk tepat pada rentak lagu A (123 BPM), dari kecil ke
// anugerah terbesar, kemudian keempat-empatnya berkumpul sebagai penutup.
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {C, MONO, ORB, Particles, SANS} from './fx';

const FPS = 30;
const RENTAK = 60 / 123.046875;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const EMAS_GRAD = 'linear-gradient(180deg, #fff3c4 0%, #ffd25a 45%, #c8892a 100%)';

const ANUGERAH = [
  {img: 'montaj/terafecta_1.jpg', kat: 'PERTANDINGAN PEMERKASAAN BACAAN MURID', tajuk: 'PEMBACA BESTARI', hasil: 'TEMPAT KELIMA · BAHASA INGGERIS (SEKOLAH RENDAH)'},
  {img: 'montaj/terafecta_2.jpg', kat: 'ANUGERAH PENDIDIKAN DIGITAL', tajuk: 'PEMBANGUNAN APLIKASI ANDROID', hasil: 'NAIB JOHAN · SEKOLAH RENDAH'},
  {img: 'montaj/terafecta_3.jpg', kat: 'ANUGERAH SEKOLAH', tajuk: 'EKOSISTEM DIGITAL TERBAIK', hasil: 'SEKOLAH RENDAH'},
  {img: 'montaj/terafecta_4.jpg', kat: 'ANUGERAH SEKOLAH', tajuk: 'PEMBUDAYAAN PENDIDIKAN DIGITAL TERBAIK', hasil: 'ANUGERAH KHAS', khas: true},
];
const MULA_KAD = 3; // rentak
const PANJANG_KAD = 5;
const MULA_AKHIR = MULA_KAD + PANJANG_KAD * ANUGERAH.length; // 23

// ---------------------------------------------------------------- latar pentas
const Latar: React.FC<{t: number}> = ({t}) => {
  const ayun = (k: number) => Math.sin(t * 0.9 + k) * 18;
  return (
    <AbsoluteFill style={{background: '#010205', overflow: 'hidden'}}>
      {/* sedikit visual video promosi rasmi Terafecta sebagai latar (kabur & gelap, tanpa audio) */}
      <OffthreadVideo
        src={staticFile('video/terafecta_bg.mp4')}
        muted
        playbackRate={11.7 / 13.65}
        style={{position: 'absolute', inset: -30, width: 1980, height: 1140, objectFit: 'cover', filter: 'blur(7px) brightness(0.6) saturate(1.25)', opacity: 0.55}}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(13,31,69,.45) 0%, rgba(5,10,26,.7) 55%, rgba(1,2,5,.93) 100%)'}} />
      {/* sinar berputar */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 1700,
          top: 420 - 1700,
          width: 3400,
          height: 3400,
          background: 'repeating-conic-gradient(from 0deg, rgba(255,207,74,.22) 0deg 1.6deg, rgba(0,0,0,0) 1.6deg 9deg)',
          transform: `rotate(${t * 7}deg)`,
          WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 48%)',
          maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 48%)',
          mixBlendMode: 'screen',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 960 - 1500,
          top: 420 - 1500,
          width: 3000,
          height: 3000,
          background: 'repeating-conic-gradient(from 4deg, rgba(56,232,255,.13) 0deg 1deg, rgba(0,0,0,0) 1deg 13deg)',
          transform: `rotate(${-t * 4}deg)`,
          WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 45%)',
          maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 45%)',
          mixBlendMode: 'screen',
        }}
      />
      {/* lampu sorot pentas */}
      {[
        {x: 420, k: 0, c: 'rgba(255,236,190,.38)'},
        {x: 1500, k: 2.1, c: 'rgba(255,236,190,.38)'},
        {x: 960, k: 4.2, c: 'rgba(120,220,255,.28)'},
      ].map((l, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: l.x - 330,
            top: -60,
            width: 660,
            height: 1300,
            background: `linear-gradient(180deg, ${l.c} 0%, rgba(0,0,0,0) 85%)`,
            clipPath: 'polygon(46% 0, 54% 0, 100% 100%, 0 100%)',
            transformOrigin: '50% 0',
            transform: `rotate(${ayun(l.k)}deg)`,
            filter: 'blur(10px)',
            mixBlendMode: 'screen',
          }}
        />
      ))}
      {/* lantai grid 3D */}
      <div style={{position: 'absolute', left: -1200, right: -1200, bottom: -380, height: 900, perspective: 900}}>
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: 'rotateX(76deg)',
            transformOrigin: '50% 100%',
            backgroundImage: 'linear-gradient(rgba(56,232,255,.35) 2px, rgba(0,0,0,0) 2px), linear-gradient(90deg, rgba(56,232,255,.35) 2px, rgba(0,0,0,0) 2px)',
            backgroundSize: '140px 140px',
            backgroundPosition: `0 ${t * 160}px`,
            WebkitMaskImage: 'linear-gradient(0deg, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 90%)',
            maskImage: 'linear-gradient(0deg, rgba(0,0,0,1) 10%, rgba(0,0,0,0) 90%)',
          }}
        />
      </div>
      {/* kabus cahaya di tengah */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 55%, rgba(255,200,90,.16) 0%, rgba(0,0,0,0) 45%)'}} />
      <Particles n={90} color={C.emas} seed="tf" rise={70} />
      <Particles n={40} color={C.cyan} seed="tf2" rise={50} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- tajuk TERAFECTA
const Tajuk: React.FC<{t: number}> = ({t}) => {
  const masuk = interpolate(t, [0, 0.5], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const naik = interpolate(t, [MULA_KAD * RENTAK - 0.35, MULA_KAD * RENTAK + 0.15], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const kilau = ((t * 70) % 260) - 60;
  const sk = interpolate(masuk, [0, 1], [1.5, 1]) * interpolate(naik, [0, 1], [1, 0.36]);
  const y = interpolate(naik, [0, 1], [430, 40]);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', transform: `scale(${sk})`, transformOrigin: '50% 0', opacity: masuk, filter: `blur(${(1 - masuk) * 14}px)`}}>
      {/* teks emas padu + lapisan kilauan bertopeng (elak background-clip:text yang tidak stabil semasa render) */}
      <div style={{position: 'relative', fontFamily: ORB, fontWeight: 900, fontSize: 190, letterSpacing: 18, lineHeight: 1}}>
        <div style={{color: '#f2bf4a', textShadow: '0 0 30px rgba(255,190,60,.55), 0 2px 0 #9a6415, 0 6px 6px rgba(0,0,0,.6)'}}>TERAFECTA</div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            color: '#fff8dc',
            WebkitMaskImage: `linear-gradient(100deg, rgba(0,0,0,0) ${kilau - 14}%, rgba(0,0,0,1) ${kilau}%, rgba(0,0,0,0) ${kilau + 14}%)`,
            maskImage: `linear-gradient(100deg, rgba(0,0,0,0) ${kilau - 14}%, rgba(0,0,0,1) ${kilau}%, rgba(0,0,0,0) ${kilau + 14}%)`,
          }}
        >
          TERAFECTA
        </div>
      </div>
      <div style={{fontFamily: ORB, fontWeight: 700, fontSize: 46, letterSpacing: 22, color: C.putih, marginTop: 18, textShadow: `0 0 20px ${C.cyan}`}}>DIGITAL LUMINARIES AWARDS</div>
    </div>
  );
};

// ---------------------------------------------------------------- kad foto anugerah
const Kad: React.FC<{a: (typeof ANUGERAH)[number]; t: number; t0: number; t1: number}> = ({a, t, t0, t1}) => {
  if (t < t0 - 0.05 || t > t1 + 0.05) return null;
  const lt = t - t0;
  const masuk = interpolate(lt, [0, 0.42], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.1))});
  const keluar = interpolate(t, [t1 - 0.24, t1], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const x = interpolate(masuk, [0, 1], [950, 0]) + interpolate(keluar, [0, 1], [0, -1100]);
  const ry = interpolate(masuk, [0, 1], [-48, -7]) + interpolate(lt, [0, t1 - t0], [0, 12]) + keluar * 40;
  const sk = interpolate(masuk, [0, 1], [0.75, 1]);
  const kabur = (1 - masuk) * 14 + keluar * 18;
  const zum = interpolate(lt, [0, t1 - t0], [1.0, 1.09]);
  const sapu = interpolate(lt, [0.2, 0.9], [-40, 140], clamp);
  const lab = interpolate(lt, [0.3, 0.7], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)}) * (1 - keluar);
  const W = 1000;
  const H = 667;
  return (
    <AbsoluteFill style={{perspective: 1700}}>
      <div style={{position: 'absolute', left: 960 - W / 2, top: 178, width: W, height: H, transform: `translateX(${x}px) rotateY(${ry}deg) scale(${sk})`, filter: kabur > 0.2 ? `blur(${kabur}px)` : undefined}}>
        <div
          style={{
            position: 'absolute',
            inset: -6,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #fff1b8, #c98b2b 40%, #ffe08a 60%, #8a5a14)',
            boxShadow: `0 0 60px rgba(255,190,60,${a.khas ? 0.85 : 0.5}), 0 30px 80px rgba(0,0,0,.8)`,
          }}
        />
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 6, background: '#000'}}>
          <Img src={staticFile(a.img)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zum})`}} />
          <div style={{position: 'absolute', inset: 0, background: `linear-gradient(110deg, rgba(255,255,255,0) ${sapu - 12}%, rgba(255,250,220,.55) ${sapu}%, rgba(255,255,255,0) ${sapu + 12}%)`, mixBlendMode: 'screen'}} />
        </div>
        {/* bucu HUD */}
        {[
          {left: -26, top: -26, bl: 1, bt: 1},
          {right: -26, top: -26, br: 1, bt: 1},
          {left: -26, bottom: -26, bl: 1, bb: 1},
          {right: -26, bottom: -26, br: 1, bb: 1},
        ].map((c, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: 54,
              height: 54,
              left: c.left,
              right: c.right,
              top: c.top,
              bottom: c.bottom,
              borderColor: C.cyan,
              borderStyle: 'solid',
              borderWidth: `${c.bt ? 4 : 0}px ${c.br ? 4 : 0}px ${c.bb ? 4 : 0}px ${c.bl ? 4 : 0}px`,
              filter: `drop-shadow(0 0 8px ${C.cyan})`,
            }}
          />
        ))}
        {a.khas && (
          <div style={{position: 'absolute', right: -40, top: -44, transform: `rotate(8deg) scale(${interpolate(lt, [0.45, 0.75], [2.2, 1], clamp)})`, opacity: interpolate(lt, [0.45, 0.6], [0, 1], clamp), padding: '12px 26px', background: EMAS_GRAD, color: '#3a2200', fontFamily: ORB, fontWeight: 900, fontSize: 30, letterSpacing: 4, borderRadius: 6, boxShadow: '0 0 40px rgba(255,200,80,.9)'}}>
            ★ ANUGERAH KHAS
          </div>
        )}
      </div>
      {/* label anugerah */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 872, textAlign: 'center', opacity: lab, transform: `translateY(${(1 - lab) * 30}px)`}}>
        <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 6, color: C.cyan, textShadow: `0 0 10px ${C.cyan}`}}>{a.kat}</div>
        <div
          style={{
            fontFamily: ORB,
            fontWeight: 900,
            fontSize: a.tajuk.length > 30 ? 50 : 60,
            letterSpacing: 3,
            marginTop: 6,
            color: '#f7c955',
            textShadow: '0 0 16px rgba(255,190,60,.6), 0 2px 0 #8a5a14, 0 4px 4px rgba(0,0,0,.8)',
          }}
        >
          {a.tajuk}
        </div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: C.putih, marginTop: 4, textShadow: '0 2px 6px #000'}}>{a.hasil}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- penutup: keempat-empat kad
const Himpun: React.FC<{t: number}> = ({t}) => {
  const t0 = MULA_AKHIR * RENTAK;
  if (t < t0) return null;
  const lt = t - t0;
  const pos = [
    {x: -470, y: -125, r: -6},
    {x: 470, y: -125, r: 6},
    {x: -470, y: 240, r: -4},
    {x: 470, y: 240, r: 4},
  ];
  const teks = interpolate(lt, [0.5, 0.9], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill style={{perspective: 1700}}>
      {ANUGERAH.map((a, i) => {
        const m = interpolate(lt, [i * 0.08, i * 0.08 + 0.5], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.3))});
        const p = pos[i];
        const ap = Math.sin(t * 1.4 + i) * 6;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 960 - 280,
              top: 470 - 187,
              width: 560,
              height: 373,
              transform: `translate(${p.x * m}px, ${p.y * m + ap}px) rotate(${p.r * m}deg) rotateY(${(1 - m) * 70}deg) scale(${0.4 + 0.6 * m})`,
              opacity: m,
              borderRadius: 6,
              border: '4px solid #e8b94a',
              boxShadow: `0 0 ${a.khas ? 50 : 26}px rgba(255,190,60,.7), 0 20px 50px rgba(0,0,0,.8)`,
              overflow: 'hidden',
            }}
          >
            <Img src={staticFile(a.img)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 455, textAlign: 'center', opacity: teks, transform: `scale(${0.8 + 0.2 * teks})`}}>
        <div style={{display: 'inline-block', padding: '16px 40px', background: 'rgba(3,8,20,.82)', border: '2px solid #e8b94a', boxShadow: '0 0 40px rgba(255,190,60,.5)'}}>
          <div style={{fontFamily: ORB, fontWeight: 900, fontSize: 40, letterSpacing: 6, color: '#f7c955', textShadow: '0 0 14px rgba(255,190,60,.6)'}}>SK SULTAN OMAR</div>
          <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: 5, color: C.cyan, marginTop: 6}}>4 PENGIKTIRAFAN · TERAFECTA</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Terafecta: React.FC<{fd: number}> = ({fd}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  // kilat putih pada setiap rentak masuk
  const masa = [0, ...ANUGERAH.map((_, i) => (MULA_KAD + i * PANJANG_KAD) * RENTAK), MULA_AKHIR * RENTAK];
  let kilat = 0;
  masa.forEach((m, i) => {
    const d = t - m;
    if (d >= 0) kilat = Math.max(kilat, (i === 0 ? 0.85 : 0.32) * Math.exp(-d * 9));
  });
  const keluar = interpolate(frame, [fd - 5, fd], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Latar t={t} />
      <Tajuk t={t} />
      {ANUGERAH.map((a, i) => (
        <Kad key={i} a={a} t={t} t0={(MULA_KAD + i * PANJANG_KAD) * RENTAK} t1={(MULA_KAD + (i + 1) * PANJANG_KAD) * RENTAK} />
      ))}
      <Himpun t={t} />
      <AbsoluteFill style={{background: '#fff', opacity: Math.min(1, kilat + keluar), mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};
