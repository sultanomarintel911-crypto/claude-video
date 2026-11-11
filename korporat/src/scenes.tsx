import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FPS, JALAN, Seg, STAT_KAD} from './data';
import {C, MONO, Network, ORB, Particles, SANS, typed} from './fx';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Klip video sumber (dibisukan; audio dikawal berasingan)
export const Klip: React.FC<{s: Seg; style?: React.CSSProperties}> = ({s, style}) => (
  <OffthreadVideo
    src={staticFile(s.src as string)}
    trimBefore={Math.round(s.from * FPS)}
    playbackRate={s.rate}
    muted
    style={{width: '100%', height: '100%', objectFit: 'cover', ...style}}
  />
);

// ---------- Pembukaan: imbasan biometrik ----------
const LOG = ['> OMAR-AI v26.0 // SISTEM SKeSO', '> MENGIMBAS BIOMETRIK...', '> PADANAN WAJAH: 99.8%', '> IDENTITI DISAHKAN: GURU BESAR'];
export const Bio: React.FC<{s: Seg}> = ({s}) => {
  const frame = useCurrentFrame();
  const fin = s.fd;
  const flash = interpolate(frame, [fin - 6, fin], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Klip s={s} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,10,25,.75) 0%, rgba(0,10,25,0) 45%)'}} />
      <div style={{position: 'absolute', left: 90, top: 90, fontFamily: MONO, fontSize: 26, color: C.cyan, lineHeight: 1.7, textShadow: '0 0 10px rgba(56,232,255,.8)'}}>
        {LOG.map((l, i) => {
          const st = 10 + i * 30;
          if (frame < st) return null;
          return (
            <div key={i} style={{color: i === LOG.length - 1 ? '#5dff9b' : C.cyan}}>
              {typed(l, frame - st, 40)}
            </div>
          );
        })}
      </div>
      {/* bar imbasan */}
      <div style={{position: 'absolute', left: 90, top: 330, width: 460, height: 8, border: `1px solid ${C.cyan}`}}>
        <div style={{height: '100%', width: `${interpolate(frame, [40, 110], [0, 100], clamp)}%`, background: C.cyan, boxShadow: `0 0 12px ${C.cyan}`}} />
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};

// ---------- Era kertas ----------
export const Kertas: React.FC<{s: Seg}> = ({s}) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [6, 18, 3.6 * FPS, 4.2 * FPS], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill>
      <Klip s={s} style={{filter: 'grayscale(1) contrast(1.1)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,.7) 100%)'}} />
      <div style={{position: 'absolute', left: 60, top: 60, opacity: op, padding: '22px 34px', background: 'linear-gradient(90deg, rgba(0,0,0,.82), rgba(0,0,0,.5))', borderLeft: '5px solid #ff5b6e'}}>
        <div style={{fontFamily: MONO, fontSize: 22, color: '#ff5b6e', letterSpacing: 4}}>● MOD: ANALOG</div>
        <div style={{fontFamily: ORB, fontWeight: 900, fontSize: 64, color: '#fff', letterSpacing: 6, textShadow: '0 4px 16px #000'}}>{typed('DAHULU...', frame - 12, 14)}</div>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 28, color: '#ddd', textShadow: '0 2px 8px #000'}}>Fail bertimbun · Kertas berlambak · Ruang semakin sempit</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Statistik pembudayaan digital ----------
const KAD_LEN = 3.6 * FPS;
const KadKira: React.FC<{n: number; suffix: string; title: string; sub: string}> = ({n, suffix, title, sub}) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [6, 40], [0, n], {...clamp, easing: Easing.out(Easing.cubic)});
  const sc = interpolate(frame, [0, 10], [0.85, 1], {...clamp, easing: Easing.out(Easing.back(2))});
  const op = interpolate(frame, [0, 6, KAD_LEN - 6, KAD_LEN], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: op, transform: `scale(${sc})`}}>
      <div style={{fontFamily: ORB, fontWeight: 900, fontSize: 230, lineHeight: 1, color: '#fff', textShadow: `0 0 30px ${C.cyan}, 0 0 80px ${C.biru}`}}>
        {Math.round(v)}
        <span style={{fontSize: 140, color: C.cyan}}>{suffix}</span>
      </div>
      <div style={{fontFamily: ORB, fontWeight: 700, fontSize: 50, letterSpacing: 6, color: C.putih, marginTop: 10, textShadow: '0 0 16px rgba(56,232,255,.8)'}}>{title}</div>
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, color: '#b9d8ff', marginTop: 12}}>{sub}</div>
    </AbsoluteFill>
  );
};
const KadJalan: React.FC<{title: string; sub: string}> = ({title, sub}) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 6, KAD_LEN - 6, KAD_LEN], [0, 1, 1, 0], clamp);
  const prog = interpolate(frame, [8, 70], [0, 1], clamp);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: op}}>
      <div style={{fontFamily: ORB, fontWeight: 900, fontSize: 70, letterSpacing: 6, color: '#fff', textShadow: `0 0 26px ${C.cyan}`}}>{title}</div>
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, color: '#b9d8ff', marginBottom: 70}}>{sub}</div>
      <div style={{position: 'relative', width: 1400, height: 200}}>
        <div style={{position: 'absolute', left: 120, right: 120, top: 40, height: 4, background: 'rgba(56,232,255,.25)'}} />
        <div style={{position: 'absolute', left: 120, top: 40, height: 4, width: 1160 * prog, background: C.cyan, boxShadow: `0 0 14px ${C.cyan}`}} />
        {JALAN.map((j, i) => {
          const on = prog >= i / 2 - 0.001;
          const last = i === JALAN.length - 1;
          const col = last ? C.emas : C.cyan;
          return (
            <div key={i} style={{position: 'absolute', left: 120 + i * 580 - 150, width: 300, top: 0, textAlign: 'center', opacity: on ? 1 : 0.25}}>
              <div style={{width: 84, height: 84, margin: '0 auto', borderRadius: '50%', border: `4px solid ${col}`, background: on ? 'rgba(0,30,60,.9)' : 'transparent', boxShadow: on ? `0 0 30px ${col}` : 'none', fontFamily: ORB, fontWeight: 900, fontSize: 34, color: col, lineHeight: '84px'}}>{i + 1}</div>
              <div style={{fontFamily: MONO, fontSize: 26, color: col, marginTop: 14}}>{j.y}</div>
              <div style={{fontFamily: ORB, fontWeight: 700, fontSize: 26, color: '#fff', marginTop: 4}}>{j.t}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
export const Statistik: React.FC<{s: Seg}> = ({s}) => {
  const frame = useCurrentFrame();
  const bg = interpolate(frame, [0, 20], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#020814'}}>
      <OffthreadVideo src={staticFile(s.src as string)} muted playbackRate={0.7} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 * bg, filter: 'blur(6px) saturate(1.4)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(2,8,20,.3) 0%, rgba(2,8,20,.92) 75%)'}} />
      <Network op={0.55} />
      <div style={{position: 'absolute', left: 90, top: 70, fontFamily: MONO, fontSize: 22, color: C.cyan, letterSpacing: 4}}>// DATA PEMBUDAYAAN DIGITAL SKeSO</div>
      {STAT_KAD.map((k, i) => (
        <Sequence key={i} from={Math.round(0.3 * FPS + i * KAD_LEN)} durationInFrames={KAD_LEN} layout="none">
          {k.kind === 'jalan' ? <KadJalan title={k.title} sub={k.sub} /> : <KadKira n={k.n} suffix={k.suffix} title={k.title} sub={k.sub} />}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// ---------- Klimaks: Anugerah EMAS DUTA 2026 ----------
const FOTO: Array<[string, number, number, number, number]> = [
  // [fail, mula(s), tempoh(s), zoom awal, zoom akhir]
  ['img/dscf2470.jpg', 3.4, 4.4, 1.0, 1.12],
  ['img/dscf2473.jpg', 7.6, 3.3, 1.14, 1.02],
  ['img/dscf2468.jpg', 10.7, 3.3, 1.0, 1.1],
];
export const Emas: React.FC<{s: Seg}> = ({s}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const flash = interpolate(frame, [0, 3, 14], [1, 1, 0], clamp);
  const vidOp = interpolate(t, [3.2, 3.8], [1, 0], clamp);
  const ttl = interpolate(frame, [4, 14], [2.2, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const ttlOp = interpolate(frame, [4, 10], [0, 1], clamp);
  const shake = frame >= 10 && frame < 22 ? (Math.sin(frame * 7) * (22 - frame)) / 2 : 0;
  const sweep = interpolate(t % 4, [0, 1.2], [-40, 140], clamp);
  return (
    <AbsoluteFill style={{background: '#000', transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
      {FOTO.map(([src, a, d, z0, z1], i) => {
        const op = interpolate(t, [a - 0.5, a, a + d, a + d + 0.5], [0, 1, 1, i === FOTO.length - 1 ? 1 : 0], clamp);
        if (op <= 0) return null;
        const z = interpolate(t, [a - 0.5, a + d + 0.5], [z0, z1]);
        return <Img key={src} src={staticFile(src)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: op, transform: `scale(${z})`, filter: 'saturate(1.15) contrast(1.05)'}} />;
      })}
      {vidOp > 0 && (
        <AbsoluteFill style={{opacity: vidOp}}>
          <OffthreadVideo src={staticFile('video/emas_stabil.mp4')} trimBefore={Math.round(0.5 * FPS)} muted style={{width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.06)'}} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(10,6,0,.92) 0%, rgba(10,6,0,.55) 26%, rgba(0,0,0,0) 46%)'}} />
      <AbsoluteFill style={{background: `linear-gradient(100deg, transparent ${sweep - 10}%, rgba(255,220,120,.18) ${sweep}%, transparent ${sweep + 10}%)`, mixBlendMode: 'screen'}} />
      <Particles n={80} color={C.emas} seed="emas" rise={70} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 64, textAlign: 'center', opacity: ttlOp}}>
        <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 8, color: '#ffe7a3'}}>DIGITAL UTILISATION TECHNOLOGY AWARD</div>
        <div style={{fontFamily: ORB, fontWeight: 900, fontSize: 118, lineHeight: 1.05, letterSpacing: 10, transform: `scale(${ttl})`, background: 'linear-gradient(180deg, #fff6c8 0%, #ffd34d 45%, #c98a12 100%)', WebkitBackgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 0 22px rgba(255,190,40,.75))'}}>
          ANUGERAH EMAS
        </div>
        <div style={{fontFamily: ORB, fontWeight: 700, fontSize: 38, letterSpacing: 6, color: '#fff', textShadow: '0 0 14px rgba(255,200,60,.9)'}}>DUTA 2026 · KATEGORI SEKOLAH RENDAH</div>
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};

// ---------- Penutup ----------
export const Tutup: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 12], [0, 1], clamp);
  const out = interpolate(frame, [80, 120], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#020814', alignItems: 'center', justifyContent: 'center', opacity: out}}>
      <Network op={0.5} seed="tutup" />
      <div style={{textAlign: 'center', opacity: op}}>
        <div style={{fontFamily: ORB, fontWeight: 900, fontSize: 92, letterSpacing: 8, color: '#fff', textShadow: `0 0 30px ${C.cyan}`}}>SK SULTAN OMAR</div>
        <div style={{fontFamily: ORB, fontWeight: 700, fontSize: 40, letterSpacing: 6, color: C.cyan, marginTop: 10}}>SKeSO BE EXCELLENT</div>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 32, color: '#cfe6ff', marginTop: 6, letterSpacing: 3}}>Merentas Kecemerlangan</div>
        <div style={{fontFamily: MONO, fontSize: 22, color: C.emas, marginTop: 40, letterSpacing: 3}}>MICROSOFT SHOWCASE SCHOOL 2026–2027 · ANUGERAH EMAS DUTA 2026</div>
      </div>
    </AbsoluteFill>
  );
};
