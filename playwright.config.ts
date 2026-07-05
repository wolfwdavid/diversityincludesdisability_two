import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'pnpm run build && pnpm run preview',
		port: 4173,
		env: { BASE_PATH: '/diversityincludesdisability_two' }
	},
	testMatch: '**/*.e2e.{ts,js}'
});
