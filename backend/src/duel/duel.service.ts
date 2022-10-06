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

		const alreadySentDuel = this.getPlayerSentDuel(user.id);
		// remove previous duel if exists
		if (alreadySentDuel)
			this.duels = this.duels.filter(duel => duel.sender.clientId !== user.id);

		const inGame = this.gameService.getClientGameRoom(user.id);
		if (inGame)
			throw new BadRequestException('You cannot send a duel invitation while in game');

		// convert WebsocketClient to IGamePlayer (for ready property mostly)
		const senderGamePlayer: IGamePlayer = {
			clientId: user.id,
			login: user.login,
			connected: true,
			ready: false,
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
		const duel = this.getPlayerReceivedDuels(userId).find(duel => duel.sender.clientId === senderId);

		if (!duel)
			throw new NotFoundException('Duel not found');

		const receiver = duel.receivers.find(receiver => receiver.clientId === userId);

		if (!receiver)
			throw new NotFoundException('Duel receiver not found');

		const sender = duel.sender;

		console.log('receiver pouet');
		const receiverInGame = this.gameService.getClientGameRoom(receiver.clientId);

		if (receiverInGame)
		{
			// disconnect from current game
			this.gameService.handlePlayerDisconnect(receiver.clientId);
		}
		// receiver.ready = true; // dont set ready because ready is set when confirmation is sent (just in case)

		console.log(`Duel between ${sender.login} and ${receiver.login} accepted, starting match`);
		this.gameService.startMatch(sender, receiver, server);
		this.duels = this.duels.filter(duel => duel.sender.clientId !== senderId);
	}

	getPlayerSentDuel(clientId: string): IDuel
	{
		return this.duels.find(duel => duel.sender.clientId === clientId);
	}

	getPlayerReceivedDuels(clientId: string): IDuel[]
	{
		return this.duels.filter(duel => duel.receivers.some(receiver => receiver.clientId === clientId));
	}

	handlePlayerDisconnect(clientId: string)
	{
		const sentDuel = this.getPlayerSentDuel(clientId);
		if (sentDuel)
		{
			console.log(`Player ${clientId} disconnected, cancelling duel`);
			this.duels = this.duels.filter(duel => duel.sender.clientId !== clientId);
		}

		const receivedDuels = this.getPlayerReceivedDuels(clientId);
		if (receivedDuels.length > 0)
		{
			console.log(`Player ${clientId} disconnected, removing him from duel receivers`);
			for (const duel of receivedDuels)
				duel.receivers = duel.receivers.filter(receiver => receiver.clientId !== clientId);
		}
	}
}

