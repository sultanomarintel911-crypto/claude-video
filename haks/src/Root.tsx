import React from 'react';
import {Composition} from 'remotion';
import {HaksLoop, LOOP_FRAMES, FPS} from './HaksLoop';
import {HaksGah, GAH_FRAMES, GAH_FPS} from './HaksGah';
import {HaksCombo, COMBO_FRAMES, COMBO_FPS} from './HaksCombo';
import {HaksMeteor, METEOR_FRAMES, METEOR_FPS} from './HaksMeteor';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="HaksMeteor" component={HaksMeteor} durationInFrames={METEOR_FRAMES} fps={METEOR_FPS} width={1080} height={1920} />
    <Composition id="HaksCombo" component={HaksCombo} durationInFrames={COMBO_FRAMES} fps={COMBO_FPS} width={1080} height={1920} />
    <Composition id="HaksGah" component={HaksGah} durationInFrames={GAH_FRAMES} fps={GAH_FPS} width={1080} height={1920} />
    <Composition id="HaksLoop" component={HaksLoop} durationInFrames={LOOP_FRAMES} fps={FPS} width={1080} height={1920} />
  </>
);
