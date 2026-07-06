// Foreground × background pairs manifest with the required WCAG 2.2 AA level.
// scripts/check-contrast.mjs asserts each pair meets its threshold against colors.ts.
// NOTE: the palette reference below is TYPE-ONLY (`keyof typeof import('./colors').palette`)
// and is fully erased at build. Do NOT add a runtime `import { palette } from './colors'`
// here — check-contrast.mjs loads this file via Node type-stripping, which requires an
// explicit `.ts` extension on runtime imports, so an extensionless runtime import crashes it.
export type Level = 'AA-normal' | 'AA-large' | 'AA-ui';

export const pairs: {
	name: string;
	fg: keyof typeof import('./colors').palette;
	bg: keyof typeof import('./colors').palette;
	level: Level;
}[] = [
	{ name: 'body text on white', fg: 'ink', bg: 'white', level: 'AA-normal' }, // 17.85
	{ name: 'primary link on white', fg: 'blue900', bg: 'white', level: 'AA-normal' }, // 14.54
	{ name: 'heading on white', fg: 'blue900', bg: 'white', level: 'AA-large' }, // 14.54
	{ name: 'button label on orange', fg: 'ink', bg: 'orange500', level: 'AA-normal' }, // 5.86
	{ name: 'focus ring vs white', fg: 'blue900', bg: 'white', level: 'AA-ui' }, // 14.54
	{ name: 'orange UI border vs white', fg: 'orangeDeep', bg: 'white', level: 'AA-ui' }, // 4.12
	{ name: 'body text on premium dark surface', fg: 'white', bg: 'blue900', level: 'AA-normal' }, // 14.54
	{ name: 'link/accent on premium dark surface', fg: 'orange500', bg: 'blue900', level: 'AA-normal' }, // 4.77
	{ name: 'body text on night scrim', fg: 'white', bg: 'night', level: 'AA-normal' }, // 17.17
	{ name: 'link/accent on night scrim', fg: 'orange500', bg: 'night', level: 'AA-normal' }, // 5.63
	{ name: 'orange-deep border on premium dark surface', fg: 'orangeDeep', bg: 'blue900', level: 'AA-ui' }, // 3.53
	{ name: 'focus ring vs premium dark surface', fg: 'white', bg: 'blue900', level: 'AA-ui' } // 14.54
];
