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

// ---------------------------------------------------------------- koreografi kamera
// Gaya "fly-through" HUD: dekat-serong (Dutch angle) -> ikut benih (whip) ->
// sudut rendah (low angle) -> kren naik serong -> gelongsor sisi (truck) ->
// tarik ke belakang (pull-back reveal) -> tolak perlahan (push-in).
type KF = {t: number; p: [number, number, number]; g: [number, number, number]; r: number};
const KFS: KF[] = [
  {t: 0.0, p: [-1.5, -0.9, 6.2], g: [-3.3, -0.1, 0.5], r: 0.28},
  {t: 1.4, p: [-2.6, -0.5, 5.4], g: [-3.0, -0.1, 0.5], r: 0.22},
  {t: 2.5, p: [-0.8, -1.3, 8.0], g: [0.2, 0.8, 0.5], r: 0.06},
  {t: 3.9, p: [3.0, -4.2, 9.5], g: [0, 1.0, 0], r: -0.16},
  {t: 5.7, p: [4.6, 3.0, 8.8], g: [0, 0.9, 0], r: -0.07},
  {t: 7.3, p: [-4.6, 0.3, 8.0], g: [0.1, 0.8, 0], r: 0.1},
  {t: 8.7, p: [-1.0, -0.6, 11.5], g: [0, -0.3, 0], r: 0.03},
  {t: 9.5, p: [0, 0.3, 13.3], g: [0, 0.3, 0], r: 0},
  {t: 11.0, p: [0, 0.3, 12.6], g: [0, 0.3, 0], r: 0},
];
const lengkungP = new THREE.CatmullRomCurve3(KFS.map((k) => new THREE.Vector3(...k.p)), false, 'centripetal');
const lengkungG = new THREE.CatmullRomCurve3(KFS.map((k) => new THREE.Vector3(...k.g)), false, 'centripetal');
export const posKamera = (t: number) => {
  const n = KFS.length;
  let i = 0;
  while (i < n - 2 && t > KFS[i + 1].t) i++;
  let u = cl((t - KFS[i].t) / (KFS[i + 1].t - KFS[i].t));
  if (i === 0) u = u * u * 0.5 + u * 0.5; // mula lembut
  if (i === n - 2) u = 1 - (1 - u) * (1 - u); // berhenti lembut
  const s = (i + u) / (n - 1);
  const r = THREE.MathUtils.lerp(KFS[i].r, KFS[i + 1].r, ss(u));
  // goyang tangan halus
  const p = lengkungP.getPoint(s).add(new THREE.Vector3(Math.sin(t * 0.9) * 0.05, Math.sin(t * 1.3) * 0.04, 0));
  return {p, g: lengkungG.getPoint(s), r};
};
const pasang = (cam: THREE.Camera, t: number) => {
  const k = posKamera(t);
  cam.position.copy(k.p);
  cam.lookAt(k.g);
  cam.rotateZ(k.r);
};
const Kamera: React.FC<{t: number}> = ({t}) => {
  const {camera} = useThree();
  pasang(camera, t);
  return null;
};
// Unjuran titik dunia ke skrin (untuk label DOM yang melekat pada objek 3D)
const kamBayang = new THREE.PerspectiveCamera(40, W / H, 0.1, 300);
const keSkrin = (t: number, x: number, y: number, z: number) => {
  pasang(kamBayang, t);
  kamBayang.updateMatrixWorld();
  const v = new THREE.Vector3(x, y, z).project(kamBayang);
  return {x: ((v.x + 1) / 2) * W, y: ((1 - v.y) / 2) * H};
};

// Panel HUD (gaya papan pemuka) di kiri & kanan badge
const panelTex = (jenis: 'kiri' | 'kanan') => {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 640;
  const g = c.getContext('2d')!;
  g.strokeStyle = CYAN;
  g.fillStyle = CYAN;
  g.shadowColor = CYAN;
  g.shadowBlur = 10;
  g.lineWidth = 4;
  // bucu
  const L = 70;
  for (const [x, y, dx, dy] of [[8, 8, 1, 1], [1016, 8, -1, 1], [8, 632, 1, -1], [1016, 632, -1, -1]]) {
    g.beginPath();
    g.moveTo(x + dx * L, y);
    g.lineTo(x, y);
    g.lineTo(x, y + dy * L);
    g.stroke();
  }
  g.globalAlpha = 0.35;
  g.lineWidth = 2;
  g.strokeRect(30, 30, 964, 580);
  g.globalAlpha = 1;
  g.font = 'bold 40px monospace';
  g.fillText(jenis === 'kiri' ? 'SKeSO // SISTEM' : 'IDENTITI // SEKOLAH', 60, 95);
  g.fillRect(60, 115, 300, 4);
  g.font = '26px monospace';
  if (jenis === 'kiri') {
    const lab = ['DIGITAL', 'DELIMa', 'GURU', 'MURID', 'INOVASI'];
    lab.forEach((l, i) => {
      const h = 120 + random(`pb${i}`) * 260;
      g.globalAlpha = 0.9;
      g.fillRect(90 + i * 170, 560 - h, 70, h);
      g.globalAlpha = 0.7;
      g.fillText(l, 80 + i * 170, 600);
    });
  } else {
    const baris = ['DAERAH : DUNGUN', 'NEGERI : TERENGGANU', 'MOTO   : RAJIN USAHA', '         TANGGA KEJAYAAN', 'STATUS : SHOWCASE SCHOOL'];
    g.globalAlpha = 0.85;
    baris.forEach((b, i) => g.fillText(b, 60, 190 + i * 62));
    g.globalAlpha = 0.6;
    g.lineWidth = 3;
    for (const r of [40, 75, 110]) {
      g.beginPath();
      g.arc(860, 440, r, 0, Math.PI * 2);
      g.stroke();
    }
    g.beginPath();
    g.moveTo(860, 440);
    g.lineTo(960, 380);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
const PanelHud: React.FC<{t: number}> = ({t}) => {
  const kiri = useMemo(() => panelTex('kiri'), []);
  const kanan = useMemo(() => panelTex('kanan'), []);
  const a = interpolate(t, [6.9, 7.7], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const b = interpolate(t, [7.2, 8.0], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const op = (x: number) => x * 0.8 * (0.9 + 0.1 * Math.sin(t * 9));
  return (
    <>
      <mesh position={[-5.9, 1.1, -0.6]} rotation={[0, 0.38, 0]} scale={[Math.max(a, 0.001), 1, 1]}>
        <planeGeometry args={[3.3, 2.06]} />
        <meshBasicMaterial map={kiri} transparent opacity={op(a)} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[5.9, 1.1, -0.6]} rotation={[0, -0.38, 0]} scale={[Math.max(b, 0.001), 1, 1]}>
        <planeGeometry args={[3.3, 2.06]} />
        <meshBasicMaterial map={kanan} transparent opacity={op(b)} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </>
  );
};

// ---------------------------------------------------------------- zarah badge
type Badge = {
  n: number;
  p0: Float32Array; // benih di dandelion
  c1: Float32Array; // titik kawalan tiupan angin
  q0: Float32Array; // kedudukan dalam awan dron (sebelum diputar)
  tg: Float32Array; // sasaran di badge
  rel: Float32Array; // terlepas dari dandelion
  endA: Float32Array; // tiba di awan
  dep: Float32Array; // bertolak dari awan ke badge
  arr: Float32Array; // mengunci di badge (ikut garis imbasan)
  ph: Float32Array;
  tepi: Uint8Array;
};

// Imbasan binaan: bawah -> atas
export const IMBAS0 = 4.4;
export const IMBAS_DUR = 3.0;
const TERBANG = 1.1; // masa dari awan ke sasaran (perlahan, mendarat lembut)

const sediaBadge = (d: Data): Badge => {
  const b = d.badge;
  const n = b.x.length;
  const o: Badge = {
    n,
    p0: new Float32Array(n * 3),
    c1: new Float32Array(n * 3),
    q0: new Float32Array(n * 3),
    tg: new Float32Array(n * 3),
    rel: new Float32Array(n),
    endA: new Float32Array(n),
    dep: new Float32Array(n),
    arr: new Float32Array(n),
    ph: new Float32Array(n),
    tepi: new Uint8Array(n),
  };
  for (let i = 0; i < n; i++) {
    const u = random(`u${i}`) * 2 - 1;
    const v = random(`v${i}`) * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    const dx = s * Math.cos(v);
    const rr = DR * (0.93 + random(`r${i}`) * 0.1);
    const P = [D.x + dx * rr, D.y + u * rr, D.z + s * Math.sin(v) * rr];
    o.p0.set(P, i * 3);
    o.c1.set([P[0] + 1.6 + 1.6 * random(`w${i}`), P[1] + 0.8 + 1.4 * random(`wy${i}`), P[2] + 1.2 * (random(`wz${i}`) - 0.3)], i * 3);
    o.q0.set([(random(`qx${i}`) - 0.5) * 5.4, (random(`qy${i}`) - 0.5) * 4.6 + BY, (random(`qz${i}`) - 0.5) * 2.6], i * 3);
    o.tg.set([b.x[i] * BH, b.y[i] * BH + BY, 0], i * 3);
    o.tepi[i] = b.tepi[i];
    o.rel[i] = 1.5 + 0.65 * (1 - (dx + 1) / 2) + 0.3 * random(`rl${i}`);
    const yb = b.y[i] + 0.5;
    o.arr[i] = IMBAS0 + IMBAS_DUR * yb + (b.tepi[i] ? 0 : 0.45) + 0.12 * random(`ar${i}`);
    o.dep[i] = o.arr[i] - TERBANG;
    o.endA[i] = Math.min(o.rel[i] + 1.5, o.dep[i]);
    o.ph[i] = random(`ph${i}`) * 6.28;
  }
  return o;
};

// kedudukan dalam awan dron yang berputar perlahan
const awan = (o: Badge, k: number, t: number, ph: number) => {
  const a = 0.3 * t;
  const x = o.q0[k];
  const z = o.q0[k + 2];
  return [x * Math.cos(a) - z * Math.sin(a), o.q0[k + 1] + 0.08 * Math.sin(t * 1.2 + ph), x * Math.sin(a) + z * Math.cos(a)];
};

// 0 = dandelion, 1 = tiupan/awan, 2 = terbang ke badge, 3 = terkunci
const posBadge = (o: Badge, i: number, t: number, out: Float32Array, j: number) => {
  const k = i * 3;
  const ph = o.ph[i];
  if (t >= o.arr[i]) {
    out[j] = o.tg[k];
    out[j + 1] = o.tg[k + 1];
    out[j + 2] = o.tg[k + 2];
    return 3;
  }
  const rotD = (tt: number) => {
    const a = tt * 0.25;
    const x = o.p0[k] - D.x;
    const z = o.p0[k + 2] - D.z;
    return [D.x + x * Math.cos(a) - z * Math.sin(a), o.p0[k + 1], D.z + x * Math.sin(a) + z * Math.cos(a)];
  };
  if (t <= o.rel[i]) {
    const q = rotD(t);
    out[j] = q[0];
    out[j + 1] = q[1];
    out[j + 2] = q[2];
    return 0;
  }
  if (t < o.dep[i]) {
    const Q = awan(o, k, t, ph);
    if (t < o.endA[i]) {
      const s0 = (t - o.rel[i]) / (o.endA[i] - o.rel[i]);
      const s = ss(s0);
      const P = rotD(o.rel[i]);
      const w = Math.sin(Math.PI * s0) * 0.18;
      out[j] = bz(P[0], o.c1[k], Q[0] - 0.8, Q[0], s) + Math.sin(t * 2.1 + ph) * w;
      out[j + 1] = bz(P[1], o.c1[k + 1], Q[1] + 0.5, Q[1], s) + Math.cos(t * 1.7 + ph) * w;
      out[j + 2] = bz(P[2], o.c1[k + 2], Q[2] + 0.6, Q[2], s);
    } else {
      out[j] = Q[0];
      out[j + 1] = Q[1];
      out[j + 2] = Q[2];
    }
    return 1;
  }
  const Q = awan(o, k, o.dep[i], ph);
  const s = (t - o.dep[i]) / TERBANG;
  const e = 1 - Math.pow(1 - s, 3);
  out[j] = bz(Q[0], Q[0], o.tg[k], o.tg[k], e);
  out[j + 1] = bz(Q[1], Q[1], o.tg[k + 1], o.tg[k + 1], e);
  out[j + 2] = bz(Q[2], Q[2] + 0.8, 1.2, o.tg[k + 2], e);
  return 2;
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
  // 0 = zarah utama, 1-2 = jejak halus semasa terbang ke badge
  const lag = [0, 0.04, 0.09];
  const gain = [1, 0.4, 0.16];
  lapis.forEach((g, L) => {
    const P = g.attributes.position.array as Float32Array;
    const C = g.attributes.color.array as Float32Array;
    const tt = t - lag[L];
    for (let i = 0; i < o.n; i++) {
      const j = i * 3;
      const st = posBadge(o, i, tt, P, j);
      let r = 0, gg = 0, b = 0;
      if (st === 0 && L === 0) {
        const kel = 0.55 + 0.25 * Math.sin(t * 2 + o.ph[i]);
        r = 0.75 * kel;
        gg = 0.92 * kel;
        b = kel;
      } else if (st === 1 && L === 0) {
        const m = cl((t - o.rel[i]) / 0.8);
        const kel = 0.75 + 0.25 * Math.sin(t * 3 + o.ph[i] * 2);
        r = THREE.MathUtils.lerp(0.6, 0.18, m) * kel;
        gg = THREE.MathUtils.lerp(0.75, 0.66, m) * kel;
        b = THREE.MathUtils.lerp(0.85, 0.85, m) * kel;
      } else if (st === 2) {
        const s = cl((tt - o.dep[i]) / TERBANG);
        r = (0.1 + 0.25 * s) * gain[L];
        gg = (0.45 + 0.5 * s) * gain[L];
        b = (0.6 + 0.4 * s) * gain[L];
      } else if (st === 3 && L === 0) {
        const kil = 1 + 2.2 * Math.exp(-(t - o.arr[i]) * 8);
        if (o.tepi[i]) {
          r = 0.32 * kil;
          gg = 0.92 * kil;
          b = 1.0 * kil;
        } else {
          r = 0.06 * kil;
          gg = 0.26 * kil;
          b = 0.34 * kil;
        }
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
          <pointsMaterial size={L === 0 ? 0.03 : 0.024} map={spriteTex()} vertexColors transparent opacity={op} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} sizeAttenuation />
        </points>
      ))}
    </>
  );
};

// Garis imbasan binaan (bawah -> atas) + grid pelan di belakang badge
const gridTex = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const g = c.getContext('2d')!;
  g.strokeStyle = CYAN;
  for (let i = 0; i <= 32; i++) {
    g.globalAlpha = i % 4 === 0 ? 0.5 : 0.18;
    g.lineWidth = i % 4 === 0 ? 2 : 1;
    const p = i * 32;
    g.beginPath();
    g.moveTo(p, 0);
    g.lineTo(p, 1024);
    g.moveTo(0, p);
    g.lineTo(1024, p);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
const ImbasBina: React.FC<{t: number; aspek: number}> = ({t, aspek}) => {
  const grid = useMemo(() => gridTex(), []);
  const lebar = BH * aspek + 1.6;
  const p = (t - IMBAS0) / IMBAS_DUR;
  const y = BY - BH / 2 + BH * cl(p);
  const nampak = interpolate(t, [IMBAS0 - 0.3, IMBAS0, IMBAS0 + IMBAS_DUR, IMBAS0 + IMBAS_DUR + 0.4], [0, 1, 1, 0], clamp);
  const gOp = interpolate(t, [3.8, 4.6, 7.8, 9.0], [0, 0.16, 0.16, 0], clamp);
  return (
    <>
      <mesh position={[0, BY, -1.2]}>
        <planeGeometry args={[7.5, 7.5]} />
        <meshBasicMaterial map={grid} transparent opacity={gOp} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {nampak > 0 && (
        <>
          <mesh position={[0, y, 0.03]}>
            <planeGeometry args={[lebar, 0.022]} />
            <meshBasicMaterial color="#e8feff" transparent opacity={nampak} blending={THREE.AdditiveBlending} toneMapped={false} />
          </mesh>
          <mesh position={[0, y - 0.35, 0.02]}>
            <planeGeometry args={[lebar, 0.7]} />
            <meshBasicMaterial color={CYAN} transparent opacity={nampak * 0.1} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
          {/* tanda hujung garis imbasan */}
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[(sx * lebar) / 2, y, 0.03]}>
              <planeGeometry args={[0.06, 0.32]} />
              <meshBasicMaterial color={CYAN} transparent opacity={nampak} blending={THREE.AdditiveBlending} toneMapped={false} />
            </mesh>
          ))}
        </>
      )}
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
    o.rel[i] = 8.0 + 0.85 * xn + 0.15 * random(`tr${i}`);
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
  const sy = interpolate(t, [7.2, 8.4], [atas, bawah], {...clamp, easing: Easing.inOut(Easing.cubic)});
  // dedah dari atas ke bawah: potong satah & UV (tanpa clipping plane)
  const f = cl((atas - sy) / BH);
  tex.repeat.set(1, f);
  tex.offset.set(0, 1 - f);
  const garis = interpolate(t, [7.1, 7.2, 8.4, 8.55], [0, 1, 1, 0], clamp);
  const hud = interpolate(t, [6.8, 7.6], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const hudOp = hud * interpolate(t, [9.8, 11], [0.6, 0.4], clamp);
  const cahaya = interpolate(t, [7.2, 8.0], [0, 1], clamp);
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
  const op = interpolate(t, [0.4, 2.0, 6.0, 8.0], [0, 0.35, 0.35, 0.12], clamp);
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
  const opZ = interpolate(t, [7.6, 8.8], [1, 0.06], clamp);
  return (
    <>
      <Kamera t={t} />
      <Bintang n={1300} spread={120} seed="ib" size={0.09} />
      <Lantai t={t} />
      <Dandelion t={t} />
      <PanelHud t={t} />
      <group>
        <BadgeSebenar t={t} aspek={d.badge.aspek} tex={tex} />
        <ImbasBina t={t} aspek={d.badge.aspek} />
        <BadgeZarah o={badge} t={t} op={opZ} />
      </group>
      {t > 7.9 && <TeksZarah o={teks} t={t} />}
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
  const sah = interpolate(t, [7.6, 7.85, 9.0, 9.4], [0, 1, 1, 0], clamp);
  const sub = interpolate(t, [9.7, 10.5], [0, 1], clamp);
  const garisSub = interpolate(t, [9.7, 10.4], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const lb = keSkrin(t, 1.95, BY + 1.75, 0);
  const sb = keSkrin(t, 0, TY - 0.62, 0);
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
      <div style={{position: 'absolute', left: lb.x + 20, top: lb.y - 20, opacity: sah, fontFamily: MONO, color: CYAN, fontSize: 18, letterSpacing: 4, textShadow: `0 0 8px ${CYAN}`}}>
        <div style={{width: 160 * sah, height: 2, background: CYAN, marginBottom: 10}} />
        IDENTITI DISAHKAN ✓
        <div style={{fontSize: 14, opacity: 0.75, marginTop: 6}}>{nyahkod('BADGE RASMI SKeSO', interpolate(t, [7.7, 8.4], [0, 1], clamp), 'b', frame)}</div>
      </div>
      {/* nama tempat */}
      <div style={{position: 'absolute', left: 0, right: 0, top: sb.y - 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, opacity: sub}}>
        <div style={{width: 240 * garisSub, height: 2, background: `linear-gradient(90deg, transparent, ${CYAN})`}} />
        <div style={{fontFamily: ORB, fontWeight: 600, fontSize: 30, letterSpacing: 14, color: '#dff9ff', textShadow: `0 0 14px ${CYAN}`}}>{nyahkod('DUNGUN · TERENGGANU', interpolate(t, [9.8, 10.7], [0, 1], clamp), 's', frame)}</div>
        <div style={{width: 240 * garisSub, height: 2, background: `linear-gradient(270deg, transparent, ${CYAN})`}} />
      </div>
    </AbsoluteFill>
  );
};
