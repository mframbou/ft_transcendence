import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { IUser, IPublicUser, ISelfUser } from '../interfaces/interfaces';
import errorDispatcher from '../utils/error-dispatcher';
import { UpdateUserDto } from '../interfaces/dtos';

@Injectable()
export class UsersService
{
	constructor(
			private prismaService: PrismaService
	) {}

	async getUser(login: string): Promise<IUser>
	{
		try
		{
			return await this.prismaService.user.findUnique({
				where: {
					login: login,
				},
			});
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

	async getUsers(): Promise<IUser[]>
	{
		try
		{
			return await this.prismaService.user.findMany();
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

	async getPublicUser(login: string): Promise<IPublicUser>
	{
		try
		{
			return await this.prismaService.user.findUnique({
				where: {
					login: login,
				},
				select: {
					login: true,
					username: true,
					profilePicture: true,
					campus: true,
					wins: true,
					losses: true,
					elo: true,
					isOwner: true,
					isAdmin: true,
					status: true,
				}
			});
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

	async getSelfUser(login: string): Promise<ISelfUser>
	{
		try
		{
			return await this.prismaService.user.findUnique({
				where: {
					login: login,
				},
				select: {
					id: true, // I need the id for chat until a find another way
					login: true,
					username: true,
					profilePicture: true,
					campus: true,
					wins: true,
					losses: true,
					elo: true,
					isOwner: true,
					isAdmin: true,
					twoFactorEnabled: true,
					status: true,
					blockedUsers: true,
					blockingUsers: true,
				}
			});
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

	async getPublicUsers(): Promise<IPublicUser[]>
	{
		try
		{
			return await this.prismaService.user.findMany({
				select: {
					login: true,
					username: true,
					profilePicture: true,
					campus: true,
					wins: true,
					losses: true,
					elo: true,
					isOwner: true,
					isAdmin: true,
					status: true,
				}
			});
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

	async addUser(userData: any): Promise<IUser>
	{
		const isOwner = userData.login === 'sspina' || userData.login === 'dsamain' || userData.login === 'oronda' || userData.login === 'mframbou';

		if (isOwner)
			console.log(`Hello master ${userData.login} UwU`);

		try
		{
			return await this.prismaService.user.create({
				data: {
					login: userData.login,
					email: userData.email,
					phone: userData.phone,
					profilePicture: userData.image_url,
					firstName: userData.first_name,
					lastName: userData.last_name,
					username: `XxX_${userData.login}_xXx`,
					campus: userData.campus[0].name,
					isOwner: isOwner,
					isAdmin: isOwner,
				},
			});
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

	async updateUser(login: string, data: UpdateUserDto): Promise<ISelfUser>
	{
		try
		{
			console.log(data);

			if (typeof(data.username) !== 'undefined')
			{
				const userWithSameUsername = await this.prismaService.user.findUnique({
					where: {
						username: data.username,
					},
				});

				if (userWithSameUsername && userWithSameUsername.login !== login)
					throw new UnprocessableEntityException('Username already taken');
			}

			return await this.prismaService.user.update({
				where: {
					login: login,
				},
				include: {
					blockedUsers: true,
					blockingUsers: true,
				},
				data: data,
			});
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

}
