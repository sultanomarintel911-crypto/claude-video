import React from 'react';
import {Composition} from 'remotion';
import {FPS, H, W} from './data';
import {AyatTudung, ay as ayTudung} from './v_033059';
import {AyatYahudiNasrani, ay as ayYN} from './v_002120';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="AyatTudung" component={AyatTudung} durationInFrames={ayTudung.duration} fps={FPS} width={W} height={H} />
		<Composition id="AyatYahudiNasrani" component={AyatYahudiNasrani} durationInFrames={ayYN.duration} fps={FPS} width={W} height={H} />
	</>
);
