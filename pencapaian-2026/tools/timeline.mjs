// Tulis garis masa (peristiwa bunyi + tempoh) ke out/timeline.json untuk mix.py
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { buildTimeline } = await import(path.join(HERE, 'timeline.js'));
const { ev, DUR, seg } = buildTimeline();
fs.mkdirSync(path.join(HERE, 'out'), { recursive: true });
fs.writeFileSync(path.join(HERE, 'out/timeline.json'), JSON.stringify({ DUR, ev, big: seg.filter(s => s.it && s.it.finale).map(s => [s.start, s.end]), film: seg.filter(s => s.type === 'film').map(s => [s.start, s.end]) }, null, 1));
console.log('DUR', DUR.toFixed(2), 's,', ev.length, 'peristiwa');
