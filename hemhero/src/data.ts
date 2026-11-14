export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const TOTAL = 30 * FPS;
export const f = (s: number) => Math.round(s * FPS);

// Masa babak (saat) -- mesti sama dengan scripts/audio.py
export const T = {
  s1: 0.0, // loceng
  s2: 3.2, // kekecohan
  s3a: 7.6, // pejabat
  s3b: 10.4, // cermin mata ECU
  s4a: 13.0, // bangun (potret sebenar, sudut rendah)
  s4b: 15.4, // syot wira
  s5a: 17.6, // tilt-up kaki -> wajah (gerak perlahan)
  s5b: 20.0, // berjalan di koridor
  s6a: 22.6, // kekecohan sekejap
  s6b: 23.6, // barisan tersusun (lawak)
  end: 27.4, // penutup
  fin: 30.0,
};
