import { browser } from '$app/environment';
import ioClient from 'socket.io-client';


const host = window.location.hostname;

// Host:Port/Namespace, so here communicate on namespace status (but path / like all socketet)
// This means at the end there will only be one websocket (on path '/') listening on different namespaces to separate usages
const BASE_ENDPOINT = `ws://${host}:3005/websocket`;

const statusSocket = ioClient(BASE_ENDPOINT + '/status', {
	withCredentials: true,
});

statusSocket.on('connect', () => {
	console.log("Connect error ");
});

const chatSocket = ioClient('/chat', {
	withCredentials: true,
});

export { statusSocket, chatSocket };