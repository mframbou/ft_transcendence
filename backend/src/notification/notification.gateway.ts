import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayDisconnect,
	OnGatewayConnection,
	WebSocketServer,
	WsException
} from '@nestjs/websockets';
import { getCookie } from '../utils/utils';
import { UseGuards } from '@nestjs/common';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';
import { AuthService } from '../auth/auth.service';
import { EUserStatus, IJwtPayload, IWebsocketClient, IWsClient } from '../interfaces/interfaces';
import { WebsocketsService } from '../websockets/websockets.service';
import { NotificationService } from './notification.service';
import { Server } from 'socket.io';
import { WsAcceptDuelDto, WsDuelDto, WsFirstConnectDto } from '../interfaces/dtos';
import { UsersService } from 'src/users/users.service';
import { InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { INotification } from '../interfaces/interfaces';
import { WsAuthGuard } from '../auth/ws-auth.guard';
import errorDispatcher from '../utils/error-dispatcher';
import { DuelService } from '../duel/duel.service';

const NAMESPACE = 'notification';

@WebSocketGateway(3001,{
	// Otherwise error 'gngngn has been blocked by CORS'
	cors: {origin: '*'},
	// path: '/', // Default path is already '/'
	namespace: NAMESPACE,
	transports: ['websocket'],
})
// https://docs.nestjs.com/websockets/gateways
export class NotificationGateway implements OnGatewayDisconnect, OnGatewayConnection
{

	constructor(
			private authService: AuthService,
			private websocketsService: WebsocketsService,
			private statusService: NotificationService,
			private usersService: UsersService,
			private prisma: PrismaService,
			private duelService: DuelService,
    ) {
        // export interface ICommand
        // {
	    //     command: string;
	    //     args: string[];
	    //     usage: string;
	    //     description: string;
	    //     function: any;
	    //     owner: boolean;	
	    //     admin: boolean;	
	    //     moderator: boolean;	
	    //     user: boolean;	
        // }
    }

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

		//await this.statusService.setStatus(jwtPayload.login, EUserStatus.ONLINE, this.server);
		this.websocketsService.addClient({id: client.id, login: jwtPayload.login, namespace: NAMESPACE});
		this.server.to(client.id).emit('confirmFirstConnect', {login: jwtPayload.login});
	}

	async handleDisconnect(client: any)
	{
		const clientToRemove: IWebsocketClient = this.websocketsService.getClient(client.id);
		if (!clientToRemove)
			return;

		//await this.statusService.setStatus(clientToRemove.login, EUserStatus.OFFLINE);
		this.websocketsService.removeClient(clientToRemove.id);
	}

    // send notification to login
    //async notify(login: string, service: string, title: string, content: string, senderLogin?: string, link?: string) {
    async notify(notif: INotification, login: string) {
        try {
            if (notif.senderLogin != undefined) {
                var sender = await this.usersService.getUser(notif.senderLogin);

                if (!sender) {
                    throw new InternalServerErrorException('User not found');
                }
            }

                const cur_notif = await this.prisma.notification.create({
                    data: {
                        senderId: (notif.senderLogin ? sender.id : null),
                        service: notif.service,
                        link: notif.link,
                        title: notif.title,
                        content: notif.content,
                    },
                    include: { sender: true, }

                });
            console.log("Notification created: ", cur_notif);

            const client = this.websocketsService.getClientsByLogin(login, 'notification');
            if (!client || !client.length) {
                console.log("Notification Gateway: ", "Client not found");
                return;
                //throw new InternalServerErrorException('client not found');
            }
            console.log("client : ", client);

            for (let i = 0; i < client.length; i++) {
                this.server.to(client[i].id).emit('notification', cur_notif);
            }

            
        }
        catch (e) {
            console.log("Error in notify: ", e);
        } 
    }
}