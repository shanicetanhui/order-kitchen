import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Using static adapter for Docker deployment with Nginx
		adapter: adapter({
			// Output to build directory for Docker
			pages: 'build',
			assets: 'build'
		})
	}
};

export default config;
