import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import errorDispatcher from '../utils/error-dispatcher';
import { UsersService } from '../users/users.service';

@Injectable()
export class FriendsService {

	constructor(
			private prismaService: PrismaService,
			private usersService: UsersService,
	) {}

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

	async getFriends(login: string)
	{
		try
		{
			const user = await this.prismaService.user.findUnique({
				where: {
					login: login,
				}
			});
			if (!user)
				throw new NotFoundException(`User with login ${login} not found`);

			const friends = await this.prismaService.friends.findMany({
				where: {
					login: login,
				}
			});

			return friends;
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}
}
