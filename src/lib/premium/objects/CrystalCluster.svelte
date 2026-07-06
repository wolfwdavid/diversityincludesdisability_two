<!-- src/lib/premium/objects/CrystalCluster.svelte
     The signature crystalline forms (D-01/D-03/D-05): an InstancedMesh of flat-shaded
     icosahedra in the DID night palette, tier-scaled count, deterministic per-instance
     seeding (stable across mounts — no Math.random), calm per-frame drift gated by the
     motion authority. Geometry/material/mesh are allocated ONCE at init and bound via
     `<T is>` so Threlte auto-disposal owns them (PREM-05); per-frame work only mutates
     instance matrices. -->
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
	const count = tier === 'low' ? 10 : 24;

	// Deterministic index-based pseudo-random in [0, 1) — classic hash-fract seed.
	const r = (i: number, k: number): number => {
		const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
		return s - Math.floor(s);
	};

	// Allocated ONCE (per-frame allocation is the GC-stutter anti-pattern). Bound via
	// `is` below => registered with Threlte's disposal context, disposed on unmount.
	const geometry = new IcosahedronGeometry(0.5, 1); // flat-shaded facets read as crystal
	// initial glow only; the $effect below tracks changes
	// svelte-ignore state_referenced_locally
	const material = new MeshStandardMaterial({
		color: '#0b2a4a',
		emissive: '#c85f08',
		emissiveIntensity: 0.35 * glow,
		flatShading: true,
		roughness: 0.25,
		metalness: 0.1
	});
	const mesh = new InstancedMesh(geometry, material, count);
	// Instances range far beyond the base geometry's bounding sphere — never cull.
	mesh.frustumCulled = false;
	const dummy = new Object3D();

	// Per-instance seeds: base position on a spread*4 radius (stored at spread=1),
	// scale 0.4–1.6, float phase, rotation rate. All computed once.
	const baseX = new Float32Array(count);
	const baseY = new Float32Array(count);
	const baseZ = new Float32Array(count);
	const scales = new Float32Array(count);
	const phases = new Float32Array(count);
	const rates = new Float32Array(count);
	for (let i = 0; i < count; i++) {
		baseX[i] = (r(i, 1) * 2 - 1) * 4;
		baseY[i] = (r(i, 2) * 2 - 1) * 2.5;
		baseZ[i] = (r(i, 3) * 2 - 1) * 4;
		scales[i] = 0.4 + r(i, 4) * 1.2;
		phases[i] = r(i, 5) * Math.PI * 2;
		rates[i] = 0.5 + r(i, 6);
	}

	let t = 0;
	// Route morphs ease: the applied spread damps toward the prop target (D-04).
	// seed only; the task damps toward the live prop
	// svelte-ignore state_referenced_locally
	let currentSpread = spread;

	function compose(s: number, time: number): void {
		for (let i = 0; i < count; i++) {
			dummy.position.set(
				baseX[i] * s,
				baseY[i] * s + Math.sin(time + phases[i]) * 0.15, // vertical float (D-03)
				baseZ[i] * s
			);
			dummy.rotation.set(time * 0.15 * rates[i], time * 0.15 * rates[i] + phases[i], 0);
			dummy.scale.setScalar(scales[i]);
			dummy.updateMatrix();
			mesh.setMatrixAt(i, dummy.matrix);
		}
		mesh.instanceMatrix.needsUpdate = true;
	}

	compose(currentSpread, 0); // intentional first frame, even before any task runs

	useTask(
		(delta) => {
			t += delta;
			currentSpread = MathUtils.damp(currentSpread, spread, 2, delta);
			compose(currentSpread, t);
		},
		{ running: () => motion.animating }
	);

	// Reduced-motion still frame (PREM-06): the task above is gated off, so route
	// changes must reconfigure the composition once — snap spread (no eased morphs
	// under reduced motion), recompute matrices, render exactly one frame.
	$effect(() => {
		void spread;
		void glow;
		material.emissiveIntensity = 0.35 * glow;
		if (motion.reduced) {
			currentSpread = spread;
			compose(currentSpread, t);
		}
		invalidate();
	});
</script>

<T is={mesh} />
