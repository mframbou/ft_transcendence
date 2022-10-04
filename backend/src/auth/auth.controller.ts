/* eslint-disable prefer-const */
// Nest
import { Controller, Get, Res, Query, Req, UseGuards, HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import fetch from 'node-fetch';

// Transcendence
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Request, Response } from 'express';
import { IJwtPayload } from '../interfaces/interfaces';


// hostname is 'backend' by default, but can be changed in the docker-compose file, so make it generic

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
		const hostname = req.headers.host;
		// Never communicate directly from browser to backend, always use proxy setup in svelte (vite.config.json)
		const callbackUrl = `http://${hostname}/api/auth/42/callback`;


		// Dont check if user already has a session because they might want to change account, so always redirect to 42 login
		return res.redirect(
				`https://api.intra.42.fr/oauth/authorize?client_id=${process.env.API42_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code`,
		);
	}

	// https://api.intra.42.fr/apidoc/guides/web_application_flow
	@Get('42/callback')
	async authCallback42(@Query('code') code: string, @Res() res: Response, @Req() req): Promise<any>
	{
		const hostname = req.headers.host;
		const callbackUrl = `http://${hostname}/api/auth/42/callback`;

		let response = await fetch('https://api.intra.42.fr/oauth/token', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				grant_type: 'authorization_code',
				client_id: process.env.API42_CLIENT_ID,
				client_secret: process.env.API42_CLIENT_SECRET,
				code: code,
				redirect_uri: callbackUrl,
			}),
		})

		if (!response.ok)
			throw new HttpException('An error occured while fetching user data (from 42 server not us, most likely invalid api key)', response.status);

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

		console.log(message);

		await this.authService.addJwtCookie(res, {login: user.login, need2Fa: user.twoFactorEnabled});

		console.log('Created cookie for user ' + user.login);

		if (user)
			return res.redirect('/home');

		return res.redirect('/settings');
	}

	@Get('/logout')
	async logout(@Res() res: Response)
	{
		console.log('Logged out user');
		res.clearCookie(sessionCookieName);

		return res.redirect('/');
	}

}
