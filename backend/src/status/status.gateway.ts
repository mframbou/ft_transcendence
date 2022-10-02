import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayDisconnect,
	OnGatewayConnection,
	WebSocketServer,
	WsException
} from '@nestjs/websockets';
import { getCookie } from '../utils/utils';
import { UseFilters, UseGuards } from '@nestjs/common';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';
import { AuthService } from '../auth/auth.service';
import { EUserStatus, IJwtPayload, IWebsocketClient } from '../interfaces/interfaces';
import { WebsocketsService } from '../websockets/websockets.service';
import { StatusService } from './status.service';
import { Server, Socket } from 'socket.io';
import { WsFirstConnectDto } from '../interfaces/dtos';

const NAMESPACE = 'status';

@WebSocketGateway(3001,{
	// Otherwise error 'gngngn has been blocked by CORS'
	cors: {origin: '*'},
	// path: '/', // Default path is already '/'
	namespace: NAMESPACE,
	transports: ['websocket'],
})
// https://docs.nestjs.com/websockets/gateways
export class StatusGateway implements OnGatewayDisconnect, OnGatewayConnection
{
	constructor(
			private authService: AuthService,
			private websocketsService: WebsocketsService,
			private statusService: StatusService,
	) {}

	@WebSocketServer()
	server: Server;


	async handleConnection(client: Socket, ...args: any[])
	{
		const jwtPayload = await this.websocketsService.getFirstConnectionJwt(client);

		if (!jwtPayload)
		{
			client.disconnect();
			return;
		}

		this.websocketsService.addClient({id: client.id, login: jwtPayload.login, namespace: NAMESPACE});
		this.server.to(client.id).emit('confirmFirstConnect', {login: jwtPayload.login});

		// forced to try catch and disconnect because handleConnection doesn't supports guards
		try
		{
			await this.statusService.setStatus(jwtPayload.login, EUserStatus.ONLINE, this.server);
		}
		catch (e)
		{
			console.log('client couldn\'t be set online, sending disconnect');
			client.emit('wrongToken');
			client.disconnect();
		}
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
