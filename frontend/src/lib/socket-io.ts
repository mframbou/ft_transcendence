import ioClient from 'socket.io-client';
import { getBackendUrl } from "$lib/utils";

const ENDPOINT = getBackendUrl('');
const socket = ioClient(ENDPOINT);

socket.on('connect', () => {
	console.log("Connected to server");
	socket.emit('connection', "Hello from front");
});

export const io = socket;