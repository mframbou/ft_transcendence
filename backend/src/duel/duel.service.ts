import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { GameService } from '../game/game.service';
import { IDuel, IGamePlayer, IWebsocketClient } from '../interfaces/interfaces';
import { Server } from 'socket.io';

@Injectable()
export class DuelService
{

	constructor(
			private usersService: UsersService,
			private gameService: GameService,
	)
	{}

	duels: IDuel[] = [];

	async createDuel(user: IWebsocketClient, opponents: IWebsocketClient[], server: Server)
	{
		if (opponents.length === 0)
			throw new BadRequestException('No opponents provided');

		const alreadyDueling = this.getPlayerSentDuel(user.id);
		// remove previous duel if exists
		if (alreadyDueling)
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

		const duel = {
			sender: senderGamePlayer,
			receivers: receiversGamePlayers,
		}

		this.duels.push(duel);
		await this.sendDuelToOpponents(duel, server);
	}

	async sendDuelToOpponents(duel: IDuel, server: Server)
	{
		const receivers = duel.receivers.filter(receiver => receiver.connected);

		for (const receiver of receivers)
		{
			console.log(`Sending duel to ${receiver.login}:${receiver.clientId}`);
			server.to(receiver.clientId).emit('duelInvitation', { senderId: duel.sender.clientId, senderLogin: duel.sender.login });
		}
	}

	async acceptDuel(userId: string, senderId: string, server: Server)
	{
		const duel = this.getPlayerReceivedDuels(userId).find(duel => duel.sender.clientId === sender.id);

		if (!duel)
			throw new NotFoundException('Duel not found');

		const receiver = duel.receivers.find(receiver => receiver.clientId === userId);
		const sender = duel.sender;
		receiver.ready = true;

		// in case sender disconnected or something
		if (duel.sender.ready && receiver.ready)
		{
			this.gameService.startMatch(duel.sender, receiver, server);
			this.duels = this.duels.filter(duel => duel.sender.clientId !== userId);
			console.log(`Duel between ${duel.sender.login} and ${receiver.login} accepted, starting match`);
		}
	}

	getPlayerSentDuel(clientId: string): IDuel
	{
		return this.duels.find(duel => duel.sender.clientId === clientId);
	}

	getPlayerReceivedDuels(clientId: string): IDuel[]
	{
		return this.duels.filter(duel => duel.receivers.some(receiver => receiver.clientId === clientId));
	}

}

