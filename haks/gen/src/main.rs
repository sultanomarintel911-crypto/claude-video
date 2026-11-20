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
    ]);
    let mut s = String::new();
    doc.write(&mut s);
    std::fs::write(&path, &s).expect("gagal tulis layout");
    eprintln!("haks-gen: {} bait → {}", s.len(), path);
}
