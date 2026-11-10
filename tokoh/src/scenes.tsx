import React from 'react';
import {AbsoluteFill, Easing, Img, OffthreadVideo, random, staticFile, useCurrentFrame} from 'remotion';
import {
  Badge, Caption, ci, Confetti, cutLayout, easeInOut, easeOut, Embers, faceUnion, Flash, Glow, Gold, GOLD, GOLD_GRAD,
  KenBurns, Letterbox, pickCaptionSlot, Rays, SANS, SERIF, Stars, Vignette,
} from './components';
import {
  CUT_GRAD, CUT_STAND, f, H, KEBANGSAAN, KELAS, NAMA_1, NAMA_2, NAMA_BIN, NAMA_PENUH, PHOTOS, Rect, Shot, SIFAT, SIFAT_MASA, STATS, T, W,
} from './data';
import {Brackets, CYAN, CYAN_DIM, DataStream, fadeInOut, GlitchBands, GlitchText, HexGrid, HudRings, MONO, ORB, ProgressBar, RadarSweep, RED, Scanlines, Scramble, TypedLine} from './scifi';

const darkBg = (c1 = '#1b1430', c2 = '#030208', at = '50% 50%') => ({background: `radial-gradient(ellipse at ${at}, ${c1} 0%, ${c2} 75%)`});

// ============================================================ 1. PEMBUKAAN SCI-FI
export const SceneBuka: React.FC = () => {
  const fr = useCurrentFrame();
  const boot = ci(fr, f(0.8), f(2.0), 0, 1, easeOut);
  const scanP = ci(fr, f(2.6), f(8.8), 0, 1, Easing.inOut(Easing.quad));
  const found = fr >= f(8.9);
  const foundP = ci(fr, f(8.9), f(9.2));
  const glitchEnd = ci(fr, f(10.3), f(11.1));
  const gate = fr >= f(11.1) ? 0 : 1;
  const pulse = found ? 0.6 + 0.4 * Math.abs(Math.sin((fr - f(8.9)) / 4)) : 1;
  const ringCol = found ? GOLD : CYAN;
  const firstFlash = fr >= f(0.8) && fr < f(0.8) + 5;
  return (
    <AbsoluteFill style={{background: '#010409', opacity: gate}}>
      <AbsoluteFill style={{opacity: boot}}>
        <HexGrid opacity={0.18} />
        <RadarSweep cx={960} cy={470} r={250} opacity={found ? 0 : 0.5} />
        <HudRings cx={960} cy={470} r={260} p={boot} color={ringCol} />
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 140}}>
          {found ? (
            <div style={{opacity: pulse}}>
              <GlitchText size={120} color={GOLD} intensity={0.25 + glitchEnd * 0.8} seed="satu">1</GlitchText>
            </div>
          ) : (
            <div style={{fontFamily: ORB, fontWeight: 700, fontSize: 92, color: CYAN, textShadow: `0 0 20px ${CYAN}`, opacity: ci(fr, f(2.6), f(2.9))}}>
              {String(Math.round(scanP * 100)).padStart(2, '0')}%
            </div>
          )}
        </AbsoluteFill>
        <div style={{position: 'absolute', left: 110, top: 150}}>
          <TypedLine start={f(1.0)} text="> SISTEM ARKIB SK SULTAN OMAR · DALAM TALIAN" />
          <TypedLine start={f(2.2)} text="> MENGIMBAS REKOD MURID TAHUN 6 · 2026" />
          <TypedLine start={f(6.2)} text="> MENGANALISIS: KEPIMPINAN · SUKAN · SAHSIAH · ILMU" />
          <TypedLine start={f(7.7)} text="> MENAPIS CALON..." />
          {found ? <TypedLine start={f(9.0)} text="> PADANAN DISAHKAN. MEMBUKA FAIL..." color={GOLD} /> : null}
        </div>
        <DataStream x={1530} y={170} rows={22} seed="buka" opacity={0.55} />
        {found ? (
          <div style={{position: 'absolute', left: 0, width: W, top: 800, display: 'flex', justifyContent: 'center', opacity: foundP * pulse}}>
            <GlitchText size={64} color={GOLD} intensity={0.3 + glitchEnd * 0.7} seed="pad" spacing={10}>PADANAN DITEMUI</GlitchText>
          </div>
        ) : (
          <ProgressBar x={560} y={800} w={800} p={scanP} label="IMBASAN REKOD" />
        )}
      </AbsoluteFill>
      {found ? <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 40%, rgba(255,170,40,0.25) 100%)', opacity: pulse * (1 - glitchEnd)}} /> : null}
      <GlitchBands intensity={firstFlash ? 0.9 : found && fr < f(9.2) ? 0.8 : glitchEnd} />
      <Scanlines />
      <Vignette strength={0.75} />
    </AbsoluteFill>
  );
};

// ============================================================ 2. TAJUK ANUGERAH
export const SceneTajuk: React.FC = () => {
  const fr = useCurrentFrame();
  const hit = f(T.tajukHit - T.tajuk);
  const dur = f(T.dron - T.tajuk);
  const slam = ci(fr, hit, hit + 10, 0, 1, easeOut);
  const logo = ci(fr, hit + 4, hit + 24, 0, 1, easeOut);
  const shine = ci(fr, hit + 14, hit + 50);
  const sub = ci(fr, hit + f(1.3), hit + f(1.9), 0, 1, easeOut);
  const out = 1 - ci(fr, dur - 12, dur);
  const shake = fr >= hit && fr < hit + 8 ? (random('sh' + fr) - 0.5) * 16 * (1 - (fr - hit) / 8) : 0;
  return (
    <AbsoluteFill style={{...darkBg('#20183a', '#020106'), opacity: out}}>
      <Stars n={240} drift={10} opacity={ci(fr, 0, hit)} />
      <HexGrid opacity={0.07} />
      <HudRings cx={W / 2} cy={H / 2 + 20} r={430} p={ci(fr, hit, hit + 30)} color={GOLD} />
      <Glow cx={W / 2} cy={H / 2} r={700} opacity={0.4 * slam} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
        <Img src={staticFile('img/logo.png')} style={{height: 140, opacity: logo, transform: `translateY(${-30 * (1 - logo)}px)`, marginBottom: 22, filter: 'drop-shadow(0 0 24px rgba(255,200,100,0.35))'}} />
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 32, letterSpacing: 20, color: '#e9dcc0', opacity: slam, marginBottom: 8}}>ANUGERAH</div>
        <div style={{transform: `scale(${1.6 - 0.6 * slam})`, opacity: slam}}>
          <Gold size={150} spacing={8} shine={shine}>TOKOH MURID</Gold>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 14, opacity: slam}}>
          <div style={{width: 160 * slam, height: 2, background: GOLD_GRAD}} />
          <Gold size={54} spacing={14} weight={700}>2026</Gold>
          <div style={{width: 160 * slam, height: 2, background: GOLD_GRAD}} />
        </div>
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 28, letterSpacing: 5, color: '#cfc6b3', marginTop: 34, opacity: sub}}>
          MAJLIS APRESIASI TAHUN 6 · SK SULTAN OMAR
        </div>
      </AbsoluteFill>
      <Flash at={hit} len={10} max={0.6} />
      <Scanlines opacity={0.15} />
      <Letterbox />
      <Vignette />
    </AbsoluteFill>
  );
};

// ============================================================ 3. DI BUMI BERTUAH INI (dron)
export const SceneDron: React.FC = () => {
  const fr = useCurrentFrame();
  const inn = ci(fr, 0, 12);
  const t1 = ci(fr, f(0.6), f(1.3), 0, 1, easeOut) * (1 - ci(fr, f(3.4), f(3.9)));
  const lt = ci(fr, f(4.0), f(4.6), 0, 1, easeOut) * (1 - ci(fr, f(6.3), f(6.8)));
  const t2 = ci(fr, f(6.9), f(7.6), 0, 1, easeOut) * (1 - ci(fr, f(9.3), f(9.9)));
  return (
    <AbsoluteFill style={{background: '#000', opacity: inn}}>
      <OffthreadVideo src={staticFile('video/intro_dron.mp4')} muted />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 50%), linear-gradient(0deg, rgba(0,0,0,0.6) 0%, transparent 35%)'}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: t1}}>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 76, color: '#fff', letterSpacing: 3, textShadow: '0 4px 28px rgba(0,0,0,0.9)', transform: `translateY(${16 * (1 - t1)}px)`, filter: `blur(${(1 - t1) * 8}px)`}}>
          Di bumi bertuah ini...
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 110, bottom: 110, display: 'flex', alignItems: 'center', gap: 28, opacity: lt, transform: `translateX(${-50 * (1 - lt)}px)`}}>
        <Img src={staticFile('img/logo.png')} style={{height: 130, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.7))'}} />
        <div>
          <div style={{width: 80 * lt, height: 3, background: GOLD_GRAD, marginBottom: 12}} />
          <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: 46, color: '#fff', textShadow: '0 3px 14px rgba(0,0,0,0.9)'}}>Sekolah Kebangsaan Sultan Omar</div>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: 6, color: GOLD, marginTop: 6, textShadow: '0 2px 10px rgba(0,0,0,0.9)'}}>DUNGUN · TERENGGANU</div>
        </div>
      </div>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: t2}}>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 76, color: '#fff', letterSpacing: 3, textShadow: '0 4px 28px rgba(0,0,0,0.9)', transform: `translateY(${16 * (1 - t2)}px)`, filter: `blur(${(1 - t2) * 8}px)`}}>
          ...lahir seorang bintang.
        </div>
      </AbsoluteFill>
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};

// ============================================================ 4. FAIL SULIT (sifat sahaja, tiada butiran)
export const SceneFail: React.FC = () => {
  const fr = useCurrentFrame();
  const dur = f(T.siluet - T.fail);
  const inn = ci(fr, 0, 14);
  const decP = ci(fr, f(0.5), dur - f(2.2));
  const ok = fr >= dur - f(2.0);
  const okP = ci(fr, dur - f(2.0), dur - f(1.7));
  const glitchOut = ci(fr, dur - f(0.8), dur);
  const panel = ci(fr, f(0.2), f(0.9), 0, 1, easeOut);
  // indeks sifat aktif ikut hentakan muzik
  const local = SIFAT_MASA.map((t) => f(t - T.fail));
  let k = -1;
  local.forEach((s, i) => {
    if (fr >= s) k = i;
  });
  const kStart = k >= 0 ? local[k] : 0;
  const kEnd = k >= 0 ? (k < 2 ? local[k + 1] : dur - f(2.2)) : 0;
  const wordP = k >= 0 ? fadeInOut(fr, kStart, kEnd - 4, 6) : 0;
  const wordGlitch = k >= 0 ? Math.max(0, 1 - (fr - kStart) / 10) : 0;
  return (
    <AbsoluteFill style={{background: '#010409', opacity: inn * (1 - glitchOut)}}>
      <Stars n={160} seed="fail" opacity={0.5} />
      {SIFAT.map((s, i) => {
        const o = i === k ? fadeInOut(fr, local[i], i < 2 ? local[i + 1] : dur - f(2.2), 10) : 0;
        return o > 0 ? (
          <Img key={i} src={staticFile(s.bg)} style={{position: 'absolute', width: W, height: H, opacity: o * 0.45, filter: 'grayscale(1) sepia(1) hue-rotate(155deg) saturate(2.2) brightness(0.8)', transform: `scale(${1.15 - 0.08 * ((fr - local[i]) / 160)})`}} />
        ) : null;
      })}
      <HexGrid opacity={0.14} />
      {/* tajuk fail */}
      <div style={{position: 'absolute', left: 140, top: 120, display: 'flex', alignItems: 'center', gap: 22, opacity: panel}}>
        <div style={{fontFamily: ORB, fontWeight: 700, fontSize: 26, letterSpacing: 8, color: CYAN, textShadow: `0 0 10px ${CYAN}`}}>FAIL TOKOH MURID · 2026</div>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 20, color: '#fff', background: RED, padding: '4px 12px', letterSpacing: 4, opacity: 0.6 + 0.4 * Math.abs(Math.sin(fr / 8))}}>SULIT</div>
      </div>
      {/* kad identiti */}
      <div style={{position: 'absolute', left: 140, top: 210, width: 760, height: 470, border: `1.5px solid ${CYAN_DIM}`, background: 'linear-gradient(160deg, rgba(98,230,255,0.08), rgba(98,230,255,0.02))', opacity: panel, transform: `translateX(${-40 * (1 - panel)}px)`, boxShadow: '0 0 40px rgba(98,230,255,0.12)'}}>
        <div style={{position: 'absolute', left: 36, top: 40, width: 220, height: 280, border: `1.5px solid ${CYAN_DIM}`, overflow: 'hidden', background: 'rgba(0,0,0,0.5)'}}>
          <svg width={220} height={280} viewBox="0 0 220 280">
            <path d="M110 40c30 0 48 22 48 52s-18 56-48 56-48-26-48-56 18-52 48-52zM20 280c4-70 42-104 90-104s86 34 90 104z" fill="rgba(98,230,255,0.18)" />
            <text x="110" y="120" textAnchor="middle" fontFamily="Orbitron" fontWeight="900" fontSize="64" fill={ok ? GOLD : CYAN}>?</text>
          </svg>
          {Array.from({length: 14}).map((_, i) => (
            <div key={i} style={{position: 'absolute', left: 0, top: random(`st-${i}-${Math.floor(fr / 2)}`) * 280, width: 220, height: 2, background: 'rgba(98,230,255,0.35)'}} />
          ))}
        </div>
        <div style={{position: 'absolute', left: 290, top: 44, fontFamily: MONO, fontSize: 24, color: '#d8f8ff', lineHeight: '50px'}}>
          <div><span style={{color: CYAN_DIM}}>NAMA   : </span><Scramble text="██████ █████ ███ ███████" reveal={0} seed="nm" /></div>
          <div><span style={{color: CYAN_DIM}}>KELAS  : </span><Scramble text="█ ████ █████" reveal={0} seed="kl" /></div>
          <div><span style={{color: CYAN_DIM}}>STATUS : </span><span style={{color: ok ? GOLD : '#fff'}}>{ok ? 'DISAHKAN' : 'DISULITKAN'}</span></div>
          <div><span style={{color: CYAN_DIM}}>SIFAT  : </span><span style={{color: GOLD}}>{SIFAT.slice(0, k + 1).map((s) => s.kata).join(' · ') || '...'}</span></div>
        </div>
        <ProgressBar x={36} y={360} w={688} p={decP} label="PENYAHSULITAN" color={ok ? GOLD : CYAN} />
      </div>
      <DataStream x={1560} y={720} rows={9} seed="fail" opacity={0.4} />
      {/* sifat - kata besar */}
      <div style={{position: 'absolute', left: 980, top: 300, width: 860, height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: wordP}}>
        <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 8, color: CYAN, marginBottom: 18}}>SIFAT DIKESAN</div>
        {k >= 0 ? (
          <GlitchText size={SIFAT[k].kata.length > 10 ? 78 : 104} color={GOLD} intensity={0.15 + wordGlitch * 0.85} seed={'w' + k} spacing={6}>
            {SIFAT[k].kata}
          </GlitchText>
        ) : null}
      </div>
      {ok ? (
        <div style={{position: 'absolute', left: 0, width: W, top: 790, display: 'flex', justifyContent: 'center', opacity: okP}}>
          <GlitchText size={66} color={GOLD} intensity={0.3 + glitchOut} seed="ok" spacing={12}>IDENTITI DISAHKAN</GlitchText>
        </div>
      ) : null}
      <GlitchBands intensity={Math.max(wordGlitch * 0.7, glitchOut, ok && fr < dur - f(1.7) ? 0.7 : 0)} seed="fb" />
      <Scanlines />
      <Letterbox />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};

// ============================================================ 4. SILUET (bangkit dari abu)
export const SceneSiluet: React.FC = () => {
  const fr = useCurrentFrame();
  const t = ci(fr, f(4.4), f(5.1), 0, 1, easeOut);
  const out = 1 - ci(fr, f(T.siluetLen) - 6, f(T.siluetLen));
  return (
    <AbsoluteFill style={{background: '#000', opacity: out}}>
      <OffthreadVideo src={staticFile('video/siluet.mp4')} muted />
      {/* garis imbasan sci-fi menyapu badan */}
      {fr >= f(3.6) && fr < f(4.5) ? (
        <div style={{position: 'absolute', left: 0, width: W, top: 140 + ci(fr, f(3.6), f(4.5)) * 900, height: 3, background: CYAN, boxShadow: `0 0 24px 6px ${CYAN}`, opacity: 0.8}} />
      ) : null}
      <Brackets rect={[752, 135, 985, 440]} p={ci(fr, f(4.5), f(4.9), 0, 1, easeOut)} />
      <div style={{position: 'absolute', left: 752, top: 96, fontFamily: MONO, fontSize: 18, letterSpacing: 4, color: CYAN, opacity: ci(fr, f(4.8), f(5.0)) * (0.6 + 0.4 * Math.abs(Math.sin(fr / 6)))}}>SUBJEK DIKESAN</div>
      {/* kepala siluet ~ x 770-965, y 150-426 (lihat scripts/siluet.py) */}
      <div style={{position: 'absolute', right: W - 735, top: 230, textAlign: 'right', opacity: t, transform: `translateX(${-50 * (1 - t)}px)`, filter: `blur(${(1 - t) * 10}px)`}}>
        <Gold size={92} spacing={6}>SIAPAKAH</Gold>
      </div>
      <div style={{position: 'absolute', left: 1000, top: 230, opacity: t, transform: `translateX(${50 * (1 - t)}px)`, filter: `blur(${(1 - t) * 10}px)`}}>
        <Gold size={92} spacing={6}>DIA?</Gold>
      </div>
      <Letterbox />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};

// ============================================================ 5. KIRAAN DETIK
export const SceneKira: React.FC = () => {
  const fr = useCurrentFrame();
  const sec = Math.min(2, Math.floor(fr / 30));
  const u = (fr - sec * 30) / 30;
  const n = 3 - sec;
  const beat = Math.exp(-u * 6);
  const R = 250;
  const C = 2 * Math.PI * R;
  const sc = 1.6 - 0.6 * Easing.out(Easing.cubic)(Math.min(1, u * 2.4));
  const op = ci(u, 0, 0.1) * (1 - ci(u, 0.82, 1));
  const shake = (random('k' + fr) - 0.5) * 22 * beat;
  return (
    <AbsoluteFill style={{...darkBg(`rgba(${60 + 70 * beat},${30 + 20 * beat},20,1)`, '#020102'), transform: `translate(${shake}px, ${shake * 0.7}px)`}}>
      <Embers n={60} seed="kira" />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <svg width={700} height={700} style={{position: 'absolute'}}>
          <circle cx={350} cy={350} r={R + 26} fill="none" stroke="rgba(242,195,91,0.25)" strokeWidth={1} />
          <circle
            cx={350}
            cy={350}
            r={R}
            fill="none"
            stroke="#f2c35b"
            strokeWidth={7}
            strokeDasharray={C}
            strokeDashoffset={C * u}
            transform="rotate(-90 350 350)"
            style={{filter: 'drop-shadow(0 0 12px rgba(255,190,80,0.9))'}}
          />
        </svg>
        <div style={{transform: `scale(${sc})`, opacity: op}}>
          <Gold size={340}>{String(n)}</Gold>
        </div>
      </AbsoluteFill>
      <Flash at={0} len={6} max={0.35} color="#ffd9a0" />
      <Flash at={30} len={6} max={0.35} color="#ffd9a0" />
      <Flash at={60} len={6} max={0.35} color="#ffd9a0" />
      <Letterbox />
      <Vignette />
      {fr >= 90 - 13 ? <AbsoluteFill style={{background: '#000'}} /> : null}
    </AbsoluteFill>
  );
};

// ============================================================ 6. PENDEDAHAN
export const SceneReveal: React.FC = () => {
  const fr = useCurrentFrame();
  const L = cutLayout(CUT_GRAD, 600, 70, 1010);
  const rise = ci(fr, 0, 28, 0, 1, easeOut);
  const st = (k: number) => ci(fr, 34 + k * 7, 52 + k * 7, 0, 1, easeOut);
  const shine = ci(fr, 80, 120);
  const faceEx: Rect[] = [L.face];
  const fc = [(L.face[0] + L.face[2]) / 2, (L.face[1] + L.face[3]) / 2];
  return (
    <AbsoluteFill style={darkBg('#3b2160', '#06030d', '32% 40%')}>
      <Stars n={150} seed="rv" opacity={0.7} />
      <Rays cx={fc[0]} cy={fc[1]} speed={0.18} />
      <Glow cx={600} cy={430} r={620} opacity={0.9} />
      <Embers n={50} seed="rv" exclude={faceEx} />
      <Img
        src={staticFile(CUT_GRAD.src)}
        style={{
          position: 'absolute',
          left: L.left,
          top: L.top,
          width: L.w,
          height: L.h,
          transformOrigin: '50% 100%',
          transform: `translateY(${50 * (1 - rise)}px) scale(${1.1 - 0.1 * rise})`,
          filter: 'drop-shadow(0 0 30px rgba(255,190,90,0.55))',
        }}
      />
      <div style={{position: 'absolute', left: 1010, top: 170, width: 860}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 12, color: GOLD, opacity: st(0), transform: `translateX(${60 * (1 - st(0))}px)`}}>TOKOH MURID 2026</div>
        <div style={{opacity: st(1), transform: `translateX(${90 * (1 - st(1))}px)`, marginTop: 14}}>
          <Gold size={150} spacing={6} shine={shine}>{NAMA_1}</Gold>
        </div>
        <div style={{opacity: st(2), transform: `translateX(${90 * (1 - st(2))}px)`}}>
          <Gold size={150} spacing={6} shine={shine}>{NAMA_2}</Gold>
        </div>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 42, color: '#fff', letterSpacing: 3, marginTop: 10, opacity: st(3), transform: `translateX(${60 * (1 - st(3))}px)`, textShadow: '0 3px 14px rgba(0,0,0,0.8)'}}>{NAMA_BIN}</div>
        <div style={{width: 520 * st(4), height: 2, background: GOLD_GRAD, margin: '30px 0 26px'}} />
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: 6, color: '#fff', opacity: st(4)}}>{KELAS}</div>
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 26, letterSpacing: 6, color: '#cbbfa6', marginTop: 8, opacity: st(5)}}>SK SULTAN OMAR · DUNGUN</div>
      </div>
      <Confetti start={2} exclude={faceEx} n={170} rain={110} />
      <Flash at={0} len={18} />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};

// ============================================================ 7. MONTAJ
const LightLeak: React.FC = () => {
  const fr = useCurrentFrame();
  const o = 1 - ci(fr, 0, 10);
  return o > 0 ? (
    <AbsoluteFill style={{opacity: o * 0.75, background: 'radial-gradient(ellipse at 15% 40%, rgba(255,190,110,0.95) 0%, rgba(255,120,40,0.4) 35%, transparent 70%)', mixBlendMode: 'screen'}} />
  ) : null;
};

const ShotFoto: React.FC<{s: Extract<Shot, {kind: 'foto'}>; dur: number}> = ({s, dur}) => {
  const fr = useCurrentFrame();
  const P = PHOTOS[s.photo];
  const u = faceUnion(P.iw, P.ih, P.face, s.z0, s.z1, s.fx0, s.fx1, s.fy);
  const slot = pickCaptionSlot(u);
  const badgeX = slot.side === 'left' ? slot.rect[0] + 110 : slot.rect[2] - 110;
  const badgeY = slot.v === 'bottom' ? slot.rect[1] - 40 : slot.rect[3] + 40;
  const punch = 1.04 - 0.04 * ci(fr, 0, 12, 0, 1, easeOut);
  const bandTop = slot.v === 'top';
  return (
    <AbsoluteFill style={{transform: `scale(${punch})`}}>
      <KenBurns src={P.src} iw={P.iw} ih={P.ih} face={P.face} dur={dur} z0={s.z0} z1={s.z1} fx0={s.fx0} fx1={s.fx1} fy={s.fy} />
      <AbsoluteFill
        style={{
          background: `linear-gradient(${bandTop ? 180 : 0}deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 28%, transparent 48%), linear-gradient(${slot.side === 'left' ? 90 : 270}deg, rgba(0,0,0,0.45) 0%, transparent 45%)`,
        }}
      />
      {s.badge ? <Badge text={s.badge} x={badgeX} y={badgeY} /> : null}
      <Caption slot={slot} kicker={s.kicker} title={s.title} sub={s.sub} />
    </AbsoluteFill>
  );
};

const ShotStatistik: React.FC = () => {
  const fr = useCurrentFrame();
  const head = ci(fr, 0, 14, 0, 1, easeOut);
  const foot = ci(fr, 62, 80, 0, 1, easeOut);
  return (
    <AbsoluteFill style={darkBg('#2a1a44', '#05030a')}>
      <Img src={staticFile('img/blur_handball_team.jpg')} style={{width: W, height: H, opacity: 0.25}} />
      <Stars n={90} seed="st" opacity={0.6} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 28, letterSpacing: 14, color: GOLD, opacity: head}}>JEJAK AKTIF 2026</div>
        <div style={{display: 'flex', gap: 44, marginTop: 50}}>
          {STATS.map((s, i) => {
            const a = 8 + i * 7;
            const p = ci(fr, a, a + 12, 0, 1, easeOut);
            const n = Math.round(s.n * ci(fr, a, a + 34, 0, 1, Easing.out(Easing.cubic)));
            return (
              <div
                key={i}
                style={{
                  width: 330,
                  height: 300,
                  borderRadius: 26,
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))',
                  border: '1.5px solid rgba(242,195,91,0.55)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 0 40px rgba(242,195,91,0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: p,
                  transform: `translateY(${60 * (1 - p)}px)`,
                }}
              >
                <Gold size={150}>{String(n)}</Gold>
                <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 6, color: '#fff', marginTop: 8}}>{s.l}</div>
              </div>
            );
          })}
        </div>
        <div style={{display: 'flex', gap: 40, alignItems: 'center', marginTop: 56, opacity: foot, transform: `translateY(${20 * (1 - foot)}px)`, fontFamily: SANS, fontWeight: 600, fontSize: 32, color: '#f3ead6', letterSpacing: 2}}>
          <span>🏆 2× JOHAN SKUASY</span>
          <span style={{color: GOLD}}>◆</span>
          <span>🥉 2× TEMPAT KETIGA BOLA BALING</span>
          <span style={{color: GOLD}}>◆</span>
          <span>📚 NILAM 4★</span>
        </div>
      </AbsoluteFill>
      <Vignette />
    </AbsoluteFill>
  );
};

const ShotKebangsaan: React.FC = () => {
  const fr = useCurrentFrame();
  const head = ci(fr, 0, 12, 0, 1, easeOut);
  const beat = f(0.4876);
  return (
    <AbsoluteFill style={darkBg('#14254a', '#03050c')}>
      <Stars n={120} seed="kb" opacity={0.7} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{opacity: head, transform: `scale(${1.2 - 0.2 * head})`}}>
          <Gold size={76} spacing={6}>6 PENTAS KEBANGSAAN</Gold>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 560px)', gap: 34, marginTop: 60}}>
          {KEBANGSAAN.map(([a, b], i) => {
            const st = 10 + i * beat * 0.75;
            const p = ci(fr, st, st + 10, 0, 1, Easing.out(Easing.back(1.6)));
            return (
              <div
                key={i}
                style={{
                  height: 200,
                  borderRadius: 20,
                  padding: '0 30px',
                  background: 'linear-gradient(150deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))',
                  border: '1.5px solid rgba(242,195,91,0.5)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  opacity: Math.min(1, p),
                  transform: `scale(${0.6 + 0.4 * p}) translateY(${30 * (1 - Math.min(1, p))}px)`,
                }}
              >
                <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 22, letterSpacing: 4, color: GOLD}}>KEBANGSAAN · 0{i + 1}</div>
                <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: 38, color: '#fff', marginTop: 10, lineHeight: 1.15}}>{a}</div>
                <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 26, color: '#cfc5b0', marginTop: 6}}>{b}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Vignette />
    </AbsoluteFill>
  );
};

export const SceneShot: React.FC<{s: Shot; dur: number}> = ({s, dur}) => {
  const fr = useCurrentFrame();
  const inn = ci(fr, 0, 5);
  let body: React.ReactNode = null;
  if (s.kind === 'foto') body = <ShotFoto s={s} dur={dur} />;
  if (s.kind === 'statistik') body = <ShotStatistik />;
  if (s.kind === 'kebangsaan') body = <ShotKebangsaan />;
  return (
    <AbsoluteFill style={{opacity: inn, background: '#000'}}>
      {body}
      <LightLeak />
      <Vignette strength={0.45} />
    </AbsoluteFill>
  );
};

// ============================================================ 8. PENUTUP
export const SceneFinale: React.FC = () => {
  const fr = useCurrentFrame();
  const dur = f(T.end - T.finale);
  const L = cutLayout(CUT_STAND, 470, 60, 1060);
  const inn = ci(fr, 0, 14, 0, 1, easeOut);
  const st = (k: number) => ci(fr, 10 + k * 8, 28 + k * 8, 0, 1, easeOut);
  const tah = ci(fr, 14, 26, 0, 1, Easing.out(Easing.back(1.8)));
  const shine = ci(fr, 40, 80);
  const out = 1 - ci(fr, dur - f(2.2), dur);
  const fc = [(L.face[0] + L.face[2]) / 2, (L.face[1] + L.face[3]) / 2];
  return (
    <AbsoluteFill style={{...darkBg('#3a2458', '#05030b', '30% 35%'), opacity: out}}>
      <Stars n={200} seed="fin" />
      <Rays cx={fc[0]} cy={fc[1]} speed={0.1} opacity={0.85} />
      <Glow cx={470} cy={420} r={600} opacity={0.75} />
      <Embers n={60} seed="fin" exclude={[L.face]} />
      <Img
        src={staticFile(CUT_STAND.src)}
        style={{position: 'absolute', left: L.left, top: L.top, width: L.w, height: L.h, opacity: inn, transform: `translateX(${-60 * (1 - inn)}px)`, filter: 'drop-shadow(0 0 26px rgba(255,190,90,0.5))'}}
      />
      <div style={{position: 'absolute', left: 900, top: 90, width: 940, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
        <Img src={staticFile('img/logo.png')} style={{height: 150, opacity: st(0), transform: `translateY(${-30 * (1 - st(0))}px)`, filter: 'drop-shadow(0 0 20px rgba(255,200,110,0.4))'}} />
        <div style={{transform: `scale(${tah})`, marginTop: 20}}>
          <Gold size={176} spacing={8} shine={shine}>TAHNIAH!</Gold>
        </div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 33, color: '#fff', letterSpacing: 1.5, whiteSpace: 'nowrap', marginTop: 18, opacity: st(2), textShadow: '0 3px 14px rgba(0,0,0,0.8)'}}>{NAMA_PENUH}</div>
        <div style={{width: 560 * st(3), height: 2, background: GOLD_GRAD, margin: '26px 0'}} />
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: 8, color: GOLD, opacity: st(3)}}>TOKOH MURID 2026</div>
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 26, letterSpacing: 6, color: '#ddd2bb', marginTop: 8, opacity: st(4)}}>SEKOLAH KEBANGSAAN SULTAN OMAR</div>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 34, color: '#f5e7c4', fontStyle: 'italic', marginTop: 40, opacity: st(6)}}>“Rajin Usaha Tangga Kejayaan”</div>
      </div>
      <Confetti start={4} exclude={[L.face]} n={150} rain={130} seed="fin" />
      <Flash at={0} len={12} max={0.8} />
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};
