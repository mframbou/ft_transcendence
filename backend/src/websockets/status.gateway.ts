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
	cors: {credentials: true, origin: '*'}, // origin will be modified by nginx proxy anyways
	// cors: {origin: '*'},
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
	// @UseGuards(JwtTwoFactorAuthGuard)
	async handleConnection(client: any, ...args: any[])
	{
		console.log("new client" + JSON.stringify(client.handshake.headers, null, 2));
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

		console.log(`${jwtPayload.login} is now online`);

		this.websocketsService.addClient({id: client.id, login: jwtPayload.login, namespace: NAMESPACE});
	}

	@UseGuards() // just bcause otherwise webstorm says unused and might remove on code cleanup
	async handleDisconnect(client: any)
	{
		const clientToRemove: IWebsocketClient = this.websocketsService.getClient(client.id);
		console.log(`${clientToRemove.login} is now offline`);

		this.websocketsService.removeClient(client.id);
	}

}
