// Halaman: content.json → model → filem
import { loadModel } from './engine/holo.js';
import { makeFilm, TL } from './film.js';
const cv = document.getElementById('c'), g = cv.getContext('2d');
await Promise.all(['300', '400', '500', '600'].map(w => document.fonts.load(`${w} 40px Rajdhani`)).concat([document.fonts.load('20px ShareTechMono')]));
const C = await (await fetch('content.json')).json();
const model = await loadModel(C.model);
const film = makeFilm(C, model);
window.DUR = TL.DUR;
window.EV = film.events();
window.render = t => film.render(g, t);
window.READY = true;
