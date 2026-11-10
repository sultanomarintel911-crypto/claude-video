import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, staticFile} from 'remotion';
import '@fontsource/cinzel/700.css';
import '@fontsource/cinzel/800.css';
import '@fontsource/cinzel/900.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import {CLUES, f, FPS, MUSIK_KEMENANGAN_MULA, SHOTS, T} from './data';
import {SceneClue, SceneDron, SceneFinale, SceneKira, SceneReveal, SceneShot, SceneSiluet, SceneTajuk} from './scenes';

// --------------------------------------------------------------- kesan bunyi
type Sfx = {at: number; file: string; vol: number};
const SFX: Sfx[] = [];
const add = (at: number, file: string, vol = 1) => SFX.push({at, file, vol});

// pembukaan dron
add(0.0, 'whoosh_panjang', 0.45);
add(1.05, 'swish_teks', 0.55);
add(6.75, 'swish_teks', 0.5);
add(7.6, 'cymbal_terbalik', 0.7);
add(9.55, 'whoosh_panjang', 0.6);
// tajuk
add(T.tajukHit, 'impact_lembut', 1.0);
add(T.tajukHit + 0.05, 'kilauan', 0.6);
add(T.tajuk + 5.1, 'swish_teks', 0.55);
add(T.tajuk + 5.1, 'sub_drop', 0.5);
// petunjuk
CLUES.forEach((c, i) => {
  const s = T.clue0 + i * T.clueLen;
  add(s - 0.3, 'whoosh_pendek', 0.55);
  const n = c.teks.length;
  for (let k = 0; k < n; k += 2) {
    if (c.teks[k] !== ' ') add(s + 0.25 + (1.55 * k) / n, 'taip', 0.55);
  }
  add(s + 2.1, 'impact_lembut', 0.75);
  add(s + 2.15, 'kilauan', 0.4);
  if (c.extra === 'kaunter') for (let k = 0; k < 6; k++) add(s + 2.2 + k * 0.18, 'blip', 0.7);
  if (c.extra === 'bintang') for (let k = 0; k < 4; k++) add(s + 2.5 + (k * 7) / FPS, 'pop_bintang', 0.7);
});
// siluet
add(T.siluet, 'sub_drop', 0.8);
add(T.siluet, 'api', 0.85);
add(T.siluet + 2.6, 'bara_naik', 0.9);
add(T.siluet + 4.4, 'swish_teks', 0.5);
[4.5, 5.45, 6.4].forEach((d) => add(T.siluet + d, 'degupan', 1.0));
// kiraan detik
add(T.kira - 1.0, 'riser', 0.85);
add(T.kira, 'drumroll', 0.85);
[0, 1, 2].forEach((k) => {
  add(T.kira + k, 'impact_lembut', 0.55);
  add(T.kira + k, 'detik', 0.8);
});
// pendedahan
add(T.reveal, 'impact_besar', 1.0);
add(T.reveal + 0.05, 'kilauan', 0.7);
add(T.reveal + 0.3, 'tepukan', 0.55);
add(T.reveal + 34 / FPS + 0.0, 'swish_teks', 0.45);
add(T.reveal + 41 / FPS, 'swish_teks', 0.4);
add(T.reveal + 2.7, 'kilauan', 0.35);
// montaj
SHOTS.forEach((s, i) => {
  const m = T.montaj + i * T.shotLen;
  add(m - 0.12, 'whoosh_pendek', 0.5);
  if (s.kind === 'foto') add(m, 'kamera', 0.35);
  if (s.kind === 'foto' || s.kind === 'video') add(m + 0.3, 'swish_teks', 0.35);
  if (s.kind === 'foto' && s.badge) {
    add(m + 26 / FPS, 'impact_lembut', 0.55);
    add(m + 30 / FPS, 'kilauan', 0.45);
  }
  if (s.kind === 'statistik') for (let k = 0; k < 4; k++) for (let j = 0; j < 5; j++) add(m + (8 + k * 7 + j * 5) / FPS, 'blip', 0.45);
  if (s.kind === 'kebangsaan') for (let k = 0; k < 6; k++) add(m + (10 + k * 14.6 * 0.75) / FPS, 'swish_teks', 0.35);
});
// penutup
add(T.finale, 'impact_lembut', 0.9);
add(T.finale + 0.05, 'kilauan', 0.7);
add(T.finale + 0.2, 'tepukan', 0.65);
add(T.finale + 1.4, 'kilauan', 0.4);

// --------------------------------------------------------------- video utama
export const TokohMurid: React.FC = () => {
  const [handle] = useState(() => delayRender('fon'));
  useEffect(() => {
    Promise.all([
      document.fonts.load('900 40px Cinzel'),
      document.fonts.load('800 40px Cinzel'),
      document.fonts.load('700 40px Cinzel'),
      document.fonts.load('500 40px Montserrat'),
      document.fonts.load('600 40px Montserrat'),
      document.fonts.load('700 40px Montserrat'),
    ]).then(() => continueRender(handle));
  }, [handle]);

  const endF = f(T.end);
  const musik2Len = f(T.end - MUSIK_KEMENANGAN_MULA);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence from={f(T.dron)} durationInFrames={f(10.05)}>
        <SceneDron />
      </Sequence>
      <Sequence from={f(T.tajuk)} durationInFrames={f(T.clue0 - T.tajuk)}>
        <SceneTajuk />
      </Sequence>
      {CLUES.map((_, i) => (
        <Sequence key={i} from={f(T.clue0 + i * T.clueLen)} durationInFrames={f(T.clueLen)}>
          <SceneClue i={i} />
        </Sequence>
      ))}
      <Sequence from={f(T.siluet)} durationInFrames={f(T.siluetLen)}>
        <SceneSiluet />
      </Sequence>
      <Sequence from={f(T.kira)} durationInFrames={f(T.reveal - T.kira)}>
        <SceneKira />
      </Sequence>
      <Sequence from={f(T.reveal)} durationInFrames={f(T.montaj - T.reveal)}>
        <SceneReveal />
      </Sequence>
      {SHOTS.map((s, i) => {
        const from = f(T.montaj + i * T.shotLen);
        const to = f(T.montaj + (i + 1) * T.shotLen);
        return (
          <Sequence key={i} from={from} durationInFrames={to - from}>
            <SceneShot s={s} dur={to - from} />
          </Sequence>
        );
      })}
      <Sequence from={f(T.finale)} durationInFrames={endF - f(T.finale)}>
        <SceneFinale />
      </Sequence>

      {/* muzik */}
      <Sequence from={0} durationInFrames={f(T.reveal)}>
        <Audio
          src={staticFile('audio/misteri.mp3')}
          volume={(fr) => interpolate(fr, [0, f(1.5), f(T.kira - 1.5), f(T.kira + 0.3)], [0, 0.7, 0.7, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        />
      </Sequence>
      <Sequence from={f(MUSIK_KEMENANGAN_MULA)} durationInFrames={musik2Len}>
        <Audio
          src={staticFile('audio/kemenangan.mp3')}
          volume={(fr) => interpolate(fr, [0, musik2Len - f(3.5), musik2Len], [0.85, 0.85, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        />
      </Sequence>
      {/* kesan bunyi */}
      {SFX.map((s, i) => (
        <Sequence key={'sfx' + i} from={Math.max(0, f(s.at))}>
          <Audio src={staticFile(`sfx/${s.file}.wav`)} volume={s.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
