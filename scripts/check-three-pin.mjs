import { readFileSync } from 'node:fs';
const EXPECTED = '0.175.0';
const lock = readFileSync('pnpm-lock.yaml', 'utf8');
const found = [...new Set([...lock.matchAll(/(?:^|[/@])three@(\d+\.\d+\.\d+)/gm)].map((m) => m[1]))];
const bad = found.filter((v) => v !== EXPECTED);
if (bad.length || !found.includes(EXPECTED)) {
	console.error(`three pin FAIL — expected only ${EXPECTED}, found:`, found);
	process.exit(1);
}
console.log(`three pin OK: ${EXPECTED}`);
