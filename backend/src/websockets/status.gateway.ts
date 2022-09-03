import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { getCookie } from '../utils/utils';
import { UseGuards } from '@nestjs/common';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';

@WebSocketGateway(3001,{
	// Otherwise error 'gngngn has been blocked by CORS'
	cors: {credentials: true, origin: `http://${process.env.SERVER_NAME}:3001`},
	// path: '/', // Default path is already '/'
	namespace: 'status',
})
// https://docs.nestjs.com/websockets/gateways
export class StatusGateway
{

	// Only on connection because its the only time cookies are sent
	@UseGuards(JwtTwoFactorAuthGuard)
	handleConnection(client: any, ...args: any[]): any
	{
		const jwtCookie = getCookie('cockies', client.handshake.headers.cookie);
		console.log(jwtCookie);

		console.log("New client:          " + client.id);
	}

	handleDisconnect(client: any): any
	{
		console.log("Client disconnected: " + client.id);
	}

	@SubscribeMessage('message')
	handleMessage(client: any, payload: any): string
	{
		console.log('received msg from ', client.id);
		return 'Hello world!';
	}
}
