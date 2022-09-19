import { Injectable } from '@nestjs/common';
import { EUserStatus } from '../interfaces/interfaces';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from '@prisma/client';
import error_dispatcher from '../../src-sasso/error-dispatcher/error-dispatcher';
import { Server } from 'socket.io';

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
			let userStatus: Status;
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
					throw new Error(`Unknown status '${status}'`);
			}

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
			error_dispatcher(e);
		}
	}
}
