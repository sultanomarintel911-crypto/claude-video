import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, Sequence, staticFile} from 'remotion';
import '@fontsource/cinzel/700.css';
import '@fontsource/cinzel/800.css';
import '@fontsource/cinzel/900.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/orbitron/700.css';
import '@fontsource/orbitron/900.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import {f, FPS, MUSIK_KEMENANGAN_MULA, SHOTS, SIFAT_MASA, T, TEASER} from './data';
import {SceneBuka, SceneKira, SceneReveal, SceneShot, SceneSiluet, SceneTajuk} from './scenes';
import {SceneBumi, SceneMozek, SceneSah, SceneTeaser, SceneWarp} from './v6';

// --------------------------------------------------------------- kesan bunyi
type Sfx = {at: number; file: string; vol: number};
const SFX: Sfx[] = [];
const SENYAP = T.reveal - 0.44; // detik senyap mutlak sebelum pendedahan
const add = (at: number, file: string, vol = 1) => SFX.push({at, file, vol});
const taip = (start: number, text: string, cps = 38, vol = 0.3) => {
  for (let k = 0; k < text.length; k += 2) if (text[k] !== ' ') add(start + k / cps, 'taip', vol);
};

// 1. pembukaan sci-fi
add(0, 'hum', 0.75);
add(0.8, 'glitch', 0.8);
add(0.8, 'hud_boot', 0.8);
add(0.8, 'sub_drop', 0.5);
taip(1.0, '> SISTEM ARKIB SK SULTAN OMAR · DALAM TALIAN');
add(2.2, 'bip', 0.6);
taip(2.2, '> MENGIMBAS REKOD MURID TAHUN 6 · 2026');
add(2.6, 'imbasan', 0.6);
add(2.6, 'data', 0.45);
add(6.18, 'taiko', 0.6);
add(6.2, 'bip', 0.6);
taip(6.2, '> MENGANALISIS: KEPIMPINAN · SUKAN · SAHSIAH · ILMU');
add(6.3, 'imbasan', 0.5);
taip(7.7, '> MENAPIS CALON...');
add(8.9, 'glitch', 0.8);
add(8.9, 'amaran', 0.75);
add(8.9, 'taiko', 0.7);
taip(9.0, '> PADANAN DISAHKAN. MEMBUKA FAIL...');
add(10.4, 'glitch', 0.7);
add(10.75, 'glitch', 0.6);
// 2. tajuk anugerah: sedutan -> BRAAAM
add(T.tajukHit - 1.6, 'sedutan', 0.6);
add(T.tajukHit, 'braam', 0.95);
add(T.tajukHit, 'impact_lembut', 0.7);
// 3. di bumi bertuah ini (dron -> bendera -> bintang)
add(T.dron - 0.2, 'whoosh_panjang', 0.5);
add(17.5, 'swish_teks', 0.45);
add(20.7, 'swish_teks', 0.4);
add(23.0, 'impact_lembut', 0.45);
add(23.0, 'whoosh_pendek', 0.45);
add(25.3, 'whoosh_pendek', 0.45);
add(25.6, 'swish_teks', 0.45);
add(T.fail - 2.5, 'cymbal_terbalik', 0.6);
// 4. teaser tanpa wajah: hentakan trailer pada setiap potongan, senyap pada jurang hitam
add(T.fail - 0.3, 'dengung', 0.5);
add(T.fail + 0.3, 'data', 0.2);
add(T.fail + 6.8, 'data', 0.2);
TEASER.forEach(([a], i) => {
  add(a, i % 2 === 0 ? 'taiko' : 'impact_lembut', i % 2 === 0 ? 0.9 : 0.7);
  add(a, 'glitch', 0.45);
  add(a - 0.25, 'whoosh_pendek', 0.4);
});
SIFAT_MASA.forEach((t) => {
  add(t - 1.6, 'sedutan', 0.5);
  add(t + 0.4, 'braam', 0.45);
  add(t + 0.45, 'imbasan', 0.3);
});
// identiti disahkan -> hiperangkasa
add(T.sah, 'amaran', 0.7);
add(T.sah, 'glitch', 0.8);
add(T.sah + 0.8, 'glitch', 0.6);
add(T.warp - 0.15, 'warp', 0.9);
add(T.siluet - 0.05, 'impact_lembut', 0.7);
// 5. siluet
add(T.siluet, 'sub_drop', 0.8);
add(T.siluet, 'api', 0.7);
add(T.siluet + 2.6, 'bara_naik', 0.75);
add(T.siluet + 3.6, 'imbasan', 0.6);
add(T.siluet + 4.4 - 2.5, 'stinger', 0.45);
add(T.siluet + 4.4, 'taiko', 0.7);
add(T.siluet + 4.5, 'bip', 0.5);
add(T.siluet + 4.4, 'swish_teks', 0.5);
{
  // degupan jantung makin laju sehingga senyap
  let tb = T.siluet + 2.2;
  let gap = 1.05;
  while (tb < SENYAP - 0.25) {
    add(tb, 'degupan', 0.8);
    tb += gap;
    gap = Math.max(0.42, gap * 0.9);
  }
}
// 6. kiraan detik
add(SENYAP - 4.0, 'riser', 0.85);
add(SENYAP - 3.0, 'drumroll', 0.85);
[0, 1, 2].forEach((k) => {
  add(T.kira + k, 'taiko', 0.75);
  add(T.kira + k, 'detik', 0.8);
});
// 7. PENDEDAHAN: senyap -> BOOM + BRAAAM + koir
add(T.reveal, 'impact_besar', 0.7);
add(T.reveal, 'braam', 0.65);
add(T.reveal, 'sub_drop', 0.5);
add(T.reveal + 0.1, 'koir', 0.55);
add(T.reveal + 0.2, 'whoosh_panjang', 0.4);
for (let k = 0; k < 2; k++) add(T.reveal + (36 + k * 20 - 20) / FPS, 'sedutan', 0.25);
add(T.reveal + 0.6, 'tepukan', 0.55);
add(T.reveal + 34 / FPS, 'swish_teks', 0.45);
add(T.reveal + 41 / FPS, 'swish_teks', 0.4);
// 8. montaj
SHOTS.forEach((s, i) => {
  const m = T.montaj + i * T.shotLen;
  add(m - 0.12, 'whoosh_pendek', 0.5);
  if (s.kind === 'foto') {
    add(m, 'kamera', 0.35);
    add(m + 0.3, 'swish_teks', 0.35);
    if (s.badge) add(m + 26 / FPS, 'impact_lembut', 0.55);
  }
  if (s.kind === 'triptik') {
    for (let k = 0; k < 3; k++) {
      add(m + (k * 14.63 * 0.9) / FPS, 'whoosh_pendek', 0.45);
      add(m + (k * 14.63 * 0.9) / FPS, 'kamera', 0.35);
    }
    add(m + (2 * 14.63) / FPS, 'swish_teks', 0.35);
  }
  if (s.kind === 'statistik') for (let k = 0; k < 4; k++) for (let j = 0; j < 5; j++) add(m + (8 + k * 7 + j * 5) / FPS, 'blip', 0.45);
  if (s.kind === 'kebangsaan') for (let k = 0; k < 6; k++) add(m + (10 + k * 14.6 * 0.75) / FPS, 'swish_teks', 0.35);
});
// 9. penutup: mozek -> potret hidup -> tahniah
add(T.finale - 0.1, 'whoosh_panjang', 0.5);
add(T.finale, 'kepingan', 0.85);
add(T.finale + 2.0, 'sedutan', 0.5);
add(T.finale + 3.2, 'impact_lembut', 0.85);
add(T.finale + 3.2, 'braam', 0.6);
add(T.finale + 3.3, 'koir', 0.5);
add(T.finale + 3.9, 'swish_teks', 0.45);
add(T.finale + 4.2, 'tepukan', 0.65);
add(T.finale + 9.2, 'whoosh_pendek', 0.4);

// --------------------------------------------------------------- video utama
export const TokohMurid: React.FC = () => {
  const [handle] = useState(() => delayRender('fon'));
  useEffect(() => {
    Promise.all(
      ['900 40px Cinzel', '800 40px Cinzel', '700 40px Cinzel', '500 40px Montserrat', '600 40px Montserrat', '700 40px Montserrat', '700 40px Orbitron', '900 40px Orbitron', '400 40px "JetBrains Mono"', '700 40px "JetBrains Mono"'].map((x) =>
        document.fonts.load(x),
      ),
    ).then(() => continueRender(handle));
  }, [handle]);

  const endF = f(T.end);
  const musik2Len = f(T.end - T.reveal);
  const seq = (from: number, to: number, el: React.ReactNode, key?: string) => (
    <Sequence key={key} from={f(from)} durationInFrames={f(to) - f(from)}>
      {el}
    </Sequence>
  );
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {seq(T.buka, T.tajuk + 0.4, <SceneBuka />)}
      {seq(T.tajuk, T.dron, <SceneTajuk />)}
      {seq(T.dron, T.fail, <SceneBumi />)}
      {seq(T.fail, T.sah, <SceneTeaser />)}
      {seq(T.sah, T.warp, <SceneSah />)}
      {seq(T.warp, T.siluet, <SceneWarp len={f(T.siluet) - f(T.warp)} />)}
      {seq(T.siluet, T.siluet + T.siluetLen, <SceneSiluet />)}
      {seq(T.kira, T.reveal, <SceneKira />)}
      {seq(T.reveal, T.montaj, <SceneReveal />)}
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
        <SceneMozek dur={endF - f(T.finale)} />
      </Sequence>

      {/* muzik */}
      <Sequence from={0} durationInFrames={f(T.reveal)}>
        <Audio
          src={staticFile('audio/misteri.mp3')}
          volume={(fr) => interpolate(fr, [0, f(1.5), f(T.kira - 1.5), f(T.kira + 0.3)], [0, 0.65, 0.65, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        />
      </Sequence>
      <Sequence from={f(T.reveal)} durationInFrames={musik2Len}>
        <Audio
          src={staticFile('audio/kemenangan.mp3')}
          trimBefore={f(T.reveal - MUSIK_KEMENANGAN_MULA)}
          volume={(fr) => interpolate(fr, [0, musik2Len - f(3.5), musik2Len], [0.85, 0.85, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
        />
      </Sequence>
      {/* kesan bunyi; semua yang bermula sebelum detik senyap dipotong pada detik itu */}
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
