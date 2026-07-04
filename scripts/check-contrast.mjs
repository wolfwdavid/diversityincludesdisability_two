// A11Y-06 WCAG 2.2 AA contrast gate.
// Reads the single typed token source (colors.ts + pairs.ts) directly — Node 24
// strips TypeScript types natively, so importing the .ts by explicit path needs no tooling.
import { wcagContrast } from 'culori';
import { palette } from '../src/lib/tokens/colors.ts';
import { pairs } from '../src/lib/tokens/pairs.ts';

const MIN = { 'AA-normal': 4.5, 'AA-large': 3, 'AA-ui': 3 };
let failed = 0;
for (const p of pairs) {
	const ratio = wcagContrast(palette[p.fg], palette[p.bg]);
	const ok = ratio >= MIN[p.level];
	console.log(`${ok ? 'PASS' : 'FAIL'} ${p.name}: ${ratio.toFixed(2)} (need ${MIN[p.level]})`);
	if (!ok) failed++;
}
process.exit(failed ? 1 : 0);
