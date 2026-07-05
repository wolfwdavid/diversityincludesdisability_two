<script lang="ts">
	// SECT-03 + SECT-04. Real /about route (replaces the 04-01 placeholder stub). Owns the
	// single page heading (the display name); composes the barrel-driven About bio section
	// and the SocialProof section. SEO title/description come from seo.about, baked into
	// static HTML by adapter-static via svelte:head (no head library). A11Y-02: one page
	// heading, sections start one level down.
	import About from '$lib/components/sections/About.svelte';
	import SocialProof from '$lib/components/sections/SocialProof.svelte';
	import { about, seo } from '$lib/content';

	const meta = seo.about;
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
</svelte:head>

<h1>{about.displayName}</h1>
<About />
<SocialProof />
