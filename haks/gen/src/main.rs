//! haks-gen — penjana susun atur prosedur untuk video gelung HAKS (9:16).
//!
//! Semua animasi dalam Remotion dipacu oleh fasa gelung `t ∈ [0,1)`.
//! Penjana ini memastikan setiap parameter gerakan ialah *harmonik integer*
//! bagi gelung (bilangan pusingan / kitaran per gelung ialah integer),
//! jadi bingkai terakhir bersambung lancar ke bingkai pertama.
//!
//! Output: satu fail JSON (tiada kebergantungan luar; RNG & JSON ditulis sendiri).

use std::f64::consts::PI;
use std::fmt::Write as _;

const W: f64 = 1080.0;
const H: f64 = 1920.0;
const SEED: u64 = 0x4841_4B53; // "HAKS"

// ---------------------------------------------------------------- RNG (SplitMix64)
struct Rng(u64);
impl Rng {
    fn next_u64(&mut self) -> u64 {
        self.0 = self.0.wrapping_add(0x9E37_79B9_7F4A_7C15);
        let mut z = self.0;
        z = (z ^ (z >> 30)).wrapping_mul(0xBF58_476D_1CE4_E5B9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94D0_49BB_1331_11EB);
        z ^ (z >> 31)
    }
    fn f(&mut self) -> f64 {
        (self.next_u64() >> 11) as f64 / (1u64 << 53) as f64
    }
    fn range(&mut self, a: f64, b: f64) -> f64 {
        a + (b - a) * self.f()
    }
    fn int(&mut self, a: i64, b: i64) -> i64 {
        a + (self.next_u64() % ((b - a + 1) as u64)) as i64
    }
    fn chance(&mut self, p: f64) -> bool {
        self.f() < p
    }
}

// ---------------------------------------------------------------- JSON kecil
enum J {
    N(f64),
    I(i64),
    S(String),
    B(bool),
    A(Vec<J>),
    O(Vec<(&'static str, J)>),
}
impl J {
    fn write(&self, out: &mut String) {
        match self {
            J::N(v) => {
                let r = (v * 100.0).round() / 100.0;
                if r == r.trunc() { write!(out, "{}", r as i64).unwrap() } else { write!(out, "{}", r).unwrap() }
            }
            J::I(v) => write!(out, "{}", v).unwrap(),
            J::S(s) => write!(out, "\"{}\"", s).unwrap(),
            J::B(b) => write!(out, "{}", b).unwrap(),
            J::A(v) => {
                out.push('[');
                for (i, x) in v.iter().enumerate() {
                    if i > 0 { out.push(','); }
                    x.write(out);
                }
                out.push(']');
            }
            J::O(v) => {
                out.push('{');
                for (i, (k, x)) in v.iter().enumerate() {
                    if i > 0 { out.push(','); }
                    write!(out, "\"{}\":", k).unwrap();
                    x.write(out);
                }
                out.push('}');
            }
        }
    }
}
fn pts(p: &[(f64, f64)]) -> J {
    J::A(p.iter().map(|(x, y)| J::A(vec![J::N(*x), J::N(*y)])).collect())
}

// ---------------------------------------------------------------- Litar (bas selari, selekoh 45°)
struct Bus {
    from_left: bool, // garisan bermula dari tepi kiri (true) atau kanan
    y: f64,          // y garisan pertama di tepi skrin
    n: usize,        // bilangan garisan
    gap: f64,        // jarak menegak antara garisan
    run1: f64,       // panjang mendatar sebelum selekoh
    rise: f64,       // anjakan menegak selekoh 45° (+ ke bawah)
    run2: (f64, f64),// julat panjang selepas selekoh (hujung berperingkat)
    yellow: f64,     // kebarangkalian garisan kuning
}

fn bus(rng: &mut Rng, b: &Bus, out: &mut Vec<J>) {
    let dir = if b.from_left { 1.0 } else { -1.0 };
    let x_edge = if b.from_left { -30.0 } else { W + 30.0 };
    // Untuk selekoh 45° dengan jarak tetap, titik selekoh setiap garisan
    // dianjak sebanyak gap·tan(22.5°) mengikut arah selekoh.
    let k = (PI / 8.0).tan();
    let sgn = if b.rise < 0.0 { 1.0 } else { -1.0 };
    for i in 0..b.n {
        let fi = i as f64;
        let y0 = b.y + fi * b.gap;
        let bend_x = x_edge + dir * (b.run1 + sgn * fi * b.gap * k);
        let x1 = bend_x + dir * b.rise.abs();
        let y1 = y0 + b.rise;
        let x2 = x1 + dir * rng.range(b.run2.0, b.run2.1);
        let path = vec![(x_edge, y0), (bend_x, y0), (x1, y1), (x2, y1)];
        let yellow = rng.chance(b.yellow);
        out.push(J::O(vec![
            ("p", pts(&path)),
            ("c", J::S(if yellow { "y".into() } else { "c".into() })),
            ("w", J::N(rng.range(2.2, 3.4))),
            ("dot", J::N(rng.range(7.0, 10.0))),
            // denyut cahaya: bilangan larian per gelung (integer) + fasa
            ("laps", J::I(rng.int(1, 2))),
            ("ph", J::N(rng.f())),
            ("pl", J::N(rng.range(0.10, 0.18))),
            // denyar titik hujung: harmonik integer
            ("dh", J::I(rng.int(1, 3))),
            ("dp", J::N(rng.f())),
        ]));
    }
}

fn circuits(rng: &mut Rng) -> J {
    let mut v = Vec::new();
    let specs = [
        // kanan atas (dari kanan, menurun ke kiri)
        Bus { from_left: false, y: 92.0,  n: 3, gap: 34.0, run1: 120.0, rise: 70.0,  run2: (150.0, 340.0), yellow: 0.35 },
        Bus { from_left: false, y: 225.0, n: 3, gap: 36.0, run1: 60.0,  rise: 60.0,  run2: (110.0, 260.0), yellow: 0.5 },
        // kiri tengah atas (dari kiri)
        Bus { from_left: true,  y: 330.0, n: 3, gap: 30.0, run1: 70.0,  rise: 50.0,  run2: (60.0, 200.0),  yellow: 0.4 },
        Bus { from_left: true,  y: 420.0, n: 2, gap: 32.0, run1: 40.0,  rise: 40.0,  run2: (80.0, 140.0),  yellow: 0.5 },
        // kanan tengah bawah
        Bus { from_left: false, y: 740.0, n: 3, gap: 26.0, run1: 70.0,  rise: 50.0,  run2: (110.0, 230.0), yellow: 0.45 },
        // kiri bawah (dari kiri, naik)
        Bus { from_left: true,  y: 1395.0,n: 3, gap: 34.0, run1: 110.0, rise: -48.0, run2: (70.0, 210.0),  yellow: 0.15 },
        // kanan bawah kecil
        Bus { from_left: false, y: 1440.0,n: 2, gap: 30.0, run1: 30.0,  rise: -40.0, run2: (60.0, 120.0),  yellow: 0.3 },
    ];
    for s in &specs {
        bus(rng, s, &mut v);
    }
    J::A(v)
}

// ---------------------------------------------------------------- Jubin piksel (gugusan segi empat)
fn pixel_clusters(rng: &mut Rng) -> J {
    // (x, y, lajur, baris, saiz, jarak) — pudar ke arah tengah skrin
    let clusters = [
        (885.0, 360.0, 6, 4, 22.0, 6.0, -1.0),
        (20.0, 765.0, 6, 5, 24.0, 7.0, 1.0),
        (840.0, 1065.0, 5, 3, 18.0, 6.0, -1.0),
    ];
    let mut out = Vec::new();
    for (cx, cy, cols, rows, s, g, fade_dir) in clusters {
        for r in 0..rows {
            for c in 0..cols {
                let u = c as f64 / (cols - 1) as f64;
                let toward_center = if fade_dir > 0.0 { u } else { 1.0 - u };
                let keep = 0.95 - 0.55 * toward_center;
                if !rng.chance(keep) { continue; }
                out.push(J::O(vec![
                    ("x", J::N(cx + c as f64 * (s + g))),
                    ("y", J::N(cy + r as f64 * (s + g))),
                    ("s", J::N(s)),
                    ("a", J::N(rng.range(0.25, 0.75) * (1.0 - 0.5 * toward_center))),
                    ("h", J::I(rng.int(1, 4))),
                    ("ph", J::N(rng.f())),
                ]));
            }
        }
    }
    J::A(out)
}

// ---------------------------------------------------------------- Grid titik
fn dot_grids(rng: &mut Rng) -> J {
    let grids = [(28.0, 28.0, 8, 4, 18.0), (835.0, 1700.0, 9, 5, 18.0), (80.0, 1610.0, 5, 3, 16.0)];
    let mut out = Vec::new();
    for (x0, y0, cols, rows, sp) in grids {
        for r in 0..rows {
            for c in 0..cols {
                if rng.chance(0.18) { continue; }
                out.push(J::O(vec![
                    ("x", J::N(x0 + c as f64 * sp)),
                    ("y", J::N(y0 + r as f64 * sp)),
                    ("r", J::N(rng.range(2.0, 3.4))),
                    ("h", J::I(rng.int(1, 3))),
                    ("ph", J::N(rng.f())),
                ]));
            }
        }
    }
    J::A(out)
}

// ---------------------------------------------------------------- Zarah terapung
fn particles(rng: &mut Rng, n: usize) -> J {
    let mut out = Vec::new();
    for _ in 0..n {
        let yellow = rng.chance(0.22);
        out.push(J::O(vec![
            ("x", J::N(rng.range(0.0, W))),
            ("y", J::N(rng.range(0.0, H))),
            ("r", J::N(rng.range(1.0, 3.6))),
            // naik sebanyak `laps` × H setiap gelung → berbalut lancar
            ("laps", J::I(rng.int(1, 2))),
            ("sw", J::N(rng.range(6.0, 26.0))), // amplitud goyangan sisi
            ("sh", J::I(rng.int(1, 3))),
            ("ph", J::N(rng.f())),
            ("c", J::S(if yellow { "y".into() } else { "c".into() })),
        ]));
    }
    J::A(out)
}

// ---------------------------------------------------------------- Gelombang jaring
fn wave(rng: &mut Rng) -> J {
    // Komponen sinus: k (rad/px), m (kitaran per gelung, integer), amplitud, fasa
    let mut comps = Vec::new();
    for (k_lo, k_hi, m, a) in [(0.0035, 0.0050, 1, 62.0), (0.0075, 0.0100, 2, 26.0), (0.0140, 0.0180, 3, 10.0)] {
        comps.push(J::O(vec![
            ("k", J::N(rng.range(k_lo, k_hi) * 10000.0)), // ×1e4 untuk ketepatan JSON
            ("m", J::I(m)),
            ("a", J::N(a)),
            ("ph", J::N(rng.range(0.0, 2.0 * PI))),
        ]));
    }
    J::O(vec![
        ("cols", J::I(84)),
        ("rows", J::I(14)),
        ("y", J::N(1600.0)),
        ("depth", J::N(150.0)),
        ("comps", J::A(comps)),
    ])
}

// ---------------------------------------------------------------- Tanda detik cincin HUD
fn ring_ticks(rng: &mut Rng) -> J {
    // 2 kumpulan simetri 180° → putaran 180° per gelung kelihatan lancar
    let mut out = Vec::new();
    for i in 0..60 {
        let a = i as f64 * 3.0;
        let long = i % 5 == 0;
        let keep = long || rng.chance(0.8);
        if !keep { continue; }
        for half in [0.0, 180.0] {
            out.push(J::A(vec![J::N(a + half), J::B(long)]));
        }
    }
    J::A(out)
}


// ---------------------------------------------------------------- Bintang
fn stars(rng: &mut Rng, n: usize) -> J {
    let mut out = Vec::new();
    for _ in 0..n {
        let big = rng.chance(0.08);
        out.push(J::O(vec![
            ("x", J::N(rng.range(0.0, W))),
            ("y", J::N(rng.range(0.0, H))),
            ("r", J::N(if big { rng.range(1.6, 2.6) } else { rng.range(0.5, 1.5) })),
            ("a", J::N(rng.range(0.35, 1.0))),
            ("h", J::I(rng.int(1, 4))),
            ("ph", J::N(rng.f())),
            ("big", J::B(big)),
            ("y2", J::B(rng.chance(0.15))),
        ]));
    }
    J::A(out)
}

// ---------------------------------------------------------------- Streak warp (dari pusat ke luar)
fn warp(rng: &mut Rng, n: usize) -> J {
    let mut out = Vec::new();
    for _ in 0..n {
        out.push(J::O(vec![
            ("ang", J::N(rng.range(0.0, 2.0 * PI) * 1000.0)),
            ("d0", J::N(rng.range(40.0, 300.0))),
            ("len", J::N(rng.range(120.0, 520.0))),
            ("del", J::N(rng.range(0.0, 0.5))),
            ("w", J::N(rng.range(1.0, 3.0))),
            ("y", J::B(rng.chance(0.2))),
        ]));
    }
    J::A(out)
}

// ---------------------------------------------------------------- Percikan hentaman (setiap huruf)
fn sparks(rng: &mut Rng, letters: usize, n: usize) -> J {
    let mut all = Vec::new();
    for _ in 0..letters {
        let mut v = Vec::new();
        for _ in 0..n {
            let a = rng.range(0.0, 2.0 * PI);
            let sp = rng.range(180.0, 620.0);
            v.push(J::O(vec![
                ("vx", J::N(a.cos() * sp)),
                ("vy", J::N(a.sin() * sp * 0.8)),
                ("r", J::N(rng.range(1.5, 4.0))),
                ("life", J::N(rng.range(0.45, 0.9))),
                ("y", J::B(rng.chance(0.55))),
            ]));
        }
        all.push(J::A(v));
    }
    J::A(all)
}

// ---------------------------------------------------------------- Tekstur planet (PNG, bersambung mendatar)
struct Noise { perm: Vec<f64> }
impl Noise {
    fn new(rng: &mut Rng) -> Self { Noise { perm: (0..4096).map(|_| rng.f()).collect() } }
    fn lat(&self, x: i64, y: i64, px: i64) -> f64 {
        let xi = x.rem_euclid(px);
        let h = (xi.wrapping_mul(73_856_093) ^ y.wrapping_mul(19_349_663)) as u64;
        self.perm[(h.wrapping_mul(2_654_435_761) % 4096) as usize]
    }
    /// hingar nilai 2D, berkala dalam x dengan tempoh `px` sel kekisi
    fn value(&self, x: f64, y: f64, px: i64) -> f64 {
        let (x0, y0) = (x.floor(), y.floor());
        let (fx, fy) = (x - x0, y - y0);
        let s = |t: f64| t * t * (3.0 - 2.0 * t);
        let (sx, sy) = (s(fx), s(fy));
        let (ix, iy) = (x0 as i64, y0 as i64);
        let a = self.lat(ix, iy, px) * (1.0 - sx) + self.lat(ix + 1, iy, px) * sx;
        let b = self.lat(ix, iy + 1, px) * (1.0 - sx) + self.lat(ix + 1, iy + 1, px) * sx;
        a * (1.0 - sy) + b * sy
    }
    fn fbm(&self, u: f64, v: f64, base: i64, oct: usize) -> f64 {
        let (mut amp, mut sum, mut norm, mut p) = (0.5, 0.0, 0.0, base);
        for o in 0..oct {
            sum += amp * self.value(u * p as f64, v * p as f64 + o as f64 * 17.0, p);
            norm += amp;
            amp *= 0.5;
            p *= 2;
        }
        sum / norm
    }
}

fn crc32(data: &[u8]) -> u32 {
    let mut c = 0xFFFF_FFFFu32;
    for &b in data {
        c ^= b as u32;
        for _ in 0..8 { c = if c & 1 != 0 { 0xEDB8_8320 ^ (c >> 1) } else { c >> 1 }; }
    }
    !c
}
fn write_png(path: &str, w: usize, h: usize, rgb: &[u8]) { write_png_n(path, w, h, 3, rgb) }
fn write_png_n(path: &str, w: usize, h: usize, ch: usize, rgb: &[u8]) {
    // zlib dengan blok "stored" (tanpa mampatan) — mudah & tanpa crate
    let mut raw = Vec::with_capacity((w * ch + 1) * h);
    for y in 0..h { raw.push(0); raw.extend_from_slice(&rgb[y * w * ch..(y + 1) * w * ch]); }
    let mut z = vec![0x78, 0x01];
    for (i, chunk) in raw.chunks(65535).enumerate() {
        let last = (i + 1) * 65535 >= raw.len();
        z.push(if last { 1 } else { 0 });
        let n = chunk.len() as u16;
        z.extend_from_slice(&n.to_le_bytes());
        z.extend_from_slice(&(!n).to_le_bytes());
        z.extend_from_slice(chunk);
    }
    let (mut a, mut b) = (1u32, 0u32);
    for &x in &raw { a = (a + x as u32) % 65521; b = (b + a) % 65521; }
    z.extend_from_slice(&((b << 16) | a).to_be_bytes());
    let mut png = vec![0x89, b'P', b'N', b'G', 0x0D, 0x0A, 0x1A, 0x0A];
    let mut chunk = |ty: &[u8], data: &[u8]| {
        png.extend_from_slice(&(data.len() as u32).to_be_bytes());
        let mut c = ty.to_vec(); c.extend_from_slice(data);
        png.extend_from_slice(&c);
        png.extend_from_slice(&crc32(&c).to_be_bytes());
    };
    let mut ihdr = Vec::new();
    ihdr.extend_from_slice(&(w as u32).to_be_bytes());
    ihdr.extend_from_slice(&(h as u32).to_be_bytes());
    ihdr.extend_from_slice(&[8, if ch == 4 { 6 } else { 2 }, 0, 0, 0]);
    chunk(b"IHDR", &ihdr);
    chunk(b"IDAT", &z);
    chunk(b"IEND", &[]);
    std::fs::write(path, png).expect("gagal tulis PNG");
}

fn lerp3(a: [f64; 3], b: [f64; 3], t: f64) -> [f64; 3] {
    let t = t.clamp(0.0, 1.0);
    [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

fn planet_texture(rng: &mut Rng, path: &str) {
    let (w, h) = (4096usize, 1024usize);
    let land = Noise::new(rng);
    let cloud = Noise::new(rng);
    let lights = Noise::new(rng);
    let mut px = vec![0u8; w * h * 3];
    let ocean_deep = [4.0, 14.0, 48.0];
    let ocean = [6.0, 28.0, 92.0];
    let shore = [40.0, 150.0, 255.0];
    let landc = [8.0, 40.0, 112.0];
    let high = [30.0, 105.0, 205.0];
    for y in 0..h {
        for x in 0..w {
            let u = x as f64 / w as f64;
            let v = y as f64 / w as f64; // nisbah aspek 1:1 per sel
            let e = land.fbm(u, v, 6, 6);
            let mut c = if e < 0.5 {
                lerp3(ocean_deep, ocean, (e - 0.25) / 0.25)
            } else if e < 0.53 {
                lerp3(ocean, shore, (e - 0.5) / 0.03)
            } else {
                lerp3(landc, high, (e - 0.53) / 0.25)
            };
            // garis pantai bercahaya
            let edge = 1.0 - ((e - 0.515).abs() / 0.012).min(1.0);
            c = lerp3(c, [90.0, 215.0, 255.0], edge * 0.75);
            // lampu bandar kuning di darat
            if e > 0.55 {
                let l = lights.fbm(u, v, 256, 2);
                let m = land.fbm(u, v, 24, 2); // gugusan bandar
                if l > 0.74 && m > 0.5 { c = lerp3(c, [255.0, 214.0, 60.0], ((l - 0.74) / 0.06).min(1.0)); }
            }
            // awan
            let cl = cloud.fbm(u + 0.0, v, 4, 5);
            let ca = ((cl - 0.56) / 0.2).clamp(0.0, 1.0) * 0.4;
            c = lerp3(c, [190.0, 225.0, 255.0], ca);
            let i = (y * w + x) * 3;
            px[i] = c[0].round() as u8;
            px[i + 1] = c[1].round() as u8;
            px[i + 2] = c[2].round() as u8;
        }
    }
    write_png(path, w, h, &px);
    eprintln!("haks-gen: tekstur planet {}×{} → {}", w, h, path);
}

// ---------------------------------------------------------------- Batu meteor (rock.png) + retakan lava (cracks.png, RGBA)
fn worley(px: &[(f64, f64)], cells: usize, x: f64, y: f64) -> (f64, f64) {
    // px: titik jitter satu per sel, grid cells×cells, berbalut
    let (cx, cy) = ((x * cells as f64).floor() as i64, (y * cells as f64).floor() as i64);
    let (mut f1, mut f2) = (9.0f64, 9.0f64);
    for dy in -1..=1 {
        for dx in -1..=1 {
            let (gx, gy) = (cx + dx, cy + dy);
            let (wx, wy) = (gx.rem_euclid(cells as i64) as usize, gy.rem_euclid(cells as i64) as usize);
            let (jx, jy) = px[wy * cells + wx];
            let fx = (gx as f64 + jx) / cells as f64;
            let fy = (gy as f64 + jy) / cells as f64;
            let d = ((fx - x).powi(2) + (fy - y).powi(2)).sqrt() * cells as f64;
            if d < f1 { f2 = f1; f1 = d; } else if d < f2 { f2 = d; }
        }
    }
    (f1, f2)
}

fn meteor_textures(rng: &mut Rng, rock_path: &str, crack_path: &str) {
    let n = 2048usize;
    let nz = Noise::new(rng);
    let nz2 = Noise::new(rng);
    // kawah
    let craters: Vec<(f64, f64, f64, f64)> = (0..70)
        .map(|_| {
            let r = rng.range(0.008, 0.06).powf(1.0) ;
            (rng.f(), rng.f(), r, rng.range(0.5, 1.0))
        })
        .collect();
    // titik worley untuk dua skala retakan
    let mk = |rng: &mut Rng, c: usize| (0..c * c).map(|_| (rng.range(0.1, 0.9), rng.range(0.1, 0.9))).collect::<Vec<_>>();
    let (c1, c2) = (7usize, 17usize);
    let w1 = mk(rng, c1);
    let w2 = mk(rng, c2);

    let mut hgt = vec![0f64; n * n];
    let mut crack = vec![0f64; n * n];
    for y in 0..n {
        for x in 0..n {
            let (u, v) = (x as f64 / n as f64, y as f64 / n as f64);
            let mut hh = 0.55 * nz.fbm(u, v, 8, 6) + 0.25 * nz2.fbm(u, v, 32, 4);
            for &(cx, cy, r, dep) in &craters {
                let mut dx = (u - cx).abs();
                if dx > 0.5 { dx = 1.0 - dx; }
                let mut dy = (v - cy).abs();
                if dy > 0.5 { dy = 1.0 - dy; }
                let d = (dx * dx + dy * dy).sqrt() / r;
                if d < 1.0 { hh -= 0.22 * dep * (1.0 - d * d); }
                hh += 0.09 * dep * (-((d - 1.0) / 0.22).powi(2)).exp();
            }
            // retakan: tepi sel worley, dipecah oleh hingar supaya tidak bersambung sempurna
            let (a1, b1) = worley(&w1, c1, u, v);
            let (a2, b2) = worley(&w2, c2, u, v);
            let wob = nz2.fbm(u, v, 16, 3);
            let k1 = (1.0 - ((b1 - a1) / (0.045 + 0.05 * wob)).min(1.0)).powf(1.6) * ((nz.fbm(u + 0.3, v, 4, 3) - 0.38) / 0.15).clamp(0.0, 1.0);
            let k2 = (1.0 - ((b2 - a2) / 0.05).min(1.0)).powf(2.0) * ((nz2.fbm(u, v + 0.2, 6, 3) - 0.58) / 0.1).clamp(0.0, 1.0) * 0.4;
            let k = k1.max(k2);
            crack[y * n + x] = k;
            hgt[y * n + x] = hh - 0.12 * k;
        }
    }
    let mut rock = vec![0u8; n * n * 3];
    let mut cr = vec![0u8; n * n * 4];
    let l = { let (x, y, z) = (-0.55f64, -0.6f64, 0.58f64); let m = (x * x + y * y + z * z).sqrt(); (x / m, y / m, z / m) };
    for y in 0..n {
        for x in 0..n {
            let i = y * n + x;
            let hx = hgt[y * n + (x + 1) % n] - hgt[y * n + (x + n - 1) % n];
            let hy = hgt[((y + 1) % n) * n + x] - hgt[((y + n - 1) % n) * n + x];
            let bump = 9.0 * n as f64 / 1024.0; // kekal sama walaupun resolusi berubah
            let (nx, ny, nzv) = (-hx * bump, -hy * bump, 1.0);
            let m = (nx * nx + ny * ny + nzv * nzv).sqrt();
            let lam = ((nx * l.0 + ny * l.1 + nzv * l.2) / m).max(0.0);
            let (u, v) = (x as f64 / n as f64, y as f64 / n as f64);
            let tint = nz.fbm(u, v, 3, 3);
            // albedo cerah: perak-kelabu dengan sedikit hangat/sejuk
            let alb = lerp3([196.0, 204.0, 218.0], [222.0, 212.0, 196.0], (tint - 0.35) / 0.3);
            let ao = (0.75 + 1.4 * (hgt[i] - 0.3)).clamp(0.6, 1.08);
            let k = crack[i];
            let sh = (0.52 + 0.78 * lam) * ao * (1.0 - 0.5 * k);
            let c = [alb[0] * sh, alb[1] * sh, alb[2] * sh];
            for j in 0..3 { rock[i * 3 + j] = c[j].clamp(0.0, 255.0) as u8; }
            // retakan bercahaya: teras putih-kuning → oren
            let g = lerp3([255.0, 120.0, 10.0], [255.0, 236.0, 150.0], k * k);
            cr[i * 4] = g[0] as u8;
            cr[i * 4 + 1] = g[1] as u8;
            cr[i * 4 + 2] = g[2] as u8;
            cr[i * 4 + 3] = (k.powf(0.8) * 255.0).clamp(0.0, 255.0) as u8;
        }
    }
    write_png(rock_path, n, n, &rock);
    write_png_n(crack_path, n, n, 4, &cr);
    eprintln!("haks-gen: tekstur meteor → {}, {}", rock_path, crack_path);
}

// bara api naik dari huruf (per huruf: offset x, fasa, laju integer)
fn embers(rng: &mut Rng, letters: usize, n: usize) -> J {
    J::A((0..letters).map(|_| J::A((0..n).map(|_| J::O(vec![
        ("x", J::N(rng.range(-0.5, 0.5))),
        ("ph", J::N(rng.f())),
        ("laps", J::I(rng.int(3, 6))),
        ("r", J::N(rng.range(1.5, 4.0))),
        ("sw", J::N(rng.range(6.0, 22.0))),
        ("h", J::B(rng.chance(0.4))),
    ])).collect())).collect())
}

fn main() {
    let path = std::env::args().nth(1).unwrap_or_else(|| "src/layout.json".into());
    let mut rng = Rng(SEED);
    let doc = J::O(vec![
        ("w", J::N(W)),
        ("h", J::N(H)),
        ("seed", J::I(SEED as i64)),
        ("circuits", circuits(&mut rng)),
        ("pixels", pixel_clusters(&mut rng)),
        ("dots", dot_grids(&mut rng)),
        ("particles", particles(&mut rng, 70)),
        ("wave", wave(&mut rng)),
        ("ticks", ring_ticks(&mut rng)),
        ("stars", stars(&mut rng, 260)),
        ("warp", warp(&mut rng, 90)),
        ("sparks", sparks(&mut rng, 4, 26)),
        ("embers", embers(&mut rng, 5, 14)),
    ]);
    if let Some(tex) = std::env::args().nth(2) {
        planet_texture(&mut rng, &tex);
        let dir = std::path::Path::new(&tex).parent().map(|p| p.to_string_lossy().to_string()).unwrap_or(".".into());
        meteor_textures(&mut rng, &format!("{}/rock.png", dir), &format!("{}/cracks.png", dir));
    }
    let mut s = String::new();
    doc.write(&mut s);
    std::fs::write(&path, &s).expect("gagal tulis layout");
    eprintln!("haks-gen: {} bait → {}", s.len(), path);
}
