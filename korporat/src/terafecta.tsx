// Babak Terafecta Digital Luminaries Awards: galeri anugerah 3D.
// Kamera terbang antara 4 bingkai emas 3D di atas lantai pentas berkilat
// (pantulan), dengan lampu sorot, habuk emas, kesan cahaya (bloom) dan skrin
// LED di belakang pentas yang memainkan sedikit video promosi rasmi (tanpa audio).
// Setiap ketibaan kamera jatuh tepat pada rentak lagu A (123 BPM).
import {MeshReflectorMaterial} from '@react-three/drei';
import {useThree} from '@react-three/fiber';
import {Bloom, EffectComposer, Vignette} from '@react-three/postprocessing';
import {ThreeCanvas} from '@remotion/three';
import React, {useEffect, useMemo} from 'react';
import {AbsoluteFill, Easing, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {C, MONO, ORB, SANS} from './fx';
import {useTekstur} from './tiga';

const FPS = 30;
const RENTAK = 60 / 123.046875;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

type Anugerah = {img: string; kat: string; tajuk: string; hasil: string; khas?: boolean; pos: [number, number, number]; ry: number; sk: number};
const ANUGERAH: Anugerah[] = [
  {img: 'montaj/terafecta_1.jpg', kat: 'PERTANDINGAN PEMERKASAAN BACAAN MURID', tajuk: 'PEMBACA BESTARI', hasil: 'TEMPAT KELIMA · BAHASA INGGERIS (SEKOLAH RENDAH)', pos: [-4.5, 1.9, -2], ry: 0.55, sk: 1},
  {img: 'montaj/terafecta_2.jpg', kat: 'ANUGERAH PENDIDIKAN DIGITAL', tajuk: 'PEMBANGUNAN APLIKASI ANDROID', hasil: 'NAIB JOHAN · SEKOLAH RENDAH', pos: [4.5, 1.9, -8], ry: -0.55, sk: 1},
  {img: 'montaj/terafecta_3.jpg', kat: 'ANUGERAH SEKOLAH', tajuk: 'EKOSISTEM DIGITAL TERBAIK', hasil: 'SEKOLAH RENDAH', pos: [-4.5, 1.9, -14], ry: 0.55, sk: 1},
  {img: 'montaj/terafecta_4.jpg', kat: 'ANUGERAH SEKOLAH', tajuk: 'PEMBUDAYAAN PENDIDIKAN DIGITAL TERBAIK', hasil: 'ANUGERAH KHAS', khas: true, pos: [0, 2.2, -20], ry: 0, sk: 1.3},
];
const TIBA = [3, 8, 13, 18]; // rentak ketibaan kamera pada setiap bingkai
const AKHIR = 23; // rentak mula syot penutup

// ---------------------------------------------------------------- koreografi kamera
type V3 = [number, number, number];
const add = (a: V3, b: V3, k = 1): V3 => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const kamBingkai = (a: Anugerah, sisi: number): V3 => {
  const D = 4.9 * a.sk;
  const ang = a.ry + sisi;
  return add(a.pos, [Math.sin(ang) * D, 0.15, Math.cos(ang) * D]);
};
const sasaran = (a: Anugerah): V3 => add(a.pos, [0, -0.35 * a.sk, 0]);
type KF = {b: number; p: V3; g: V3; lompat?: boolean};
const KFS: KF[] = (() => {
  const k: KF[] = [
    {b: 0, p: [0, 5.5, 11], g: [0, 4.5, -30]},
    {b: 2.3, p: [-0.6, 3.6, 6.5], g: [-2.5, 2.2, -4]},
  ];
  ANUGERAH.forEach((a, i) => {
    const s = i % 2 === 0 ? 1 : -1;
    k.push({b: TIBA[i], p: kamBingkai(a, -0.12 * s), g: sasaran(a), lompat: true});
    k.push({b: TIBA[i] + 4.3, p: kamBingkai(a, 0.22 * s), g: sasaran(a)});
  });
  k.push({b: AKHIR + 1.6, p: [0, 6.5, 7], g: [0, 1.6, -11], lompat: true});
  k.push({b: 28.5, p: [0, 7.4, 9.5], g: [0, 1.4, -11]});
  return k;
})();
const posKamera = (b: number) => {
  let i = 0;
  while (i < KFS.length - 2 && b > KFS[i + 1].b) i++;
  const A = KFS[i];
  const B = KFS[i + 1];
  const u0 = Math.min(1, Math.max(0, (b - A.b) / (B.b - A.b)));
  // segmen "lompat" = luncuran pantas berlengkung; selainnya hanyutan perlahan
  const u = B.lompat ? Easing.inOut(Easing.cubic)(u0) : Easing.inOut(Easing.sin)(u0);
  const angkat = B.lompat ? Math.sin(Math.PI * u0) * 0.7 : 0;
  const p: V3 = [THREE.MathUtils.lerp(A.p[0], B.p[0], u), THREE.MathUtils.lerp(A.p[1], B.p[1], u) + angkat, THREE.MathUtils.lerp(A.p[2], B.p[2], u)];
  const g: V3 = [THREE.MathUtils.lerp(A.g[0], B.g[0], u), THREE.MathUtils.lerp(A.g[1], B.g[1], u), THREE.MathUtils.lerp(A.g[2], B.g[2], u)];
  return {p, g};
};
const Kamera: React.FC<{b: number}> = ({b}) => {
  const {camera} = useThree();
  const k = posKamera(b);
  camera.position.set(...k.p);
  camera.lookAt(...k.g);
  return null;
};

const Env: React.FC = () => {
  const {gl, scene} = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      env.dispose();
      pm.dispose();
    };
  }, [gl, scene]);
  return null;
};

// tekstur kecerunan (terang -> lutsinar) untuk kon cahaya & sinaran belakang bingkai
const kecerunan = (jejari: boolean) => {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const gr = jejari ? g.createRadialGradient(128, 128, 0, 128, 128, 128) : g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(jejari ? 0.35 : 0.5, 'rgba(255,255,255,.35)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
};

// ---------------------------------------------------------------- bingkai emas 3D
const Bingkai: React.FC<{a: Anugerah; tex: THREE.Texture; t: number; i: number; aktif: number; sinar: THREE.Texture; kon: THREE.Texture}> = ({a, tex, t, i, aktif, sinar, kon}) => {
  const W = 3.0;
  const H = 2.0;
  const tb = 0.14;
  const dz = 0.18;
  const ayun = Math.sin(t * 1.1 + i * 1.7) * 0.05;
  const emas = useMemo(() => new THREE.MeshStandardMaterial({color: '#f0bd55', metalness: 1, roughness: 0.18, envMapIntensity: 2.4}), []);
  const neon = 1.2 + aktif * 3.2;
  const bar = (x: number, y: number, w: number, h: number) => (
    <mesh position={[x, y, 0]} material={emas}>
      <boxGeometry args={[w, h, dz]} />
    </mesh>
  );
  const garis = (x: number, y: number, w: number, h: number) => (
    <mesh position={[x, y, dz / 2 + 0.005]}>
      <boxGeometry args={[w, h, 0.01]} />
      <meshStandardMaterial color="#000" emissive={C.cyan} emissiveIntensity={neon} toneMapped={false} />
    </mesh>
  );
  return (
    <group position={[a.pos[0], a.pos[1] + ayun, a.pos[2]]} rotation={[0, a.ry, 0]} scale={a.sk}>
      {/* sinaran emas di belakang bingkai */}
      <mesh position={[0, 0, -0.3]}>
        <planeGeometry args={[W * 2.2, H * 2.6]} />
        <meshBasicMaterial map={sinar} color="#ffb640" transparent opacity={0.22 + 0.5 * aktif} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* papan belakang */}
      <mesh position={[0, 0, -dz / 2 - 0.02]}>
        <boxGeometry args={[W + 2 * tb + 0.12, H + 2 * tb + 0.12, 0.04]} />
        <meshStandardMaterial color="#06080f" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* foto anugerah */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial map={tex} color="#dedede" toneMapped={false} />
      </mesh>
      {bar(0, H / 2 + tb / 2, W + 2 * tb, tb)}
      {bar(0, -H / 2 - tb / 2, W + 2 * tb, tb)}
      {bar(-W / 2 - tb / 2, 0, tb, H)}
      {bar(W / 2 + tb / 2, 0, tb, H)}
      {garis(0, H / 2 + 0.012, W, 0.022)}
      {garis(0, -H / 2 - 0.012, W, 0.022)}
      {garis(-W / 2 - 0.012, 0, 0.022, H)}
      {garis(W / 2 + 0.012, 0, 0.022, H)}
      {/* kon lampu sorot dari atas */}
      <mesh position={[0, 2.9, 0.55]}>
        <cylinderGeometry args={[0.12, 1.9, 4.4, 48, 1, true]} />
        <meshBasicMaterial map={kon} color="#ffe2a8" transparent opacity={0.1 + 0.2 * aktif} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0.6, 2.4]} intensity={6 + 22 * aktif} distance={7} color="#ffd9a0" />
    </group>
  );
};

const Habuk: React.FC<{t: number}> = ({t}) => {
  const n = 1400;
  const asas = useMemo(() => {
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      p[i * 3] = (random(`hx${i}`) - 0.5) * 26;
      p[i * 3 + 1] = random(`hy${i}`) * 9;
      p[i * 3 + 2] = -random(`hz${i}`) * 36 + 8;
    }
    return p;
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    return g;
  }, []);
  const P = geo.attributes.position.array as Float32Array;
  for (let i = 0; i < n; i++) {
    P[i * 3] = asas[i * 3] + Math.sin(t * 0.4 + i) * 0.3;
    P[i * 3 + 1] = (asas[i * 3 + 1] + t * (0.15 + random(`hv${i}`) * 0.3)) % 9;
    P[i * 3 + 2] = asas[i * 3 + 2];
  }
  geo.attributes.position.needsUpdate = true;
  return (
    <points geometry={geo} frustumCulled={false}>
      <pointsMaterial size={0.05} color="#ffcf6a" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} sizeAttenuation />
    </points>
  );
};

// Skrin LED: video promosi dipadatkan sebagai satu atlas sprite (10 x 14 bingkai, 12 fps)
// dan bingkai dipilih melalui offset tekstur — stabil semasa render.
const ATLAS = {kol: 10, bar: 14, fps: 12, n: 140};
const SkrinLED: React.FC<{t: number; tex: THREE.Texture}> = ({t, tex}) => {
  const idx = Math.min(ATLAS.n - 1, Math.floor(t * ATLAS.fps * (11.7 / 13.65)));
  tex.repeat.set(1 / ATLAS.kol, 1 / ATLAS.bar);
  tex.offset.set((idx % ATLAS.kol) / ATLAS.kol, 1 - (Math.floor(idx / ATLAS.kol) + 1) / ATLAS.bar);
  return (
    <group position={[0, 5.6, -31]}>
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[33, 12.6]} />
        <meshBasicMaterial color="#0a0d16" fog={false} />
      </mesh>
      {tex && (
        <mesh>
          <planeGeometry args={[32, 12]} />
          <meshBasicMaterial map={tex} color="#9a9a9a" toneMapped={false} fog={false} />
        </mesh>
      )}
    </group>
  );
};

const Adegan: React.FC<{t: number; tex: THREE.Texture[]; led: THREE.Texture}> = ({t, tex, led}) => {
  const b = t / RENTAK;
  const sinar = useMemo(() => kecerunan(true), []);
  const kon = useMemo(() => kecerunan(false), []);
  const aktif = (i: number) => {
    if (b >= AKHIR) return 0.6;
    const m = TIBA[i];
    return interpolate(b, [m - 0.6, m, m + 4.4, m + 5], [0, 1, 1, 0], clamp);
  };
  return (
    <>
      <color attach="background" args={['#02040a']} />
      <fog attach="fog" args={['#02040a', 14, 46]} />
      <Env />
      <Kamera b={b} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 10, 6]} intensity={0.8} color="#bcd4ff" />
      <SkrinLED t={t} tex={led} />
      {ANUGERAH.map((a, i) => (
        <Bingkai key={i} a={a} tex={tex[i]} t={t} i={i} aktif={aktif(i)} sinar={sinar} kon={kon} />
      ))}
      <Habuk t={t} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -12]}>
        <planeGeometry args={[70, 80]} />
        <MeshReflectorMaterial blur={[200, 60]} resolution={512} mixBlur={0.8} mixStrength={90} roughness={0.55} depthScale={1.1} minDepthThreshold={0.4} maxDepthThreshold={1.4} color="#0a0e18" metalness={0.7} mirror={0.8} />
      </mesh>
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={1.15} luminanceThreshold={0.72} luminanceSmoothing={0.25} />
        <Vignette eskil={false} offset={0.25} darkness={0.8} />
      </EffectComposer>
    </>
  );
};

// ---------------------------------------------------------------- lapisan teks (DOM)
const Tajuk: React.FC<{t: number}> = ({t}) => {
  const b = t / RENTAK;
  const masuk = interpolate(t, [0, 0.45], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const keluar = interpolate(b, [2.0, 2.9], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  if (keluar >= 1) return null;
  const kilau = ((t * 70) % 260) - 60;
  const sk = interpolate(masuk, [0, 1], [1.5, 1]) * (1 + keluar * 1.6);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center', transform: `scale(${sk})`, opacity: masuk * (1 - keluar), filter: `blur(${(1 - masuk) * 14 + keluar * 10}px)`}}>
      <div style={{position: 'relative', fontFamily: ORB, fontWeight: 900, fontSize: 180, letterSpacing: 18, lineHeight: 1}}>
        <div style={{color: '#f2bf4a', textShadow: '0 0 34px rgba(255,190,60,.65), 0 2px 0 #9a6415, 0 6px 6px rgba(0,0,0,.6)'}}>TERAFECTA</div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            color: '#fff8dc',
            WebkitMaskImage: `linear-gradient(100deg, rgba(0,0,0,0) ${kilau - 14}%, rgba(0,0,0,1) ${kilau}%, rgba(0,0,0,0) ${kilau + 14}%)`,
            maskImage: `linear-gradient(100deg, rgba(0,0,0,0) ${kilau - 14}%, rgba(0,0,0,1) ${kilau}%, rgba(0,0,0,0) ${kilau + 14}%)`,
          }}
        >
          TERAFECTA
        </div>
      </div>
      <div style={{fontFamily: ORB, fontWeight: 700, fontSize: 44, letterSpacing: 22, color: C.putih, marginTop: 18, textShadow: `0 0 20px ${C.cyan}`}}>DIGITAL LUMINARIES AWARDS</div>
    </div>
  );
};

const Label: React.FC<{t: number}> = ({t}) => {
  const b = t / RENTAK;
  const i = TIBA.findIndex((m, k) => b >= m - 0.1 && b < (TIBA[k + 1] ?? AKHIR) - 0.6);
  if (i < 0) return null;
  const a = ANUGERAH[i];
  const lt = (b - TIBA[i]) * RENTAK;
  const tamat = ((TIBA[i + 1] ?? AKHIR) - 0.6) * RENTAK;
  const op = interpolate(lt, [0.1, 0.45], [0, 1], clamp) * interpolate(t, [tamat - 0.25, tamat], [1, 0], clamp);
  const y = interpolate(lt, [0.1, 0.5], [30, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', opacity: op, transform: `translateY(${y}px)`}}>
      <div style={{display: 'inline-block', padding: '16px 46px 18px', background: 'linear-gradient(90deg, rgba(2,6,16,0), rgba(2,6,16,.82) 18%, rgba(2,6,16,.82) 82%, rgba(2,6,16,0))'}}>
        <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 6, color: C.cyan, textShadow: `0 0 10px ${C.cyan}`}}>{a.kat}</div>
        <div style={{fontFamily: ORB, fontWeight: 900, fontSize: a.tajuk.length > 30 ? 50 : 60, letterSpacing: 3, marginTop: 6, color: '#f7c955', textShadow: '0 0 16px rgba(255,190,60,.6), 0 2px 0 #8a5a14, 0 4px 4px rgba(0,0,0,.8)'}}>{a.tajuk}</div>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: C.putih, marginTop: 4, textShadow: '0 2px 6px #000'}}>{a.hasil}</div>
      </div>
      {a.khas && (
        <div style={{position: 'absolute', left: '50%', top: -70, transform: `translateX(-50%) scale(${interpolate(lt, [0.4, 0.7], [2.2, 1], clamp)})`, opacity: interpolate(lt, [0.4, 0.55], [0, 1], clamp), padding: '10px 26px', background: 'linear-gradient(180deg, #fff3c4, #ffd25a 45%, #c8892a)', color: '#3a2200', fontFamily: ORB, fontWeight: 900, fontSize: 28, letterSpacing: 4, borderRadius: 6, boxShadow: '0 0 40px rgba(255,200,80,.9)'}}>
          ★ ANUGERAH KHAS
        </div>
      )}
    </div>
  );
};

const Penutup: React.FC<{t: number}> = ({t}) => {
  const b = t / RENTAK;
  const op = interpolate(b, [AKHIR + 1.2, AKHIR + 2.2], [0, 1], clamp);
  if (op <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 80, textAlign: 'center', opacity: op, transform: `scale(${0.85 + 0.15 * op})`}}>
      <div style={{display: 'inline-block', padding: '16px 44px', background: 'rgba(3,8,20,.82)', border: '2px solid #e8b94a', boxShadow: '0 0 40px rgba(255,190,60,.5)'}}>
        <div style={{fontFamily: ORB, fontWeight: 900, fontSize: 44, letterSpacing: 6, color: '#f7c955', textShadow: '0 0 14px rgba(255,190,60,.6)'}}>SK SULTAN OMAR</div>
        <div style={{fontFamily: MONO, fontSize: 21, letterSpacing: 5, color: C.cyan, marginTop: 6}}>4 PENGIKTIRAFAN · TERAFECTA DIGITAL LUMINARIES AWARDS</div>
      </div>
    </div>
  );
};

export const Terafecta: React.FC<{fd: number}> = ({fd}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const t1 = useTekstur(ANUGERAH[0].img);
  const t2 = useTekstur(ANUGERAH[1].img);
  const t3 = useTekstur(ANUGERAH[2].img);
  const t4 = useTekstur(ANUGERAH[3].img);
  const led = useTekstur('montaj/tf_led_atlas.jpg');
  const siap = t1 && t2 && t3 && t4 && led;
  // kilat pada dentuman pembuka dan setiap ketibaan
  let kilat = 0;
  [0, ...TIBA, AKHIR].forEach((m, i) => {
    const d = t - m * RENTAK;
    if (d >= 0) kilat = Math.max(kilat, (i === 0 ? 0.8 : 0.22) * Math.exp(-d * 9));
  });
  const keluar = interpolate(frame, [fd - 5, fd], [0, 1], clamp);
  return (
    <AbsoluteFill style={{background: '#02040a'}}>
      {siap && (
        <ThreeCanvas width={1920} height={1080} camera={{fov: 40, position: [0, 5.5, 11], near: 0.1, far: 120}} gl={{antialias: false}}>
          <Adegan t={t} tex={[t1, t2, t3, t4] as THREE.Texture[]} led={led as THREE.Texture} />
        </ThreeCanvas>
      )}
      <Tajuk t={t} />
      <Label t={t} />
      <Penutup t={t} />
      <AbsoluteFill style={{background: '#fff', opacity: Math.min(1, kilat + keluar), mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};
