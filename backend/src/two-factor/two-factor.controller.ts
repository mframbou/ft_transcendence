import { Controller, Get, Param, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { Request, Response } from 'express';
import { TwoFactorService } from './two-factor.service';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';
import { IJwtPayload, IUserRequest } from '../interfaces/interfaces';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const rightCodeRedirectFrontend = `http://${process.env.SERVER_NAME}:3001/home`;
const wrongCodeRedirectFrontend = `http://${process.env.SERVER_NAME}:3001/otp-verify?wrong_code=true`;

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
	async activate2fa(@Req() req: IUserRequest, @Res() res: Response): Promise<any>
	{
		const payload = req.jwtPayload;

		return res.send(await this.twoFactorService.enableTwoFactor(payload.login));
	}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Get('deactivate')
	async deactivate2fa(@Req() req: IUserRequest, @Res() res: Response): Promise<any>
	{
		const payload = req.jwtPayload;

		return res.send(await this.twoFactorService.disableTwoFactor(payload.login, res));
	}

	// Dont check if user is double authenticated because its the point of this route so at request time they are not yet authenticated
	@UseGuards(JwtAuthGuard)
	@Get('verify')
	async verify2faCode(@Query('code') code: string, @Req() req: IUserRequest, @Res() res: Response): Promise<any>
	{
		const payload = req.jwtPayload;

		const codeValid: boolean = await this.twoFactorService.verifyCode(payload.login, code);

		if (!codeValid)
		{
			return res.redirect(wrongCodeRedirectFrontend);
		}


		const jwtPayload: IJwtPayload = {login: payload.login, need2Fa: false};
		await this.twoFactorService.updateJwt(jwtPayload, res);

		console.log('Re-created cookie for users ' + payload.login);

		return res.redirect(rightCodeRedirectFrontend);
	}

}
