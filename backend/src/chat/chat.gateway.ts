import { SubscribeMessage, WebSocketGateway, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';
import { IJwtPayload, IWebsocketClient, IWsClient } from '../interfaces/interfaces';
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
})
// @UseGuards(JwtTwoFactorAuthGuard)
export class ChatGateway implements OnGatewayDisconnect
{
	constructor(
			private authService: AuthService,
			private chatService: ChatService,
			private websocketsService: WebsocketsService,
	) {}

  	@WebSocketServer()
	server: Server;

	@SubscribeMessage('first_connect')
	async handleFirstConnect(client: any, payload: WsFirstConnectDto)
	{
		const jwtPayload: IJwtPayload = await this.authService.getJwtFromCookie(payload.cookie);
		if (!jwtPayload)
		{
			client.disconnect();
			return;
		}

		this.websocketsService.addClient({id: client.id, login: jwtPayload.login, namespace: NAMESPACE});
	}

	async handleDisconnect(client: any)
	{
		this.websocketsService.removeClient(client.id);
	}

	@UseGuards(WsAuthGuard)
	@SubscribeMessage('message')
	async handleMessage(client: IWsClient, payload: any)
	{
		const user = client.transcendenceUser;
		console.log(`${NAMESPACE}-Gateway: ${user.login}: ${payload}`);
	}
}