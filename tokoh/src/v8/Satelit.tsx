// Pembukaan: satelit mengimbas bumi -> Semenanjung -> Dungun -> SK Sultan Omar -> dron tiba.
// Semua tulisan asal (AI / Google) ditutup dengan HUD Melayu yang dibina di sini.
import React from 'react';
import {AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import {ci, easeOut, FilmLook, SANS, Vignette} from '../components';

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);
const MONO = "'JetBrains Mono', monospace";
const CY = '#7ff3ff';
const CY2 = 'rgba(127,243,255,0.55)';
const GOLD = '#ffc440';

// garis masa (saat)
const T_SAT1 = 0;
const T_SAT2 = 2.8;
const T_BUMI = 5.3;
const T_GE = 9.6;
const T_ATAS = 12.5;
const T_DRON = 15.5;
const T_SEK = 18.8;
export const SATELIT_AKHIR = 25.3;
export const SATELIT_LEN = f(SATELIT_AKHIR);

const taip = (s: string, fr: number, mula: number, cps = 38) => s.slice(0, Math.max(0, Math.floor(((fr - f(mula)) / FPS) * cps)));

// panel kaca gelap: menutup tulisan asal sepenuhnya
const Panel: React.FC<{x: number; y: number; w: number; h: number; o?: number; children?: React.ReactNode}> = ({x, y, w, h, o = 1, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: o, background: 'linear-gradient(160deg, rgba(4,20,30,0.94), rgba(2,10,16,0.9))', border: `1.5px solid ${CY2}`, boxShadow: '0 0 24px rgba(0,200,255,0.18), inset 0 0 30px rgba(0,180,255,0.08)', backdropFilter: 'blur(8px)', padding: '14px 20px', boxSizing: 'border-box', overflow: 'hidden'}}>
    {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([a, b], i) => (
      <div key={i} style={{position: 'absolute', [a ? 'right' : 'left']: -1, [b ? 'bottom' : 'top']: -1, width: 16, height: 16, borderColor: CY, borderStyle: 'solid', borderWidth: `${b ? 0 : 3}px ${a ? 3 : 0}px ${b ? 3 : 0}px ${a ? 0 : 3}px`}} />
    ))}
    {children}
  </div>
);

const Baris: React.FC<{k: string; v: string; warna?: string}> = ({k, v, warna = '#e8fbff'}) => (
  <div style={{display: 'flex', fontFamily: MONO, fontSize: 21, lineHeight: '33px', whiteSpace: 'nowrap'}}>
    <span style={{color: CY2, width: 170}}>{k}</span>
    <span style={{color: CY2, width: 26}}>:</span>
    <span style={{color: warna}}>{v}</span>
  </div>
);

const Tajuk: React.FC<{t: string; s: string}> = ({t, s}) => (
  <div style={{marginBottom: 10}}>
    <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 3, color: CY, textShadow: '0 0 14px rgba(127,243,255,0.7)', whiteSpace: 'nowrap'}}>{t}</div>
    <div style={{fontFamily: MONO, fontSize: 15, letterSpacing: 5, color: CY2, whiteSpace: 'nowrap'}}>{s}</div>
  </div>
);

const Bar: React.FC<{p: number; w?: number}> = ({p, w = 300}) => (
  <div style={{display: 'flex', gap: 3, width: w}}>
    {Array.from({length: 20}, (_, i) => (
      <div key={i} style={{flex: 1, height: 16, transform: 'skewX(-20deg)', background: i / 20 < p ? CY : 'rgba(127,243,255,0.14)', boxShadow: i / 20 < p ? '0 0 8px rgba(127,243,255,0.8)' : 'none'}} />
    ))}
  </div>
);

// penanda sasaran (mengecil & mengunci)
const Retikel: React.FC<{x: number; y: number; s: number; kunci: number; label?: string; sub?: string; fr: number}> = ({x, y, s, kunci, label, sub, fr}) => {
  const c = kunci > 0.99 ? GOLD : CY;
  const sz = s * (1 + 1.4 * (1 - kunci));
  const putar = (1 - kunci) * 90;
  const kelip = kunci > 0.99 ? 0.75 + 0.25 * Math.sin(fr * 0.9) : 1;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0}}>
      <div style={{position: 'absolute', left: -sz / 2, top: -sz / 2, width: sz, height: sz, transform: `rotate(${putar}deg)`, opacity: kelip}}>
        {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([a, b], i) => (
          <div key={i} style={{position: 'absolute', [a ? 'right' : 'left']: 0, [b ? 'bottom' : 'top']: 0, width: sz * 0.28, height: sz * 0.28, borderColor: c, borderStyle: 'solid', borderWidth: `${b ? 0 : 3}px ${a ? 3 : 0}px ${b ? 3 : 0}px ${a ? 0 : 3}px`, filter: `drop-shadow(0 0 6px ${c})`}} />
        ))}
        <div style={{position: 'absolute', left: sz / 2 - 1, top: sz * 0.32, width: 2, height: sz * 0.36, background: c}} />
        <div style={{position: 'absolute', top: sz / 2 - 1, left: sz * 0.32, height: 2, width: sz * 0.36, background: c}} />
      </div>
      {label ? (
        <div style={{position: 'absolute', left: s / 2 + 30, top: -s / 2 - 64, opacity: ci(kunci, 0.6, 1)}}>
          <div style={{position: 'absolute', left: -30, top: 64, width: 30, height: 2, background: c, transform: 'rotate(-40deg)', transformOrigin: 'left'}} />
          <div style={{background: 'rgba(3,14,22,0.92)', border: `1.5px solid ${c}`, padding: '8px 16px', whiteSpace: 'nowrap', boxShadow: `0 0 18px ${c}55`}}>
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 2, color: c}}>{label}</div>
            {sub ? <div style={{fontFamily: MONO, fontSize: 16, letterSpacing: 2, color: '#d8f6ff'}}>{sub}</div> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
};

// lapisan skrin: bingkai, garisan imbas, kod masa
const Skrin: React.FC<{fr: number}> = ({fr}) => {
  const s = fr / FPS;
  const tc = `${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(2).padStart(5, '0')}`;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.13) 0px, rgba(0,0,0,0.13) 1px, transparent 1px, transparent 3px)', mixBlendMode: 'multiply'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: ((fr * 9) % 1300) - 110, height: 110, background: 'linear-gradient(180deg, transparent, rgba(127,243,255,0.06), transparent)'}} />
      {[[30, 30], [1890, 30], [30, 1050], [1890, 1050]].map(([x, y], i) => (
        <div key={i} style={{position: 'absolute', left: x - (x > 900 ? 46 : 0), top: y - (y > 500 ? 46 : 0), width: 46, height: 46, borderColor: CY2, borderStyle: 'solid', borderWidth: `${y > 500 ? 0 : 2}px ${x > 900 ? 2 : 0}px ${y > 500 ? 2 : 0}px ${x > 900 ? 0 : 2}px`}} />
      ))}
      <div style={{position: 'absolute', left: 62, bottom: 44, fontFamily: MONO, fontSize: 18, color: CY2, letterSpacing: 2, display: 'flex', alignItems: 'center', gap: 10}}>
        <span style={{width: 10, height: 10, borderRadius: 5, background: '#ff3b3b', opacity: Math.floor(fr / 15) % 2 ? 1 : 0.2}} />
        REC · SAT-SO26 · {tc}
      </div>
    </AbsoluteFill>
  );
};

const Klip: React.FC<{src: string; z?: [number, number]; ox?: string; rate?: number}> = ({src, z = [1, 1.04], ox = '50% 50%', rate = 1}) => {
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${interpolate(fr, [0, f(5)], z, {extrapolateRight: 'extend'})})`, transformOrigin: ox}}>
        <OffthreadVideo src={staticFile(src)} muted playbackRate={rate} style={{width: 1920, height: 1080}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Kilat: React.FC<{d?: number; kuat?: number}> = ({d = 8, kuat = 1}) => {
  const fr = useCurrentFrame();
  return <AbsoluteFill style={{background: '#fff', opacity: kuat * (1 - ci(fr, 0, d))}} />;
};

// ---------------------------------------------------------------- babak
const BabakSatelit: React.FC = () => {
  const fr = useCurrentFrame();
  const o = ci(fr, 8, 20);
  return (
    <AbsoluteFill>
      <Panel x={60} y={64} w={560} h={220} o={o}>
        <Tajuk t="MATA SATELIT" s="SISTEM PEMERHATIAN BUMI" />
        <Baris k="ORBIT" v={taip('412 KM · LEO', fr, 0.8)} />
        <Baris k="PAUTAN" v={taip(fr < f(2.0) ? 'MENYAMBUNG...' : 'STABIL', fr, 1.1)} warna={fr < f(2.0) ? GOLD : CY} />
        <Baris k="MISI" v={taip('OPERASI TOKOH MURID 2026', fr, 1.6)} />
      </Panel>
    </AbsoluteFill>
  );
};

const BabakKanta: React.FC = () => {
  const fr = useCurrentFrame();
  const p = ci(fr, 0, f(2.3));
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', fontFamily: MONO, fontSize: 26, letterSpacing: 10, color: CY, textShadow: '0 0 12px #7ff3ff'}}>
        {taip('KANTA OPTIK DIAKTIFKAN', fr, 0.1, 30)}
      </div>
      <div style={{position: 'absolute', left: 810, top: 910}}>
        <Bar p={p} />
      </div>
    </AbsoluteFill>
  );
};

const BabakBumi: React.FC = () => {
  const fr = useCurrentFrame();
  const p = ci(fr, 0, f(4.3));
  const lbl = ci(fr, f(2.9), f(3.3));
  return (
    <AbsoluteFill>
      {/* tutup panel kiri atas & kanan atas klip asal */}
      <Panel x={36} y={32} w={540} h={290}>
        <Tajuk t="MATA SATELIT" s="MOD IMBASAN KAWASAN LUAS" />
        <Baris k="ALTITUD" v={`${Math.round(412 - 140 * p)} KM`} />
        <Baris k="RESOLUSI" v="TINGGI" />
        <Baris k="WILAYAH" v={taip('ASIA TENGGARA', fr, 0.6)} />
        <Baris k="STATUS" v={Math.floor(fr / 10) % 2 ? 'MENGIMBAS...' : 'MENGIMBAS'} warna={CY} />
      </Panel>
      <Panel x={1450} y={30} w={440} h={132}>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: 3, color: '#dff', marginBottom: 10}}>IMBASAN KAWASAN</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <Bar p={p} w={290} />
          <span style={{fontFamily: MONO, fontSize: 30, color: CY}}>{Math.round(p * 100)}%</span>
        </div>
      </Panel>
      {/* jalur longitud (betul) menutup angka asal yang salah */}
      <div style={{position: 'absolute', left: 120, right: 120, top: 942, height: 100, background: 'linear-gradient(180deg, rgba(2,10,16,0), rgba(2,10,16,0.92) 30%, rgba(2,10,16,0.92) 70%, rgba(2,10,16,0))'}} />
      <div style={{position: 'absolute', left: 160, right: 160, top: 972, height: 2, background: CY2}} />
      {['100°T', '101°T', '102°T', '103°T', '104°T', '105°T'].map((t, i) => (
        <div key={t} style={{position: 'absolute', left: 300 + i * 270, top: 962, fontFamily: MONO, fontSize: 20, color: '#cfefff'}}>
          <div style={{position: 'absolute', left: 30, top: -2, width: 2, height: 14, background: CY}} />
          <div style={{marginTop: 18}}>{t}</div>
        </div>
      ))}
      {/* label negara yang salah ejaan ditutup */}
      <div style={{position: 'absolute', left: 640, top: 594, opacity: lbl, background: 'rgba(3,14,22,0.95)', border: `1.5px solid ${CY}`, padding: '10px 20px', fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 6, color: '#e8fbff', whiteSpace: 'nowrap'}}>
        SEMENANJUNG MALAYSIA
      </div>
    </AbsoluteFill>
  );
};

const BabakGE: React.FC = () => {
  const fr = useCurrentFrame();
  const p = ci(fr, 0, f(2.9));
  const alt = 412 * Math.pow(1 - p, 3) + 0.85;
  return (
    <AbsoluteFill>
      {/* label & pin asal Google ditutup sepenuhnya */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 60, background: 'linear-gradient(180deg, rgba(2,10,16,0.95), rgba(2,10,16,0))'}} />
      <div style={{position: 'absolute', left: 1118, top: 452, width: 236, height: 96, background: 'rgba(3,14,22,0.9)', filter: 'blur(6px)', borderRadius: 18}} />
      <Retikel x={1224} y={512} s={120} kunci={ci(fr, f(0.4), f(2.4))} label="SASARAN" sub="DUNGUN · TERENGGANU" fr={fr} />
      <div style={{position: 'absolute', left: 1224 - 7, top: 512 - 7, width: 14, height: 14, borderRadius: 7, background: GOLD, boxShadow: `0 0 18px 6px ${GOLD}aa`}} />
      <Panel x={36} y={32} w={560} h={250}>
        <Tajuk t="PENJEJAKAN SASARAN" s="ZUM ORBIT → DARAT" />
        <Baris k="ALTITUD" v={`${alt.toFixed(alt < 10 ? 2 : 0)} KM`} warna={GOLD} />
        <Baris k="KOORDINAT" v={`4°${(45 + 0.92 * p).toFixed(1)}'U  103°${(25.2 * p).toFixed(1)}'T`} />
        <Baris k="LOKASI" v={p > 0.62 ? 'KUALA DUNGUN' : p > 0.38 ? 'TERENGGANU' : p > 0.15 ? 'MALAYSIA' : 'ASIA TENGGARA'} />
      </Panel>
    </AbsoluteFill>
  );
};

const BabakAtas: React.FC = () => {
  const fr = useCurrentFrame();
  const L = f(3.0);
  const z = interpolate(fr, [0, L], [1.0, 1.42], {easing: easeOut});
  // sekolah dalam imej: (0.537, 0.55) -> bergerak ke tengah
  const tx = interpolate(fr, [0, L], [-0.1, -0.037], {easing: easeOut});
  const kunci = ci(fr, f(0.6), f(1.8));
  const imbas = (fr * 26) % 1200;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${z}) translate(${tx * 100}%, ${-0.05 * 100}%)`, transformOrigin: '50% 50%'}}>
        <Img src={staticFile('v8/satelit/atas.jpg')} style={{width: 1920, height: 1080, filter: 'contrast(1.08) saturate(1.05)'}} />
      </AbsoluteFill>
      {/* grid imbasan */}
      <AbsoluteFill style={{backgroundImage: `linear-gradient(${CY}22 1px, transparent 1px), linear-gradient(90deg, ${CY}22 1px, transparent 1px)`, backgroundSize: '96px 96px'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: imbas - 60, height: 4, background: CY, boxShadow: `0 0 30px 10px ${CY}66`, opacity: fr < f(1.9) ? 0.8 : 0}} />
      {/* kotak bangunan dikesan */}
      {[[640, 380, 180, 90, 0.5], [1150, 600, 220, 110, 0.7], [700, 690, 260, 80, 0.9], [1250, 330, 160, 120, 1.1]].map(([x, y, w, h, t], i) => (
        <div key={i} style={{position: 'absolute', left: x, top: y, width: w, height: h, border: `1.5px dashed ${CY}`, opacity: ci(fr, f(t), f(t) + 4) * (1 - ci(fr, f(2.2), f(2.4)))}}>
          <div style={{position: 'absolute', top: -24, left: 0, fontFamily: MONO, fontSize: 15, color: CY}}>BLK-{String.fromCharCode(65 + i)} · {(92 + i * 2.1).toFixed(1)}%</div>
        </div>
      ))}
      <Retikel x={960} y={560} s={200} kunci={kunci} label="SK SULTAN OMAR" sub="SASARAN DIKENAL PASTI · DUNGUN, TERENGGANU" fr={fr} />
      <Panel x={36} y={32} w={560} h={215}>
        <Tajuk t="PENGESAHAN SASARAN" s="IMEJ SATELIT RESOLUSI TINGGI" />
        <Baris k="PADANAN" v={`${Math.round(60 + 39.6 * kunci)}%`} warna={kunci > 0.99 ? GOLD : CY} />
        <Baris k="STATUS" v={kunci > 0.99 ? 'SASARAN DIKUNCI' : 'MENGANALISIS...'} warna={kunci > 0.99 ? GOLD : '#e8fbff'} />
      </Panel>
      {fr > f(2.2) ? (
        <div style={{position: 'absolute', left: 0, right: 0, top: 930, textAlign: 'center'}}>
          <span style={{background: 'rgba(3,14,22,0.92)', border: `1.5px solid ${GOLD}`, padding: '12px 30px', fontFamily: MONO, fontSize: 26, letterSpacing: 8, color: GOLD, opacity: Math.floor(fr / 5) % 2 ? 1 : 0.55}}>
            {taip('MENGERAHKAN DRON PENGINTIP...', fr, 2.2, 40)}
          </span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

const BabakDron: React.FC = () => {
  const fr = useCurrentFrame();
  const o = ci(fr, f(0.6), f(0.9));
  return (
    <AbsoluteFill style={{opacity: o}}>
      <Panel x={60} y={64} w={600} h={180}>
        <Tajuk t="DRON DILANCARKAN" s="UNIT PENGINTIP · DE-07" />
        <Baris k="LALUAN" v={taip('KUALA TERENGGANU → DUNGUN', fr, 1.0)} />
        <Baris k="JARAK" v={`${Math.max(0, 80 - Math.round((fr / f(3.3)) * 6))} KM`} warna={GOLD} />
      </Panel>
    </AbsoluteFill>
  );
};

const BabakSekolah: React.FC = () => {
  const fr = useCurrentFrame();
  const L = f(6.5);
  const p = ci(fr, 0, L - f(0.8));
  const kunci = fr > L - f(1.4);
  return (
    <AbsoluteFill>
      {/* tutup panel kiri atas */}
      <Panel x={14} y={26} w={470} h={282}>
        <Tajuk t="MATA DRON" s="PENGINTIPAN UDARA" />
        <Baris k="MOD" v="MENJEJAK" />
        <Baris k="LOKASI" v="DUNGUN, TERENGGANU" />
        <Baris k="SASARAN" v="SK SULTAN OMAR" warna={GOLD} />
        <Baris k="STATUS" v={kunci ? 'TIBA' : 'MENGHAMPIRI'} warna={CY} />
      </Panel>
      {/* tutup panel kanan atas */}
      <Panel x={1576} y={28} w={334} h={194}>
        <Baris k="PAUTAN" v="▮▮▮▮ KUAT" />
        <Baris k="BATERI" v="67%" />
        <Baris k="GPS" v="DIKUNCI" warna={CY} />
        <Baris k="ALT" v={`${Math.round(120 - 60 * p)} M`} />
      </Panel>
      {/* tutup label imbasan tengah kanan */}
      <Panel x={1396} y={426} w={352} h={130}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 3, color: CY}}>◉ MENGIMBAS</div>
        <div style={{fontFamily: MONO, fontSize: 18, color: '#d8f6ff', marginTop: 4}}>{taip('BANGUNAN · DEWAN · PADANG', fr, 0.5, 26)}</div>
      </Panel>
      {/* tutup panel kanan bawah */}
      <Panel x={1404} y={830} w={508} h={222}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: 2, color: kunci ? GOLD : '#e8fbff'}}>SK SULTAN OMAR</div>
        <div style={{fontFamily: MONO, fontSize: 18, letterSpacing: 3, color: CY2, marginBottom: 14}}>DUNGUN · TERENGGANU</div>
        <Bar p={p} w={460} />
        <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: 4, color: kunci ? GOLD : CY, marginTop: 14, opacity: kunci && Math.floor(fr / 6) % 2 ? 0.5 : 1}}>
          {kunci ? 'SASARAN DIKUNCI · 100%' : `PENDEKATAN AKHIR · ${Math.round(p * 100)}%`}
        </div>
      </Panel>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- bunyi
type Sfx = [number, string, number];
const SFX: Sfx[] = [
  [0.0, 'sfx/dengung', 0.5],
  [0.3, 'sfx/hud_boot', 0.55],
  [0.9, 'sfx/taip', 0.25],
  [2.0, 'sfx/bip', 0.35],
  [T_SAT2 - 0.1, 'sfx/whoosh_pendek', 0.35],
  [T_SAT2 + 0.2, 'sfx/data', 0.35],
  [T_BUMI - 0.25, 'sfx/warp', 0.5],
  [T_BUMI, 'sfx/impact_lembut', 0.6],
  [T_BUMI + 0.4, 'sfx/imbasan', 0.45],
  [T_BUMI + 3.0, 'sfx/blip', 0.4],
  [T_GE - 0.1, 'sfx/whoosh_panjang', 0.55],
  [T_GE + 0.3, 'sfx/riser', 0.35],
  [T_ATAS, 'sfx/kamera', 0.5],
  [T_ATAS + 0.2, 'sfx/imbasan', 0.45],
  [T_ATAS + 1.8, 'sfx/amaran', 0.35],
  [T_ATAS + 1.8, 'sfx/impact_lembut', 0.6],
  [T_ATAS + 2.2, 'sfx/taip', 0.25],
  [T_DRON - 0.1, 'sfx/whoosh_panjang', 0.45],
  [T_DRON + 0.6, 'sfx/hum', 0.35],
  [T_SEK - 0.1, 'sfx/whoosh_pendek', 0.4],
  [T_SEK + 0.4, 'sfx/data', 0.3],
  [SATELIT_AKHIR - 3.2, 'sfx/riser', 0.45],
  [SATELIT_AKHIR - 1.4, 'sfx/bip', 0.5],
  [SATELIT_AKHIR - 1.4, 'sfx/stinger', 0.5],
  [SATELIT_AKHIR - 0.45, 'sfx/sedutan', 0.5],
];

export const Satelit: React.FC = () => {
  const fr = useCurrentFrame();
  const putih = ci(fr, f(SATELIT_AKHIR - 0.45), f(SATELIT_AKHIR));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence from={f(T_SAT1)} durationInFrames={f(T_SAT2 - T_SAT1)}>
        <Klip src="v8/satelit/sat1.mp4" z={[1, 1.06]} />
        <BabakSatelit />
      </Sequence>
      <Sequence from={f(T_SAT2)} durationInFrames={f(T_BUMI - T_SAT2)}>
        <Klip src="v8/satelit/sat2.mp4" z={[1, 1.12]} />
        <BabakKanta />
      </Sequence>
      <Sequence from={f(T_BUMI)} durationInFrames={f(T_GE - T_BUMI)}>
        <Klip src="v8/satelit/bumi.mp4" z={[1, 1.03]} />
        <BabakBumi />
        <Kilat d={10} />
      </Sequence>
      <Sequence from={f(T_GE)} durationInFrames={f(T_ATAS - T_GE)}>
        <Klip src="v8/satelit/ge_turun.mp4" z={[1, 1]} />
        <BabakGE />
        <Kilat d={6} kuat={0.6} />
      </Sequence>
      <Sequence from={f(T_ATAS)} durationInFrames={f(T_DRON - T_ATAS)}>
        <BabakAtas />
        <Kilat d={6} kuat={0.5} />
      </Sequence>
      <Sequence from={f(T_DRON)} durationInFrames={f(T_SEK - T_DRON)}>
        <Klip src="v8/satelit/dron_kt.mp4" z={[1, 1.05]} />
        <BabakDron />
      </Sequence>
      <Sequence from={f(T_SEK)} durationInFrames={f(SATELIT_AKHIR - T_SEK)}>
        <Klip src="v8/satelit/sekolah.mp4" z={[1, 1.04]} />
        <BabakSekolah />
      </Sequence>
      <Skrin fr={fr} />
      <Vignette strength={0.5} />
      <FilmLook />
      <AbsoluteFill style={{background: '#000', opacity: 1 - ci(fr, 0, 12)}} />
      <AbsoluteFill style={{background: '#fff', opacity: putih}} />
      {SFX.map(([t, file, v], i) => (
        <Sequence key={i} from={f(t)}>
          <Audio src={staticFile(`${file}.wav`)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
