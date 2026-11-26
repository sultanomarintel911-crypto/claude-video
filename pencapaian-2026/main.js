// Video Pencapaian · gaya 3D comel pastel (dunia langit, awan gebu, belon, maskot bintang, teks 3D berkilat melantun).
// Deterministik: window.render(t) melukis bingkai pada masa t (saat). 1920×1080 (saiz ikut tetingkap).
import * as THREE from 'three';
import { TTFLoader } from 'three/addons/loaders/TTFLoader.js';
import { Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CHAPTERS, OUTRO, SEKOLAH } from './content.js';
import { buildTimeline } from './timeline.js';
import { makeFilm } from './film.js';
const TL = buildTimeline(), DUR = TL.DUR;

const W = innerWidth || 1920, H = innerHeight || 1080, ASP = W / H;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.05;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, ASP, .1, 400);
scene.add(camera);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
scene.environmentIntensity = .9;
scene.add(new THREE.HemisphereLight(0xffffff, 0xffc8e0, 1.3));
const sun = new THREE.DirectionalLight(0xfff4e0, 2.2); sun.position.set(6, 12, 14); scene.add(sun);
const rim = new THREE.DirectionalLight(0xb8d8ff, 1.0); rim.position.set(-10, 4, -6); scene.add(rim);

// ---------- utiliti masa / easing ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eo3 = x => 1 - (1 - x) ** 3, ei3 = x => x ** 3, eio = x => x < .5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2;
const backOut = (x, s = 1.9) => 1 + (s + 1) * (x - 1) ** 3 + s * (x - 1) ** 2;
const elastic = x => x <= 0 ? 0 : x >= 1 ? 1 : 2 ** (-10 * x) * Math.sin((x * 10 - .75) * 2 * Math.PI / 3) + 1;
const lerp = (a, b, x) => a + (b - a) * x;
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ---------- palet ----------
const PAL = {
  pink:   { f: 0xff5f9e, s: 0xd23c78, accent: '#ff5f9e' },
  sky:    { f: 0x4fb3ff, s: 0x2a7fd0, accent: '#3b9cf0' },
  mint:   { f: 0x35d0a5, s: 0x1d9a79, accent: '#1fb58b' },
  purple: { f: 0x9b7bff, s: 0x6a4fd6, accent: '#7f5cf0' },
  gold:   { f: 0xffc531, s: 0xe08a12, accent: '#f0a020' },
  white:  { f: 0xffffff, s: 0xffb3cf, accent: '#ff7aac' },
};
const candy = (c, rough = .28) => new THREE.MeshPhysicalMaterial({ color: c, roughness: rough, clearcoat: 1, clearcoatRoughness: .12, sheen: .3 });

// ---------- latar: kecerunan pastel + sinar matahari berputar ----------
{
  const c = document.createElement('canvas'); c.width = 4; c.height = 512; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#a9d8ff'); g.addColorStop(.45, '#ffd3ea'); g.addColorStop(1, '#fff0c2');
  x.fillStyle = g; x.fillRect(0, 0, 4, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; scene.background = t;
}
const rays = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, uniforms: { rot: { value: 0 }, amt: { value: .2 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `varying vec2 vUv; uniform float rot, amt;
    void main(){ vec2 p=vUv-.5; float a=atan(p.y,p.x)+rot; float r=length(p);
      float s=smoothstep(-.08,.08,sin(a*14.)); float f=amt*s*smoothstep(.5,.02,r);
      gl_FragColor=vec4(1.,1.,1.,f); }`,
}));
rays.position.set(0, 1, -40); scene.add(rays);

// awan gebu: gugusan sfera
const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .9, emissive: 0xfff0f6, emissiveIntensity: .35 });
const sphereG = new THREE.SphereGeometry(1, 28, 20);
function cloud(s) {
  const g = new THREE.Group(); const n = 5 + Math.floor(rnd() * 3);
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(sphereG, cloudMat); const k = (i / (n - 1) - .5);
    const r = (1.1 - Math.abs(k) * 1.0) * (.8 + rnd() * .4);
    m.scale.set(r, r * .9, r); m.position.set(k * 3.6, rnd() * .5 + (r - .8) * .6, rnd() * .6 - .3); g.add(m);
  }
  const base = new THREE.Mesh(sphereG, cloudMat); base.scale.set(2.4, .7, 1); base.position.y = -.3; g.add(base);
  g.scale.setScalar(s); return g;
}
const clouds = [];
for (let i = 0; i < 26; i++) {
  const far = i < 16;
  const c = cloud(far ? 1.6 + rnd() * 1.6 : 1 + rnd() * .8);
  const z = far ? -25 - rnd() * 40 : 26 + rnd() * 34;   // jauh di belakang; dekat = dilalui kamera semasa pembukaan
  const sx = far ? 1 : (rnd() < .5 ? -1 : 1);
  c.userData = { x: far ? (rnd() - .5) * 90 : sx * (5 + rnd() * 9), y: far ? -14 + rnd() * 26 : (rnd() - .5) * 12, z, sp: .2 + rnd() * .5 };
  scene.add(c); clouds.push(c);
}
// belon
const balloons = [];
const BCOL = [0xff6fa5, 0x6cc4ff, 0xffd23f, 0x7de0bd, 0xb592ff, 0xff9a6c, 0xff6fa5, 0x6cc4ff, 0xffd23f, 0xb592ff];
for (let i = 0; i < 10; i++) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(sphereG, candy(BCOL[i], .18)); b.scale.set(1, 1.18, 1); g.add(b);
  const knot = new THREE.Mesh(new THREE.ConeGeometry(.16, .25, 12), b.material); knot.position.y = -1.25; g.add(knot);
  const str = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, 3, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  str.position.y = -2.8; g.add(str);
  const side = i % 2 ? 1 : -1;
  g.userData = { x: side * (10 + rnd() * 8), y0: rnd() * 30, z: -6 - rnd() * 14, ph: rnd() * 6, sp: .7 + rnd() * .5 };
  g.scale.setScalar(.9 + rnd() * .5); scene.add(g); balloons.push(g);
}
// bokeh
function dotTex() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.55, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); return t;
}
const DOT = dotTex();
const bokeh = [];
for (let i = 0; i < 40; i++) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: DOT, color: [0xffffff, 0xffe08a, 0xffb8d8, 0xb8e0ff][i % 4], transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending }));
  s.userData = { x: (rnd() - .5) * 50, y: (rnd() - .5) * 30, z: -8 - rnd() * 20, s: .4 + rnd() * 1.2, ph: rnd() * 6 };
  scene.add(s); bokeh.push(s);
}

// ---------- bentuk: bintang bulat, hati ----------
function starShape(R = 1, r = .5, n = 5) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) { const a = Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r : R; pts.push(new THREE.Vector2(Math.cos(a) * rr, Math.sin(a) * rr)); }
  const s = new THREE.Shape(); s.moveTo((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2);
  for (let i = 1; i <= pts.length; i++) { const p = pts[i % pts.length], q = pts[(i + 1) % pts.length]; s.quadraticCurveTo(p.x, p.y, (p.x + q.x) / 2, (p.y + q.y) / 2); }
  return s;
}
function heartShape() {
  const s = new THREE.Shape(); s.moveTo(0, -.9);
  s.bezierCurveTo(-.3, -.55, -1, -.25, -1, .25); s.bezierCurveTo(-1, .75, -.45, .95, 0, .5);
  s.bezierCurveTo(.45, .95, 1, .75, 1, .25); s.bezierCurveTo(1, -.25, .3, -.55, 0, -.9); return s;
}
const puffy = (shape, d = .25, b = .22, seg = 6) => { const g = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelThickness: b, bevelSize: b * .8, bevelSegments: seg, curveSegments: 18 }); g.center(); return g; };
const STAR_G = puffy(starShape(1, .52), .2, .2, 5), HEART_G = puffy(heartShape(), .2, .18, 5);

// ---------- maskot "Bintang" ----------
function makeMascot() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const star = new THREE.Mesh(puffy(starShape(1.25, .68), .35, .38, 10), candy(0xffd23f, .25)); body.add(star);
  const zf = .58;
  const eyeM = new THREE.MeshPhysicalMaterial({ color: 0x2b1d3a, roughness: .2, clearcoat: 1 }), whiteM = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const eyes = [];
  for (const sx of [-1, 1]) {
    const e = new THREE.Group(); e.position.set(sx * .3, .14, zf);
    const ball = new THREE.Mesh(sphereG, eyeM); ball.scale.set(.13, .17, .08); e.add(ball);
    const hl = new THREE.Mesh(sphereG, whiteM); hl.scale.setScalar(.045); hl.position.set(.04, .06, .07); e.add(hl);
    const hl2 = new THREE.Mesh(sphereG, whiteM); hl2.scale.setScalar(.022); hl2.position.set(-.04, -.05, .07); e.add(hl2);
    body.add(e); eyes.push(e);
    const ch = new THREE.Mesh(new THREE.CircleGeometry(.13, 24), new THREE.MeshBasicMaterial({ color: 0xff7fa8, transparent: true, opacity: .75 }));
    ch.position.set(sx * .55, -.12, zf + .01); ch.scale.y = .7; body.add(ch);
  }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(.12, .03, 8, 24, Math.PI), eyeM);
  mouth.rotation.z = Math.PI; mouth.position.set(0, -.05, zf + .01); body.add(mouth);
  g.userData = { body, eyes }; scene.add(g); return g;
}
const mascot = makeMascot();
function poseMascot(t, x, y, z, s, vis) {
  mascot.visible = vis > 0;
  if (!vis) return;
  const { body, eyes } = mascot.userData;
  const hop = Math.abs(Math.sin(t * Math.PI * 1.0667));   // lompat setiap rentak (106.67 BPM → 1.78 lompat/s)
  const sq = 1 - .18 * (1 - hop) ** 6;
  mascot.position.set(x, y + hop * .9 * s, z); mascot.scale.setScalar(s * vis);
  body.scale.set(1 / Math.sqrt(sq), sq, 1); body.position.y = -(1 - sq) * 1.2;
  body.rotation.z = Math.sin(t * 3.3) * .18; body.rotation.y = Math.sin(t * 1.3) * .35;
  const blink = (t % 3.1) < .12 ? .12 : 1; eyes.forEach(e => e.scale.y = blink);
}

// ---------- piala ----------
function makeTrophy() {
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xffc63a, metalness: 1, roughness: .2, clearcoat: .6 });
  const g = new THREE.Group();
  const prof = [[0, 0], [1.5, 0], [1.5, .35], [1.1, .45], [1.0, .8], [.35, 1.1], [.25, 1.9], [.5, 2.15], [1.3, 2.5], [1.75, 3.4], [1.95, 4.6], [1.85, 4.7], [1.6, 3.6], [1.1, 2.75], [0, 2.6]]
    .map(([x, y]) => new THREE.Vector2(x, y));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 48), gold));
  for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.TorusGeometry(.62, .15, 12, 32, Math.PI), gold); h.position.set(s * 1.75, 3.55, 0); h.rotation.z = s > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(h); }
  const st = new THREE.Mesh(STAR_G, candy(0xff5f9e, .2)); st.position.y = 5.6; st.scale.setScalar(.9); g.add(st); g.userData.star = st;
  g.children[0].position.y = 0; g.position.y = -2.4; scene.add(g); return g;
}
const trophy = makeTrophy();

// ---------- tekstur kanvas: pil teks, reben ----------
const FONT = '700 {px}px Fredoka';
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function rr(x, X, Y, w, h, r) { x.beginPath(); x.roundRect(X, Y, w, h, r); }
function pillPlane(text, color = '#7f5cf0', hU = 1.3, bg = '#ffffff') {
  const px = 120; const c = document.createElement('canvas').getContext('2d'); c.font = FONT.replace('{px}', px);
  const tw = c.measureText(text).width, w = Math.ceil(tw + px * 1.6), h = Math.ceil(px * 1.75);
  const tex = canvasTex(w, h + 24, (x) => {
    rr(x, 0, 18, w, h, h / 2); x.fillStyle = 'rgba(160,80,140,.25)'; x.fill();
    rr(x, 0, 0, w, h, h / 2); x.fillStyle = bg; x.fill();
    x.lineWidth = 10; x.strokeStyle = color; rr(x, 10, 10, w - 20, h - 20, (h - 20) / 2); x.stroke();
    x.font = FONT.replace('{px}', px); x.fillStyle = color; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + px * .06);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(hU * w / (h + 24), hU), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false }));
  scene.add(m); return m;
}
function ribbonPlane(text, hU = 1.6) {
  const px = 110; const c = document.createElement('canvas').getContext('2d'); c.font = FONT.replace('{px}', px);
  const tw = c.measureText(text).width, body = tw + px * 1.4, tail = px * .9, w = Math.ceil(body + tail * 2), h = Math.ceil(px * 1.9);
  const tex = canvasTex(w, h + 40, (x) => {
    const y0 = 20, bh = h - 30;
    // ekor reben (lebih gelap, di belakang)
    x.fillStyle = '#d9781a';
    for (const s of [0, 1]) {
      const X = s ? w - tail * 1.6 : 0; x.beginPath();
      if (!s) { x.moveTo(X, y0 + 30); x.lineTo(X + tail * 1.6, y0 + 30); x.lineTo(X + tail * 1.6, y0 + bh + 30); x.lineTo(X, y0 + bh + 30); x.lineTo(X + tail * .6, y0 + 30 + bh / 2); }
      else { x.moveTo(X + tail * 1.6, y0 + 30); x.lineTo(X, y0 + 30); x.lineTo(X, y0 + bh + 30); x.lineTo(X + tail * 1.6, y0 + bh + 30); x.lineTo(X + tail, y0 + 30 + bh / 2); }
      x.fill();
    }
    const g = x.createLinearGradient(0, y0, 0, y0 + bh); g.addColorStop(0, '#ffe27a'); g.addColorStop(.5, '#ffc531'); g.addColorStop(1, '#f2a116');
    rr(x, tail, y0, body, bh, 22); x.fillStyle = g; x.fill();
    x.fillStyle = 'rgba(255,255,255,.45)'; rr(x, tail + 24, y0 + 12, body - 48, bh * .28, 14); x.fill();
    x.setLineDash([16, 12]); x.lineWidth = 5; x.strokeStyle = 'rgba(160,80,10,.5)'; rr(x, tail + 14, y0 + 14, body - 28, bh - 28, 14); x.stroke(); x.setLineDash([]);
    x.font = FONT.replace('{px}', px); x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#b8560a'; x.fillText(text, w / 2, y0 + bh / 2 + 6 + px * .05);
    x.fillStyle = '#fffaf0'; x.fillText(text, w / 2, y0 + bh / 2 + px * .05);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(hU * w / (h + 40), hU), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: false }));
  scene.add(m); return m;
}

// ---------- teks 3D (huruf demi huruf) ----------
let font;
function word3D(lines, size, pal, maxW = 24, depth = .55) {
  const front = candy(pal.f, .25), side = candy(pal.s, .35);
  const g = new THREE.Group(), letters = [];
  const res = font.data.resolution, lh = size * 1.28;
  lines.forEach((line, li) => {
    let pen = 0; const row = [];
    for (const ch of line) {
      const gl = font.data.glyphs[ch] || font.data.glyphs['?']; const adv = gl.ha * size / res;
      if (ch !== ' ') {
        const geo = new TextGeometry(ch, { font, size, depth, curveSegments: 8, bevelEnabled: true, bevelThickness: size * .09, bevelSize: size * .055, bevelSegments: 4 });
        geo.computeBoundingBox(); const bb = geo.boundingBox, cx = (bb.min.x + bb.max.x) / 2;
        geo.translate(-cx, -size * .36, -depth / 2);
        const m = new THREE.Mesh(geo, [front, side]); row.push({ m, x: pen + cx }); g.add(m);
      }
      pen += adv;
    }
    const y = ((lines.length - 1) / 2 - li) * lh;
    row.forEach(r => { r.x -= pen / 2; r.y = y; letters.push(r); });
    g.userData.w = Math.max(g.userData.w || 0, pen);
  });
  g.userData.fit = Math.min(1, maxW / g.userData.w);
  g.userData.letters = letters; scene.add(g); return g;
}
// animasi huruf: muncul (pop berpusing), tari kecil, letupan keluar
function animWord(g, t, tin, tout, opts = {}) {
  const L = g.userData.letters, n = L.length, st = opts.stagger ?? .045, fit = g.userData.fit * (opts.scale ?? 1);
  g.visible = t > tin - .01 && t < tout + 1;
  if (!g.visible) return;
  g.scale.setScalar(fit);
  L.forEach((l, k) => {
    const u = seg(t, tin + k * st, tin + k * st + .6), s = elastic(u);
    const v = clamp((t - tout - (k % 5) * .02) / .7);
    const h1 = hash(k + n * 3.1), h2 = hash(k * 7.7 + 1), h3 = hash(k * 1.3 + 9);
    const dance = Math.sin(t * 6.7 - k * .55) * .1 * u;
    const ex = ei3(v);
    l.m.position.set(l.x + ex * (l.x * .9 + (h1 - .5) * 14), l.y + dance + (1 - eo3(u)) * (opts.drop ?? 3) + ex * ((h2 - .3) * 16), ex * (6 + h3 * 8));
    l.m.rotation.set(ex * (h2 - .5) * 9, (1 - eo3(u)) * Math.PI * 1.5 + ex * (h1 - .5) * 10, Math.sin(t * 3.3 + k) * .04 * u + ex * (h3 - .5) * 6);
    l.m.scale.setScalar(Math.max(.001, s * (1 - v ** 4)));
  });
}
function popPlane(m, t, tin, tout, base = 1) {
  const u = seg(t, tin, tin + .55), v = seg(t, tout, tout + .35);
  m.visible = u > 0 && v < 1;
  const s = backOut(u, 2.6) * (1 - ei3(v));
  m.scale.setScalar(Math.max(.001, s * base));
  m.rotation.z = (1 - eo3(u)) * -.25 + Math.sin(t * 2.3) * .015;
}

// ---------- kad foto (shader: bucu bulat, bingkai polaroid, kilauan, kilat, warna) ----------
const PHOTO_VS = 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }';
const PHOTO_FS = `varying vec2 vUv; uniform sampler2D map; uniform float aspect, radius, border, cy, shine, flash, op, pAsp, grade, fit;
  vec3 grd(vec3 c){ float l=dot(c,vec3(.299,.587,.114)); c=mix(vec3(l),c,1.+.16*grade); c=(c-.5)*(1.+.08*grade)+.5+.035*grade; return clamp(c,0.,1.); }
  void main(){
    vec2 hs=vec2(aspect,1.)*.5; vec2 p=(vUv-.5)*vec2(aspect,1.);
    vec2 q=abs(p)-(hs-radius); float d=length(max(q,0.))+min(max(q.x,q.y),0.)-radius;
    float a=1.-smoothstep(-.002,.002,d); if(a<=0.) discard;
    vec2 hi=hs-border; vec3 col=vec3(1.,.98,.95);
    if(abs(p.x)<hi.x && abs(p.y)<hi.y){
      vec2 iu=(p+hi)/(2.*hi); float ia=hi.x/hi.y;
      float ch=min(1.,pAsp/ia), cw=min(1.,ia/pAsp);      // potongan 'cover' (pecahan tinggi / lebar foto)
      vec2 cu=vec2(.5+(iu.x-.5)*cw, 1.-(cy-ch*.5+(1.-iu.y)*ch));
      if(fit<.5){ col=grd(texture2D(map,cu).rgb); }
      else {
        float wF=pAsp/ia; float sx=(iu.x-.5)/wF+.5;          // 'contain': penuh tinggi, tepi diisi versi kabur
        vec3 bg=texture2D(map,vec2(.5+(iu.x-.5)*cw*.9, 1.-(.5+(.5-iu.y)*ch*.9)),5.5).rgb;
        bg=mix(bg,vec3(1.,.85,.93),.28)*.92;
        float e=abs(sx-.5)-.5; bg*=1.-.35*exp(-max(e,0.)*wF*ia*14.);   // bayang lembut di tepi foto
        col = (sx>=0. && sx<=1.) ? grd(texture2D(map,vec2(sx,iu.y)).rgb) : bg;
      }
    }
    float sb=p.x+p.y*.55-shine; col+=vec3(1.,.97,.9)*exp(-sb*sb/.006)*.55+vec3(1.)*exp(-sb*sb/.06)*.12;
    col=mix(col,vec3(1.),flash);
    gl_FragColor=vec4(col,a*op);
  }`;
const TEX = {};
async function loadTex(f) {
  if (!TEX[f]) TEX[f] = new THREE.TextureLoader().loadAsync(f).then(t => { t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8; t.minFilter = THREE.LinearMipmapLinearFilter; return t; });
  return TEX[f];
}
function photoMat(tex, ph = {}) {
  const img = tex.image, pAsp = img.width / img.height;
  const fit = ph.fit ? (ph.fit === 'contain' ? 1 : 0) : (pAsp >= 1.45 ? 0 : 1);
  const cy = ph.crop != null ? (ph.crop + img.width / ASP / 2) / img.height : .5;
  return new THREE.ShaderMaterial({
    vertexShader: PHOTO_VS, fragmentShader: PHOTO_FS, transparent: true, side: THREE.DoubleSide, toneMapped: false,
    uniforms: { map: { value: tex }, aspect: { value: ASP }, radius: { value: .05 }, border: { value: .04 }, cy: { value: cy }, shine: { value: -9 }, flash: { value: 0 }, op: { value: 1 }, pAsp: { value: pAsp }, grade: { value: 1 }, fit: { value: fit } },
  });
}

// ---------- zarah (konfeti, bintang, hati, kilauan) di ruang kamera ----------
const CONF_N = 180;
const confetti = new THREE.InstancedMesh(new THREE.PlaneGeometry(.11, .07), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false }), CONF_N);
const CCOL = ['#ff5f9e', '#ffd23f', '#4fb3ff', '#35d0a5', '#9b7bff', '#ff9a6c', '#ffffff'];
for (let i = 0; i < CONF_N; i++) confetti.setColorAt(i, new THREE.Color(CCOL[i % CCOL.length]));
confetti.frustumCulled = false; camera.add(confetti);
const GOLDC = ['#ffd23f', '#ffc531', '#fff1a8', '#ffffff', '#ffb02e'];
const STARS_N = 24, stars = new THREE.InstancedMesh(STAR_G, candy(0xffd23f, .2), STARS_N); stars.frustumCulled = false; camera.add(stars);
const HEARTS_N = 12, hearts = new THREE.InstancedMesh(HEART_G, candy(0xff6fa5, .2), HEARTS_N); hearts.frustumCulled = false; camera.add(hearts);
function sparkTex() {
  return canvasTex(256, 256, (x) => {
    const g = x.createRadialGradient(128, 128, 0, 128, 128, 60); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256); x.fillStyle = '#fff';
    x.beginPath(); x.moveTo(128, 0); x.quadraticCurveTo(138, 118, 256, 128); x.quadraticCurveTo(138, 138, 128, 256); x.quadraticCurveTo(118, 138, 0, 128); x.quadraticCurveTo(118, 118, 128, 0); x.fill();
  });
}
const SPARK = sparkTex(), SPARK_N = 26, sparks = [];
for (let i = 0; i < SPARK_N; i++) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: SPARK, color: i % 3 ? 0xffffff : 0xfff0a0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
  camera.add(s); sparks.push(s);
}
const D = 10, VH = 2 * D * Math.tan(THREE.MathUtils.degToRad(20)), VW = VH * ASP;   // saiz skrin penuh pada jarak D
const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), P = new THREE.Vector3(), S = new THREE.Vector3();
const hide = (im, n) => { for (let i = 0; i < n; i++) { M4.makeScale(0, 0, 0); im.setMatrixAt(i, M4); } im.instanceMatrix.needsUpdate = true; };

// letupan konfeti dari dua bucu bawah (fizik bentuk tertutup: seretan + graviti)
function confettiBurst(t, t0, gold = false) {
  const tau = t - t0; if (tau < 0 || tau > 4.5) return false;
  const k = 1.4, g = 7;
  for (let i = 0; i < CONF_N; i++) {
    const h = j => hash(i * 13.37 + j * 1.71 + t0);
    const side = i % 2 ? 1 : -1, z = -2.5 - h(1) * 4, sc = (VH / 2) * (-z / D);
    const x0 = side * VW / 2 * (-z / D) * .98, y0 = -sc * 1.02;
    const vx = -side * (1.5 + h(2) * 4.5), vy = 6 + h(3) * 7, vz = (h(4) - .5) * 2;
    const e = (1 - Math.exp(-k * tau)) / k;
    P.set(x0 + vx * e + Math.sin(tau * (3 + h(5) * 4) + h(6) * 6) * .25 * (1 - Math.exp(-tau)), y0 + (vy + g / k) * e - g * tau / k, z + vz * e);
    E.set(tau * (4 + h(7) * 8), tau * (3 + h(8) * 6), h(9) * 6); Q.setFromEuler(E);
    const f = clamp((4.5 - tau) / .8) * clamp(tau * 20);
    S.setScalar(f * (.8 + h(10) * .8)); M4.compose(P, Q, S); confetti.setMatrixAt(i, M4);
    if (gold) confetti.setColorAt(i, new THREE.Color(GOLDC[i % 5])); else confetti.setColorAt(i, new THREE.Color(CCOL[i % CCOL.length]));
  }
  confetti.instanceMatrix.needsUpdate = true; confetti.instanceColor.needsUpdate = true; return true;
}
// hujan konfeti dari atas (penutup)
function confettiRain(t, t0) {
  const tau = t - t0; if (tau < 0) return false;
  for (let i = 0; i < CONF_N; i++) {
    const h = j => hash(i * 3.71 + j * 9.13);
    const z = -3 - h(1) * 6, sc = (-z / D);
    const fall = 1.2 + h(2) * 1.2, span = VH * sc * 1.25;
    const y = VH * sc * .62 - ((tau * fall + h(3) * span * 1.0) % span) + (tau < 1.5 ? (1.5 - tau) ** 2 * 3 * (1 - h(3)) : 0);
    P.set((h(4) - .5) * VW * sc * 1.1 + Math.sin(tau * 2 + h(5) * 6) * .4, y, z);
    E.set(tau * (2 + h(6) * 5), tau * (2 + h(7) * 4), h(8) * 6); Q.setFromEuler(E);
    S.setScalar(clamp(tau * 2) * (.8 + h(9) * .7)); M4.compose(P, Q, S); confetti.setMatrixAt(i, M4);
    confetti.setColorAt(i, new THREE.Color(CCOL[i % CCOL.length]));
  }
  confetti.instanceMatrix.needsUpdate = true; confetti.instanceColor.needsUpdate = true; return true;
}
// bintang & hati: cincin letupan ketika mendarat, kemudian terapung naik di tepi kiri/kanan (tidak menutup wajah)
function starShow(t, t0, t1) {
  const tau = t - t0; if (tau < 0 || t > t1 + .6) { hide(stars, STARS_N); hide(hearts, HEARTS_N); return; }
  const out = 1 - ei3(seg(t, t1, t1 + .6));
  const place = (im, i, N, salt) => {
    const h = j => hash(i * 5.3 + j * 2.9 + salt);
    const z = -4 - h(1) * 3, sc = -z / D, hw = VW / 2 * sc, hh = VH / 2 * sc;
    const side = i % 2 ? 1 : -1;
    // fasa 1: tersembur dari tengah ke tepi; fasa 2: terapung naik di jalur tepi (10% lebar)
    const u = eo3(seg(tau, 0, .9));
    const ex = side * hw * (.82 + h(2) * .14), y0 = (h(3) - .5) * 2 * hh;
    const rise = ((y0 + tau * (.35 + h(4) * .3) + hh) % (2 * hh)) - hh;
    P.set(lerp(0, ex, u), lerp((h(5) - .5) * 2, rise, u), z);
    E.set(Math.sin(tau * 1.5 + h(6) * 6) * .5, tau * (1.5 + h(7)) + h(8) * 6, Math.sin(tau * 2 + h(9)) * .4); Q.setFromEuler(E);
    S.setScalar((.18 + h(10) * .14) * sc * backOut(seg(tau, h(11) * .2, .5 + h(11) * .2)) * out);
    M4.compose(P, Q, S); im.setMatrixAt(i, M4);
  };
  for (let i = 0; i < STARS_N; i++) place(stars, i, STARS_N, 1); for (let i = 0; i < HEARTS_N; i++) place(hearts, i, HEARTS_N, 50);
  stars.instanceMatrix.needsUpdate = true; hearts.instanceMatrix.needsUpdate = true;
}
function sparkShow(t, t0, t1, edgeOnly = true) {
  const on = t >= t0 && t < t1;
  sparks.forEach((s, i) => {
    if (!on) { s.visible = false; return; }
    const h = j => hash(i * 7.1 + j * 3.3);
    const per = 1.1 + h(1) * 1.2, ph = ((t - t0) / per + h(2)) % 1, cyc = Math.floor((t - t0) / per + h(2));
    const hx = hash(i * 9.1 + cyc * 4.4), hy = hash(i * 2.3 + cyc * 8.8);
    const z = -3, sc = -z / D, hw = VW / 2 * sc, hh = VH / 2 * sc;
    let x = (hx - .5) * 2 * hw, y = (hy - .5) * 2 * hh;
    if (edgeOnly && Math.abs(x) < hw * .8 && Math.abs(y) < hh * .8) x = Math.sign(x || 1) * hw * (.82 + hx * .15);   // tolak ke jalur tepi
    s.visible = true; s.position.set(x, y, z);
    const k = Math.sin(ph * Math.PI) ** 3; s.scale.setScalar(.16 * k * (.6 + h(3)) + .001);
    s.material.rotation = ph * 2 + h(4) * 6; s.material.opacity = k;
  });
}

// ---------- bina semua elemen daripada garis masa ----------
const ttf = await new TTFLoader().loadAsync('fonts/Fredoka-Bold.ttf');
font = new Font(ttf);
await Promise.all(['700 100px Fredoka', '700 100px Cinzel', '600 100px "Cormorant Garamond"', 'italic 500 100px "Cormorant Garamond"'].map(f => document.fonts.load(f)));

const cardMesh = async (ph) => {
  const pivot = new THREE.Group(); camera.add(pivot);
  const card = new THREE.Mesh(new THREE.PlaneGeometry(VW * 1.002, VH * 1.002), photoMat(await loadTex(ph.f.f), ph.f));
  pivot.add(card); pivot.visible = false; return { ...ph, pivot, card };
};
const segs = [];
for (const S0 of TL.seg) {
  const S = { ...S0 };
  if (S.type === 'opener') {
    const ch = CHAPTERS[S.ci];
    S.title = word3D(ch.nama, ch.nama.length > 1 ? 2.9 : 3.3, PAL[ch.warna], 24, .8);
    S.sub = pillPlane(ch.sub, '#7f5cf0', 1.35);
    S.rib = ribbonPlane(ch.ribbon, 1.7);
    if (S.hero) {
      S.num = word3D([String(S.hero.n)], 6.5, PAL.gold, 24, 1.4);
      S.htxt = word3D(ch.hero.teks, 1.9, PAL.pink, 11, .6);
    }
  } else if (S.type === 'award' || S.type === 'group') {
    const pal = PAL[S.it.warna];
    S.title = word3D(S.it.title, 2.2, pal, 25, .65);
    S.rib = ribbonPlane(S.it.ribbon, 1.75);
    S.sub = pillPlane(S.it.sub, pal.accent, 1.15);
    S.photos = await Promise.all(S.photos.map(cardMesh));
  } else if (S.type === 'film') {
    S.film = makeFilm(renderer, W, H, CHAPTERS[S.ci], S);
  } else if (S.type === 'outro') {
    S.title = word3D(['TAHNIAH!'], 3.4, PAL.pink, 17, .9);
    S.rib = ribbonPlane(SEKOLAH, 1.7);
    S.sub = pillPlane(CHAPTERS.map(c => c.nama.join(' ')).join('  ·  '), '#7f5cf0', 1.05);
    S.subFit = Math.min(1, 25 / S.sub.geometry.parameters.width);
    S.pol = await Promise.all(OUTRO.slice(0, 5).map(async f => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 5.0 / ASP), photoMat(await loadTex(f), {}));
      m.material.uniforms.border.value = .055; m.material.uniforms.radius.value = .06; m.visible = false; scene.add(m); return m;
    }));
  }
  segs.push(S);
}
const OUT = segs.find(s => s.type === 'outro');
const HERO = segs.find(s => s.hero);

// ---------- render(t) ----------
function render(t) {
  const fly = eo3(seg(t, 0, 2.2));
  const outDolly = eio(seg(t, OUT.start, DUR));
  camera.position.set(Math.sin(t * .31) * .7, Math.cos(t * .23) * .35 + (1 - fly) * 2, lerp(62, 22, fly) - outDolly * 1.2);
  camera.lookAt(Math.sin(t * .31) * .3, (1 - fly) * 1.5, 0);
  camera.rotation.z += Math.sin(t * .5) * .008;

  rays.material.uniforms.rot.value = t * .12;
  rays.material.uniforms.amt.value = .16 + .08 * Math.sin(t * 2);
  clouds.forEach(c => { const u = c.userData; c.position.set(u.z > 0 ? u.x : (((u.x + t * u.sp + 60) % 120) + 120) % 120 - 60, u.y + Math.sin(t * .4 + u.sp * 9) * .3, u.z); });
  balloons.forEach(b => { const u = b.userData; b.position.set(u.x + Math.sin(t * .8 + u.ph) * .6, ((u.y0 + t * u.sp) % 30) - 15, u.z); b.rotation.z = Math.sin(t * 1.1 + u.ph) * .12; });
  bokeh.forEach(s => { const u = s.userData; s.position.set(u.x + Math.sin(t * .2 + u.ph) * 2, u.y + Math.cos(t * .17 + u.ph) * 1.5, u.z); s.scale.setScalar(u.s * (1.1 + .3 * Math.sin(t * 1.3 + u.ph))); });

  let fx = null;   // kesan foto aktif terkini
  trophy.visible = false;
  for (const S of segs) {
    const near = t > S.start - 1.5 && t < S.end + 1.5;
    if (S.type === 'opener') {
      animWord(S.title, near ? t : -99, S.titleIn, S.titleOut, { stagger: S.first ? .09 : .06, drop: 7 });
      S.title.position.set(0, S.title.userData.letters.some(l => l.y < 0) ? 1.5 : 2.4, 0);
      popPlane(S.sub, t, S.subIn, S.titleOut - .1); S.sub.position.set(0, CHAPTERS[S.ci].nama.length > 1 ? -3.1 : -.6, 1);
      popPlane(S.rib, t, S.ribIn, S.titleOut); S.rib.position.set(0, CHAPTERS[S.ci].nama.length > 1 ? -5.4 : -3.4, 1);
      if (S.hero) {
        const H = S.hero;
        animWord(S.num, near ? t : -99, H.in + .2, H.out, { stagger: 0, drop: 2 }); S.num.position.set(-5.8, 2.2, 0); S.num.rotation.y = Math.sin(t * 1.4) * .25;
        animWord(S.htxt, near ? t : -99, H.in + .55, H.out, { stagger: .035 }); S.htxt.position.set(-5.8, -3.6, 1);
        const u = seg(t, H.in, H.in + 1), v = seg(t, H.out - .05, H.out + .55);
        if (u > 0 && v < 1) {
          trophy.visible = true;
          trophy.scale.setScalar(Math.max(.001, backOut(u, 2.2) * (1 - ei3(v)) * 1.25));
          trophy.position.set(6.5 + ei3(v) * 10, -3.6 + (1 - eo3(u)) * -8 + Math.sin(t * 2) * .25, 0);
          trophy.rotation.y = t * 1.3 + (1 - eo3(u)) * 6; trophy.userData.star.rotation.y = t * 3;
        }
      }
    } else if (S.type === 'award' || S.type === 'group') {
      const c = S.card;
      animWord(S.title, near ? t : -99, c.lettersIn, c.out, { stagger: .035 });
      S.title.position.set(0, S.it.title.length > 1 ? .9 : 1.1, 0);
      popPlane(S.rib, t, c.ribIn, c.out - .05); S.rib.position.set(0, 5.0, .5);
      popPlane(S.sub, t, c.subIn, c.out + .05); S.sub.position.set(0, -3.7, .5);
      for (const P of S.photos) {
        const vis = t >= P.fly && t < P.end; P.pivot.visible = vis;
        if (!vis) continue;
        const U = P.card.material.uniforms, piv = P.pivot, card = P.card;
        const e = eo3(seg(t, P.fly, P.land)), land = t - P.land;
        const z = lerp(-95, -D, e);
        let sc = lerp(.55, 1, e), px = (1 - e) * 6, py = (1 - e) * -3;
        if (land > 0) { sc = 1 + .035 * Math.exp(-land * 5) * Math.sin(land * 22); px = Math.sin(land * 53) * .06 * Math.exp(-land * 7); py = Math.cos(land * 47) * .06 * Math.exp(-land * 7); }
        const f = ei3(seg(t, P.flip, P.end));
        const L = land > 0 ? 1 : 0;
        piv.position.set(-VW / 2 * L - f * 1.5, 0, z); piv.rotation.set(0, f * -2.0, 0);
        card.position.set(VW / 2 * L + px, py, 0);
        card.rotation.set(0, L ? 0 : (1 - e) * Math.PI * 2, L ? 0 : (1 - e) * .6); card.scale.setScalar(sc);
        const fr = 1 - eo3(seg(t, P.land - .1, P.land + .25)), fb = eo3(seg(t, P.flip, P.flip + .25));
        U.border.value = .045 * Math.max(fr, fb); U.radius.value = .06 * Math.max(fr, fb) + .0001;
        U.flash.value = land > 0 ? Math.max(0, 1 - land * 3.2) * (P.fx === 'mid' ? .5 : .85) : 0;
        U.shine.value = t < P.land + 1.6 ? lerp(-2.2, 2.2, eio(seg(t, P.land + .5, P.land + 1.6))) : lerp(-2.2, 2.2, eio(seg(t, P.flip - 1.0, P.flip - .1)));
        if (land >= 0) fx = { P, finale: S.it.finale };
      }
    } else if (S.type === 'outro') {
      const o = S.start;
      S.pol.forEach((m, i) => {
        const k = i - (S.pol.length - 1) / 2, u = seg(t, o + .1 + i * .13, o + .9 + i * .13), e = backOut(u, 1.6);
        m.visible = u > 0;
        m.position.set(lerp(k * 12, k * 5.25, eo3(u)), lerp(-14, -3.2 - k * k * .28, e) + Math.sin(t * 1.6 + i) * .18, -Math.abs(k) * .9);
        m.rotation.set(0, -k * .16, k * -.05 + Math.sin(t * 1.2 + i) * .03 + (1 - eo3(u)) * k * .8);
        m.scale.setScalar(Math.max(.001, e));
        m.material.uniforms.shine.value = lerp(-3, 3, ((t - o - i * .25) * .35) % 1.5);
      });
      animWord(S.title, t, o + 1.0, DUR + 5, { stagger: .07, drop: 6 }); S.title.position.set(1.2, 3.9, 0);
      popPlane(S.rib, t, o + 1.9, DUR + 5); S.rib.position.set(0, 1.25, 1);
      popPlane(S.sub, t, o + 2.4, DUR + 5, S.subFit); S.sub.position.set(0, -.45, 1);
    }
  }

  // maskot: kiri bawah; ke kanan semasa babak "N ANUGERAH"; atas-kiri pada penutup
  if (t < OUT.start) {
    const mi = eo3(seg(t, .6, 1.6));
    const go = HERO ? eio(seg(t, HERO.hero.in - .4, HERO.hero.in + .4)) - eio(seg(t, HERO.hero.out - .15, HERO.hero.out + .65)) : 0;
    poseMascot(t, lerp(lerp(-18, -11.5, mi), 11.8, go), -5.2 + Math.sin(go * Math.PI) * 3, 2, 1.25, t < 2 ? mi : 1);
  } else poseMascot(t, -10.6, 3.2, 1, 1.15, backOut(seg(t, OUT.start + 1.2, OUT.start + 1.9)));

  // kesan zarah
  let conf = false, spk = false;
  if (fx) {
    const P = fx.P;
    if (P.fx !== 'mid') conf = confettiBurst(t, P.land, P.fx === 'gold');
    if (fx.finale && t >= P.land + 2.2) conf = confettiBurst(t, P.land + 2.2, true) || conf;
    starShow(t, P.land, P.flip); sparkShow(t, P.land + .3, P.flip, true); spk = true;
  } else { hide(stars, STARS_N); hide(hearts, HEARTS_N); }
  if (t >= OUT.start + 1.2) { conf = confettiRain(t, OUT.start + 1.2); sparkShow(t, OUT.start + 1.5, DUR + 5, false); spk = true; }
  for (const S of segs) if (S.type === 'opener' && !spk && t > S.subIn && t < S.titleOut) { sparkShow(t, S.subIn, S.titleOut, false); spk = true; }
  if (!conf) hide(confetti, CONF_N);
  if (!spk) sparkShow(t, 1e9, 0);
  renderer.render(scene, camera);
}
const fadeQuad = new THREE.Mesh(new THREE.PlaneGeometry(VW * 2, VH * 2), new THREE.MeshBasicMaterial({ color: 0xfff4fa, transparent: true, opacity: 0, depthTest: false, toneMapped: false }));
fadeQuad.position.z = -1; fadeQuad.renderOrder = 999; camera.add(fadeQuad);
const FILM = segs.filter(s => s.type === 'film');
window.render = async t => {
  const F = FILM.find(s => t >= s.start && t < s.end);
  if (F) return F.film.render(t);
  const after = FILM.find(s => t >= s.end && t < s.end + .6);   // keluar dari bab filem: putih → pastel
  fadeQuad.material.opacity = Math.min(1, eio(seg(t, DUR - .9, DUR)) + (1 - eo3(seg(t, 0, .5))) + (after ? 1 - eo3(seg(t, after.end, after.end + .6)) : 0));
  render(t);
};
window.DUR = DUR;
window.ready = true;
if (!new URLSearchParams(location.search).has('still')) {
  const t0 = performance.now(); const loop = () => { window.render(((performance.now() - t0) / 1000) % DUR); requestAnimationFrame(loop); }; loop();
}
