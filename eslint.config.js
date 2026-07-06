import prettier from 'eslint-config-prettier';
import path from 'node:path';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser
			}
		}
	},
	{
		// Architecture invariant (Phases 1–5): nothing may import from $lib/premium/* —
		// STATIC (no-restricted-imports) or DYNAMIC (no-restricted-syntax; core
		// no-restricted-imports is blind to import() — research-verified) — keeping the
		// Accessible bundle at zero WebGL bytes (PREM-03). The SINGLE sanctioned crossing
		// is the dynamic-import entry gate in src/routes/+layout.svelte, which carries a
		// scoped `eslint-disable-next-line no-restricted-syntax` (added in 05-03).
		files: ['**/*.ts', '**/*.js', '**/*.mjs', '**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: ['$lib/premium/*', '**/lib/premium/*']
				}
			],
			'no-restricted-syntax': [
				'error',
				{
					selector: 'ImportExpression > Literal[value=/premium/]',
					message:
						'Dynamic import of $lib/premium/* is only allowed at the single layout entry gate (PREM-03).'
				}
			]
		}
	}
);
