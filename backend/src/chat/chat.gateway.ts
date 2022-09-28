import { SubscribeMessage, WebSocketGateway, OnGatewayDisconnect, OnGatewayConnection, WebSocketServer } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';
import { EUserStatus, IJwtPayload, IWebsocketClient, IWsClient } from '../interfaces/interfaces';
import { AuthService } from '../auth/auth.service';
import { getCookie } from '../utils/utils';
import { WebsocketsService } from '../websockets/websockets.service';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';
import { WsFirstConnectDto } from '../interfaces/dtos';
import { WsAuthGuard } from '../auth/ws-auth.guard';


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
		this.websocketsService.removeClient(client.id);
	}

	@UseGuards(WsAuthGuard)
	@SubscribeMessage('message')
	async handleMessage(client: IWsClient, payload: any)
	{
		console.log("message received");
		const user = client.transcendenceUser;
		//console.log(`${NAMESPACE}-Gateway: ${user.login}: ${payload}`);
		console.log("user : " + JSON.stringify(user));
		console.log("payload : ", payload);
		//console.log("client : ", client);
		this.chatService.addMessage(this.server, payload.chatId, payload.userId, payload.content);
		//this.server.to(client.id).emit('receiveMessage', payload.content);
	}
}