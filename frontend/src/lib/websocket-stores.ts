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
function createWebsocket(namespace: string): Socket
{
	// add / if not present
	if (namespace[0] !== '/')
		namespace = '/' + namespace;

	const endpoint = BASE_ENDPOINT + namespace;

	const socket: Socket = ioClient(endpoint, {
		autoConnect: false,
	});

	return socket;
}

function createWebsocketStore(namespace: string, timeout: number = 2000): { socket: any, connected: any } // Readable<> but not exported
{
	const socket: Socket = createWebsocket(namespace);
	const connectedStoreWritable = writable(false);

	const socketStore = readable(socket, set => {
		waitForConnectionComplete(socket, timeout).then(() => {
			console.log(`Websocket '${namespace}' connected and confirmed`);
			connectedStoreWritable.set(true);
		}).catch((err) => {
			console.error(`Failed to connect websocket for '${namespace}': ${err}`);
			connectedStoreWritable.set(false);
		});

		socket.on('disconnect', (reason) => {
			connectedStoreWritable.set(false);
		});

		return () => {
			if (socket)
				socket.disconnect();
		};
	});

	const connectedStore = readable(false, (set) => {
		connectedStoreWritable.subscribe((value) => {
			set(value);
		});
	});

	return { socket: socketStore, connected: connectedStore };
}

// Socket is always available, but connected is true only if connection is complete and first_connect event was sent and confirmed
export const { socket: statusSocket, connected: statusSocketConnected } = createWebsocketStore('/status');
export const { socket: chatSocket, connected: chatSocketConnected } = createWebsocketStore('/chat');
export const { socket: pongSocket, connected: pongSocketConnected } = createWebsocketStore('/pong');