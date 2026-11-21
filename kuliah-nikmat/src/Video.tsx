import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/amiri/400.css';
import '@fontsource/amiri/700.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import {at, CLIP_END, CLIP_START, SFX, TOTAL} from './data';
import {Background, ci, Header, Speaker, Subtitles, useShake} from './ui';
import {Bismillah, Contoh, HadisKad, Intro, Pengajaran, Penutup, Sanad, Syarat, TidakLarang} from './scenes';

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all([
      document.fonts.load("400 60px 'Amiri'", 'بسم الله'),
      document.fonts.load("700 60px 'Amiri'", 'بسم الله'),
      ...[600, 700, 800, 900].map((w) => document.fonts.load(`${w} 40px 'Montserrat'`)),
    ])
      .then(() => document.fonts.ready)
      .then(() => continueRender(h));
  }, [h]);
};

export const VideoTipografi: React.FC = () => {
  useFonts();
  const fr = useCurrentFrame();
  const shake = useShake();
  const endFade = ci(fr, TOTAL - 10, TOTAL - 1, 1, 0);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: endFade}}>
        <Background />
        <AbsoluteFill style={{transform: shake}}>
          <Intro />
          <Bismillah />
          <Sanad />
          <HadisKad />
          <Contoh />
          <Pengajaran />
          <TidakLarang />
          <Syarat />
          <Penutup />
        </AbsoluteFill>
        <Header />
        <Speaker />
        <Subtitles />
      </AbsoluteFill>

      <Sequence from={at(CLIP_START)} durationInFrames={at(CLIP_END) - at(CLIP_START)}>
        <Audio src={staticFile('audio/suara.wav')} />
      </Sequence>
      {SFX.map(([f, t, v], i) => (
        <Sequence key={i} from={Math.max(0, at(t))}>
          <Audio src={staticFile(`sfx/${f}`)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
