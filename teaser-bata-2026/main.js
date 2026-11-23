// Teaser "Kepingan Terakhir" · Tokoh Murid 2026 · gaya Mainan Bata · menegak (saiz dari tetingkap: 2160×3840 untuk 4K)
// Bata step 12 fps (stop-motion); kamera, fokus dan teks bergerak 24 fps. 120 BPM (1 bar = 2 s); setiap klik pada separuh rentak.
import * as THREE from 'three';
import { makePost } from './post.js';   // salinan core/three/post.js: sampel DOF dikurangkan untuk render 4K tanpa GPU
import { clamp, seg, eio, eo, ss, lerp, hash } from '/core/lib.js';
import { COL, BRICK, PLATE, brick, plate, mesh, roundGeo, coneGeo, plastic } from './bricks.js';
import { buildSet, TOP } from './set.js';

const Q = new URLSearchParams(location.search);
const W = innerWidth || 2160, H = innerHeight || 3840, K = W / 1080;   // K: skala teks (reka letak pada 1080 lebar)
const SSAA = parseFloat(Q.get('ssaa') || '1');
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('stage').appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, .5, 3000);
const post = makePost(renderer, scene, camera, W, H, { ssaa: SSAA, msaa: parseInt(Q.get('msaa') ?? '0'), ao: true, aoRadius: 3.0, aoThickness: 3, aoAmt: .9 });
post.bloom.strength = .12; post.bloom.threshold = 1.3;
post.vig.uniforms.amt.value = .36; post.vig.uniforms.warm.value = -.35; post.vig.uniforms.contrast.value = .26; post.vig.uniforms.sat.value = 1.1;
const set = await buildSet(scene);
const V = (x, y, z) => new THREE.Vector3(x, y, z);

export const DUR = 45, BEAT = .5;
const q = t => Math.floor(t * 12 + 1e-6) / 12;          // stop-motion: bata step 12 fps
const qc = t => Math.ceil(t * 12 - 1e-6) / 12;

// ---------- tekstur bercetak (jubin papan tanda, plat nama "?") ----------
function printTex(draw, w = 512, h = 384) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function printedTile(w, h, tex, base = COL.white) {   // jubin berdiri (lebar w, tinggi h stud, tebal plat) dengan muka bercetak di +z
  const g = new THREE.Group();
  const body = mesh(new THREE.BoxGeometry(w - .04, h - .04, PLATE - .02), base); body.position.set(0, 0, 0); g.add(body);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w - .2, h - .2), new THREE.MeshPhysicalMaterial({ map: tex, roughness: .35, clearcoat: .6, clearcoatRoughness: .1 }));
  face.position.z = PLATE / 2 + .002; face.receiveShadow = true; g.add(face);
  return g;
}
await document.fonts.load('700 120px Fredoka'); await document.fonts.load('600 60px Fredoka');
const signTex = (num, lab, col) => printTex((x, w, h) => {
  x.fillStyle = '#f4f4f1'; x.fillRect(0, 0, w, h);
  x.fillStyle = col; x.font = '700 230px Fredoka'; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillText(num, w / 2, 245);
  x.fillStyle = '#1b2a34'; x.font = '600 54px Fredoka'; x.fillText(lab, w / 2, 330);
});

// ---------- piala: setiap kepingan {obj, pos akhir, masa klik, asal lontaran} ----------
const PIECES = [];
function put(obj, p, tLand, from, o = {}) { obj.position.copy(p); scene.add(obj); PIECES.push({ obj, p: p.clone(), tLand, from, rot: o.rot || new THREE.Euler(), spin: o.spin ?? 1.2, ...o }); return obj; }
const Y = COL.yellow, GOLD = '#e8b923';
let y = TOP;
// Tapak
put(brick(6, 6, COL.black), V(0, y, 0), 4.0, V(-14, 18, 8)); y += BRICK;
put(brick(6, 6, COL.black), V(0, y, 0), 4.5, V(14, 18, 6)); y += BRICK;
const slot = put(mesh(new THREE.BoxGeometry(4.2, 1.9, .1), COL.dgray), V(0, TOP + 1.2, 3.03), 5.0, V(0, 10, 16));   // slot plat nama (kosong)
put(plate(4, 4, COL.dgray), V(0, y, 0), 5.5, V(-10, 20, -6)); y += PLATE;
// Batang
put(mesh(roundGeo(1, BRICK), Y), V(0, y, 0), 10.0, V(-12, 16, 6)); y += BRICK;
put(mesh(roundGeo(1, PLATE), COL.black), V(0, y, 0), 10.5, V(12, 16, 4)); y += PLATE;
put(mesh(roundGeo(1, BRICK), Y), V(0, y, 0), 11.0, V(-10, 18, -4)); y += BRICK;
// Mangkuk
put(plate(4, 4, Y), V(0, y, 0), 14.0, V(-14, 22, 6)); y += PLATE;
put(brick(4, 4, Y), V(0, y, 0), 14.5, V(14, 22, 6)); y += BRICK;
const yCup = y;
put(brick(6, 6, Y), V(0, y, 0), 15.0, V(-16, 24, 2)); y += BRICK;
put(brick(6, 6, Y), V(0, y, 0), 15.5, V(16, 24, 2)); y += BRICK;
put(plate(6, 6, COL.white), V(0, y, 0), 16.0, V(0, 26, -10)); y += PLATE;
// Pemegang (kiri, kanan): plat bawah + dua tiang bulat + plat atas, dipasang sebagai satu kumpulan
for (const [s, tl] of [[-1, 17.0], [1, 17.5]]) {
  const g = new THREE.Group();
  const pb = plate(2, 1, Y); pb.position.set(0, -PLATE, 0); g.add(pb);
  for (let k = 0; k < 2; k++) { const r = mesh(roundGeo(.5, BRICK), Y); r.position.set(s * .5, k * BRICK, 0); g.add(r); }
  const pt = plate(2, 1, Y); pt.position.set(0, 2 * BRICK, 0); g.add(pt);
  put(g, V(s * 4, yCup, 0), tl, V(s * 16, yCup + 14, 6));
}
// Mahkota
put(mesh(roundGeo(1, PLATE), Y), V(0, y, 0), 20.0, V(-12, y + 14, 6)); y += PLATE;
put(mesh(coneGeo(1, BRICK), Y), V(0, y, 0), 20.5, V(12, y + 14, 4)); y += BRICK;
const starShape = new THREE.Shape();
for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .72 : 1.75; const px = Math.cos(a) * r, py = Math.sin(a) * r; i ? starShape.lineTo(px, py) : starShape.moveTo(px, py); }
const starGeo = new THREE.ExtrudeGeometry(starShape, { depth: .42, bevelEnabled: true, bevelThickness: .06, bevelSize: .06, bevelSegments: 3 }); starGeo.translate(0, 1.75, -.21);
const star = new THREE.Mesh(starGeo, plastic(GOLD)); star.castShadow = star.receiveShadow = true;
const STAR_DESK = V(8.5, .27, 11.5);   // bintang terbaring di atas meja (syot pembukaan)
put(star, V(0, y - .1, 0), 21.0, STAR_DESK, { rot: new THREE.Euler(0, 0, 0), from_rot: new THREE.Euler(-Math.PI / 2, 0, .4), spin: 0, arc: 9 });
const TROPHY_TOP = y + 3.4;
// Papan tanda angka: tiang bulat + jubin bercetak, muncul di sekeliling tapak
const SIGNS = [
  { t: 6.5, num: '18', lab: 'PENYERTAAN', col: '#c91a09', p: V(-5.6, TOP, 4.2), ry: .5 },
  { t: 12.0, num: '06', lab: 'KEBANGSAAN', col: '#0055bf', p: V(5.6, TOP, 4.2), ry: -.5 },
  { t: 18.0, num: '05', lab: 'JAWATAN', col: '#237841', p: V(-6.2, TOP, -3.8), ry: .9 },
  { t: 22.0, num: '04', lab: 'NEGARA', col: '#fe8a18', p: V(6.2, TOP, -3.8), ry: -.9 },
];
for (const s of SIGNS) {
  const g = new THREE.Group();
  for (let k = 0; k < 2; k++) { const r = mesh(roundGeo(.5, BRICK), COL.lgray); r.position.y = k * BRICK; g.add(r); }
  const tile = printedTile(4, 3, signTex(s.num, s.lab, s.col)); tile.position.set(0, 2 * BRICK + 1.5, 0); g.add(tile);
  g.rotation.y = s.ry;
  put(g, s.p, s.t, s.p.clone().add(V(0, 16, 6)), { rot: new THREE.Euler(0, s.ry, 0), spin: 0 });
}
// Plat nama: jubin putih 4×2 bercetak "?" di muka belakang (tersembunyi semasa terbang)
const qTex = printTex((x, w, h) => { x.fillStyle = '#f4f4f1'; x.fillRect(0, 0, w, h); x.fillStyle = '#c91a09'; x.font = '700 300px Fredoka'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('?', w / 2, h / 2 + 14); }, 512, 256);
const name = printedTile(4, 2, qTex);
scene.add(name);
const NP = { fly: [30.6, 31.25], hover: [31.25, 33.0], fall: [33.0, 33.45], settle: 34.0 };
const SLOT_P = V(0, TOP + 1.2, 3.3), HOVER_P = V(0, TOP + 1.55, 4.6), REST_P = V(2.6, PLATE / 2, 11.2), NAME_FROM = V(16, 14, 16);

// ---------- animasi kepingan ----------
function placePieces(t) {
  for (const P of PIECES) {
    const t1 = P.tLand, t0 = t1 - (P.arc ? .9 : .5);
    P.obj.visible = t >= t0 || P.from === STAR_DESK;
    if (t >= t1) {   // sudah mendarat: lonjakan kecil (overshoot) → 0 dalam ~4 bingkai
      const o = (1 - seg(t, t1, t1 + .17)) * .35;
      P.obj.position.copy(P.p).add(V(0, o, 0)); P.obj.rotation.copy(P.rot);
    } else if (t >= t0) {   // terbang mengikut lengkung
      const u = seg(t, t0, t1), e = eio(u);
      P.obj.position.copy(P.from).lerp(P.p, e).add(V(0, Math.sin(u * Math.PI) * (P.arc || 4), 0));
      const fr = P.from_rot || P.rot;
      P.obj.rotation.set(lerp(fr.x, P.rot.x, e), lerp(fr.y, P.rot.y, e) + (1 - e) * P.spin, lerp(fr.z, P.rot.z, e));
    } else if (P.from === STAR_DESK) { P.obj.position.copy(STAR_DESK); P.obj.rotation.copy(P.from_rot); }
  }
  // plat nama: terbang → terhenti di udara (menggeletar) → jatuh dan terbalik di atas meja, muka "?" ke atas
  const n = name;
  n.visible = t >= NP.fly[0];
  if (t < NP.fly[1]) {
    const u = seg(t, NP.fly[0], NP.fly[1]), e = eo(u);
    n.position.copy(NAME_FROM).lerp(HOVER_P, e).add(V(0, Math.sin(u * Math.PI) * 4, 0)); n.rotation.set(0, Math.PI + (1 - e) * 2, 0);
  } else if (t < NP.hover[1]) {
    const w = seg(t, 32.2, NP.hover[1]), f = Math.floor(t * 12);
    n.position.copy(HOVER_P).add(V((hash(f) - .5) * .12 * w, (hash(f + 7) - .5) * .08 * w + Math.sin(t * 3) * .05, 0)); n.rotation.set(0, Math.PI + (hash(f + 3) - .5) * .08 * w, (hash(f + 5) - .5) * .06 * w);
  } else if (t < NP.settle) {   // jatuh (graviti lebih rendah dari sebenar) + satu lantunan; berpusing hingga muka ke atas
    const u = seg(t, NP.fall[0], NP.fall[1]), b = seg(t, NP.fall[1], NP.settle);
    const p = HOVER_P.clone().lerp(REST_P, u); p.y = lerp(HOVER_P.y, REST_P.y, u * u) + (b > 0 ? Math.sin(b * Math.PI) * .9 * (1 - b) : 0);
    n.position.copy(p);
    const r = ss(seg(t, NP.fall[0], NP.settle));
    n.rotation.set(lerp(0, -Math.PI / 2, r), lerp(Math.PI, Math.PI * 2 + .35, r), 0);
  } else { n.position.copy(REST_P); n.rotation.set(-Math.PI / 2, Math.PI * 2 + .35, 0); }
}

// ---------- kamera (24 fps, lancar) ----------
const SHOTS = [[0, 3.85, 'macro'], [3.85, 10, 'base'], [10, 14, 'stem'], [14, 20, 'cup'], [20, 24, 'crown'], [24, 30, 'orbit'], [30, 34.2, 'slot'], [34.2, 45, 'q']];
function cam(t) {
  const [t0, t1, nm] = SHOTS.find(s => t < s[1]) || SHOTS[SHOTS.length - 1], u = seg(t, t0, t1);
  let pos, look, fov = 40, focus, aper = 700;
  switch (nm) {
    case 'macro': pos = V(11.8, 3.1, 17.2).lerp(V(10.9, 2.6, 15.6), eio(u)); look = V(8.5, .4, 9.9); fov = 34; focus = V(8.5, .4, 9.9); aper = 650; break;
    case 'base': pos = V(5, 11, 30).lerp(V(2.5, 12, 27), eio(u)); look = V(-1, 3.2, 1); fov = 44; focus = V(-1, 2.5, 2.5); aper = 600; break;
    case 'stem': { const a = lerp(-.25, .45, eio(u)); pos = V(Math.sin(a) * 26, 4, Math.cos(a) * 26); look = V(1, 5.5, 0); fov = 46; focus = V(0, 4.5, 0); aper = 600; break; }
    case 'cup': pos = V(-2, 12.5, 30).lerp(V(-1.5, 11.5, 26), eio(u)); look = V(-.5, 8, 0); fov = 44; focus = V(0, 8, 2.5); aper = 600; break;
    case 'crown': pos = V(8, 3.5, 22).lerp(V(6, 5, 19), eio(u)); look = V(0, 10, 0); fov = 50; focus = V(0, 12.5, 0); aper = 550; break;
    case 'orbit': { const a = lerp(1.1, 0, eio(u)); pos = V(Math.sin(a) * 34, lerp(16, 11, eio(u)), Math.cos(a) * 34); look = V(0, 7, 0); fov = 46; focus = V(0, 7, 0); aper = 400; break; }
    case 'slot': {
      pos = V(4, 5, 20).lerp(V(3.5, 4.2, 17), eio(seg(t, 30, 33))); look = V(0, 3, 4); fov = 42; focus = HOVER_P.clone(); aper = 700;
      const sh = seg(t, NP.fall[1], NP.fall[1] + .05) * (1 - seg(t, NP.fall[1] + .3, NP.settle)), f = Math.floor(t * 24);   // goncangan pegang tangan pada hentaman
      pos.add(V(hash(f) - .5, hash(f + 99) - .5, 0).multiplyScalar(sh * .5)); break;
    }
    default: {   // makro jubin "?": rak fokus dari piala ke jubin
      pos = V(7.5, 4.2, 20).lerp(V(6.2, 3.6, 18), eio(seg(t, 34.2, 44))); look = REST_P.clone().add(V(-.6, .9, -2.2)); fov = 38;
      const r = ss(seg(t, 34.6, 36.2)); focus = V(0, 6, 0).lerp(REST_P, r); aper = 1100;
    }
  }
  camera.position.copy(pos); camera.fov = fov; camera.updateProjectionMatrix(); camera.lookAt(look);
  const k = set.key, fc = focus || look, span = nm === 'orbit' ? 22 : 16;
  k.target.position.copy(fc); k.position.copy(fc).add(V(-60, 110, 50)); k.target.updateMatrixWorld();
  Object.assign(k.shadow.camera, { left: -span, right: span, top: span, bottom: -span }); k.shadow.camera.updateProjectionMatrix();
  post.dof.focus = camera.position.distanceTo(focus); post.dof.aper = aper * K * SSAA; post.dof.maxCoc = 16 * K * SSAA;
}

// ---------- lapisan 2D: tajuk, kapsyen, soalan ----------
const ov = document.getElementById('ov'); ov.width = W; ov.height = H; const g = ov.getContext('2d');
function brickIcon(x, y, s, col) {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col; g.beginPath(); g.roundRect(0, 8, 58, 26, 5); g.fill();
  g.beginPath(); g.roundRect(7, 0, 18, 10, 3); g.roundRect(33, 0, 18, 10, 3); g.fill(); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 28, 58, 6); g.restore();
}
function pill(text, yy, col, a = 1) {
  g.save(); g.globalAlpha = a; g.font = `600 ${50 * K}px Fredoka`; const tw = g.measureText(text).width, pw = tw + 150 * K, ph = 96 * K, x = (W - pw) / 2;
  g.fillStyle = 'rgba(18,20,26,.62)'; g.beginPath(); g.roundRect(x, yy, pw, ph, ph / 2); g.fill();
  brickIcon(x + 32 * K, yy + 27 * K, K, col);
  g.fillStyle = '#fff'; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText(text, x + 112 * K, yy + ph / 2 + 3 * K); g.restore();
}
const pop = (t, t0) => { const u = seg(q(t), t0, t0 + .25); return u < 1 ? .6 + .5 * Math.sin(u * Math.PI * .75) : 1; };   // muncul dalam langkah 12 fps
function title(text, yy, size, col, t, t0, t1, w = 700) {
  if (t < t0 || t >= t1) return;
  const s = pop(t, t0), a = 1 - seg(t, t1 - .25, t1);
  g.save(); g.globalAlpha = a; g.translate(W / 2, yy); g.scale(s, s);
  g.font = `${w} ${size * K}px Fredoka`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 24 * K; g.shadowOffsetY = 6 * K; g.fillStyle = col; g.fillText(text, 0, 0); g.restore();
}
function hud(t) {
  g.clearRect(0, 0, W, H);
  title('TOKOH MURID 2026', 330 * K, 112, '#fff', t, .4, 3.75);
  title('SK SULTAN OMAR · DUNGUN', 420 * K, 40, '#f2cd37', t, .8, 3.75, 600);
  const cap = [[6.6, 9.9, '18 PENYERTAAN', '#c91a09'], [12.1, 13.9, '06 PERINGKAT KEBANGSAAN', '#0055bf'], [18.1, 19.9, '05 JAWATAN', '#237841'], [22.1, 23.9, '04 NEGARA', '#fe8a18'], [26.8, 29.9, 'SATU KEPINGAN LAGI…', '#f2cd37']];
  for (const [a, b, s, c] of cap) if (t >= a && t < b) pill(s, 1440 * K, c, seg(t, a, a + .1) * (1 - seg(t, b - .2, b)));
  if (t >= 38) {
    const sh = g.createLinearGradient(0, 0, 0, H * .45); sh.addColorStop(0, `rgba(10,12,16,${.55 * seg(t, 38, 38.5)})`); sh.addColorStop(1, 'rgba(10,12,16,0)'); g.fillStyle = sh; g.fillRect(0, 0, W, H * .45);
  }
  title('SIAPAKAH DIA?', 360 * K, 120, '#fff', t, 38.0, 45.1);
  title('DIDEDAHKAN DI MAJLIS', 480 * K, 44, '#fff', t, 39.0, 45.1, 600);
  title('ANUGERAH KECEMERLANGAN 2026', 540 * K, 44, '#fff', t, 39.0, 45.1, 600);
  title('SK SULTAN OMAR · DUNGUN', 620 * K, 36, '#f2cd37', t, 39.6, 45.1, 600);
  if (t > 44.2) { g.fillStyle = `rgba(0,0,0,${seg(t, 44.2, 45)})`; g.fillRect(0, 0, W, H); }
}

function render(t0) {
  placePieces(q(t0));
  cam(t0);
  post.composer.render();
  hud(t0);
}

// ---------- peristiwa bunyi (untuk mix.py) ----------
function events() {
  const ev = [], add = (type, t, o = {}) => ev.push({ type, t: +t.toFixed(3), ...o });
  for (const P of PIECES) { add('whoosh', P.tLand - (P.arc ? .9 : .5), { v: P.arc ? .7 : .45 }); add('click', qc(P.tLand), { v: P.arc ? 1.3 : .9, pitch: .9 + hash(P.tLand) * .3 }); }
  for (const s of SIGNS) add('ding', qc(s.t) + .05);
  add('title', .4);
  add('whoosh', NP.fly[0], { v: .7 }); for (let k = 0; k < 6; k++) add('creak', 32.25 + k * .13, { v: .3 + k * .1 });
  add('cut', 32.0); add('clack', qc(NP.fall[1]), { v: 1.2 }); add('clack', qc(NP.fall[1] + .3), { v: .6 }); add('clack', qc(NP.settle - .05), { v: .35 });
  add('ding', 38.0, { v: .9 });
  return ev.sort((a, b) => a.t - b.t);
}

// render berbahagian (tiada GPU): ?t0=<mula>&len=<panjang> → halaman memaparkan [t0, t0+len) sahaja
const T0 = parseFloat(Q.get('t0') || '0'), LEN = parseFloat(Q.get('len') || String(DUR - T0));
window.render = t => render(t + T0); window.DUR = LEN; window.EV = events(); window.DBG = { camera, post };
render(parseFloat(Q.get('t') ?? '8'));
window.READY = true;
