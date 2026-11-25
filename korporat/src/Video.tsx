import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/orbitron/700.css';
import '@fontsource/orbitron/900.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import React from 'react';
import {AbsoluteFill, Audio, interpolate, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {FPS, Seg, SEGS, VO_FILE} from './data';
import {BabTag, glitchAmt, GlitchOverlay, Grade, Hud, Label} from './fx';
import {Emblem3D, Graf3D, Terowong3D} from './tiga';
import {IntroBadge} from './intro';
import {MaklumatGlob} from './maklumat3d';
import {Terafecta} from './terafecta';
import {Bio, Emas, KadAsal, KadPentadbir, Kertas, Klip, PanelHem, Statistik, Tutup} from './scenes';

// Syot pemanduan GB: bar letterbox 2.39:1 yang masuk pada syot pertama dan keluar pada syot terakhir
const Sinema: React.FC<{s: Seg}> = ({s}) => {
  const frame = useCurrentFrame();
  const i = SEGS.indexOf(s);
  const pertama = SEGS[i - 1]?.kind !== 'sinema';
  const akhir = SEGS[i + 1]?.kind !== 'sinema';
  const c = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  const k = (pertama ? interpolate(frame, [0, 14], [0, 1], c) : 1) * (akhir ? interpolate(frame, [s.fd - 12, s.fd], [1, 0], c) : 1);
  const bar = 138 * k;
  return (
    <AbsoluteFill>
      <Klip s={s} />
      {/* smash to black: skrin gelap sekejap sebelum drop muzik, GB keluar kereta */}
      {s.id === 'drv_pergi' && frame >= s.fd - 12 && <AbsoluteFill style={{background: '#000'}} />}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bar, background: '#000'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: bar, background: '#000'}} />
    </AbsoluteFill>
  );
};

const SegView: React.FC<{s: Seg}> = ({s}) => {
  switch (s.kind) {
    case 'bio':
      return <Bio s={s} />;
    case 'kertas':
      return <Kertas s={s} />;
    case 'statistik':
      return <Statistik s={s} />;
    case 'emas':
      return <Emas s={s} />;
    case 'tutup':
      return <Tutup />;
    case 'intro':
      return <IntroBadge fd={s.fd} />;
    case 'emblem3d':
      return <Emblem3D fd={s.fd} />;
    case 'terowong':
      return <Terowong3D fd={s.fd} teks="03 // PEMBUDAYAAN DIGITAL" />;
    case 'graf3d':
      return <Graf3D fd={s.fd} />;
    case 'maklumat':
      return <MaklumatGlob fd={s.fd} />;
    case 'sinema':
      return <Sinema s={s} />;
    case 'terafecta':
      return <Terafecta fd={s.fd} />;
    case 'kad':
      return <KadAsal jawatan="GPK HAL EHWAL MURID" nama="ROAZMI BIN MOHAMAD" fd={s.fd} />;
    default:
      return (
        <AbsoluteFill>
          <Klip s={s} />
          {s.id === 'hem_baru' && <PanelHem s={s} />}
        </AbsoluteFill>
      );
  }
};

// Seluruh imej bergegar + warna terganggu sekejap pada setiap potongan
const Gegar: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const g = glitchAmt(frame);
  const dx = g > 0 ? (random(`gx${frame}`) - 0.5) * 40 * g : 0;
  return (
    <AbsoluteFill style={{transform: `translateX(${dx}px) scale(${1 + 0.02 * g})`, filter: g > 0 ? `hue-rotate(${g * 70}deg) saturate(${1 + g}) contrast(${1 + 0.4 * g})` : undefined}}>
      {children}
    </AbsoluteFill>
  );
};

const VoTrack: React.FC<{s: Seg}> = ({s}) => {
  const v = VO_FILE[s.vo as 'k' | 'w'];
  const a = Math.round(s.f0 + (((s.voFrom as number) - s.from) / s.rate) * FPS);
  const d = Math.round((((s.voTo as number) - (s.voFrom as number)) / s.rate) * FPS);
  return (
    <Sequence from={a} durationInFrames={d}>
      <Audio
        src={staticFile(v.src)}
        trimBefore={Math.round(((s.voFrom as number) - v.zero) * FPS)}
        playbackRate={s.rate}
        volume={(fr) => interpolate(fr, [0, 6, d - 8, d], [0, 1.15, 1.15, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      />
    </Sequence>
  );
};

export const KorporatSKeSO: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Gegar>
      {SEGS.map((s) => (
        <Sequence key={s.id} from={s.f0} durationInFrames={s.fd}>
          <SegView s={s} />
        </Sequence>
      ))}
    </Gegar>
    <Grade />
    <Hud />
    {SEGS.filter((s) => s.bab).map((s) => (
      <Sequence key={'b' + s.id} from={s.f0} durationInFrames={Math.round(4.3 * FPS)}>
        <BabTag text={s.bab as string} />
      </Sequence>
    ))}
    {SEGS.filter((s) => s.label).map((s) => (
      <Sequence key={'l' + s.id} from={s.f0} durationInFrames={Math.round(5.1 * FPS)}>
        <Label text={s.label as string} />
      </Sequence>
    ))}
    <GlitchOverlay />
    <Audio src={staticFile('audio/muzik.wav')} />
    {SEGS.filter((s) => s.vo).map((s) => (
      <VoTrack key={'v' + s.id} s={s} />
    ))}
  </AbsoluteFill>
);
