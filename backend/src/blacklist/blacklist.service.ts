import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { FriendsService } from '../friends/friends.service';
import errorDispatcher from '../utils/error-dispatcher';
import { IPublicUser } from '../interfaces/interfaces';

@Injectable()
export class BlacklistService {

	// https://docs.nestjs.com/fundamentals/circular-dependency
	constructor(
			@Inject(forwardRef(() => FriendsService))
			private friendsService: FriendsService,
			private prismaService: PrismaService,
			private usersService: UsersService,
	) {}

	async blockUser(userLogin: string, blockedLogin: string)
	{
		if (userLogin === blockedLogin)
		{
			throw new BadRequestException('You cannot block yourself');
		}

		try
		{
			const blockedUser = await this.usersService.getUser(blockedLogin);
			if (!blockedUser)
				throw new NotFoundException(`User with login ${blockedLogin} not found`);

			const user = await this.usersService.getUser(userLogin);
			if (!user)
				throw new NotFoundException(`User with login ${userLogin} not found`);

			const alreadyBlocked = await this.prismaService.blockedUser.findUnique({
				where: {
					login_blockedLogin: {
						login: user.login,
						blockedLogin: blockedUser.login,
					}
				}
			});

			if (alreadyBlocked)
				throw new BadRequestException(`User with login ${blockedLogin} already blocked`);

			console.log(`User ${user.login} blocked user ${blockedUser.login}`);
			await this.prismaService.blockedUser.create({
				data: {
					login: user.login,
					blockedLogin: blockedUser.login,
				}
			});
		}
		catch (e)
		{
			errorDispatcher(e);
		}

		try
		{
			await this.friendsService.removeFriend(userLogin, blockedLogin);
		}
		catch (e)
		{
			if (!(e instanceof NotFoundException))
				errorDispatcher(e);
		}

		try
		{
			await this.friendsService.removeFriend(blockedLogin, userLogin);
		}
		catch (e)
		{
			if (!(e instanceof NotFoundException))
				errorDispatcher(e);
		}
	}

	async unblockUser(userLogin: string, blockedLogin: string)
	{
		if (userLogin === blockedLogin)
			throw new BadRequestException('You cannot unblock yourself');

		try
		{
			const blockedUser = await this.usersService.getUser(blockedLogin);
			if (!blockedUser)
				throw new NotFoundException(`User with login ${blockedLogin} not found`);

			const user = await this.usersService.getUser(userLogin);
			if (!user)
				throw new NotFoundException(`User with login ${userLogin} not found`);

			const alreadyBlocked = await this.prismaService.blockedUser.findUnique({
				where: {
					login_blockedLogin: {
						login: user.login,
						blockedLogin: blockedUser.login,
					}
				}
			});
			if (!alreadyBlocked)
				throw new BadRequestException(`User with login ${blockedLogin} is not blocked`);

			console.log(`User ${user.login} unblocked user ${blockedUser.login}`);
			await this.prismaService.blockedUser.delete({
				where: {
					login_blockedLogin: {
						login: user.login,
						blockedLogin: blockedUser.login,
					}
				}
			});
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

	async getBlockedUsers(userLogin: string)
	{
		try
		{
			const user = await this.usersService.getUser(userLogin);
			if (!user)
				throw new NotFoundException(`User with login ${userLogin} not found`);

			const blockedUsersLogin = await this.prismaService.blockedUser.findMany({
				where: {
					login: user.login,
				},
				select: {
					blockedLogin: true,
				}
			});

			const blockedUsers: IPublicUser[] = await Promise.all(blockedUsersLogin.map(async (blockedUser) => {
				const user = await this.usersService.getUser(blockedUser.blockedLogin);
				return user;
			}));

			return blockedUsers;
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

	async isUserBlocked(userLogin: string, blockedLogin: string): Promise<boolean>
	{
		try
		{
			const blockedUser = await this.usersService.getUser(blockedLogin);
			if (!blockedUser)
				throw new NotFoundException(`User with login ${blockedLogin} not found`);

			const user = await this.usersService.getUser(userLogin);
			if (!user)
				throw new NotFoundException(`User with login ${userLogin} not found`);

			const alreadyBlocked = await this.prismaService.blockedUser.findUnique({
				where: {
					login_blockedLogin: {
						login: user.login,
						blockedLogin: blockedUser.login,
					}
				}
			});

			if (alreadyBlocked)
				return true;

			return false;
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

}
