// Glob 3D (unjuran ortografik) dengan laluan penerbangan dari Dungun.
import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {geoGraticule10, geoInterpolate, geoOrthographic, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import {continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ci} from '../components';

export type City = {name: string; lon: number; lat: number; at: number}; // at = bingkai mula garisan
export const DUNGUN = {lon: 103.42, lat: 4.76};
export const BANDAR: Omit<City, 'at'>[] = [
  {name: 'SINGAPURA', lon: 103.82, lat: 1.35},
  {name: 'BIRMINGHAM', lon: -1.89, lat: 52.49},
  {name: 'ISTANBUL', lon: 28.98, lat: 41.01},
  {name: 'SHANGHAI', lon: 121.47, lat: 31.23},
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COUNTRIES = feature(world as any, (world as any).objects.countries) as any;
const GRAT = geoGraticule10();

// ---------------- tekstur Bumi (Blue Marble) - dimuat sekali
let TEX: {w: number; h: number; d: Uint8ClampedArray} | null = null;
let texJanji: Promise<void> | null = null;
const muatTekstur = () => {
  if (!texJanji) {
    texJanji = new Promise<void>((ok) => {
      const im = new Image();
      im.onload = () => {
        const c = document.createElement('canvas');
        c.width = im.width;
        c.height = im.height;
        const g = c.getContext('2d')!;
        g.drawImage(im, 0, 0);
        TEX = {w: im.width, h: im.height, d: g.getImageData(0, 0, im.width, im.height).data};
        ok();
      };
      im.onerror = () => ok();
      im.src = staticFile('v8/img/earth.jpg');
    });
  }
  return texJanji;
};

// sfera bertekstur (unjuran ortografik songsang setiap piksel) + pencahayaan + atmosfera
const BumiKanvas: React.FC<{cx: number; cy: number; r: number; rot: [number, number]}> = ({cx, cy, r, rot}) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const R = Math.ceil(r);
  const D = 2 * R + 2;
  const [h] = React.useState(() => (TEX ? null : delayRender('tekstur bumi')));
  const [siap, setSiap] = React.useState(!!TEX);
  useLayoutEffect(() => {
    if (TEX) return;
    muatTekstur().then(() => {
      setSiap(true);
      if (h !== null) continueRender(h);
    });
  }, [h]);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv || !TEX || !siap) return;
    const g = cv.getContext('2d')!;
    const img = g.createImageData(D, D);
    const o = img.data;
    const {w: TW, h: TH, d: T} = TEX;
    const l0 = (rot[0] * Math.PI) / 180;
    const p0 = (rot[1] * Math.PI) / 180;
    const sp0 = Math.sin(p0);
    const cp0 = Math.cos(p0);
    // arah cahaya (kiri atas, ke hadapan)
    const Lx = -0.45, Ly = 0.5, Lz = 0.74;
    for (let y = 0; y < D; y++) {
      const v = -(y - R - 0.5) / r;
      for (let x = 0; x < D; x++) {
        const u = (x - R - 0.5) / r;
        const rho2 = u * u + v * v;
        const k = (y * D + x) * 4;
        if (rho2 > 1) {
          o[k + 3] = 0;
          continue;
        }
        const rho = Math.sqrt(rho2);
        const z = Math.sqrt(1 - rho2);
        // sin c = rho, cos c = z
        const lat = rho < 1e-9 ? p0 : Math.asin(z * sp0 + (v * cp0));
        const lon = l0 + Math.atan2(u, z * cp0 - v * sp0);
        let tx = ((lon / (2 * Math.PI) + 0.5) % 1 + 1) % 1;
        const ty = 0.5 - lat / Math.PI;
        const sx = Math.min(TW - 1, Math.floor(tx * TW));
        const sy = Math.min(TH - 1, Math.max(0, Math.floor(ty * TH)));
        const t = (sy * TW + sx) * 4;
        const dif = Math.max(0, u * Lx + v * Ly + z * Lz);
        const sh = 0.32 + 0.95 * dif;
        const spec = Math.pow(Math.max(0, dif), 40) * 60;
        const rim = Math.pow(1 - z, 2.4); // atmosfera di tepi
        const a = Math.min(1, rim * 0.9);
        o[k] = Math.min(255, (T[t] * sh + spec) * (1 - a) + 110 * a * (0.6 + dif));
        o[k + 1] = Math.min(255, (T[t + 1] * sh + spec) * (1 - a) + 185 * a * (0.6 + dif));
        o[k + 2] = Math.min(255, (T[t + 2] * sh * 1.04 + spec) * (1 - a) + 255 * a * (0.6 + dif));
        // anti-alias tepi
        o[k + 3] = rho > 1 - 1.5 / r ? Math.max(0, Math.min(255, ((1 - rho) * r) / 1.5 * 255)) : 255;
      }
    }
    g.putImageData(img, 0, 0);
  }, [siap, D, R, r, rot[0], rot[1]]);
  return (
    <>
      {/* cahaya atmosfera luar */}
      <div style={{position: 'absolute', left: cx - r * 1.25, top: cy - r * 1.25, width: r * 2.5, height: r * 2.5, borderRadius: '50%', background: 'radial-gradient(circle, rgba(80,170,255,0) 38%, rgba(80,170,255,0.55) 40%, rgba(60,150,255,0.18) 46%, rgba(40,120,255,0) 58%)', filter: 'blur(6px)'}} />
      <canvas ref={ref} width={D} height={D} style={{position: 'absolute', left: cx - R - 1, top: cy - R - 1, width: D, height: D}} />
    </>
  );
};

export const Globe: React.FC<{
  cx: number;
  cy: number;
  r: number;
  rot: [number, number]; // [lon, lat] pusat pandangan
  cities?: City[];
  arcLen?: number; // bingkai untuk melukis satu garisan
  dungunAt?: number; // bingkai titik Dungun menyala
  opacity?: number;
  labels?: boolean;
  tekstur?: boolean; // Bumi sebenar (Blue Marble) - gaya filem
}> = ({cx, cy, r, rot, cities = [], arcLen = 24, dungunAt = 0, opacity = 1, labels = true, tekstur = true}) => {
  const fr = useCurrentFrame();
  const proj = useMemo(() => geoOrthographic().scale(r).translate([cx, cy]).rotate([-rot[0], -rot[1]]).clipAngle(90), [cx, cy, r, rot[0], rot[1]]);
  const path = geoPath(proj);
  const land = path(COUNTRIES) || '';
  const grat = path(GRAT) || '';
  const sphere = path({type: 'Sphere'}) || '';
  const pt = (lon: number, lat: number) => {
    // titik hanya kelihatan di hemisfera hadapan
    const p = proj([lon, lat]);
    const vis = path({type: 'Point', coordinates: [lon, lat]}) !== null;
    return p && vis ? p : null;
  };
  const d0 = pt(DUNGUN.lon, DUNGUN.lat);
  const pulse = 0.5 + 0.5 * Math.sin(fr / 5);
  const dOn = ci(fr, dungunAt, dungunAt + 10);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, opacity}}>
    {tekstur ? <BumiKanvas cx={cx} cy={cy} r={r} rot={rot} /> : null}
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <radialGradient id="ocean" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#1a2436" />
          <stop offset="1" stopColor="#05070d" />
        </radialGradient>
        <radialGradient id="atmo" cx="50%" cy="50%" r="50%">
          <stop offset="0.86" stopColor="rgba(140,180,255,0)" />
          <stop offset="0.93" stopColor="rgba(140,180,255,0.25)" />
          <stop offset="1" stopColor="rgba(140,180,255,0)" />
        </radialGradient>
      </defs>
      {tekstur ? (
        <>
          <path d={grat} fill="none" stroke="rgba(150,210,255,0.13)" strokeWidth={1} />
          <path d={sphere} fill="none" stroke="rgba(150,210,255,0.5)" strokeWidth={1.5} />
        </>
      ) : (
        <>
          <circle cx={cx} cy={cy} r={r * 1.08} fill="url(#atmo)" />
          <path d={sphere} fill="url(#ocean)" stroke="rgba(255,255,255,0.18)" strokeWidth={1.2} />
          <path d={grat} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
          <path d={land} fill="#2a3446" stroke="rgba(255,255,255,0.35)" strokeWidth={0.8} />
        </>
      )}
      {cities.map((c, i) => {
        const p = ci(fr, c.at, c.at + arcLen, 0, 1);
        if (p <= 0) return null;
        const interp = geoInterpolate([DUNGUN.lon, DUNGUN.lat], [c.lon, c.lat]);
        const n = 48;
        const m = Math.max(2, Math.round(n * p));
        const coords = Array.from({length: m}, (_, k) => interp((k / (m - 1)) * p));
        const arc = path({type: 'LineString', coordinates: coords}) || '';
        const end = pt(c.lon, c.lat);
        const lab = ci(fr, c.at + arcLen - 4, c.at + arcLen + 8);
        return (
          <g key={i}>
            <path d={arc} fill="none" stroke="#ffcf6b" strokeWidth={3.2} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 6px rgba(255,190,80,0.9))'}} />
            {end && p >= 1 ? (
              <g>
                <circle cx={end[0]} cy={end[1]} r={7 + 10 * pulse * lab} fill="none" stroke="rgba(255,207,107,0.7)" strokeWidth={2} />
                <circle cx={end[0]} cy={end[1]} r={6} fill="#ffe3a0" />
                {labels ? (
                  <text x={end[0] + 14} y={end[1] - 12} fill="#fff" opacity={lab} fontWeight={700} style={{paintOrder: "stroke", stroke: "rgba(0,10,25,0.85)", strokeWidth: 5}} fontFamily="'JetBrains Mono', monospace" fontSize={22} letterSpacing={3}>
                    {c.name}
                  </text>
                ) : null}
              </g>
            ) : null}
          </g>
        );
      })}
      {d0 && dOn > 0 ? (
        <g opacity={dOn}>
          <circle cx={d0[0]} cy={d0[1]} r={10 + 18 * pulse} fill="none" stroke="rgba(255,207,107,0.8)" strokeWidth={2.5} />
          <circle cx={d0[0]} cy={d0[1]} r={8} fill="#fff1c9" style={{filter: 'drop-shadow(0 0 10px #ffcf6b)'}} />
          {labels ? (
            <text x={d0[0] + 16} y={d0[1] + 34} fill="#ffe3a0" fontWeight={700} style={{paintOrder: "stroke", stroke: "rgba(0,10,25,0.85)", strokeWidth: 5}} fontFamily="'JetBrains Mono', monospace" fontSize={24} letterSpacing={4}>
              DUNGUN
            </text>
          ) : null}
        </g>
      ) : null}
    </svg>
    </div>
  );
};

export const lerpRot = (fr: number, keys: number[], rots: Array<[number, number]>): [number, number] => [
  interpolate(fr, keys, rots.map((r) => r[0]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  interpolate(fr, keys, rots.map((r) => r[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
];
