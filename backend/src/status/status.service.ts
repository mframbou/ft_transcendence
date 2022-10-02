import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { EUserStatus } from '../interfaces/interfaces';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from '@prisma/client';
import { Server } from 'socket.io';
import errorDispatcher from '../utils/error-dispatcher';
import { WsException } from '@nestjs/websockets'

@Injectable()
export class StatusService {
	constructor(
			private prismaService: PrismaService,
	) {}

	/**
	 * Set the status of a user, if server is provided, the new status will be emitted to all connected clients
	 */
	async setStatus(login: string, status: EUserStatus, server?: Server)
	{
		try
		{
			console.log(`Setting status of ${login} to ${status}`);

			let userStatus: Status;
			// console.log(status+  ' pouet pouet');
			switch (status)
			{
				case EUserStatus.ONLINE:
					userStatus = Status.ONLINE;
					break;
				case EUserStatus.OFFLINE:
					userStatus = Status.OFFLINE;
					break;
				case EUserStatus.IN_GAME:
					userStatus = Status.IN_GAME;
					break;
				default:
					throw new WsException(`Unknown status '${status}'`);
			}

			const userExists = await this.prismaService.user.findUnique({where: {login}});

			if (!userExists)
				throw new WsException(`User '${login}' doesn't exist`);

			// cause probelem if the db is reset and the user is still logged in
			await this.prismaService.user.update({
				where: {
					login: login
				},
				data: {
					status: userStatus,
				},
			});

			if (typeof server !== 'undefined')
			{
				// https://socket.io/docs/v3/emit-cheatsheet/
				server.emit('userStatusChanged', {
					login: login,
					status: status,
				});
			}
		}
		catch (e)
		{
			errorDispatcher(e, true);
		}
	}
}
