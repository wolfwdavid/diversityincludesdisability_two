import { describe, it, expect, beforeEach } from 'vitest';
import { getMode, isPremium, setMode, toggleMode } from './mode.svelte';

// CLIENT (chromium) project — real document + localStorage. This spec pins the
// runtime store contract: setMode/toggleMode must reflect into BOTH the
// <html data-mode> attribute and the NAMESPACED localStorage key 'did2:mode'.
// The store seeds from the attribute the inline head script already stamped, so
// each test resets that attribute to the accessible baseline in beforeEach.

beforeEach(() => {
	localStorage.clear();
	document.documentElement.setAttribute('data-mode', 'accessible');
});

describe('mode store write-through (MODE-01/02)', () => {
	it("setMode('premium') reflects into store, isPremium, data-mode, and did2:mode", () => {
		setMode('premium');
		expect(getMode()).toBe('premium');
		expect(isPremium()).toBe(true);
		expect(document.documentElement.getAttribute('data-mode')).toBe('premium');
		expect(localStorage.getItem('did2:mode')).toBe('premium');
	});

	it("setMode('accessible') reflects into store, isPremium=false, data-mode, and did2:mode", () => {
		setMode('accessible');
		expect(getMode()).toBe('accessible');
		expect(isPremium()).toBe(false);
		expect(document.documentElement.getAttribute('data-mode')).toBe('accessible');
		expect(localStorage.getItem('did2:mode')).toBe('accessible');
	});

	it('toggleMode() flips the current value and returns the NEW mode', () => {
		setMode('accessible');
		expect(toggleMode()).toBe('premium');
		expect(getMode()).toBe('premium');
		expect(document.documentElement.getAttribute('data-mode')).toBe('premium');

		expect(toggleMode()).toBe('accessible');
		expect(getMode()).toBe('accessible');
		expect(document.documentElement.getAttribute('data-mode')).toBe('accessible');
	});

	it("writes exactly the namespaced key 'did2:mode' (namespacing regression guard)", () => {
		setMode('premium');
		expect(localStorage.getItem('did2:mode')).toBe('premium');
		expect(localStorage.getItem('mode')).toBeNull();
	});
});
