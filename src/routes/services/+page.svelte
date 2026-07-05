<script lang="ts">
	// SECT-02 — the real Services detail route (replaces the 04-01 placeholder stub).
	// Owns the single page-level heading; ServicesDetail supplies the four pillar regions
	// (A11Y-02, no skipped level). SEO comes from seo.services and is baked into the
	// prerendered HTML via <svelte:head> — prerender/trailingSlash inherit from +layout.ts.
	import ServicesDetail from '$lib/components/sections/ServicesDetail.svelte';
	import { seo } from '$lib/content';

	const meta = seo.services;
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
</svelte:head>

<h1>Services</h1>
<ServicesDetail />
