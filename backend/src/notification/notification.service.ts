import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EUserStatus } from '../interfaces/interfaces';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from '@prisma/client';
import { Server } from 'socket.io';
import errorDispatcher from '../utils/error-dispatcher';

@Injectable()
export class NotificationService {
	constructor(
			private prismaService: PrismaService,
	) {}

	/**
	 * Set the status of a user, if server is provided, the new status will be emitted to all connected clients
	 */
}