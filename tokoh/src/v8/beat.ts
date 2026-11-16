// Penyegerakan rentak muzik: hentakan zum / potongan gambar ikut beat lagu.
import {useCurrentFrame} from 'remotion';
import BEATS from './beats.json';

type Track = {tempo: number; t: number[]; s: number[]};
const B = BEATS as unknown as Record<string, Track>;
const FPS = 30;

// indeks rentak terakhir <= masa muzik mt
const lastIdx = (tr: Track, mt: number) => {
  let lo = 0;
  let hi = tr.t.length - 1;
  if (mt < tr.t[0]) return -1;
  while (lo < hi) {
    const m = (lo + hi + 1) >> 1;
    if (tr.t[m] <= mt) lo = m;
    else hi = m - 1;
  }
  return lo;
};

/** denyut 0..1 yang memuncak tepat pada rentak lalu reput (decay saat). */
export const pulseAt = (track: string, mt: number, decay = 0.22, accent = 0.65) => {
  const tr = B[track];
  if (!tr) return 0;
  const i = lastIdx(tr, mt);
  if (i < 0) return 0;
  const dt = mt - tr.t[i];
  const w = 1 - accent + accent * tr.s[i];
  // serangan pantas 1 bingkai sebelum reput supaya tidak 'melompat'
  return w * Math.exp(-dt / decay);
};

/** rentak terdekat (masa muzik) */
export const snapBeat = (track: string, mt: number) => {
  const tr = B[track];
  const i = Math.max(0, lastIdx(tr, mt));
  const a = tr.t[i];
  const b = tr.t[Math.min(tr.t.length - 1, i + 1)];
  return mt - a < b - mt ? a : b;
};

/** bilangan rentak (termasuk separuh rentak jika half) sejak masa muzik a hingga mt */
export const beatIndex = (track: string, mt: number, half = false) => {
  const tr = B[track];
  const i = lastIdx(tr, mt);
  if (i < 0) return 0;
  if (!half) return i;
  const nx = tr.t[Math.min(tr.t.length - 1, i + 1)];
  return i * 2 + (mt - tr.t[i] > (nx - tr.t[i]) / 2 ? 1 : 0);
};

/** hook: denyut untuk komponen dalam Sequence. t0 = mula Sequence (saat, komposisi);
 *  musicAt0 = masa dalam lagu pada saat t0. */
export const usePulse = (track: string, musicAt0: number, decay = 0.22, accent = 0.65) => {
  const fr = useCurrentFrame();
  return pulseAt(track, musicAt0 + fr / FPS, decay, accent);
};
