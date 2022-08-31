import { Injectable, NotFoundException } from '@nestjs/common';
import * as twofactor from 'node-2fa';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import fetch from 'node-fetch';
import errorDispatcher from '../utils/error-dispatcher';
import { Response } from 'express';
import { IJwtPayload } from '../interfaces/interfaces';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TwoFactorService
{

	constructor(
			private usersService: UsersService,
			private prismaService: PrismaService,
			private jwtService: JwtService,
	)
	{}

	// https://www.npmjs.com/package/node-2fa

	async enableTwoFactor(login: string)
	{

		const user = await this.usersService.getUser(login);

		if (!user)
			throw new NotFoundException(`User ${login} does not exists`);

		if (user.otpSecret !== '')
		{
			console.log(`User ${login} already has 2FA enabled`);
			return await this.getUserQr(login);
		}

		const secret = twofactor.generateSecret({name: 'Transcendence', account: login});

		try
		{
			await this.prismaService.user.update({
				where: {
					login: login,
				},
				data: {
					otpSecret: secret.secret,
					otpUri: secret.uri,
					twoFactorEnabled: true,
				}
			});
		}
		catch (e)
		{
			errorDispatcher(e);
		}

		// const jwtPayload: IJwtPayload = { login: login, twoFactorEnabled: false };
		// await this.updateJwt(jwtPayload, res);

		console.log(`enabled 2FA for user ${login}`);
		return await this.getUserQr(login);
	}

	async disableTwoFactor(login: string, res: Response)
	{

		const user = await this.usersService.getUser(login);

		if (!user)
			throw new NotFoundException(`User ${login} does not exists`);

		if (user.otpSecret === '')
			throw new NotFoundException(`User ${login} does not have 2FA enabled`);

		try
		{
			await this.prismaService.user.update({
				where: {
					login: login,
				},
				data: {
					otpSecret: '',
					otpUri: '',
					twoFactorEnabled: false,
				}
			});
		}
		catch (e)
		{
			errorDispatcher(e);
		}

		const jwtPayload: IJwtPayload = { login: login, need2Fa: false };
		await this.updateJwt(jwtPayload, res);

		console.log(`disabled 2FA for user ${login}`);
		return 'Successfully disabled 2FA';
	}

	async getUserQr(login: string): Promise<string>
	{
		const user = await this.usersService.getUser(login);

		if (!user)
			throw new NotFoundException(`User ${login} does not exists`);

		if (user.otpSecret === '')
			throw new NotFoundException(`User ${login} does not have 2FA enabled`);

		return await this.generateQrFromUri(user.otpUri);
	}

	private async generateQrFromUri(uri: string, size: number = 160): Promise<string>
	{
		// https://developers.google.com/chart/infographics/docs/qr_codes
		const res = await fetch(`https://chart.googleapis.com/chart?chs=${size}x${size}&chld=L|0&cht=qr&chl=${uri}`);

		return res.url;
	}

	async verifyCode(login: string, code: string): Promise<boolean>
	{
		const user = await this.usersService.getUser(login);

		if (!user)
			throw new NotFoundException(`User ${login} does not exists`);

		if (user.otpSecret === '')
			throw new NotFoundException(`User ${login} does not have 2FA enabled`);


		const result = twofactor.verifyToken(user.otpSecret, code);

		console.log(`User ${login} verified code ${code}`);

		if (!result || result.delta !== 0)
			return false;


		return true;
	}

	async updateJwt(payload: IJwtPayload, res: Response)
	{
		const jwtPayload: IJwtPayload = {login: payload.login, need2Fa: payload.need2Fa};
		const cookieHash = await this.jwtService.signAsync(jwtPayload);

		// change cookie with twofactor to false to dont ask again till cookie expiration (dont change it in db tho otherwise it disabled 2fa for every cookie)
		res.cookie('cockies', cookieHash, {
			httpOnly: true,
			// sameSite: 'Strict',
			maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
			// secure: true, // only HTTPS
		});
	}

}
