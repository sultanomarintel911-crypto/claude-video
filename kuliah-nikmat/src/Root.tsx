import React from 'react';
import {Composition} from 'remotion';
import {FPS, H, TOTAL, W} from './data';
import {VideoTipografi} from './Video';

export const RemotionRoot: React.FC = () => (
  <Composition id="VideoTipografi" component={VideoTipografi} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
);
