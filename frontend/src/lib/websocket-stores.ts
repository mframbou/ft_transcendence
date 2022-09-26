import { readable, writable } from 'svelte/store';
import { browser } from '$app/environment';
import ioClient, { Socket } from 'socket.io-client';
import { getCookie } from './utils';

const host = browser ? window.location.hostname : 'backend';

// Host:Port/Namespace, so here communicate on namespace status (but path / like all socketet)
// This means at the end there will only be one websocket (on path '/') listening on different namespaces to separate usages
const BASE_ENDPOINT = `http://${host}:3002`;

function waitForConnectionComplete(socket: Socket, timeout: number = 2000): Promise<Socket>
{
	return new Promise((resolve, reject) => {
		if (socket.connected)
			resolve(socket);

		socket.once('confirmFirstConnect', () => {
			resolve(socket);
		});

		socket.connect().emit('firstConnect', {cookie: getCookie('cockies')});

		setTimeout(() => {
			reject(`Timeout of ${timeout}ms reached while waiting for 'confirmFirstConnect' event`);
		}, timeout);
	});
}

// https://svelte.dev/tutorial/custom-stores
async function createWebsocket(namespace: string, timeout: number = 2000): Promise<Socket | null>
{
	// add / if not present
	if (namespace[0] !== '/')
		namespace = '/' + namespace;

	const endpoint = BASE_ENDPOINT + namespace;

	const socket: Socket = ioClient(endpoint, {
		autoConnect: false,
	});

	return await waitForConnectionComplete(socket, timeout);
}

function createWebsocketStore(namespace: string, timeout: number = 2000): { socket: any, connected: any } // Readable<> but not exported
{
	const socketStore = readable(null, set => {

		let socket: Socket | null = null;
		createWebsocket(namespace, timeout).then(sock => {
			socket = sock;
			set(sock);
			console.log(`Websocket '${namespace}' connected and confirmed`);
		}).catch(e => {
			console.error(`Failed to create websocket for '${namespace}': ${e}`);
			return { socket: null, connected: false };
		});

		return () => {
			if (socket)
				socket.disconnect();
		};
	});

	const connectedStore = readable(false, (set) => {
		socketStore.subscribe((socket) => {
			if (socket)
				set(true);
			else
				set(false);
		});
	});

	return { socket: socketStore, connected: connectedStore };
}

// If no await and await in component, it's not working, maybe because sveltekit doesn't like async stores or handle it yet
export const { socket: statusSocket, connected: statusSocketConnected } = createWebsocketStore('/status');
export const { socket: chatSocket, connected: chatSocketConnected } = createWebsocketStore('/chat');
export const { socket: pongSocket, connected: pongSocketConnected } = createWebsocketStore('/pong');