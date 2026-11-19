import React from 'react';
import {Composition} from 'remotion';
import {FPS, H, W} from './data';
import {AyatTudung, ay as ayTudung} from './v_033059';
import {AyatYahudiNasrani, ay as ayYN} from './v_002120';
import {AyatKitaranHidup, ay as ayKH} from './v_030054';
import {AyatKitaranHidupCraft} from './v_030054_craft';
import {AyatSabar, ay as aySabar} from './v_002153';
import {HadisLubangBiawak, ay as ayLB} from './v_hadis_bukhari_7320';

export const RemotionRoot: React.FC = () => (
	<>
		<Composition id="AyatTudung" component={AyatTudung} durationInFrames={ayTudung.duration} fps={FPS} width={W} height={H} />
		<Composition id="AyatYahudiNasrani" component={AyatYahudiNasrani} durationInFrames={ayYN.duration} fps={FPS} width={W} height={H} />
		<Composition id="HadisLubangBiawak" component={HadisLubangBiawak} durationInFrames={ayLB.duration} fps={FPS} width={W} height={H} />
		<Composition id="AyatSabar" component={AyatSabar} durationInFrames={aySabar.duration} fps={FPS} width={W} height={H} />
		<Composition id="AyatKitaranHidup" component={AyatKitaranHidup} durationInFrames={ayKH.duration} fps={FPS} width={W} height={H} />
		<Composition id="AyatKitaranHidupCraft" component={AyatKitaranHidupCraft} durationInFrames={ayKH.duration} fps={FPS} width={W} height={H} />
	</>
);
