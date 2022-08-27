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
		watch: {
			usePolling: true
		},
		hmr: {
			host: 'localhost'
		}
	}
};

export default config;
