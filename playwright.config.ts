import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'pnpm run build && pnpm run preview',
		port: 4173,
		// Reuse a preview already listening on 4173 instead of erroring. Locally this lets
		// a manually-started `pnpm run preview` back the suite (and sidesteps a Windows
		// SIGTERM teardown hang); when no server is up, Playwright still builds+previews.
		reuseExistingServer: true,
		env: { BASE_PATH: '/diversityincludesdisability_two' }
	},
	testMatch: '**/*.e2e.{ts,js}'
});
