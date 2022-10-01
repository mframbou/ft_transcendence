import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EUserStatus } from '../interfaces/interfaces';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from '@prisma/client';
import { Server } from 'socket.io';
import errorDispatcher from '../utils/error-dispatcher';
import { WebsocketsService } from 'src/websockets/websockets.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class NotificationService {
	constructor(
			private prisma: PrismaService,
            private webSocketsService: WebsocketsService,
            private userService: UsersService,
    ) {}


//model Notification {
	//id			Int		@default(autoincrement()) @id

	//user		User?	@relation(fields: [userId], references: [id])
	//userID		Int?

	//service		String	// chat, match, friend, etc 
	//link		String?	// link to the service (goto(link))
	//title		String	// title of the notification
	//content		String	// content of the notification
//}

}