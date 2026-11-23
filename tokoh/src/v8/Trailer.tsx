// Trailer Tokoh Murid 2026 (v8) - Bahagian 1: Prolog -> Pangkalan -> Arahan -> Mesyuarat VR -> Kotak kenangan
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/cinzel/700.css';
import '@fontsource/cinzel/900.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/jetbrains-mono/400.css';
import {ci, easeOut, FilmLook, Gold, Gold3D, GOLD_GRAD, SANS, SERIF, Vignette} from '../components';
import {BANDAR, City, Globe, lerpRot} from './Globe';
import {pulseAt} from './beat';
import TANGAN from './tangan.json';

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

// ------------------------------------------------------------------ garis masa (saat)
const PRO = 0; // prolog
const PANG = 45.0; // pangkalan (muzik Midnight Breach bermula)
// [mula, nama klip, mula dalam klip, tempoh, kelantangan audio asal (0 = senyap)]
type Shot = [number, string, number, number, number, number?]; // [..., kadar main balik]
const SHOTS: Shot[] = [
  [45.0, 'drones_rise_roof', 0, 7.85, 0.9],
  [52.85, 'drones_taking_off', 0, 7.65, 0.8],
  [60.5, 'drone_wall_opening', 0, 7.85, 0.8],
  [68.35, 'drone_into_lift', 0, 6.08, 0], // drone terbang masuk ke dalam lif bercahaya
  [74.43, 'to_the_basement', 0, 7.85, 0], // suara Inggeris dibuang -> GB_01
  // (syot GB bercakap ke peranti dibuang) lif dibuka dimainkan perlahan; arahan GB sebagai suara luar layar
  [82.28, 'lift_opens_basement', 0, 9.62, 0.7, 0.816],
  // 91.9 - 97.0 kad tajuk
  [97.0, 'woman_reading_hologram', 0, 5.97, 0.7], // teks Inggeris ditutup dengan hologram Melayu
  [102.97, 'woman_touching_earpiece', 0, 5.97, 2.4], // "Baik tuan, saya uruskan."
  // mesyuarat penuh (tiada had tempoh)
  [108.94, 'two_teachers_glowing', 0, 8.04, 0.5], // syot mesyuarat ramai-ramai (visor VR menutup wajah)
  [116.98, 'teacher_wearing_headset', 0, 10.0, 0.5],
  [126.98, 'teachers_invisible_a', 0, 8.04, 0.5],
  [135.02, 'teachers_invisible_b', 2.6, 4.1, 0.5], // tangan menyapu hologram
  [139.12, 'visor_reflections', 0, 10.0, 0.6], // berakhir dengan "?" pada 147.42
  // kotak kenangan: penutup dibuka (klip pertama), kemudian gambar dikeluarkan (klip penuh)
  [149.12, 'hands_opening_box', 0, 2.8, 0.6],
  [151.92, 'fingers_lifting_photo', 0, 7.85, 0.6],
];
const TAJUK = 91.9;
const SOAL = 147.42; // "?" dalam visor
const KOTAK = 148.7; // muzik Princesses Heart
const AKHIR = 164.0;
// muzik: The Clockwork Collapse + The Last Strike mendominasi
const CW1_END = 105.0; // Clockwork 0:00-1:00 (komposisi 45-105)
const MESY = 108.94; // mesyuarat VR bermula
const CW_HIT = 104.5; // hentakan besar Clockwork
const LS_KOTAK = 89.3; // The Last Strike untuk kotak kenangan (berakhir ~1:44.6, Bahagian 2 menyambung dari situ)
// masa dalam lagu Clockwork pada masa komposisi t (-1 jika tiada)
const cwAt = (t: number) => (t < CW1_END ? t - PANG : t >= MESY && t < KOTAK ? t - MESY + CW_HIT : -1);

// VO prolog: [mula, fail, teks sari kata]
const VO: Array<[number, string, string]> = [
  [1.0, 'P1', 'Mereka kata... juara hanya lahir di kota besar.'],
  [6.3, 'P2', 'Katanya, sekolah di Pantai Timur... hanya mampu bermimpi.'],
  [11.8, 'P3', 'Dunia luar pula... terlalu jauh untuk digapai.'],
  [16.6, 'P4', 'Atau sekurang-kurangnya... itulah yang mereka mahu kita percaya.'],
  [23.0, 'P5', 'Tapi lucu juga, kan? Dari sebuah sekolah di Dungun, seorang murid membawa nama sekolahnya sampai ke empat negara.'],
  [33.0, 'P6', 'Saya kata... mimpi tiada sempadan.'],
  [37.4, 'P7', 'Katakan bersama saya...'],
];
const VO_LEN: Record<string, number> = {P1: 3.82, P2: 4.0, P3: 3.09, P4: 4.2, P5: 8.47, P6: 2.95, P7: 4.14};
// dialog: [mula, fail, teks]
const DIALOG: Array<[number, string, string]> = [
  [75.03, 'GB_01', 'Bawa saya ke pangkalan utama.'],
  // suara luar layar semasa GB berjalan masuk ke pangkalan (belakang badan, tiada gerak mulut)
  [86.9, 'GB_02a', 'Adakan mesyuarat segera.'],
  [88.8, 'GB_02b', 'Cari Tokoh Murid tahun ini.'],
];
const DIALOG_LEN: Record<string, number> = {GB_01: 3.0, GB_02a: 1.7, GB_02b: 2.76};
const SUB_ASAL: Array<[number, number, string]> = [[106.47, 108.6, 'Baik, tuan. Saya uruskan.']];

// ------------------------------------------------------------------ komponen kecil
const Sub: React.FC<{text: string; len: number}> = ({text, len}) => {
  const fr = useCurrentFrame();
  const o = ci(fr, 0, 6) * (1 - ci(fr, f(len) - 6, f(len)));
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 92, opacity: o}}>
      <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 34, color: '#f4f1ea', textAlign: 'center', maxWidth: 1400, lineHeight: 1.35, textShadow: '0 2px 10px rgba(0,0,0,0.95), 0 0 2px #000'}}>{text}</div>
    </AbsoluteFill>
  );
};

const Klip: React.FC<{name: string; from: number; len: number; rate?: number; zoom?: number; music?: number; track?: string}> = ({name, from, len, rate = 1, zoom = 0.04, music = -1, track = 'clockwork_collapse'}) => {
  const fr = useCurrentFrame();
  // hentakan zum kecil pada rentak kuat muzik (beat)
  const bp = music >= 0 ? pulseAt(track, music + fr / FPS, 0.2, 1.0) : 0;
  const z = 1 + zoom * (fr / f(len)) + 0.022 * bp;
  const fadeIn = ci(fr, 0, 4);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${z})`, opacity: fadeIn}}>
        <OffthreadVideo src={staticFile(name)} muted trimBefore={f(from)} playbackRate={rate} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ hologram Melayu menutup teks Inggeris
// kedudukan panel dijejak daripada klip asal (saat -> x0,y0,x1,y1)
const PANEL: Array<[number, number, number, number, number]> = [
  [3.9, 868, 215, 1484, 579],
  [4.0, 883, 205, 1527, 595],
  [4.2, 888, 204, 1551, 612],
  [4.6, 899, 198, 1583, 631],
  [5.0, 924, 198, 1604, 627],
  [5.5, 928, 197, 1624, 636],
  [5.97, 927, 195, 1636, 645],
];
const HologramMelayu: React.FC = () => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  if (t < 3.82) return null;
  const k = (i: number) => interpolate(t, PANEL.map((p) => p[0]), PANEL.map((p) => p[i]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const [x0, y0, x1, y1] = [k(1), k(2), k(3), k(4)];
  const w = x1 - x0;
  const h = y1 - y0;
  // tutup kawasan teks sahaja (bahagian tengah panel)
  const cx0 = x0 + w * 0.07;
  const cy0 = y0 + h * 0.18;
  const cw = w * 0.86;
  const ch = h * 0.62;
  const o = ci(fr, f(3.82), f(4.05));
  return (
    <AbsoluteFill style={{opacity: o}}>
      <div
        style={{
          position: 'absolute',
          left: cx0,
          top: cy0,
          width: cw,
          height: ch,
          borderRadius: 10,
          background: 'rgb(128,177,184)',
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          boxShadow: '0 0 22px 10px rgba(131,180,187,0.95)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: Math.min(ch * 0.22, cw * 0.078), lineHeight: 1.15, color: '#effffd', textAlign: 'center', whiteSpace: 'nowrap', textShadow: '0 0 12px rgba(220,255,255,0.9)'}}>
          Cari Tokoh Murid
          <br />
          tahun ini, segera.
        </div>
      </div>
    </AbsoluteFill>
  );
};


// ------------------------------------------------------------------ HOLOGRAM SWIPE (bilik gerakan)
// Panel data hologram yang mengikut tangan sebenar (dijejak per bingkai: scripts/jejak_tangan.py -> tangan.json).
// Setiap sapuan jari menyeret karusel fail calon; kad paling dekat dengan hujung jari dipilih & dianalisis.
const TG = TANGAN as unknown as Record<string, number[][]>;
const HC = '#8ff6ff';
const KAD_CALON = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const HoloSwipe: React.FC<{klip: string; from: number}> = ({klip, from}) => {
  const fr = useCurrentFrame();
  const d = TG[klip];
  const i0 = Math.round(from * FPS);
  const at = (i: number) => d[Math.max(0, Math.min(d.length - 1, i0 + i))];
  const udara = klip === 'teachers_invisible_b';
  // kehadiran tangan (dilicinkan) -> hologram 'hidup'
  let pres = 0;
  for (let k = -5; k <= 5; k++) pres += at(fr + k)[4];
  pres = Math.min(1, pres / 8);
  let mula = -1;
  for (let k = 0; k <= fr; k++) if (at(k)[4]) { mula = k; break; }
  if (mula < 0) return null;
  const boot = ci(fr, mula - 2, mula + 10, 0, 1, easeOut);
  // seretan: jumlah gerakan hujung jari (hanya bila tangan kelihatan)
  let drag = 0;
  for (let k = mula + 1; k <= fr; k++) if (at(k)[4] && at(k - 1)[4]) drag += at(k)[2] - at(k - 1)[2];
  const [, , hx, hy] = at(fr);
  const vx = at(fr)[2] - at(fr - 3)[2];
  const laju = Math.min(1, Math.abs(vx) / 60);
  const SP = udara ? 300 : 340;
  const baseY = udara ? Math.min(420, hy - 230) : 150;
  const n = KAD_CALON.length;
  const kad = KAD_CALON.map((nm, k) => {
    const span = n * SP;
    const rel = (k - 3) * SP + drag * 1.15;
    const w = ((((rel + span / 2) % span) + span) % span) - span / 2; // balut karusel
    return {nm, k, x: 960 + w};
  });
  const pilih = kad.reduce((a, b) => (Math.abs(b.x - hx) < Math.abs(a.x - hx) ? b : a));
  const tapis = Math.max(6, Math.round(1204 - Math.abs(drag) * 1.6));
  const W_ = udara ? 230 : 260;
  const H_ = udara ? 300 : 320;
  return (
    <AbsoluteFill style={{opacity: boot, pointerEvents: 'none'}}>
      {/* pengepala */}
      <div style={{position: 'absolute', left: 70, top: 60, fontFamily: "'JetBrains Mono', monospace", color: HC, textShadow: `0 0 10px ${HC}`, background: 'rgba(0,22,32,0.8)', padding: '10px 18px', border: `1px solid ${HC}66`}}>
        <div style={{fontSize: 20, letterSpacing: 5}}>BILIK GERAKAN · PANGKALAN DATA MURID</div>
        <div style={{fontSize: 30, fontWeight: 700, letterSpacing: 3, marginTop: 4, color: '#fff'}}>
          MENAPIS: {tapis.toLocaleString('en-US')} <span style={{color: HC}}>CALON</span>
        </div>
      </div>
      {/* karusel fail calon, diseret oleh jari */}
      <div style={{position: 'absolute', inset: 0, perspective: 1400}}>
        {kad.map(({nm, k, x}) => {
          const dipilih = pilih.k === k && pres > 0.5;
          const jauh = Math.min(1, Math.abs(x - 960) / 1100);
          const ry = (x - 960) / 1920 * (udara ? -40 : -25);
          const sc = (dipilih ? 1.12 : 1) * (1 - 0.15 * jauh);
          const pct = Math.round(40 + 50 * Math.abs(Math.sin(k * 1.7 + drag / 300)));
          return (
            <div
              key={k}
              style={{
                position: 'absolute',
                left: x - W_ / 2,
                top: baseY + 40 * jauh * (udara ? 1 : 0.5),
                width: W_,
                height: H_,
                transform: `rotateY(${ry}deg) scale(${sc})`,
                background: `linear-gradient(180deg, rgba(10,60,80,${dipilih ? 0.82 : 0.62}), rgba(0,24,36,${dipilih ? 0.85 : 0.6}))`,
                border: `2px solid ${dipilih ? '#ffd36b' : HC}`,
                boxShadow: `0 0 ${dipilih ? 36 : 18}px ${dipilih ? 'rgba(255,200,90,0.7)' : 'rgba(120,240,255,0.55)'}, inset 0 0 24px rgba(120,240,255,0.25)`,
                opacity: (1 - 0.6 * jauh) * (0.55 + 0.45 * pres),
                fontFamily: "'JetBrains Mono', monospace",
                color: HC,
                padding: 16,
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <div style={{fontSize: udara ? 13 : 16, letterSpacing: udara ? 2 : 3, whiteSpace: 'nowrap'}}>FAIL CALON {nm}-{String(k + 11).padStart(3, '0')}</div>
              {/* siluet neutral (tiada jantina) */}
              <svg width={W_ - 32} height={H_ * 0.42} viewBox="0 0 100 70" style={{marginTop: 8}}>
                <rect x={0} y={0} width={100} height={70} fill="rgba(143,246,255,0.08)" stroke={`${HC}55`} />
                <circle cx={50} cy={27} r={13} fill={`${HC}55`} />
                <rect x={26} y={44} width={48} height={26} rx={12} fill={`${HC}44`} />
                <text x={50} y={33} textAnchor="middle" fontSize={14} fill="#fff" fontFamily="monospace">?</text>
              </svg>
              {['AKADEMIK', 'SUKAN', 'KEPIMPINAN'].map((lbl, j) => {
                const w = 0.3 + 0.7 * Math.abs(Math.sin(k * 2.3 + j * 1.9 + fr / 40));
                return (
                  <div key={j} style={{marginTop: 7}}>
                    <div style={{fontSize: 12, letterSpacing: 2, opacity: 0.85}}>{lbl}</div>
                    <div style={{height: 6, background: 'rgba(143,246,255,0.15)', marginTop: 3}}>
                      <div style={{height: 6, width: `${w * 100}%`, background: dipilih ? '#ffd36b' : HC, boxShadow: `0 0 8px ${dipilih ? '#ffd36b' : HC}`}} />
                    </div>
                  </div>
                );
              })}
              <div style={{fontSize: 20, fontWeight: 700, marginTop: 10, color: dipilih ? '#ffd36b' : '#fff'}}>{dipilih ? 'MENGANALISIS…' : `PADANAN ${pct}%`}</div>
              {dipilih ? <div style={{position: 'absolute', left: 0, right: 0, top: `${(fr * 4) % 100}%`, height: 3, background: '#ffd36b', boxShadow: '0 0 12px #ffd36b'}} /> : null}
            </div>
          );
        })}
      </div>
      {/* pautan cahaya dari hujung jari ke kad dipilih + riak sentuhan */}
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity: pres}}>
        <defs>
          <filter id="g"><feGaussianBlur stdDeviation={4} /></filter>
        </defs>
        <line x1={hx} y1={hy} x2={pilih.x} y2={baseY + H_} stroke="#ffd36b" strokeWidth={3} strokeDasharray="10 8" strokeDashoffset={-fr * 3} opacity={0.85} />
        {[0, 1, 2].map((r) => {
          const ph = ((fr + r * 7) % 21) / 21;
          return <ellipse key={r} cx={hx} cy={hy} rx={20 + 110 * ph} ry={(20 + 110 * ph) * (udara ? 1 : 0.3)} fill="none" stroke={HC} strokeWidth={3} opacity={(1 - ph) * (0.4 + 0.6 * laju)} />;
        })}
        <circle cx={hx} cy={hy} r={14} fill={HC} filter="url(#g)" opacity={0.9} />
        <circle cx={hx} cy={hy} r={5} fill="#fff" />
        {/* jejak sapuan */}
        {Array.from({length: 10}, (_, k) => {
          const a = at(fr - k * 2);
          return a[4] ? <circle key={'j' + k} cx={a[2]} cy={a[3]} r={10 - k * 0.8} fill={HC} opacity={(0.5 - k * 0.05) * laju} filter="url(#g)" /> : null;
        })}
      </svg>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ PROLOG
const Prolog: React.FC = () => {
  const fr = useCurrentFrame();
  const globeIn = ci(fr, f(22.6), f(24.0));
  const globeOut = 1 - ci(fr, f(43.6), f(45.0));
  const rot = lerpRot(fr, [f(22.5), f(26.0), f(28.0), f(33.0), f(45)], [[60, 10], [103.4, 4.8], [100, 12], [62, 28], [55, 30]]);
  const cities: City[] = BANDAR.map((b, i) => ({...b, at: f(27.6 + i * 0.55)}));
  const dim = ci(fr, f(37.2), f(38.6));
  const words: Array<[string, number]> = [['MIMPI', 38.78], ['TIADA', 39.44], ['SEMPADAN', 40.28]];
  const empat = ci(fr, f(29.6), f(29.9)) * (1 - ci(fr, f(32.0), f(32.6)));
  const zk = ci(fr, f(29.0), f(29.9), 0, 1, easeOut) * (1 - ci(fr, f(32.2), f(33.4), 0, 1, easeOut));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence from={0} durationInFrames={f(11.4)}>
        <Klip name="video/intro_dron.mp4" from={0} len={11.4} rate={0.5} zoom={0.06} />
      </Sequence>
      <Sequence from={f(11.4)} durationInFrames={f(5.2)}>
        <Klip name="video/bayang_koridor.mp4" from={2.2} len={5.2} rate={0.5} />
      </Sequence>
      <Sequence from={f(16.6)} durationInFrames={f(5.6)}>
        <Klip name="video/sekolah_senja.mp4" from={1.0} len={5.6} rate={0.5} />
      </Sequence>
      {/* fade masuk/keluar & suasana muram */}
      <AbsoluteFill style={{background: '#000', opacity: Math.max(1 - ci(fr, 0, f(1.6)), ci(fr, f(21.4), f(22.4)))}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.55))', opacity: fr < f(22.4) ? 1 : 0}} />
      {fr >= f(22.4) ? (
        <AbsoluteFill style={{opacity: globeIn * globeOut}}>
          {/* zum keluar semasa "4 NEGARA": glob mengecil ke atas, teks 3D di bawah (tidak menutup label bandar) */}
          <Globe cx={960} cy={interpolate(zk, [0, 1], [560, 360])} r={interpolate(zk, [0, 1], [430, 255])} rot={rot} cities={cities} dungunAt={f(25.8)} opacity={1 - dim * 0.65} />
        </AbsoluteFill>
      ) : null}
      {/* "4 NEGARA" */}
      {empat > 0 ? (
        <AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 690, opacity: 1 - ci(fr, f(32.0), f(32.6))}}>
          <Gold3D text="4 NEGARA" size={150} p={ci(fr, f(29.45), f(30.25))} shine={ci(fr, f(30.3), f(31.3))} yaw={interpolate(fr, [f(29.6), f(32.6)], [-6, 6])} />
        </AbsoluteFill>
      ) : null}
      {/* MIMPI TIADA SEMPADAN */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 46}}>
        {words.map(([w, t], i) => {
          const p = ci(fr, f(t), f(t) + 8, 0, 1, easeOut) * globeOut;
          return (
            <div key={i} style={{opacity: p, transform: `scale(${1.25 - 0.25 * p})`, filter: `blur(${(1 - p) * 8}px)`}}>
              <Gold size={128} spacing={8}>{w}</Gold>
            </div>
          );
        })}
      </AbsoluteFill>
      <Vignette strength={0.7} />
      {VO.map(([t, file, text], i) => (
        <Sequence key={i} from={f(t)} durationInFrames={f(VO_LEN[file] + 0.4)}>
          {i < 6 ? <Sub text={text} len={VO_LEN[file] + 0.4} /> : null}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ KAD TAJUK
const KadTajuk: React.FC = () => {
  const fr = useCurrentFrame();
  const a = ci(fr, 4, 16, 0, 1, easeOut);
  const b = ci(fr, 12, 26, 0, 1, easeOut);
  const c = ci(fr, 26, 40, 0, 1, easeOut);
  const shine = ci(fr, 30, 70);
  const out = 1 - ci(fr, f(5.1) - 10, f(5.1));
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, #1c1a26 0%, #030305 70%)', justifyContent: 'center', alignItems: 'center', opacity: out}}>
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 26, color: '#d9d2c2', opacity: a, marginBottom: 18}}>OPERASI</div>
      <div style={{opacity: b, transform: `scale(${1.3 - 0.3 * b})`}}>
        <Gold size={140} spacing={10} shine={shine}>TOKOH MURID</Gold>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 24, marginTop: 14, opacity: b}}>
        <div style={{width: 150 * b, height: 2, background: GOLD_GRAD}} />
        <Gold size={52} spacing={14} weight={700}>2026</Gold>
        <div style={{width: 150 * b, height: 2, background: GOLD_GRAD}} />
      </div>
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: 8, color: '#cfc6b3', marginTop: 34, opacity: c}}>HARI ANUGERAH KECEMERLANGAN · SK SULTAN OMAR</div>
      <Vignette />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ "?" denyut pada visor + akhir bahagian 1
const AkhirBahagian: React.FC = () => {
  const fr = useCurrentFrame();
  const len = f(AKHIR - (SHOTS[SHOTS.length - 1][0] + SHOTS[SHOTS.length - 1][3]));
  // gambar terawal muncul seolah-olah keluar dari gambar di tangan (match cut)
  const p = ci(fr, 0, 14, 0, 1, Easing.out(Easing.cubic));
  const out = 1 - ci(fr, len - 20, len);
  return (
    <AbsoluteFill style={{background: '#000', opacity: out}}>
      <Img src={staticFile('v8/img/awal.jpg')} style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, objectFit: 'cover', filter: 'blur(40px) brightness(0.45)', transform: 'scale(1.2)'}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{background: '#f6f1e6', padding: '22px 22px 70px', boxShadow: '0 30px 80px rgba(0,0,0,0.7)', transform: `scale(${1.5 - 0.5 * p + 0.04 * (fr / len)}) rotate(${-3 * (1 - p) + 1.5}deg)`}}>
          <Img src={staticFile('v8/img/awal.jpg')} style={{height: 820, display: 'block', filter: `sepia(${0.25 + 0.3 * (1 - p)}) contrast(1.05)`}} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#fff8e8', opacity: 1 - ci(fr, 0, 10)}} />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ bunyi
type Sfx = [number, string, number];
const SFX: Sfx[] = [
  [44.6, 'sfx/sedutan', 0.5],
  [45.0, 'sfx/impact_lembut', 0.8],
  [TAJUK, 'sfx/braam', 0.9],
  [TAJUK, 'sfx/impact_lembut', 0.7],
  [TAJUK - 1.6, 'sfx/sedutan', 0.5],
  [SOAL, 'sfx/taiko', 0.8],
  [SOAL, 'sfx/sub_drop', 0.6],
  [74.43, 'sfx/hum', 0.35],
  [68.35, 'sfx/warp', 0.35],
  [72.6, 'sfx/whoosh_panjang', 0.4],
  [29.68 + 0, 'sfx/impact_lembut', 0.5],
  [38.78, 'sfx/taiko', 0.55],
  [39.44, 'sfx/taiko', 0.55],
  [40.28, 'sfx/braam', 0.6],
  [159.77, 'sfx/whoosh_panjang', 0.4],
];
// whoosh pada setiap potongan
SHOTS.forEach(([t]) => {
  if (t > 46) SFX.push([t - 0.1, 'sfx/whoosh_pendek', 0.3]);
});

export const TrailerBahagian1: React.FC = () => {
  const [h] = useState(() => delayRender('fon'));
  useEffect(() => {
    Promise.all(['900 40px Cinzel', '700 40px Cinzel', '500 40px Montserrat', '600 40px Montserrat', '700 40px Montserrat', '400 40px "JetBrains Mono"'].map((x) => document.fonts.load(x))).then(() =>
      continueRender(h),
    );
  }, [h]);
  const vol = (pts: number[], vals: number[]) => (fr: number) => interpolate(fr, pts.map(f), vals, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence from={f(PRO)} durationInFrames={f(PANG)}>
        <Prolog />
      </Sequence>
      {SHOTS.map(([t, name, from, len, , rate], i) => (
        <Sequence key={i} from={f(t)} durationInFrames={f(len)}>
          <Klip name={`v8/flow/${name}.mp4`} from={from} len={len} rate={rate ?? 1} music={cwAt(t)} />
          {name === 'woman_reading_hologram' ? <HologramMelayu /> : null}
          {name === 'teachers_invisible_a' || name === 'teachers_invisible_b' ? <HoloSwipe klip={name} from={from} /> : null}
          <Vignette strength={0.45} />
        </Sequence>
      ))}
      <Sequence from={f(TAJUK)} durationInFrames={f(5.1)}>
        <KadTajuk />
      </Sequence>
      <Sequence from={f(159.77)} durationInFrames={f(AKHIR - 159.77)}>
        <AkhirBahagian />
      </Sequence>
      {/* sari kata dialog */}
      {DIALOG.map(([t, file, text], i) => (
        <Sequence key={'d' + i} from={f(t)} durationInFrames={f(DIALOG_LEN[file] + 0.4)}>
          <Sub text={text} len={DIALOG_LEN[file] + 0.4} />
        </Sequence>
      ))}
      {SUB_ASAL.map(([a, b, text], i) => (
        <Sequence key={'s' + i} from={f(a)} durationInFrames={f(b - a)}>
          <Sub text={text} len={b - a} />
        </Sequence>
      ))}

      {/* ---------------- muzik ---------------- */}
      {/* The Last Strike (intro senyap -> binaan) di bawah VO prolog */}
      <Sequence from={0} durationInFrames={f(PANG + 0.5)}>
        <Audio src={staticFile('v8/muzik/last_strike.mp3')} volume={vol([0, 1.5, 28, 32, 43.5, 45.5], [0, 0.9, 0.9, 0.75, 0.75, 0])} />
      </Sequence>
      {/* The Clockwork Collapse bahagian 1 (0:00-1:00): pangkalan, GB, kad tajuk, hologram */}
      <Sequence from={f(PANG)} durationInFrames={f(CW1_END - PANG)}>
        <Audio src={staticFile('v8/muzik/clockwork_collapse.mp3')} volume={vol([0, CW1_END - PANG - 2.5, CW1_END - PANG], [0.85, 0.85, 0])} />
      </Sequence>
      {/* The Clockwork Collapse hentakan besar (1:44.5) TEPAT pada mesyuarat VR; senyap sendiri pada "?" visor */}
      <Sequence from={f(MESY)} durationInFrames={f(KOTAK + 1 - MESY)}>
        <Audio src={staticFile('v8/muzik/clockwork_collapse.mp3')} trimBefore={f(CW_HIT)} volume={vol([0, KOTAK - MESY - 1, KOTAK - MESY + 1], [0.85, 0.85, 0])} />
      </Sequence>
      {/* kotak kenangan: The Last Strike (bahagian penuh) */}
      <Sequence from={f(KOTAK)} durationInFrames={f(AKHIR - KOTAK)}>
        <Audio src={staticFile('v8/muzik/last_strike.mp3')} trimBefore={f(LS_KOTAK)} volume={vol([0, 1.5, AKHIR - KOTAK - 2, AKHIR - KOTAK], [0, 0.85, 0.85, 0])} />
      </Sequence>
      {/* VO & dialog */}
      {VO.map(([t, file], i) => (
        <Sequence key={'vo' + i} from={f(t)}>
          <Audio src={staticFile(`v8/vo/${file}.wav`)} volume={1} />
        </Sequence>
      ))}
      {DIALOG.map(([t, file], i) => (
        <Sequence key={'gb' + i} from={f(t)}>
          <Audio src={staticFile(`v8/vo/${file}.wav`)} volume={1} />
        </Sequence>
      ))}
      {/* bunyi asal klip */}
      {SHOTS.map(([t, name, from, len, v], i) =>
        v > 0 ? (
          <Sequence key={'a' + i} from={f(t)} durationInFrames={f(len)}>
            <Audio src={staticFile(`v8/aud/${name}.wav`)} trimBefore={f(from)} volume={(fr) => v * 0.6 * ci(fr, 0, 4) * (1 - ci(fr, f(len) - 6, f(len)))} />
          </Sequence>
        ) : null,
      )}
      {SFX.map(([t, file, v], i) => (
        <Sequence key={'x' + i} from={f(t)}>
          <Audio src={staticFile(`${file}.wav`)} volume={v} />
        </Sequence>
      ))}
      <FilmLook />
    </AbsoluteFill>
  );
};

export const BAHAGIAN1_LEN = f(AKHIR);
