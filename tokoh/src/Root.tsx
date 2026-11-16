import React from 'react';
import {Composition} from 'remotion';
import {f, FPS, H, T, W} from './data';
import {TokohMurid} from './Video';
import {BAHAGIAN1_LEN, TrailerBahagian1} from './v8/Trailer';
import {BAHAGIAN2_LEN, TrailerBahagian2} from './v8/Bahagian2';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="TokohMurid" component={TokohMurid} durationInFrames={f(T.end)} fps={FPS} width={W} height={H} />
    <Composition id="TrailerBahagian1" component={TrailerBahagian1} durationInFrames={BAHAGIAN1_LEN} fps={FPS} width={W} height={H} />
    <Composition id="TrailerBahagian2" component={TrailerBahagian2} durationInFrames={BAHAGIAN2_LEN} fps={FPS} width={W} height={H} />
  </>
);
