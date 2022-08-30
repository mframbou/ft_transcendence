import { Controller, Get, Param, Query, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import { TwoFactorService } from './two-factor.service';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';
import { IUserRequest } from '../interfaces/interfaces';

@Controller('2fa')
export class TwoFactorController
{
	constructor(
			private authService: AuthService,
			private twoFactorService: TwoFactorService,
	)
	{}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Get('activate')
	async activate2fa(@Req() req: IUserRequest): Promise<any>
	{
		const payload = req.jwtPayload;

		return await this.twoFactorService.enableTwoFactor(payload.login);
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Get('deactivate')
	async deactivate2fa(@Req() req: IUserRequest): Promise<any>
	{
		const payload = req.jwtPayload;

		return await this.twoFactorService.disableTwoFactor(payload.login);
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Get('verify')
	async verify2faCode(@Query('code') code: string, @Req() req: IUserRequest): Promise<any>
	{
		const payload = req.jwtPayload;

		const res: boolean = await this.twoFactorService.verifyCode(payload.login, code);

		if (!res)
		{
			return 'Invalid code provided';
		}

		return 'Code verified, GG WP';
	}

}
