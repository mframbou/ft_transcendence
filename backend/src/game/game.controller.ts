import { Controller, Get, Query } from '@nestjs/common';
import { GameService } from './game.service';

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

}
