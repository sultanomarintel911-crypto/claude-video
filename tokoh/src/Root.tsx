import React from 'react';
import {Composition} from 'remotion';
import {f, FPS, H, T, W} from './data';
import {TokohMurid} from './Video';

export const RemotionRoot: React.FC = () => (
  <Composition id="TokohMurid" component={TokohMurid} durationInFrames={f(T.end)} fps={FPS} width={W} height={H} />
);
