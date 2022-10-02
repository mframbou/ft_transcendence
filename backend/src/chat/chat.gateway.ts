import { SubscribeMessage, WebSocketGateway, OnGatewayDisconnect, OnGatewayConnection, WebSocketServer } from '@nestjs/websockets';
import { UseFilters, UseGuards } from '@nestjs/common';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';
import { EUserStatus, IJwtPayload, IWebsocketClient, IWsClient } from '../interfaces/interfaces';
import { AuthService } from '../auth/auth.service';
import { getCookie } from '../utils/utils';
import { WebsocketsService } from '../websockets/websockets.service';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';
import { WsFirstConnectDto } from '../interfaces/dtos';
import { WsAuthGuard } from '../auth/ws-auth.guard';
import { emit } from 'process';


const NAMESPACE = 'chat';

@WebSocketGateway(3001,{
	cors: {origin: '*'},
	namespace: NAMESPACE,
	transports: ['websocket'],
})
// @UseGuards(JwtTwoFactorAuthGuard)
export class ChatGateway implements OnGatewayDisconnect, OnGatewayConnection
{
	constructor(
			private authService: AuthService,
			private chatService: ChatService,
			private websocketsService: WebsocketsService,
	) {}

  	@WebSocketServer()
	server: Server;

	async handleConnection(client: any, ...args: any[])
	{
		const jwtPayload = await this.websocketsService.getFirstConnectionJwt(client);

		if (!jwtPayload)
		{
			client.disconnect();
			return;
		}

		this.websocketsService.addClient({id: client.id, login: jwtPayload.login, namespace: NAMESPACE});
		this.server.to(client.id).emit('confirmFirstConnect', {login: jwtPayload.login});
	}

	async handleDisconnect(client: any)
	{
		this.chatService.leave(this.server, client, null);
		this.websocketsService.removeClient(client.id);
	}

	@UseGuards(WsAuthGuard)
	@SubscribeMessage('message')
	async handleMessage(client: IWsClient, payload: any)
	{
		const user = client.transcendenceUser;
		console.log(`${NAMESPACE}-Gateway: ${user.login}: ${payload}`);

		this.chatService.handleMessage(this.server, client, payload.chatId, payload.content);
	}

	@UseGuards(WsAuthGuard)
	@SubscribeMessage('enter')
	async handleEnter(client: IWsClient, payload: any)
	{
		console.log("enter received");
		this.chatService.enter(this.server, client, payload);
	}

	@UseGuards(WsAuthGuard)
	@SubscribeMessage('leave')
	async handleLeave(client: IWsClient, payload: any)
	{
		console.log("leave received");
		//this.chatService.leave(this.server, client, payload);
	}
}