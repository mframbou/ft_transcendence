import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { IUser, IPublicUser } from "../interfaces/interfaces";
import errorDispatcher from "../utils/error-dispatcher";
import { UpdateUserDto } from './updateUser.dto';

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
					username: true,
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
					username: true,
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

		const isOwner: boolean = userData.login === 'sspina' || userData.login === 'dsamain' || userData.login === 'oronda' || userData.login === 'mframbou';

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

	async setOnlineStatus(login: string, isOnline: boolean) : Promise<IUser> {
		try
		{
			return await this.prismaService.user.update({
				where: {
					login: login,
				},
				data: {
					isOnline: isOnline,
				}
			});
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

	async updateUser(login: string, data: UpdateUserDto) : Promise<IUser> {

		const updateData = {};
		if (data.username)
			updateData['username'] = data.username;
		if (data.profilePicture)
			updateData['profilePicture'] = data.profilePicture;

		try
		{
			return await this.prismaService.user.update({
				where: {
					login: login,
				},
				data: updateData,
			});
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

}
