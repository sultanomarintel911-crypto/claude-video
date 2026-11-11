import React from 'react';
import {Composition} from 'remotion';
import {FPS, H, TOTAL_F, W} from './data';
import {KorporatSKeSO} from './Video';

export const RemotionRoot: React.FC = () => (
  <Composition id="KorporatSKeSO" component={KorporatSKeSO} durationInFrames={TOTAL_F} fps={FPS} width={W} height={H} />
);
