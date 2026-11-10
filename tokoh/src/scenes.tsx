import React from 'react';
import {AbsoluteFill, Easing, Img, OffthreadVideo, random, staticFile, useCurrentFrame} from 'remotion';
import {
  Badge, Caption, ci, Confetti, cutLayout, easeInOut, easeOut, Embers, faceUnion, Flash, Glow, Gold, GOLD, GOLD_GRAD,
  KenBurns, kbLayout, kbLayoutPanel, Letterbox, overlap, pickCaptionSlot, Rays, SANS, SERIF, Stars, Vignette,
} from './components';
import {
  CUT_GRAD, CUT_STAND, f, H, KEBANGSAAN, KELAS, NAMA_1, NAMA_2, NAMA_BIN, NAMA_PENUH, PHOTOS, Rect, Shot, SIFAT, SIFAT_MASA, STATS, T, W,
} from './data';
import {NamaZarah, RevealFX} from './v6';
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
        {/* ruang untuk nama (dilukis oleh NamaZarah di bawah) */}
        <div style={{height: 14 + 156 * 2}} />
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 42, color: '#fff', letterSpacing: 3, marginTop: 10, opacity: st(3), transform: `translateX(${60 * (1 - st(3))}px)`, textShadow: '0 3px 14px rgba(0,0,0,0.8)'}}>{NAMA_BIN}</div>
        <div style={{width: 520 * st(4), height: 2, background: GOLD_GRAD, margin: '30px 0 26px'}} />
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: 6, color: '#fff', opacity: st(4)}}>{KELAS}</div>
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 26, letterSpacing: 6, color: '#cbbfa6', marginTop: 8, opacity: st(5)}}>SK SULTAN OMAR · DUNGUN</div>
      </div>
      <NamaZarah text={NAMA_1} size={150} start={36} x={1010} y={216} />
      <NamaZarah text={NAMA_2} size={150} start={56} x={1010} y={372} />
      <Confetti start={2} exclude={faceEx} n={170} rain={110} />
      <RevealFX cx={fc[0]} cy={fc[1]} flareY={600} />
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

// Parallax 2.5D: latar (Thoriq dipadam) bergerak perlahan, Thoriq bergerak lebih -> rasa kedalaman.
// Perkataan besar diletakkan DI BELAKANG Thoriq, jadi wajah tidak pernah dilitupi.
const Parallax: React.FC<{P: (typeof PHOTOS)[string]; s: Extract<Shot, {kind: 'foto'}>; dur: number}> = ({P, s, dur}) => {
  const fr = useCurrentFrame();
  const p = ci(fr, 0, dur, 0, 1, easeInOut);
  const L = kbLayout(P.iw, P.ih, P.face, s.z0 + (s.z1 - s.z0) * p, (s.fx0 + (s.fx1 - s.fx0) * p) * W, s.fy * H);
  const fcx = (L.rect[0] + L.rect[2]) / 2;
  const fcy = (L.rect[1] + L.rect[3]) / 2;
  const dir = s.fx1 >= s.fx0 ? 1 : -1;
  const bgShift = -dir * 28 * p;
  const fgScale = 1.0 + 0.07 * p;
  const fgShift = dir * 22 * p;
  const name = P.src.replace('img/', '').replace('.jpg', '');
  const word = s.kata;
  const wp = ci(fr, 6, 22, 0, 1, easeOut);
  const wsize = word ? Math.min(330, 1750 / (word.length * 0.78)) : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <Img src={staticFile(`img/bg_${name}.jpg`)} style={{position: 'absolute', left: L.left + bgShift, top: L.top, width: L.fw, height: L.fh, filter: 'brightness(0.82) saturate(0.95)'}} />
      {word ? (
        <div style={{position: 'absolute', left: 0, width: W, top: fcy + 40 - wsize * 0.55, display: 'flex', justifyContent: 'center', opacity: 0.92 * wp, transform: `translateX(${-dir * 40 * p}px) scale(${1.15 - 0.15 * wp})`}}>
          <Gold size={wsize} spacing={wsize * 0.06}>{word}</Gold>
        </div>
      ) : null}
      <Img
        src={staticFile(`img/fg_${name}.png`)}
        style={{
          position: 'absolute',
          left: L.left + fgShift,
          top: L.top,
          width: L.fw,
          height: L.fh,
          transformOrigin: `${fcx - L.left}px ${fcy - L.top}px`,
          transform: `scale(${fgScale})`,
          filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.55))',
        }}
      />
    </AbsoluteFill>
  );
};

const ShotFoto: React.FC<{s: Extract<Shot, {kind: 'foto'}>; dur: number}> = ({s, dur}) => {
  const fr = useCurrentFrame();
  const P = PHOTOS[s.photo];
  const u = faceUnion(P.iw, P.ih, P.face, s.z0, s.z1, s.fx0, s.fx1, s.fy);
  const slot = pickCaptionSlot(u);
  // lencana di atas kapsyen dengan jarak; jika bertindih wajah, pindah ke sudut atas sebelah sama
  const badgeX = slot.side === 'left' ? slot.rect[0] + 100 : slot.rect[2] - 100;
  let badgeY = slot.v === 'bottom' ? slot.rect[1] - 95 : slot.rect[3] + 95;
  const bRect: Rect = [badgeX - 100, badgeY - 100, badgeX + 100, badgeY + 100];
  if (overlap(bRect, [u[0] - 40, u[1] - 40, u[2] + 40, u[3] + 40])) badgeY = slot.v === 'bottom' ? 110 + 95 : H - 110 - 95;
  const punch = 1.04 - 0.04 * ci(fr, 0, 12, 0, 1, easeOut);
  const bandTop = slot.v === 'top';
  return (
    <AbsoluteFill style={{transform: `scale(${punch})`}}>
      {s.parallax ? (
        <Parallax P={P} s={s} dur={dur} />
      ) : (
        <KenBurns src={P.src} iw={P.iw} ih={P.ih} face={P.face} dur={dur} z0={s.z0} z1={s.z1} fx0={s.fx0} fx1={s.fx1} fy={s.fy} />
      )}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${bandTop ? 180 : 0}deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 28%, transparent 48%), linear-gradient(${slot.side === 'left' ? 90 : 270}deg, rgba(0,0,0,0.45) 0%, transparent 45%)`,
        }}
      />
      {s.badge && !s.parallax ? <Badge text={s.badge} x={badgeX} y={badgeY} /> : null}
      <Caption slot={slot} kicker={s.kicker} title={s.title} sub={s.sub} />
    </AbsoluteFill>
  );
};

const ShotTriptik: React.FC<{s: Extract<Shot, {kind: 'triptik'}>; dur: number}> = ({s, dur}) => {
  const fr = useCurrentFrame();
  const beat = 14.63;
  const pw = W / 3;
  const slot = {side: 'left' as const, v: 'bottom' as const, rect: [110, H - 330, 1110, H - 90] as Rect};
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {s.photos.map((k, i) => {
        const P = PHOTOS[k];
        const st = i * beat * 0.9;
        const p = ci(fr, st, st + 10, 0, 1, easeOut);
        const z = 1.12 - 0.1 * ci(fr, st, dur);
        const L = kbLayoutPanel(P.iw, P.ih, P.face, pw, H, z, pw / 2, H * 0.4);
        const dir = i % 2 === 0 ? 1 : -1;
        return (
          <div key={i} style={{position: 'absolute', left: i * pw, top: 0, width: pw, height: H, overflow: 'hidden', opacity: p, transform: `translateY(${dir * 120 * (1 - p)}px)`}}>
            <Img src={staticFile(P.src)} style={{position: 'absolute', left: L.left, top: L.top, width: L.fw, height: L.fh}} />
            <AbsoluteFill style={{background: `rgba(255,220,150,${0.6 * (1 - ci(fr, st, st + 8))})`}} />
          </div>
        );
      })}
      {[1, 2].map((i) => (
        <div key={i} style={{position: 'absolute', left: i * pw - 2, top: 0, width: 4, height: H * ci(fr, (i - 0.5) * beat, (i + 0.5) * beat, 0, 1, easeOut), background: GOLD_GRAD, boxShadow: '0 0 14px rgba(255,190,80,0.8)'}} />
      ))}
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.35) 26%, transparent 45%)'}} />
      <Caption slot={slot} kicker={s.kicker} title={s.title} sub={s.sub} delay={Math.round(2 * beat)} />
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
  if (s.kind === 'triptik') body = <ShotTriptik s={s} dur={dur} />;
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
