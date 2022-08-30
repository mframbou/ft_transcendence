import { Controller, Get, Param, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from '../auth/auth.service';
import { Request, Response } from 'express';
import { TwoFactorService } from './two-factor.service';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';
import { IJwtPayload, IUserRequest } from '../interfaces/interfaces';
import { JwtService } from '@nestjs/jwt';

const rightCodeRedirectFrontend = `http://${process.env.SERVER_NAME}:3001/home`;
const wrongCodeRedirectFrontend = `http://${process.env.SERVER_NAME}:3001/otp-verify?wrong_code=true`;

@Controller('2fa')
export class TwoFactorController
{
	constructor(
			private authService: AuthService,
			private twoFactorService: TwoFactorService,
			private jwtService: JwtService,
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
	async verify2faCode(@Query('code') code: string, @Req() req: IUserRequest, @Res() res: Response): Promise<any>
	{
		const payload = req.jwtPayload;

		const codeValid: boolean = await this.twoFactorService.verifyCode(payload.login, code);

		if (!codeValid)
		{
			return res.redirect(wrongCodeRedirectFrontend);
		}


		const jwtPayload: IJwtPayload = {login: payload.login, twoFactorEnabled: false};
		const cookieHash = await this.jwtService.signAsync(jwtPayload);

		// change cookie with twofactor to false to dont ask again till cookie expiration (dont change it in db tho otherwise it disabled 2fa for every cookie)
		res.cookie('cockies', cookieHash, {
			httpOnly: true,
			// sameSite: 'Strict',
			maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
			// secure: true, // only HTTPS
		});

		console.log('Re-created cookie for users ' + payload.login);

		return res.redirect(rightCodeRedirectFrontend);
	}

}
