// src/lib/premium/state/worldState.spec.ts
// Node-project spec for the PURE route→world configuration map (PREM-02, D-04/D-14)
// and the pathname normalizer (Pitfall 8): page.url.pathname arrives with the base
// path AND a trailing slash ('/diversityincludesdisability_two/services/' in
// preview/prod, '/services/' in dev where base='') — a raw lookup would silently
// give every page the hero world. Relative sibling import keeps the fence intact.

import { describe, expect, it } from 'vitest';
import { WORLD_CONFIGS, configFor, normalizeRoute } from './worldState';

const BASE = '/diversityincludesdisability_two';

describe('normalizeRoute (Pitfall 8: base path + trailing slash)', () => {
	it('strips base path and trailing slash in preview/prod shape', () => {
		expect(normalizeRoute('/diversityincludesdisability_two/services/', BASE)).toBe('/services');
	});

	it('maps the based root with trailing slash to /', () => {
		expect(normalizeRoute('/diversityincludesdisability_two/', BASE)).toBe('/');
	});

	it('strips only the trailing slash in dev (base = empty string)', () => {
		expect(normalizeRoute('/services/', '')).toBe('/services');
	});

	it('leaves the bare root untouched in dev', () => {
		expect(normalizeRoute('/', '')).toBe('/');
	});
});

describe('configFor + WORLD_CONFIGS (PREM-02, one evolving world)', () => {
	it('falls back to the hero world for unknown paths', () => {
		expect(configFor('/unknown')).toBe(WORLD_CONFIGS['/']);
	});

	it('gives the accessibility statement the quiet-room configuration (D-14)', () => {
		const quiet = configFor('/accessibility');
		expect(quiet.spread).toBe(0.2);
		expect(quiet.glow).toBe(0.15);
	});

	it('covers all 5 routes', () => {
		expect(Object.keys(WORLD_CONFIGS).sort()).toEqual(
			['/', '/about', '/accessibility', '/contact', '/services'].sort()
		);
	});
});
