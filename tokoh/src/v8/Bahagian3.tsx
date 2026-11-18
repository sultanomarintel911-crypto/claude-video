// Trailer Tokoh Murid 2026 (v8) - Bahagian 3: selepas pendedahan
// FILE DECRYPTED -> rekod sekolah (panel hologram 3D) -> dulu & kini -> sukan (warp) -> lari berpagar (paralaks)
// -> skuasy kebangsaan -> misi antarabangsa (glob + uplink satelit) -> rumusan -> keluarga (VO) -> penutup
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Easing, Img, interpolate, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/cinzel/700.css';
import '@fontsource/cinzel/900.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import {ci, easeOut, Embers, FilmLook, Gold, Gold3D, GOLD, GOLD_GRAD, Rays, SANS, SERIF, Vignette} from '../components';
import {CUT_GRAD} from '../data';
import {Brackets, GlitchBands, HexGrid, ProgressBar, Scanlines, Scramble, TypedLine} from '../scifi';
import {BANDAR, City, DUNGUN, Globe, lerpRot} from './Globe';
import {beatAfter, pulseAt, snapBeat} from './beat';

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);
const MONO = "'JetBrains Mono', monospace";
const CYAN = '#7ff3ff';
const GREEN = '#3dff9a';
const img = (k: string) => staticFile(`v8/b3/${k}.jpg`);

// ------------------------------------------------------------------ garis masa (saat)
const LS0 = 96.68 + 13.5; // Beneath the Sovereign Sky bersambung dari hujung Bahagian 2 (DROP + 13.5)
const snapLS = (t: number) => snapBeat('sovereign', t + LS0) - LS0;
const AKSES = 0;
// REDACTION REMOVED: gambar yang dikaburkan sebelum pendedahan dibuka semula, setiap satu masuk tepat pada rentak
const BUKA = 5.0;
const BUKA_FOTO: Array<[string, string, number]> = [
  ['c01', 'BAB II · ALAM PERSEKOLAHAN', 4], ['c02', 'BAB II · ALAM PERSEKOLAHAN', 3], ['c03', 'BAB II · ALAM PERSEKOLAHAN', 2],
  ['c04', 'BAB II · ALAM PERSEKOLAHAN', 2], ['c06', 'BAB II · ALAM PERSEKOLAHAN', 2], ['d01', 'BAB III · MULA DIKENALI', 2],
  ['d02', 'BAB III · MULA DIKENALI', 2], ['d03', 'BAB III · MULA DIKENALI', 2], ['e01', 'BAB IV · HARI ANUGERAH', 6],
];
const BUKA_T: number[] = [];
{
  let t = beatAfter('sovereign', BUKA + LS0, 3) - LS0; // 3 rentak: tajuk REDACTION REMOVED
  for (const [, , n] of BUKA_FOTO) {
    BUKA_T.push(t);
    t = beatAfter('sovereign', t + LS0, n) - LS0;
  }
  BUKA_T.push(t);
}
const SEKOLAH = BUKA_T[BUKA_T.length - 1];
const PANEL = ['s01', 's02', 's03', 's04', 's05', 's06', 's07'];
const PANEL_TAG = ['SUBJECT IDENTIFIED', 'PENOLONG KETUA MURID', 'PENGERUSI · TV PSS', 'KETUA RUMAH TEMENGGUNG', 'AJK TUNAS KADET REMAJA', 'NILAM · 4 BINTANG', 'KEPIMPINAN · KERJASAMA'];
const PANEL_T = PANEL.map((_, i) => snapLS(SEKOLAH + i * 2.0));
const DULU = snapLS(SEKOLAH + PANEL.length * 2.0);
const SUKAN = snapLS(DULU + 5.0);
const WARP = ['k01', 'k02', 'k03', 'k04', 'k05', 'k06', 'k07', 'k08', 'k09'];
const WARP_TAG = ['SUKAN TAHUNAN', 'PODIUM', 'PINGAT · SEKOLAH', 'PINGAT · DAERAH', 'MERENTAS DESA', 'PINGAT', 'BOLA BALING · KETIGA ZON SURA', 'BOLA BALING · KETIGA MSSD DUNGUN', 'BERKUDA'];
const WARP_T = WARP.map((_, i) => snapLS(SUKAN + i * 0.93));
const LARI = snapLS(SUKAN + WARP.length * 0.93);
const SKUASY = snapLS(LARI + 5.0);
const INTL = 45.95 + (SEKOLAH - 5.0); // -> hentakan Clockwork (misi antarabangsa)
const SQ = ['q01', 'q02', 'q03', 'q04', 'q05', 'q06', 'q07', 'q08', 'q10'];
const SQ_T = SQ.map((_, i) => SKUASY + ((INTL - SKUASY) * i) / SQ.length);
const SQ_STAMP: Record<number, [string, string]> = {2: ['JOHAN', 'MSSD DUNGUN'], 5: ['JOHAN', 'MSST TERENGGANU'], 8: ['MSSM 2026', 'PERINGKAT KEBANGSAAN']};
// misi antarabangsa (relatif INTL)
type Misi = {city: number; t: number; len: number; foto: string[]; tajuk: string; sub: string};
const MISI: Misi[] = [
  {city: 0, t: 1.5, len: 3.5, foto: ['i_sg'], tajuk: 'SINGAPURA', sub: 'ONCOCARE SINGAPORE JUNIOR SQUASH OPEN · DEC 2024'},
  {city: 1, t: 5.0, len: 10.5, foto: ['i_bhm0', 'i_bhm7', 'i_bhm1', 'i_bhm6', 'i_bhm3', 'i_bhm4'], tajuk: 'BIRMINGHAM', sub: 'BRITISH JUNIOR OPEN SQUASH · JAN 2025'},
  {city: 2, t: 15.5, len: 3.0, foto: ['i_ist'], tajuk: 'ISTANBUL', sub: 'TÜRKİYE'},
  {city: 3, t: 18.5, len: 9.0, foto: ['i_sh1', 'i_sh2'], tajuk: 'SHANGHAI', sub: 'CHINA · MISI 2025 & 2026'},
];
const RUMUS = INTL + 27.5;
const KELUARGA = RUMUS + 11.5;
// gambar keluarga ikut baris VO (masa mula relatif KELUARGA): doa, ibu, ayah, sahabat, milik semua, mimpi
const FAM: Array<[string, number]> = [
  ['f01', 0], ['f02', 8.0], ['f03', 12.4], ['f04', 16.6], ['f05', 20.8], ['f06', 23.5],
  ['f07', 26.1], ['f08', 29.0], ['f09', 32.0], ['f10', 37.0],
];
const FAM_END = 41.4;
const PENUTUP = KELUARGA + FAM_END;
const AKHIR = PENUTUP + 15.0;
// VO keluarga (VO_KELUARGA, 37 s) bermula VO_AT saat selepas KELUARGA; masa sari kata dari transkripsi
const VO_AT = 1.5;
const VO: Array<[number, number, string]> = [
  [0.0, 6.4, 'Di sebalik setiap kemenangan... ada doa yang tak pernah putus.'],
  [6.84, 8.1, 'Ada seorang ibu... yang setia menunggu di tepi gelanggang, di lapangan terbang, dan di setiap perjalanan.'],
  [15.42, 3.8, 'Ada seorang ayah... yang tak pernah berhenti percaya.'],
  [19.5, 4.9, 'Ada sahabat... yang ketawa bersama, dan bangkit bersama.'],
  [24.78, 5.7, 'Thoriq... kejayaan ini bukan milikmu seorang. Ia milik semua yang menyayangimu.'],
  [30.68, 5.3, 'Terima kasih... kerana membuktikan bahawa mimpi... memang tiada sempadan.'],
];

// ------------------------------------------------------------------ A2. REDACTION REMOVED (kabur -> jelas, ikut rentak)
const Nyahkabur: React.FC = () => {
  const fr = useCurrentFrame();
  const t = BUKA + fr / FPS;
  const i = BUKA_T.findIndex((x, j) => t >= x && t < BUKA_T[j + 1]);
  const p = pulseAt('sovereign', t + LS0, 0.18, 0.6);
  if (i < 0) {
    // tajuk
    const a = ci(fr, 0, 8, 0, 1, easeOut);
    return (
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, #071216 0%, #010203 75%)', justifyContent: 'center', alignItems: 'center'}}>
        <HexGrid opacity={0.1} />
        <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 10, color: CYAN, opacity: a}}>DECLASSIFYING ARCHIVE</div>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 84, letterSpacing: 8, color: '#fff', marginTop: 18, opacity: a, transform: `scale(${1.08 - 0.08 * a + 0.03 * p})`}}>
          <Scramble text="REDACTION REMOVED" reveal={ci(fr, 2, 18)} />
        </div>
        <div style={{width: 700 * a, height: 2, background: GREEN, marginTop: 22, boxShadow: `0 0 18px ${GREEN}`}} />
        <Scanlines opacity={0.12} />
      </AbsoluteFill>
    );
  }
  const [k, tag] = BUKA_FOTO[i];
  const lf = fr - f(BUKA_T[i] - BUKA);
  const L = f(BUKA_T[i + 1] - BUKA_T[i]);
  const sapu = Math.min(10, Math.max(5, Math.round(L * 0.45))); // imbasan buka kabur
  const x = ci(lf, 1, sapu, 0, 1, easeOut);
  const tumbuk = 0.06 * Math.exp(-lf / 4);
  const sk = 1.03 + 0.04 * (lf / L) + 0.02 * p + tumbuk;
  const st: React.CSSProperties = {position: 'absolute', width: 1920, height: 1080, left: 0, top: 0, transform: `scale(${sk})`};
  const cop = ci(lf, sapu, sapu + 5, 0, 1, Easing.out(Easing.back(2)));
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Img src={staticFile(`v8/hidup/${k}.jpg`)} style={{...st, filter: 'saturate(0.6) brightness(0.8)'}} />
      <Img src={staticFile(`v8/hidup/u_${k}.jpg`)} style={{...st, clipPath: `inset(0 ${(1 - x) * 100}% 0 0)`}} />
      {x > 0 && x < 1 ? <div style={{position: 'absolute', left: x * 1920 - 3, top: 0, width: 6, height: 1080, background: CYAN, boxShadow: `0 0 30px 8px ${CYAN}`}} /> : null}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 18%, transparent 78%, rgba(0,0,0,0.6) 100%)'}} />
      <div style={{position: 'absolute', left: 70, top: 50, fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: CYAN, background: 'rgba(0,0,0,0.55)', padding: '6px 14px', textShadow: '0 0 10px rgba(127,243,255,0.6)'}}>
        ARCHIVE {String(i + 1).padStart(2, '0')}/{String(BUKA_FOTO.length).padStart(2, '0')} · {tag}
      </div>
      <div style={{position: 'absolute', right: 70, bottom: 60, fontFamily: MONO, fontWeight: 700, fontSize: 34, letterSpacing: 6, color: GREEN, border: `2px solid ${GREEN}`, padding: '8px 18px', opacity: cop, transform: `scale(${1.4 - 0.4 * cop}) rotate(-4deg)`, textShadow: `0 0 12px ${GREEN}`}}>
        UNREDACTED ✓
      </div>
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ A. ACCESS GRANTED
const Akses: React.FC = () => {
  const fr = useCurrentFrame();
  const grant = ci(fr, 100, 108, 0, 1, Easing.out(Easing.back(1.8)));
  const out = ci(fr, 136, 150);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, #071216 0%, #010203 75%)'}}>
      <HexGrid opacity={0.12} />
      <div style={{position: 'absolute', left: 160, top: 210, opacity: 1 - grant * 0.75}}>
        <TypedLine text="> SECURE CHANNEL ESTABLISHED" start={2} size={30} />
        <TypedLine text="> FILE: TM-2026-001   //   CLASSIFIED · EYES ONLY" start={16} size={30} />
        <TypedLine text="> SUBJECT: THORIQ YUSUF BIN MOHAMMAD NOR BAKRI" start={32} size={30} color="#fff" />
        <TypedLine text="> BIOMETRIC SCAN .................. MATCH ✓" start={50} size={30} color={GREEN} />
        <TypedLine text="> CLEARANCE LEVEL 7 .............. VERIFIED ✓" start={64} size={30} color={GREEN} cursor={false} />
      </div>
      <ProgressBar x={160} y={640} w={1600} p={ci(fr, 70, 100)} label="DECRYPTING FILE" />
      {grant > 0 ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div
            style={{
              border: `4px solid ${GREEN}`,
              padding: '22px 60px',
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 110,
              letterSpacing: 18,
              color: GREEN,
              background: 'rgba(0,20,10,0.75)',
              textShadow: `0 0 24px ${GREEN}`,
              boxShadow: `0 0 50px rgba(61,255,154,0.45)`,
              transform: `scale(${2 - grant + out * 0.4})`,
              opacity: grant * (1 - out),
            }}
          >
            ACCESS GRANTED
          </div>
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{background: '#fff', opacity: ci(fr, 100, 101) * (1 - ci(fr, 101, 110)) * 0.7}} />
      <GlitchBands intensity={Math.max(1 - ci(fr, 0, 8), ci(fr, 96, 100) * (1 - ci(fr, 100, 104)))} seed="akses" />
      <Scanlines opacity={0.25} />
      <AbsoluteFill style={{background: '#000', opacity: out}} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ B. panel hologram 3D (rekod sekolah)
const HoloSekolah: React.FC = () => {
  const fr = useCurrentFrame();
  const t0 = f(SEKOLAH);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, #0b1a22 0%, #010203 80%)', overflow: 'hidden'}}>
      <HexGrid opacity={0.1} />
      <AbsoluteFill style={{perspective: 1400}}>
        <AbsoluteFill style={{transformStyle: 'preserve-3d'}}>
          {PANEL.map((k, i) => {
            const s = f(PANEL_T[i]) - t0;
            const e = (i < PANEL.length - 1 ? f(PANEL_T[i + 1]) : f(DULU)) - t0;
            if (fr < s - 24 || fr > e + 14) return null;
            const inn = Easing.out(Easing.cubic)(ci(fr, s - 24, s));
            const lew = Easing.in(Easing.cubic)(ci(fr, e - 2, e + 14));
            const side = i % 2 ? 1 : -1;
            const z = -2600 * (1 - inn) + 900 * lew;
            const x = side * 520 * (1 - inn) - side * 60 * ci(fr, s, e);
            const ry = side * -28 * (1 - inn) + side * 4 * ci(fr, s, e);
            const tag = ci(fr, s + 4, s + 18);
            return (
              <div
                key={k}
                style={{
                  position: 'absolute',
                  left: 960 - 640,
                  top: 470 - 360,
                  width: 1280,
                  height: 720,
                  transform: `translate3d(${x}px, 0, ${z}px) rotateY(${ry}deg)`,
                  opacity: Math.min(1, inn * 1.4) * (1 - lew),
                }}
              >
                <Img src={img(k)} style={{width: 1280, height: 720, objectFit: 'cover', border: `2px solid ${CYAN}`, boxShadow: `0 0 40px rgba(127,243,255,0.35)`}} />
                <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(127,243,255,0.08), transparent 30%, transparent 70%, rgba(0,10,15,0.5))'}} />
                <div style={{position: 'absolute', left: 0, top: -44, fontFamily: MONO, fontSize: 22, letterSpacing: 6, color: CYAN}}>
                  ◆ RECORD {String(i + 1).padStart(2, '0')} / {String(PANEL.length).padStart(2, '0')}
                </div>
                <div style={{position: 'absolute', left: 0, bottom: -86, opacity: tag, fontFamily: SANS, fontWeight: 700, fontSize: 46, letterSpacing: 6, color: GOLD, textShadow: '0 4px 18px rgba(0,0,0,0.9)'}}>
                  <Scramble text={PANEL_TAG[i]} reveal={tag} seed={'pt' + i} />
                </div>
              </div>
            );
          })}
        </AbsoluteFill>
      </AbsoluteFill>
      <Scanlines opacity={0.18} />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ C. dulu & kini
const DuluKini: React.FC<{len: number}> = ({len}) => {
  const fr = useCurrentFrame();
  const L = f(len);
  const wipe = Easing.inOut(Easing.cubic)(ci(fr, 30, 66));
  const out = ci(fr, L - 8, L);
  const H_ = 960;
  const w_ = (CUT_GRAD.w / CUT_GRAD.h) * H_;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Img src={img('s00')} style={{position: 'absolute', width: 1920, height: 1080, objectFit: 'cover', transform: `scale(${1.04 + 0.04 * (fr / L)})`, filter: `saturate(${1 - 0.6 * wipe}) brightness(${1 - 0.35 * wipe})`}} />
      {/* kini: menyapu dari kanan */}
      <AbsoluteFill style={{clipPath: `inset(0 0 0 ${100 - wipe * 50}%)`, background: 'radial-gradient(ellipse at 75% 45%, #3a2a10 0%, #0a0703 70%)'}}>
        <Rays cx={1440} cy={430} opacity={0.5} />
        <Img src={staticFile(CUT_GRAD.src)} style={{position: 'absolute', height: H_, width: w_, left: 1440 - w_ / 2, top: 1080 - H_ + 20}} />
      </AbsoluteFill>
      {wipe > 0 && wipe < 1 ? <div style={{position: 'absolute', top: 0, bottom: 0, left: 1920 - wipe * 960 - 2, width: 4, background: CYAN, boxShadow: `0 0 24px 8px ${CYAN}`}} /> : null}
      <div style={{position: 'absolute', left: 80, bottom: 90, opacity: ci(fr, 6, 16)}}>
        <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 8, color: '#d8d2c4'}}>THEN</div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, color: '#fff', marginTop: 6, textShadow: '0 4px 16px #000'}}>HARI ANUGERAH KECEMERLANGAN</div>
      </div>
      <div style={{position: 'absolute', right: 80, bottom: 90, textAlign: 'right', opacity: ci(fr, 60, 72)}}>
        <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 8, color: GOLD}}>NOW</div>
        <Gold size={64} spacing={4}>TOKOH MURID 2026</Gold>
      </div>
      <AbsoluteFill style={{background: '#000', opacity: out}} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ D. sukan: potongan warp ikut rentak
const Warp: React.FC = () => {
  const fr = useCurrentFrame();
  const t = SUKAN + fr / FPS;
  let i = 0;
  while (i < WARP.length - 1 && t >= WARP_T[i + 1]) i++;
  const lf = fr - f(WARP_T[i] - SUKAN);
  const hit = 1 - ci(lf, 0, 8);
  const z = 1.0 + 0.22 * hit * hit + 0.03 * (lf / 28);
  const p = pulseAt('sovereign', t + LS0, 0.2, 0.8);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Img src={img(WARP[i])} style={{position: 'absolute', width: 1920, height: 1080, transform: `scale(${z + 0.02 * p})`, filter: `blur(${hit * 5}px) brightness(${1 + 0.3 * hit})`}} />
      {/* pemisahan RGB semasa hentakan */}
      {hit > 0.05 ? (
        <>
          <Img src={img(WARP[i])} style={{position: 'absolute', width: 1920, height: 1080, transform: `scale(${z}) translateX(${18 * hit}px)`, opacity: 0.45 * hit, mixBlendMode: 'screen', filter: 'sepia(1) saturate(6) hue-rotate(-50deg)'}} />
          <Img src={img(WARP[i])} style={{position: 'absolute', width: 1920, height: 1080, transform: `scale(${z}) translateX(${-18 * hit}px)`, opacity: 0.45 * hit, mixBlendMode: 'screen', filter: 'sepia(1) saturate(6) hue-rotate(160deg)'}} />
        </>
      ) : null}
      {/* garis kelajuan warp */}
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: hit}}>
        {Array.from({length: 46}).map((_, k) => {
          const a = random('wa' + k) * Math.PI * 2;
          const r0 = 260 + random('wr' + k) * 400;
          const r1 = r0 + 300 + 500 * hit;
          return <line key={k} x1={960 + Math.cos(a) * r0} y1={540 + Math.sin(a) * r0} x2={960 + Math.cos(a) * r1} y2={540 + Math.sin(a) * r1} stroke="rgba(220,250,255,0.75)" strokeWidth={2} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: 80, top: 70, fontFamily: MONO, fontSize: 22, letterSpacing: 6, color: CYAN, textShadow: '0 0 8px #000'}}>SPORTS RECORD ▸ {String(i + 1).padStart(2, '0')}</div>
      <div style={{position: 'absolute', left: 80, bottom: 80, fontFamily: SANS, fontWeight: 700, fontSize: 52, letterSpacing: 4, color: '#fff', textShadow: '0 4px 20px rgba(0,0,0,0.95)'}}>
        <Scramble text={WARP_TAG[i]} reveal={ci(lf, 2, 12)} seed={'wt' + i} />
      </div>
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ lari berpagar: gambar rata, zum perlahan
const Lari: React.FC<{len: number}> = ({len}) => {
  const fr = useCurrentFrame();
  const L = f(len);
  const u = fr / L;
  const st: React.CSSProperties = {position: 'absolute', width: 1920, height: 1080, left: 0, top: 0};
  const teks = ci(fr, 12, 30, 0, 1, easeOut);
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden', opacity: ci(fr, 0, 4) * (1 - ci(fr, L - 6, L))}}>
      <Img src={img('lari')} style={{...st, transform: `scale(${1.03 + 0.06 * u}) translateX(${20 * (u - 0.5)}px)`}} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,0.65) 0%, transparent 45%)'}} />
      <div style={{position: 'absolute', left: 90, top: 330, opacity: teks, transform: `translateX(${-40 * (1 - teks)}px)`}}>
        <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 10, color: CYAN}}>ATHLETICS</div>
        <Gold size={120} spacing={6}>OLAHRAGA</Gold>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: 10, color: '#fff', marginTop: 8}}>LARI BERPAGAR</div>
      </div>
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ E. skuasy kebangsaan + cop JOHAN
const Skuasy: React.FC = () => {
  const fr = useCurrentFrame();
  const t = SKUASY + fr / FPS;
  let i = 0;
  while (i < SQ.length - 1 && t >= SQ_T[i + 1]) i++;
  const lf = fr - f(SQ_T[i] - SKUASY);
  const p = pulseAt('sovereign', t + LS0, 0.2, 0.7);
  const stamp = SQ_STAMP[i];
  const sp = ci(lf, 3, 9, 0, 1, Easing.out(Easing.back(2.2)));
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Img src={img(SQ[i])} style={{position: 'absolute', width: 1920, height: 1080, transform: `scale(${1.04 + 0.05 * p + 0.04 * (1 - ci(lf, 0, 6))})`}} />
      <AbsoluteFill style={{background: '#fff', opacity: 0.35 * (1 - ci(lf, 0, 4))}} />
      <div style={{position: 'absolute', left: 80, top: 70, fontFamily: MONO, fontSize: 22, letterSpacing: 6, color: CYAN, textShadow: '0 0 8px #000'}}>SQUASH ▸ NATIONAL CIRCUIT</div>
      {stamp ? (
        <div style={{position: 'absolute', right: 110, bottom: 110, transform: `rotate(-7deg) scale(${2.4 - 1.4 * sp})`, opacity: sp, border: `6px solid ${GOLD}`, padding: '10px 34px', background: 'rgba(10,6,0,0.6)', textAlign: 'center'}}>
          <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 78, letterSpacing: 8, backgroundImage: GOLD_GRAD, WebkitBackgroundClip: 'text', color: 'transparent'}}>{stamp[0]}</div>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: 6, color: '#fff'}}>{stamp[1]}</div>
        </div>
      ) : null}
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ F. misi antarabangsa: glob + uplink satelit
const Antarabangsa: React.FC = () => {
  const fr = useCurrentFrame();
  const t = fr / FPS;
  const cities: City[] = MISI.map((m) => ({...BANDAR[m.city], at: f(m.t - 0.2)}));
  const keys = [0, f(1.0), ...MISI.flatMap((m) => [f(m.t), f(m.t + m.len - 0.4)])];
  const rots: Array<[number, number]> = [
    [80, 15],
    [DUNGUN.lon, DUNGUN.lat],
    ...MISI.flatMap((m) => {
      const c = BANDAR[m.city];
      const r: [number, number] = [c.lon * 0.6 + DUNGUN.lon * 0.4, c.lat * 0.6 + 6];
      return [r, r];
    }),
  ];
  const rot = lerpRot(fr, keys, rots);
  let mi = -1;
  MISI.forEach((m, k) => {
    if (t >= m.t) mi = k;
  });
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 50%, #101a28 0%, #020305 75%)', overflow: 'hidden'}}>
      <Globe cx={500} cy={560} r={interpolate(fr, [0, f(1.2)], [260, 380], {extrapolateRight: 'clamp'})} rot={rot} cities={cities} arcLen={18} dungunAt={f(0.4)} />
      <div style={{position: 'absolute', left: 80, top: 70, fontFamily: MONO, fontSize: 24, letterSpacing: 8, color: CYAN}}>
        GLOBAL OPERATIONS ▸ <span style={{color: GOLD}}>4 COUNTRIES · 5 MISSIONS</span>
      </div>
      {mi >= 0 ? <Uplink key={mi} m={MISI[mi]} lf={fr - f(MISI[mi].t)} /> : null}
      <Scanlines opacity={0.15} />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};

const Uplink: React.FC<{m: Misi; lf: number}> = ({m, lf}) => {
  const per = f(m.len) / m.foto.length;
  const j = Math.min(m.foto.length - 1, Math.floor(lf / per));
  const jf = lf - j * per;
  const scan = Easing.out(Easing.cubic)(ci(jf, 0, 10));
  const lbl = ci(lf, 4, 18);
  const X = 900;
  const Y = 190;
  const Wd = 940;
  const Hd = 529;
  return (
    <>
      <div style={{position: 'absolute', left: X, top: Y - 50, fontFamily: MONO, fontSize: 22, letterSpacing: 6, color: CYAN}}>
        SATELLITE UPLINK ▸ <Scramble text={m.tajuk} reveal={lbl} seed={m.tajuk} />
      </div>
      <div style={{position: 'absolute', left: X, top: Y, width: Wd, height: Hd, border: `2px solid ${CYAN}`, boxShadow: '0 0 40px rgba(127,243,255,0.3)', overflow: 'hidden', background: '#000'}}>
        <Img src={img(m.foto[j])} style={{width: Wd, height: Hd, objectFit: 'cover', clipPath: `inset(0 0 ${100 - scan * 100}% 0)`, transform: `scale(${1.02 + 0.04 * (jf / per)})`}} />
        {scan < 1 ? <div style={{position: 'absolute', left: 0, right: 0, top: scan * Hd - 2, height: 4, background: CYAN, boxShadow: `0 0 18px 6px ${CYAN}`}} /> : null}
        <GlitchBands intensity={(1 - ci(jf, 0, 6)) * 0.6} seed={m.tajuk + j} />
      </div>
      <Brackets rect={[X - 14, Y - 14, X + Wd + 14, Y + Hd + 14]} p={ci(lf, 0, 8)} />
      <div style={{position: 'absolute', left: X, top: Y + Hd + 34, opacity: lbl}}>
        <Gold size={78} spacing={6}>{m.tajuk}</Gold>
        <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 5, color: '#e9e2d0', marginTop: 6}}>{m.sub}</div>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ G. rumusan: pembilang + kad kebangsaan
const KAD = ['KANGAROO MATHS', 'MINECRAFT EDUCATION CHALLENGE', 'MY CYBER HERO', 'JOM BERUS GIGI · DOKTOR MUDA', 'KUIZ CABARAN MINDA', 'SKUASY MSSM 2026'];
const Rumusan: React.FC<{len: number}> = ({len}) => {
  const fr = useCurrentFrame();
  const L = f(len);
  const n = Math.round(18 * Easing.out(Easing.cubic)(ci(fr, 6, 46)));
  const stat: Array<[number, string]> = [
    [6, 'KEBANGSAAN'],
    [4, 'NEGERI'],
    [5, 'DAERAH'],
    [3, 'ZON'],
  ];
  const kad = ci(fr, 120, 126);
  const status = ci(fr, 236, 246, 0, 1, Easing.out(Easing.back(2)));
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, #0d1418 0%, #010203 75%)', opacity: 1 - ci(fr, L - 10, L)}}>
      <HexGrid opacity={0.1} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', opacity: 1 - kad * 0.7, transform: `translateY(${-60 * kad}px) scale(${1 - 0.3 * kad})`}}>
        <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 10, color: CYAN}}>TOTAL ENTRIES · 2026</div>
        <Gold size={230} spacing={4}>{String(n)}</Gold>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 44, letterSpacing: 16, color: '#fff'}}>PENYERTAAN</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', gap: 70, opacity: 1 - kad}}>
        {stat.map(([v, l], k) => {
          const p = ci(fr, 50 + k * 14, 60 + k * 14, 0, 1, easeOut);
          return (
            <div key={l} style={{textAlign: 'center', opacity: p, transform: `translateY(${30 * (1 - p)}px)`, width: 260, borderTop: `2px solid ${GOLD}`, paddingTop: 16}}>
              <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 96, color: GOLD}}>{v}</div>
              <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 6, color: '#ddd'}}>{l}</div>
            </div>
          );
        })}
      </div>
      {kad > 0 ? (
        <div style={{position: 'absolute', left: 160, right: 160, top: 360, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 28}}>
          {KAD.map((k, i) => {
            const p = ci(fr, 122 + i * 8, 134 + i * 8, 0, 1, easeOut);
            return (
              <div key={k} style={{opacity: p * (1 - status * 0.6), transform: `perspective(900px) rotateX(${(1 - p) * 70}deg) translateY(${(1 - p) * 60}px)`, border: `1.5px solid ${CYAN}`, background: 'rgba(127,243,255,0.06)', padding: '26px 24px', boxShadow: '0 0 24px rgba(127,243,255,0.15)'}}>
                <div style={{fontFamily: MONO, fontSize: 18, letterSpacing: 4, color: CYAN}}>NATIONAL · {String(i + 1).padStart(2, '0')}</div>
                <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, color: '#fff', marginTop: 10, lineHeight: 1.2}}>{k}</div>
              </div>
            );
          })}
        </div>
      ) : null}
      {status > 0 ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div style={{transform: `rotate(-6deg) scale(${2.2 - 1.2 * status})`, opacity: status, border: `6px solid ${GREEN}`, padding: '14px 46px', background: 'rgba(0,15,8,0.85)', fontFamily: MONO, fontWeight: 700, fontSize: 70, letterSpacing: 10, color: GREEN, textShadow: `0 0 20px ${GREEN}`}}>
            MISSION ACCOMPLISHED
          </div>
        </AbsoluteFill>
      ) : null}
      <Scanlines opacity={0.15} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ I. keluarga & kawan-kawan
const Keluarga: React.FC = () => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {FAM.map(([k, t0], i) => {
        const s = f(t0);
        const L = f((i + 1 < FAM.length ? FAM[i + 1][1] : FAM_END) - t0);
        if (fr < s - 30 || fr > s + L + 30) return null;
        const o = ci(fr, s - 15, s + 15) * (1 - ci(fr, s + L - 15, s + L + 15));
        const u = (fr - s + 15) / (L + 30);
        const dir = i % 2 ? 1 : -1;
        return (
          <Img
            key={k}
            src={img(k)}
            style={{position: 'absolute', width: 1920, height: 1080, opacity: i === 0 ? ci(fr, 0, 30) * (1 - ci(fr, s + L - 15, s + L + 15)) : o, transform: `scale(${1.04 + 0.07 * u}) translateX(${dir * 30 * (u - 0.5)}px)`, filter: 'saturate(0.92) brightness(0.93)'}}
          />
        );
      })}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(255,200,140,0.08), rgba(0,0,0,0.45) 100%)'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.7) 100%)'}} />
      {VO.map(([t, d, text], i) => {
        const a = f(VO_AT + t);
        const b = f(VO_AT + t + d);
        if (fr < a || fr > b) return null;
        const o = ci(fr, a, a + 12) * (1 - ci(fr, b - 12, b));
        return (
          <AbsoluteFill key={i} style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 100, opacity: o}}>
            <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 40, color: '#f6efe0', textAlign: 'center', maxWidth: 1400, lineHeight: 1.4, textShadow: '0 3px 16px rgba(0,0,0,0.95)', filter: `blur(${(1 - ci(fr, a, a + 12)) * 4}px)`}}>
              {text}
            </div>
          </AbsoluteFill>
        );
      })}
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ J. penutup
const Penutup: React.FC<{len: number}> = ({len}) => {
  const fr = useCurrentFrame();
  const L = f(len);
  const H_ = 900;
  const w_ = (CUT_GRAD.w / CUT_GRAD.h) * H_;
  const st = (k: number) => ci(fr, 30 + k * 18, 48 + k * 18, 0, 1, easeOut);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 30% 45%, #2a1e0a 0%, #050403 70%)', opacity: ci(fr, 0, 20) * (1 - ci(fr, L - 40, L))}}>
      <Rays cx={560} cy={420} opacity={0.45} />
      <Embers n={50} />
      <Img src={staticFile(CUT_GRAD.src)} style={{position: 'absolute', height: H_, width: w_, left: 560 - w_ / 2, top: 1080 - H_ + 10, opacity: ci(fr, 0, 30), transform: `scale(${1 + 0.03 * (fr / L)})`, transformOrigin: '50% 100%'}} />
      <div style={{position: 'absolute', left: 1000, top: 250, width: 860}}>
        <div style={{opacity: st(0)}}>
          <Gold3D text="TAHNIAH" size={140} p={st(0)} shine={ci(fr, 60, 100)} />
        </div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 38, color: '#fff', marginTop: 36, letterSpacing: 2, lineHeight: 1.3, opacity: st(1)}}>THORIQ YUSUF BIN MOHAMMAD NOR BAKRI</div>
        <div style={{width: 380 * st(2), height: 2, background: GOLD_GRAD, margin: '26px 0'}} />
        <div style={{opacity: st(2)}}>
          <Gold size={60} spacing={4}>TOKOH MURID 2026</Gold>
        </div>
        <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 5, color: '#e6dcc4', marginTop: 18, lineHeight: 1.7, opacity: st(3)}}>
          PENOLONG KETUA MURID · 6 IBNU MAJAH
          <br />
          SK SULTAN OMAR, DUNGUN
          <br />
          HARI ANUGERAH KECEMERLANGAN 2026
        </div>
      </div>
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};

const Kilat: React.FC = () => {
  const fr = useCurrentFrame();
  return <AbsoluteFill style={{background: '#fff', opacity: 0.6 * (1 - ci(fr, 0, 8))}} />;
};

// ------------------------------------------------------------------ bunyi
type Sfx = [number, string, number];
const SFX: Sfx[] = [
  [AKSES + 0.05, 'sfx/hud_boot', 0.6],
  [AKSES + 0.5, 'sfx/data', 0.3],
  [AKSES + 1.7, 'sfx/imbasan', 0.45],
  [AKSES + 2.3, 'sfx/data', 0.3],
  [AKSES + 3.3, 'sfx/bip', 0.5],
  [AKSES + 3.33, 'sfx/impact_besar', 0.6],
  [AKSES + 3.35, 'sfx/glitch', 0.4],
];
for (let k = 0; k < 18; k++) SFX.push([AKSES + 0.1 + k * 0.12, 'sfx/taip', 0.25]);
BUKA_T.slice(0, -1).forEach((t) => SFX.push([t, 'sfx/imbasan', 0.4], [t + 0.35, 'sfx/bip', 0.35]));
PANEL_T.forEach((t) => SFX.push([t - 0.6, 'sfx/whoosh_pendek', 0.4], [t, 'sfx/blip', 0.3]));
SFX.push([DULU + 1.0, 'sfx/imbasan', 0.4], [DULU + 2.2, 'sfx/swish_teks', 0.35]);
WARP_T.forEach((t, i) => SFX.push([t, i === 0 ? 'sfx/warp' : 'sfx/whoosh_pendek', i === 0 ? 0.6 : 0.35]));
SFX.push([LARI, 'sfx/impact_lembut', 0.6], [LARI + 0.1, 'sfx/whoosh_panjang', 0.4]);
SQ_T.forEach((t, i) => {
  SFX.push([t, 'sfx/kamera', 0.25]);
  if (SQ_STAMP[i]) SFX.push([t + 0.2, 'sfx/impact_lembut', 0.65]);
});
SFX.push([INTL + 0.05, 'sfx/hud_boot', 0.5]);
MISI.forEach((m) => {
  SFX.push([INTL + m.t, 'sfx/data', 0.3], [INTL + m.t + 0.1, 'sfx/imbasan', 0.35]);
  m.foto.forEach((_, j) => SFX.push([INTL + m.t + (j * m.len) / m.foto.length, 'sfx/glitch', 0.25]));
});
for (let k = 0; k < 12; k++) SFX.push([RUMUS + 0.2 + k * 0.12, 'sfx/taip', 0.25]);
SFX.push([RUMUS + 4.0, 'sfx/whoosh_pendek', 0.35], [RUMUS + 7.87, 'sfx/impact_besar', 0.55], [RUMUS + 7.9, 'sfx/stinger', 0.35]);
SFX.push([PENUTUP + 1.0, 'sfx/koir', 0.35], [PENUTUP + 1.6, 'sfx/impact_lembut', 0.4], [PENUTUP + 3.0, 'sfx/tepukan', 0.45]);

export const TrailerBahagian3: React.FC = () => {
  const [h] = useState(() => delayRender('fon'));
  useEffect(() => {
    Promise.all(['900 40px Cinzel', '700 40px Cinzel', '500 40px Montserrat', '700 40px Montserrat', '400 40px "JetBrains Mono"', '700 40px "JetBrains Mono"'].map((x) => document.fonts.load(x))).then(() => continueRender(h));
  }, [h]);
  const vol = (pts: number[], vals: number[]) => (fr: number) => interpolate(fr, pts.map(f), vals, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence from={f(AKSES)} durationInFrames={f(BUKA - AKSES)}>
        <Akses />
      </Sequence>
      <Sequence from={f(BUKA)} durationInFrames={f(SEKOLAH - BUKA)}>
        <Nyahkabur />
      </Sequence>
      <Sequence from={f(SEKOLAH)} durationInFrames={f(DULU - SEKOLAH)}>
        <HoloSekolah />
      </Sequence>
      <Sequence from={f(DULU)} durationInFrames={f(SUKAN - DULU)}>
        <DuluKini len={SUKAN - DULU} />
      </Sequence>
      <Sequence from={f(SUKAN)} durationInFrames={f(LARI - SUKAN)}>
        <Warp />
      </Sequence>
      <Sequence from={f(LARI)} durationInFrames={f(SKUASY - LARI)}>
        <Lari len={SKUASY - LARI} />
      </Sequence>
      <Sequence from={f(SKUASY)} durationInFrames={f(INTL - SKUASY)}>
        <Skuasy />
      </Sequence>
      <Sequence from={f(INTL)} durationInFrames={f(RUMUS - INTL)}>
        <Antarabangsa />
        <Kilat />
      </Sequence>
      <Sequence from={f(RUMUS)} durationInFrames={f(KELUARGA - RUMUS - 1.0)}>
        <Rumusan len={KELUARGA - RUMUS - 1.0} />
      </Sequence>
      <Sequence from={f(KELUARGA)} durationInFrames={f(PENUTUP - KELUARGA + 0.5)}>
        <Keluarga />
      </Sequence>
      <Sequence from={f(PENUTUP)} durationInFrames={f(AKHIR - PENUTUP)}>
        <Penutup len={AKHIR - PENUTUP} />
      </Sequence>
      <FilmLook />

      {/* ---------------- muzik ---------------- */}
      <Sequence from={0} durationInFrames={f(INTL + 0.6)}>
        <Audio src={staticFile('v8/muzik/sovereign.mp3')} trimBefore={f(LS0)} volume={vol([0, INTL - 0.6, INTL + 0.4], [1.0, 1.0, 0])} />
      </Sequence>
      <Sequence from={f(INTL - 1.0)} durationInFrames={f(KELUARGA - INTL + 1.0)}>
        <Audio src={staticFile('v8/muzik/clockwork_collapse.mp3')} trimBefore={f(103.5)} volume={vol([0, KELUARGA - INTL - 2.5, KELUARGA - INTL + 0.5], [0.85, 0.85, 0])} />
      </Sequence>
      <Sequence from={f(KELUARGA + VO_AT)} durationInFrames={f(37.2)}>
        <Audio src={staticFile('v8/vo/VO_KELUARGA.wav')} volume={1.0} />
      </Sequence>
      <Sequence from={f(KELUARGA - 0.8)} durationInFrames={f(AKHIR - KELUARGA + 0.8)}>
        <Audio src={staticFile('v8/muzik/morning.mp3')} trimBefore={f(0.4)} volume={vol([0, 1.2, 2.4, VO_AT + 36.0, VO_AT + 37.5, AKHIR - KELUARGA - 4, AKHIR - KELUARGA + 0.8], [0, 0.5, 0.22, 0.22, 0.7, 0.7, 0])} />
      </Sequence>
      {SFX.map(([t, file, v], i) => (
        <Sequence key={'x' + i} from={Math.max(0, f(t))}>
          <Audio src={staticFile(`${file}.wav`)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const BAHAGIAN3_LEN = f(AKHIR);
