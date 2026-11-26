// Garis masa tunggal (dikongsi oleh main.js untuk visual dan tools/timeline.mjs → mix.py untuk bunyi).
// 106.67 BPM: 1 bar = 2.25 s. Semua bahagian berganda bar.
import { CHAPTERS, OUTRO } from './content.js';
export const BAR = 2.25;

export function buildTimeline() {
  const seg = [], ev = [];
  const E = (t, k, o = {}) => ev.push({ t: +t.toFixed(3), k, ...o });
  let t = 0;
  // tajuk huruf 3D: masa setiap huruf (untuk bunyi pop)
  const letters = (lines, t0, st) => { let n = 0; for (const l of lines) n += l.replace(/ /g, '').length; E(t0 + .15, 'letters', { n, st }); };
  const titleCard = (it, s) => {   // kad tajuk sebelum foto (reben, huruf, pil)
    const c = { ribIn: s - .45, lettersIn: s - .2, subIn: s + .25, out: s + 2.05 };
    E(c.ribIn + .1, 'pop', { m: 86 }); letters(it.title, c.lettersIn, .035); E(c.subIn + .1, 'pop', { m: 93 });
    return c;
  };
  const photo = (f, fly, hold, fx) => {
    const p = { f, fly, land: fly + .65, flip: fly + .65 + hold, end: fly + .65 + hold + .65, fx };
    E(p.fly - .05, 'cardFly'); E(p.land, 'land', { fx }); E(p.flip, 'flip');
    return p;
  };
  CHAPTERS.forEach((ch, ci) => {
    if (ch.gaya === 'filem') {   // bab dokumentari: pembuka hitam → syot → kad akhir emas
      const s0 = t, shots = []; let u = s0 + 2 * BAR;
      E(s0, 'burnIn'); E(s0 + .6, 'filmTitle');
      ch.shots.forEach((sh, k) => { shots.push({ ...sh, start: u, end: u + sh.dur }); E(u, 'cut', { k }); if (sh.video) E(u, 'clipAudio', { dur: sh.dur }); u += sh.dur; });
      const fin = { start: u, end: u + 2 * BAR }; E(u - 1.6, 'riser'); E(u, 'goldHit'); E(fin.end - .7, 'burnOut');
      seg.push({ type: 'film', ci, start: s0, end: fin.end, shots, fin });
      t = fin.end; return;
    }
    const first = ci === 0, s = t, dur = ch.hero ? 4 * BAR : 2 * BAR;
    const o = { type: 'opener', ci, start: s, end: s + dur, first };
    o.titleIn = first ? s + 1.1 : s - .35; o.titleOut = s + (ch.hero ? 4.5 : 4.0);
    o.subIn = o.titleIn + 1.1; o.ribIn = o.titleIn + 1.7;
    if (first) E(0, 'flyin');
    letters(ch.nama, o.titleIn, first ? .09 : .06); E(o.subIn + .1, 'pop', { m: 88 }); E(o.ribIn + .1, 'pop', { m: 91 });
    E(o.subIn + .4, 'sparkle'); E(o.titleOut - .1, 'whooshOut');
    if (ch.hero) {
      o.hero = { in: s + 4.8, out: s + 8.35, n: ch.items.filter(i => i.jenis === 'award').length };
      E(s + 5.0, 'heroHit'); letters(ch.hero.teks, s + 5.35, .035); E(o.hero.out, 'whooshOut');
    }
    seg.push(o); t += dur;
    ch.items.forEach((it, ii) => {
      const s = t;
      if (it.jenis === 'award') {
        const c = titleCard(it, s);
        const p = photo(it.foto[0], s + 2.15, 5.55, it.finale ? 'gold' : 'big');
        if (it.finale) E(p.land + 2.2, 'confettiExtra');
        seg.push({ type: 'award', ci, ii, it, start: s, end: s + 4 * BAR, card: c, photos: [p] });
        t += 4 * BAR;
      } else {
        const c = titleCard(it, s), photos = [];
        it.foto.forEach((f, k) => {
          const ps = s + BAR + k * 2 * BAR;
          photos.push(photo(f, ps - .35, 2 * BAR - .65 - .35 - .0, k === 0 ? 'big' : 'mid'));
        });
        // foto pertama terbang semasa kad tajuk meletup
        c.out = photos[0].fly + .1;
        seg.push({ type: 'group', ci, ii, it, start: s, end: s + BAR + it.foto.length * 2 * BAR, card: c, photos });
        t += BAR + it.foto.length * 2 * BAR;
      }
    });
  });
  const os = t;
  seg.push({ type: 'outro', start: os, end: os + 4 * BAR, n: Math.min(5, OUTRO.length) });
  E(os + .1, 'cardFly'); letters(['TAHNIAH!'], os + 1.0, .07); E(os + 1.3, 'ding'); E(os + 1.2, 'confetti'); E(os + 2.0, 'pop', { m: 88 }); E(os + 2.5, 'pop', { m: 91 });
  t += 4 * BAR;
  return { seg, ev: ev.sort((a, b) => a.t - b.t), DUR: t };
}
