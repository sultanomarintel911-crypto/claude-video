import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/bebas-neue/400.css';
import '@fontsource/unifrakturmaguntia/400.css';
import '@fontsource/special-elite/400.css';
import '@fontsource/montserrat/300.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import {at, CLIP_END, CLIP_START, LEAD, SFX, TOTAL} from './data';
import {Background, ci, Flash, Header, Subtitles, useShake} from './ui';
import {BlackParade, Dajjal, Fail, Intro, MCR, Minat, Outro, Perarakan, Perhatikan, Piramid, Ulang} from './scenes';

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const fams = ['Bebas Neue', 'UnifrakturMaguntia', 'Special Elite', 'Montserrat'];
    Promise.all(fams.flatMap((f) => [document.fonts.load(`400 40px '${f}'`), document.fonts.load(`800 40px '${f}'`)]))
      .then(() => document.fonts.ready)
      .then(() => continueRender(h));
  }, [h]);
};

export const KisahMCR: React.FC = () => {
  useFonts();
  const fr = useCurrentFrame();
  const shake = useShake();
  const endFade = ci(fr, TOTAL - 12, TOTAL - 1, 1, 0);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: endFade}}>
        <Background />
        <AbsoluteFill style={{transform: shake}}>
          <Intro />
          <MCR />
          <BlackParade />
          <Minat />
          <Dajjal />
          <Perhatikan />
          <Piramid />
          <Perarakan />
          <Fail />
          <Ulang />
          <Outro />
        </AbsoluteFill>
        <Flash />
        <Header />
        <Subtitles />
      </AbsoluteFill>

      <Sequence from={at(CLIP_START)} durationInFrames={at(CLIP_END) - at(CLIP_START)}>
        <Audio src={staticFile('audio/ceramah_mcr.wav')} />
      </Sequence>
      {SFX.map(([f, t, v], i) => (
        <Sequence key={i} from={Math.max(0, at(t))}>
          <Audio src={staticFile(`sfx/${f}`)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export {LEAD};
