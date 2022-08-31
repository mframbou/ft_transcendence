/* eslint-disable prefer-const */
// Nest
import { Controller, Get, Res, Query, Req, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import fetch from 'node-fetch';

// Transcendence
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Request, Response } from 'express';
import { IJwtPayload, IUserRequest } from '../interfaces/interfaces';
import { JwtTwoFactorAuthGuard } from './jwt-two-factor-auth.guard';


const homePageFrontend = `http://${process.env.SERVER_NAME}:3001/home`;
const twoFactorVerifyFrontend = `http://${process.env.SERVER_NAME}:3001/otp-verify`;
const callbackUrl42 = `http://${process.env.SERVER_NAME}:3000/auth/42/callback`;

const sessionCookieName = 'cockies';
const cookieDuration = 1000 * 60 * 60 * 24 * 30; // 30 days

@Controller('auth')
export class AuthController
{
	constructor(
			private authService: AuthService,
			private usersService: UsersService,
			private jwtService: JwtService,
	)
	{}

	/////////////////////////
	///   LOGIN & AUTH   ///
	////////////////////////

	@Get('42')
	async authRedirect42(@Req() req: Request, @Res() res: Response)
	{
		// If users already has a session redirect to home
		let jwtPayload = null;

		// In case of invalid cookie, we need to allow user to login again
		try
		{
			jwtPayload = await this.authService.getCurrentJwt(req);
		}
		catch (e)
		{
			jwtPayload = null;
		}

		if (jwtPayload)
		{
			console.log('User already logged in: ', jwtPayload.login);
			if (jwtPayload.need2Fa)
			{
				console.log('User has two factor enabled');
				return res.redirect(twoFactorVerifyFrontend);
			}
			await this.usersService.setOnlineStatus(jwtPayload.login, true);
			return res.redirect(homePageFrontend);
		}

		return res.redirect(
				`https://api.intra.42.fr/oauth/authorize?client_id=${process.env.API42_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl42)}&response_type=code`,
		);
	}

	// https://api.intra.42.fr/apidoc/guides/web_application_flow
	@Get('42/callback')
	async authCallback42(@Query('code') code: string, @Res() res: Response, @Req() req): Promise<any>
	{
		let response = await fetch('https://api.intra.42.fr/oauth/token', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				grant_type: 'authorization_code',
				client_id: process.env.API42_CLIENT_ID,
				client_secret: process.env.API42_CLIENT_SECRET,
				code: code,
				redirect_uri: callbackUrl42,
			}),
		});

		response = await response.json();

		const userData = await this.authService.getUserData(response.access_token);
		let user = await this.usersService.getUser(userData.login);
		let message: string;

		if (!user)
		{
			user = await this.usersService.addUser(userData);
			message = `Successfully added user ${user.login} to the database`;
		}
		else
		{
			message = `User ${user.login} already exists in the database`;
		}

		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#parameters
		const users = JSON.stringify(await this.usersService.getUsers(), null, 4);

		message += `\nUsers list: ${users}`;

		console.log(message);

		// const cookieHash = await this.authService.updateUserSessionCookie(user);
		const jwtPayload: IJwtPayload = {login: user.login, need2Fa: user.twoFactorEnabled};
		const cookieHash = await this.jwtService.signAsync(jwtPayload);

		// add cookie to response
		res.cookie(sessionCookieName, cookieHash, {
			httpOnly: true,
			// sameSite: 'Strict',
			maxAge: cookieDuration,
			// secure: true, // only HTTPS
		});

		console.log('Created cookie for users ' + user.login);

		if (user.twoFactorEnabled)
			return res.redirect(twoFactorVerifyFrontend);

		return res.redirect(homePageFrontend);
	}

	@Get('/logout')
	async logout(@Res() res: Response)
	{
		console.log('Logged out user');
		res.cookie(sessionCookieName, '', {
			expires: new Date(0),
		});
		// res.clearCookie(sessionCookieName, { path: '/' });
		// return res.redirect(homePageFrontend);
		return res.redirect(homePageFrontend);
		// return res.send('test');
	}

}
