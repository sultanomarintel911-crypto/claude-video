// Trailer Tokoh Murid 2026 (v8) - Bahagian 1: Prolog -> Pangkalan -> Arahan -> Mesyuarat VR -> Kotak kenangan
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/cinzel/700.css';
import '@fontsource/cinzel/900.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/jetbrains-mono/400.css';
import {ci, easeOut, Gold, GOLD_GRAD, SANS, SERIF, Vignette} from '../components';
import {BANDAR, City, Globe, lerpRot} from './Globe';

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

// ------------------------------------------------------------------ garis masa (saat)
const PRO = 0; // prolog
const PANG = 45.0; // pangkalan (muzik Midnight Breach bermula)
// [mula, nama klip, mula dalam klip, tempoh, kelantangan audio asal (0 = senyap)]
type Shot = [number, string, number, number, number];
const SHOTS: Shot[] = [
  [45.0, 'drones_rise_roof', 0, 7.85, 0.9],
  [52.85, 'drones_taking_off', 0, 7.65, 0.8],
  [60.5, 'drone_wall_opening', 0, 7.85, 0.8],
  [68.35, 'to_the_basement', 0, 7.85, 0], // suara Inggeris dibuang -> GB_01
  [76.2, 'lift_opens_basement', 0, 7.85, 0.7],
  [84.05, 'man_walking_office', 0, 7.85, 0], // suara Inggeris dibuang -> GB_02
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
  [68.95, 'GB_01', 'Bawa saya ke pangkalan utama.'],
  [84.75, 'GB_02', 'Adakan mesyuarat segera. Cari Tokoh Murid tahun ini.'],
];
const DIALOG_LEN: Record<string, number> = {GB_01: 3.0, GB_02: 4.86};
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

const Klip: React.FC<{name: string; from: number; len: number; rate?: number; zoom?: number}> = ({name, from, len, rate = 1, zoom = 0.04}) => {
  const fr = useCurrentFrame();
  const z = 1 + zoom * (fr / f(len));
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
  const cx0 = x0 + w * 0.09;
  const cy0 = y0 + h * 0.2;
  const cw = w * 0.82;
  const ch = h * 0.58;
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
          background: 'rgba(131,180,187,0.97)',
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
          <Globe cx={960} cy={560} r={430} rot={rot} cities={cities} dungunAt={f(25.8)} opacity={1 - dim * 0.65} />
        </AbsoluteFill>
      ) : null}
      {/* "4 NEGARA" */}
      {empat > 0 ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'flex-end', paddingRight: 150, opacity: empat}}>
          <div style={{textAlign: 'right'}}>
            <Gold size={180}>4</Gold>
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 12, color: '#fff'}}>NEGARA</div>
          </div>
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
  [68.35, 'sfx/hum', 0.35],
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
      {SHOTS.map(([t, name, from, len], i) => (
        <Sequence key={i} from={f(t)} durationInFrames={f(len)}>
          <Klip name={`v8/flow/${name}.mp4`} from={from} len={len} />
          {name === 'woman_reading_hologram' ? <HologramMelayu /> : null}
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
      <Sequence from={0} durationInFrames={f(PANG + 0.5)}>
        <Audio src={staticFile('v8/muzik/videodrome.mp3')} volume={vol([0, 2, 22, 24, 41, 43.5, 45.5], [0, 0.32, 0.32, 0.4, 0.5, 0.5, 0])} />
      </Sequence>
      <Sequence from={f(PANG)} durationInFrames={f(KOTAK + 1.5 - PANG)}>
        <Audio src={staticFile('v8/muzik/midnight_breach.mp3')} volume={vol([0, 1, KOTAK - PANG - 1.5, KOTAK - PANG + 1.5], [0.75, 0.75, 0.75, 0])} />
      </Sequence>
      <Sequence from={f(KOTAK)} durationInFrames={f(AKHIR - KOTAK)}>
        <Audio src={staticFile('v8/muzik/princesses_heart.mp3')} volume={vol([0, 2, AKHIR - KOTAK - 2, AKHIR - KOTAK], [0, 0.7, 0.7, 0])} />
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
    </AbsoluteFill>
  );
};

export const BAHAGIAN1_LEN = f(AKHIR);
