import {Controller, Get, Param, Req, UnauthorizedException} from '@nestjs/common';
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

}
