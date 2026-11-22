// Model wireframe piala Tokoh Murid (tapak, batang, piala, pemegang, mahkota bintang) → piala.json
// Guna: node gen_piala.mjs > piala.json      Koordinat: meter; y ke atas; tapak di y = 0; kamera depan = +z
import { Model } from './mkmodel.mjs';

const TAU = Math.PI * 2;
const M = new Model('PIALA TOKOH MURID');

// gelang profil (putaran) dengan muka + garis membujur: bentuk piala sebenar, bukan kotak
function lathe(prof, seg, longs) {
  const R = prof.map(([y, r]) => M.circle([0, y, 0], [0, 1, 0], r, seg));
  for (let k = 0; k < R.length - 1; k++) for (let i = 0; i < seg; i++) {
    M.quad(R[k][i], R[k][(i + 1) % seg], R[k + 1][(i + 1) % seg], R[k + 1][i]);
    if (i % Math.max(1, Math.round(seg / longs)) === 0) M.edge(R[k][i], R[k + 1][i]);
  }
  return R;
}

// ---------- Tapak (dua tingkat oktagon + plat nama) ----------
M.part('tapak', { anchor: [0, 0.14, 0.2], center: [0, 0.13, 0] });
M.piece('tapak-bawah');
lathe([[0, 0.36], [0.02, 0.36], [0.03, 0.34], [0.11, 0.34], [0.12, 0.31]], 8, 8);
M.piece('tapak-atas', { explode: [0, 0.13, 0] });
lathe([[0.12, 0.27], [0.21, 0.27], [0.22, 0.24], [0.235, 0.12], [0.25, 0.10]], 8, 8);
M.piece('tapak-plat', { explode: [0, 0.02, 0.16], hot: true });
M.box([0, 0.065, 0.335], [0.26, 0.055, 0.012]);
for (const dx of [-0.09, -0.03, 0.03, 0.09]) M.box([dx, 0.065, 0.342], [0.035, 0.012, 0.004]);   // jalur teks plat (kosong: tiada nama)
M.piece('tapak-teras', { internal: true, hot: true });                  // teras dalam yang menyala apabila tingkat atas terangkat
lathe([[0.13, 0.08], [0.24, 0.08]], 12, 6);

// ---------- Batang (teras + dua kolar + knop) ----------
M.part('batang', { anchor: [0.06, 0.45, 0], center: [0, 0.45, 0] });
M.piece('batang-teras', { hot: true });
M.tube([0, 0.25, 0], [0, 0.66, 0], 0.04, { rings: 9, seg: 12, longs: 6 });
M.piece('batang-knop-a', { explode: [0, 0.07, 0], axis: { c: [0, 0.47, 0], d: [0, 1, 0] } });
lathe([[0.42, 0.05], [0.45, 0.095], [0.48, 0.095], [0.5, 0.05]], 16, 8);
M.piece('batang-knop-b', { explode: [0, -0.07, 0], axis: { c: [0, 0.36, 0], d: [0, 1, 0] } });
lathe([[0.33, 0.05], [0.35, 0.075], [0.38, 0.075], [0.4, 0.05]], 16, 8);
M.piece('batang-leher', { explode: [0, 0.05, 0] });
lathe([[0.58, 0.045], [0.62, 0.07], [0.66, 0.06]], 16, 8);

// ---------- Piala (mangkuk) ----------
M.part('piala', { anchor: [0, 0.9, 0.3], center: [0, 0.9, 0] });
M.piece('piala-mangkuk');
lathe([[0.66, 0.06], [0.7, 0.16], [0.78, 0.25], [0.88, 0.305], [1.0, 0.33], [1.1, 0.345], [1.13, 0.36], [1.15, 0.35]], 24, 12);
M.ring([0, 0.96, 0], [0, 1, 0], 0.335, 24, 0.04);                    // jalur hiasan

// ---------- Pemegang (kiri, kanan) ----------
M.part('pemegang', { anchor: [0.52, 0.88, 0], center: [0, 0.9, 0] });
for (const s of [-1, 1]) {
  M.piece(s < 0 ? 'pemegang-kiri' : 'pemegang-kanan', { explode: [0.11 * s, 0, 0] });
  const pts = [[0.335, 1.04], [0.47, 1.06], [0.56, 0.99], [0.57, 0.88], [0.5, 0.77], [0.36, 0.74], [0.26, 0.76]].map(([x, y]) => [x * s, y, 0]);
  M.polyTube(pts, 0.022, { seg: 10, longs: 4, ringsPer: 4 });
  for (const p of [pts[0], pts[pts.length - 1]]) M.ring(p, [s, 0, 0], 0.034, 12, 0.02);   // pelekap ke dinding mangkuk
}

// ---------- Mahkota (tudung + bintang) ----------
M.part('mahkota', { anchor: [0, 1.48, 0.04], center: [0, 1.42, 0] });
M.piece('mahkota-tudung', { explode: [0, 0.05, 0] });
lathe([[1.15, 0.33], [1.17, 0.31], [1.21, 0.22], [1.24, 0.1], [1.25, 0.04]], 24, 8);
M.tube([0, 1.25, 0], [0, 1.31, 0], 0.025, { rings: 3, seg: 10, longs: 5 });
M.piece('mahkota-bintang', { explode: [0, 0.14, 0], hot: true, axis: { c: [0, 1.47, 0], d: [0, 1, 0] } });
{
  const N = 5, c = [0, 1.47, 0], ro = 0.17, ri = 0.07, dz = 0.03, F = [], B = [];
  for (let i = 0; i < N * 2; i++) {
    const a = Math.PI / 2 + (i * TAU) / (N * 2), r = i % 2 ? ri : ro;
    const x = Math.cos(a) * r, y = c[1] + Math.sin(a) * r;
    F.push(M.vtx([x, y, dz])); B.push(M.vtx([x, y, -dz]));
  }
  const cf = M.vtx([0, c[1], dz * 2.2]), cb = M.vtx([0, c[1], -dz * 2.2]);   // bintang bersegi (tengah menonjol)
  for (let i = 0; i < N * 2; i++) {
    const j = (i + 1) % (N * 2);
    M.edge(F[i], F[j]); M.edge(B[i], B[j]); M.edge(F[i], B[i]);
    M.quad(F[i], F[j], B[j], B[i]);
    M.edge(F[i], cf); M.edge(B[i], cb);
    M.quad(F[i], F[j], cf, cf); M.quad(B[i], B[j], cb, cb);
  }
  M.tube([0, 1.31, 0], [0, 1.3 + 0.01, 0], 0.03, { rings: 2, seg: 10, longs: 5 });
}

process.stdout.write(JSON.stringify(M.toJSON()));
