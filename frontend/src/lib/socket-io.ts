import ioClient from 'socket.io-client';
import { browser } from '$app/env';


const hostname = browser ? window.location.hostname : {host: 'localhost:3000'};
const ENDPOINT = `http://${hostname}:3000`;
const socket = ioClient(ENDPOINT);

socket.on('connect', () => {
	console.log("Connected to server");
	socket.emit('connection', "Hello from front");
});

export const io = socket;