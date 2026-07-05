<script lang="ts">
	// Home route (SECT-01). Composes the three accessible section components in order.
	// Hero hosts the page's single h1 (A11Y-02); this route adds no second heading-one and no
	// inline styles — all presentation lives in the sections' scoped <style>. SEO metadata
	// comes from the $lib/content barrel (seo.home) and is baked into the prerendered HTML.
	import Hero from '$lib/components/sections/Hero.svelte';
	import Mission from '$lib/components/sections/Mission.svelte';
	import ServicesOverview from '$lib/components/sections/ServicesOverview.svelte';
	import { seo } from '$lib/content';

	const meta = seo.home;
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
</svelte:head>

<Hero />
<Mission />
<ServicesOverview />
