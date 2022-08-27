import {Injectable, NotFoundException} from '@nestjs/common';
import * as twofactor from 'node-2fa'
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from '../users/users.service';
import fetch from 'node-fetch';
import errorDispatcher from "../utils/error-dispatcher";

@Injectable()
export class TwoFactorService {

	constructor(
			private usersService: UsersService,
			private prismaService: PrismaService,
	) {}

	// https://www.npmjs.com/package/node-2fa

	async enableTwoFactor(login: string) {

		const user = await this.usersService.getUser(login);

		if (!user)
			throw new NotFoundException(`User ${login} does not exists`);

		if (user.otpSecret !== '')
		{
			console.log(`User ${login} already has 2FA enabled`);
			return await this.getUserQr(login);
		}

		const secret = twofactor.generateSecret({ name: "Transcendence", account: login });

		try
		{
			await this.prismaService.user.update({
				where: {
					login: login,
				},
				data: {
					otpSecret: secret.secret,
					otpUri: secret.uri,
				}
			});
		}
		catch (e)
		{
			errorDispatcher(e);
		}

		console.log(`enabled 2FA for user ${login}`);
		return await this.getUserQr(login);
	}

	async disableTwoFactor(login: string) {

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
				}
			});
		}
		catch (e)
		{
			errorDispatcher(e);
		}

		console.log(`disabled 2FA for user ${login}`);
		return "Successfully disabled 2FA";
	}

	async getUserQr(login: string) : Promise<string> {
		const user = await this.usersService.getUser(login);

		if (!user)
			throw new NotFoundException(`User ${login} does not exists`);

		if (user.otpSecret === '')
			throw new NotFoundException(`User ${login} does not have 2FA enabled`);

		return await this.generateQrFromUri(user.otpUri);
	}

	private async generateQrFromUri(uri: string, size: number = 160) : Promise<string> {
		// https://developers.google.com/chart/infographics/docs/qr_codes
		const res = await fetch(`https://chart.googleapis.com/chart?chs=${size}x${size}&chld=L|0&cht=qr&chl=${uri}`);

		return res.url
	}

	async verifyCode(login: string, code: string) : Promise<boolean> {
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

}
