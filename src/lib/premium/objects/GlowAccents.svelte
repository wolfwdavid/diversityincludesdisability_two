<!-- src/lib/premium/objects/GlowAccents.svelte
     Larger emissive accent shards (D-01/D-02): a handful of flat-shaded icosahedron
     shells orbiting the cluster slowly, carrying the warm orange glow. Plain
     MeshStandardMaterial emissive — NO post-effect/bloom chain (budget decision,
     D-07 discretion resolved as skip); AgX tone mapping (Threlte default) gives the
     hot-core falloff. Allocated once, `<T is>` auto-disposal, motion-gated orbit. -->
<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import {
		IcosahedronGeometry,
		InstancedMesh,
		MathUtils,
		MeshStandardMaterial,
		Object3D
	} from 'three';
	import { motion } from '../state/motion.svelte';
	import type { Tier } from '../state/tier';

	let { tier, spread = 1, glow = 1 }: { tier: Tier; spread?: number; glow?: number } = $props();

	const { invalidate } = useThrelte();

	// tier is fixed per mount (detectTier runs once)
	// svelte-ignore state_referenced_locally
	const count = tier === 'low' ? 3 : 5;

	// Allocated ONCE; bound via `is` => Threlte auto-disposal owns them (PREM-05).
	const geometry = new IcosahedronGeometry(0.9, 0); // coarser facets — larger shards
	// initial glow only; the $effect below tracks changes
	// svelte-ignore state_referenced_locally
	const material = new MeshStandardMaterial({
		color: '#071c33',
		emissive: '#e8730c',
		emissiveIntensity: 1.5 * glow,
		flatShading: true,
		roughness: 0.4,
		metalness: 0.05
	});
	const mesh = new InstancedMesh(geometry, material, count);
	mesh.frustumCulled = false; // orbits exceed the base geometry bounds — never cull
	const dummy = new Object3D();

	// Deterministic per-shard orbit seeds (evenly phased ring, varied height/rate).
	const baseAngle = new Float32Array(count);
	const heights = new Float32Array(count);
	const rates = new Float32Array(count);
	for (let i = 0; i < count; i++) {
		baseAngle[i] = (i / count) * Math.PI * 2;
		heights[i] = Math.sin(i * 7.31) * 1.5;
		rates[i] = 0.6 + Math.abs(Math.sin(i * 3.17)) * 0.8;
	}

	let t = 0;
	// seed only; the task damps toward the live prop
	// svelte-ignore state_referenced_locally
	let currentSpread = spread; // eased route morphs, same damping as the cluster

	function compose(s: number, time: number): void {
		const radius = 3 * s;
		for (let i = 0; i < count; i++) {
			const a = baseAngle[i] + time * 0.08 * rates[i]; // slow orbit (D-03)
			dummy.position.set(Math.cos(a) * radius, heights[i] * s, Math.sin(a) * radius);
			dummy.rotation.set(time * 0.1 * rates[i], a, 0);
			dummy.scale.setScalar(0.7 + 0.3 * Math.sin(time * 0.3 + baseAngle[i])); // breathing
			dummy.updateMatrix();
			mesh.setMatrixAt(i, dummy.matrix);
		}
		mesh.instanceMatrix.needsUpdate = true;
	}

	compose(currentSpread, 0); // intentional first frame before any task runs

	useTask(
		(delta) => {
			t += delta;
			currentSpread = MathUtils.damp(currentSpread, spread, 2, delta);
			compose(currentSpread, t);
		},
		{ running: () => motion.animating }
	);

	// Reduced-motion still frame (PREM-06): task gated off → snap to the new route's
	// configuration once and render a single frame; also live glow response.
	$effect(() => {
		void spread;
		void glow;
		material.emissiveIntensity = 1.5 * glow;
		if (motion.reduced) {
			currentSpread = spread;
			compose(currentSpread, t);
		}
		invalidate();
	});
</script>

<T is={mesh} />
