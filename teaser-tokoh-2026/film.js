// Teaser "Fail Sulit" · Tokoh Murid 2026 · 1080×1920 · 24 fps · 120 BPM (1 bar = 2 s)
// Satu syot berterusan: bintang dikunci dulu → piala diimbas → 4 bukti → padanan identiti → AKSES DITOLAK → hologram pejal → tenaga dimatikan.
import { Holo, drawScanPlane, drawPad, makeCamera } from './engine/holo.js';
import * as U from './engine/hud.js';
const { clamp } = U;
export const W = 1080, H = 1920;
const BEAT = 0.5;
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eo = t => 1 - Math.pow(1 - clamp(t), 3);
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const sine = t => 0.5 - 0.5 * Math.cos(Math.PI * clamp(t));

// ---------- Garis masa (saat) ----------
export const TL = {
  star: [0, 1.0],          // bintang sahaja, dikunci pada 0.5
  build: [1.0, 3.6],       // tarik ke belakang, piala diimbas dari tapak
  intro: [0, 8],
  calls: [
    { part: 'tapak', mode: 'push', t0: 8, t1: 14, lockV: 10.0 },
    { part: 'batang', mode: 'orbit', t0: 14, t1: 18, lockV: 15.5 },
    { part: 'pemegang', mode: 'profile', t0: 18, t1: 22, lockV: 19.5 },
    { part: 'mahkota', mode: 'crown', t0: 22, t1: 26, lockV: 23.5 },
  ],
  match: [26, 30],          // separuh tempo; padanan identiti 0 → 99 %
  silence: [30, 30.5],      // senyap mutlak
  name: [30.5, 31.5],       // NAMA bergolek
  deny: 31.5,               // glitch + AKSES DITOLAK
  drop: [32, 38],           // hologram pejal + turntable
  end: [38, 45],            // soalan + janji, tenaga dimatikan
  DUR: 45,
};
const SAFE_TOP = 230, CARD_Y = 1245;

export function makeFilm(C, model) {
  const T = U.theme(C.hue, C.accent);
  const YM = model.ymax, c = id => model.byId[id].center || model.byId[id].anchor;
  TL.calls.forEach((s, i) => { s.i = i; s.c = C.callouts[i]; });
  const holo = new Holo(W, H);

  // ---------- Kamera ----------
  const WIDE = { target: [0, YM * 0.5, 0], yaw: 0.55, pitch: 0.22, dist: 6.8, cx: 0.5, cy: 0.43 };
  const CAM = {
    star: { target: c('mahkota'), yaw: 0.25, pitch: 0.12, dist: 2.1, cx: 0.5, cy: 0.40 },
    hook: { ...WIDE, yaw: 0.95, pitch: 0.42, dist: 7.4 },
    wide: WIDE,
  };
  function partCam(s, u) {
    const a = c(s.part);
    if (s.mode === 'push') return { target: a, yaw: lerp(0.62, 0.74, u), pitch: 0.3, dist: lerp(3.0, 2.75, u), cx: 0.5, cy: 0.42 };
    if (s.mode === 'orbit') return { target: a, yaw: lerp(-0.35, 0.85, sine(u)), pitch: 0.12, dist: 2.6, cx: 0.5, cy: 0.42 };
    if (s.mode === 'profile') return { target: a, yaw: lerp(0.04, -0.06, u), pitch: 0.03, dist: lerp(4.7, 4.5, u), cx: 0.5, cy: 0.44 };
    return { target: a, yaw: lerp(0.3, 0.12, u), pitch: 0.1, dist: lerp(2.6, 2.35, u), cx: 0.5, cy: 0.52 };
  }
  const mix = (A, B, w) => ({
    target: A.target.map((x, i) => lerp(x, B.target[i], w)), yaw: lerp(A.yaw, B.yaw, w), pitch: lerp(A.pitch, B.pitch, w),
    dist: Math.exp(lerp(Math.log(A.dist), Math.log(B.dist), w)), cx: lerp(A.cx, B.cx, w), cy: lerp(A.cy, B.cy, w),
  });
  function camAt(t) {
    if (t < TL.star[1]) return { ...CAM.star, yaw: lerp(0.25, 0.4, t) };
    if (t < TL.intro[1]) {   // tarik ke belakang + kren turun (satah imbasan terbaca sebagai elips), kemudian turntable perlahan
      const a = mix({ ...CAM.star, yaw: 0.4 }, CAM.hook, eio(seg(t, 1.0, 3.4)));
      return mix(a, { ...WIDE, yaw: lerp(0.95, 0.55, seg(t, 3.4, 8)) }, eio(seg(t, 3.0, 7.6)));
    }
    for (const s of TL.calls) if (t < s.t1) {
      const u = seg(t, s.t0, s.t1);
      const prev = s.i === 0 ? WIDE : partCam(TL.calls[s.i - 1], 1);
      let here = partCam(s, u);
      if (s.i === 0) here = mix(prev, here, eio(seg(t, s.t0, s.t0 + 1.5)));             // tolak masuk perlahan
      else here = mix(prev, here, eio(seg(t, s.t0 - 0.45, s.t0 + 0.05)));               // whip mengikut kotak sasaran
      const nx = TL.calls[s.i + 1];
      if (nx && t > nx.t0 - 0.45) here = mix(partCam(s, 1), partCam(nx, 0), eio(seg(t, nx.t0 - 0.45, nx.t0 + 0.05)));
      return here;
    }
    const last = partCam(TL.calls[3], 1);
    const back = { ...WIDE, yaw: 0.35, pitch: 0.3, dist: 7.0 };
    if (t < TL.drop[0]) return mix(last, { ...back, dist: lerp(7.0, 6.8, seg(t, 27.5, 32)) }, eio(seg(t, TL.match[0], TL.match[0] + 1.5)));
    const eye = { ...WIDE, yaw: 0.35, pitch: 0.05, dist: 6.5 };
    if (t < TL.end[0]) return mix({ ...back, dist: 6.8 }, eye, eio(seg(t, TL.drop[0], TL.drop[0] + 1.6)));
    return { ...eye, pitch: lerp(0.05, 0.16, sine(seg(t, 38, 45))), dist: lerp(6.5, 7.2, seg(t, 38, 45)) };   // dolly perlahan ke belakang
  }
  const px = k => ({ ...k, cx: k.cx * W, cy: k.cy * H, fov: 0.6, roll: 0 });

  // ---------- Kabur gerakan whip (5 sub-bingkai, pengatup 180°) ----------
  const accC = document.createElement('canvas'); accC.width = W; accC.height = H;
  const subC = document.createElement('canvas'); subC.width = W; subC.height = H;
  const whipK = t => { for (const s of TL.calls) if (s.i > 0 && t > s.t0 - 0.45 && t < s.t0 + 0.05) return Math.sin(Math.PI * seg(t, s.t0 - 0.45, s.t0 + 0.05)); return 0; };
  function render(ctx, t) {
    if (whipK(t) < 0.05) return frameAt(ctx, t, t);
    const N = 5, a = accC.getContext('2d'), sg = subC.getContext('2d');
    for (let k = 0; k < N; k++) {
      sg.setTransform(1, 0, 0, 1, 0, 0); frameAt(sg, t + (k / (N - 1) - 0.5) / 48, t);
      a.globalAlpha = 1 / (k + 1); a.globalCompositeOperation = 'source-over'; a.drawImage(subC, 0, 0);
    }
    ctx.save(); ctx.globalAlpha = 1; ctx.drawImage(accC, 0, 0); ctx.restore();
  }

  function frameAt(ctx, t, tf) {
    const frame = Math.round(tf * 24);
    const cam = px(camAt(t));
    const [m0, m1] = TL.match, [d0, d1] = TL.drop, [e0] = TL.end;
    // ---- keadaan subjek ----
    const explode = {}, angle = {};
    let focus = null, dim = 0.2, gain = 1, solid = 0, spin = 0, glitchAmt = 0, wave = null;
    let active = null;
    for (const s of TL.calls) {
      const out = 1 - eio(seg(t, s.t1 - 0.55, s.t1 - 0.05));
      const k = eo(seg(t, s.t0 + 0.5, s.t0 + (s.i === 0 ? 1.5 : 1.0))) * out;
      for (const P of model.byId[s.part].pieces) explode[P.id] = Math.max(explode[P.id] || 0, k);
      if (t >= s.t0 - 0.45 && t < s.t1 - 0.05) active = s;
      if (s.part === 'batang') { angle['batang-knop-a'] = (t - s.t0) * 1.4 * k; angle['batang-knop-b'] = -(t - s.t0) * 1.0 * k; }
      if (s.part === 'mahkota') angle['mahkota-bintang'] = (t - s.t0) * 1.2 * k;
    }
    if (t < TL.star[1] + 0.4) { angle['mahkota-bintang'] = t * 0.9; }
    if (active) { focus = active.part; dim = 0.14; }
    // padanan: kecerahan berdenyut naik; senyap: malap
    if (t >= m0 && t < d0) gain = t < TL.silence[0] ? 1 : lerp(1, 0.35, seg(t, 30, 30.15)) * (t >= TL.deny ? 1 + 0.8 * Math.exp(-(t - TL.deny) * 6) : 1);
    if (t >= d0) {
      solid = eo(seg(t, d0, d0 + 0.35)) * (1 - seg(t, 41.5, 43.5));
      gain = (1 + 0.5 * Math.exp(-(t - d0) * 3)) * (1 - 0.82 * seg(t, 41.0, 44.0));
      spin = t < 36 ? eio(seg(t, d0, 36)) * Math.PI * 2 : 0;
      if (t >= d0 && t < d0 + 1.4) wave = { y: lerp(-0.1, YM + 0.1, eio(seg(t, d0, d0 + 1.3))), w: 0.08 };
      else if (t >= 34 && t < 35.2) wave = { y: lerp(-0.1, YM + 0.1, eio(seg(t, 34, 35.1))), w: 0.06 };
    }
    if (t >= d0 && t < d0 + 0.13) glitchAmt = 1 - (t - d0) / 0.13;
    if (t >= TL.deny && t < TL.deny + 0.13) glitchAmt = Math.max(glitchAmt, 1 - (t - TL.deny) / 0.13);

    // ---- latar + pad ----
    U.background(ctx, W, H, T, { px: -cam.yaw * 260, py: cam.pitch * 300, cx: cam.cx, cy: cam.cy + 60 });
    const padA = t < 1 ? 0.25 + 0.3 * t : clamp(0.55 + (t - 1) * 0.3);
    drawPad(ctx, cam, W, H, { hue: T.hue, rot: t * 0.12 + spin, alpha: padA * (t >= m0 && t < d0 ? Math.max(0.5, gain) : 1) * (t > 43 ? 1 : 1) });
    if (solid > 0) U.beam(ctx, T, (x, y, z, o) => { const q = [x * Math.cos(spin) + z * Math.sin(spin), -x * Math.sin(spin) + z * Math.cos(spin)]; return makeCamera(cam, W, H).project(q[0], y, q[1], o); }, solid, t, { y1: YM * 1.04 });

    // ---- subjek: bintang dulu, kemudian badan diimbas dari tapak ----
    const lw = 1.5 * (1 + (t >= d0 ? 0.5 * Math.exp(-(t - d0) * 1.2) + 0.12 * solid : 0));
    const flash = {};
    if (t >= 0.5 && t < 0.62) flash.mahkota = 1;
    TL.calls.forEach(s => { if (t >= s.lockV && t < s.lockV + 0.1) flash[s.part] = 1; });
    const base = { hue: T.hue, explode, angle, solid, spin, gain, focus, dim, wave, flash, lineWidth: lw, scanOffset: t * 24 };
    let info;
    if (t < TL.build[1]) {
      const sy = lerp(-0.05, YM * 0.82, sine(seg(t, TL.build[0], TL.build[1])));
      const a = holo.draw(ctx, model, cam, { ...base, only: ['mahkota'], scan: { y: lerp(YM * 0.7, YM * 1.02, eo(seg(t, 0, 0.45))), band: 0.05 } });
      let b = { bbox: {}, anchor: {} };
      if (t >= TL.build[0]) b = holo.draw(ctx, model, cam, { ...base, only: ['tapak', 'batang', 'piala', 'pemegang'], scan: { y: sy, band: 0.08 } });
      info = { bbox: { ...b.bbox, ...a.bbox }, anchor: { ...b.anchor, ...a.anchor } };
      if (t >= TL.build[0]) drawScanPlane(ctx, cam, W, H, sy, { hue: T.hue, r: 0.9, rot: t * 0.3, alpha: 1 - seg(t, TL.build[1] - 0.3, TL.build[1]) });
    } else info = holo.draw(ctx, model, cam, base);

    // ---- HUD ----
    const hudA = t >= e0 ? 1 - seg(t, 41.0, 42.6) : 1;   // panel dimatikan satu demi satu dalam babak akhir
    // kunci pertama: bintang
    if (t < 3.0) {
      const k = seg(t, 0.3, 0.52), o = 1 - seg(t, 2.4, 3.0);
      U.targetBox(ctx, T, info.bbox.mahkota, k, { alpha: o, flash: t >= 0.5 && t < 0.62, tag: 'TGT 00 · DIKESAN', pad: 26 });
    }
    // blok tajuk (atas)
    if (t >= 2.6 && t < 8) titleBlock(ctx, t, frame, (1 - seg(t, 7.4, 7.9)));
    // pengesanan awal 4 bukti
    if (t > 5.9 && t < 8) TL.calls.forEach((s, j) => {
      const tt = 6.0 + j * 0.5, k = seg(t, tt, tt + 0.12) * (1 - seg(t, 7.6, 7.95));
      U.targetBox(ctx, T, info.bbox[s.part], 0.35 * k, { alpha: 0.55 * k, lockK: 0.2 + 0.1 * Math.sin(t * 20 + j), pad: 10 });
    });
    // kad bukti
    for (const s of TL.calls) {
      if (t < s.t0 - 0.05 || t >= s.t1) continue;
      const L = s.t0, out = 1 - seg(t, s.t1 - 0.4, s.t1 - 0.05), idx = String(s.i + 1).padStart(2, '0');
      U.targetBox(ctx, T, info.bbox[s.part], seg(t, L, L + 0.22), { alpha: out, flash: t >= L && t < L + 0.12, tag: `BUKTI ${idx} · KUNCI`, pad: 22 });
      const lab = L + (s.i === 0 ? 1.0 : 0.5), r0 = s.lockV - (s.i === 0 ? 1.0 : 0.5);
      const card = { x: 110, y: CARD_Y };
      const anchor = info.anchor[s.part];
      if (anchor) U.leader(ctx, T, anchor, [anchor[0], lerp(anchor[1], card.y, 0.7)], [card.x + 40, card.y - 10], seg(t, lab - 0.25, lab + 0.25), { alpha: out, pulse: t > s.lockV ? seg(t, s.lockV, s.lockV + 0.5) : 0 });
      U.specCard(ctx, T, card.x, card.y, s.c, {
        reveal: seg(t, lab, lab + 0.4), roll: seg(t, r0, s.lockV), detail: seg(t, s.lockV, s.lockV + 0.5), frame,
        flash: t >= s.lockV && t < s.lockV + 0.1,
      }, { index: idx, alpha: out, w: 860, big: 170 });
    }
    // rel cip (atas, grid 2 × 2): bukti yang sudah dibaca
    TL.calls.forEach((s, j) => {
      const inA = seg(t, s.t1 - 0.25, s.t1 + 0.1);
      if (inA <= 0) return;
      const pulse = t >= 28 && t < 30 && Math.floor((t - 28) * 4) % 4 === j ? 1.25 : 1;
      const x = (j % 2 ? 572 : 92) + lerp(30, 0, eo(inA)), y = SAFE_TOP + 30 + Math.floor(j / 2) * 100;
      U.chip(ctx, T, x, y, { label: s.c.chip, value: s.c.value, unit: s.c.unit }, Math.min(1, inA * hudA * pulse), { index: String(j + 1).padStart(2, '0'), w: 400 });
    });
    // padanan identiti → nama → ditolak
    if (t >= m0 && t < 34.6) identity(ctx, t, frame);
    // tajuk akhir + soalan + janji
    if (t >= 34.5) ending(ctx, t, frame);
    U.chrome(ctx, W, H, T, {
      alpha: (t >= e0 ? 1 - seg(t, 42.4, 43.4) : 1) * (t >= 30 && t < 31.5 ? 0.45 : 1),
      tl: 'TOKOH MURID 2026  //  FAIL SULIT',
      tr: status(t),
      bl: `HOLO.${String(frame).padStart(4, '0')}  ·  SKSO`,
      br: `${(cam.yaw * 57.3).toFixed(1)}°  ·  ${cam.dist.toFixed(2)} M`,
      px: -cam.yaw * 200,
    });
    for (const s of TL.calls) if (s.i > 0) { const w = seg(t, s.t0 - 0.45, s.t0 + 0.05); if (w > 0 && w < 1) streaks(ctx, Math.sin(w * Math.PI), s.i); }
    U.vignette(ctx, W, H, 0.5);
    if (glitchAmt > 0) U.glitch(ctx, W, H, glitchAmt, frame * 7.3);
  }

  function status(t) {
    if (t < 1) return 'SASARAN DIKESAN';
    if (t < TL.build[1]) return `MENGIMBAS  ${String(Math.round(seg(t, 1, TL.build[1]) * 100)).padStart(3, '0')}%`;
    if (t < 8) return 'IMBASAN SELESAI  ·  4 BUKTI';
    for (const s of TL.calls) if (t < s.t1) return `BUKTI ${s.i + 1}/4  ·  ${s.part.toUpperCase()}`;
    if (t < TL.deny) return 'MEMADANKAN IDENTITI';
    if (t < TL.drop[0]) return 'AKSES DITOLAK';
    if (t < 36) return 'HOLOGRAM PEJAL  ·  360°';
    if (t < 41) return 'FAIL DIKUNCI';
    return 'SISTEM DIMATIKAN';
  }

  function titleBlock(ctx, t, frame, a) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const x = 92, y = SAFE_TOP + 40;
    ctx.font = `22px ${U.FONT.mono}`; ctx.fillStyle = T.line(0.9 * a * seg(t, 2.6, 2.9));
    ctx.fillText(U.rollText('FAIL SULIT · SK SULTAN OMAR, DUNGUN', seg(t, 2.6, 3.2) * 1.2, frame, 4), x, y);
    ctx.font = `300 96px ${U.FONT.ui}`; ctx.letterSpacing = '6px'; ctx.fillStyle = T.hi(a);
    ctx.fillText(U.rollText(C.title, seg(t, 3.0, 4.0), frame, 5), x - 6, y + 112); ctx.letterSpacing = '0px';
    ctx.fillStyle = T.line(0.9 * a); ctx.fillRect(x, y + 140, 880 * eo(seg(t, 4.0, 4.5)), 2);
    const sub = seg(t, 4.5, 4.9);
    ctx.font = `600 34px ${U.FONT.ui}`; ctx.letterSpacing = '3px'; ctx.fillStyle = T.line(0.95 * a * sub);
    ctx.fillText('IDENTITI:', x, y + 192);
    ctx.fillStyle = T.hi(0.9 * a * sub); ctx.fillRect(x + 168, y + 166, 360 * eo(sub), 30);
    ctx.fillStyle = T.line(0.95 * a * sub); ctx.fillText('SULIT', x + 548, y + 192);
    ctx.letterSpacing = '0px'; ctx.restore();
  }

  function identity(ctx, t, frame) {
    const [m0] = TL.match, a = seg(t, m0, m0 + 0.4) * (1 - seg(t, 34.2, 34.6));
    const x = 110, y = CARD_Y, w = 860;
    U.plate(ctx, T, x - 22, y - 20, w + 44, 310, a);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.strokeStyle = T.line(0.9 * a); ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
    ctx.font = `600 34px ${U.FONT.ui}`; ctx.letterSpacing = '4px'; ctx.fillStyle = T.hi(0.95 * a);
    ctx.fillText(U.rollText('PADANAN IDENTITI', seg(t, m0, m0 + 0.6) * 1.4, frame, 61), x, y + 50); ctx.letterSpacing = '0px';
    const p = Math.min(99, Math.floor(99 * eio(seg(t, m0 + 0.5, 29.5))));
    ctx.font = `20px ${U.FONT.mono}`; ctx.fillStyle = T.line(0.85 * a);
    ctx.textAlign = 'right'; ctx.fillText(`${String(p).padStart(2, '0')}%`, x + w, y + 50); ctx.textAlign = 'left';
    ctx.fillStyle = T.dim(0.35 * a); ctx.fillRect(x, y + 70, w, 3);
    ctx.fillStyle = T.line(0.9 * a); ctx.fillRect(x, y + 70, w * p / 100, 3);
    // medan NAMA: bergolek, tidak pernah terkunci
    const nA = seg(t, TL.name[0], TL.name[0] + 0.1);
    ctx.font = `500 30px ${U.FONT.ui}`; ctx.fillStyle = T.line(0.8 * a);
    ctx.fillText('NAMA', x, y + 124);
    if (t >= TL.name[0] && t < TL.deny) {
      ctx.font = `300 76px ${U.FONT.ui}`; ctx.letterSpacing = '6px'; ctx.fillStyle = T.hi(a * nA);
      ctx.fillText(U.rollText('XXXXXXXXXXXX', 0, frame, 71), x, y + 200); ctx.letterSpacing = '0px';
    } else if (t >= TL.deny) {
      ctx.fillStyle = T.hi(0.92 * a); for (let k = 0; k < 7; k++) ctx.fillRect(x + k * 124, y + 142, 108, 54);
      const d = seg(t, TL.deny, TL.deny + 0.25);
      ctx.strokeStyle = T.hi(a * d); ctx.lineWidth = 3; ctx.strokeRect(x + w / 2 - 230 * eo(d), y + 214, 460 * eo(d), 64);
      ctx.font = `600 40px ${U.FONT.ui}`; ctx.letterSpacing = '6px'; ctx.fillStyle = T.hi(a * d);
      ctx.textAlign = 'center'; ctx.fillText('AKSES DITOLAK', x + w / 2, y + 260); ctx.letterSpacing = '0px';
    }
    ctx.restore();
  }

  function ending(ctx, t, frame) {
    const off = 1 - seg(t, 42.6, 43.6);
    const x = W / 2;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const r = seg(t, 34.5, 35.0);
    ctx.font = `300 108px ${U.FONT.ui}`; ctx.letterSpacing = '8px';
    ctx.fillStyle = r >= 1 && !(t < 35.1) ? T.acc(off) : T.hi(off * clamp(r * 3));
    ctx.fillText(U.rollText(C.title, r, frame, 81), x, CARD_Y + 60); ctx.letterSpacing = '0px';
    ctx.fillStyle = T.line(0.8 * off); ctx.fillRect(x - 330 * eo(seg(t, 35, 35.5)), CARD_Y + 96, 660 * eo(seg(t, 35, 35.5)), 2);
    const q = seg(t, 38.0, 38.4) * off;
    ctx.font = `600 64px ${U.FONT.ui}`; ctx.letterSpacing = '6px'; ctx.fillStyle = T.hi(q);
    ctx.fillText(U.rollText('SIAPAKAH DIA?', seg(t, 38.0, 38.6), frame, 83), x, CARD_Y + 160); ctx.letterSpacing = '0px';
    const j = seg(t, 39.0, 39.5) * off;
    ctx.font = `500 34px ${U.FONT.ui}`; ctx.letterSpacing = '3px'; ctx.fillStyle = T.line(0.95 * j);
    ctx.fillText('DIDEDAHKAN DI MAJLIS', x, CARD_Y + 215);
    ctx.fillText('ANUGERAH KECEMERLANGAN 2026', x, CARD_Y + 254); ctx.letterSpacing = '0px';
    ctx.font = `22px ${U.FONT.mono}`; ctx.fillStyle = T.dim(0.95 * seg(t, 39.6, 40.0) * off);
    ctx.fillText('SK SULTAN OMAR  ·  DUNGUN', x, CARD_Y + 292);
    ctx.restore();
  }

  function streaks(ctx, k, seed) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) {
      const x = (Math.sin(i * 91.7 + seed) * 0.5 + 0.5) * W, len = 220 + 640 * Math.abs(Math.sin(i * 13.1)), y = (Math.sin(i * 7.9 + seed * 3) * 0.5 + 0.5) * H;
      ctx.fillStyle = T.line(0.22 * k); ctx.fillRect(x, y - len / 2, 1.4, len);   // whip menegak: jalur menegak
    }
    ctx.restore();
  }

  // ---------- Peristiwa bunyi ----------
  function events() {
    const E = [], ev = (t, type, o = {}) => E.push({ t: +t.toFixed(4), type, ...o });
    ev(0, 'hum_in'); ev(0.05, 'star_scan', { d: 0.45 }); ev(0.5, 'lock', { i: -1 });
    ev(1.0, 'scan', { d: 2.6 });
    ev(2.6, 'type_line'); ev(3.0, 'roll', { d: 1.0, n: 16 }); ev(4.0, 'confirm_small'); ev(4.5, 'type_line');
    TL.calls.forEach((s, j) => ev(6.0 + j * 0.5, 'detect', { i: j }));
    ev(7.5, 'silence', { d: 0.5, kind: 'near' });
    for (const s of TL.calls) {
      if (s.i > 0) ev(s.t0 - 0.45, 'whip', { d: 0.5 });
      ev(s.t0, 'lock', { i: s.i, bar: true });
      ev(s.t0 + 0.5, 'explode', { part: s.part, d: s.i === 0 ? 1.0 : 0.5 });
      ev(s.lockV - (s.i === 0 ? 1.0 : 0.5), 'roll', { d: s.i === 0 ? 1.0 : 0.5, n: 2 });
      ev(s.lockV, 'confirm', { i: s.i });
      ev(s.t1 - 0.55, 'reassemble'); ev(s.t1 - 0.25, 'dock', { i: s.i });
    }
    ev(26, 'pullback', { d: 1.5 });
    for (let k = 0; k < 14; k++) ev(26.5 + k * (3.0 / 14) * (1 - k / 40), 'tick');
    for (let k = 0; k < 4; k++) ev(28 + k * 0.5, 'ping', { i: k });
    ev(29.5, 'match99');
    ev(30.0, 'silence', { d: 0.5, kind: 'true' });
    ev(30.5, 'nameroll', { d: 1.0 });
    ev(31.5, 'deny'); ev(31.5, 'glitch', { d: 0.13 });
    ev(32.0, 'ignite', { bar: true }); ev(32.0, 'glitch', { d: 0.13 }); ev(32.0, 'wave', { d: 1.3 }); ev(34.0, 'wave', { d: 1.1 });
    ev(32.0, 'spin', { d: 4 });
    ev(34.5, 'roll', { d: 0.5, n: 16 }); ev(35.0, 'confirm', { i: 9 });
    ev(38.0, 'roll', { d: 0.6, n: 13 }); ev(39.0, 'type_line'); ev(39.6, 'type_line');
    ev(41.0, 'powerdown', { d: 3.0 }); for (const tt of [41.2, 41.8, 42.4, 43.0]) ev(tt, 'panel_off');
    return E.sort((a, b) => a.t - b.t);
  }
  return { render, events };
}
