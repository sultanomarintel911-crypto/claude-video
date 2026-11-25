import React from 'react';
import {Composition} from 'remotion';
import {FPS, H, seg, TOTAL_F, W} from './data';
import {Terafecta} from './terafecta';
import {MONTAJ_F} from './montaj';
import {MontajPentadbir} from './Montaj';
import {KorporatSKeSO} from './Video';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="KorporatSKeSO" component={KorporatSKeSO} durationInFrames={TOTAL_F} fps={FPS} width={W} height={H} />
    {/* Galeri 3D Terafecta dirender berasingan (concurrency rendah) -> public/video/terafecta_3d.mp4 */}
    <Composition id="Terafecta3D" component={Terafecta} defaultProps={{fd: seg('terafecta').fd}} durationInFrames={seg('terafecta').fd} fps={FPS} width={W} height={H} />
    <Composition id="MontajPentadbir" component={MontajPentadbir} durationInFrames={MONTAJ_F} fps={30} width={1920} height={1080} />
  </>
);
