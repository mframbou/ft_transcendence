import {
	Body,
	Controller,
	Get,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';
import { IJwtPayload, IUserRequest } from '../interfaces/interfaces';
import { FriendsService } from './friends.service';
import { AddFriendDto, UpdateUserDto } from '../interfaces/dtos';

@UseGuards(JwtTwoFactorAuthGuard)
@Controller('friends')
export class FriendsController {

	constructor (
			private friendsService: FriendsService,
	) {}

	@Get('/')
	async showFriends(@Req() req: IUserRequest) {
		const payload: IJwtPayload = req.jwtPayload;

		return await this.friendsService.getFriends(payload.login);
	}

	@Post('add')
	async addFriend(@Body() body: AddFriendDto, @Req() req: IUserRequest) {
		const payload: IJwtPayload = req.jwtPayload;

		await this.friendsService.addFriend(payload.login, body.login);
	}


	@Post('remove')
	async removeFriend(@Body() body: AddFriendDto, @Req() req: IUserRequest) {
		const payload: IJwtPayload = req.jwtPayload;

		await this.friendsService.removeFriend(payload.login, body.login);
	}

	@Get('pending_received')
	async getPendingFriendRequests(@Req() req: IUserRequest)
	{
		const payload: IJwtPayload = req.jwtPayload;

		return await this.friendsService.getPendingFriendsReceived(payload.login);
	}

	@Get('pending_sent')
	async getPendingFriendRequestsSent(@Req() req: IUserRequest)
	{
		const payload: IJwtPayload = req.jwtPayload;

		return await this.friendsService.getPendingFriendsSent(payload.login);
	}

	@Get('all')
	async getAllFriends(@Req() req: IUserRequest)
	{
		const payload: IJwtPayload = req.jwtPayload;

		const friends = await this.friendsService.getFriends(payload.login);
		const pendingFriendsSent = await this.friendsService.getPendingFriendsSent(payload.login);
		const pendingFriendsReceived = await this.friendsService.getPendingFriendsReceived(payload.login);

		return {
			friends: friends,
			pendingSent: pendingFriendsSent,
			pendingReceived: pendingFriendsReceived,
		};
	}


}
