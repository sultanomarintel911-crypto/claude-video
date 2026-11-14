import React from 'react';
import {Composition} from 'remotion';
import {FPS, H, TOTAL, W} from './data';
import {HemHero} from './Video';

export const RemotionRoot: React.FC = () => (
  <Composition id="HemHero" component={HemHero} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
);
