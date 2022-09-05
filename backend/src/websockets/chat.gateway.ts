import { SubscribeMessage, WebSocketGateway, OnGatewayDisconnect } from '@nestjs/websockets';
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
export class ChatGateway implements OnGatewayDisconnect
{
	constructor(
			private authService: AuthService,
			private websocketsService: WebsocketsService,
	) {}

	@SubscribeMessage('first_connect')
	async handleFirstConnect(client: any, payload: any)
	{
		if (!payload)
		{
			client.disconnect();
			return;
		}

		const jwtPayload: IJwtPayload = await this.authService.getJwtFromCookie(payload);

		this.websocketsService.addClient({id: client.id, login: jwtPayload.login, namespace: NAMESPACE});
	}

	async handleDisconnect(client: any)
	{
		const clientToRemove: IWebsocketClient = this.websocketsService.getClient(client.id);
		if (!clientToRemove)
			return;

		this.websocketsService.removeClient(client.id);
	}

	@SubscribeMessage('message')
	async handleMessage(client: any, payload: any)
	{
		const user = this.websocketsService.getClient(client.id);
		console.log(`${NAMESPACE}-Gateway: ${user.login}: ${payload}`);
	}
}