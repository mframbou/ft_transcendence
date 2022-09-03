import ioClient from 'socket.io-client';
import { browser } from '$app/env';

const host = browser ? window.location.hostname : 'backend';

const ENDPOINT = `ws://${host}:3002`;

const socket = ioClient(ENDPOINT, {
	path: '/',
});

console.log('test');

socket.on('connect', () =>
{
	console.log('Connected to server');
	socket.emit('message', 'Hello from front');
});

socket.connect();

export const io = socket;