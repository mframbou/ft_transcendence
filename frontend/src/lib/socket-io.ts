import { browser } from '$app/environment';
import ioClient from 'socket.io-client';
import { getCookie } from '$lib/utils';

const host = browser ? window.location.hostname : 'backend';

// Host:Port/Namespace, so here communicate on namespace status (but path / like all socketet)
// This means at the end there will only be one websocket (on path '/') listening on different namespaces to separate usages
const BASE_ENDPOINT = `http://${host}:3002`;

const statusSocket = ioClient(BASE_ENDPOINT + '/status', {
	autoConnect: false,
});

const chatSocket = ioClient(BASE_ENDPOINT + '/chat', {
	autoConnect: true,
});

const pongSocket = ioClient(BASE_ENDPOINT + '/pong', {
   autoConnect: true,
});

statusSocket.on('connect', () => 
{
	statusSocket.emit('first_connect', getCookie('cockies'));
});

chatSocket.on('connect', () => 
{
	chatSocket.emit('first_connect', getCookie('cockies'));
});

pongSocket.on('connect', () => 
{
    pongSocket.emit('first_connect', getCookie('cockies'));
});


export { statusSocket, chatSocket, pongSocket };