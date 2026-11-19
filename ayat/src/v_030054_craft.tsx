/**
 * Ar-Rum 30:54 — versi VectorCraft + EffectCraft.
 * Visual: lapisan vektor dilukis oleh VectorCraft (craft/vectorcraft_lukis.py), dianimasikan & diberi
 * kesan oleh EffectCraft (craft/effectcraft_animasi.py) → public/craft/kitaran_bg.mp4.
 * Remotion hanya menindih teks Arab, terjemahan, rujukan, nama akaun dan audio qari.
 */
import React from 'react';
import {OffthreadVideo, staticFile} from 'remotion';
import {Shell} from './core';
import {ay} from './v_030054';

export const AyatKitaranHidupCraft: React.FC = () => (
	<Shell
		ay={ay}
		title="Kitaran *Kehidupan*"
		sub="pesanan Allah yang kekal dalam Al-Quran"
		bright={() => 0}
		stage={() => null}
		titleTop={262}
		bg={<OffthreadVideo src={staticFile('craft/kitaran_bg.mp4')} muted style={{position: 'absolute', width: '100%', height: '100%'}} />}
	/>
);
