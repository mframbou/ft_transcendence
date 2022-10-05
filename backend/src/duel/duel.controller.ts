import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { DuelService } from './duel.service';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';
import { IUserRequest } from '../interfaces/interfaces';

@UseGuards(JwtTwoFactorAuthGuard)
@Controller('duel')
export class DuelController {

	constructor(
			private duelService: DuelService,
	) {}

	@Get(':login')
	async createDuel(@Req() req: IUserRequest, @Param('login') login: string)
	{
		const payload = req.jwtPayload;

		return await this.duelService.createDuel(payload.login, login);
	}
}
