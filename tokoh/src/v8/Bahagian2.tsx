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
import {ci, easeInOut, easeOut, FilmLook, Gold, Gold3D, GOLD, GOLD_GRAD, SANS, SERIF, Vignette} from '../components';
import {SceneKira, SceneReveal} from '../scenes';
import {Brackets, GlitchBands, Scramble} from '../scifi';
import CALON from './calon.json';
import {BANDAR, City, DUNGUN, Globe, lerpRot} from './Globe';
import {beatAfter, beatIndex, pulseAt, usePulse} from './beat';

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);
const MONO = "'JetBrains Mono', monospace";
const RED = '#ff4d5e';

// ------------------------------------------------------------------ garis masa (saat, setempat)
type Item = {t: number; len: number; kind: 'bab' | 'foto' | 'sulit'; a: string; b?: string};
const G: Item[] = [];
let tt = 0;
// setiap gambar dikira dalam RENTAK lagu The Last Strike (~0.46 s/rentak): dum - tukar, dup - tukar.
// Dalam setiap bab tukaran makin laju (4 -> 2 -> 1 rentak), kemudian ditahan sekejap sebelum bab seterusnya.
const PH0 = 104.6;
const T0 = 104.87 - PH0; // rentak kuat pertama
const add = (kind: Item['kind'], beats: number, a: string, b?: string) => {
  const end = beatAfter('last_strike', tt + PH0, beats) - PH0;
  G.push({t: tt, len: end - tt, kind, a, b});
  tt = end;
};
const siri = (keys: string[], rentak: number[]) => keys.forEach((k, i) => add('foto', rentak[Math.min(i, rentak.length - 1)], k));
tt = T0;
add('bab', 4, 'BAB I', 'LANGKAH PERTAMA');
siri(['b01', 'b02', 'b03', 'b04', 'b05', 'b06', 'b07', 'b08', 'b09', 'b10', 'b11', 'b12', 'b13'], [4, 4, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 4]);
add('bab', 4, 'BAB II', 'ALAM PERSEKOLAHAN');
siri(['c01', 'c02', 'c03', 'c04', 'c05', 'c06'], [4, 2, 2, 1, 1, 4]);
add('sulit', 6, 'PENYERTAAN 2026', '18 ████████████');
add('bab', 4, 'BAB III', 'MULA DIKENALI');
siri(['d01', 'd02', 'd03'], [4, 2, 4]);
add('sulit', 6, 'JOHAN ███', 'PERINGKAT NEGERI');
add('bab', 4, 'BAB IV', '█████████');
add('foto', 8, 'e01'); // lari berpagar -> montaj selepas pendedahan
const MORPH = tt; // ~63.5
const PETA = MORPH + 17.7;
const CW_PETA = 21.0; // Clockwork untuk peta misi // 76.9
const KLIMAKS = PETA + 37.7; // peta misi 37.7 s
const DROP = KLIMAKS + 34.5; // pendedahan (The Last Strike 1:00)
const AKHIR = DROP + 13.5;
const SV_GAH = 96.68; // saat dalam Beneath the Sovereign Sky bila muzik meletup selepas senyap (pendedahan)
const LS_PRE = 7.0; // lagu pendedahan bermula 7 s sebelum DROP
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

// syot sinematik penuh skrin: gambar rata (tiada kesan 3D), Ken Burns perlahan + hentakan zum ikut rentak
// gambar yang menunjukkan jantina/identiti -> versi CLASSIFIED (bar hitam / zum bukti), dibuka selepas pendedahan
export const SULIT = new Set(['b03', 'b06', 'b07', 'b08', 'b09', 'b10', 'b11', 'b12', 'b13', 'c01', 'c02', 'c03', 'c04', 'c05', 'c06', 'd01', 'd02', 'd03', 'e01']);
const Foto: React.FC<{src: string; bar?: string; len: number; i: number; music: number}> = ({src, bar, len, i, music}) => {
  const fr = useCurrentFrame();
  const p = usePulse('last_strike', music, 0.28, 0.6);
  const L = f(len);
  const u = fr / L;
  const dir = random('d' + i) > 0.5 ? 1 : -1;
  const pantas = len < 1.2; // potongan keras tepat pada rentak
  const inn = pantas ? 1 : ci(fr, 0, 6);
  const out = pantas ? 1 : 1 - ci(fr, L - 4, L);
  const tumbuk = 0.16 * Math.exp(-fr / 5); // hentakan zum kuat setiap kali gambar masuk pada rentak
  const sk = 1.03 + 0.05 * u + 0.02 * p + tumbuk;
  const st: React.CSSProperties = {position: 'absolute', width: 1920, height: 1080, left: 0, top: 0};
  return (
    <AbsoluteFill style={{background: '#000', opacity: inn * out, overflow: 'hidden'}}>
      <Img src={staticFile(src)} style={{...st, transform: `translateX(${dir * 14 * (u - 0.5)}px) scale(${sk})`}} />
      {bar ? (
        // bar CLASSIFIED sentiasa ada sejak bingkai pertama (tiada kebocoran), cuma dihentak dari besar ke saiz asal
        <>
          <Img src={staticFile(bar)} style={{...st, transform: `translateX(${dir * 14 * (u - 0.5)}px) scale(${sk})`}} />
          <Img src={staticFile(bar)} style={{...st, opacity: 0.6 * (1 - ci(fr, 0, 6)), transform: `translateX(${dir * 14 * (u - 0.5)}px) scale(${sk * (1 + 0.2 * (1 - ci(fr, 0, 6, 0, 1, easeOut)))})`}} />
        </>
      ) : null}
      <AbsoluteFill style={{background: '#fff', opacity: 0.06 * p, mixBlendMode: 'soft-light'}} />
      <AbsoluteFill style={{background: '#fff', opacity: 0.35 * Math.exp(-fr / 2.5)}} />
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
  const akhir = ci(fr, f(30.6), f(31.8), 0, 1, easeOut);
  const teks = ci(fr, f(31.2), f(32.1));
  const r = interpolate(fr, [0, f(2.5), f(31), len], [380, 470, 470, 400], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 40% 50%, #121a28 0%, #020305 75%)', opacity: inn}}>
      {/* zum keluar pada akhir: glob kecil di tengah atas, teks 3D di bawah */}
      <Globe cx={interpolate(akhir, [0, 1], [720, 960])} cy={interpolate(akhir, [0, 1], [560, 350])} r={interpolate(akhir, [0, 1], [r, 245])} rot={rot} cities={cities} arcLen={22} dungunAt={f(1.2)} />
      <div style={{position: 'absolute', left: 90, top: 70, fontFamily: MONO, fontSize: 24, letterSpacing: 8, color: '#d9d2c2'}}>
        FAIL MISI · <span style={{color: GOLD}}>LUAR NEGARA</span>
      </div>
      {MISI.map((m, i) => (
        <Sequence key={i} from={f(m.t)} durationInFrames={f(7)}>
          <KadMisi m={m} i={i} />
        </Sequence>
      ))}
      {teks > 0 ? (
        <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 660}}>
          <Gold3D text="4 NEGARA" size={150} p={teks} shine={ci(fr, f(32.2), f(33.4))} yaw={interpolate(fr, [f(31.2), len], [-6, 5])} />
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: 14, color: '#fff', marginTop: 34, opacity: ci(fr, f(32.3), f(32.9)), textShadow: '0 4px 16px rgba(0,0,0,0.9)'}}>1 MURID</div>
        </AbsoluteFill>
      ) : null}
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ imbasan calon (wajah rekaan - BUKAN Thoriq)
type Box = {x: number; y: number; w: number; h: number};
// susunan paparan: lelaki & perempuan bersilih ganti (nombor fail CALON_0n)
const URUT = [3, 1, 5, 6, 8, 2, 9, 4, 7].filter((n) => n <= (CALON as Box[]).length);
const CB = URUT.map((n) => (CALON as Box[])[n - 1]);
const NCALON = CB.length;
// tempoh setiap calon (makin laju), jumlah ~12.5 s
const CALON_LEN = Array.from({length: NCALON}, (_, i) => 12.5 / NCALON * (1.35 - (0.7 * i) / Math.max(1, NCALON - 1)));
const CALON_T = CALON_LEN.reduce<number[]>((a, l, i) => [...a, i === 0 ? 0 : a[i - 1] + CALON_LEN[i - 1]], []);
const IMBAS_LEN = CALON_T[NCALON - 1] + CALON_LEN[NCALON - 1];

// kamera: zum z berpusat pada wajah, wajah digerakkan ke tengah skrin sebanyak e (0..1)
const kam = (b: Box, z: number, e: number) => {
  const ox = b.x + b.w / 2;
  const oy = b.y + b.h / 2;
  const tx = (960 - ox) * e;
  const ty = (480 - oy) * e;
  const map = (x: number, y: number): [number, number] => [ox + tx + (x - ox) * z, oy + ty + (y - oy) * z];
  const [x0, y0] = map(b.x, b.y);
  const [x1, y1] = map(b.x + b.w, b.y + b.h);
  return {style: {transform: `translate(${tx}px, ${ty}px) scale(${z})`, transformOrigin: `${ox}px ${oy}px`} as React.CSSProperties, rect: [x0, y0, x1, y1] as [number, number, number, number]};
};

const KadCalon: React.FC<{k: number; len: number}> = ({k, len}) => {
  const fr = useCurrentFrame();
  const L = f(len);
  const b = CB[k];
  const scanEnd = Math.round(L * 0.62);
  const scan = ci(fr, 3, scanEnd);
  const no = ci(fr, scanEnd, scanEnd + 4, 0, 1, Easing.out(Easing.back(2)));
  const out = ci(fr, L - 6, L);
  const pct = Math.round(scan * (18 + random('pc' + k) * 45));
  // bidikan sederhana -> tolak masuk ke wajah; calon lewat bermula lebih dekat
  const z0 = 1.0 + 0.85 * (k / Math.max(1, NCALON - 1));
  const e = Easing.inOut(Easing.cubic)(ci(fr, 0, scanEnd + 2));
  const z = z0 + (2.05 - z0) * e + 0.03 * (fr / L);
  const c = kam(b, z, Math.min(1, 0.35 + e));
  const [rx0, ry0, rx1, ry1] = c.rect;
  const pad = 26;
  const sy = ry0 - pad + (ry1 - ry0 + 2 * pad) * scan;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Img src={staticFile(`v8/calon/c${URUT[k]}.jpg`)} style={{width: 1920, height: 1080, ...c.style, filter: `saturate(${1 - 0.6 * no}) brightness(${1 - 0.25 * no})`}} />
      <AbsoluteFill style={{background: RED, opacity: 0.22 * no, mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: 'rgba(0,30,40,0.25)', opacity: 1 - no}} />
      <Brackets rect={[rx0 - pad, ry0 - pad, rx1 + pad, ry1 + pad]} p={ci(fr, 0, 6)} color={no > 0.5 ? RED : '#7ff3ff'} />
      {scan < 1 ? <div style={{position: 'absolute', left: rx0 - 40, width: rx1 - rx0 + 80, top: sy, height: 3, background: '#9ff8ff', boxShadow: '0 0 18px 6px rgba(120,240,255,0.7)'}} /> : null}
      <div style={{position: 'absolute', left: 90, top: 80, fontFamily: MONO, color: '#bff6ff', fontSize: 26, letterSpacing: 4, textShadow: '0 0 8px rgba(0,0,0,0.9)'}}>
        <div>IMBASAN CALON {String(k + 1).padStart(2, '0')} / {String(NCALON).padStart(2, '0')}</div>
        <div style={{fontSize: 44, fontWeight: 700, marginTop: 10, color: no > 0.5 ? RED : '#fff'}}>PADANAN {pct}%</div>
      </div>
      <div style={{position: 'absolute', left: (rx0 + rx1) / 2, top: Math.min(ry1 + 60, 900), transform: `translateX(-50%) rotate(-8deg) scale(${2.2 - 1.2 * no})`, opacity: no, border: `6px solid ${RED}`, color: RED, fontFamily: MONO, fontWeight: 700, fontSize: 72, letterSpacing: 12, padding: '4px 26px', background: 'rgba(0,0,0,0.35)'}}>BUKAN</div>
      <GlitchBands intensity={Math.max(ci(fr, L - 8, L), no * (1 - ci(fr, scanEnd + 4, scanEnd + 10)) * 0.6)} seed={'cg' + k} />
      <AbsoluteFill style={{background: '#000', opacity: out}} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// klimaks: calon berkelip pantas ikut separuh rentak Clockwork
const CalonLaju: React.FC<{music: number}> = ({music}) => {
  const fr = useCurrentFrame();
  const mt = music + fr / FPS;
  const k = beatIndex('clockwork_collapse', mt, true) % NCALON;
  const p = pulseAt('clockwork_collapse', mt, 0.12, 0.5);
  const b = CB[k];
  const c = kam(b, 1.9 + 0.12 * p, 1);
  const [rx0, ry0, rx1, ry1] = c.rect;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Img src={staticFile(`v8/calon/c${URUT[k]}.jpg`)} style={{width: 1920, height: 1080, ...c.style, filter: 'saturate(0.4) brightness(0.75) contrast(1.2)'}} />
      <AbsoluteFill style={{background: RED, opacity: 0.25, mixBlendMode: 'multiply'}} />
      <Brackets rect={[rx0 - 26, ry0 - 26, rx1 + 26, ry1 + 26]} p={1} color={RED} />
      <div style={{position: 'absolute', left: (rx0 + rx1) / 2, top: Math.min(ry1 + 60, 900), transform: 'translateX(-50%) rotate(-8deg)', border: `6px solid ${RED}`, color: RED, fontFamily: MONO, fontWeight: 700, fontSize: 72, letterSpacing: 12, padding: '4px 26px', background: 'rgba(0,0,0,0.35)'}}>BUKAN</div>
      <AbsoluteFill style={{background: '#fff', opacity: 0.4 * p * p}} />
      <GlitchBands intensity={0.3 + 0.5 * p} seed={'cl' + k} />
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
  const list = ['e01', 'c03', 'd02', 'b07', 'd01', 'c01', 'd03', 'b04', 'c04', 'b09', 'c05', 'b02', 'c06', 'b12'];
  // gambar bertukar pada setiap separuh rentak Clockwork Collapse; kilat & hentakan pada rentak penuh
  const k = beatIndex('clockwork_collapse', mt, true) % list.length;
  const p = pulseAt('clockwork_collapse', mt, 0.12, 0.5);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Img src={staticFile(SULIT.has(list[k]) ? `v8/hidup/r_${list[k]}.jpg` : `v8/hidup/${list[k]}.jpg`)} style={{position: 'absolute', width: 1920, height: 1080, objectFit: 'cover', filter: `grayscale(0.6) contrast(1.2) brightness(${0.8 + 0.4 * p})`, transform: `scale(${1.04 + 0.08 * p})`}} />
      {SULIT.has(list[k]) ? <Img src={staticFile(`v8/hidup/r_${list[k]}_bar.png`)} style={{position: 'absolute', width: 1920, height: 1080, transform: `scale(${1.04 + 0.08 * p})`}} /> : null}
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
SFX.push([MORPH, 'sfx/dengung', 0.45], [MORPH, 'sfx/sub_drop', 0.5], [MORPH + IMBAS_LEN + 0.6, 'sfx/swish_teks', 0.45]);
CALON_T.forEach((t, k) => {
  const L = CALON_LEN[k];
  SFX.push([MORPH + t, 'sfx/hud_boot', 0.35], [MORPH + t + 0.1, 'sfx/imbasan', 0.5], [MORPH + t + 0.2, 'sfx/data', 0.25]);
  SFX.push([MORPH + t + Math.round(f(L) * 0.62) / FPS, 'sfx/amaran', 0.45], [MORPH + t + Math.round(f(L) * 0.62) / FPS, 'sfx/impact_lembut', 0.5]);
  SFX.push([MORPH + t + L - 0.25, 'sfx/glitch', 0.4]);
});
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
          {g.kind === 'foto' ? <Foto src={SULIT.has(g.a) ? `v8/hidup/r_${g.a}.jpg` : `v8/hidup/${g.a}.jpg`} bar={SULIT.has(g.a) ? `v8/hidup/r_${g.a}_bar.png` : undefined} len={g.len} i={i} music={g.t + PH0} /> : null}
          {g.kind === 'sulit' ? <KadSulit a={g.a} b={g.b || ''} len={g.len} /> : null}
        </Sequence>
      ))}
      {/* B. imbasan calon (wajah rekaan) -> siluet kabur "SIAPAKAH DIA?" */}
      {CALON_T.map((t, k) => (
        <Sequence key={'c' + k} from={f(MORPH + t)} durationInFrames={f(CALON_LEN[k])}>
          <KadCalon k={k} len={CALON_LEN[k]} />
        </Sequence>
      ))}
      <Sequence from={f(MORPH + IMBAS_LEN)} durationInFrames={f(PETA - MORPH - IMBAS_LEN)}>
        <OffthreadVideo src={staticFile('v8/flow/morph_lambat.mp4')} muted trimBefore={f(17.7 - (PETA - MORPH - IMBAS_LEN))} />
        <Sequence from={f(0.6)}>
          <Teks text="SIAPAKAH DIA?" len={PETA - MORPH - IMBAS_LEN - 0.6} size={78} y={-760} />
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
      <Sequence from={f(kStart + 12.5)} durationInFrames={f(4.6)}>
        <CalonLaju music={CC0 + 12.5} />
      </Sequence>
      <Sequence from={f(kStart + 12.5 + 4.6)} durationInFrames={f(1.4)}>
        <OffthreadVideo src={staticFile('v8/flow/morph_laju.mp4')} muted trimBefore={f(4.6)} />
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
      {/* perjalanan pembesaran: The Last Strike (1:52 -> outro), reput ke dalam siluet */}
      <Sequence from={0} durationInFrames={f(PETA)}>
        <Audio src={staticFile('v8/muzik/last_strike.mp3')} trimBefore={f(PH0)} volume={vol([0, 1.0, MORPH, PETA - 1], [0.6, 0.9, 0.9, 0])} />
      </Sequence>
      {/* peta misi: The Clockwork Collapse (0:21 -> 0:59) */}
      <Sequence from={f(PETA)} durationInFrames={f(KLIMAKS - PETA + 0.5)}>
        <Audio src={staticFile('v8/muzik/clockwork_collapse.mp3')} trimBefore={f(CW_PETA)} volume={vol([0, 1.2, KLIMAKS - PETA - 1.5, KLIMAKS - PETA + 0.3], [0, 0.8, 0.8, 0])} />
      </Sequence>
      {/* The Clockwork Collapse untuk klimaks: berakhir pada senyapnya sendiri (0:99) tepat bila The Last Strike masuk */}
      <Sequence from={f(KLIMAKS)} durationInFrames={f(DROP - KLIMAKS)}>
        <Audio src={staticFile('v8/muzik/clockwork_collapse.mp3')} trimBefore={f(CC0)} volume={vol([0, 1.0, DROP - KLIMAKS - LS_PRE - 0.3, DROP - KLIMAKS - LS_PRE + 0.6], [0, 0.85, 0.85, 0])} />
      </Sequence>
      {/* The Last Strike: masuk pada 0:53 (binaan perlahan dari 0:54) -> 1:00 bunyi gah tepat pada PENDEDAHAN */}
      <Sequence from={f(DROP - LS_PRE)} durationInFrames={f(AKHIR - DROP + LS_PRE)}>
        <Audio src={staticFile('v8/muzik/sovereign.mp3')} trimBefore={f(SV_GAH - LS_PRE)} volume={vol([0, 1.0, LS_PRE + AKHIR - DROP - 2.5, LS_PRE + AKHIR - DROP], [0, 1.0, 1.0, 0])} />
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
