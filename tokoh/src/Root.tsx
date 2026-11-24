import React from 'react';
import {Composition} from 'remotion';
import {f, FPS, H, T, W} from './data';
import {TokohMurid} from './Video';
import {BAHAGIAN1_LEN, TrailerBahagian1} from './v8/Trailer';
import {BAHAGIAN2_LEN, TrailerBahagian2} from './v8/Bahagian2';
import {BAHAGIAN3_LEN, TrailerBahagian3} from './v8/Bahagian3';
import {Satelit, SATELIT_LEN} from './v8/Satelit';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="TokohMurid" component={TokohMurid} durationInFrames={f(T.end)} fps={FPS} width={W} height={H} />
    <Composition id="PembukaanSatelit" component={Satelit} durationInFrames={SATELIT_LEN} fps={FPS} width={W} height={H} />
    <Composition id="TrailerBahagian1" component={TrailerBahagian1} durationInFrames={BAHAGIAN1_LEN} fps={FPS} width={W} height={H} />
    <Composition id="TrailerBahagian2" component={TrailerBahagian2} durationInFrames={BAHAGIAN2_LEN} fps={FPS} width={W} height={H} />
    <Composition id="TrailerBahagian3" component={TrailerBahagian3} durationInFrames={BAHAGIAN3_LEN} fps={FPS} width={W} height={H} />
  </>
);
