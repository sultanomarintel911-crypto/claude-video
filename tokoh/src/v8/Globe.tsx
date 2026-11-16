// Glob 3D (unjuran ortografik) dengan laluan penerbangan dari Dungun.
import React, {useMemo} from 'react';
import {geoGraticule10, geoInterpolate, geoOrthographic, geoPath} from 'd3-geo';
import {feature} from 'topojson-client';
import world from 'world-atlas/countries-110m.json';
import {interpolate, useCurrentFrame} from 'remotion';
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
}> = ({cx, cy, r, rot, cities = [], arcLen = 24, dungunAt = 0, opacity = 1, labels = true}) => {
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
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, opacity}}>
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
      <circle cx={cx} cy={cy} r={r * 1.08} fill="url(#atmo)" />
      <path d={sphere} fill="url(#ocean)" stroke="rgba(255,255,255,0.18)" strokeWidth={1.2} />
      <path d={grat} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
      <path d={land} fill="#2a3446" stroke="rgba(255,255,255,0.35)" strokeWidth={0.8} />
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
                  <text x={end[0] + 14} y={end[1] - 12} fill="#fff" opacity={lab} fontFamily="'JetBrains Mono', monospace" fontSize={22} letterSpacing={3}>
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
            <text x={d0[0] + 16} y={d0[1] + 34} fill="#ffe3a0" fontFamily="'JetBrains Mono', monospace" fontSize={24} letterSpacing={4}>
              DUNGUN
            </text>
          ) : null}
        </g>
      ) : null}
    </svg>
  );
};

export const lerpRot = (fr: number, keys: number[], rots: Array<[number, number]>): [number, number] => [
  interpolate(fr, keys, rots.map((r) => r[0]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  interpolate(fr, keys, rots.map((r) => r[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
];
