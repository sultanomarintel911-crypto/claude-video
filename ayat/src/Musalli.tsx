/**
 * Watak 3D orang solat (minimalis, tanpa wajah): berjubah + berkopiah.
 * Dibina daripada kapsul/sfera. Kaki & badan = sudut (FK); tangan = IK 2-tulang ke sasaran.
 * Koordinat pose: x = hadapan, y = atas, z = sisi (meter). Kaki di y = 0.
 */
import React from 'react';
import * as THREE from 'three';

const L = {thigh: 0.47, shin: 0.46, torso: 0.55, neck: 0.2, upper: 0.3, fore: 0.28, foot: 0.17, shoulderZ: 0.17, hipZ: 0.09};
const deg = Math.PI / 180;

export type Pose = {
	hip: [number, number];
	thigh: number; // sudut (darjah) pinggul→lutut
	shin: number; // lutut→buku lali
	foot: number; // buku lali→jari kaki
	torso: number; // pinggul→bahu
	neck: number; // bahu→kepala
	hand: [number, number, number]; // sasaran tangan (z = jarak sisi, dicerminkan)
	pole: [number, number, number]; // arah siku
};

export const POSES: Record<string, Pose> = {
	diri: {hip: [0, 0.95], thigh: -90, shin: -90, foot: 0, torso: 90, neck: 90, hand: [0.03, 0.92, 0.25], pole: [0, 0, 1]},
	takbir: {hip: [0, 0.95], thigh: -90, shin: -90, foot: 0, torso: 90, neck: 90, hand: [0.07, 1.63, 0.2], pole: [0, -1, 1]},
	qiyam: {hip: [0, 0.95], thigh: -90, shin: -90, foot: 0, torso: 90, neck: 86, hand: [0.18, 1.32, 0.02], pole: [-0.2, -1, 1.6]},
	rukuk: {hip: [-0.1, 0.94], thigh: -88, shin: -92, foot: 0, torso: 2, neck: -4, hand: [-0.04, 0.56, 0.13], pole: [1, 0, 0.6]},
	sujud: {hip: [-0.16, 0.53], thigh: -70, shin: -180, foot: -60, torso: -32, neck: -34, hand: [0.4, 0.04, 0.21], pole: [0, 1, 1.2]},
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const mixPose = (p: Pose, q: Pose, k: number): Pose => ({
	hip: [lerp(p.hip[0], q.hip[0], k), lerp(p.hip[1], q.hip[1], k)],
	thigh: lerp(p.thigh, q.thigh, k),
	shin: lerp(p.shin, q.shin, k),
	foot: lerp(p.foot, q.foot, k),
	torso: lerp(p.torso, q.torso, k),
	neck: lerp(p.neck, q.neck, k),
	hand: [lerp(p.hand[0], q.hand[0], k), lerp(p.hand[1], q.hand[1], k), lerp(p.hand[2], q.hand[2], k)],
	pole: [lerp(p.pole[0], q.pole[0], k), lerp(p.pole[1], q.pole[1], k), lerp(p.pole[2], q.pole[2], k)],
});

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const along = (o: THREE.Vector3, ang: number, len: number) => o.clone().add(V(Math.cos(ang * deg) * len, Math.sin(ang * deg) * len, 0));

/** IK 2-tulang: siku bagi bahu S → tangan T, condong ke arah `pole`. */
const ik = (S: THREE.Vector3, T: THREE.Vector3, pole: THREE.Vector3) => {
	const a = L.upper;
	const b = L.fore;
	const toT = T.clone().sub(S);
	const d = Math.min(toT.length(), a + b - 0.002);
	const dir = toT.normalize();
	const hand = S.clone().add(dir.clone().multiplyScalar(d));
	const cosA = (a * a + d * d - b * b) / (2 * a * d);
	const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
	const perp = pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir)));
	if (perp.lengthSq() < 1e-6) perp.set(0, -1, 0);
	perp.normalize();
	const elbow = S.clone().add(dir.multiplyScalar(a * cosA)).add(perp.multiplyScalar(a * sinA));
	return {elbow, hand};
};

const UP = V(0, 1, 0);
const Bone: React.FC<{a: THREE.Vector3; b: THREE.Vector3; r: number; mat: React.ReactNode}> = ({a, b, r, mat}) => {
	const d = b.clone().sub(a);
	const len = Math.max(0.001, d.length());
	const q = new THREE.Quaternion().setFromUnitVectors(UP, d.clone().normalize());
	const m = a.clone().add(b).multiplyScalar(0.5);
	return (
		<mesh position={m} quaternion={q}>
			<capsuleGeometry args={[r, len, 6, 14]} />
			{mat}
		</mesh>
	);
};

export const Musalli: React.FC<{pose: Pose; color: string; emissive: string; glow: number; opacity?: number}> = ({pose, color, emissive, glow, opacity = 1}) => {
	const mat = <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={glow} roughness={0.45} metalness={0.05} transparent={opacity < 1} opacity={opacity} />;
	const hip = V(pose.hip[0], pose.hip[1], 0);
	const shoulderC = along(hip, pose.torso, L.torso);
	const head = along(shoulderC, pose.neck, L.neck);
	const neckDir = head.clone().sub(shoulderC).normalize();
	const parts: React.ReactNode[] = [];

	// badan (jubah): kapsul tebal + bahagian bawah jubah
	parts.push(<Bone key="torso" a={hip.clone().add(V(0, 0, 0))} b={shoulderC} r={0.16} mat={mat} />);
	parts.push(
		<mesh key="head" position={head}>
			<sphereGeometry args={[0.115, 24, 18]} />
			{mat}
		</mesh>,
	);
	// kopiah
	const capQ = new THREE.Quaternion().setFromUnitVectors(UP, neckDir);
	parts.push(
		<mesh key="cap" position={head.clone().add(neckDir.clone().multiplyScalar(0.075))} quaternion={capQ}>
			<cylinderGeometry args={[0.104, 0.112, 0.08, 24]} />
			<meshStandardMaterial color="#d8f6ff" emissive={emissive} emissiveIntensity={glow * 1.6 + 0.2} roughness={0.3} transparent={opacity < 1} opacity={opacity} />
		</mesh>,
	);

	for (const side of [-1, 1]) {
		const hz = V(0, 0, side * L.hipZ);
		const h = hip.clone().add(hz);
		const knee = along(h, pose.thigh, L.thigh);
		const ankle = along(knee, pose.shin, L.shin);
		const toe = along(ankle, pose.foot, L.foot);
		parts.push(<Bone key={`th${side}`} a={h} b={knee} r={0.105} mat={mat} />);
		parts.push(<Bone key={`sh${side}`} a={knee} b={ankle} r={0.085} mat={mat} />);
		parts.push(<Bone key={`ft${side}`} a={ankle} b={toe} r={0.05} mat={mat} />);

		const S = shoulderC.clone().add(V(0, 0, side * L.shoulderZ));
		const T = V(pose.hand[0], pose.hand[1], side * pose.hand[2]);
		const pole = V(pose.pole[0], pose.pole[1], side * pose.pole[2]);
		const {elbow, hand} = ik(S, T, pole);
		parts.push(<Bone key={`ua${side}`} a={S} b={elbow} r={0.06} mat={mat} />);
		parts.push(<Bone key={`fa${side}`} a={elbow} b={hand} r={0.052} mat={mat} />);
		parts.push(
			<mesh key={`hd${side}`} position={hand}>
				<sphereGeometry args={[0.055, 14, 10]} />
				{mat}
			</mesh>,
		);
	}
	return <group>{parts}</group>;
};
