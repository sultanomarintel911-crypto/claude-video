import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, Sequence, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/poppins/900.css';
import '@fontsource/amiri/400.css';
import '@fontsource/amiri/700.css';
import {at, AUDIO_LEN, FPS, LEAD, SFX, TOTAL} from './data';
import {Background, ci, Header, Subtitles} from './ui';
import {Asr, Bahaya, Dakwaan, Gandingan, Intro, Kabur, Kaffah, Murjiah, PadaNama, Penutup, Racun, Spiritual, TakSempurna, Teruskan} from './scenes';

const useFonts = () => {
  const [h] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all([
      ...[600, 700, 800, 900].map((w) => document.fonts.load(`${w} 40px 'Poppins'`)),
      document.fonts.load("400 60px 'Amiri'", 'بسم الله'),
    ])
      .then(() => document.fonts.ready)
      .then(() => continueRender(h));
  }, [h]);
};

export const VideoTipografi: React.FC = () => {
  useFonts();
  const fr = useCurrentFrame();
  const endFade = ci(fr, TOTAL - 10, TOTAL - 1, 1, 0);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{opacity: endFade}}>
        <Background />
        <Intro />
        <Dakwaan />
        <Racun />
        <Spiritual />
        <PadaNama />
        <Kabur />
        <Murjiah />
        <Asr />
        <Gandingan />
        <Kaffah />
        <TakSempurna />
        <Bahaya />
        <Teruskan />
        <Penutup />
        <Header />
        <Subtitles />
      </AbsoluteFill>
      <Sequence from={Math.round(LEAD * FPS)} durationInFrames={Math.round(AUDIO_LEN * FPS) + 10}>
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
