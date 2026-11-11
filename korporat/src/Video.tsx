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
import {Bio, Emas, Kertas, Klip, Statistik, Tutup} from './scenes';

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
    default:
      return (
        <AbsoluteFill>
          <Klip s={s} />
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
