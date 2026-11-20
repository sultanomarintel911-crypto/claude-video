import React from 'react';
import {Composition} from 'remotion';
import {HaksLoop, LOOP_FRAMES, FPS} from './HaksLoop';

export const RemotionRoot: React.FC = () => (
  <Composition id="HaksLoop" component={HaksLoop} durationInFrames={LOOP_FRAMES} fps={FPS} width={1080} height={1920} />
);
