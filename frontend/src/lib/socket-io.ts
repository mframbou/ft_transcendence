import ioClient from 'socket.io-client';
import { browser } from '$app/env';

const host = browser ? window.location.hostname : 'backend';

// Host:Port/Namespace, so here communicate on namespace status (but path / like all socketet)
// This means at the end there will only be one websocket (on path '/') listening on different namespaces to separate usages
const BASE_ENDPOINT = `ws://${host}:3002`;

const statusSocket = ioClient(BASE_ENDPOINT + '/status', {
	withCredentials: true,
});

const chatSocket = ioClient(BASE_ENDPOINT + '/chat');


statusSocket.on('connect', () =>
{
	statusSocket.emit('')
	console.log('connected to status socket');
});

// socket.on('connect', () =>
// {
// 	console.log('Connected to server');
// 	socket.emit('message', 'Hello from front');
// });


export const io = statusSocket;