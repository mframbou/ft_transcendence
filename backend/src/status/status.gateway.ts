import { SubscribeMessage, WebSocketGateway, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { getCookie } from '../utils/utils';
import { UseGuards } from '@nestjs/common';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';
import { AuthService } from '../auth/auth.service';
import { EUserStatus, IJwtPayload, IWebsocketClient } from '../interfaces/interfaces';
import { WebsocketsService } from '../websockets/websockets.service';
import { StatusService } from './status.service';
import { Server } from 'socket.io';
import { WsFirstConnectDto } from '../interfaces/dtos';


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
			private statusService: StatusService,
	) {}

	@WebSocketServer()
	server: Server;


	@SubscribeMessage('firstConnect')
	async handleFirstConnect(client: any, payload: WsFirstConnectDto)
	{
		const jwtPayload: IJwtPayload = await this.authService.getJwtFromCookie(payload.cookie);
		if (!jwtPayload)
		{
			client.disconnect();
			return;
		}

		await this.statusService.setStatus(jwtPayload.login, EUserStatus.ONLINE, this.server);
		this.websocketsService.addClient({id: client.id, login: jwtPayload.login, namespace: NAMESPACE});
		this.server.to(client.id).emit('confirmFirstConnect', {login: jwtPayload.login});
	}

	@SubscribeMessage('test')
	async test(client: any, payload: any)
	{
		console.log('test ' + JSON.stringify(payload));
	}

	async handleDisconnect(client: any)
	{
		const clientToRemove: IWebsocketClient = this.websocketsService.getClient(client.id);
		if (!clientToRemove)
			return;

		await this.statusService.setStatus(clientToRemove.login, EUserStatus.OFFLINE);
		this.websocketsService.removeClient(clientToRemove.id);
	}
}
