import { Injectable } from '@nestjs/common';
import { EUserStatus } from '../interfaces/interfaces';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from '@prisma/client';
import error_dispatcher from '../../src-sasso/error-dispatcher/error-dispatcher';

@Injectable()
export class StatusService {
	constructor(
			private prismaService: PrismaService,
	) {}

	async setStatus(login: string, status: EUserStatus)
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
				where: {login},
				data: {
					status: userStatus,
				},
			});
		}
		catch (e)
		{
			error_dispatcher(e);
		}
	}
}
