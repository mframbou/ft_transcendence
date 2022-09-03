import { sveltekit } from '@sveltejs/kit/vite';
import {Server} from "socket.io";

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [
		sveltekit(),

		// https://linu.us/live-chat-with-sveltekit-and-socketio
		{
			name: 'sveltekit-socket-io',
			configureServer(server) {
				const io = new Server(server.httpServer);

				// Socket.IO stuff goes here
				console.log('SocketIO injected');
			}
		}
	],

	chodikarWatchOptions: {
		usePolling: true // For hot reload on WSL
	},

	server: {
		// https://github.com/http-party/node-http-proxy#options
		// Cannot rewrite path (/api => /) see https://github.com/http-party/node-http-proxy/issues/1022
		proxy: {
			'/api': {
				target: 'http://backend:3000',
				changeOrigin: false,
				secure: false,
				ws: false,
				rewrite: (path) => {
					return path.replace('/api', '');
				},
				// autoRewrite: true // rewrite host:port on redirections
			},
		},

		pouet: {

		},

		watch: {
			usePolling: true,
		},
		hmr: {
			host: 'localhost'
		}
	}
};

export default config;
