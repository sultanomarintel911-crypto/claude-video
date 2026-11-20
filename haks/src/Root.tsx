import React from 'react';
import {Composition} from 'remotion';
import {HaksLoop, LOOP_FRAMES, FPS} from './HaksLoop';
import {HaksGah, GAH_FRAMES, GAH_FPS} from './HaksGah';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="HaksGah" component={HaksGah} durationInFrames={GAH_FRAMES} fps={GAH_FPS} width={1080} height={1920} />
    <Composition id="HaksLoop" component={HaksLoop} durationInFrames={LOOP_FRAMES} fps={FPS} width={1080} height={1920} />
  </>
);
