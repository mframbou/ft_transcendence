import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';

@WebSocketGateway(3001,{
	cors: {origin: '*'},
	namespace: 'chat',
})

// @UseGuards(JwtTwoFactorAuthGuard)
export class ChatGateway
{

	@UseGuards(JwtTwoFactorAuthGuard)
	handleConnection(client: any, ...args: any[]): any
	{
		console.log("New chat client:          " + client.id);
	}

	handleDisconnect(client: any): any
	{
		console.log("Client chat disconnected: " + client.id);
	}

	@SubscribeMessage('message')
	handleMessage(client: any, payload: any): string
	{
		console.log('received chat msg from ', client.id);
		return 'Hello world!';
	}
}
