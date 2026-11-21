import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {at, CLIP_END, MAKSUD, PENYAMPAI, MATAN_AR, QALA_AR, RIWAYAT_AR, RIWAYAT_T, SANAD_AR, SANAD_MS} from './data';
import {ARAB, backOut, BG, CARD, center, ci, CREAM, DIM, easeInOut, GOLD, GREEN, pop, rise, SANS, SceneTitle, useP, Win} from './ui';

// ---------------------------------------------------------------- utiliti
/** Teks Arab dengan sorotan perkataan semasa dibaca (karaoke, kanan ke kiri) */
const ArabKaraoke: React.FC<{words: [string, number][]; size: number; color?: string; gap?: number}> = ({words, size, color = CREAM, gap = 22}) => {
  const fr = useCurrentFrame();
  return (
    <div dir="rtl" style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `0 ${gap}px`, fontFamily: ARAB, fontSize: size, lineHeight: 1.75}}>
      {words.map(([w, t], i) => {
        const said = fr >= at(t);
        const nxt = words[i + 1]?.[1] ?? t + 0.9;
        const now = said && fr < at(Math.min(nxt, t + 0.9));
        const k = ci(fr, at(t), at(t) + 6);
        return (
          <span
            key={i}
            style={{
              color: now ? GOLD : said ? color : 'rgba(251,245,230,0.3)',
              textShadow: now ? `0 0 ${30 * k}px rgba(230,195,106,0.75)` : 'none',
              transform: `scale(${now ? 1 + 0.06 * (1 - k) + 0.03 : 1})`,
              display: 'inline-block',
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

const Check: React.FC<{p: number; size?: number}> = ({p, size = 70}) => (
  <svg width={size} height={size} viewBox="0 0 70 70" style={{transform: `scale(${0.6 + 0.4 * Math.min(1, p)})`, opacity: Math.min(1, p * 2), flexShrink: 0}}>
    <circle cx={35} cy={35} r={33} fill={GREEN} />
    <path d="M19 36 L31 47 L52 24" fill="none" stroke={BG} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={60} strokeDashoffset={60 * (1 - Math.min(1, p))} />
  </svg>
);

const Ornament: React.FC<{w?: number}> = ({w = 520}) => (
  <svg width={w} height={30} viewBox={`0 0 ${w} 30`}>
    <line x1={0} y1={15} x2={w / 2 - 30} y2={15} stroke={GOLD} strokeWidth={2} />
    <line x1={w / 2 + 30} y1={15} x2={w} y2={15} stroke={GOLD} strokeWidth={2} />
    <rect x={w / 2 - 11} y={4} width={22} height={22} fill="none" stroke={GOLD} strokeWidth={2.5} transform={`rotate(45 ${w / 2} 15)`} />
    <rect x={w / 2 - 11} y={4} width={22} height={22} fill="none" stroke={GOLD} strokeWidth={2.5} />
  </svg>
);

// --------------------------------------------------------------- ikon
const I = {
  baik: (
    <svg width={150} height={130} viewBox="0 0 150 130">
      <path d="M75 112 C 40 85, 22 66, 22 46 A 24 24 0 0 1 75 34 A 24 24 0 0 1 128 46 C 128 66, 110 85, 75 112 Z" fill={GOLD} />
      <path d="M52 62 L68 77 L100 45" fill="none" stroke={BG} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  baju: (
    <svg width={150} height={130} viewBox="0 0 150 130">
      <path d="M50 14 L28 26 L8 54 L28 66 L38 52 L38 120 L112 120 L112 52 L122 66 L142 54 L122 26 L100 14 Q75 36 50 14 Z" fill={GOLD} />
      <path d="M62 20 L75 40 L88 20" fill="none" stroke={BG} strokeWidth={5} />
      {[56, 76, 96].map((y) => (
        <circle key={y} cx={75} cy={y} r={4} fill={BG} />
      ))}
    </svg>
  ),
  makan: (
    <svg width={150} height={130} viewBox="0 0 150 130">
      <path d="M14 62 L136 62 Q132 112 75 116 Q18 112 14 62 Z" fill={GOLD} />
      <path d="M50 52 Q55 32 46 18 M75 52 Q80 30 71 12 M100 52 Q105 32 96 18" fill="none" stroke={GOLD} strokeWidth={5} strokeLinecap="round" opacity={0.7} />
      <rect x={42} y={74} width={66} height={28} rx={6} fill={BG} />
      <text x={75} y={95} textAnchor="middle" fill={GOLD} fontFamily="Montserrat" fontWeight={900} fontSize={20}>
        HALAL
      </text>
    </svg>
  ),
  rumah: (
    <svg width={150} height={130} viewBox="0 0 150 130">
      <path d="M75 10 L140 62 L124 62 L124 120 L26 120 L26 62 L10 62 Z" fill={GOLD} />
      <path d="M75 104 C 58 92, 50 84, 50 74 A 12 12 0 0 1 75 68 A 12 12 0 0 1 100 74 C 100 84, 92 92, 75 104 Z" fill={BG} />
    </svg>
  ),
  hadiah: (
    <svg width={110} height={110} viewBox="0 0 110 110">
      <rect x={12} y={44} width={86} height={58} rx={6} fill={GOLD} />
      <rect x={6} y={30} width={98} height={20} rx={5} fill={GOLD} />
      <rect x={49} y={30} width={12} height={72} fill={BG} />
      <path d="M55 30 C 40 6, 18 16, 30 30 M55 30 C 70 6, 92 16, 80 30" fill="none" stroke={GOLD} strokeWidth={7} />
    </svg>
  ),
  dompet: (
    <svg width={110} height={110} viewBox="0 0 110 110">
      <rect x={8} y={26} width={94} height={68} rx={10} fill={GOLD} />
      <rect x={62} y={46} width={40} height={28} rx={8} fill={BG} />
      <circle cx={76} cy={60} r={6} fill={GOLD} />
    </svg>
  ),
  perisai: (
    <svg width={170} height={190} viewBox="0 0 170 190">
      <path d="M85 8 L156 34 L156 92 C 156 140, 122 168, 85 182 C 48 168, 14 140, 14 92 L14 34 Z" fill={GOLD} />
      <path d="M85 26 L140 46 L140 92 C 140 130, 113 153, 85 164 C 57 153, 30 130, 30 92 L30 46 Z" fill="none" stroke={BG} strokeWidth={5} />
      <path d="M52 96 L76 120 L120 72" fill="none" stroke={BG} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// =============================================================== 0. Intro
export const Intro: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const t0 = CLIP_START_ABS;
  return (
    <Win a={t0} b={12.1} fin={0.01} fout={0.4}>
      <AbsoluteFill style={{...center, paddingBottom: 120}}>
        <div style={{...rise(ci(fr, 4, 22))}}>
          <Ornament />
        </div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 40, color: GOLD, letterSpacing: 10, marginTop: 30, ...rise(ci(fr, 8, 26))}}>KULIAH HADIS</div>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 112, color: CREAM, lineHeight: 1.05, textAlign: 'center', marginTop: 24, ...pop(ci(fr, 14, 34))}}>
          Nampakkan
          <br />
          Nikmat Allah
        </div>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 62, color: GOLD, marginTop: 24, textAlign: 'center', ...rise(ci(fr, 26, 44))}}>
          sebagai Tanda Bersyukur
        </div>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 36, color: DIM, marginTop: 40, ...rise(ci(fr, 34, 52))}}>bersama</div>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 52, color: CREAM, marginTop: 4, ...rise(ci(fr, 38, 56))}}>{PENYAMPAI}</div>
        <div style={{marginTop: 36, ...rise(ci(fr, 30, 48))}}>
          <Ornament />
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1580, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 40, color: DIM, opacity: P(10.9)}}>
        Alhamdulillah…
      </div>
    </Win>
  );
};
const CLIP_START_ABS = 8.3;

// ============================================================ 1. Bismillah
export const Bismillah: React.FC = () => {
  const P = useP();
  return (
    <Win a={12.0} b={14.3} fin={0.3} fout={0.3}>
      <AbsoluteFill style={{...center, paddingTop: 200}}>
        <div style={{fontFamily: ARAB, fontSize: 120, color: GOLD, lineHeight: 1.6, textShadow: '0 0 40px rgba(230,195,106,0.4)', ...pop(P(12.14, 0.8), 1.15)}}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 42, color: CREAM, textAlign: 'center', lineHeight: 1.35, marginTop: 10, ...rise(P(12.6))}}>
          Dengan nama Allah Yang Maha Pemurah
          <br />
          lagi Maha Penyayang
        </div>
      </AbsoluteFill>
    </Win>
  );
};

// ============================================================== 2. Sanad
const CHAIN = [
  {n: '’Amru bin Syu’aib', sub: 'perawi', t: 14.64},
  {n: 'Ayahnya', sub: 'Syu’aib', t: 16.48},
  {n: 'Datuknya r.a.', sub: '’Abdullah bin ’Amru r.a.', t: 17.34},
  {n: 'Rasulullah ﷺ', sub: 'sumber hadis', t: 18.9},
];
export const Sanad: React.FC = () => {
  const P = useP();
  return (
    <Win a={14.25} b={19.2} fin={0.3} fout={0.3}>
      <SceneTitle t={14.3} kicker="SANAD HADIS" title={<>Rantaian Perawi</>} />
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 580}}>
        <div style={{width: 960, opacity: P(14.3)}}>
          <ArabKaraoke words={SANAD_AR} size={64} gap={16} />
        </div>
        <div style={{display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', marginTop: 20}}>
          {CHAIN.map((c, i) => {
            const p = P(c.t, 0.45, backOut);
            const top = i === CHAIN.length - 1;
            return (
              <div key={c.n} style={{display: 'flex', flexDirection: 'column-reverse', alignItems: 'center'}}>
                <div
                  style={{
                    width: 660,
                    padding: '14px 24px',
                    borderRadius: 20,
                    background: top ? GOLD : CARD,
                    border: `3px solid ${GOLD}`,
                    textAlign: 'center',
                    opacity: Math.min(1, p * 2),
                    transform: `scale(${0.8 + 0.2 * Math.min(1, p)})`,
                  }}
                >
                  <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 50, color: top ? BG : CREAM, lineHeight: 1.1}}>{c.n}</div>
                  <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 28, color: top ? BG : DIM}}>{c.sub}</div>
                </div>
                {i > 0 && (
                  <svg width={40} height={44} style={{opacity: Math.min(1, p * 2)}}>
                    <path d="M20 40 L20 6 M8 18 L20 6 L32 18" stroke={GOLD} strokeWidth={5} fill="none" strokeLinecap="round" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Win>
  );
};

// ======================================================= 3. Kad hadis + maksud
export const HadisKad: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const ph2 = P(30.2, 0.8, easeInOut); // Arab mengecil, maksud muncul
  const arSize = interpolate(ph2, [0, 1], [112, 70]);
  return (
    <Win a={19.15} b={46.05} fin={0.35} fout={0.4}>
      <SceneTitle t={19.2} kicker="HADIS" title={<>Sabda Rasulullah ﷺ</>} />
      <div
        style={{
          position: 'absolute',
          left: 45,
          right: 45,
          top: 570,
          bottom: 1920 - 1530,
          borderRadius: 32,
          background: CARD,
          border: `3px solid ${GOLD}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
          padding: '26px 36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          ...rise(P(19.15, 0.6)),
        }}
      >
        <div style={{marginTop: interpolate(ph2, [0, 1], [150, 0])}}>
          <ArabKaraoke words={QALA_AR} size={arSize * 0.72} color={GOLD} gap={14} />
        </div>
        <div style={{width: '100%', marginTop: -10}}>
          <ArabKaraoke words={MATAN_AR} size={arSize} gap={arSize * 0.28} />
        </div>
        <div
          dir="rtl"
          style={{
            marginTop: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            ...pop(P(RIWAYAT_T, 0.5), 1.3),
          }}
        >
          <span style={{fontFamily: ARAB, fontSize: interpolate(ph2, [0, 1], [52, 40]), color: GOLD}}>{RIWAYAT_AR}</span>
        </div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, color: DIM, marginTop: 2, ...rise(P(RIWAYAT_T + 0.4))}}>
          (Riwayat at-Tirmizi · hasan sahih)
        </div>

        {/* MAKSUDNYA */}
        <div style={{width: '100%', opacity: ph2, marginTop: 18}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <div style={{flex: 1, height: 2, background: 'rgba(230,195,106,0.45)'}} />
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, color: GOLD, letterSpacing: 6}}>MAKSUDNYA</div>
            <div style={{flex: 1, height: 2, background: 'rgba(230,195,106,0.45)'}} />
          </div>
          {/* sanad dalam BM */}
          <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 18}}>
            <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, color: DIM, opacity: P(30.52)}}>Daripada</span>
            {SANAD_MS.map(([n, t], i) => (
              <React.Fragment key={n}>
                {i > 0 && <span style={{fontFamily: SANS, fontSize: 30, color: GOLD, opacity: P(t)}}>›</span>}
                <span
                  style={{
                    fontFamily: SANS,
                    fontWeight: 800,
                    fontSize: 30,
                    color: CREAM,
                    border: `2px solid rgba(230,195,106,0.6)`,
                    borderRadius: 30,
                    padding: '4px 16px',
                    ...pop(P(t, 0.4), 1.2),
                  }}
                >
                  {n}
                </span>
              </React.Fragment>
            ))}
            <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, color: DIM, opacity: P(35.88)}}>katanya:</span>
          </div>
          <div style={{marginTop: 22, textAlign: 'center'}}>
            {MAKSUD.map((m, i) => {
              const p = P(m.t, 0.5);
              const nowKey = m.key && fr >= at(m.t);
              return (
                <div
                  key={i}
                  style={{
                    fontFamily: SANS,
                    fontWeight: i === 0 ? 700 : 800,
                    fontSize: i === 0 ? 40 : 50,
                    color: i === 0 ? GOLD : CREAM,
                    lineHeight: 1.3,
                    marginTop: 4,
                    ...rise(p, 24),
                  }}
                >
                  {m.key ? (
                    <>
                      bila melihat{' '}
                      <span
                        style={{
                          background: nowKey ? GOLD : 'transparent',
                          color: nowKey ? BG : CREAM,
                          borderRadius: 12,
                          padding: '0 12px',
                        }}
                      >
                        kesan nikmat
                      </span>
                    </>
                  ) : (
                    m.text
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Win>
  );
};

// ============================================================ 4. Contoh
const CONTOH = [
  {n: 'Membuat perkara yang baik', t: 48.06, icon: I.baik},
  {n: 'Berpakaian cantik', t: 49.74, icon: I.baju},
  {n: 'Makanan yang halal', t: 52.1, icon: I.makan},
  {n: 'Rumah tangga bahagia', t: 53.4, icon: I.rumah},
];
export const Contoh: React.FC = () => {
  const P = useP();
  return (
    <Win a={46.0} b={55.95} fin={0.35} fout={0.35}>
      <SceneTitle t={46.1} kicker="CONTOH KESAN NIKMAT" title={<>Pada Diri Hamba-Nya</>} />
      <div style={{position: 'absolute', left: 50, right: 50, top: 600, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30}}>
        {CONTOH.map((c) => {
          const p = P(c.t, 0.5, backOut);
          return (
            <div
              key={c.n}
              style={{
                height: 420,
                borderRadius: 30,
                background: CARD,
                border: `3px solid ${p > 0.3 ? GOLD : 'rgba(230,195,106,0.25)'}`,
                ...center,
                gap: 22,
                padding: 24,
                opacity: 0.25 + 0.75 * Math.min(1, p),
                transform: `scale(${0.88 + 0.12 * Math.min(1, p)})`,
              }}
            >
              {c.icon}
              <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 46, color: CREAM, textAlign: 'center', lineHeight: 1.15}}>{c.n}</div>
            </div>
          );
        })}
      </div>
    </Win>
  );
};

// ========================================================== 5. Pengajaran
export const Pengajaran: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const harus = fr >= at(66.64);
  return (
    <Win a={56.6} b={67.95} fin={0.35} fout={0.35}>
      <SceneTitle t={56.7} kicker="PENGAJARAN HADIS" title={<>Setiap Muslim Hendaklah…</>} />
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 610}}>
        <div style={{width: 960, borderRadius: 30, background: CARD, border: `3px solid ${GOLD}`, padding: '34px 40px', display: 'flex', alignItems: 'center', gap: 34, ...rise(P(60.36))}}>
          <div style={{...pop(P(61.54, 0.5, backOut), 1.6)}}>{I.hadiah}</div>
          <div>
            <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 76, color: GOLD, lineHeight: 1}}>SYUKURI</div>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 50, color: CREAM, lineHeight: 1.2, marginTop: 8, ...rise(P(61.18))}}>segala nikmat</div>
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, color: DIM, ...rise(P(62.56))}}>daripada Allah SWT</div>
          </div>
        </div>
        <div style={{...center, margin: '20px 0', opacity: P(63.76)}}>
          <svg width={60} height={70}>
            <path d="M30 4 L30 60 M12 42 L30 62 L48 42" stroke={GOLD} strokeWidth={7} fill="none" strokeLinecap="round" />
          </svg>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, color: GOLD, letterSpacing: 6}}>CARANYA</div>
        </div>
        <div style={{width: 960, borderRadius: 30, background: CARD, border: `3px solid ${harus ? GREEN : 'rgba(230,195,106,0.4)'}`, padding: '34px 40px', display: 'flex', alignItems: 'center', gap: 34, ...rise(P(64.44))}}>
          <div>{I.dompet}</div>
          <div style={{flex: 1}}>
            <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 60, color: CREAM, lineHeight: 1.05}}>Belanjakan</div>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 44, color: CREAM, lineHeight: 1.25, marginTop: 6, ...rise(P(65.76))}}>
              pada perkara yang{' '}
              <span style={{background: harus ? GREEN : 'transparent', color: harus ? BG : CREAM, borderRadius: 10, padding: '0 10px'}}>diharuskan</span> syarak
            </div>
          </div>
          <Check p={P(67.0, 0.5)} />
        </div>
      </AbsoluteFill>
    </Win>
  );
};

// ======================================================= 6. Tidak melarang
const HARUS = [
  {n: 'Memakai pakaian yang indah', t: 69.44, icon: I.baju},
  {n: 'Berumah besar lagi cantik', t: 71.84, icon: I.rumah},
  {n: 'Makan makanan yang lazat', t: 74.99, icon: I.makan},
];
export const TidakLarang: React.FC = () => {
  const P = useP();
  return (
    <Win a={67.9} b={76.95} fin={0.35} fout={0.35}>
      <SceneTitle t={68.0} kicker="ISLAM" title={<>Tidak Melarang Umatnya</>} />
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 620, gap: 30}}>
        {HARUS.map((h) => {
          const p = P(h.t, 0.5, backOut);
          return (
            <div
              key={h.n}
              style={{
                width: 960,
                height: 230,
                borderRadius: 30,
                background: CARD,
                border: `3px solid ${p > 0.3 ? GOLD : 'rgba(230,195,106,0.2)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 30,
                padding: '0 36px',
                opacity: 0.25 + 0.75 * Math.min(1, p),
                transform: `translateX(${(1 - Math.min(1, p)) * 60}px)`,
              }}
            >
              <div style={{transform: 'scale(0.85)'}}>{h.icon}</div>
              <div style={{flex: 1, fontFamily: SANS, fontWeight: 800, fontSize: 52, color: CREAM, lineHeight: 1.15}}>{h.n}</div>
              <Check p={P(h.t + 0.2, 0.5)} size={80} />
            </div>
          );
        })}
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, color: DIM, ...rise(P(76.0))}}>…dan lain-lain</div>
      </AbsoluteFill>
    </Win>
  );
};

// =========================================================== 7. Syarat
const SYARAT = [
  {no: '1', a: 'Dinikmati dengan cara', b: 'HALAL', t: 80.44},
  {no: '2', a: 'Tidak menyalahi', b: 'HUKUM SYARAK', t: 81.96},
];
export const Syarat: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  return (
    <Win a={76.9} b={83.8} fin={0.35} fout={0.3}>
      <SceneTitle t={77.0} kicker="ASALKAN…" title={<>Dua Syarat Penting</>} />
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 600}}>
        <div style={{...pop(P(77.14, 0.6), 1.2)}}>{I.perisai}</div>
        {SYARAT.map((s) => {
          const p = P(s.t, 0.5, backOut);
          const on = fr >= at(s.t);
          return (
            <div
              key={s.no}
              style={{
                width: 960,
                marginTop: 34,
                borderRadius: 30,
                background: CARD,
                border: `4px solid ${on ? GOLD : 'rgba(230,195,106,0.2)'}`,
                display: 'flex',
                alignItems: 'center',
                gap: 30,
                padding: '30px 36px',
                opacity: 0.25 + 0.75 * Math.min(1, p),
                transform: `scale(${0.9 + 0.1 * Math.min(1, p)})`,
              }}
            >
              <div style={{width: 110, height: 110, borderRadius: 55, background: on ? GOLD : 'transparent', border: `4px solid ${GOLD}`, ...center, fontFamily: SANS, fontWeight: 900, fontSize: 64, color: on ? BG : GOLD, flexShrink: 0}}>
                {s.no}
              </div>
              <div>
                <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 44, color: CREAM}}>{s.a}</div>
                <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 74, color: GOLD, lineHeight: 1.05}}>{s.b}</div>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </Win>
  );
};

// =========================================================== 8. Penutup
export const Penutup: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const sum = P(CLIP_END + 0.2, 0.8, easeInOut);
  const end = ci(fr, at(CLIP_END + 3.8), at(CLIP_END + 4.5), 1, 0);
  return (
    <Win a={83.75} b={CLIP_END + 4.6} fin={0.35} fout={0.01}>
      <AbsoluteFill style={{...center, opacity: (1 - sum) * 1, paddingTop: 120}}>
        <div style={{fontFamily: ARAB, fontSize: 120, color: GOLD, lineHeight: 1.6, ...pop(P(83.86, 0.7), 1.15)}}>وَاللَّهُ أَعْلَمُ</div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 44, color: CREAM, ...rise(P(84.5))}}>Dan Allah lebih mengetahui</div>
      </AbsoluteFill>
      <AbsoluteFill style={{...center, opacity: sum * end}}>
        <Ornament />
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 36, color: GOLD, letterSpacing: 8, marginTop: 30}}>RUMUSAN</div>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 90, color: CREAM, lineHeight: 1.1, textAlign: 'center', marginTop: 20}}>
          Nampakkan
          <br />
          nikmat Allah
          <br />
          <span style={{color: GOLD, fontSize: 64}}>sebagai tanda bersyukur</span>
        </div>
        <div dir="rtl" style={{fontFamily: ARAB, fontSize: 64, color: CREAM, marginTop: 40, lineHeight: 1.7, textAlign: 'center', padding: '0 60px'}}>
          إِنَّ اللَّهَ يُحِبُّ أَنْ يُرَى أَثَرُ نِعْمَتِهِ عَلَى عَبْدِهِ
        </div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 32, color: DIM, marginTop: 6}}>Riwayat at-Tirmizi</div>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 32, color: DIM, marginTop: 44}}>Kuliah oleh</div>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 52, color: GOLD, marginTop: 4}}>{PENYAMPAI}</div>
        <div style={{marginTop: 36}}>
          <Ornament />
        </div>
      </AbsoluteFill>
    </Win>
  );
};
