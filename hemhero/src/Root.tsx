import React from 'react';
import {Composition} from 'remotion';
import {FPS, H, TOTAL, W} from './data';
import {MissionHem} from './Scene2';
import {BehindTheSmile, FinalFarewell, NextChapter} from './Scene345';
import {HemHero} from './Video';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="HemHero" component={HemHero} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
    <Composition id="MissionHem" component={MissionHem} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
    <Composition id="BehindTheSmile" component={BehindTheSmile} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
    <Composition id="NextChapter" component={NextChapter} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
    <Composition id="FinalFarewell" component={FinalFarewell} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
  </>
);
