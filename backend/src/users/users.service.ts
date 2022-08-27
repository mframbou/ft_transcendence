import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { IUser, IPublicUser } from "../interfaces/interfaces";
import errorDispatcher from "../utils/error-dispatcher";

@Injectable()
export class UsersService
{
	constructor(private prismaService: PrismaService) {}

	async getUser(login: string) : Promise<IUser> {
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

	async getUsers() : Promise<IUser[]> {
		try
		{
			return await this.prismaService.user.findMany();
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

	async getPublicUser(login: string) : Promise<IPublicUser> {
		try
		{
			return await this.prismaService.user.findUnique({
				where: {
					login: login,
				},
				select: {
					login: true,
					userName: true,
					profilePicture: true,
					campus: true,
					wins: true,
					loses: true,
					elo: true,
					isOwner: true,
					isAdmin: true,
					isOnline: true,
				}
			});
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

	async getPublicUsers() : Promise<IPublicUser[]> {
		try
		{
			return await this.prismaService.user.findMany({
				select: {
					login: true,
					userName: true,
					profilePicture: true,
					campus: true,
					wins: true,
					loses: true,
					elo: true,
					isOwner: true,
					isAdmin: true,
					isOnline: true,
				}
			});
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

	async addUser(userData: any) : Promise<IUser> {
		try
		{
			return await this.prismaService.user.create({
				data: {
					email: userData.email,
					phone: userData.phone,
					profilePicture: userData.image_url,
					firstName: userData.first_name,
					lastName: userData.last_name,
					userName: `${userData.login}_${String(Date.now())}`,
					login: userData.login,
					campus: userData.campus[0].name
				},
			});
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

}
