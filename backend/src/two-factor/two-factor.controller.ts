import {
	Controller,
	Get, NotFoundException,
	Param,
	ParseBoolPipe,
	Query,
	Req,
	Res,
	UnauthorizedException,
	UseGuards
} from '@nestjs/common';
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
			private jwtService: JwtService,
			private usersService: UsersService,
	)
	{}

	@UseGuards(JwtTwoFactorAuthGuard)
	@Get('activate')
	// cannot use parseboolpipe since arg is optional
	async activate2fa(@Req() req: IUserRequest, @Res() res: Response, @Query('unsafe') safe?: string): Promise<any>
	{
		const payload = req.jwtPayload;

		// const cookieHash = await this.authService.updateUserSessionCookie(user);
		const jwtPayload: IJwtPayload = {login: payload.login, need2Fa: false};
		const cookieHash = await this.jwtService.signAsync(jwtPayload);

		// add cookie to response
		res.cookie('cockies', cookieHash, {
			httpOnly: true,
			// sameSite: 'Strict',
			maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
			// secure: true, // only HTTPS
		});

		let safeVerify = false;
		// because '' is falsy
		if (safe !== undefined && (safe === 'true' || safe === ''))
			safeVerify = true;

		// I left the unused code just in case, but I think it's better to always be safe (means need to input code after enabling to truly enable)
		return res.send(await this.twoFactorService.enableTwoFactor(payload.login, true));
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
		const user = await this.usersService.getUser(payload.login);

		if (!user)
			throw new NotFoundException('User not found');

		// check twoFactorEnabled for safe mode (if not enabled, its probably second step of safe mode)
		if (!payload.need2Fa && user.twoFactorEnabled)
		{
			return res.status(409).send('2FA already verified');
		}

		const codeValid: boolean = await this.twoFactorService.verifyCode(payload.login, code);

		if (!codeValid)
		{
			console.log("code invalid");
			return res.status(401).send();
			// return res.redirect(wrongCodeRedirectFrontend);
		}


		const jwtPayload: IJwtPayload = {login: payload.login, need2Fa: false};
		await this.twoFactorService.updateJwt(jwtPayload, res);

		console.log('Re-created cookie for users ' + payload.login);

		return res.status(200).send();
		// return res.redirect(rightCodeRedirectFrontend);
	}

}
