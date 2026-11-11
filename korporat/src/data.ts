// Garis masa video korporat SKeSO (versi digital).
// Sumber kebenaran: timeline.json (juga dibaca oleh scripts/muzik.py).
import tl from './timeline.json';

export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const f = (sec: number) => Math.round(sec * FPS);

export type Kind = 'video' | 'bio' | 'kertas' | 'statistik' | 'emas' | 'tutup';
export type Seg = {
  id: string;
  kind: Kind;
  src?: string;
  from: number;
  to: number;
  rate: number;
  dur: number; // saat (output)
  start: number; // saat (output)
  f0: number;
  fd: number;
  energi: number;
  bab?: string;
  label?: string;
  vo?: 'k' | 'w';
  voFrom?: number;
  voTo?: number;
};

type Raw = {
  id: string;
  kind?: Kind;
  src?: string;
  from?: number;
  to?: number;
  rate?: number;
  dur?: number;
  energi: number;
  bab?: string;
  label?: string;
  vo?: 'k' | 'w';
  voFrom?: number;
  voTo?: number;
};

let t = 0;
export const SEGS: Seg[] = (tl.segs as Raw[]).map((r) => {
  const rate = r.rate ?? 1;
  const dur = r.from !== undefined && r.to !== undefined ? (r.to - r.from) / rate : (r.dur as number);
  const s: Seg = {
    id: r.id,
    kind: r.kind ?? 'video',
    src: r.src,
    from: r.from ?? 0,
    to: r.to ?? 0,
    rate,
    dur,
    start: t,
    f0: f(t),
    fd: f(t + dur) - f(t),
    energi: r.energi,
    bab: r.bab,
    label: r.label,
    vo: r.vo,
    voFrom: r.voFrom,
    voTo: r.voTo,
  };
  t += dur;
  return s;
});
export const TOTAL = t;
export const TOTAL_F = f(TOTAL);
export const seg = (id: string) => SEGS.find((s) => s.id === id) as Seg;

// Fail stem suara latar dan masa sumber yang menjadi sifar dalam fail
export const VO_FILE = {k: {src: 'audio/vo_korporat.wav', zero: 110}, w: {src: 'audio/vo_walk.wav', zero: 10}};

// Data pembudayaan digital (daripada slaid DUTA 2025 & Showcase School)
export const STAT_KAD = [
  {kind: 'jalan' as const, title: 'MICROSOFT SHOWCASE SCHOOL', sub: 'Pengiktirafan antarabangsa Microsoft'},
  {kind: 'kira' as const, n: 100, suffix: '%', title: 'GURU BERTAULIAH DIGITAL', sub: 'Microsoft Advanced Educator · Gemini Certified Educator'},
  {kind: 'kira' as const, n: 97, suffix: '%', title: 'MURID AKTIF DELIMa', sub: '998 daripada 1,029 murid · 2025'},
  {kind: 'kira' as const, n: 789, suffix: '', title: 'PENYERTAAN PERTANDINGAN DIGITAL', sub: 'Peringkat negeri, kebangsaan & antarabangsa · 2025'},
];
export const JALAN = [
  {y: '2023 – 2024', t: 'INCUBATOR SCHOOL'},
  {y: '2025 – 2026', t: 'SHOWCASE SCHOOL'},
  {y: '2026 – 2027', t: 'SHOWCASE SCHOOL'},
];
