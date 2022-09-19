import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import errorDispatcher from '../utils/error-dispatcher';
import { UsersService } from '../users/users.service';
import { IPublicUser } from '../interfaces/interfaces';

@Injectable()
export class FriendsService {

	constructor(
			private prismaService: PrismaService,
			private usersService: UsersService,
	) {}

	async getPendingFriendsSent(userLogin: string): Promise<IPublicUser[]>
	{
		try
		{
			const user = await this.usersService.getUser(userLogin);
			const pendingFriendsLogin = await this.prismaService.friends.findMany({
				where: {
					login: user.login,
					pending: true,
				},
				select: {
					friendLogin: true,
				}
			});

			// Since map returns an array of promises, we need to await it, to await an array, use Promise.all
			const pendingFriends: IPublicUser[] = await Promise.all(pendingFriendsLogin.map(async (friend) => {
				const user: IPublicUser = await this.usersService.getUser(friend.friendLogin);
				return user;
			}));

			return pendingFriends;
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

	async getPendingFriendsReceived(userLogin: string): Promise<IPublicUser[]>
	{
		try
		{
			const user = await this.usersService.getUser(userLogin);
			const pendingFriendsLogin = await this.prismaService.friends.findMany({
				where: {
					friendLogin: user.login,
					pending: true,
				},
				select: {
					login: true,
				}
			});

			// Since map returns an array of promises, we need to await it, to await an array, use Promise.all
			const pendingFriends: IPublicUser[] = await Promise.all(pendingFriendsLogin.map(async (friend) => {
				const user: IPublicUser = await this.usersService.getUser(friend.login);
				return user;
			}));

			return pendingFriends;
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

	async addFriend(userLogin: string, friendLogin: string)
	{
		if (userLogin === friendLogin)
		{
			throw new BadRequestException('You cannot add yourself as a friend');
		}

		try
		{
			const friend = await this.usersService.getUser(friendLogin);
			if (!friend)
				throw new NotFoundException(`User with login ${friendLogin} not found`);

			const user = await this.usersService.getUser(userLogin);
			if (!user)
				throw new NotFoundException(`User with login ${userLogin} not found`);

			// check if already friend
			const alreadyFriend = await this.prismaService.friends.findUnique({
				where: {
					login_friendLogin: {
						login: userLogin,
						friendLogin: friendLogin,
					}
				}
			});

			if (alreadyFriend)
				throw new BadRequestException(`User with login ${userLogin} is already ${alreadyFriend.pending ? 'pending' : 'friend'} with user with login ${friendLogin}`);

			const pendingAcceptFromFriend = await this.prismaService.friends.findUnique({
				where: {
					login_friendLogin: {
						login: friendLogin,
						friendLogin: userLogin,
					}
				}
			});

			// If other user has already sent friend request, then acceept directly instead of pending
			// And set other user not pending if so
			await this.prismaService.friends.create({
				data: {
					login: userLogin,
					friendLogin: friendLogin,
					pending: pendingAcceptFromFriend ? false : true,
				}
			});

			if (pendingAcceptFromFriend)
			{
				await this.prismaService.friends.update({
					where: {
						login_friendLogin: {
							login: friendLogin,
							friendLogin: userLogin,
						}
					},
					data: {
						pending: false,
					}
				});
			}
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

	async removeFriend(userLogin: string, friendLogin: string)
	{
		try
		{
			const alreadyFriend = await this.prismaService.friends.findUnique({
				where: {
					login_friendLogin: {
						login: userLogin,
						friendLogin: friendLogin,
					}
				}
			});
			if (!alreadyFriend)
				throw new NotFoundException(`User with login ${userLogin} is not friend with user with login ${friendLogin}`);

			const friend = await this.usersService.getUser(friendLogin);
			if (!friend)
				throw new NotFoundException(`User with login ${friendLogin} not found`);

			const user = await this.usersService.getUser(userLogin);
			if (!user)
				throw new NotFoundException(`User with login ${userLogin} not found`);

			await this.prismaService.friends.delete({
				where: {
					login_friendLogin: {
						login: userLogin,
						friendLogin: friendLogin,
					}
				}
			});

			if (!alreadyFriend.pending)
			{
				// delete the reverse friendship
				await this.prismaService.friends.delete({
					where: {
						login_friendLogin: {
							login: friendLogin,
							friendLogin: userLogin,
						}
					}
				});
			}

		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

	async getFriends(login: string): Promise<IPublicUser[]>
	{
		try
		{
			const friendsLogin = await this.prismaService.friends.findMany({
				where: {
					login: login,
					pending: false,
				},
				select: {
					friendLogin: true,
				}
			});

			// Since map returns an array of promises, we need to await it, to await an array, use Promise.all
			const friends: IPublicUser[] = await Promise.all(friendsLogin.map(async (friend) => {
				const user: IPublicUser = await this.usersService.getUser(friend.friendLogin);
				return user;
			}));

			return friends;
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}
}
