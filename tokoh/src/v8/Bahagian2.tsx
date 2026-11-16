// Trailer Tokoh Murid 2026 (v8) - Bahagian 2: Perjalanan pembesaran -> Siluet -> Peta misi -> Klimaks -> PENDEDAHAN
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Easing, Img, interpolate, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/cinzel/700.css';
import '@fontsource/cinzel/900.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import {ci, easeInOut, easeOut, FilmLook, Gold, GOLD, GOLD_GRAD, SANS, SERIF, Vignette} from '../components';
import {SceneKira, SceneReveal} from '../scenes';
import {Scramble} from '../scifi';
import {BANDAR, City, DUNGUN, Globe, lerpRot} from './Globe';
import {beatIndex, pulseAt, snapBeat, usePulse} from './beat';

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);
const MONO = "'JetBrains Mono', monospace";
const RED = '#ff4d5e';

// ------------------------------------------------------------------ garis masa (saat, setempat)
type Item = {t: number; len: number; kind: 'bab' | 'foto' | 'sulit'; a: string; b?: string};
const G: Item[] = [];
let tt = 0;
// setiap potongan jatuh TEPAT pada rentak lagu Princesses Heart (lagu bermula pada 15.3 s dalam fail)
const PH0 = 15.3;
const add = (kind: Item['kind'], len: number, a: string, b?: string) => {
  const end = snapBeat('princesses_heart', tt + len + PH0) - PH0;
  G.push({t: tt, len: end - tt, kind, a, b});
  tt = end;
};
const bab = (a: string, b: string) => add('bab', 2.5, a, b);
const foto = (a: string) => add('foto', 3.6, a);
const sulit = (a: string, b: string) => add('sulit', 3.0, a, b);
bab('BAB I', 'LANGKAH PERTAMA');
['h01', 'h02', 'h03'].forEach(foto);
bab('BAB II', 'ALAM PERSEKOLAHAN');
['h04', 'h05', 'h06'].forEach(foto);
sulit('PENYERTAAN 2026', '18 ████████████');
bab('BAB III', 'MULA DIKENALI');
['h07', 'h08', 'h09'].forEach(foto);
sulit('JOHAN ███', 'PERINGKAT NEGERI');
bab('BAB IV', '█████████');
['h10', 'h12'].forEach(foto); // h11 (lari berpagar) dipindah ke montaj selepas pendedahan, penuh skrin
const MORPH = tt; // 59.2
const PETA = MORPH + 17.7; // 76.9
const KLIMAKS = 112.0;
const DROP = 146.5; // senyap muzik Shore berakhir -> pendedahan
const AKHIR = 160.0;
const LS_GAH = 60.05; // saat dalam The Last Strike bila muzik jadi gah
const LS_PRE = 7.0; // lagu bermula 7 s sebelum pendedahan
const CC_SENYAP = 99.0; // saat The Clockwork Collapse menjadi senyap (sebelum hentakannya pada 104.5)
const CC0 = CC_SENYAP - (DROP - LS_PRE + 0.2 - KLIMAKS); // masa dalam lagu Clockwork pada KLIMAKS

// ------------------------------------------------------------------ komponen
const KadBab: React.FC<{a: string; b: string; len: number}> = ({a, b, len}) => {
  const fr = useCurrentFrame();
  const p = ci(fr, 2, 14, 0, 1, easeOut);
  const out = 1 - ci(fr, f(len) - 8, f(len));
  return (
    <AbsoluteFill style={{background: '#050505', justifyContent: 'center', alignItems: 'center', opacity: out}}>
      <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 14, color: '#bdb6a6', opacity: p}}>{a}</div>
      <div style={{width: 260 * p, height: 1.5, background: GOLD_GRAD, margin: '18px 0'}} />
      <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 64, letterSpacing: 8, color: '#f3ecdc', opacity: p, transform: `translateY(${14 * (1 - p)}px)`}}>{b}</div>
    </AbsoluteFill>
  );
};

// syot sinematik penuh skrin: paralaks 2.5D (subjek tajam di hadapan, latar kabur bergerak perlahan)
const Foto: React.FC<{src: string; len: number; i: number; music: number}> = ({src, len, i, music}) => {
  const fr = useCurrentFrame();
  // hentakan zum ikut rentak: subjek 'menolak' ke hadapan pada setiap beat
  const p = usePulse('princesses_heart', music, 0.28, 0.6);
  const L = f(len);
  const u = fr / L;
  const dir = random('d' + i) > 0.5 ? 1 : -1;
  const inn = ci(fr, 0, 10);
  const out = 1 - ci(fr, L - 8, L);
  const bgS = 1.06 + 0.03 * u + 0.012 * p;
  const fgS = 1.06 + 0.075 * u + 0.03 * p;
  const bgX = dir * 18 * u;
  const fgX = -dir * 26 * u;
  const base = src.replace('.jpg', '');
  const st: React.CSSProperties = {position: 'absolute', width: 1920, height: 1080, left: 0, top: 0};
  return (
    <AbsoluteFill style={{background: '#000', opacity: inn * out, overflow: 'hidden'}}>
      <Img src={staticFile(base + '_bg.jpg')} style={{...st, transform: `translateX(${bgX}px) scale(${bgS})`}} />
      <Img src={staticFile(base + '_fg.png')} style={{...st, transform: `translateX(${fgX}px) scale(${fgS})`, filter: `blur(${(1 - ci(fr, 0, 14, 0, 1, easeOut)) * 8}px)`}} />
      <AbsoluteFill style={{background: '#fff', opacity: 0.06 * p, mixBlendMode: 'soft-light'}} />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};

const KadSulit: React.FC<{a: string; b: string; len: number}> = ({a, b, len}) => {
  const fr = useCurrentFrame();
  const p = ci(fr, 0, 8, 0, 1, easeOut);
  const stamp = ci(fr, 26, 34, 0, 1, Easing.out(Easing.back(2)));
  const out = 1 - ci(fr, f(len) - 6, f(len));
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, #14161c 0%, #030304 75%)', justifyContent: 'center', alignItems: 'center', opacity: out}}>
      <div style={{position: 'relative', width: 1100, padding: '50px 70px', border: '1.5px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.03)', opacity: p, transform: `scale(${1.05 - 0.05 * p})`}}>
        <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 8, color: '#9aa3b2'}}>FAIL TOKOH MURID · 2026</div>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 58, color: '#fff', marginTop: 26, letterSpacing: 3}}>{a}</div>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 58, color: GOLD, marginTop: 8, letterSpacing: 3}}>
          <Scramble text={b} reveal={ci(fr, 8, 30)} seed={b} />
        </div>
        <div
          style={{
            position: 'absolute',
            right: 50,
            top: 36,
            border: `5px solid ${RED}`,
            color: RED,
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 44,
            letterSpacing: 8,
            padding: '4px 18px',
            transform: `rotate(-12deg) scale(${2 - stamp})`,
            opacity: stamp,
          }}
        >
          SULIT
        </div>
      </div>
      <Vignette />
    </AbsoluteFill>
  );
};

// peta misi: setiap bandar mendapat fail misi
type Misi = {city: Omit<City, 'at'>; t: number; foto?: string; negara: string};
const MISI: Misi[] = [
  {city: BANDAR[0], t: 3.0, negara: 'SINGAPURA'},
  {city: BANDAR[1], t: 10.0, foto: 'v8/img/misi_birmingham.jpg', negara: 'UNITED KINGDOM'},
  {city: BANDAR[2], t: 17.0, foto: 'v8/img/misi_istanbul.jpg', negara: 'TÜRKİYE'},
  {city: BANDAR[3], t: 24.0, negara: 'CHINA'},
];
const fmt = (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(4)}° ${v >= 0 ? pos : neg}`;

const KadMisi: React.FC<{m: Misi; i: number}> = ({m, i}) => {
  const fr = useCurrentFrame();
  const p = ci(fr, 6, 16, 0, 1, easeOut);
  const coord = `${fmt(m.city.lat, 'U', 'S')}  ${fmt(m.city.lon, 'T', 'B')}`;
  const nCh = Math.floor(coord.length * ci(fr, 10, 34));
  const stamp = ci(fr, 92, 100, 0, 1, Easing.out(Easing.back(2)));
  const out = 1 - ci(fr, f(7) - 8, f(7));
  return (
    <div style={{position: 'absolute', right: 90, top: 170, width: 620, opacity: p * out, transform: `translateX(${60 * (1 - p)}px)`}}>
      <div style={{background: 'rgba(8,10,14,0.85)', border: '1px solid rgba(255,255,255,0.22)', padding: 26, backdropFilter: 'blur(6px)'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 20, color: '#9aa3b2', letterSpacing: 4}}>
          <span>FAIL MISI #0{i + 1}</span>
          <span style={{color: RED}}>● SULIT</span>
        </div>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 40, color: '#fff', marginTop: 14, letterSpacing: 3}}>{m.city.name}</div>
        <div style={{fontFamily: MONO, fontSize: 22, color: '#d9d2c2', letterSpacing: 3}}>{m.negara}</div>
        <div style={{fontFamily: MONO, fontSize: 22, color: GOLD, marginTop: 10, height: 30}}>{coord.slice(0, nCh)}</div>
        <div style={{position: 'relative', marginTop: 16, height: 300, overflow: 'hidden', background: '#11141a', border: '1px solid rgba(255,255,255,0.15)'}}>
          {m.foto ? (
            <Img src={staticFile(m.foto)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: `blur(${(1 - ci(fr, 30, 60)) * 14}px) saturate(0.85)`}} />
          ) : (
            <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', background: 'repeating-linear-gradient(45deg, #15181f 0 14px, #1b1f28 14px 28px)'}}>
              <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 30, color: '#9aa3b2', letterSpacing: 6}}>FOTO DISULITKAN</div>
            </AbsoluteFill>
          )}
        </div>
        <div style={{fontFamily: MONO, fontSize: 24, color: '#fff', marginTop: 16, letterSpacing: 3}}>
          MISI: <Scramble text="████████████" reveal={0} seed={'m' + i} />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          right: 40,
          bottom: 70,
          border: '5px solid #3ddc84',
          color: '#3ddc84',
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 38,
          letterSpacing: 6,
          padding: '4px 16px',
          background: 'rgba(0,0,0,0.35)',
          transform: `rotate(-10deg) scale(${2 - stamp})`,
          opacity: stamp,
        }}
      >
        MISI SELESAI
      </div>
    </div>
  );
};

const Peta: React.FC = () => {
  const fr = useCurrentFrame();
  const len = f(KLIMAKS - PETA);
  // pusing ke setiap bandar
  const keys = [0, f(2.5), ...MISI.flatMap((m) => [f(m.t), f(m.t + 5)]), f(31.5), len];
  const rots: Array<[number, number]> = [[80, 10], [DUNGUN.lon, DUNGUN.lat], ...MISI.flatMap((m) => [[m.city.lon * 0.55 + DUNGUN.lon * 0.45, m.city.lat * 0.55 + 5], [m.city.lon * 0.55 + DUNGUN.lon * 0.45, m.city.lat * 0.55 + 5]] as Array<[number, number]>), [62, 28], [62, 28]];
  const rot = lerpRot(fr, keys, rots);
  const cities: City[] = MISI.map((m) => ({...m.city, at: f(m.t + 0.6)}));
  const inn = ci(fr, 0, 12);
  const akhir = ci(fr, f(31.2), f(32.2), 0, 1, easeOut);
  const r = interpolate(fr, [0, f(2.5), f(31), len], [380, 470, 470, 400], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 40% 50%, #121a28 0%, #020305 75%)', opacity: inn}}>
      <Globe cx={720} cy={560} r={r} rot={rot} cities={cities} arcLen={22} dungunAt={f(1.2)} />
      <div style={{position: 'absolute', left: 90, top: 70, fontFamily: MONO, fontSize: 24, letterSpacing: 8, color: '#d9d2c2'}}>
        FAIL MISI · <span style={{color: GOLD}}>LUAR NEGARA</span>
      </div>
      {MISI.map((m, i) => (
        <Sequence key={i} from={f(m.t)} durationInFrames={f(7)}>
          <KadMisi m={m} i={i} />
        </Sequence>
      ))}
      {akhir > 0 ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'flex-end', paddingRight: 140, opacity: akhir}}>
          <div style={{textAlign: 'right'}}>
            <Gold size={170}>4 NEGARA</Gold>
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: 14, color: '#fff', marginTop: 10}}>1 MURID</div>
          </div>
        </AbsoluteFill>
      ) : null}
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};

// gambar K (GB) dengan tolak masuk perlahan
const KImg: React.FC<{src: string; len: number; z?: [number, number]; music?: number}> = ({src, len, z = [1.0, 1.08], music = -1}) => {
  const fr = useCurrentFrame();
  const bp = music >= 0 ? pulseAt('clockwork_collapse', music + fr / FPS, 0.2, 0.9) : 0;
  const s = interpolate(fr, [0, f(len)], z) + 0.025 * bp;
  const inn = ci(fr, 0, 6);
  return (
    <AbsoluteFill style={{background: '#000', opacity: inn, overflow: 'hidden'}}>
      <Img src={staticFile(src)} style={{width: 1920, height: 1080, objectFit: 'cover', transform: `scale(${s})`}} />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};

// kelipan kenangan pantas sebelum kiraan detik
const Kelipan: React.FC<{len: number; music: number}> = ({len, music}) => {
  const fr = useCurrentFrame();
  const mt = music + fr / FPS;
  const list = ['h10', 'h05', 'h08', 'h02', 'h12', 'h07', 'h04', 'h09', 'h01', 'h06', 'h03'];
  // gambar bertukar pada setiap separuh rentak Clockwork Collapse; kilat & hentakan pada rentak penuh
  const k = beatIndex('clockwork_collapse', mt, true) % list.length;
  const p = pulseAt('clockwork_collapse', mt, 0.12, 0.5);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Img src={staticFile(`v8/hidup/${list[k]}.jpg`)} style={{width: 1920, height: 1080, objectFit: 'cover', filter: `grayscale(0.6) contrast(1.2) brightness(${0.8 + 0.4 * p})`, transform: `scale(${1.04 + 0.08 * p})`}} />
      <AbsoluteFill style={{background: '#fff', opacity: 0.45 * p * p}} />
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0 2px, transparent 2px 4px)'}} />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};


const GbPentas: React.FC<{len: number}> = ({len}) => {
  const fr = useCurrentFrame();
  const L = f(len);
  const z = interpolate(fr, [0, L], [1.0, 1.1]);
  const o = ci(fr, 0, 6) * (1 - ci(fr, L - 5, L));
  // kad bercahaya semakin terang sebelum gelap
  const glow = ci(fr, L * 0.3, L * 0.9);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden', opacity: o}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '50% 35%'}}>
        <OffthreadVideo src={staticFile('v8/flow/gb_pentas.mp4')} muted playbackRate={1.25} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 46%, rgba(255,214,120,${0.25 * glow}) 0%, transparent 22%)`, mixBlendMode: 'screen'}} />
      <Teks text="TOKOH MURID 2026 IALAH..." len={len} size={54} y={700} />
    </AbsoluteFill>
  );
};

const Teks: React.FC<{text: string; len: number; size?: number; y?: number}> = ({text, len, size = 64, y = 0}) => {
  const fr = useCurrentFrame();
  const p = ci(fr, 0, 12, 0, 1, easeOut) * (1 - ci(fr, f(len) - 10, f(len)));
  return (
    <AbsoluteFill style={{justifyContent: y < 0 ? 'flex-start' : 'center', alignItems: 'center', paddingTop: y < 0 ? 70 : y}}>
      <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: size, letterSpacing: 6, color: '#f6f0e2', opacity: p, filter: `blur(${(1 - p) * 6}px)`, textShadow: '0 4px 24px rgba(0,0,0,0.9)'}}>{text}</div>
    </AbsoluteFill>
  );
};

const Sub: React.FC<{text: string; len: number}> = ({text, len}) => {
  const fr = useCurrentFrame();
  const o = ci(fr, 0, 6) * (1 - ci(fr, f(len) - 6, f(len)));
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 92, opacity: o}}>
      <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 34, color: '#f4f1ea', textShadow: '0 2px 10px rgba(0,0,0,0.95)'}}>{text}</div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ bunyi
type Sfx = [number, string, number];
const SFX: Sfx[] = [];
G.forEach((g) => {
  if (g.kind === 'bab') SFX.push([g.t, 'sfx/whoosh_panjang', 0.35]);
  if (g.kind === 'foto') SFX.push([g.t, 'sfx/kamera', 0.3]);
  if (g.kind === 'sulit') {
    SFX.push([g.t, 'sfx/glitch', 0.5]);
    SFX.push([g.t + 0.9, 'sfx/impact_lembut', 0.5]);
  }
});
SFX.push([MORPH, 'sfx/sub_drop', 0.5], [MORPH + 11.0, 'sfx/swish_teks', 0.4]);
SFX.push([PETA, 'sfx/hud_boot', 0.6], [PETA + 0.3, 'sfx/data', 0.25]);
MISI.forEach((m) => {
  SFX.push([PETA + m.t, 'sfx/whoosh_pendek', 0.45], [PETA + m.t + 0.6, 'sfx/imbasan', 0.4]);
  for (let k = 0; k < 8; k++) SFX.push([PETA + m.t + 0.35 + k * 0.1, 'sfx/taip', 0.35]);
  SFX.push([PETA + m.t + 3.07, 'sfx/impact_lembut', 0.55]);
});
SFX.push([PETA + 31.2, 'sfx/braam', 0.6]);
// klimaks
SFX.push([KLIMAKS, 'sfx/braam', 0.6], [KLIMAKS, 'sfx/impact_lembut', 0.6]);
SFX.push([KLIMAKS + 12.5, 'sfx/stinger', 0.4], [KLIMAKS + 18.5, 'sfx/riser', 0.6]);
{
  let tb = KLIMAKS + 23.5;
  let gap = 0.9;
  while (tb < DROP - 1.9) {
    SFX.push([tb, 'sfx/degupan', tb > KLIMAKS + 29.5 ? 0.45 : 0.7]);
    tb += gap;
    gap = Math.max(0.45, gap * 0.88);
  }
}
[0, 1, 2].forEach((k) => SFX.push([KLIMAKS + 27 + k, 'sfx/taiko', 0.7], [KLIMAKS + 27 + k, 'sfx/detik', 0.7]));
// pendedahan
SFX.push([DROP - 1.5 - 1.55, 'sfx/sedutan', 0.7]);
SFX.push(
  [DROP, 'sfx/impact_besar', 0.9],
  [DROP, 'sfx/sub_drop', 0.8],
  [DROP, 'sfx/braam', 0.6],
  [DROP, 'sfx/taiko', 0.7],
  [DROP + 0.4, 'sfx/tepukan', 0.6],
);

export const TrailerBahagian2: React.FC = () => {
  const [h] = useState(() => delayRender('fon'));
  useEffect(() => {
    Promise.all(['900 40px Cinzel', '700 40px Cinzel', '500 40px Montserrat', '700 40px Montserrat', '400 40px "JetBrains Mono"', '700 40px "JetBrains Mono"'].map((x) => document.fonts.load(x))).then(() => continueRender(h));
  }, [h]);
  const vol = (pts: number[], vals: number[]) => (fr: number) => interpolate(fr, pts.map(f), vals, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const kStart = KLIMAKS;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* A. perjalanan pembesaran */}
      {G.map((g, i) => (
        <Sequence key={i} from={f(g.t)} durationInFrames={f(g.len)}>
          {g.kind === 'bab' ? <KadBab a={g.a} b={g.b || ''} len={g.len} /> : null}
          {g.kind === 'foto' ? <Foto src={`v8/hidup/${g.a}.jpg`} len={g.len} i={i} music={g.t + PH0} /> : null}
          {g.kind === 'sulit' ? <KadSulit a={g.a} b={g.b || ''} len={g.len} /> : null}
        </Sequence>
      ))}
      {/* B. siluet berubah-ubah */}
      <Sequence from={f(MORPH)} durationInFrames={f(PETA - MORPH)}>
        <OffthreadVideo src={staticFile('v8/flow/morph_lambat.mp4')} muted />
        <Sequence from={f(10.5)} durationInFrames={f(7.2)}>
          <Teks text="SIAPAKAH DIA?" len={7.2} size={78} y={-760} />
        </Sequence>
        <Vignette strength={0.5} />
      </Sequence>
      {/* C. peta misi */}
      <Sequence from={f(PETA)} durationInFrames={f(KLIMAKS - PETA)}>
        <Peta />
      </Sequence>
      {/* D. klimaks */}
      <Sequence from={f(kStart)} durationInFrames={f(5.5)}>
        <KImg src="v8/img/K1.jpg" len={5.5} z={[1.0, 1.12]} music={CC0 + kStart - KLIMAKS} />
      </Sequence>
      <Sequence from={f(kStart + 1.0)} durationInFrames={f(4.2)}>
        <Sub text="Saya dah tahu... siapa dia." len={4.2} />
      </Sequence>
      <Sequence from={f(kStart + 5.5)} durationInFrames={f(3.5)}>
        <KImg src="v8/img/K2.jpg" len={3.5} z={[1.08, 1.0]} music={CC0 + kStart + 5.5 - KLIMAKS} />
      </Sequence>
      <Sequence from={f(kStart + 9.0)} durationInFrames={f(3.5)}>
        <KImg src="v8/img/K3.jpg" len={3.5} z={[1.0, 1.15]} music={CC0 + kStart + 9.0 - KLIMAKS} />
      </Sequence>
      <Sequence from={f(kStart + 12.5)} durationInFrames={f(6.0)}>
        <OffthreadVideo src={staticFile('v8/flow/morph_laju.mp4')} muted />
      </Sequence>
      <Sequence from={f(kStart + 18.5)} durationInFrames={f(5.0)}>
        <Kelipan len={5.0} music={CC0 + 18.5} />
      </Sequence>
      <Sequence from={f(kStart + 23.5)} durationInFrames={f(3.5)}>
        <KImg src="v8/img/K4.jpg" len={3.5} z={[1.0, 1.1]} music={CC0 + kStart + 23.5 - KLIMAKS} />
      </Sequence>
      <Sequence from={f(kStart + 27.0)} durationInFrames={f(3.0)}>
        <SceneKira />
      </Sequence>
      {/* GB di pentas memegang kad bercahaya: "Tokoh Murid 2026 ialah..." */}
      <Sequence from={f(kStart + 30.0)} durationInFrames={f(DROP - kStart - 30.0 - 1.5)}>
        <GbPentas len={DROP - kStart - 31.5} />
      </Sequence>
      {/* E. PENDEDAHAN */}
      <Sequence from={f(DROP)} durationInFrames={f(AKHIR - DROP)}>
        <SceneReveal />
      </Sequence>
      <FilmLook />

      {/* ---------------- muzik ---------------- */}
      <Sequence from={0} durationInFrames={f(PETA + 1)}>
        <Audio src={staticFile('v8/muzik/princesses_heart.mp3')} trimBefore={f(15.3)} volume={vol([0, MORPH, PETA - 2, PETA + 0.5], [0.7, 0.7, 0.55, 0])} />
      </Sequence>
      <Sequence from={f(PETA)} durationInFrames={f(KLIMAKS - PETA + 1)}>
        <Audio src={staticFile('v8/muzik/midnight_breach.mp3')} trimBefore={f(72)} volume={vol([0, 1, KLIMAKS - PETA - 1.5, KLIMAKS - PETA + 0.5], [0, 0.75, 0.75, 0])} />
      </Sequence>
      {/* The Clockwork Collapse untuk klimaks: berakhir pada senyapnya sendiri (0:99) tepat bila The Last Strike masuk */}
      <Sequence from={f(KLIMAKS)} durationInFrames={f(DROP - KLIMAKS)}>
        <Audio src={staticFile('v8/muzik/clockwork_collapse.mp3')} trimBefore={f(CC0)} volume={vol([0, 1.0, DROP - KLIMAKS - LS_PRE - 0.3, DROP - KLIMAKS - LS_PRE + 0.6], [0, 0.85, 0.85, 0])} />
      </Sequence>
      {/* The Last Strike: masuk pada 0:53 (binaan perlahan dari 0:54) -> 1:00 bunyi gah tepat pada PENDEDAHAN */}
      <Sequence from={f(DROP - LS_PRE)} durationInFrames={f(AKHIR - DROP + LS_PRE)}>
        <Audio src={staticFile('v8/muzik/last_strike.mp3')} trimBefore={f(LS_GAH - LS_PRE)} volume={vol([0, 1.0, LS_PRE + AKHIR - DROP - 2.5, LS_PRE + AKHIR - DROP], [0, 1.0, 1.0, 0])} />
      </Sequence>
      <Sequence from={f(kStart + 1.0)}>
        <Audio src={staticFile('v8/vo/GB_03.wav')} volume={1} />
      </Sequence>
      {SFX.map(([t, file, v], i) => (
        <Sequence key={'x' + i} from={Math.max(0, f(t))}>
          <Audio src={staticFile(`${file}.wav`)} volume={(fr) => (f(t) + fr >= f(DROP - 1.5) && f(t) < f(DROP - 1.5) ? 0 : v)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const BAHAGIAN2_LEN = f(AKHIR);
