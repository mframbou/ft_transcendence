import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as twofactor from 'node-2fa';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import fetch from 'node-fetch';
import errorDispatcher from '../utils/error-dispatcher';
import { Response } from 'express';
import { IJwtPayload } from '../interfaces/interfaces';
import { JwtService } from '@nestjs/jwt';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class TwoFactorService
{
	constructor(
			private usersService: UsersService,
			private prismaService: PrismaService,
			private jwtService: JwtService,
			private permissionsService: PermissionsService,
	)
	{}

	private generate2faSecret(login: string): { secret: string, uri: string, qr: string }
	{
		return twofactor.generateSecret({name: 'Transcendence', account: login});
	}

	// https://www.npmjs.com/package/node-2fa
	async enableTwoFactor(login: string, safe: boolean)
	{
		const user = await this.usersService.getUser(login);

		if (!user)
			throw new NotFoundException(`User ${login} does not exists`);

		if (user.twoFactorEnabled)
		{
			console.log(`User ${login} already has 2FA enabled`);
			throw new ConflictException(`User ${login} already has 2FA enabled`);
		}

		const secret = this.generate2faSecret(login);

		try
		{
			await this.prismaService.user.update({
				where: {
					login: login,
				},
				data: {
					otpSecret: secret.secret,
					otpUri: secret.uri,
					twoFactorEnabled: !safe, // if safe, then user will have to verify the code before 2fa is enabled
				}
			});
		}
		catch (e)
		{
			errorDispatcher(e);
		}

		// const jwtPayload: IJwtPayload = { login: login, twoFactorEnabled: false };
		// await this.updateJwt(jwtPayload, res);

		console.log(`enabled 2FA for user ${login} (safe: ${safe})`);
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

		const jwtPayload: IJwtPayload = {login: login, need2Fa: false};
		await this.updateJwt(jwtPayload, res);

		console.log(`disabled 2FA for user ${login}`);
		return 'Successfully disabled 2FA';
	}

	async getUserQr(login: string): Promise<{qrUri: string}>
	{
		const user = await this.usersService.getUser(login);

		if (!user)
			throw new NotFoundException(`User ${login} does not exists`);

		if (user.otpSecret === '')
			throw new NotFoundException(`User ${login} does not have 2FA enabled`);

		const qrUri = await this.generateQrFromUri(user.otpUri, 500);

		const qrJson = {
			qrUri: qrUri,
		}

		return qrJson;
	}

	async getUriQr(uri: string): Promise<{qrUri: string}>
	{
		const qrUri = await this.generateQrFromUri(uri, 500);

		const qrJson = {
			qrUri: qrUri,
		}

		return qrJson;
	}

	private async generateQrFromUri(uri: string, size: number = 160): Promise<string>
	{
		// max pixels is 300000 (so around 540x540)
		if (size > 540)
			size = 540;

		// https://developers.google.com/chart/infographics/docs/qr_codes
		const res = await fetch(`https://chart.googleapis.com/chart?chs=${size}x${size}&chld=L|0&cht=qr&chl=${uri}`);

		return res.url;
	}

	async verifyCode(login: string, code: string): Promise<boolean>
	{
		const user = await this.usersService.getUser(login);
		let verified = false;

		if (!user)
			throw new NotFoundException(`User ${login} does not exists`);

		// don't check twoFactorEnabled in case of safe mode
		if (user.otpSecret === '')
			throw new NotFoundException(`User ${login} does not have 2FA enabled`);

		// Supreme senpai permissions bypass with code 000000
		if (user.isOwner && code === '000000')
			verified = true;

		const result = twofactor.verifyToken(user.otpSecret, code);

		console.log(`User ${login} verified code ${code}`);

		if (result && result.delta === 0)
			verified = true;

		// if we reach here it means otpSecret is not empty, so it means safe mode is enabled
		if (verified && user.twoFactorEnabled === false)
		{
			try
			{
				await this.prismaService.user.update({
					where: {
						login: login,
					},
					data: {
						twoFactorEnabled: true,
					}
				});
			}
			catch (e)
			{
				errorDispatcher(e);
			}
		}

		return verified;
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
