import {Controller, Get, Param, Query, Req, UnauthorizedException} from '@nestjs/common';
import {UsersService} from "../users/users.service";
import {AuthService} from "../auth/auth.service";
import {Request} from "express";
import { TwoFactorService } from './two-factor.service';

@Controller('2fa')
export class TwoFactorController {

	constructor(
			private authService: AuthService,
			private twoFactorService: TwoFactorService,
	) {}


	@Get('activate/:login')
	async activate2fa(@Param('login') login: string, @Req() req: Request): Promise<any> {

		const currentUser = await this.authService.getCurrentUser(req.cookies);

		if (!currentUser || currentUser.login !== login) {
			throw new UnauthorizedException('You need to be logged in to activate 2FA');
		}

		return await this.twoFactorService.enableTwoFactor(currentUser.login);
	}

	@Get('deactivate/:login')
	async deactivate2fa(@Param('login') login: string, @Req() req: Request): Promise<any> {

		const currentUser = await this.authService.getCurrentUser(req.cookies);

		if (!currentUser || currentUser.login !== login) {
			throw new UnauthorizedException('You need to be logged in to deactivate 2FA');
		}

		return await this.twoFactorService.disableTwoFactor(currentUser.login);
	}

	@Get('verify/:login')
	async verify2faCode(@Query('code') code: string, @Param('login') login: string, @Req() req: Request): Promise<any> {

		const currentUser = await this.authService.getCurrentUser(req.cookies);

		if (!currentUser || currentUser.login !== login) {
			throw new UnauthorizedException('You need to be logged in to verify 2FA');
		}

		const res: boolean = await this.twoFactorService.verifyCode(currentUser.login, code);

		if (!res) {
			return "Invalid code provided";
		}

		return "Code verified, GG WP";
	}

}
