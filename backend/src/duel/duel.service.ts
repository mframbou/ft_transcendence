import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { GameService } from '../game/game.service';
import { IDuel, IGamePlayer, IWebsocketClient } from '../interfaces/interfaces';

@Injectable()
export class DuelService
{

	constructor(
			private usersService: UsersService,
			private gameService: GameService,
	)
	{}

	duels: IDuel[] = [];

	async createDuel(user: IWebsocketClient, opponents: IWebsocketClient[])
	{
		if (opponents.length === 0)
			throw new BadRequestException('No opponents provided');

		const duel = this.getPlayerSentDuel(user);
		// remove previous duel if exists
		if (duel)
			this.duels = this.duels.filter(duel => duel.sender.clientId !== user.id);


		// convert WebsocketClient to IGamePlayer (for ready property mostly)
		const senderGamePlayer: IGamePlayer = {
			clientId: user.id,
			login: user.login,
			connected: true,
			ready: true,
		};

		const receiversGamePlayers: IGamePlayer[] = opponents.map(opponent => {
			return {
				clientId: opponent.id,
				login: opponent.login,
				connected: true,
				ready: false,
			};
		});

		this.duels.push({
			sender: senderGamePlayer,
			receivers: receiversGamePlayers,
		});
	}

	async acceptDuel(user: IWebsocketClient, sender: IWebsocketClient)
	{
		const duel = this.getPlayerReceivedDuels(user).find(duel => duel.sender.clientId === sender.id);

		if (!duel)
			throw new NotFoundException('Duel not found');

		const receiver = duel.receivers.find(receiver => receiver.clientId === user.id);
		receiver.ready = true;

		// in case sender disconnected or something
		if (duel.sender.ready && receiver.ready)
		{
			this.gameService.startMatch(duel.sender, duel.receivers);
		}
	}

	getPlayerSentDuel(client: IWebsocketClient): IDuel
	{
		return this.duels.find(duel => duel.sender.clientId === client.id);
	}

	getPlayerReceivedDuels(client: IWebsocketClient): IDuel[]
	{
		return this.duels.filter(duel => duel.receivers.some(receiver => receiver.clientId === client.id));
	}

}

