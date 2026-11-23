// Set: meja walnut sebenar + HDRI studio neutral + buku latihan bertimbun + pensel + plat dasar biru gelap (matte) + kotak lembut
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { brickGeo } from './bricks.js';
import { mulberry } from '/core/lib.js';

const PH = '/core/assets/polyhaven/';
export const M = 125;          // 1 m = 125 stud
export const TOP = .3;         // permukaan atas plat dasar

export async function buildSet(scene) {
  const hdr = await new RGBELoader().loadAsync(PH + 'photo_studio_loft_hall_2k.hdr');
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = hdr; scene.background = hdr;
  scene.backgroundBlurriness = .55; scene.backgroundIntensity = .2; scene.environmentIntensity = .45;
  scene.environmentRotation.y = scene.backgroundRotation.y = 2.2;

  const tl = new THREE.TextureLoader(), tex = (f, srgb) => { const t = tl.load(PH + f); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3.5, 3.5); t.anisotropy = 8; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ map: tex('walnut_diff.jpg', true), normalMap: tex('walnut_nor.jpg'), roughnessMap: tex('walnut_rough.jpg'), roughness: 1 }));
  desk.rotation.x = -Math.PI / 2; desk.position.set(0, 0, -40); desk.receiveShadow = true; scene.add(desk);

  // cahaya: kunci hangat dari kiri atas, isian sejuk, kotak lembut (sorotan segi empat pada plastik)
  const key = new THREE.DirectionalLight('#fff4e8', 3.0); key.position.set(-60, 110, 50); key.target.position.set(0, 0, 0);
  key.castShadow = true; key.shadow.mapSize.set(4096, 4096); key.shadow.bias = -.0004; key.shadow.normalBias = .03; key.shadow.radius = 4;
  Object.assign(key.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 10, far: 400 }); scene.add(key, key.target);
  const fill = new THREE.DirectionalLight('#cfe0ff', .45); fill.position.set(60, 40, -50); scene.add(fill);
  RectAreaLightUniformsLib.init();
  const box = (col, I, w, h, p, at) => { const l = new THREE.RectAreaLight(col, I, w, h); l.position.set(...p); l.lookAt(...at); scene.add(l); return l; };
  box('#fff6ee', 6, 60, 40, [-40, 50, 50], [0, 8, 0]);
  box('#e4eeff', 9, 50, 26, [40, 40, -60], [0, 10, 0]);
  box('#fff6ee', 4, 40, 30, [10, 70, 20], [0, 6, 0]);

  // prop sebenar: cawan teh (kanan belakang), buku latihan bertimbun (kiri belakang), pensel (depan)
  const gl = new GLTFLoader();
  const tea = (await gl.loadAsync(`${PH}tea_set_01/tea_set_01.gltf`)).scene;
  const keep = { tea_set_01_cup_small_01: [52, -30, 2.4], tea_set_01_saucer_circular_04: [52, -30, 0] };
  const dead = [];
  tea.traverse(o => { if (!o.name.startsWith('tea_set_01_')) return; const k = keep[o.name]; if (!k) dead.push(o); else { o.position.set(k[0] / M, o.position.y + (o.name.includes('cup_small') ? .012 : 0), k[1] / M); o.rotation.y = k[2]; } });
  dead.forEach(o => o.parent.remove(o));
  tea.scale.setScalar(M); scene.add(tea);
  tea.traverse(m => { if (m.isMesh) m.castShadow = m.receiveShadow = true; });

  const books = new THREE.Group(); books.position.set(-44, 0, -36); books.rotation.y = .35; scene.add(books);
  const cloth = ['#274b6d', '#7b2d26', '#e3e0d6', '#3d5c3a'], R = mulberry(5);
  let by = 0;
  [[30, 2.2, 42], [29, 1.6, 41], [30, 2.6, 42], [28, 1.8, 40]].forEach(([w, h, d], i) => {
    const b = new THREE.Group(); b.position.y = by; b.rotation.y = (R() - .5) * .18;
    const cover = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: cloth[i], roughness: .8 }));
    cover.position.y = h / 2; b.add(cover);
    const pages = new THREE.Mesh(new THREE.BoxGeometry(w - .5, h - .5, d - .3), new THREE.MeshStandardMaterial({ color: '#f1ead9', roughness: .9 }));
    pages.position.set(.35, h / 2, 0); b.add(pages);
    b.traverse(m => { if (m.isMesh) m.castShadow = m.receiveShadow = true; });
    books.add(b); by += h;
  });

  const pencil = new THREE.Group();
  const P = (geo, mat, y) => { const m = new THREE.Mesh(geo, mat); m.position.y = y; m.castShadow = m.receiveShadow = true; pencil.add(m); };
  P(new THREE.CylinderGeometry(.95, .95, 22, 6), new THREE.MeshStandardMaterial({ color: '#2e5fa8', roughness: .45 }), 0);
  P(new THREE.ConeGeometry(.95, 2.6, 6), new THREE.MeshStandardMaterial({ color: '#e9c89a', roughness: .8 }), 12.3);
  P(new THREE.ConeGeometry(.3, .8, 12), new THREE.MeshStandardMaterial({ color: '#2b2b2b', roughness: .4 }), 14);
  P(new THREE.CylinderGeometry(1, 1, 1.4, 16), new THREE.MeshStandardMaterial({ color: '#b9bcc0', metalness: 1, roughness: .3 }), -11.7);
  P(new THREE.CylinderGeometry(.95, .95, 1.6, 16), new THREE.MeshStandardMaterial({ color: '#e88a8a', roughness: .8 }), -13.2);
  pencil.rotation.set(Math.PI / 2, 0, 1.25); pencil.position.set(-16, .95, 22); scene.add(pencil);

  // plat dasar 16×16 biru gelap, matte (kilatan jelas pada plat besar menjadi basuhan warna)
  const bp = new THREE.Mesh(brickGeo(16, 16, .3), new THREE.MeshPhysicalMaterial({ color: '#1f3f7a', roughness: .55, clearcoat: .12, clearcoatRoughness: .5 }));
  bp.receiveShadow = bp.castShadow = true; scene.add(bp);
  return { key };
}
