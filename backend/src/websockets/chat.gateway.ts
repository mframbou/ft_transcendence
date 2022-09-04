import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';
import { IJwtPayload, IWebsocketClient } from '../interfaces/interfaces';
import { AuthService } from '../auth/auth.service';
import { getCookie } from '../utils/utils';
import { WebsocketsService } from './websockets.service';


const NAMESPACE = 'chat';


@WebSocketGateway(3001,{
	cors: {origin: '*'},
	namespace: NAMESPACE,
})
// @UseGuards(JwtTwoFactorAuthGuard)
export class ChatGateway
{

	constructor(
			private authService: AuthService,
			private websocketsService: WebsocketsService,
	) {}

	@UseGuards(JwtTwoFactorAuthGuard)
	async handleConnection(client: any, ...args: any[])
	{
		if (!client.handshake.headers.cookie)
		{
			client.disconnect();
			return;
		}

		let jwtPayload: IJwtPayload = null;
		try
		{
			jwtPayload = await this.authService.getJwtFromCookie(getCookie('cockies', client.handshake.headers.cookie));
		}
		catch (e)
		{
			console.log(e);
			client.disconnect();
			return;
		}

		this.websocketsService.addClient({id: client.id, login: jwtPayload.login, namespace: NAMESPACE});
	}

	@UseGuards() // just bcause otherwise webstorm says unused and might remove on code cleanup
	handleDisconnect(client: any): any
	{
		this.websocketsService.removeClient(client.id);
	}

	@SubscribeMessage('message')
	handleMessage(client: any, payload: any): string
	{
		const user: IWebsocketClient = this.websocketsService.getClient(client.id);

		console.log('received msg from ', user.login + ':', payload);
		return 'Hello world!';
	}
}
