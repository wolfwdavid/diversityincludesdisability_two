<script lang="ts">
	// Primary navigation — a flat list of the 5 barrel routes on desktop that collapses
	// behind a disclosure <button> on narrow viewports. The disclosure is the A11Y-04
	// target: it exposes aria-expanded and closes on Escape (returning focus to the
	// toggle) and on focus leaving the nav (APG "Disclosure (Show/Hide)" pattern — NOT a
	// modal menubar, so focus is never trapped). All links are base-aware via resolve()
	// and all copy comes from the $lib/content barrel (CONT-01/02) — no hard-coded nav
	// text. The active route is marked with aria-current="page" (not color-only).
	import { resolve, base } from '$app/paths';
	import { page } from '$app/state';
	import { nav } from '$lib/content';

	let open = $state(false);
	let navEl = $state<HTMLElement>();
	let toggleBtn = $state<HTMLButtonElement>();

	// trailingSlash:'always' + the GH Pages base subpath both appear in page.url.pathname;
	// strip base and any trailing slash before comparing to the (slash-less) route keys.
	const strip = (p: string) => (p.length > 1 ? p.replace(/\/$/, '') : p);
	const current = $derived(strip(page.url.pathname.replace(base ?? '', '') || '/'));

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && open) {
			open = false;
			toggleBtn?.focus();
		}
	}

	function onFocusout(e: FocusEvent) {
		if (open && navEl && !navEl.contains(e.relatedTarget as Node)) open = false;
	}
</script>

<!-- Presentation wrapper: the real navigation landmark is the layout's <nav id="nav">;
     this element only groups the disclosure toggle + menu and delegates their keyboard
     (Escape) and focus-out handling, so it carries no semantics of its own. -->
<div bind:this={navEl} role="presentation" onkeydown={onKeydown} onfocusout={onFocusout}>
	<button
		bind:this={toggleBtn}
		type="button"
		class="nav-toggle"
		aria-expanded={open}
		aria-controls="nav-menu"
		onclick={() => (open = !open)}
	>
		<span class="visually-hidden">Menu</span>
		<span aria-hidden="true" class="nav-toggle__bars"></span>
	</button>

	<ul id="nav-menu" class="nav-menu" data-open={open}>
		{#each nav as item (item.route)}
			<li>
				<a
					href={resolve(item.route)}
					aria-current={current === strip(item.route) ? 'page' : undefined}>{item.label}</a
				>
			</li>
		{/each}
	</ul>
</div>

<style>
	/* Mobile-first: the menu is hidden until the disclosure opens it. */
	.nav-menu {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.nav-menu[data-open='false'] {
		display: none;
	}

	.nav-menu a {
		display: inline-block;
		padding: 0.5rem 0.25rem;
		color: var(--color-link);
		text-decoration: none;
	}
	.nav-menu a:hover {
		text-decoration: underline;
	}
	/* Active route marked with weight + underline (NOT color alone — WCAG 1.4.1). */
	.nav-menu a[aria-current='page'] {
		font-weight: 700;
		text-decoration: underline;
	}

	/* The hamburger glyph (decorative — the accessible name is the visually-hidden
	   "Menu" text). WCAG 2.5.8 min target size: keep the button at least 24x24. */
	.nav-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 44px;
		min-height: 44px;
		padding: 0.5rem;
		background: transparent;
		border: 1px solid var(--color-link);
		border-radius: 0.375rem;
		color: var(--color-link);
		cursor: pointer;
	}
	.nav-toggle__bars,
	.nav-toggle__bars::before,
	.nav-toggle__bars::after {
		display: block;
		width: 1.25rem;
		height: 2px;
		background: currentColor;
	}
	.nav-toggle__bars {
		position: relative;
	}
	.nav-toggle__bars::before,
	.nav-toggle__bars::after {
		content: '';
		position: absolute;
		left: 0;
	}
	.nav-toggle__bars::before {
		top: -6px;
	}
	.nav-toggle__bars::after {
		top: 6px;
	}

	/* Desktop: the toggle disappears and the menu is ALWAYS a visible flex row,
	   regardless of the `open` state — keyboard users never depend on the disclosure. */
	@media (min-width: 48rem) {
		.nav-toggle {
			display: none;
		}
		.nav-menu,
		.nav-menu[data-open='false'] {
			display: flex;
			gap: 1rem;
			align-items: center;
		}
	}
</style>
