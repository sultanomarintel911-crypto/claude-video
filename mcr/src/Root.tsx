import React from 'react';
import {Composition} from 'remotion';
import {FPS, H, TOTAL, W} from './data';
import {KisahMCR} from './Video';

export const RemotionRoot: React.FC = () => (
  <Composition id="KisahMCR" component={KisahMCR} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
);
