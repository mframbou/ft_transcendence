import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';

@WebSocketGateway(3001,{
	// To avoid 'access to XMLHttpRequest at 'http://med:3000/socket.io/?EIO=4&transport=polling&t=OBWHsJr' from origin 'http://med:3001' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.'
	path: '/',
	// namespace: 'ws',
	cors: {origin: '*'},
})
// https://docs.nestjs.com/websockets/gateways
export class AppGateway
{
	handleConnection(client: any, ...args: any[]): any
	{
		console.log("New client: " + client.id);
	}

	handleDisconnect(client: any): any
	{
		console.log("Client disconnected: " + client.id);
	}

	@SubscribeMessage('message')
	handleMessage(client: any, payload: any): string
	{
		console.log('received msg: ', payload);
		return 'Hello world!';
	}

}
