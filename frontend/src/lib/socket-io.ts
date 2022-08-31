import ioClient from 'socket.io-client';

const ENDPOINT = '/api';
const socket = ioClient(ENDPOINT);

socket.on('connect', () =>
{
	console.log('Connected to server');
	socket.emit('connection', 'Hello from front');
});

export const io = socket;