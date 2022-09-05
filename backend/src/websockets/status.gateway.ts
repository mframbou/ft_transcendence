import { SubscribeMessage, WebSocketGateway, OnGatewayDisconnect } from '@nestjs/websockets';
import { getCookie } from '../utils/utils';
import { UseGuards } from '@nestjs/common';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';
import { AuthService } from '../auth/auth.service';
import { IJwtPayload, IWebsocketClient } from '../interfaces/interfaces';
import { WebsocketsService } from './websockets.service';


const NAMESPACE = 'status';

@WebSocketGateway(3001,{
	// Otherwise error 'gngngn has been blocked by CORS'
	cors: {origin: '*'},
	// path: '/', // Default path is already '/'
	namespace: NAMESPACE,
})
// https://docs.nestjs.com/websockets/gateways
export class StatusGateway implements OnGatewayDisconnect
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

}
