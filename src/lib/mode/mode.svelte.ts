// src/lib/mode/mode.svelte.ts
// Svelte 5 runes store for the active site mode. It is deliberately NOT a second
// resolver: on the client it SEEDS from the <html data-mode> the inline no-flash
// head script already stamped (so store and DOM agree with no hydration re-resolve),
// and it write-throughs the user's explicit choice to the namespaced localStorage
// key. Constants come from the single shared surface — the key/attr live in exactly
// one place (constants.ts), never re-derived here.

import { browser } from '$app/environment';
import { STORAGE_KEY, DATA_ATTR, type Mode } from './constants';

// SSR/prerender default = 'accessible' — the zero-WebGL baseline that ships if JS
// fails. On the client, adopt the mode the inline head script already resolved
// onto the attribute; do NOT independently re-resolve (avoids FOUC + hydration drift).
let current = $state<Mode>('accessible');
if (browser) {
	const stamped = document.documentElement.getAttribute(DATA_ATTR);
	if (stamped === 'premium' || stamped === 'accessible') current = stamped;
}

export function getMode(): Mode {
	return current;
}

export function isPremium(): boolean {
	return current === 'premium';
}

export function setMode(next: Mode): void {
	current = next;
	if (browser) {
		document.documentElement.setAttribute(DATA_ATTR, next);
		try {
			localStorage.setItem(STORAGE_KEY, next);
		} catch {
			/* private mode / sandboxed storage: ignore, in-memory state still updates */
		}
	}
}

export function toggleMode(): Mode {
	const next: Mode = current === 'premium' ? 'accessible' : 'premium';
	setMode(next);
	return next;
}
