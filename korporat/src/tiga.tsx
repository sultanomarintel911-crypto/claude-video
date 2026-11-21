// Adegan 3D (three.js melalui @remotion/three):
//  Emblem3D   - emblem SKeSO 3D untuk pembuka
//  Terowong3D - terowong data / hiperangkasa ke bahagian Pembudayaan Digital
//  Graf3D     - graf bar 3D penyertaan pertandingan digital 2023-2025
//  Rangkaian3D - medan rangkaian titik 3D (latar kad nama pentadbir)
import {useThree} from '@react-three/fiber';
import {ThreeCanvas} from '@remotion/three';
import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, Easing, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

const W = 1920;
const H = 1080;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ORB = "'Orbitron', sans-serif";
const MONO = "'JetBrains Mono', monospace";
const CYAN = '#38e8ff';
const GOLD = '#ffcf4a';

// Persekitaran pantulan supaya logam emas kelihatan berkilat
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

// Muat tekstur; pulangkan null sehingga siap supaya ThreeCanvas hanya dipasang
// selepas imej ada (elak bingkai pertama dilukis tanpa tekstur).
export const useTekstur = (src: string) => {
  const [handle] = useState(() => delayRender('tekstur ' + src));
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    new THREE.TextureLoader().load(
      staticFile(src),
      (loaded) => {
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.anisotropy = 8;
        loaded.needsUpdate = true;
        setTex(loaded);
      },
      undefined,
      (e) => cancelRender(e),
    );
  }, [src]);
  // lepaskan selepas komit yang memasang ThreeCanvas (ia ada delayRender sendiri)
  useEffect(() => {
    if (tex) continueRender(handle);
  }, [tex, handle]);
  return tex;
};

export const Bintang: React.FC<{n?: number; spread?: number; seed?: string; size?: number}> = ({n = 1500, spread = 120, seed = 'b', size = 0.12}) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      p[i * 3] = (random(`${seed}x${i}`) - 0.5) * spread;
      p[i * 3 + 1] = (random(`${seed}y${i}`) - 0.5) * spread;
      p[i * 3 + 2] = -random(`${seed}z${i}`) * spread;
    }
    g.setAttribute('position', new THREE.BufferAttribute(p, 3));
    return g;
  }, [n, spread, seed]);
  return (
    <points geometry={geo}>
      <pointsMaterial color="#cfefff" size={size} sizeAttenuation transparent opacity={0.85} />
    </points>
  );
};

// ======================================================================= 1. EMBLEM 3D
const Syiling: React.FC<{tex: THREE.Texture}> = ({tex}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const masuk = interpolate(t, [0, 2.2], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const z = interpolate(masuk, [0, 1], [-60, 0]);
  const putar = interpolate(t, [0, 2.4], [Math.PI * 5, 0], {...clamp, easing: Easing.out(Easing.cubic)}) + Math.sin(t * 1.3) * 0.12 + Math.PI / 2;
  const condong = interpolate(t, [0, 2.4], [0.9, 0.08], {...clamp, easing: Easing.out(Easing.cubic)});
  const akhir = interpolate(t, [4.6, 5.5], [1, 4], {...clamp, easing: Easing.in(Easing.cubic)});
  const mats = useMemo(() => {
    const sisi = new THREE.MeshStandardMaterial({color: '#c99a3a', metalness: 1, roughness: 0.28});
    const muka = new THREE.MeshStandardMaterial({map: tex, metalness: 0.35, roughness: 0.32, emissive: new THREE.Color('#0a1a33'), emissiveIntensity: 0.4});
    const belakang = new THREE.MeshStandardMaterial({color: '#1a2a44', metalness: 0.9, roughness: 0.35});
    return [sisi, muka, belakang];
  }, [tex]);
  return (
    <group position={[0, 0.9, z]} rotation={[Math.PI / 2 + condong * 0.4, 0, 0]} scale={akhir}>
      <group rotation={[0, putar, 0]}>
        {/* syiling: tutup atas = muka emblem */}
        <mesh material={mats}>
          <cylinderGeometry args={[3, 3, 0.42, 128]} />
        </mesh>
        {/* bibir emas */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <torusGeometry args={[3.02, 0.12, 24, 160]} />
          <meshStandardMaterial color="#e9b94a" metalness={1} roughness={0.2} />
        </mesh>
        {/* gelang tenaga cyan */}
        <mesh rotation={[Math.PI / 2, 0, t * 0.8]} position={[0, 0.3, 0]}>
          <torusGeometry args={[3.55, 0.025, 8, 200, Math.PI * 1.4]} />
          <meshBasicMaterial color={CYAN} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, -t * 1.1]} position={[0, 0.32, 0]}>
          <torusGeometry args={[3.85, 0.015, 8, 200, Math.PI * 0.9]} />
          <meshBasicMaterial color={GOLD} />
        </mesh>
      </group>
    </group>
  );
};

export const Emblem3D: React.FC<{fd: number}> = ({fd}) => {
  const frame = useCurrentFrame();
  const tex = useTekstur('montaj/emblem.png');
  const t = frame / 30;
  const sapu = interpolate(t, [2.3, 3.3], [-0.6, 1.6], clamp);
  const teks = interpolate(t, [2.6, 3.2], [0, 1], clamp) * interpolate(t, [4.4, 4.8], [1, 0], clamp);
  const kilat = interpolate(frame, [fd - 8, fd - 3, fd], [0, 1, 1], clamp);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, #0b2142 0%, #02050d 75%)'}}>
      {tex && <ThreeCanvas width={W} height={H} camera={{fov: 40, position: [0, 0, 16]}} gl={{antialias: true}}>
        <Env />
        <ambientLight intensity={0.35} />
        <directionalLight position={[6, 8, 10]} intensity={2.2} />
        <pointLight position={[-8, -2, 6]} intensity={60} color={CYAN} />
        <pointLight position={[sapu * 14 - 7, 4, 6]} intensity={140} color="#ffe2a0" />
        <Bintang n={1800} spread={140} seed="em" />
        <Syiling tex={tex} />
      </ThreeCanvas>}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', opacity: teks}}>
        <div style={{fontFamily: MONO, fontSize: 24, letterSpacing: 10, color: CYAN, textShadow: `0 0 10px ${CYAN}`}}>SK SULTAN OMAR · DUNGUN</div>
        <div style={{fontFamily: ORB, fontWeight: 900, fontSize: 46, letterSpacing: 12, color: '#fff', marginTop: 8, textShadow: '0 0 18px rgba(56,232,255,.8)'}}>MEMULAKAN MISI DIGITAL</div>
      </div>
      <AbsoluteFill style={{background: '#fff', opacity: kilat}} />
    </AbsoluteFill>
  );
};

// ======================================================================= 2. TEROWONG DATA
const Gelang: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  const jarak = useMemo(() => {
    let d = 0;
    const out: number[] = [];
    for (let i = 0; i <= frame; i++) {
      const tt = i / 30;
      d += interpolate(tt, [0, 0.6, 2.0, 2.6], [8, 40, 60, 90], clamp) / 30;
    }
    out.push(d);
    return out[0];
  }, [frame]);
  const N = 60;
  const gap = 4;
  return (
    <group>
      {Array.from({length: N}, (_, i) => {
        const z = -((i * gap - (jarak % gap)) % (N * gap));
        const warna = i % 3 === 0 ? '#b04cff' : CYAN;
        return (
          <mesh key={i} position={[0, 0, z]} rotation={[0, 0, i * 0.35 + t * 0.6]}>
            <torusGeometry args={[6, i % 3 === 0 ? 0.07 : 0.04, 6, 6]} />
            <meshBasicMaterial color={warna} transparent opacity={interpolate(-z, [0, 40, 200], [1, 0.9, 0], clamp)} />
          </mesh>
        );
      })}
      {Array.from({length: 90}, (_, i) => {
        const a = random(`ta${i}`) * Math.PI * 2;
        const r = 2 + random(`tr${i}`) * 3.6;
        const panjang = 6 + random(`tl${i}`) * 10;
        const z = -(((random(`tz${i}`) * 240 - jarak * 1.4) % 240) + 240) % 240;
        return (
          <mesh key={'s' + i} position={[Math.cos(a) * r, Math.sin(a) * r, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, panjang, 4]} />
            <meshBasicMaterial color={i % 4 === 0 ? GOLD : '#9ff3ff'} transparent opacity={0.8} />
          </mesh>
        );
      })}
    </group>
  );
};

export const Terowong3D: React.FC<{fd: number; teks: string}> = ({fd, teks}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const op = interpolate(t, [1.0, 1.4], [0, 1], clamp);
  const s = interpolate(t, [1.0, 1.4], [1.6, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const kilat = interpolate(frame, [fd - 6, fd], [0, 1], clamp);
  const [no, ...rest] = teks.split(' // ');
  return (
    <AbsoluteFill style={{background: '#02040c'}}>
      <ThreeCanvas width={W} height={H} camera={{fov: 75, position: [0, 0, 0], near: 0.1, far: 400}}>
        <fog attach="fog" args={['#02040c', 40, 220]} />
        <Gelang />
      </ThreeCanvas>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: op, transform: `scale(${s})`}}>
        <div style={{fontFamily: ORB, fontWeight: 900, fontSize: 34, color: '#001018', background: CYAN, padding: '6px 18px', boxShadow: `0 0 30px ${CYAN}`}}>{no}</div>
        <div style={{fontFamily: ORB, fontWeight: 900, fontSize: 96, letterSpacing: 10, color: '#fff', marginTop: 18, textShadow: `0 0 30px ${CYAN}, 0 0 60px #2a7bff`}}>{rest.join(' // ')}</div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: '#fff', opacity: kilat}} />
    </AbsoluteFill>
  );
};

// ======================================================================= 3. GRAF BAR 3D
export const GRAF = [
  {tahun: '2023', n: 24, k: '18 negeri · 6 kebangsaan'},
  {tahun: '2024', n: 413, k: '375 negeri · 38 kebangsaan'},
  {tahun: '2025', n: 789, k: '588 negeri · 200 kebangsaan · 1 antarabangsa'},
];
const MAKS = 789;
const TINGGI = 5.2;
const camPos = (t: number) => {
  const a = interpolate(t, [0, 6], [-0.5, 0.25]);
  return new THREE.Vector3(Math.sin(a) * 17, 6 + Math.sin(t * 0.4) * 0.4, Math.cos(a) * 17);
};
const SASARAN = new THREE.Vector3(0, 2.6, 0);

const KameraGraf: React.FC = () => {
  const frame = useCurrentFrame();
  const {camera} = useThree();
  const p = camPos(frame / 30);
  camera.position.copy(p);
  camera.lookAt(SASARAN);
  return null;
};

const tumbuh = (t: number, i: number) => interpolate(t, [0.6 + i * 0.5, 2.0 + i * 0.5], [0.001, 1], {...clamp, easing: Easing.out(Easing.cubic)});

const Bar: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <group>
      {GRAF.map((g, i) => {
        const h = Math.max(0.05, (g.n / MAKS) * TINGGI * tumbuh(t, i));
        const x = (i - 1) * 4;
        const emas = i === GRAF.length - 1;
        return (
          <group key={g.tahun} position={[x, 0, 0]}>
            <mesh position={[0, h / 2, 0]}>
              <boxGeometry args={[2.2, h, 2.2]} />
              <meshPhysicalMaterial color={emas ? '#ffcf4a' : '#38e8ff'} metalness={0.4} roughness={0.15} transmission={0.25} thickness={1} emissive={emas ? '#5a3a00' : '#063848'} emissiveIntensity={0.9} transparent opacity={0.92} />
            </mesh>
            <lineSegments position={[0, h / 2, 0]}>
              <edgesGeometry args={[new THREE.BoxGeometry(2.2, h, 2.2)]} />
              <lineBasicMaterial color={emas ? '#fff2b8' : '#bff8ff'} />
            </lineSegments>
          </group>
        );
      })}
      {/* lantai grid */}
      <gridHelper args={[30, 30, '#2a7bff', '#173a6a']} position={[0, 0, 0]} />
    </group>
  );
};

const unjuran = (v: THREE.Vector3, t: number) => {
  const cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 200);
  cam.position.copy(camPos(t));
  cam.lookAt(SASARAN);
  cam.updateMatrixWorld();
  cam.updateProjectionMatrix();
  const p = v.clone().project(cam);
  return {x: ((p.x + 1) / 2) * W, y: ((1 - p.y) / 2) * H};
};

export const Graf3D: React.FC<{fd: number}> = ({fd}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const head = interpolate(t, [0, 0.5], [0, 1], clamp);
  const out = interpolate(frame, [fd - 8, fd], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, #0d2a4a 0%, #02040a 80%)', opacity: out}}>
      <ThreeCanvas width={W} height={H} camera={{fov: 42, position: [0, 6, 17]}}>
        <Env />
        <KameraGraf />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 8]} intensity={2} />
        <pointLight position={[0, 9, 4]} intensity={80} color="#9fe9ff" />
        <Bintang n={900} spread={120} seed="gr" size={0.1} />
        <Bar />
      </ThreeCanvas>
      {GRAF.map((g, i) => {
        const p = tumbuh(t, i);
        const h = (g.n / MAKS) * TINGGI * p;
        const atas = unjuran(new THREE.Vector3((i - 1) * 4, h + 0.6, 0), t);
        const bawah = unjuran(new THREE.Vector3((i - 1) * 4, -0.2, 1.6), t);
        const emas = i === GRAF.length - 1;
        return (
          <React.Fragment key={g.tahun}>
            <div style={{position: 'absolute', left: atas.x - 200, top: atas.y - 90, width: 400, textAlign: 'center', opacity: interpolate(p, [0.05, 0.3], [0, 1], clamp)}}>
              <div style={{fontFamily: ORB, fontWeight: 900, fontSize: 64, color: emas ? GOLD : '#fff', textShadow: `0 0 20px ${emas ? GOLD : CYAN}`}}>{Math.round(g.n * p)}</div>
            </div>
            <div style={{position: 'absolute', left: bawah.x - 220, top: bawah.y + 6, width: 440, textAlign: 'center', opacity: head}}>
              <div style={{fontFamily: ORB, fontWeight: 700, fontSize: 34, letterSpacing: 4, color: '#fff'}}>{g.tahun}</div>
              <div style={{fontFamily: MONO, fontSize: 19, color: CYAN, marginTop: 4, opacity: interpolate(p, [0.6, 1], [0, 1], clamp)}}>{g.k}</div>
            </div>
          </React.Fragment>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, top: 90, textAlign: 'center', opacity: head}}>
        <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 8, color: CYAN}}>// DATA PEMBUDAYAAN DIGITAL SKeSO</div>
        <div style={{fontFamily: ORB, fontWeight: 900, fontSize: 52, letterSpacing: 6, color: '#fff', marginTop: 8, textShadow: '0 0 18px rgba(56,232,255,.8)'}}>PENYERTAAN PERTANDINGAN DIGITAL</div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 110, textAlign: 'center', opacity: interpolate(t, [3.4, 3.9], [0, 1], clamp)}}>
        <span style={{fontFamily: ORB, fontWeight: 900, fontSize: 40, color: GOLD, textShadow: `0 0 18px ${GOLD}`}}>×33</span>
        <span style={{fontFamily: ORB, fontWeight: 700, fontSize: 28, letterSpacing: 4, color: '#fff', marginLeft: 18}}>LONJAKAN DALAM DUA TAHUN</span>
      </div>
    </AbsoluteFill>
  );
};

// ======================================================================= 4. RANGKAIAN TITIK 3D
const Rangkaian: React.FC<{seed: string}> = ({seed}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const N = 70;
  const asas = useMemo(
    () =>
      Array.from({length: N}, (_, i) => {
        const u = random(`${seed}u${i}`) * Math.PI * 2;
        const v = Math.acos(2 * random(`${seed}v${i}`) - 1);
        const r = 5 + random(`${seed}r${i}`) * 4;
        return new THREE.Vector3(r * Math.sin(v) * Math.cos(u), r * Math.sin(v) * Math.sin(u) * 0.7, r * Math.cos(v));
      }),
    [seed],
  );
  const rot = new THREE.Euler(t * 0.08, t * 0.15, 0);
  const pts = asas.map((p) => p.clone().applyEuler(rot));
  const garis: number[] = [];
  for (let i = 0; i < N; i++)
    for (let j = i + 1; j < N; j++) {
      if (pts[i].distanceTo(pts[j]) < 3.0) garis.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
    }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(garis, 3));
  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts.flatMap((p) => [p.x, p.y, p.z]), 3));
  return (
    <group>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color={CYAN} transparent opacity={0.35} />
      </lineSegments>
      <points geometry={ptGeo}>
        <pointsMaterial color="#bff8ff" size={0.16} sizeAttenuation />
      </points>
    </group>
  );
};

export const Rangkaian3D: React.FC<{seed?: string; opacity?: number}> = ({seed = 'rk', opacity = 0.8}) => (
  <AbsoluteFill style={{opacity}}>
    <ThreeCanvas width={W} height={H} camera={{fov: 50, position: [0, 0, 16]}}>
      <Rangkaian seed={seed} />
      <Bintang n={600} spread={100} seed={seed + 'b'} size={0.08} />
    </ThreeCanvas>
  </AbsoluteFill>
);
