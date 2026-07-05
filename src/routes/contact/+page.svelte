<script lang="ts">
	// SECT-05 Contact route (replaces the 04-01 placeholder stub). Owns the single
	// route-level heading; the Contact section supplies the section-level CTA + social
	// list. SEO metadata comes from the seo.contact barrel entry and is baked into
	// static HTML by adapter-static via the document head (no head library).
	import Contact from '$lib/components/sections/Contact.svelte';
	import { seo } from '$lib/content';

	const meta = seo.contact;
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />
</svelte:head>

<h1>Contact</h1>

<Contact />
