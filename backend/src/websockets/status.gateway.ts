import { SubscribeMessage, WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { getCookie } from '../utils/utils';
import { UseGuards } from '@nestjs/common';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';
import { AuthService } from '../auth/auth.service';
import { IJwtPayload, IWebsocketClient } from '../interfaces/interfaces';
import { WebsocketsService } from './websockets.service';


const NAMESPACE = 'status';

@WebSocketGateway(3001,{
	// Otherwise error 'gngngn has been blocked by CORS'
	cors: {credentials: true, origin: `http://${process.env.SERVER_NAME}:3001`},
	// path: '/', // Default path is already '/'
	namespace: NAMESPACE,
})
// https://docs.nestjs.com/websockets/gateways
export class StatusGateway
{
	constructor(
			private authService: AuthService,
			private websocketsService: WebsocketsService,
	) {}

	// Only on connection because its the only time cookies are sent
	@UseGuards(JwtTwoFactorAuthGuard)
	async handleConnection(client: any, ...args: any[])
	{
		const jwtPayload: IJwtPayload = await this.authService.getJwtFromCookie(getCookie('cockies', client.handshake.headers.cookie));

		console.log(`${jwtPayload.login} is now online`);

		this.websocketsService.addClient({id: client.id, login: jwtPayload.login, namespace: NAMESPACE});
	}

	@UseGuards() // just bcause otherwise webstorm says unused and might remove on code cleanup
	async handleDisconnect(client: any)
	{
		const disconnectAt = new Date();
		await new Promise(resolve => setTimeout(resolve, 1000));

		const clientToRemove: IWebsocketClient = this.websocketsService.getClient(client.id);
		console.log(`${clientToRemove.login} is now offline`);

		this.websocketsService.removeClient(client.id);
	}

}
