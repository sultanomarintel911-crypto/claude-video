import React from 'react';
import {AbsoluteFill, Easing, Img, OffthreadVideo, random, staticFile, useCurrentFrame} from 'remotion';
import {
  Badge, Caption, ci, Confetti, cutLayout, easeInOut, easeOut, Embers, faceUnion, Flash, Glow, Gold, GOLD, GOLD_GRAD,
  KenBurns, Letterbox, pickCaptionSlot, Rays, SANS, SERIF, Stars, Vignette,
} from './components';
import {
  CLUES, CUT_GRAD, CUT_STAND, f, H, KEBANGSAAN, KELAS, NAMA_1, NAMA_2, NAMA_BIN, NAMA_PENUH, PHOTOS, Rect, Shot, STATS, T, W,
} from './data';

const darkBg = (c1 = '#1b1430', c2 = '#030208', at = '50% 50%') => ({background: `radial-gradient(ellipse at ${at}, ${c1} 0%, ${c2} 75%)`});

// ============================================================ 1. DRON
export const SceneDron: React.FC = () => {
  const fr = useCurrentFrame();
  const lt = ci(fr, f(1.1), f(1.7), 0, 1, easeOut) * (1 - ci(fr, f(6.0), f(6.5)));
  const sky = ci(fr, f(6.8), f(7.6), 0, 1, easeOut) * (1 - ci(fr, f(9.2), f(9.9)));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <OffthreadVideo src={staticFile('video/intro_dron.mp4')} muted />
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(0,0,0,0.65) 0%, transparent 35%)', opacity: lt}} />
      <div style={{position: 'absolute', left: 110, bottom: 110, display: 'flex', alignItems: 'center', gap: 28, opacity: lt, transform: `translateX(${-50 * (1 - lt)}px)`}}>
        <Img src={staticFile('img/logo.png')} style={{height: 130, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.7))'}} />
        <div>
          <div style={{width: 80 * lt, height: 3, background: GOLD_GRAD, marginBottom: 12}} />
          <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: 46, color: '#fff', textShadow: '0 3px 14px rgba(0,0,0,0.9)'}}>Sekolah Kebangsaan Sultan Omar</div>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: 6, color: GOLD, marginTop: 6, textShadow: '0 2px 10px rgba(0,0,0,0.9)'}}>DUNGUN · TERENGGANU</div>
        </div>
      </div>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: sky}}>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 58, color: '#fff', textAlign: 'center', lineHeight: 1.35, letterSpacing: 2, textShadow: '0 4px 24px rgba(0,0,0,0.85)', transform: `translateY(${20 * (1 - sky)}px)`}}>
          Di bumi ilmu ini,
          <br />
          lahir seorang bintang...
        </div>
      </AbsoluteFill>
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};

// ============================================================ 2. TAJUK
export const SceneTajuk: React.FC = () => {
  const fr = useCurrentFrame();
  const hit = f(T.tajukHit - T.tajuk);
  const fadeIn = ci(fr, 0, 12);
  const logo = ci(fr, f(0.3), f(1.3), 0, 1, easeOut);
  const slam = ci(fr, hit, hit + 10, 0, 1, easeOut);
  const shine = ci(fr, hit + 14, hit + 50);
  const sub = ci(fr, hit + f(1.4), hit + f(2.0), 0, 1, easeOut);
  const dim = ci(fr, f(4.6), f(5.1), 0, 1, easeInOut);
  const siapa = ci(fr, f(5.2), f(5.9), 0, 1, easeOut);
  const out = 1 - ci(fr, f(7.0), f(7.34));
  const shake = fr >= hit && fr < hit + 8 ? (random('sh' + fr) - 0.5) * 14 * (1 - (fr - hit) / 8) : 0;
  return (
    <AbsoluteFill style={{...darkBg('#20183a', '#020106'), opacity: fadeIn * out}}>
      <Stars n={260} drift={10} />
      <Glow cx={W / 2} cy={H / 2} r={700} opacity={0.35 * slam} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `translate(${shake}px, ${shake * 0.6}px)`, opacity: 1 - dim, filter: `blur(${dim * 12}px)`}}>
        <Img src={staticFile('img/logo.png')} style={{height: 150, opacity: logo, transform: `translateY(${-40 * (1 - logo)}px)`, marginBottom: 26, filter: 'drop-shadow(0 0 24px rgba(255,200,100,0.35))'}} />
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: 18, color: '#e9dcc0', opacity: slam, marginBottom: 6}}>ANUGERAH</div>
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
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: siapa}}>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 92, color: '#fff', letterSpacing: 6, textShadow: '0 0 40px rgba(255,200,120,0.4)', transform: `scale(${1.1 - 0.1 * siapa})`, filter: `blur(${(1 - siapa) * 10}px)`}}>
          Siapakah dia...?
        </div>
      </AbsoluteFill>
      <Letterbox />
      <Vignette />
    </AbsoluteFill>
  );
};

// ============================================================ 3. PETUNJUK
const Trofi: React.FC<{p: number}> = ({p}) => (
  <svg width={150} height={150} viewBox="0 0 100 100" style={{opacity: p, transform: `scale(${0.5 + 0.5 * p})`, filter: 'drop-shadow(0 0 18px rgba(255,190,70,0.7))'}}>
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff3c0" />
        <stop offset="0.5" stopColor="#e3a63a" />
        <stop offset="1" stopColor="#a86c12" />
      </linearGradient>
    </defs>
    <path d="M28 12h44v18c0 14-9 26-22 26S28 44 28 30z" fill="url(#g)" />
    <path d="M28 18H14c0 14 6 22 16 22M72 18h14c0 14-6 22-16 22" fill="none" stroke="url(#g)" strokeWidth="5" />
    <rect x="44" y="55" width="12" height="16" fill="url(#g)" />
    <rect x="30" y="71" width="40" height="10" rx="2" fill="url(#g)" />
    <rect x="24" y="81" width="52" height="8" rx="2" fill="url(#g)" />
  </svg>
);

export const SceneClue: React.FC<{i: number}> = ({i}) => {
  const fr = useCurrentFrame();
  const c = CLUES[i];
  const dur = f(T.clueLen);
  const inn = ci(fr, 0, 8);
  const out = 1 - ci(fr, dur - 9, dur);
  const label = ci(fr, 2, 14, 0, 1, easeOut);
  const typeA = f(0.25);
  const typeB = f(1.8);
  const n = Math.floor(c.teks.length * ci(fr, typeA, typeB));
  const kunci = ci(fr, f(2.1), f(2.1) + 9, 0, 1, easeOut);
  const shine = ci(fr, f(2.1) + 12, f(2.1) + 42);
  const sub = ci(fr, f(2.6), f(3.1), 0, 1, easeOut);
  const extra = ci(fr, f(2.3), f(3.3));
  const count = Math.round(6 * ci(fr, f(2.2), f(3.4), 0, 1, Easing.out(Easing.cubic)));
  const cursor = n < c.teks.length || Math.floor(fr / 8) % 2 === 0;
  const kSize = c.kunci.length > 18 ? 78 : 104;
  return (
    <AbsoluteFill style={{background: '#000', opacity: inn * out}}>
      <Img src={staticFile(c.bg)} style={{width: W, height: H, transform: `scale(${1.12 - 0.08 * (fr / dur)})`, opacity: 0.9}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(5,4,12,0.45) 0%, rgba(2,2,6,0.85) 80%)'}} />
      <Embers n={40} seed={'c' + i} opacity={0.6} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 30}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22, opacity: label, transform: `translateY(${-20 * (1 - label)}px)`}}>
          <div style={{width: 90 * label, height: 2, background: GOLD_GRAD}} />
          <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 12, color: GOLD}}>PETUNJUK 0{i + 1}</div>
          <div style={{width: 90 * label, height: 2, background: GOLD_GRAD}} />
        </div>
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 46, color: '#fff', marginTop: 34, height: 60, textShadow: '0 3px 16px rgba(0,0,0,0.9)'}}>
          {c.teks.slice(0, n)}
          <span style={{opacity: cursor ? 1 : 0, color: GOLD}}>|</span>
        </div>
        <div style={{height: 210, display: 'flex', alignItems: 'center', gap: 34, marginTop: 26}}>
          {c.extra === 'trofi' ? <Trofi p={extra} /> : null}
          {c.extra === 'kaunter' ? (
            <div style={{opacity: kunci, transform: `scale(${1.5 - 0.5 * kunci})`}}>
              <Gold size={200}>{String(count)}</Gold>
            </div>
          ) : null}
          <div style={{opacity: kunci, transform: `scale(${1.35 - 0.35 * kunci})`, filter: `blur(${(1 - kunci) * 8}px)`}}>
            <Gold size={kSize} spacing={4} shine={shine}>{c.kunci}</Gold>
          </div>
        </div>
        {c.extra === 'bintang' ? (
          <div style={{display: 'flex', gap: 26, marginTop: 4, height: 80}}>
            {[0, 1, 2, 3].map((k) => {
              const p = ci(fr, f(2.5) + k * 7, f(2.5) + k * 7 + 10, 0, 1, Easing.out(Easing.back(2.5)));
              return (
                <div key={k} style={{fontSize: 76, lineHeight: 1, transform: `scale(${p}) rotate(${(1 - p) * 90}deg)`, color: '#ffd45e', textShadow: '0 0 24px rgba(255,200,80,0.9)'}}>★</div>
              );
            })}
          </div>
        ) : null}
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 32, letterSpacing: 3, color: '#ddd3bd', marginTop: 18, opacity: sub, transform: `translateY(${16 * (1 - sub)}px)`}}>{c.sub}</div>
      </AbsoluteFill>
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

const ShotVideo: React.FC<{s: Extract<Shot, {kind: 'video'}>}> = ({s}) => {
  const fr = useCurrentFrame();
  // tanda 'AI generated' di kanan bawah video asal - kapsyen sentiasa di kiri
  const slot = {side: 'left' as const, v: 'bottom' as const, rect: [110, H - 360, 1010, H - 110] as Rect};
  return (
    <AbsoluteFill style={{transform: `scale(${1.04 - 0.04 * ci(fr, 0, 12, 0, 1, easeOut)})`}}>
      <OffthreadVideo src={staticFile(s.src)} muted />
      <AbsoluteFill style={{background: `linear-gradient(0deg, rgba(0,0,0,0.75) 0%, transparent 40%), linear-gradient(${slot.side === 'left' ? 90 : 270}deg, rgba(0,0,0,0.55) 0%, transparent 40%)`}} />
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
  if (s.kind === 'video') body = <ShotVideo s={s} />;
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
