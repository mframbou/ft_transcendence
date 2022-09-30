import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import { IJwtPayload, IUserRequest } from '../interfaces/interfaces';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';

@UseGuards(JwtTwoFactorAuthGuard)
@Controller('game')
export class GameController {

	constructor(
			private gameService: GameService,
	) {}

	@Get('rooms')
	async getRooms(@Query('id') id?: string)
	{
		if (!id)
			return this.gameService.getGameRooms();
		else
			return this.gameService.getGameRoom(id);
	}

	@Get('history')
	async getMatches(@Req() req: IUserRequest)
	{
		const payload: IJwtPayload = req.jwtPayload;

		return await this.gameService.getPlayerMatches(payload.login);
	}

}
