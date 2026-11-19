import '@fontsource/cinzel/800.css';
import '@fontsource/cinzel/900.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/orbitron/700.css';
import '@fontsource/orbitron/900.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Block, Card, DATA_JALUR, DATA_KAD, MFPS, pieceDur, TL} from './montaj';
import {ci, easeOut, Gold, GOLD, SANS, SERIF, Stars, Vignette} from './tk/components';
import {Brackets, CYAN, GlitchText, HexGrid, HudRings, MONO, ORB, Scanlines, Scramble} from './tk/scifi';

const W = 1920;
const H = 1080;
const WHIP = 7;

// ---------------------------------------------------------------- kad nama
const KadNama: React.FC<{c: Card}> = ({c}) => {
  const fr = useCurrentFrame();
  const slam = ci(fr, 0, 7, 0, 1, Easing.out(Easing.back(1.4)));
  const panel = ci(fr, 2, 14, 0, 1, easeOut);
  const reveal = ci(fr, 6, 30);
  const jaw = ci(fr, 18, 30, 0, 1, easeOut);
  const shine = ci(fr, 26, 56);
  const lines = c.nama.split('\n');
  const y0 = H - 128 - 92 - lines.length * 62;
  const w = Math.max(760, Math.max(...lines.map((l) => l.length)) * (lines.length > 1 ? 44 : 53) + 110, c.jawatan.length * 27 + 110);
  const h = 70 + lines.length * 62 + 70;
  const x0 = c.side === 'kanan' ? W - 110 - w : 110;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 30%, transparent 50%)', opacity: panel}} />
      <div
        style={{
          position: 'absolute',
          left: x0,
          top: y0,
          width: w,
          height: h,
          borderRadius: 22,
          background: 'linear-gradient(160deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))',
          border: '1.5px solid rgba(242,195,91,0.55)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.55), inset 0 0 40px rgba(242,195,91,0.08)',
          backdropFilter: 'blur(6px)',
          opacity: panel,
          transform: `scale(${1.25 - 0.25 * slam})`,
          transformOrigin: `${c.side === 'kanan' ? x0 + w : x0}px ${y0 + h}px`,
          padding: '26px 40px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 6, color: CYAN, textShadow: `0 0 10px ${CYAN}`}}>
          // FAIL PENTADBIR {c.no} · <span style={{color: '#5dff9b'}}>DISAHKAN</span>
        </div>
        {lines.map((l, i) => (
          <Gold key={i} size={lines.length > 1 ? 54 : 64} font={SERIF} spacing={3} shine={shine} style={{marginTop: i === 0 ? 10 : 0}}>
            <Scramble text={l} reveal={reveal} seed={`n${c.no}${i}`} />
          </Gold>
        ))}
        <div style={{fontFamily: ORB, fontWeight: 700, fontSize: 30, letterSpacing: 7, whiteSpace: 'nowrap', color: '#fff', marginTop: 10, opacity: jaw, transform: `translateX(${(1 - jaw) * -30}px)`, textShadow: '0 0 14px rgba(98,230,255,0.8)'}}>
          {c.jawatan}
        </div>
      </div>
      <Brackets rect={[x0 - 18, y0 - 18, x0 + w + 18, y0 + h + 18]} p={panel} color={GOLD} len={30} />
      <AbsoluteFill style={{background: '#fff', opacity: interpolate(fr, [0, 2, 8], [0.55, 0.55, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- tajuk lokasi
const TajukLokasi: React.FC<{teks: string; dur: number}> = ({teks, dur}) => {
  const fr = useCurrentFrame();
  const op = ci(fr, 4, 14) * (1 - ci(fr, dur - 10, dur));
  const line = ci(fr, 4, 22, 0, 1, easeOut);
  return (
    <div style={{position: 'absolute', left: 110, bottom: 150, opacity: op}}>
      <div style={{width: 420 * line, height: 2, background: CYAN, boxShadow: `0 0 10px ${CYAN}`, marginBottom: 14}} />
      <div style={{fontFamily: ORB, fontWeight: 700, fontSize: 40, letterSpacing: 10, color: '#fff', textShadow: '0 0 16px rgba(98,230,255,0.8), 0 3px 10px #000'}}>
        <Scramble text={teks} reveal={ci(fr, 6, 26)} seed={teks} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- klip
const KlipBlock: React.FC<{b: Extract<Block, {kind: 'klip'}>; fd: number}> = ({b, fd}) => {
  const fr = useCurrentFrame();
  let t0 = 0;
  const seqs = b.pieces.map((p, i) => {
    const a = Math.round(t0 * MFPS);
    t0 += pieceDur(p);
    const d = Math.round(t0 * MFPS) - a;
    return (
      <Sequence key={i} from={a} durationInFrames={d}>
        <PieceView p={p} d={d} />
      </Sequence>
    );
  });
  // dolly zoom digital: tolak masuk pantas + vignet
  let dz = 1;
  let vig = 0;
  if (b.dolly) {
    const [a, z] = b.dolly.map((x) => x * MFPS);
    const p = ci(fr, a, z, 0, 1, Easing.inOut(Easing.cubic));
    dz = 1 + 0.18 * Math.sin(Math.PI * Math.min(1, p * 1.0)) * (p < 1 ? 1 : 0) + 0.0;
    vig = Math.sin(Math.PI * p) * 0.6;
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${dz})`}}>{seqs}</AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at center, transparent 35%, rgba(0,10,25,${vig}) 100%)`}} />
      {b.tajuk && <TajukLokasi teks={b.tajuk} dur={fd} />}
      {b.card && (
        <Sequence from={Math.round(b.card.at * MFPS)}>
          <KadNama c={b.card} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};

const PieceView: React.FC<{p: Extract<Block, {kind: 'klip'}>['pieces'][number]; d: number}> = ({p, d}) => {
  const fr = useCurrentFrame();
  const z = p.zoom ? interpolate(fr, [0, d], p.zoom) : 1;
  return (
    <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: `${(p.ox ?? 0.5) * 100}% ${(p.oy ?? 0.5) * 100}%`}}>
      <OffthreadVideo src={staticFile(p.src)} trimBefore={Math.round(p.from * MFPS)} playbackRate={p.rate} muted style={{width: W, height: H, objectFit: 'cover'}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- tajuk besar
const TajukBlock: React.FC<{teks: string; kecil: string; fd: number}> = ({teks, kecil, fd}) => {
  const fr = useCurrentFrame();
  const s = ci(fr, 0, 8, 0, 1, Easing.out(Easing.back(1.6)));
  const out = 1 - ci(fr, fd - 8, fd);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, #0b1d3a 0%, #02040a 75%)', alignItems: 'center', justifyContent: 'center'}}>
      <HexGrid opacity={0.25} />
      <Stars n={110} seed="tj" opacity={0.6} />
      <HudRings cx={W / 2} cy={H / 2} r={330} p={ci(fr, 0, 30)} />
      <div style={{textAlign: 'center', opacity: out, transform: `scale(${1.6 - 0.6 * s})`}}>
        <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 10, color: CYAN, marginBottom: 18}}>{kecil}</div>
        <GlitchText size={110} spacing={10} intensity={0.35 * (1 - ci(fr, 10, 30))} seed="tj" color="#ffffff">
          {teks}
        </GlitchText>
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: interpolate(fr, [0, 3, 10], [0.8, 0.8, 0], {extrapolateRight: 'clamp'})}} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- hologram pengenalan
const LOG = ['> IMBASAN BIOMETRIK', '> PADANAN WAJAH ........ 99.8%', '> REKOD PENTADBIR DITEMUI', '> AKSES: DISAHKAN'];
const HologramBlock: React.FC<{foto: string; card: Card; sisi: 'kiri' | 'kanan'; seed: string}> = ({foto, card, sisi, seed}) => {
  const fr = useCurrentFrame();
  const p = ci(fr, 0, 20, 0, 1, easeOut);
  const fx = sisi === 'kanan' ? 1340 : 580;
  const fy = 420;
  const pw = 400;
  const ph = 500;
  const scan = interpolate(fr, [4, 34], [0, ph], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scanOn = fr < 40;
  const glitch = fr < 10 ? (fr % 3 === 0 ? 14 : -10) * (1 - fr / 10) : 0;
  const logX = sisi === 'kanan' ? 120 : 1340;
  const kad: Card = {...card, side: sisi === 'kanan' ? 'kiri' : 'kanan'};
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #0d2a4a 0%, #02040a 80%)'}}>
      <HexGrid opacity={0.2} />
      <Stars n={90} seed={seed} opacity={0.5} />
      <HudRings cx={fx} cy={fy} r={265} p={p} />
      <div style={{position: 'absolute', left: fx - pw / 2 + glitch, top: fy - ph / 2, width: pw, height: ph, borderRadius: 16, overflow: 'hidden', opacity: p, boxShadow: '0 0 60px rgba(98,230,255,0.45)', transform: `scale(${1.08 - 0.08 * p})`}}>
        <Img src={staticFile(foto)} style={{width: pw, height: ph, objectFit: 'cover', objectPosition: '50% 20%', filter: 'saturate(0.75) contrast(1.08) brightness(1.05)'}} />
        <AbsoluteFill style={{background: 'linear-gradient(0deg, rgba(98,230,255,0.32), rgba(98,230,255,0.06))', mixBlendMode: 'screen'}} />
        {scanOn && <div style={{position: 'absolute', left: 0, top: scan, width: pw, height: 5, background: CYAN, boxShadow: `0 0 22px ${CYAN}`}} />}
        {scanOn && <div style={{position: 'absolute', left: 0, top: 0, width: pw, height: scan, background: 'rgba(98,230,255,0.12)'}} />}
        <Scanlines opacity={0.45} />
      </div>
      <Brackets rect={[fx - pw / 2 - 26, fy - ph / 2 - 26, fx + pw / 2 + 26, fy + ph / 2 + 26]} p={ci(fr, 6, 22)} />
      <div style={{position: 'absolute', left: logX, top: 180, fontFamily: MONO, fontSize: 22, lineHeight: 1.8, color: CYAN, textShadow: `0 0 8px ${CYAN}`}}>
        {LOG.map((l, i) => {
          const st = 4 + i * 9;
          if (fr < st) return null;
          const n = Math.min(l.length, Math.floor((fr - st) * 2.2));
          return (
            <div key={i} style={{color: i === LOG.length - 1 ? '#5dff9b' : CYAN}}>
              {l.slice(0, n)}
            </div>
          );
        })}
      </div>
      <Sequence from={Math.round(card.at * MFPS)}>
        <KadNama c={kad} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- data penyertaan (gaya Tokoh)
const DataBlock: React.FC = () => {
  const fr = useCurrentFrame();
  const head = ci(fr, 0, 14, 0, 1, easeOut);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, #1a2f5a 0%, #03050c 78%)'}}>
      <HexGrid opacity={0.18} />
      <Stars n={120} seed="dt" opacity={0.6} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 10, color: CYAN, opacity: head}}>// DATA PEMBUDAYAAN DIGITAL</div>
        <div style={{opacity: head, transform: `scale(${1.2 - 0.2 * head})`, marginTop: 10}}>
          <Gold size={74} spacing={6} shine={ci(fr, 10, 40)}>
            SKeSO DALAM ANGKA
          </Gold>
        </div>
        <div style={{display: 'flex', gap: 36, marginTop: 54}}>
          {DATA_KAD.map((s, i) => {
            const a = 10 + i * 8;
            const p = ci(fr, a, a + 12, 0, 1, easeOut);
            const n = Math.round(s.n * ci(fr, a, a + 36, 0, 1, Easing.out(Easing.cubic)));
            return (
              <div
                key={i}
                style={{
                  width: 380,
                  height: 310,
                  borderRadius: 26,
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.11), rgba(255,255,255,0.03))',
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
                <Gold size={130}>
                  {String(n)}
                  {s.s}
                </Gold>
                <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 25, letterSpacing: 4, color: '#fff', marginTop: 10, textAlign: 'center'}}>{s.l}</div>
                <div style={{fontFamily: MONO, fontSize: 17, letterSpacing: 2, color: CYAN, marginTop: 8}}>{s.k}</div>
              </div>
            );
          })}
        </div>
        <div style={{display: 'flex', gap: 24, marginTop: 44}}>
          {DATA_JALUR.map((t, i) => {
            const a = 56 + i * 10;
            const p = ci(fr, a, a + 10, 0, 1, Easing.out(Easing.back(1.6)));
            return (
              <div key={i} style={{opacity: Math.min(1, p), transform: `scale(${0.6 + 0.4 * p})`, fontFamily: SANS, fontWeight: 700, fontSize: 23, letterSpacing: 2, whiteSpace: 'nowrap', color: '#f3ead6', padding: '12px 26px', borderRadius: 40, border: '1.5px solid rgba(98,230,255,0.6)', background: 'rgba(98,230,255,0.08)'}}>
                <span style={{color: GOLD}}>◆ </span>
                {t}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Vignette />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- penutup
const AkhirBlock: React.FC<{fd: number}> = ({fd}) => {
  const fr = useCurrentFrame();
  const p = ci(fr, 6, 28, 0, 1, easeOut);
  const out = 1 - ci(fr, fd - 20, fd);
  const z = interpolate(fr, [0, fd], [1.08, 1.12]);
  return (
    <AbsoluteFill style={{background: '#000', opacity: out}}>
      <AbsoluteFill style={{transform: `scale(${z})`, transformOrigin: '30% 30%'}}>
        <OffthreadVideo src={staticFile('montaj/gb_senja_b.mp4')} muted style={{width: W, height: H, objectFit: 'cover', filter: 'brightness(0.9) saturate(1.1)'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 35%, rgba(0,0,0,0) 55%)'}} />
      <div style={{position: 'absolute', left: 120, top: 0, height: H, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 10, color: CYAN, opacity: p}}>BARISAN KEPIMPINAN 2026</div>
        <div style={{transform: `translateX(${(1 - p) * -40}px)`, opacity: p, marginTop: 10}}>
          <Gold size={150} spacing={8} shine={ci(fr, 24, 64)}>
            SKeSO
          </Gold>
        </div>
        <div style={{width: 520 * ci(fr, 16, 36, 0, 1, easeOut), height: 2, background: GOLD, boxShadow: `0 0 10px ${GOLD}`, margin: '16px 0 18px'}} />
        {['BE EXCELLENT', 'MERENTAS KECEMERLANGAN'].map((t, i) => (
          <div key={t} style={{fontFamily: ORB, fontWeight: 700, fontSize: 36, letterSpacing: 7, color: '#fff', opacity: ci(fr, 22 + i * 8, 36 + i * 8), lineHeight: 1.5, textShadow: '0 0 16px rgba(98,230,255,0.7), 0 3px 10px #000'}}>
            {t}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- whip pan
const Whip: React.FC<{children: React.ReactNode; fd: number; masuk: boolean; keluar: boolean}> = ({children, fd, masuk, keluar}) => {
  const fr = useCurrentFrame();
  let x = 0;
  let blur = 0;
  if (masuk && fr < WHIP) {
    const p = 1 - fr / WHIP;
    x = p * p * W * 0.55;
    blur = p * 26;
  }
  if (keluar && fr > fd - WHIP) {
    const p = (fr - (fd - WHIP)) / WHIP;
    x = -p * p * W * 0.55;
    blur = p * 26;
  }
  return <AbsoluteFill style={{transform: `translateX(${x}px)`, filter: blur > 0.5 ? `blur(${blur}px) brightness(${1 + blur / 40})` : undefined}}>{children}</AbsoluteFill>;
};

const Letterbox: React.FC = () => (
  <>
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: 70, background: '#000'}} />
    <div style={{position: 'absolute', left: 0, bottom: 0, width: W, height: 70, background: '#000'}} />
  </>
);

export const MontajPentadbir: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {TL.map(({b, f0, fd}, i) => {
      const prev = i > 0 ? TL[i - 1].b : null;
      const masuk = !!(prev && (prev.kind === 'klip' || prev.kind === 'hologram') && prev.whipOut);
      const keluar = (b.kind === 'klip' || b.kind === 'hologram') && !!b.whipOut;
      let body: React.ReactNode = null;
      if (b.kind === 'klip') body = <KlipBlock b={b} fd={fd} />;
      if (b.kind === 'tajuk') body = <TajukBlock teks={b.teks} kecil={b.kecil} fd={fd} />;
      if (b.kind === 'hologram') body = <HologramBlock foto={b.foto} card={b.card} sisi={b.sisi} seed={b.id} />;
      if (b.kind === 'data') body = <DataBlock />;
      if (b.kind === 'akhir') body = <AkhirBlock fd={fd} />;
      return (
        <Sequence key={b.id} from={f0} durationInFrames={fd}>
          <Whip fd={fd} masuk={masuk} keluar={keluar}>
            {body}
          </Whip>
        </Sequence>
      );
    })}
    <Letterbox />
    <Audio src={staticFile('audio/muzik_montaj.wav')} />
  </AbsoluteFill>
);
