// Bab gaya DOKUMENTARI SINEMATIK: satu quad skrin penuh.
// Gred warna filem (split-tone, lengkung S lembut, desaturasi), halation merah pada sorotan, bloom, vinyet,
// grain mengikut kecerahan, kelipan pendedahan, gate weave, habuk, letterbox 2:1, film burn masuk/keluar.
// Teks (Cinzel / Cormorant Garamond) dilukis pada kanvas 2D dan dikomposit SEBELUM grain supaya kelihatan 'dicetak' pada filem.
import * as THREE from 'three';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eio = x => x < .5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2;
const eo = x => 1 - (1 - x) ** 3;
const noise1 = x => { const i = Math.floor(x), f = x - i, h = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }; const u = f * f * (3 - 2 * f); return h(i) * (1 - u) + h(i + 1) * u - .5; };

const FS = `
precision highp float;
varying vec2 vUv;
uniform sampler2D mapA, mapB, txt; uniform float hasA, hasB, mixAB;
uniform vec4 xfA, xfB;      // (zoom, offx, offy, cy)
uniform vec2 chA, chB;      // (tinggi potongan, lebar potongan)
uniform float time, frame, expo, burn, burnSide, white, bars, aspect, dark, soft;
uniform vec2 weave;
float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
vec2 puv(vec2 uv, vec4 xf, vec2 ch){
  vec2 l=(uv-.5)/xf.x+.5+xf.yz;
  return vec2(.5+(l.x-.5)*ch.y, 1.-(xf.w-ch.x*.5+(1.-l.y)*ch.x));
}
vec3 shot(sampler2D m, vec2 uv, vec4 xf, vec2 ch, out vec3 blur){
  vec2 p=puv(uv,xf,ch);
  blur=texture2D(m,p,4.5).rgb;
  return mix(texture2D(m,p).rgb, texture2D(m,p,5.5).rgb, soft);
}
vec3 grade(vec3 c, vec3 b){
  // halation: sorotan memancar merah-oren di sekeliling
  vec3 hb=max(b-.62,0.); float hl=dot(hb,vec3(.4,.4,.2));
  c+=vec3(1.,.32,.12)*hl*.9 + b*.06;
  float l=dot(c,vec3(.299,.587,.114));
  c=mix(vec3(l),c,.86);                                     // desaturasi ringan
  c+= vec3(-.025,.01,.03)*(1.-l) + vec3(.05,.015,-.045)*l;   // bayang teal, sorotan hangat
  c=mix(c, c*c*(3.-2.*c), .45);                              // lengkung S lembut
  c=c*.95+.025;                                              // hitam 'lifted' seperti cetakan filem
  return c;
}
void main(){
  vec2 uv=vUv+weave;
  vec3 col=vec3(0.), bA, bB;
  if(hasA>.5){ col=grade(shot(mapA,uv,xfA,chA,bA),bA); }
  if(hasB>.5 && mixAB>0.){ vec3 cb=grade(shot(mapB,uv,xfB,chB,bB),bB); col=mix(col,cb,mixAB); }
  col*=dark*expo;
  // teks (alfa premultiplied dari kanvas)
  vec4 tx=texture2D(txt,vUv); col=col*(1.-tx.a)+tx.rgb;
  // vinyet
  vec2 q=vUv-.5; col*=1.-.55*dot(q*vec2(aspect*.62,1.),q*vec2(aspect*.62,1.));
  // film burn: cahaya oren dari tepi + pendedahan berlebihan
  if(burn>0.){
    float d=length((vUv-vec2(burnSide,.35))*vec2(aspect,1.));
    float bm=burn*1.6-d*.9 + .15*sin(vUv.y*9.+time*7.);
    vec3 bc=mix(vec3(1.,.42,.12),vec3(1.,.93,.75),clamp(bm-.3,0.,1.));
    col=mix(col,bc,clamp(bm,0.,1.)); col+=vec3(1.,.6,.3)*burn*.35;
  }
  col=mix(col,vec3(1.),white);
  // grain (lebih kuat pada tona tengah), berubah setiap bingkai
  float g=h21(vUv*vec2(1920.,1080.)+frame*17.13)-.5; float g2=h21(vUv*vec2(960.,540.)+frame*3.7)-.5;
  float lum=dot(col,vec3(.333)); col+=(g*.07+g2*.04)*(1.-abs(lum-.5)*1.2);
  // habuk: titik jarang yang berubah setiap bingkai
  vec2 cell=floor(vUv*vec2(32.,18.)); float hs=h21(cell+frame*.913);
  if(hs>.9975){ vec2 c0=(cell+vec2(h21(cell+1.3+frame),h21(cell+7.1+frame)))/vec2(32.,18.); float dd=length((vUv-c0)*vec2(aspect,1.)); col=mix(col,vec3(.08),smoothstep(.0035,.0015,dd)*.7); }
  // letterbox
  if(vUv.y<bars||vUv.y>1.-bars) col=vec3(0.);
  gl_FragColor=vec4(clamp(col,0.,1.),1.);
}`;

export function makeFilm(renderer, W, H, ch, S) {
  const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  const txt = new THREE.CanvasTexture(cv); txt.premultiplyAlpha = true; txt.colorSpace = THREE.NoColorSpace;
  const blank = new THREE.DataTexture(new Uint8Array(4), 1, 1); blank.needsUpdate = true;
  const U = {
    mapA: { value: blank }, mapB: { value: blank }, txt: { value: txt }, hasA: { value: 0 }, hasB: { value: 0 }, mixAB: { value: 0 },
    xfA: { value: new THREE.Vector4(1, 0, 0, .5) }, xfB: { value: new THREE.Vector4(1, 0, 0, .5) },
    chA: { value: new THREE.Vector2(1, 1) }, chB: { value: new THREE.Vector2(1, 1) },
    time: { value: 0 }, frame: { value: 0 }, expo: { value: 1 }, burn: { value: 0 }, burnSide: { value: 0 }, white: { value: 0 },
    bars: { value: .0556 }, soft: { value: 0 }, aspect: { value: W / H }, dark: { value: 1 }, weave: { value: new THREE.Vector2() },
  };
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: U, vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }', fragmentShader: FS, depthTest: false })));

  const loader = new THREE.TextureLoader(), cache = new Map();
  const tex = async (f, keep = true) => {
    if (cache.has(f)) return cache.get(f);
    const t = await loader.loadAsync(f); t.colorSpace = THREE.NoColorSpace; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 4;
    if (keep) cache.set(f, t); return t;
  };
  let vidTex = null, vidKey = '';
  async function shotTex(sh, t) {
    if (!sh.video) return tex(sh.f);
    const i = clamp(Math.floor((t - sh.start) * sh.fps), 0, sh.n - 1), key = `${sh.video}/${String(i + 1).padStart(3, '0')}.jpg`;
    if (key !== vidKey) { const nt = await tex(key, false); if (vidTex) vidTex.dispose(); vidTex = nt; vidKey = key; }
    return vidTex;
  }
  // gerakan kamera filem (perlahan, eased), ditambah goyangan pegang tangan sangat halus
  function xf(sh, t, img) {
    const u = eio(seg(t, sh.start, sh.end + .35)), pAsp = img.width / img.height;
    let z = 1, ox = 0, oy = 0;
    if (sh.gerak === 'masuk') z = 1 + .06 * u;
    if (sh.gerak === 'keluar') z = 1.07 - .07 * u;
    if (sh.gerak === 'kiri') { z = 1.06; ox = .022 - .044 * u; }
    ox += noise1(t * .6 + 3) * .003 / z; oy += noise1(t * .5 + 9) * .003 / z;
    const ch = Math.min(1, pAsp / (W / H)), cy = sh.crop != null ? (sh.crop + img.width / (W / H) / 2) / img.height : .5;
    return { v: new THREE.Vector4(z, ox, oy, cy), ch: new THREE.Vector2(ch, Math.min(1, (W / H) / pAsp)) };
  }

  // ---------- teks ----------
  const K = H / 1080;
  function spaced(text, x, y, track, align = 'center') {   // huruf dengan jarak (tracking) manual
    const ws = [...text].map(c => g.measureText(c).width), tw = ws.reduce((a, b) => a + b, 0) + track * (ws.length - 1);
    let px = align === 'center' ? x - tw / 2 : x;
    [...text].forEach((c, i) => { g.fillText(c, px, y); px += ws[i] + track; });
    return tw;
  }
  function drawText(t) {
    g.clearRect(0, 0, W, H);
    const cream = a => `rgba(246,236,214,${a})`, gold = a => `rgba(226,186,110,${a})`;
    g.textBaseline = 'middle';
    // pembuka: tajuk majlis
    {
      const a = seg(t, S.start + .8, S.start + 2.0) * (1 - seg(t, S.start + 3.6, S.start + 4.4));
      if (a > 0) {
        const tr = (1 - eo(seg(t, S.start + .8, S.start + 4.4))) * 30 * K + 14 * K;
        g.font = `700 ${78 * K}px Cinzel`; g.fillStyle = cream(a); g.filter = `blur(${(1 - a) * 6 * K}px)`;
        spaced(ch.nama.join(' '), W / 2, H * .46, tr);
        g.font = `italic 500 ${40 * K}px "Cormorant Garamond"`; g.fillStyle = gold(a * seg(t, S.start + 1.4, S.start + 2.4));
        spaced(ch.sub, W / 2, H * .56, 2 * K);
        g.font = `600 ${22 * K}px "Cormorant Garamond"`; g.fillStyle = cream(.75 * a * seg(t, S.start + 1.8, S.start + 2.8));
        spaced(ch.kecil.toUpperCase(), W / 2, H * .63, 8 * K);
        g.filter = 'none';
      }
    }
    // lower-third dokumentari: garis emas dilukis, teks naik perlahan
    for (const sh of S.shots) {
      if (!sh.lower || t < sh.start + .6 || t > sh.end) continue;
      const a = seg(t, sh.start + .9, sh.start + 1.7) * (1 - seg(t, sh.end - .9, sh.end - .3));
      const ln = eo(seg(t, sh.start + .6, sh.start + 1.5)) * (1 - seg(t, sh.end - .9, sh.end - .3));
      const x = 120 * K, y = H * .78;
      const sc = g.createLinearGradient(0, 0, 1000 * K, 0); sc.addColorStop(0, `rgba(0,0,0,${.6 * ln})`); sc.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = sc; g.fillRect(0, y - 90 * K, 1000 * K, 170 * K);
      g.fillStyle = gold(.9 * ln); g.fillRect(x, y, 380 * K * ln, 2 * K);
      g.font = `700 ${42 * K}px Cinzel`; g.fillStyle = cream(a); spaced(sh.lower[0].toUpperCase(), x, y - 30 * K + (1 - a) * 10 * K, 6 * K, 'left');
      g.font = `italic 500 ${44 * K}px "Cormorant Garamond"`; g.fillStyle = gold(a * seg(t, sh.start + 1.2, sh.start + 2.0));
      spaced(sh.lower[1], x, y + 32 * K + (1 - a) * 8 * K, 1 * K, 'left');
    }
    // kad akhir emas
    const F = S.fin, A = ch.akhir;
    if (t >= F.start) {
      const a1 = seg(t, F.start + .15, F.start + 1.2), a2 = seg(t, F.start + .9, F.start + 1.8), a3 = seg(t, F.start + 1.5, F.start + 2.4);
      const tr = (1 - eo(seg(t, F.start, F.start + 3.5))) * 40 * K + 16 * K;
      g.font = `700 ${108 * K}px Cinzel`;
      const gr = g.createLinearGradient(0, H * .36, 0, H * .48); gr.addColorStop(0, '#fff3cf'); gr.addColorStop(.5, '#e7bd62'); gr.addColorStop(1, '#a8752a');
      g.fillStyle = gr; g.globalAlpha = a1; g.filter = `blur(${(1 - a1) * 8 * K}px)`;
      const tw = spaced(A.atas, W / 2, H * .42, tr); g.filter = 'none';
      // kilauan menyapu tajuk
      const sx = (seg(t, F.start + 1.3, F.start + 2.6) * 1.6 - .3) * tw + W / 2 - tw / 2;
      g.globalCompositeOperation = 'source-atop';
      const sg = g.createLinearGradient(sx - 120 * K, 0, sx + 120 * K, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,240,.85)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = sg; g.fillRect(0, H * .33, W, H * .18); g.globalCompositeOperation = 'source-over';
      g.globalAlpha = 1;
      g.fillStyle = gold(a1); g.fillRect(W / 2 - 260 * K * a2, H * .505, 520 * K * a2, 2 * K);
      g.font = `italic 500 ${44 * K}px "Cormorant Garamond"`; g.fillStyle = cream(a2); spaced(A.tengah, W / 2, H * .56, 1 * K);
      g.font = `700 ${32 * K}px Cinzel`; g.fillStyle = gold(a3); spaced(A.bawah, W / 2, H * .64, 10 * K);
      g.font = `600 ${22 * K}px "Cormorant Garamond"`; g.fillStyle = cream(.7 * a3); spaced(A.kecil.toUpperCase(), W / 2, H * .7, 8 * K);
    }
    txt.needsUpdate = true;
  }

  async function render(t) {
    const shots = S.shots;
    const ci = shots.findIndex(s => t >= s.start && t < s.end);
    const XD = .4;   // larut silang antara syot
    U.hasA.value = 0; U.hasB.value = 0; U.mixAB.value = 0; U.dark.value = 1; U.soft.value = 0;
    if (ci >= 0) {
      const a = shots[ci], ta = await shotTex(a, t), xa = xf(a, t, ta.image);
      U.mapA.value = ta; U.xfA.value.copy(xa.v); U.chA.value.copy(xa.ch); U.hasA.value = 1;
      const nx = shots[ci + 1];
      if (nx && t > a.end - XD) {
        const tb = await shotTex(nx, nx.start), xb = xf(nx, t, tb.image);
        U.mapB.value = tb; U.xfB.value.copy(xb.v); U.chB.value.copy(xb.ch); U.hasB.value = 1; U.mixAB.value = eio(seg(t, a.end - XD, a.end));
      }
      if (ci === 0) U.dark.value = eio(seg(t, a.start - .2, a.start + .8));
      if (ci === shots.length - 1) U.dark.value = 1 - eio(seg(t, a.end - 1.0, a.end));
    } else if (t < shots[0].start) {   // pembuka: foto pertama sangat gelap & kabur di belakang tajuk
      const f = shots.find(s => !s.video) || shots[0], tf = await shotTex(f, t), x = xf({ ...f, start: S.start, end: S.start + 6, gerak: 'masuk' }, t, tf.image);
      U.mapA.value = tf; U.xfA.value.copy(x.v); U.chA.value.copy(x.ch); U.hasA.value = 1; U.dark.value = .16;
    } else if (t >= S.fin.start) {   // kad akhir: foto kabur sangat gelap, perlahan zum masuk
      const f = shots.filter(s => !s.video).at(-1), tf = await shotTex(f, t), x = xf({ ...f, start: S.fin.start, end: S.fin.end, gerak: 'masuk' }, t, tf.image);
      U.mapA.value = tf; U.xfA.value.copy(x.v); U.chA.value.copy(x.ch); U.hasA.value = 1; U.soft.value = 1;
      U.dark.value = .2 * eio(seg(t, S.fin.start, S.fin.start + 1.2));
    }
    U.time.value = t; U.frame.value = Math.floor(t * 24);   // grain/habuk berubah pada kadar 24 fps filem
    U.expo.value = 1 + noise1(t * 24 * .37) * .035;          // kelipan
    U.weave.value.set(noise1(t * 3.1) * .0012, noise1(t * 2.7 + 5) * .0016);
    U.bars.value = .0556 * eo(seg(t, S.start, S.start + .6));
    // burn masuk (dari dunia pastel) dan keluar (ke putih)
    const bIn = 1 - seg(t, S.start, S.start + .7), bOut = seg(t, S.end - .9, S.end);
    U.burn.value = Math.max(bIn, bOut); U.burnSide.value = bIn > 0 ? 0 : 1;
    U.white.value = Math.max(bIn * bIn * .9, eio(seg(t, S.end - .45, S.end)));
    drawText(t);
    renderer.render(scene, cam);
  }
  return { render };
}
