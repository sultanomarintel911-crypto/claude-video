import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {at, CLIP_END, FPS} from './data';
import {Arab, ARAB, backOut, Card, center, ci, Clay, ClayCloud, easeInOut, GREEN, INK, Kicker, MUTED, ORANGE, ORANGE_D, PAPER, Pill3D, POP, pop, RED, rise, Tilt, useP, Win, YELLOW} from './ui';

const H1: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({children, size = 110, color = INK, style}) => (
  <div style={{fontFamily: POP, fontWeight: 900, fontSize: size, color, lineHeight: 1.02, letterSpacing: -2, textAlign: 'center', ...style}}>{children}</div>
);
const X: React.FC<{p: number; size?: number}> = ({p, size = 64}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{flexShrink: 0, ...pop(p, 0.3)}}>
    <circle cx={32} cy={32} r={30} fill={RED} />
    <path d="M21 21 L43 43 M43 21 L21 43" stroke="#fff" strokeWidth={8} strokeLinecap="round" />
  </svg>
);
const V: React.FC<{p: number; size?: number}> = ({p, size = 64}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{flexShrink: 0, ...pop(p, 0.3)}}>
    <circle cx={32} cy={32} r={30} fill={GREEN} />
    <path d="M18 33 L28 43 L47 22" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Avatar: React.FC<{c: string}> = ({c}) => (
  <svg width={96} height={96} viewBox="0 0 96 96" style={{flexShrink: 0}}>
    <circle cx={48} cy={48} r={46} fill={c} />
    <circle cx={48} cy={38} r={16} fill="#fff" opacity={0.9} />
    <path d="M20 80 Q48 50 76 80 Z" fill="#fff" opacity={0.9} />
  </svg>
);

// ============================================================ 0. Tajuk
export const Intro: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const t = ci(fr, 0, 24, 0, 1, backOut);
  return (
    <Win a={-1.4} b={2.05} fin={0.01} fout={0.35}>
      <AbsoluteFill style={{...center, gap: 30}}>
        <div style={pop(t)}>
          <Pill3D size={46}>TAZKIRAH</Pill3D>
        </div>
        <H1 size={150} color={ORANGE} style={{...rise(ci(fr, 6, 26)), textShadow: `0 8px 0 ${ORANGE_D}33`}}>
          Racun
          <br />
          Yang Halus
        </H1>
        <div style={{fontFamily: POP, fontWeight: 700, fontSize: 44, color: MUTED, ...rise(ci(fr, 14, 32))}}>“Yang penting hati baik?”</div>
        <div style={{fontFamily: ARAB, fontSize: 64, color: INK, marginTop: 30, ...rise(P(0, 0.6))}}>السَّلَامُ عَلَيْكُمْ</div>
      </AbsoluteFill>
    </Win>
  );
};

// ============================================================ 1. Dakwaan popular
export const Dakwaan: React.FC = () => {
  const P = useP();
  const bub = [
    {t: 3.66, txt: '“Yang penting hati baik.”', c: ORANGE, side: 'l'},
    {t: 6.32, txt: '“Saya tak tutup aurat, tapi saya solat.”', c: YELLOW, side: 'r'},
  ];
  return (
    <Win a={2.0} b={9.75}>
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 270}}>
        <Kicker p={P(2.12)}>Pernah dengar orang kata…</Kicker>
        <div style={{display: 'flex', flexDirection: 'column', gap: 60, marginTop: 70, width: 960}}>
          {bub.map((b) => (
            <Tilt key={b.t} p={P(b.t, 0.6, backOut)} amp={1.2} style={{alignSelf: b.side === 'l' ? 'flex-start' : 'flex-end'}}>
              <div style={{display: 'flex', alignItems: 'flex-end', gap: 20, flexDirection: b.side === 'l' ? 'row' : 'row-reverse'}}>
                <Avatar c={b.c} />
                <Card style={{maxWidth: 720, borderRadius: b.side === 'l' ? '40px 40px 40px 8px' : '40px 40px 8px 40px'}}>
                  <div style={{fontFamily: POP, fontWeight: 800, fontSize: 60, lineHeight: 1.15}}>{b.txt}</div>
                </Card>
              </div>
            </Tilt>
          ))}
        </div>
      </AbsoluteFill>
    </Win>
  );
};

// ============================================================ 2. Racun halus
const Botol: React.FC<{fr: number}> = ({fr}) => (
  <svg width={360} height={460} viewBox="0 0 360 460">
    <defs>
      <radialGradient id="kaca" cx="35%" cy="35%" r="75%">
        <stop offset="0%" stopColor="#d4f5f0" />
        <stop offset="35%" stopColor="#5fd0c4" />
        <stop offset="75%" stopColor="#2bb3a6" />
        <stop offset="100%" stopColor="#137068" />
      </radialGradient>
    </defs>
    <ellipse cx={180} cy={440} rx={120} ry={16} fill="rgba(20,90,85,0.22)" />
    <rect x={140} y={40} width={80} height={90} rx={16} fill="#cfe9e4" />
    <rect x={128} y={20} width={104} height={40} rx={14} fill="#1d4f4b" />
    <path d="M140 120 Q60 170 60 280 Q60 430 180 430 Q300 430 300 280 Q300 170 220 120 Z" fill="url(#kaca)" />
    <path d="M100 200 Q90 260 104 320" stroke="#fff" strokeOpacity={0.6} strokeWidth={14} fill="none" strokeLinecap="round" />
    <rect x={110} y={240} width={140} height={110} rx={18} fill="#fbfffe" />
    <circle cx={180} cy={278} r={20} fill={INK} />
    <rect x={168} y={290} width={24} height={14} rx={4} fill={INK} />
    <text x={180} y={336} textAnchor="middle" fontFamily="Poppins" fontWeight={900} fontSize={26} fill={ORANGE}>
      RACUN
    </text>
    {[0, 1, 2].map((k) => {
      const ph = ((fr / 30 + k * 0.6) % 1.8) / 1.8;
      return <circle key={k} cx={180 + (k - 1) * 40} cy={150 - ph * 140} r={10 * (1 - ph) + 3} fill="#9fe3da" opacity={1 - ph} />;
    })}
  </svg>
);
export const Racun: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  return (
    <Win a={9.75} b={16.6}>
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 290}}>
        <Kicker p={P(10.1)}>Kedengarannya biasa…</Kicker>
        <H1 size={84} style={{marginTop: 14, ...rise(P(11.52))}}>
          tapi di sinilah <span style={{color: ORANGE}}>bermulanya</span>
        </H1>
        <div style={{marginTop: 30, ...pop(P(13.56, 0.7, backOut), 0.4), transform: `${pop(P(13.56, 0.7, backOut), 0.4).transform} rotate(${Math.sin(fr / 20) * 4}deg)`}}>
          <Botol fr={fr} />
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 10, ...rise(P(14.58))}}>
          <span style={{fontFamily: POP, fontWeight: 700, fontSize: 56, color: INK}}>yang sangat</span>
          <Pill3D size={70}>HALUS</Pill3D>
        </div>
      </AbsoluteFill>
    </Win>
  );
};

// ============================================================ 3. Spiritual vs beragama
const Toggle: React.FC<{on: number; label: string}> = ({on, label}) => (
  <Card style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: 860, padding: '40px 50px'}}>
    <div style={{fontFamily: POP, fontWeight: 900, fontSize: 76}}>{label}</div>
    <div style={{width: 200, height: 104, borderRadius: 52, background: on > 0.5 ? GREEN : '#b9d3cf', position: 'relative', boxShadow: 'inset 0 6px 10px rgba(0,0,0,0.15)'}}>
      <div style={{position: 'absolute', top: 8, left: 8 + on * 96, width: 88, height: 88, borderRadius: 44, background: 'radial-gradient(circle at 35% 30%, #fff, #e4f1ee)', boxShadow: '0 6px 12px rgba(0,0,0,0.25)'}} />
    </div>
  </Card>
);
export const Spiritual: React.FC = () => {
  const P = useP();
  const off = 1 - P(20.6, 0.5, easeInOut);
  return (
    <Win a={16.6} b={22.35}>
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 300, gap: 50}}>
        <Kicker p={P(16.86)}>Hari ini ramai yang mengaku…</Kicker>
        <Tilt p={P(18.4, 0.6, backOut)}>
          <Toggle on={P(18.66, 0.4, easeInOut)} label="Spiritual" />
        </Tilt>
        <div style={{fontFamily: POP, fontWeight: 800, fontSize: 56, color: MUTED, ...rise(P(19.38))}}>tapi tak mahu…</div>
        <Tilt p={P(19.9, 0.6, backOut)}>
          <Toggle on={off * 0.999} label="Beragama" />
        </Tilt>
      </AbsoluteFill>
    </Win>
  );
};

// ============================================================ 4. Islam pada nama
export const PadaNama: React.FC = () => {
  const P = useP();
  const stamp = P(25.34, 0.35, backOut);
  return (
    <Win a={22.35} b={31.4}>
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 280}}>
        <Kicker p={P(22.54)}>Ada yang selesa menggelar diri…</Kicker>
        <Tilt p={P(23.3, 0.7, backOut)} style={{marginTop: 40}}>
          <Card style={{width: 880, position: 'relative', padding: 0, overflow: 'hidden'}}>
            <div style={{background: ORANGE, color: '#fff', fontFamily: POP, fontWeight: 800, fontSize: 30, letterSpacing: 4, padding: '18px 40px'}}>KAD PENGENALAN DIRI</div>
            <div style={{display: 'flex', gap: 36, padding: '36px 40px'}}>
              <div style={{width: 170, height: 210, borderRadius: 20, background: '#d8efeb', ...center}}>
                <svg width={120} height={140} viewBox="0 0 96 110">
                  <circle cx={48} cy={38} r={22} fill="#a9d9d1" />
                  <path d="M8 108 Q48 56 88 108 Z" fill="#a9d9d1" />
                </svg>
              </div>
              <div style={{flex: 1, fontFamily: POP}}>
                <div style={{fontSize: 26, fontWeight: 700, color: MUTED, letterSpacing: 2}}>GELARAN</div>
                <div style={{fontSize: 64, fontWeight: 900, lineHeight: 1.1, ...rise(P(24.48))}}>Muslim</div>
                <div style={{fontSize: 26, fontWeight: 700, color: MUTED, letterSpacing: 2, marginTop: 14}}>AMALAN</div>
                <div style={{fontSize: 44, fontWeight: 800, color: '#a9c4c0', ...rise(P(25.14))}}>— kosong —</div>
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                right: 30,
                bottom: 30,
                fontFamily: POP,
                fontWeight: 900,
                fontSize: 34,
                color: RED,
                border: `5px solid ${RED}`,
                borderRadius: 12,
                padding: '6px 16px',
                transform: `rotate(-10deg) scale(${interpolate(stamp, [0, 1], [2.2, 1])})`,
                opacity: Math.min(1, stamp * 2),
              }}
            >
              TIDAK MENGAMALKAN
            </div>
          </Card>
        </Tilt>
        <div style={{display: 'flex', gap: 30, marginTop: 60}}>
          {[
            {t: 26.86, k: 'NAMA', v: 'Islam', ok: true},
            {t: 28.8, k: 'KEHIDUPAN', v: 'Tiada', ok: false},
          ].map((c) => (
            <Tilt key={c.k} p={P(c.t, 0.6, backOut)}>
              <Card style={{width: 420, ...center, gap: 12}} tone={c.ok ? 'paper' : 'paper'}>
                <div style={{fontFamily: POP, fontWeight: 700, fontSize: 28, color: MUTED, letterSpacing: 3}}>{c.k}</div>
                <div style={{fontFamily: POP, fontWeight: 900, fontSize: 66, color: c.ok ? INK : '#a9c4c0'}}>{c.v}</div>
                {c.ok ? <V p={P(c.t + 0.3)} /> : <X p={P(c.t + 0.6)} />}
              </Card>
            </Tilt>
          ))}
        </div>
      </AbsoluteFill>
    </Win>
  );
};

// ============================================================ 5. Garis halal/haram kabur
export const Kabur: React.FC = () => {
  const P = useP();
  const blur = P(34.4, 1.0, easeInOut);
  return (
    <Win a={31.4} b={40.75}>
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 280}}>
        <Kicker p={P(31.56)}>Lama-kelamaan…</Kicker>
        <Tilt p={P(32.6, 0.7, backOut)} style={{marginTop: 34}}>
          <div style={{display: 'flex', width: 900, height: 330, borderRadius: 40, overflow: 'hidden', boxShadow: '0 40px 70px rgba(20,90,85,0.22)', position: 'relative'}}>
            <div style={{flex: 1, background: `linear-gradient(150deg, #6ccf7d, ${GREEN})`, ...center, filter: `blur(${blur * 6}px)`}}>
              <div style={{fontFamily: POP, fontWeight: 900, fontSize: 84, color: '#fff'}}>HALAL</div>
            </div>
            <div style={{flex: 1, background: `linear-gradient(150deg, #ff7a6b, ${RED})`, ...center, filter: `blur(${blur * 6}px)`}}>
              <div style={{fontFamily: POP, fontWeight: 900, fontSize: 84, color: '#fff'}}>HARAM</div>
            </div>
            <div style={{position: 'absolute', left: 447, top: 0, bottom: 0, width: 6, background: '#fff', opacity: 1 - blur * 0.9, boxShadow: `0 0 ${blur * 60}px ${blur * 40}px rgba(255,255,255,${0.6 * blur})`}} />
          </div>
        </Tilt>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 34, ...rise(P(34.28))}}>
          <span style={{fontFamily: POP, fontWeight: 800, fontSize: 56}}>garisnya jadi</span>
          <Pill3D size={60} style={{filter: `blur(${blur * 2}px)`}}>KABUR</Pill3D>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 26, marginTop: 50, width: 900}}>
          {[
            {t: 35.8, a: 'Yang haram', b: 'dibuat bergurau'},
            {t: 37.96, a: 'Yang suci', b: 'dijadikan hiburan'},
          ].map((r) => (
            <Tilt key={r.t} p={P(r.t, 0.55, backOut)}>
              <Card style={{display: 'flex', alignItems: 'center', gap: 24, padding: '26px 36px'}}>
                <div style={{fontFamily: POP, fontWeight: 900, fontSize: 50, color: ORANGE, whiteSpace: 'nowrap'}}>{r.a}</div>
                <svg width={60} height={30}>
                  <path d="M4 15 H48 M36 4 L52 15 L36 26" stroke={MUTED} strokeWidth={6} fill="none" strokeLinecap="round" />
                </svg>
                <div style={{fontFamily: POP, fontWeight: 800, fontSize: 46}}>{r.b}</div>
              </Card>
            </Tilt>
          ))}
        </div>
      </AbsoluteFill>
    </Win>
  );
};

// ============================================================ 6. MURJI'AH
export const Murjiah: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const big = P(43.1, 0.6, backOut);
  const slide = Math.min(260, Math.max(0, fr - at(43.1)) * 1.6);
  const up = P(44.7, 0.7, easeInOut);
  const pts = [
    {t: 45.84, a: 'Iman cukup di hati'},
    {t: 47.94, a: 'Amal tidak penting'},
    {t: 50.78, a: 'Dosa tidak menjejaskan iman'},
  ];
  return (
    <Win a={40.8} b={53.65}>
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 280}}>
        <Kicker p={P(41.24)} style={{opacity: 1 - up}}>Ulama menamakan pemikiran ini</Kicker>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', fontFamily: POP, fontWeight: 900, fontSize: 170, letterSpacing: -6, color: ORANGE, textShadow: `0 10px 0 ${ORANGE_D}, 0 30px 50px rgba(20,90,85,0.3)`, opacity: up, transform: `scale(${0.9 + 0.1 * up})`}}>
        MURJI’AH
      </div>
      {/* tipografi gergasi (dipotong di tepi) */}
      <div
        style={{
          position: 'absolute',
          top: 640,
          left: 60 - slide,
          fontFamily: POP,
          fontWeight: 900,
          fontSize: 400,
          lineHeight: 1,
          letterSpacing: -12,
          color: ORANGE,
          whiteSpace: 'nowrap',
          textShadow: `0 14px 0 ${ORANGE_D}, 0 40px 60px rgba(20,90,85,0.3)`,
          opacity: Math.min(1, big * 2) * (1 - up),
          transform: `scale(${interpolate(big, [0, 1], [1.4, 1])})`,
          transformOrigin: '0% 50%',
        }}
      >
        MURJI’AH
      </div>
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 680, opacity: up}}>
        <div style={{fontFamily: POP, fontWeight: 800, fontSize: 44, color: MUTED, marginBottom: 26}}>Fahamannya menganggap:</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 26, width: 900}}>
          {pts.map((p) => (
            <Tilt key={p.t} p={P(p.t, 0.55, backOut)}>
              <Card style={{display: 'flex', alignItems: 'center', gap: 28, padding: '28px 36px'}}>
                <X p={P(p.t + 0.4)} size={70} />
                <div style={{fontFamily: POP, fontWeight: 800, fontSize: 52, lineHeight: 1.1}}>{p.a}</div>
              </Card>
            </Tilt>
          ))}
        </div>
        <div style={{marginTop: 30, ...pop(P(52.4, 0.5, backOut), 0.5)}}>
          <Pill3D size={44} tone="r">FAHAMAN YANG SALAH</Pill3D>
        </div>
      </AbsoluteFill>
    </Win>
  );
};

// ============================================================ 7. Surah al-'Asr
const Mushaf: React.FC<{children: React.ReactNode; surah: string}> = ({children, surah}) => (
  <Card style={{width: 940, padding: '30px 40px 36px', border: `4px solid ${YELLOW}`, background: 'linear-gradient(180deg,#fcfffe,#eefaf7)'}}>
    <div style={{display: 'flex', justifyContent: 'center', marginBottom: 6}}>
      <div style={{fontFamily: POP, fontWeight: 800, fontSize: 28, color: '#fff', background: YELLOW, borderRadius: 30, padding: '6px 22px', letterSpacing: 2, boxShadow: '0 4px 0 #c98412'}}>{surah}</div>
    </div>
    {children}
  </Card>
);
export const Asr: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const hi = (t: number) => (fr >= at(t) ? ORANGE : INK);
  return (
    <Win a={53.65} b={62.85}>
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 270}}>
        <Kicker p={P(53.86)}>Sedangkan Allah berfirman…</Kicker>
        <Tilt p={P(54.6, 0.8, backOut)} amp={0.6} style={{marginTop: 30}}>
          <Mushaf surah="SURAH AL-‘ASR : 2–3">
            <div dir="rtl" style={{fontFamily: ARAB, fontSize: 70, lineHeight: 1.9, textAlign: 'center', color: INK}}>
              <span style={{color: hi(56.8)}}>إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ</span> ۝ <span>إِلَّا ٱلَّذِينَ </span>
              <span style={{color: fr >= at(60.22) ? ORANGE : INK}}>ءَامَنُوا۟ </span>
              <span style={{color: fr >= at(61.28) ? ORANGE : INK}}>وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ</span> …
            </div>
            <div style={{height: 3, background: 'rgba(247,183,51,0.5)', margin: '10px 0 20px'}} />
            <div style={{fontFamily: POP, fontWeight: 800, fontSize: 50, textAlign: 'center', lineHeight: 1.25, ...rise(P(56.8))}}>
              Semua manusia dalam <span style={{color: ORANGE}}>kerugian</span>,
            </div>
            <div style={{fontFamily: POP, fontWeight: 800, fontSize: 50, textAlign: 'center', lineHeight: 1.25, marginTop: 8, ...rise(P(58.8))}}>
              kecuali yang <span style={{background: fr >= at(60.22) ? ORANGE : 'transparent', color: fr >= at(60.22) ? '#fff' : INK, borderRadius: 12, padding: '0 10px'}}>beriman</span> dan{' '}
              <span style={{background: fr >= at(61.28) ? ORANGE : 'transparent', color: fr >= at(61.28) ? '#fff' : INK, borderRadius: 12, padding: '0 10px'}}>beramal soleh</span>.
            </div>
          </Mushaf>
        </Tilt>
      </AbsoluteFill>
    </Win>
  );
};

// ============================================================ 8. Iman + Amal
export const Gandingan: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const join = P(64.6, 0.6, backOut);
  const gap = interpolate(join, [0, 1], [180, 0]);
  const block = (txt: string, c: 'o' | 'y', side: number) => (
    <div style={{transform: `translateX(${side * gap}px) rotate(${side * (1 - join) * 8}deg)`, ...pop(P(side < 0 ? 62.98 : 63.58, 0.5, backOut), 0.4)}}>
      <div
        style={{
          width: 380,
          height: 380,
          borderRadius: 60,
          background: c === 'o' ? 'linear-gradient(150deg,#6ed6ca,#2bb3a6 60%,#1c8c82)' : 'linear-gradient(150deg,#ffd77a,#f7b733 60%,#c98412)',
          boxShadow: `0 26px 0 ${c === 'o' ? '#137068' : '#a96c0a'}, 0 60px 80px rgba(20,90,85,0.3), inset 0 4px 0 rgba(255,255,255,0.5)`,
          ...center,
        }}
      >
        <div style={{fontFamily: POP, fontWeight: 900, fontSize: 92, color: '#fff', textShadow: '0 4px 0 rgba(0,0,0,0.15)'}}>{txt}</div>
      </div>
    </div>
  );
  return (
    <Win a={62.85} b={66.7}>
      <AbsoluteFill style={{...center, gap: 70, paddingBottom: 120}}>
        <div style={{display: 'flex', perspective: 1400, transform: `rotateX(${8 + Math.sin(fr / 30) * 3}deg)`}}>
          {block('IMAN', 'o', -1)}
          {block('AMAL', 'y', 1)}
        </div>
        <div style={{...pop(P(64.32, 0.5, backOut), 0.6)}}>
          <Pill3D size={56}>TIDAK BOLEH DIPISAHKAN</Pill3D>
        </div>
      </AbsoluteFill>
    </Win>
  );
};

// ============================================================ 9. Al-Baqarah 208 + pilih-pilih
const ITEMS = [
  {n: 'Solat', keep: true},
  {n: 'Aurat', keep: false},
  {n: 'Puasa', keep: true},
  {n: 'Akhlak', keep: false},
  {n: 'Zakat', keep: false},
  {n: 'Halal', keep: true},
];
export const Kaffah: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const ph2 = P(71.0, 0.6, easeInOut);
  return (
    <Win a={66.7} b={75.65}>
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 270}}>
        <Kicker p={P(66.88)} style={{opacity: 1 - ph2}}>Allah juga menyuruh…</Kicker>
        <div style={{marginTop: 30, transform: `scale(${1 - ph2 * 0.22}) translateY(${-ph2 * 60}px)`, transformOrigin: '50% 0%'}}>
          <Tilt p={P(67.5, 0.8, backOut)} amp={0.6}>
            <Mushaf surah="SURAH AL-BAQARAH : 208">
              <Arab text="يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱدْخُلُوا۟ فِى ٱلسِّلْمِ كَآفَّةً" size={68} />
              <div style={{height: 3, background: 'rgba(247,183,51,0.5)', margin: '6px 0 16px'}} />
              <div style={{fontFamily: POP, fontWeight: 800, fontSize: 50, textAlign: 'center', lineHeight: 1.25, ...rise(P(67.94))}}>
                “Masuklah ke dalam Islam <span style={{color: fr >= at(69.76) ? ORANGE : INK}}>secara keseluruhan</span>”
              </div>
            </Mushaf>
          </Tilt>
        </div>
        <div style={{opacity: ph2, marginTop: -20, ...center}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
            <X p={P(71.3)} size={56} />
            <div style={{fontFamily: POP, fontWeight: 900, fontSize: 52}}>Bukan pilih yang kita suka</div>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 280px)', gap: 22, marginTop: 30}}>
            {ITEMS.map((it, i) => {
              const picked = P(71.9 + i * 0.12, 0.4, backOut);
              const drop = it.keep ? 0 : P(73.2 + i * 0.12, 0.6, easeInOut);
              return (
                <div
                  key={it.n}
                  style={{
                    height: 120,
                    borderRadius: 26,
                    background: it.keep ? PAPER : PAPER,
                    boxShadow: `0 ${it.keep ? 24 : 10}px ${it.keep ? 40 : 20}px rgba(20,90,85,${it.keep ? 0.25 : 0.12})`,
                    ...center,
                    fontFamily: POP,
                    fontWeight: 900,
                    fontSize: 46,
                    color: it.keep ? ORANGE : '#a9c4c0',
                    transform: `translateY(${(it.keep ? -14 : 0) * picked + drop * 60}px) rotate(${drop * (i % 2 ? 12 : -12)}deg)`,
                    opacity: Math.min(1, picked * 2) * (1 - drop * 0.65),
                    position: 'relative',
                  }}
                >
                  {it.n}
                  {!it.keep && <div style={{position: 'absolute', left: 30, right: 30, top: '50%', height: 6, borderRadius: 3, background: RED, opacity: drop}} />}
                </div>
              );
            })}
          </div>
          <div style={{fontFamily: POP, fontWeight: 800, fontSize: 40, color: MUTED, marginTop: 24, ...rise(P(73.22))}}>…dan tinggalkan yang kita tak suka</div>
        </div>
      </AbsoluteFill>
    </Win>
  );
};

// ============================================================ 10. Tidak sempurna — progres
const Prog: React.FC<{t: number; label: string; to: number; icon: React.ReactNode}> = ({t, label, to, icon}) => {
  const P = useP();
  const fr = useCurrentFrame();
  const f = P(t + 0.3, 2.2, easeInOut) * to;
  const step = Math.floor(fr / 6) % 2;
  return (
    <Tilt p={P(t, 0.6, backOut)}>
      <Card style={{width: 900, display: 'flex', alignItems: 'center', gap: 30, padding: '32px 40px'}}>
        <div style={{transform: `translateY(${step * -4}px)`}}>{icon}</div>
        <div style={{flex: 1}}>
          <div style={{fontFamily: POP, fontWeight: 800, fontSize: 44, lineHeight: 1.15}}>{label}</div>
          <div style={{height: 26, borderRadius: 13, background: '#d6ece8', marginTop: 16, overflow: 'hidden', boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.08)'}}>
            <div style={{width: `${f * 100}%`, height: '100%', borderRadius: 13, background: `linear-gradient(90deg, ${YELLOW}, ${ORANGE})`}} />
          </div>
        </div>
        <div style={{fontFamily: POP, fontWeight: 900, fontSize: 40, color: ORANGE, width: 110, textAlign: 'right'}}>{Math.round(f * 100)}%</div>
      </Card>
    </Tilt>
  );
};
export const TakSempurna: React.FC = () => {
  const P = useP();
  return (
    <Win a={75.65} b={84.35}>
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 280, gap: 36}}>
        <H1 size={96} style={rise(P(75.84))}>
          Kita semua <span style={{color: ORANGE}}>tidak sempurna</span>
        </H1>
        <Prog
          t={77.76}
          label="Masih belajar menutup aurat"
          to={0.62}
          icon={
            <svg width={100} height={100} viewBox="0 0 100 100">
              <path d="M50 8 C24 8 14 34 18 60 L22 92 L78 92 L82 60 C86 34 76 8 50 8 Z" fill={ORANGE} />
              <ellipse cx={50} cy={46} rx={18} ry={22} fill="#d4f5f0" />
            </svg>
          }
        />
        <Prog
          t={80.18}
          label="Masih bertatih menjaga solat"
          to={0.45}
          icon={
            <svg width={100} height={100} viewBox="0 0 100 100">
              <rect x={22} y={10} width={56} height={84} rx={10} fill={YELLOW} />
              <path d="M30 22 H70 M30 36 H70" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
              <path d="M50 52 l14 14 -14 14 -14 -14 z" fill="#fff" />
            </svg>
          }
        />
        <div style={{marginTop: 10, ...pop(P(82.94, 0.5, backOut), 0.5)}}>
          <Pill3D size={58} tone="g">Itu tidak mengapa ✓</Pill3D>
        </div>
      </AbsoluteFill>
    </Win>
  );
};

// ============================================================ 11. Yang bahaya
export const Bahaya: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  return (
    <Win a={84.35} b={92.3}>
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 270}}>
        <div style={{...pop(P(84.54, 0.6, backOut), 0.4), transform: `${pop(P(84.54, 0.6, backOut), 0.4).transform} rotate(${Math.sin(fr / 8) * 3}deg)`}}>
          <svg width={240} height={215} viewBox="0 0 240 215">
            <path d="M120 14 L228 200 L12 200 Z" fill={ORANGE} stroke={ORANGE} strokeWidth={22} strokeLinejoin="round" />
            <path d="M120 14 L228 200 L12 200 Z" fill="none" stroke="#178077" strokeWidth={4} strokeLinejoin="round" transform="translate(0 10)" opacity={0.6} />
            <rect x={108} y={70} width={24} height={80} rx={12} fill="#fff" />
            <circle cx={120} cy={174} r={14} fill="#fff" />
          </svg>
        </div>
        <H1 size={120} color={ORANGE} style={{marginTop: 10, ...rise(P(84.66))}}>
          Yang bahaya…
        </H1>
        <div style={{display: 'flex', flexDirection: 'column', gap: 30, marginTop: 40, width: 900}}>
          {[
            {t: 86.0, a: 'Bila kita', b: 'berhenti berusaha'},
            {t: 87.92, a: 'dan mula anggap', b: 'dosa itu perkara biasa'},
          ].map((r) => (
            <Tilt key={r.t} p={P(r.t, 0.55, backOut)}>
              <Card tone="orange" style={{display: 'flex', alignItems: 'center', gap: 26}}>
                <svg width={70} height={70} viewBox="0 0 70 70" style={{flexShrink: 0}}>
                  <circle cx={35} cy={35} r={33} fill="#fff" />
                  <path d="M35 16 V40" stroke={ORANGE} strokeWidth={9} strokeLinecap="round" />
                  <circle cx={35} cy={53} r={5} fill={ORANGE} />
                </svg>
                <div style={{fontFamily: POP}}>
                  <div style={{fontWeight: 700, fontSize: 36, opacity: 0.85}}>{r.a}</div>
                  <div style={{fontWeight: 900, fontSize: 56, lineHeight: 1.08}}>{r.b}</div>
                </div>
              </Card>
            </Tilt>
          ))}
        </div>
      </AbsoluteFill>
    </Win>
  );
};

// ============================================================ 12. Teruskan + doa
export const Teruskan: React.FC = () => {
  const P = useP();
  const steps = [
    {t: 93.2, n: 'Teruskan solat'},
    {t: 94.56, n: 'Teruskan memperbaiki yang lain'},
  ];
  const ph2 = P(96.9, 0.6, easeInOut);
  return (
    <Win a={92.3} b={100.6}>
      <AbsoluteFill style={{...center, justifyContent: 'flex-start', paddingTop: 280, opacity: 1 - ph2}}>
        <H1 size={110} style={rise(P(92.52))}>
          Jadi…
        </H1>
        {/* tangga 3D */}
        <div style={{position: 'relative', width: 940, height: 760, marginTop: 30, perspective: 1600}}>
          {steps.map((s, i) => {
            const p = P(s.t, 0.6, backOut);
            return (
              <div
                key={s.n}
                style={{
                  position: 'absolute',
                  left: i * 180,
                  top: 470 - i * 340,
                  width: 760 - i * 40,
                  opacity: Math.min(1, p * 2),
                  transform: `translateY(${(1 - p) * 80}px) rotateX(12deg)`,
                }}
              >
                <div
                  style={{
                    borderRadius: 30,
                    padding: '34px 40px',
                    background: i ? 'linear-gradient(150deg,#6ed6ca,#2bb3a6)' : 'linear-gradient(150deg,#ffd77a,#f7b733)',
                    boxShadow: `0 30px 0 ${i ? '#137068' : '#a96c0a'}, 0 60px 70px rgba(20,90,85,0.3)`,
                    fontFamily: POP,
                    fontWeight: 900,
                    fontSize: 54,
                    color: '#fff',
                    lineHeight: 1.1,
                  }}
                >
                  {`${i + 1}. ${s.n}`}
                </div>
              </div>
            );
          })}
          <div style={{position: 'absolute', right: 40, top: 20, ...pop(P(95.4, 0.6, backOut), 0.3)}}>
            <Clay size={120} color="y" />
          </div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{...center, opacity: ph2, paddingBottom: 140}}>
        <Tilt p={ph2} amp={0.6}>
          <Card style={{width: 920, ...center, gap: 18, padding: '50px 50px'}}>
            <div style={{fontFamily: POP, fontWeight: 800, fontSize: 30, color: '#fff', background: ORANGE, borderRadius: 30, padding: '6px 22px', letterSpacing: 3}}>DOA</div>
            <Arab text="يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ" size={64} />
            <div style={{fontFamily: POP, fontWeight: 800, fontSize: 52, textAlign: 'center', lineHeight: 1.2}}>
              Semoga Allah tetapkan hati kita di atas <span style={{color: ORANGE}}>agama-Nya</span>
            </div>
            <div style={{fontFamily: POP, fontWeight: 600, fontSize: 28, color: MUTED}}>(Doa Nabi ﷺ — riwayat at-Tirmizi)</div>
          </Card>
        </Tilt>
      </AbsoluteFill>
    </Win>
  );
};

// ============================================================ 13. Penutup
export const Penutup: React.FC = () => {
  const fr = useCurrentFrame();
  const P = useP();
  const end = ci(fr, at(CLIP_END + 3.2), at(CLIP_END + 4.0), 1, 0);
  return (
    <Win a={100.6} b={CLIP_END + 4.1} fout={0.01}>
      <AbsoluteFill style={{...center, gap: 30, opacity: end, paddingBottom: 100}}>
        <div style={{fontFamily: ARAB, fontSize: 110, color: ORANGE, ...pop(P(100.76, 0.6, backOut), 0.6)}}>وَاللَّهُ أَعْلَمُ</div>
        <div style={{display: 'flex', ...pop(P(101.6, 0.6, backOut), 0.6)}}>
          <div style={{width: 300, height: 150, borderRadius: 36, background: 'linear-gradient(150deg,#6ed6ca,#2bb3a6)', boxShadow: '0 18px 0 #137068', ...center, fontFamily: POP, fontWeight: 900, fontSize: 68, color: '#fff'}}>IMAN</div>
          <div style={{width: 300, height: 150, borderRadius: 36, background: 'linear-gradient(150deg,#ffd77a,#f7b733)', boxShadow: '0 18px 0 #a96c0a', ...center, fontFamily: POP, fontWeight: 900, fontSize: 68, color: '#fff'}}>AMAL</div>
        </div>
        <H1 size={70} style={rise(P(102.0))}>
          Iman di hati, <span style={{color: ORANGE}}>dibuktikan dengan amal</span>
        </H1>
        <div style={{...rise(P(102.5))}}>
          <ClayCloud w={220} />
        </div>
      </AbsoluteFill>
    </Win>
  );
};

export const _unused = {FPS};
