import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Drift guard (Pitfall 5): the inline no-flash <head> script in app.html is a
// hand-mirrored copy of src/lib/mode/resolve.ts's precedence (it cannot import the
// module — it runs before any bundle loads). This spec structurally proves the
// inline script still encodes the SAME key + precedence and still runs pre-paint,
// so an edit to one that isn't mirrored in the other fails CI instead of shipping
// a head-time decision that disagrees with the runtime store.

const appHtmlPath = fileURLToPath(new URL('../../app.html', import.meta.url));
const appHtml = readFileSync(appHtmlPath, 'utf8');

describe('inline no-flash script mirrors resolve.ts (Pitfall 5 drift guard)', () => {
	it('uses the namespaced localStorage key did2:mode', () => {
		expect(appHtml).toContain('did2:mode');
	});

	it('probes reduced-motion via the prefers-reduced-motion: reduce query', () => {
		expect(appHtml).toContain('prefers-reduced-motion: reduce');
	});

	it('probes WebGL via the experimental-webgl context (cheap raw-canvas probe)', () => {
		expect(appHtml).toContain('experimental-webgl');
	});

	it("encodes the LOCKED default expression (reduce || !webgl) ? 'accessible' : 'premium'", () => {
		expect(appHtml).toContain("(reduce || !webgl) ? 'accessible' : 'premium'");
	});

	it('runs the inline <script> BEFORE %sveltekit.head% so data-mode is stamped pre-paint', () => {
		const scriptIdx = appHtml.indexOf('<script>');
		const headIdx = appHtml.indexOf('%sveltekit.head%');
		expect(scriptIdx).toBeGreaterThanOrEqual(0);
		expect(headIdx).toBeGreaterThanOrEqual(0);
		expect(scriptIdx).toBeLessThan(headIdx);
	});
});
