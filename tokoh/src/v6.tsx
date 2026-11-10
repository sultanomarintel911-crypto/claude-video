// Babak tambahan v6: gaya trailer, hiperangkasa, mozek & potret hidup
import React from 'react';
import {AbsoluteFill, Easing, Img, OffthreadVideo, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import mosaic from './mosaic.json';
import {ci, easeInOut, easeOut, Embers, Gold, GOLD, GOLD_GRAD, SANS, SERIF, Vignette} from './components';
import {DRON_KLIP, f, H, NAMA_PENUH, SIFAT, SIFAT_MASA, T, TEASER, W} from './data';
import {Brackets, CYAN, GlitchBands, GlitchText, HexGrid, MONO, ORB, RED, Scanlines, Scramble} from './scifi';

// gred warna sinematik (teal-oren) untuk b-roll
export const Grade: React.FC = () => (
  <>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,70,90,0.35), rgba(0,40,60,0.45))', mixBlendMode: 'soft-light'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 70% 35%, rgba(255,150,60,0.28), transparent 60%)', mixBlendMode: 'overlay'}} />
  </>
);

const Bars: React.FC<{h?: number}> = ({h = 135}) => (
  <>
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: h, background: '#000'}} />
    <div style={{position: 'absolute', left: 0, bottom: 0, width: W, height: h, background: '#000'}} />
  </>
);

const Klip: React.FC<{src: string; from: number; len: number; grade?: boolean; zoom?: number}> = ({src, from, len, grade = true, zoom = 0.06}) => {
  const fr = useCurrentFrame();
  const z = 1 + zoom * (fr / len);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${z})`, filter: grade ? 'contrast(1.12) saturate(0.95) brightness(0.92)' : undefined}}>
        <OffthreadVideo src={staticFile(src)} muted trimBefore={f(from)} />
      </AbsoluteFill>
      {grade ? <Grade /> : null}
    </AbsoluteFill>
  );
};

// ============================================================ "DI BUMI BERTUAH INI..." (dron + bendera + bintang)
export const SceneBumi: React.FC = () => {
  const fr = useCurrentFrame();
  const t0 = T.dron;
  const L = (a: number) => f(a - t0);
  const t1 = ci(fr, L(17.5), L(18.2), 0, 1, easeOut) * (1 - ci(fr, L(20.3), L(20.8)));
  const lt = ci(fr, L(20.7), L(21.3), 0, 1, easeOut) * (1 - ci(fr, L(22.5), L(22.95)));
  const t2 = ci(fr, L(25.6), L(26.3), 0, 1, easeOut) * (1 - ci(fr, L(27.2), L(27.7)));
  const textStyle: React.CSSProperties = {fontFamily: SERIF, fontWeight: 700, fontSize: 76, color: '#fff', letterSpacing: 3, textShadow: '0 4px 28px rgba(0,0,0,0.9)'};
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {DRON_KLIP.map(([a, b, src, from], i) => (
        <Sequence key={i} from={L(a)} durationInFrames={L(b) - L(a)}>
          <Klip src={src} from={from} len={L(b) - L(a)} grade={src.includes('bendera')} zoom={0.04} />
        </Sequence>
      ))}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: t1}}>
        <div style={{...textStyle, transform: `translateY(${16 * (1 - t1)}px)`, filter: `blur(${(1 - t1) * 8}px)`}}>Di bumi bertuah ini...</div>
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
        <div style={{...textStyle, transform: `translateY(${16 * (1 - t2)}px)`, filter: `blur(${(1 - t2) * 8}px)`}}>...lahir seorang bintang.</div>
      </AbsoluteFill>
      <Vignette strength={0.55} />
    </AbsoluteFill>
  );
};

// ============================================================ TEASER TANPA WAJAH (gaya trailer + HUD rakaman)
export const SceneTeaser: React.FC = () => {
  const fr = useCurrentFrame();
  const t0 = T.fail;
  const L = (a: number) => f(a - t0);
  const dur = L(T.sah);
  const prog = ci(fr, 0, dur);
  const tc = (n: number) => String(n).padStart(2, '0');
  const sec = Math.floor(fr / 30);
  const inClip = TEASER.some(([a, b]) => fr >= L(a) && fr < L(b));
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {TEASER.map(([a, b, src, from], i) => (
        <Sequence key={i} from={L(a)} durationInFrames={L(b) - L(a)}>
          <Klip src={src} from={from} len={L(b) - L(a)} />
          <FlashIn />
        </Sequence>
      ))}
      {SIFAT.map((w, i) => {
        const s = L(SIFAT_MASA[i]) + 12;
        const e = s + f(2.0);
        const p = ci(fr, s, s + 14, 0, 1, easeOut) * (1 - ci(fr, e - 10, e));
        if (p <= 0) return null;
        const sp = 70 - 44 * ci(fr, s, e, 0, 1, Easing.out(Easing.quad));
        return (
          <AbsoluteFill key={i} style={{justifyContent: 'center', alignItems: 'center', opacity: p}}>
            <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 10, color: CYAN, marginBottom: 14, textShadow: `0 0 10px ${CYAN}`}}>SIFAT DIKESAN</div>
            <div style={{fontFamily: SANS, fontWeight: 700, fontSize: w.length > 10 ? 104 : 128, letterSpacing: sp, color: '#fff', textShadow: '0 0 30px rgba(255,190,90,0.65), 0 6px 20px rgba(0,0,0,0.9)', marginRight: -sp}}>{w}</div>
          </AbsoluteFill>
        );
      })}
      <Bars />
      {/* HUD rakaman di dalam jalur hitam */}
      <div style={{position: 'absolute', left: 90, top: 50, display: 'flex', gap: 26, alignItems: 'center', fontFamily: MONO, fontSize: 24, color: '#e8f6ff'}}>
        <span style={{color: RED, opacity: Math.floor(fr / 15) % 2 ? 1 : 0.25}}>●</span>
        <span>REC</span>
        <span style={{color: CYAN}}>FAIL TOKOH MURID · 2026</span>
        <span style={{background: RED, color: '#fff', padding: '2px 10px', fontSize: 18, letterSpacing: 4}}>SULIT</span>
      </div>
      <div style={{position: 'absolute', right: 90, top: 50, fontFamily: MONO, fontSize: 24, color: '#e8f6ff'}}>
        00:{tc(Math.floor(sec / 60))}:{tc(sec % 60)}:{tc(fr % 30)}
      </div>
      <div style={{position: 'absolute', left: 90, bottom: 48, fontFamily: MONO, fontSize: 24, color: '#e8f6ff'}}>
        <span style={{color: CYAN}}>SUBJEK: </span>
        <Scramble text="██████ █████" reveal={0} seed="subj" />
      </div>
      <div style={{position: 'absolute', right: 90, bottom: 44, width: 420, fontFamily: MONO, fontSize: 20, color: CYAN}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <span>PENYAHSULITAN</span>
          <span>{Math.round(prog * 100)}%</span>
        </div>
        <div style={{height: 8, border: `1px solid ${CYAN}`, marginTop: 6}}>
          <div style={{height: '100%', width: `${prog * 100}%`, background: CYAN, boxShadow: `0 0 10px ${CYAN}`}} />
        </div>
      </div>
      {inClip ? <Brackets rect={[90, 165, W - 90, H - 165]} p={1} len={44} color="rgba(232,246,255,0.8)" /> : null}
      <GlitchBands intensity={TEASER.some(([a]) => fr >= L(a) && fr < L(a) + 4) ? 0.7 : 0} seed="tz" />
      <Scanlines opacity={0.2} />
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};
// kilat ringkas pada awal setiap klip (frame tempatan Sequence)
const FlashIn: React.FC = () => {
  const fr = useCurrentFrame();
  const o = 0.5 * (1 - ci(fr, 0, 5));
  return o > 0 ? <AbsoluteFill style={{background: `rgba(255,240,220,${o})`}} /> : null;
};

// ============================================================ IDENTITI DISAHKAN
export const SceneSah: React.FC = () => {
  const fr = useCurrentFrame();
  const p = ci(fr, 0, 6);
  return (
    <AbsoluteFill style={{background: '#010409'}}>
      <HexGrid opacity={0.2} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: p}}>
        <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 8, color: CYAN, marginBottom: 20}}>
          SUBJEK: <Scramble text="██████ █████" reveal={0} seed="sah" />
        </div>
        <GlitchText size={92} color={GOLD} intensity={0.35 + 0.5 * ci(fr, 20, 34)} seed="sah2" spacing={12}>IDENTITI DISAHKAN</GlitchText>
      </AbsoluteFill>
      <Brackets rect={[460, 380, 1460, 700]} p={ci(fr, 0, 8, 0, 1, easeOut)} color={GOLD} />
      <GlitchBands intensity={fr < 5 ? 0.8 : ci(fr, 24, 34)} seed="sah" />
      <Scanlines />
      <Vignette />
    </AbsoluteFill>
  );
};

// ============================================================ LOMPATAN HIPERANGKASA
export const SceneWarp: React.FC<{len: number}> = ({len}) => {
  const fr = useCurrentFrame();
  const u = fr / len;
  const cx = W / 2;
  const cy = H / 2;
  const lines = Array.from({length: 320}).map((_, i) => {
    const a = random('wa' + i) * Math.PI * 2;
    const r0 = 15 + random('wr' + i) * 520;
    const r = r0 * Math.exp(3.4 * u * u + 0.6 * u);
    const ln = r * (0.04 + 1.6 * u * u);
    const op = Math.min(1, u * 3) * (0.4 + 0.6 * random('wo' + i));
    const col = random('wc' + i) < 0.3 ? '#9eefff' : '#ffffff';
    return (
      <line key={i} x1={cx + Math.cos(a) * r} y1={cy + Math.sin(a) * r} x2={cx + Math.cos(a) * (r + ln)} y2={cy + Math.sin(a) * (r + ln)} stroke={col} strokeWidth={1 + 2.5 * u} opacity={op} strokeLinecap="round" />
    );
  });
  const flash = ci(fr, len - 8, len);
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at center, rgba(40,90,160,${0.2 + 0.6 * u}) 0%, #01030a 60%)`}}>
      <svg width={W} height={H} style={{filter: `drop-shadow(0 0 ${4 + 10 * u}px #8fe9ff)`}}>
        {lines}
      </svg>
      <AbsoluteFill style={{background: `radial-gradient(circle at center, rgba(255,255,255,${0.9 * u * u}) 0%, transparent ${10 + 30 * u}%)`}} />
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
    </AbsoluteFill>
  );
};

// ============================================================ KESAN PENDEDAHAN: gelombang kejutan + suar lensa
export const RevealFX: React.FC<{cx: number; cy: number; flareY: number}> = ({cx, cy, flareY}) => {
  const fr = useCurrentFrame();
  const ring = (start: number, col: string) => {
    const u = ci(fr, start, start + 32, 0, 1, Easing.out(Easing.cubic));
    if (u <= 0 || u >= 1) return null;
    const r = 30 + 1900 * u;
    return (
      <div
        style={{
          position: 'absolute',
          left: cx - r,
          top: cy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: '50%',
          border: `${Math.max(2, 40 * (1 - u))}px solid ${col}`,
          opacity: (1 - u) * 0.9,
          filter: `blur(${4 + 10 * u}px)`,
        }}
      />
    );
  };
  const fx = ci(fr, 6, 40, -0.4, 1.3, Easing.inOut(Easing.quad));
  const fo = ci(fr, 6, 12) * (1 - ci(fr, 34, 44));
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {ring(0, 'rgba(255,230,170,1)')}
      {ring(5, 'rgba(140,220,255,1)')}
      <div style={{position: 'absolute', left: 0, top: flareY - 3, width: W, height: 6, opacity: fo, background: 'linear-gradient(90deg, transparent, rgba(120,210,255,0.9) 40%, #fff 50%, rgba(120,210,255,0.9) 60%, transparent)', filter: 'blur(2px)'}} />
      <div style={{position: 'absolute', left: fx * W - 90, top: flareY - 90, width: 180, height: 180, borderRadius: '50%', opacity: fo, background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(150,220,255,0.5) 25%, transparent 70%)'}} />
      {[0.35, 0.6, 0.8].map((k, i) => (
        <div key={i} style={{position: 'absolute', left: W - fx * W * k - 30, top: flareY - 30 + (i - 1) * 40, width: 60 + i * 30, height: 60 + i * 30, borderRadius: '50%', opacity: fo * 0.35, border: '2px solid rgba(150,220,255,0.7)'}} />
      ))}
    </AbsoluteFill>
  );
};

// Nama terbentuk daripada zarah emas: zarah berkumpul, kemudian huruf muncul satu demi satu
export const NamaZarah: React.FC<{text: string; size: number; start: number; x: number; y: number}> = ({text, size, start, x, y}) => {
  const fr = useCurrentFrame();
  const letters = text.split('');
  const approxW = size * 0.86 * letters.length;
  const parts = Array.from({length: 70}).map((_, i) => {
    const tx = x + random('nx' + text + i) * approxW;
    const ty = y + size * (0.25 + random('ny' + text + i) * 0.55);
    const a = random('na' + text + i) * Math.PI * 2;
    const R = 500 + random('nr' + text + i) * 700;
    const u = ci(fr, start - 22 + random('nd' + text + i) * 6, start + 4, 0, 1, Easing.in(Easing.cubic));
    if (u <= 0 || u >= 1) return null;
    const px = tx + Math.cos(a) * R * (1 - u);
    const py = ty + Math.sin(a) * R * (1 - u);
    return <div key={i} style={{position: 'absolute', left: px, top: py, width: 5, height: 5, borderRadius: '50%', background: '#ffe2a0', boxShadow: '0 0 10px 3px rgba(255,190,80,0.9)', opacity: 0.4 + 0.6 * u}} />;
  });
  return (
    <>
      {parts}
      <div style={{position: 'absolute', left: x, top: y, display: 'flex'}}>
        {letters.map((ch, i) => {
          const p = ci(fr, start + i * 3, start + i * 3 + 9, 0, 1, easeOut);
          const shine = ci(fr, start + letters.length * 3 + 10, start + letters.length * 3 + 50);
          return (
            <div key={i} style={{opacity: p, transform: `scale(${1.8 - 0.8 * p})`, filter: `blur(${(1 - p) * 10}px) brightness(${1 + (1 - p) * 2})`}}>
              <Gold size={size} spacing={6} shine={shine}>{ch}</Gold>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ============================================================ MOZEK -> POTRET HIDUP -> TAHNIAH
type Cell = {r: number; c: number; t: string; col: number[]};
export const SceneMozek: React.FC<{dur: number}> = ({dur}) => {
  const fr = useCurrentFrame();
  const M = mosaic as {cell: number; cols: number; rows: number; cells: Cell[]};
  const C = M.cell;
  const assembled = 80;
  const tgtIn = ci(fr, 70, 92);
  const vidStart = 96;
  const vidLen = f(6.0);
  const endStart = vidStart + vidLen;
  const tah = ci(fr, vidStart + 18, vidStart + 30, 0, 1, Easing.out(Easing.back(1.6)));
  const nm = ci(fr, vidStart + 34, vidStart + 50, 0, 1, easeOut);
  const shine = ci(fr, vidStart + 40, vidStart + 80);
  const endP = ci(fr, endStart, endStart + 18, 0, 1, easeInOut);
  const out = 1 - ci(fr, dur - f(1.8), dur);
  return (
    <AbsoluteFill style={{background: '#05030b', opacity: out}}>
      {fr < 100
        ? M.cells.map((cl, i) => {
            const fx = cl.c * C;
            const fy = cl.r * C;
            const d = Math.hypot(fx + C / 2 - W / 2, fy + C / 2 - H / 2) / 1100;
            const arrive = 4 + d * 46 + random('ma' + i) * 12;
            const u = ci(fr, arrive - 20, arrive, 0, 1, Easing.out(Easing.cubic));
            if (u <= 0) return null;
            const ang = random('mang' + i) * Math.PI * 2;
            const sx = W / 2 + Math.cos(ang) * 1500;
            const sy = H / 2 + Math.sin(ang) * 1100;
            const x = sx + (fx - sx) * u;
            const y = sy + (fy - sy) * u;
            const rot = (1 - u) * (random('mr' + i) - 0.5) * 540;
            const s = 0.4 + 0.6 * u;
            return (
              <div key={i} style={{position: 'absolute', left: x, top: y, width: C, height: C, transform: `rotate(${rot}deg) scale(${s})`, overflow: 'hidden', opacity: 1 - tgtIn * 0.999}}>
                <Img src={staticFile('img/tiles/' + cl.t)} style={{width: C, height: C}} />
                <div style={{position: 'absolute', inset: 0, background: `rgb(${cl.col.join(',')})`, opacity: 0.62}} />
                <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.35)'}} />
              </div>
            );
          })
        : null}
      {fr >= 70 && fr < vidStart + 2 ? <Img src={staticFile('img/mozek_sasaran.jpg')} style={{position: 'absolute', width: W, height: H, opacity: tgtIn}} /> : null}
      <Sequence from={vidStart} durationInFrames={vidLen}>
        <OffthreadVideo src={staticFile('video/potret_hidup.mp4')} muted />
      </Sequence>
      {fr >= endStart ? <Img src={staticFile('img/potret_akhir.jpg')} style={{position: 'absolute', width: W, height: H, filter: `blur(${endP * 22}px) brightness(${1 - endP * 0.75})`, transform: `scale(${1 + endP * 0.08})`}} /> : null}
      {fr >= vidStart ? <Embers n={40} seed="mz" exclude={[[640, 0, 1280, 620]]} opacity={0.8} /> : null}
      {/* TAHNIAH di jalur bawah (di atas badan, wajah tidak dilitupi) */}
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(5,3,11,0.88) 0%, rgba(5,3,11,0.5) 26%, transparent 42%)', opacity: tah * (1 - endP)}} />
      <div style={{position: 'absolute', left: 0, width: W, top: 735, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 1 - endP}}>
        <div style={{transform: `scale(${tah})`}}>
          <Gold size={130} spacing={10} shine={shine}>TAHNIAH!</Gold>
        </div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 36, color: '#fff', letterSpacing: 2, marginTop: 6, opacity: nm, textShadow: '0 3px 14px rgba(0,0,0,0.9)', whiteSpace: 'nowrap'}}>{NAMA_PENUH}</div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 10, color: GOLD, marginTop: 8, opacity: nm}}>TOKOH MURID 2026 · SK SULTAN OMAR</div>
      </div>
      {/* kad penutup */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: endP}}>
        <Img src={staticFile('img/logo.png')} style={{height: 170, filter: 'drop-shadow(0 0 24px rgba(255,200,110,0.45))'}} />
        <div style={{marginTop: 26}}>
          <Gold size={64} spacing={8}>TOKOH MURID 2026</Gold>
        </div>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 30, letterSpacing: 4, color: '#fff', marginTop: 16}}>{NAMA_PENUH}</div>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 36, color: '#f5e7c4', fontStyle: 'italic', marginTop: 36}}>“Rajin Usaha Tangga Kejayaan”</div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: (1 - ci(fr, vidStart, vidStart + 10)) * ci(fr, vidStart - 4, vidStart) * 0.8}} />
      <Vignette strength={0.5} />
    </AbsoluteFill>
  );
};
