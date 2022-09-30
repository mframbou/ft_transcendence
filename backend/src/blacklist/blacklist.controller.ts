import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { BlockUserDto } from '../interfaces/dtos';
import { IJwtPayload, IUserRequest } from '../interfaces/interfaces';
import { BlacklistService } from './blacklist.service';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';

@UseGuards(JwtTwoFactorAuthGuard)
@Controller('blacklist')
export class BlacklistController {

	constructor(
			private blacklistService: BlacklistService,
	) {}


	@Post('block')
	async blockUser(@Body() body: BlockUserDto, @Req() req: IUserRequest)
	{
		const payload: IJwtPayload = req.jwtPayload;

		await this.blacklistService.blockUser(payload.login, body.login);
	}


	@Post('unblock')
	async unblockUser(@Body() body: BlockUserDto, @Req() req: IUserRequest)
	{
		const payload: IJwtPayload = req.jwtPayload;

		await this.blacklistService.unblockUser(payload.login, body.login);
	}

	@Get('blocked_users')
	async getBlockedUsers(@Req() req: IUserRequest)
	{
		const payload: IJwtPayload = req.jwtPayload;

		return await this.blacklistService.getBlockedUsers(payload.login);
	}

}
