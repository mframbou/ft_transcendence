import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],

	chodikarWatchOptions: {
		usePolling: true // For hot reload on WSL
	},

	server: {
		watch: {
			usePolling: true
		},
		hmr: {
			host: 'localhost'
		}
	}
};

export default config;
