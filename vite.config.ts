import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { searchForWorkspaceRoot } from 'vite'

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		fs: {
			allow: [
				searchForWorkspaceRoot(process.cwd())
			]
		}
	},
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node',
		silent: 'passed-only',
		globalSetup: './vitest.setup.ts',
		setupFiles: './vitest.worker.ts',
		maxWorkers: 8
	}
});
