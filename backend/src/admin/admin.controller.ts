import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';
import { IUser } from '../interfaces/interfaces';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAdminAuthGuard } from '../auth/jwt-admin-auth.guard';
import errorDispatcher from '../utils/error-dispatcher';
import { FriendsService } from '../friends/friends.service';

@UseGuards(JwtAdminAuthGuard)
@Controller('admin')
export class AdminController {

	constructor(
			private usersService: UsersService,
			private prismaService: PrismaService,
			private friendsService: FriendsService,
	)
	{}

	@Get('create_random_user')
	async createRandomUser()
	{
		let randomUsername = '';
		try
		{
			randomUsername = Math.random().toString(36).substring(7);
			await this.prismaService.user.create({
				data: {
					login: randomUsername,
					email: `${randomUsername}@pouet.com`,
					phone: '0123456789',
					profilePicture: 'https://static.wikia.nocookie.net/bb6b9a39-8699-4ab7-9f8d-3109ac9cc0b0/scale-to-width/755',
					firstName: 'John',
					lastName: 'Doe',
					username: randomUsername,
					campus: 'Nice',
					isOwner: false,
					isAdmin: false,
				},
			});
		}
		catch (e)
		{
			errorDispatcher(e);
		}

		return `User ${randomUsername} created`;
	}

	@Get('add_friend')
	async sendFriendRequest(@Query('userLogin') userLogin: string, @Query('friendLogin') friendLogin: string)
	{
		await this.friendsService.addFriend(userLogin, friendLogin);
	}

	@Get('remove_friend')
	async removeFriend(@Query('userLogin') userLogin: string, @Query('friendLogin') friendLogin: string)
	{
		await this.friendsService.removeFriend(userLogin, friendLogin);
	}

	@Get('show_all_friends')
	async showAllFriends()
	{
		return await this.prismaService.friend.findMany();
	}

}
