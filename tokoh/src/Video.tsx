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
const SENYAP = T.reveal - 0.44; // detik senyap mutlak sebelum pendedahan
const add = (at: number, file: string, vol = 1) => SFX.push({at, file, vol});

// pembukaan dron
add(0.0, 'whoosh_panjang', 0.45);
add(1.05, 'swish_teks', 0.55);
add(6.75, 'swish_teks', 0.5);
add(7.6, 'cymbal_terbalik', 0.7);
add(9.55, 'whoosh_panjang', 0.6);
// tajuk: sedutan -> BRAAAM
add(T.tajukHit - 1.6, 'sedutan', 0.6);
add(T.tajukHit, 'braam', 0.95);
add(T.tajukHit, 'impact_lembut', 0.7);
add(T.tajukHit + 0.05, 'kilauan', 0.55);
add(T.tajuk + 5.2, 'swish_teks', 0.55);
add(T.tajuk + 5.2, 'sub_drop', 0.6);
// petunjuk: dengung tegang + sedutan -> taiko pada kata kunci
add(T.clue0 - 0.5, 'dengung', 0.6);
CLUES.forEach((c, i) => {
  const s = T.clue0 + i * T.clueLen;
  add(s - 0.3, 'whoosh_pendek', 0.5);
  const n = c.teks.length;
  for (let k = 0; k < n; k += 2) {
    if (c.teks[k] !== ' ') add(s + 0.25 + (1.55 * k) / n, 'taip', 0.5);
  }
  add(s + 2.1 - 1.6, 'sedutan', 0.5);
  add(s + 2.1, 'taiko', 0.9);
  add(s + 2.15, 'kilauan', 0.4);
  if (c.extra === 'kaunter') for (let k = 0; k < 6; k++) add(s + 2.2 + k * 0.18, 'blip', 0.7);
  if (c.extra === 'bintang') for (let k = 0; k < 4; k++) add(s + 2.5 + (k * 7) / FPS, 'pop_bintang', 0.7);
});
// siluet
add(T.siluet, 'sub_drop', 0.8);
add(T.siluet, 'api', 0.7);
add(T.siluet + 2.6, 'bara_naik', 0.75);
add(T.siluet + 4.4 - 2.5, 'stinger', 0.45);
add(T.siluet + 4.4, 'taiko', 0.7);
add(T.siluet + 4.4, 'swish_teks', 0.5);
// degupan jantung makin laju sehingga senyap sebelum pendedahan
{
  const senyap = T.reveal - 0.44;
  let tb = T.siluet + 2.2;
  let gap = 1.05;
  while (tb < senyap - 0.25) {
    add(tb, 'degupan', 0.8);
    tb += gap;
    gap = Math.max(0.42, gap * 0.9);
  }
}
// kiraan detik: riser & drumroll berakhir tepat pada detik senyap
add(T.reveal - 0.44 - 4.0, 'riser', 0.85);
add(T.reveal - 0.44 - 3.0, 'drumroll', 0.85);
[0, 1, 2].forEach((k) => {
  add(T.kira + k, 'taiko', 0.75);
  add(T.kira + k, 'detik', 0.8);
});
// PENDEDAHAN: senyap 0.44 s -> BOOM + BRAAAM + koir
add(T.reveal, 'impact_besar', 0.7);
add(T.reveal, 'braam', 0.65);
add(T.reveal, 'sub_drop', 0.5);
add(T.reveal + 0.05, 'kilauan', 0.7);
add(T.reveal + 0.1, 'koir', 0.55);
add(T.reveal + 0.6, 'tepukan', 0.55);
add(T.reveal + 34 / FPS, 'swish_teks', 0.45);
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
add(T.finale - 1.6, 'sedutan', 0.5);
add(T.finale, 'impact_lembut', 0.9);
add(T.finale, 'braam', 0.6);
add(T.finale + 0.1, 'koir', 0.45);
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
  const musik2Len = f(T.end - T.reveal);
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
      <Sequence from={f(T.reveal)} durationInFrames={musik2Len}>
        <Audio
          src={staticFile('audio/kemenangan.mp3')}
          trimBefore={f(T.reveal - MUSIK_KEMENANGAN_MULA)}
          volume={(fr) => interpolate(fr, [0, musik2Len - f(3.5), musik2Len], [0.85, 0.85, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        />
      </Sequence>
      {/* kesan bunyi */}
      {SFX.map((s, i) => {
        const from = Math.max(0, f(s.at));
        const cut = from < f(SENYAP) ? f(SENYAP) - from : Infinity;
        return (
          <Sequence key={'sfx' + i} from={from}>
            <Audio src={staticFile(`sfx/${s.file}.wav`)} volume={(fr) => (fr >= cut ? 0 : fr >= cut - 2 ? s.vol * 0.3 : s.vol)} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
