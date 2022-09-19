import { Injectable, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import errorDispatcher from '../utils/error-dispatcher';

@Injectable()
export class PermissionsService {

	constructor(
			private prismaService: PrismaService,
			private jwtService: JwtService,
	) {}

	async isOwner(login: string): Promise<boolean> {
		try
		{
			const user = await this.prismaService.user.findUnique({
				where: {
					login: login
				},
			});

			if (!user)
				return false;

			return user.isOwner;
		}
		catch (e: any) {
			errorDispatcher(e);
		}
		return false;
	}

	async isAdmin(login: string): Promise<boolean>
	{
		try
		{
			const user = await this.prismaService.user.findUnique({
				where: {
					login: login
				},
			});

			if (!user)
				return false;

			return user.isAdmin;
		}
		catch (e: any)
		{
			errorDispatcher(e);
		}
		return false;
	}

}
