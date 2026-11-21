// Intro badge rasmi SK Sultan Omar:
//   dandelion hologram -> ditiup angin -> benih menjadi dron mikro -> berkawan dan
//   mengunci membentuk badge -> imbasan mendedahkan badge sebenar -> dron memisah
//   dan menulis nama sekolah.
// Titik zarah dijana oleh scripts/badge_titik.py (public/montaj/badge_titik.json).
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, Easing, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {Bintang, useTekstur} from './tiga';

const W = 1920;
const H = 1080;
const FPS = 30;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ORB = "'Orbitron', sans-serif";
const MONO = "'JetBrains Mono', monospace";
const CYAN = '#38e8ff';

// Susun atur dunia
const BH = 4.6; // tinggi badge
const BY = 0.75; // pusat badge
const TY = -2.35; // pusat nama sekolah
const TW = 12.6; // lebar nama sekolah
const D = new THREE.Vector3(-3.3, -0.1, 0.5); // kepala dandelion
const DR = 1.15;

type Data = {
  badge: {aspek: number; x: number[]; y: number[]; c: number[]; tepi: number[]};
  teks: {lebar: number; tinggi: number; x: number[]; y: number[]};
};

const useJson = (src: string) => {
  const [handle] = useState(() => delayRender('json ' + src));
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => {
    fetch(staticFile(src))
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        continueRender(handle);
      })
      .catch((e) => cancelRender(e));
  }, [src, handle]);
  return data;
};

const ss = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const cl = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

// Bezier kubik untuk satu paksi
const bz = (a: number, b: number, c: number, d: number, s: number) => {
  const u = 1 - s;
  return u * u * u * a + 3 * u * u * s * b + 3 * u * s * s * c + s * s * s * d;
};

const spriteTex = (() => {
  let t: THREE.Texture | null = null;
  return () => {
    if (t) return t;
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.25, 'rgba(255,255,255,.85)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    t = new THREE.CanvasTexture(c);
    return t;
  };
})();

// Tekstur dail HUD (gelang sepusat, tanda detik, lengkok putus-putus)
const dailTex = (seed: string, padat = 1) => {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const g = c.getContext('2d')!;
  g.translate(512, 512);
  g.strokeStyle = CYAN;
  g.fillStyle = CYAN;
  g.shadowColor = CYAN;
  g.shadowBlur = 8;
  for (let i = 0; i < 9 * padat; i++) {
    const r = 180 + random(`${seed}r${i}`) * 320;
    g.lineWidth = 1 + random(`${seed}w${i}`) * 5;
    g.globalAlpha = 0.25 + random(`${seed}a${i}`) * 0.6;
    const n = 1 + Math.floor(random(`${seed}n${i}`) * 4);
    for (let k = 0; k < n; k++) {
      const a0 = random(`${seed}s${i}${k}`) * Math.PI * 2;
      const a1 = a0 + 0.3 + random(`${seed}e${i}${k}`) * 1.6;
      g.beginPath();
      g.arc(0, 0, r, a0, a1);
      g.stroke();
    }
  }
  g.globalAlpha = 0.7;
  g.lineWidth = 2;
  for (let k = 0; k < 120; k++) {
    const a = (k / 120) * Math.PI * 2;
    const r0 = 470;
    const r1 = k % 10 === 0 ? 440 : 458;
    g.beginPath();
    g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
    g.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
    g.stroke();
  }
  g.globalAlpha = 0.9;
  g.lineWidth = 3;
  g.beginPath();
  g.arc(0, 0, 500, 0, Math.PI * 2);
  g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};

const Kamera: React.FC<{t: number}> = ({t}) => {
  const {camera} = useThree();
  const k = ss(cl((t - 1.5) / 2.9));
  const dol = interpolate(t, [4.4, 9], [0, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const px = THREE.MathUtils.lerp(-2.4, 0, k);
  const py = THREE.MathUtils.lerp(-0.3, 0.3, k);
  const pz = THREE.MathUtils.lerp(7.2, 14.5, k) - dol * 1.4;
  const tx = THREE.MathUtils.lerp(-2.2, 0, k);
  const ty = THREE.MathUtils.lerp(-0.1, 0.3, k);
  camera.position.set(px + Math.sin(t * 0.7) * 0.08, py, pz);
  camera.lookAt(tx, ty, THREE.MathUtils.lerp(0.5, 0, k));
  camera.rotateZ(THREE.MathUtils.lerp(0.06, 0, k));
  return null;
};

// ---------------------------------------------------------------- zarah badge
type Badge = {
  n: number;
  p0: Float32Array; // kedudukan benih di dandelion
  c1: Float32Array;
  c2: Float32Array;
  tg: Float32Array; // sasaran di badge
  col: Float32Array;
  rel: Float32Array;
  arr: Float32Array;
  ph: Float32Array;
};

const sediaBadge = (d: Data): Badge => {
  const b = d.badge;
  const n = b.x.length;
  const o = {
    n,
    p0: new Float32Array(n * 3),
    c1: new Float32Array(n * 3),
    c2: new Float32Array(n * 3),
    tg: new Float32Array(n * 3),
    col: new Float32Array(n * 3),
    rel: new Float32Array(n),
    arr: new Float32Array(n),
    ph: new Float32Array(n),
  };
  for (let i = 0; i < n; i++) {
    // arah rawak sfera untuk benih
    const u = random(`u${i}`) * 2 - 1;
    const v = random(`v${i}`) * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const dx = s * Math.cos(v);
    const dy = u;
    const dz = s * Math.sin(v);
    const rr = DR * (0.93 + random(`r${i}`) * 0.1);
    const P = [D.x + dx * rr, D.y + dy * rr, D.z + dz * rr];
    const T = [b.x[i] * BH, b.y[i] * BH + BY, 0];
    const ang = Math.atan2(b.y[i], b.x[i]) + 1.9;
    const rw = random(`w${i}`);
    const C1 = [P[0] + 2.6 + 1.8 * rw, P[1] + 1.0 + 1.8 * random(`wy${i}`), P[2] + 1.6 * (random(`wz${i}`) - 0.3)];
    const C2 = [T[0] + Math.cos(ang) * 3.3, T[1] + Math.sin(ang) * 3.3, 1.8 + random(`cz${i}`) * 1.5];
    o.p0.set(P, i * 3);
    o.c1.set(C1, i * 3);
    o.c2.set(C2, i * 3);
    o.tg.set(T, i * 3);
    o.col.set([b.c[i * 3], b.c[i * 3 + 1], b.c[i * 3 + 2]], i * 3);
    // angin dari kiri: benih di sebelah kanan dahulu terlepas
    o.rel[i] = 1.5 + 0.65 * (1 - (dx + 1) / 2) + 0.3 * random(`rl${i}`);
    // badge terbina dari atas ke bawah, garis tepi dahulu
    const yn = 0.5 - b.y[i];
    o.arr[i] = 3.7 + 1.05 * yn + 0.22 * random(`ar${i}`) - 0.25 * b.tepi[i];
    o.ph[i] = random(`ph${i}`) * 6.28;
  }
  return o;
};

const posBadge = (o: Badge, i: number, t: number, out: Float32Array, j: number) => {
  const k = i * 3;
  if (t <= o.rel[i]) {
    // berpusing perlahan di kepala dandelion
    const a = t * 0.25;
    const x = o.p0[k] - D.x;
    const z = o.p0[k + 2] - D.z;
    out[j] = D.x + x * Math.cos(a) - z * Math.sin(a);
    out[j + 1] = o.p0[k + 1];
    out[j + 2] = D.z + x * Math.sin(a) + z * Math.cos(a);
    return 0;
  }
  if (t >= o.arr[i]) {
    out[j] = o.tg[k];
    out[j + 1] = o.tg[k + 1];
    out[j + 2] = o.tg[k + 2];
    return 1;
  }
  const s0 = (t - o.rel[i]) / (o.arr[i] - o.rel[i]);
  const s = ss(s0);
  const wob = Math.sin(Math.PI * s0) * 0.35;
  const ph = o.ph[i];
  const a = 0.25 * o.rel[i];
  const x0 = o.p0[k] - D.x;
  const z0 = o.p0[k + 2] - D.z;
  const P0x = D.x + x0 * Math.cos(a) - z0 * Math.sin(a);
  const P0z = D.z + x0 * Math.sin(a) + z0 * Math.cos(a);
  out[j] = bz(P0x, o.c1[k], o.c2[k], o.tg[k], s) + Math.sin(t * 3.1 + ph) * wob;
  out[j + 1] = bz(o.p0[k + 1], o.c1[k + 1], o.c2[k + 1], o.tg[k + 1], s) + Math.cos(t * 2.4 + ph) * wob;
  out[j + 2] = bz(P0z, o.c1[k + 2], o.c2[k + 2], o.tg[k + 2], s) + Math.sin(t * 1.8 + ph * 1.3) * wob;
  return 0.5;
};

const BadgeZarah: React.FC<{o: Badge; t: number; op: number}> = ({o, t, op}) => {
  const lapis = useMemo(
    () =>
      [0, 1, 2].map(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(o.n * 3), 3));
        g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(o.n * 3), 3));
        return g;
      }),
    [o],
  );
  // 0 = zarah utama, 1-2 = jejak dron
  const lag = [0, 0.05, 0.11];
  const gain = [1, 0.45, 0.2];
  lapis.forEach((g, L) => {
    const P = g.attributes.position.array as Float32Array;
    const C = g.attributes.color.array as Float32Array;
    const tt = t - lag[L];
    for (let i = 0; i < o.n; i++) {
      const j = i * 3;
      const st = posBadge(o, i, tt, P, j);
      let r: number, gg: number, b: number;
      if (st === 0) {
        if (L > 0) {
          r = gg = b = 0;
        } else {
          const kel = 0.55 + 0.25 * Math.sin(t * 2 + o.ph[i]);
          r = 0.75 * kel;
          gg = 0.92 * kel;
          b = 1.0 * kel;
        }
      } else if (st === 0.5) {
        const lag2 = cl((tt - o.rel[i]) / 0.5);
        r = 0.2 * gain[L] * lag2 + (L === 0 ? 0.6 * (1 - lag2) : 0);
        gg = 0.85 * gain[L] * lag2 + (L === 0 ? 0.75 * (1 - lag2) : 0);
        b = 1.0 * gain[L];
      } else if (L > 0) {
        r = gg = b = 0;
      } else {
        const k = cl((t - o.arr[i]) / 0.45);
        const kil = 1 + 1.6 * Math.exp(-(t - o.arr[i]) * 7);
        r = THREE.MathUtils.lerp(0.25, o.col[j], k) * kil;
        gg = THREE.MathUtils.lerp(0.9, o.col[j + 1], k) * kil;
        b = THREE.MathUtils.lerp(1.0, o.col[j + 2], k) * kil;
      }
      C[j] = r;
      C[j + 1] = gg;
      C[j + 2] = b;
    }
    g.attributes.position.needsUpdate = true;
    g.attributes.color.needsUpdate = true;
  });
  return (
    <>
      {lapis.map((g, L) => (
        <points key={L} geometry={g} frustumCulled={false}>
          <pointsMaterial size={L === 0 ? 0.045 : 0.034} map={spriteTex()} vertexColors transparent opacity={op} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} sizeAttenuation />
        </points>
      ))}
    </>
  );
};

// ---------------------------------------------------------------- zarah nama sekolah
type Teks = {n: number; src: Float32Array; tg: Float32Array; rel: Float32Array; arr: Float32Array; ph: Float32Array};
const sediaTeks = (d: Data): Teks => {
  const tx = d.teks;
  const n = tx.x.length;
  const nb = d.badge.x.length;
  const sk = TW / tx.lebar;
  const o = {n, src: new Float32Array(n * 3), tg: new Float32Array(n * 3), rel: new Float32Array(n), arr: new Float32Array(n), ph: new Float32Array(n)};
  for (let i = 0; i < n; i++) {
    const b = Math.floor(random(`tb${i}`) * nb);
    o.src.set([d.badge.x[b] * BH, d.badge.y[b] * BH + BY, 0], i * 3);
    o.tg.set([tx.x[i] * sk, tx.y[i] * sk + TY, 0], i * 3);
    const xn = (tx.x[i] + tx.lebar / 2) / tx.lebar;
    o.rel[i] = 5.55 + 0.85 * xn + 0.15 * random(`tr${i}`);
    o.arr[i] = o.rel[i] + 0.85 + 0.3 * random(`ta${i}`);
    o.ph[i] = random(`tp${i}`) * 6.28;
  }
  return o;
};

const TeksZarah: React.FC<{o: Teks; t: number}> = ({o, t}) => {
  const lapis = useMemo(
    () =>
      [0, 1].map(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(o.n * 3), 3));
        g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(o.n * 3), 3));
        return g;
      }),
    [o],
  );
  const lag = [0, 0.06];
  lapis.forEach((g, L) => {
    const P = g.attributes.position.array as Float32Array;
    const C = g.attributes.color.array as Float32Array;
    const tt = t - lag[L];
    for (let i = 0; i < o.n; i++) {
      const j = i * 3;
      let r = 0, gg = 0, b = 0;
      if (tt <= o.rel[i]) {
        P[j] = o.src[j];
        P[j + 1] = o.src[j + 1];
        P[j + 2] = o.src[j + 2];
      } else if (tt >= o.arr[i]) {
        P[j] = o.tg[j];
        P[j + 1] = o.tg[j + 1];
        P[j + 2] = o.tg[j + 2];
        if (L === 0) {
          const kil = 1 + 1.4 * Math.exp(-(t - o.arr[i]) * 7);
          const sh = 0.88 + 0.12 * Math.sin(t * 5 + o.ph[i]);
          r = 1.05 * kil * sh;
          gg = 1.2 * kil * sh;
          b = 1.3 * kil * sh;
        }
      } else {
        const s0 = (tt - o.rel[i]) / (o.arr[i] - o.rel[i]);
        const s = ss(s0);
        const wob = Math.sin(Math.PI * s0) * 0.25;
        P[j] = bz(o.src[j], o.src[j], o.tg[j], o.tg[j], s) + Math.sin(t * 3 + o.ph[i]) * wob;
        P[j + 1] = bz(o.src[j + 1], o.src[j + 1] - 0.8, o.tg[j + 1] + 0.9, o.tg[j + 1], s);
        P[j + 2] = bz(0, 2.2, 1.4, 0, s) + Math.cos(t * 2.5 + o.ph[i]) * wob;
        const g2 = L === 0 ? 1 : 0.4;
        r = 0.25 * g2;
        gg = 0.9 * g2;
        b = 1.0 * g2;
      }
      C[j] = r;
      C[j + 1] = gg;
      C[j + 2] = b;
    }
    g.attributes.position.needsUpdate = true;
    g.attributes.color.needsUpdate = true;
  });
  return (
    <>
      {lapis.map((g, L) => (
        <points key={L} geometry={g} frustumCulled={false}>
          <pointsMaterial size={L === 0 ? 0.042 : 0.03} map={spriteTex()} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} sizeAttenuation />
        </points>
      ))}
    </>
  );
};

// ---------------------------------------------------------------- dandelion hologram
const Dandelion: React.FC<{t: number}> = ({t}) => {
  const geo = useMemo(() => {
    const n = 700;
    const p = new Float32Array(n * 6);
    for (let i = 0; i < n; i++) {
      const u = random(`fu${i}`) * 2 - 1;
      const v = random(`fv${i}`) * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const d = [s * Math.cos(v), u, s * Math.sin(v)];
      p.set([d[0] * 0.14, d[1] * 0.14, d[2] * 0.14, d[0] * DR * 0.95, d[1] * DR * 0.95, d[2] * DR * 0.95], i * 6);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  }, []);
  const tangkai = useMemo(() => {
    const pts = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.12, 0), new THREE.Vector3(0.12, -1.6, 0), new THREE.Vector3(0.05, -3.4, 0), new THREE.Vector3(0.35, -6, 0)]).getPoints(60);
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);
  const masuk = interpolate(t, [0.2, 1.3], [0, 1], clamp);
  const benang = masuk * interpolate(t, [1.5, 2.6], [1, 0], clamp);
  const batang = masuk * interpolate(t, [2.2, 3.4], [1, 0], clamp);
  if (batang <= 0) return null;
  return (
    <group position={D.toArray()} rotation={[0, t * 0.25, 0]}>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color={CYAN} transparent opacity={0.22 * benang} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </lineSegments>
      <mesh>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshBasicMaterial color="#9ff4ff" transparent opacity={0.8 * batang} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <line>
        <primitive object={tangkai} attach="geometry" />
        <lineBasicMaterial color={CYAN} transparent opacity={0.7 * batang} toneMapped={false} />
      </line>
    </group>
  );
};

// ---------------------------------------------------------------- badge sebenar + HUD
const BadgeSebenar: React.FC<{t: number; aspek: number; tex: THREE.Texture}> = ({t, aspek, tex}) => {
  const dailA = useMemo(() => dailTex('dA', 1), []);
  const dailB = useMemo(() => dailTex('dB', 0.7), []);
  const atas = BY + BH / 2 + 0.15;
  const bawah = BY - BH / 2 - 0.15;
  const sy = interpolate(t, [4.95, 5.75], [atas, bawah], {...clamp, easing: Easing.inOut(Easing.cubic)});
  // dedah dari atas ke bawah: potong satah & UV (tanpa clipping plane)
  const f = cl((atas - sy) / BH);
  tex.repeat.set(1, f);
  tex.offset.set(0, 1 - f);
  const garis = interpolate(t, [4.9, 5.0, 5.7, 5.85], [0, 1, 1, 0], clamp);
  const hud = interpolate(t, [4.7, 5.5], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const hudOp = hud * interpolate(t, [7.5, 9], [0.6, 0.4], clamp);
  const cahaya = interpolate(t, [5.0, 5.8], [0, 1], clamp);
  return (
    <>
      <mesh position={[0, BY, -0.9]} rotation={[0, 0, t * 0.12]} scale={THREE.MathUtils.lerp(1.6, 1, hud)}>
        <planeGeometry args={[7.4, 7.4]} />
        <meshBasicMaterial map={dailA} transparent opacity={hudOp} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, BY, -0.6]} rotation={[0, 0, -t * 0.2]} scale={THREE.MathUtils.lerp(0.5, 1, hud)}>
        <planeGeometry args={[6.0, 6.0]} />
        <meshBasicMaterial map={dailB} transparent opacity={hudOp * 0.8} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[0, BY, -0.3]}>
        <circleGeometry args={[2.9, 64]} />
        <meshBasicMaterial color="#0d6b3a" transparent opacity={0.14 * cahaya} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {f > 0.001 && (
        <mesh position={[0, BY + BH / 2 - (BH * f) / 2, 0.01]} scale={[1, f, 1]}>
          <planeGeometry args={[BH * aspek, BH]} />
          <meshBasicMaterial map={tex} transparent toneMapped={false} />
        </mesh>
      )}
      <mesh position={[0, sy, 0.05]}>
        <planeGeometry args={[BH * aspek + 1.2, 0.035]} />
        <meshBasicMaterial color="#e8feff" transparent opacity={garis} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      <mesh position={[0, sy + 0.22, 0.04]}>
        <planeGeometry args={[BH * aspek + 1.2, 0.45]} />
        <meshBasicMaterial color={CYAN} transparent opacity={garis * 0.22} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  );
};

// Dail condong di lantai (gaya HUD perspektif)
const Lantai: React.FC<{t: number}> = ({t}) => {
  const tex = useMemo(() => dailTex('lt', 1.4), []);
  const op = interpolate(t, [0.4, 2.0, 4.5, 6.0], [0, 0.35, 0.35, 0.12], clamp);
  return (
    <mesh position={[0, -2.9, -1.5]} rotation={[-Math.PI / 2 + 0.18, 0, t * 0.05]}>
      <planeGeometry args={[16, 16]} />
      <meshBasicMaterial map={tex} transparent opacity={op} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  );
};

const Adegan: React.FC<{d: Data; t: number; tex: THREE.Texture}> = ({d, t, tex}) => {
  const badge = useMemo(() => sediaBadge(d), [d]);
  const teks = useMemo(() => sediaTeks(d), [d]);
  const opZ = interpolate(t, [5.3, 6.6], [1, 0.07], clamp);
  const putar = interpolate(t, [5.8, 9], [0, 0.12], {...clamp, easing: Easing.inOut(Easing.sin)});
  return (
    <>
      <Kamera t={t} />
      <Bintang n={1300} spread={120} seed="ib" size={0.09} />
      <Lantai t={t} />
      <Dandelion t={t} />
      <group rotation={[0, putar, 0]} position={[0, 0, 0]}>
        <BadgeSebenar t={t} aspek={d.badge.aspek} tex={tex} />
        <BadgeZarah o={badge} t={t} op={opZ} />
      </group>
      {t > 5.4 && <TeksZarah o={teks} t={t} />}
    </>
  );
};

const nyahkod = (teks: string, p: number, seed: string, frame: number) => {
  const ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/%';
  const n = Math.floor(p * teks.length);
  return teks
    .split('')
    .map((c, i) => (i < n || c === ' ' ? c : p <= 0 ? ' ' : ch[Math.floor(random(`${seed}${i}${frame}`) * ch.length)]))
    .join('');
};

export const IntroBadge: React.FC<{fd: number}> = ({fd}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const d = useJson('montaj/badge_titik.json');
  const tex = useTekstur('montaj/badge_rasmi.png');
  const boot = interpolate(t, [0.1, 0.35, 1.45, 1.75], [0, 1, 1, 0], clamp);
  const muat = interpolate(t, [0.2, 1.4], [0, 100], clamp);
  const sah = interpolate(t, [5.1, 5.35, 6.5, 6.9], [0, 1, 1, 0], clamp);
  const sub = interpolate(t, [6.7, 7.6], [0, 1], clamp);
  const garisSub = interpolate(t, [6.6, 7.4], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const akhir = interpolate(frame, [fd - 6, fd], [1, 0], clamp);
  const angin = interpolate(t, [1.35, 1.6, 2.1], [0, 0.7, 0], clamp);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #071a2e 0%, #02050c 70%)', opacity: akhir}}>
      {d && (
        <ThreeCanvas width={W} height={H} camera={{fov: 40, position: [0, 0, 14], near: 0.1, far: 300}} gl={{antialias: true}}>
          <Adegan d={d} t={t} tex={tex} />
        </ThreeCanvas>
      )}
      {/* tiupan angin */}
      <AbsoluteFill style={{opacity: angin, background: 'linear-gradient(100deg, rgba(160,240,255,0) 20%, rgba(160,240,255,.16) 45%, rgba(160,240,255,0) 70%)', transform: `translateX(${interpolate(t, [1.35, 2.1], [-500, 700], clamp)}px)`}} />
      {/* skrin boot */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 120, textAlign: 'center', opacity: boot, fontFamily: MONO, color: CYAN, letterSpacing: 6, fontSize: 20, textShadow: `0 0 10px ${CYAN}`}}>
        SKeSO://INIT · MEMUATKAN IDENTITI SEKOLAH
        <div style={{margin: '16px auto 0', width: 420, height: 4, background: 'rgba(56,232,255,.18)'}}>
          <div style={{width: `${muat}%`, height: '100%', background: CYAN, boxShadow: `0 0 12px ${CYAN}`}} />
        </div>
        <div style={{marginTop: 10, fontSize: 16, opacity: 0.8}}>{String(Math.round(muat)).padStart(3, '0')}%</div>
      </div>
      {/* pengesahan identiti */}
      <div style={{position: 'absolute', left: 1330, top: 290, opacity: sah, fontFamily: MONO, color: CYAN, fontSize: 18, letterSpacing: 4, textShadow: `0 0 8px ${CYAN}`}}>
        <div style={{width: 160 * sah, height: 2, background: CYAN, marginBottom: 10}} />
        IDENTITI DISAHKAN ✓
        <div style={{fontSize: 14, opacity: 0.75, marginTop: 6}}>{nyahkod('BADGE RASMI SKeSO', interpolate(t, [5.2, 5.9], [0, 1], clamp), 'b', frame)}</div>
      </div>
      {/* nama tempat */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 905, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, opacity: sub}}>
        <div style={{width: 240 * garisSub, height: 2, background: `linear-gradient(90deg, transparent, ${CYAN})`}} />
        <div style={{fontFamily: ORB, fontWeight: 600, fontSize: 30, letterSpacing: 14, color: '#dff9ff', textShadow: `0 0 14px ${CYAN}`}}>{nyahkod('DUNGUN · TERENGGANU', interpolate(t, [6.8, 7.7], [0, 1], clamp), 's', frame)}</div>
        <div style={{width: 240 * garisSub, height: 2, background: `linear-gradient(270deg, transparent, ${CYAN})`}} />
      </div>
    </AbsoluteFill>
  );
};
