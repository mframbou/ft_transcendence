import { readable, writable } from 'svelte/store';
import { browser } from '$app/environment';
import ioClient, { Socket } from 'socket.io-client';
import { getCookie } from './utils';

const host = browser ? window.location.hostname : 'backend';

// Host:Port/Namespace, so here communicate on namespace status (but path / like all socketet)
// This means at the end there will only be one websocket (on path '/') listening on different namespaces to separate usages
const BASE_ENDPOINT = `http://${host}:3002`;

function waitForConnectionComplete(socket: Socket, namespace: string = '', timeout: number = 2000): Promise<Socket>
{
	return new Promise((resolve, reject) => {
		if (socket.connected)
			resolve(socket);

		socket.once('confirmFirstConnect', () => {
			console.log(`first connect on ${namespace} confirmed`);
			resolve(socket);
		});

		socket.connect().emit('firstConnect', {cookie: getCookie('cockies')});

		setTimeout(() => {
			reject(`Timeout of ${timeout}ms reached while waiting for 'confirmFirstConnect' event`);
		}, timeout);
	});
}

// https://svelte.dev/tutorial/custom-stores
async function createWebsocket(namespace: string): Promise<Socket | null>
{
	// add / if not present
	if (namespace[0] !== '/')
		namespace = '/' + namespace;

	const endpoint = BASE_ENDPOINT + namespace;

	const socket: Socket = ioClient(endpoint, {
		autoConnect: false,
	});

	return await waitForConnectionComplete(socket, namespace);
}

function createWebsocketStore(namespace: string)
{
	const socketStore = readable(null, set => {
		let socket: Socket | null = null;
		createWebsocket(namespace).then(s => {
			socket = s;
			set(s);
		}).catch(e => {
			console.error(`Failed to create websocket for '${namespace}': ${e}`);
		});

		return () => {
			if (socket)
				socket.disconnect();
		};
	});

	return socketStore;
	// try
	// {
	// 	// const socket = await createWebsocket(namespace);
	// 	const socketStore = readable(socket, (set) =>
	// 	{
	//
	// 		//createWebsocket
	// 		const socket = await createWebsocket(namespace);
	//
	// 		return () =>
	// 		{
	// 			if (socket)
	// 				socket.disconnect();
	// 		};
	// 	});
	//
	// 	console.log(`created websocket store for namespace ${namespace}`);
	// 	return socketStore;
	// }
	// catch (e)
	// {
	// 	console.error(`Failed to create websocket store for namespace '${namespace}': `, e);
	// 	return null;
	// }
}

// If no await and await in component, it's not working, maybe because sveltekit doesn't like async stores or handle it yet
export const statusSocket = createWebsocketStore('/status');
export const chatSocket = createWebsocketStore('/chat');
export const pongSocket = createWebsocketStore('/pong');