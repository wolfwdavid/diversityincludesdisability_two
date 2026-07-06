<script lang="ts">
	// The user-facing mode switch. A NATIVE <button> gives Enter/Space activation,
	// focusability, and a real focus ring for free; role="switch" + aria-checked add
	// the binary on/off switch semantics (checked = Premium 3D). It drives the Plan-02
	// runes store — it never re-derives precedence or the storage key. A colocated,
	// visually-hidden aria-live="polite" region announces each change to screen
	// readers. Focus is intentionally NOT moved on toggle (MODE-05).
	import { isPremium, toggleMode } from '$lib/mode/mode.svelte';

	let announce = $state('');

	function onToggle() {
		const next = toggleMode();
		announce = next === 'premium' ? 'Premium mode enabled' : 'Accessible mode enabled';
		// focus intentionally NOT moved — stays on this button (MODE-05)
	}
</script>

<button
	type="button"
	role="switch"
	aria-checked={isPremium()}
	onclick={onToggle}
	class="mode-toggle"
>
	<span class="mode-toggle__label">Premium 3D mode</span>
	<span class="mode-toggle__track" aria-hidden="true"></span>
</button>
<span class="visually-hidden" aria-live="polite">{announce}</span>

<style>
	/* Native button reset that KEEPS the global :focus-visible ring — the focus
	   outline is deliberately never suppressed here (MODE-06). */
	.mode-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		/* WCAG 2.5.8 Target Size (Minimum, 2.2 AA): at least 24x24 CSS px. */
		min-height: 24px;
		padding: 0.25rem 0.5rem;
		background: transparent;
		border: 1px solid var(--color-link, currentColor);
		border-radius: 999px;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}

	.mode-toggle__label {
		white-space: nowrap;
	}

	/* Pill track + knob. The knob slides when checked. The no-transition-until-ready
	   and reduced-motion suppression guards already live in app.css (Plan 02) — do
	   NOT re-add !important overrides here. */
	.mode-toggle__track {
		position: relative;
		display: inline-block;
		width: 40px;
		min-width: 40px;
		height: 20px;
		border-radius: 999px;
		background: var(--color-surface-muted, #ccc);
		transition: background-color 150ms ease;
	}

	.mode-toggle__track::after {
		content: '';
		position: absolute;
		top: 2px;
		left: 2px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--color-surface, #fff);
		transition: transform 150ms ease;
	}

	.mode-toggle[aria-checked='true'] .mode-toggle__track {
		background: var(--color-link, #2563eb);
	}

	.mode-toggle[aria-checked='true'] .mode-toggle__track::after {
		transform: translateX(20px);
	}
</style>
