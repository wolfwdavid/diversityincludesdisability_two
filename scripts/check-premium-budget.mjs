// PREM-03 / D-07 premium chunk gate.
//
// Partitions the built client chunk graph into:
//   ACCESSIBLE closure — every .js statically reachable from build/_app/immutable/{entry,nodes}
//     (the code ANY visitor downloads). Must contain ZERO WebGL runtime signatures — this
//     codifies Phase 4's A11Y-08 scan as a permanent, committed gate.
//   PREMIUM graph — signature-matching chunks OUTSIDE that closure (reachable only through the
//     single dynamic import() gate in +layout.svelte), expanded by their own static closure.
//     Must be NON-EMPTY (scan-rot guard) and total <= 500 KB gzip ("Premium must never mean heavy").
//
// The walk follows static `import ... from "…"` / `import "…"` / `export ... from "…"` forms
// only. Dynamic `import("…")` call sites are EXACTLY the premium boundary and are never followed
// (the regex cannot match them — `import(` has no quote after the keyword — and a guard rejects
// any residual match text containing `import(`). __vite__mapDeps arrays are plain string arrays,
// not import statements, so the regex naturally ignores them.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join, relative, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

// Signature set survives minification: three embeds 'THREE.'-prefixed string literals.
// (A naive three|webgl grep false-positives on the accessibility statement's own prose.)
const SIG = /WebGLRenderer|@threlte|THREE\./;
const BUDGET = 500_000; // gzip bytes (D-07: comfortably under the ~600KB guideline)
const STATIC_IMPORT = /(?:import|export)\s*(?:[\w${},*\s]+from\s*)?["']([^"']+\.js)["']/g;

const APP_DIR = resolve('build', '_app');
const IMMUTABLE = join(APP_DIR, 'immutable');

if (!existsSync(IMMUTABLE)) {
	console.error('FAIL build/_app/immutable not found — run pnpm build first');
	process.exit(1);
}

/** All .js files under dir, recursively (absolute paths). */
function jsFilesUnder(dir) {
	if (!existsSync(dir)) return [];
	return readdirSync(dir, { recursive: true, withFileTypes: true })
		.filter((e) => e.isFile() && e.name.endsWith('.js'))
		.map((e) => join(e.parentPath, e.name));
}

/** Static import/export specifiers of one built file, resolved to absolute paths under build/_app. */
function staticDeps(file) {
	const src = readFileSync(file, 'utf8');
	const deps = [];
	for (const m of src.matchAll(STATIC_IMPORT)) {
		if (m[0].includes('import(')) continue; // belt-and-braces: never follow the dynamic boundary
		const target = resolve(dirname(file), m[1]);
		if (target.startsWith(APP_DIR) && existsSync(target)) deps.push(target);
	}
	return deps;
}

/** BFS static-import closure over a set of root files. `exclude` members are never entered. */
function closureOf(roots, exclude = new Set()) {
	const seen = new Set();
	const queue = roots.filter((f) => !exclude.has(f));
	while (queue.length > 0) {
		const file = queue.shift();
		if (seen.has(file)) continue;
		seen.add(file);
		for (const dep of staticDeps(file)) {
			if (!seen.has(dep) && !exclude.has(dep)) queue.push(dep);
		}
	}
	return seen;
}

const rel = (f) => relative(IMMUTABLE, f).split(sep).join('/');

// 1. ROOTS: entry/ + nodes/ — everything the accessible client fetches statically.
const roots = [
	...jsFilesUnder(join(IMMUTABLE, 'entry')),
	...jsFilesUnder(join(IMMUTABLE, 'nodes'))
];
if (roots.length === 0) {
	console.error('FAIL no roots under build/_app/immutable/{entry,nodes} — run pnpm build first');
	process.exit(1);
}

// 2. CLOSURE: the accessible static graph.
const accessible = closureOf(roots);

// 3. ASSERT A — zero WebGL signatures anywhere in the accessible graph (PREM-03 / A11Y-08).
const violations = [...accessible].filter((f) => SIG.test(readFileSync(f, 'utf8')));
if (violations.length > 0) {
	console.error('FAIL accessible graph contains WebGL runtime signatures:');
	for (const f of violations) console.error(`  ${rel(f)}`);
	process.exit(1);
}
console.log(`PASS accessible graph WebGL-free (${accessible.size} files)`);

// 4. PREMIUM SET: signature-matching chunks outside the closure, plus THEIR static closure
//    (minus anything the accessible graph already ships).
const allJs = jsFilesUnder(IMMUTABLE);
const premiumSeeds = allJs.filter((f) => !accessible.has(f) && SIG.test(readFileSync(f, 'utf8')));
if (premiumSeeds.length === 0) {
	console.error('FAIL premium graph not found — did the entry gate change?');
	process.exit(1);
}
const premium = closureOf(premiumSeeds, accessible);

// 5. BUDGET: gzip total over the premium graph, with a per-file table.
let total = 0;
const rows = [];
for (const f of [...premium].sort()) {
	const raw = readFileSync(f);
	const gz = gzipSync(raw).length;
	total += gz;
	rows.push({ file: rel(f), raw: raw.length, gzip: gz });
}
const w = Math.max(...rows.map((r) => r.file.length), 'file'.length);
console.log(`${'file'.padEnd(w)}  ${'raw'.padStart(9)}  ${'gzip'.padStart(9)}`);
for (const r of rows) {
	console.log(`${r.file.padEnd(w)}  ${String(r.raw).padStart(9)}  ${String(r.gzip).padStart(9)}`);
}
console.log(`${'TOTAL'.padEnd(w)}  ${''.padStart(9)}  ${String(total).padStart(9)}`);

if (total > BUDGET) {
	console.error(`FAIL premium graph ${total} bytes gzip > ${BUDGET} (over by ${total - BUDGET})`);
	process.exit(1);
}
console.log(`PASS premium graph ${premium.size} files, ${total} bytes gzip <= ${BUDGET}`);
