<!-- src/lib/premium/objects/ParticleField.svelte
     Ambient dust (D-01/D-03): additive orange points drifting slowly upward inside a
     fixed local box, wrapping at the top edge. The whole field scales with the route's
     spread via the object transform (Threlte prop → auto-invalidate), so the geometry
     buffer is allocated ONCE and only mutated in the gated task. depthWrite off +
     AdditiveBlending = soft glow motes with no sorting artifacts. -->
<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import {
		AdditiveBlending,
		BufferGeometry,
		Float32BufferAttribute,
		Points,
		PointsMaterial
	} from 'three';
	import { motion } from '../state/motion.svelte';
	import type { Tier } from '../state/tier';

	let { tier, spread = 1, glow = 1 }: { tier: Tier; spread?: number; glow?: number } = $props();

	const { invalidate } = useThrelte();

	// tier is fixed per mount (detectTier runs once)
	// svelte-ignore state_referenced_locally
	const count = tier === 'low' ? 120 : 400;

	// Local-space box half-extent: positions live in ±4 (an 8-unit box at spread=1);
	// the route's spread scales the whole Points object below.
	const HALF = 4;

	// Allocated ONCE; bound via `is` => Threlte auto-disposal owns geometry+material.
	const positions = new Float32Array(count * 3);
	const speeds = new Float32Array(count);
	for (let i = 0; i < count; i++) {
		positions[i * 3] = ((Math.sin(i * 12.9898) * 43758.5453) % 1) * HALF;
		positions[i * 3 + 1] = ((Math.sin(i * 78.233) * 43758.5453) % 1) * HALF;
		positions[i * 3 + 2] = ((Math.sin(i * 39.425) * 43758.5453) % 1) * HALF;
		speeds[i] = 0.08 + Math.abs(Math.sin(i * 3.7)) * 0.12; // slow, varied ascent
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	// initial glow only; the $effect below tracks changes
	// svelte-ignore state_referenced_locally
	const material = new PointsMaterial({
		color: '#e8730c',
		size: 0.04,
		transparent: true,
		opacity: 0.7 * Math.min(1, glow),
		blending: AdditiveBlending,
		depthWrite: false
	});
	const points = new Points(geometry, material);
	points.frustumCulled = false; // backdrop field — never cull while drifting

	useTask(
		(delta) => {
			const pos = geometry.getAttribute('position');
			const arr = pos.array as Float32Array;
			for (let i = 0; i < count; i++) {
				let y = arr[i * 3 + 1] + delta * speeds[i]; // calm upward drift (D-03)
				if (y > HALF) y = -HALF; // wrap at the box edge
				arr[i * 3 + 1] = y;
			}
			pos.needsUpdate = true;
		},
		{ running: () => motion.animating }
	);

	// Route/glow reconfiguration for the reduced-motion still frame (PREM-06) — and
	// live glow response in general. Spread is applied via the transform prop below.
	$effect(() => {
		material.opacity = 0.7 * Math.min(1, glow);
		invalidate();
	});
</script>

<T is={points} scale={spread} />
