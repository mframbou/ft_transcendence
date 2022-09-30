import { Injectable, NotFoundException } from '@nestjs/common';
import {
	IGamePlayer,
	IGameRoom,
	IGameSpectator,
	IPublicGameRoom,
	IPublicUser,
	IWebsocketClient
} from '../interfaces/interfaces';
import { Server } from 'socket.io';
import  ServerSidePong  from './pong';
import { WsPaddleMoveDto } from '../interfaces/dtos';
import { UsersService } from '../users/users.service';
import errorDispatcher from '../utils/error-dispatcher';
import { PrismaService } from '../prisma/prisma.service';
import { IMatch } from '../interfaces/interfaces';

@Injectable()
export class GameService {

	constructor(
			private usersService: UsersService,
			private prismaService: PrismaService,
	) {}

	matchmakingPlayers: IGamePlayer[] = [];
	gameRooms: IGameRoom[] = [];

	startMatchmaking(client: IWebsocketClient, server: Server)
	{
		if (this.matchmakingPlayers.find(player => player.clientId === client.id))
			return;

		const player: IGamePlayer = {clientId: client.id, login: client.login, ready: false, connected: true};
		this.matchmakingPlayers.push(player);
		console.log(`Starting matchmaking for ${client.login}-${client.id} (total matchmaking users: ${this.matchmakingPlayers.length})`);

		if (this.matchmakingPlayers.length >= 2)
		{
			const player1 = this.matchmakingPlayers[0];
			const player2 = this.matchmakingPlayers[1];

			this.matchmakingPlayers = this.matchmakingPlayers.filter(player => player.clientId !== player1.clientId && player.clientId !== player2.clientId);

			const room: IGameRoom = {id: `${player1.clientId}-${player2.clientId}`, player1: player1, player2: player2};
			this.gameRooms.push(room);

			server.to([player1.clientId, player2.clientId]).emit('matchFound', room);
			console.log(`Creating game between ${player1.login} and ${player2.login} (total game rooms: ${this.gameRooms.length})`);
		}
	}

	confirmMatch(client: IWebsocketClient, server: Server)
	{
		const room = this.getClientGameRoom(client);

		if (!room)
			return;

		let player;
		if (room.player1.clientId === client.id)
			player = room.player1;
		else
			player = room.player2;

		player.ready = true;

		console.log(`Player ${player.login} confirmed match (opponent: ${player === room.player1 ? room.player2.login : room.player1.login})`);

		if (room.player1.ready && room.player2.ready && !room.gameInstance)
		{
			console.log(`Game between ${room.player1.login} and ${room.player2.login} started`);
			room.gameInstance = new ServerSidePong(room, server, this);
			room.gameInstance.start();
		}
	}

	handlePlayerDisconnect(clientId: string)
	{
		this.matchmakingPlayers = this.matchmakingPlayers.filter(player => player.clientId !== clientId);

		const gameRoom = this.gameRooms.find(room => room.player1.clientId === clientId || room.player2.clientId === clientId);

		if (gameRoom)
		{
			gameRoom.gameInstance.pause();
			this.gameRooms = this.gameRooms.filter(room => room.id !== gameRoom.id);

			const player = gameRoom.player1.clientId === clientId ? gameRoom.player1 : gameRoom.player2;
			// player.connected = false;
			// player.clientId = null;
			// if (gameRoom.gameInstance)
			// 	gameRoom.gameInstance.pause();
			console.log(`Player ${player.login} disconnected from game room ${gameRoom.id}, rooms number: ${this.gameRooms.length}`);
		}
	}

	handleSpectatorDisconnect(clientId: string)
	{
		this.gameRooms.forEach(room => {
			if (room.spectators)
				room.spectators = room.spectators.filter(spectator => spectator.clientId !== clientId);
		});
	}

	handlePlayerPaddleMove(client: IWebsocketClient, payload: WsPaddleMoveDto)
	{
		const room = this.getClientGameRoom(client);

		if (!room || !room.gameInstance)
			return;

		let player;

		if (room.player1.clientId === client.id)
			player = room.gameInstance.player1;
		else
			player = room.gameInstance.player2;

		room.gameInstance.handlePlayerPaddleMove(player, payload);
	}

	getClientGameRoom(client: IWebsocketClient): IGameRoom
	{
		return this.gameRooms.find(room => room.player1.clientId === client.id || room.player2.clientId === client.id);
	}

	broadcastEvent(room: IGameRoom, eventName: string, message: any, server: Server, sendToSpectators: boolean = true, excludePlayer?: IGamePlayer)
	{
		if (room.player1 && room.player1 !== excludePlayer)
		{
			server.to(room.player1.clientId).emit(eventName, message);
		}

		if (room.player2 && room.player2 !== excludePlayer)
		{
			server.to(room.player2.clientId).emit(eventName, message);
		}

		if (sendToSpectators && room.spectators)
		{
			room.spectators.forEach(spectator => server.to(spectator.clientId).emit(eventName, message));
		}
	}

	addSpectator(roomId: string, user: IWebsocketClient)
	{
		const room = this.gameRooms.find(room => room.id === roomId);

		if (!room)
			return;

		if (!room.spectators)
			room.spectators = [];

		const spectator: IGameSpectator = {clientId: user.id, login: user.login};

		room.spectators.push(spectator);
		console.log(`Added spectator ${user.login} to game room ${room.id} (${room.player1.login} vs ${room.player2.login}), spectators: ${JSON.stringify(room.spectators)}`);
	}

	async getGameRooms(): Promise<IPublicGameRoom[]>
	{
		const publicRooms = await Promise.all(this.gameRooms.map(async room => {
			const player1: IPublicUser = await this.usersService.getPublicUser(room.player1.login);
			const player2: IPublicUser = await this.usersService.getPublicUser(room.player2.login);

			if (!player1 || !player2)
				return null;

			return {
				id: room.id,
				player1: player1,
				player2: player2,
			};
		}));

		// just in case some players are not really here (database reset or something like that)
		return publicRooms.filter(room => room !== null);
	}

	async getGameRoom(roomId: string): Promise<IPublicGameRoom>
	{
		const room = this.gameRooms.find(room => room.id === roomId);

		if (!room)
			throw new NotFoundException('Game room not found');

		const player1: IPublicUser = await this.usersService.getPublicUser(room.player1.login);
		const player2: IPublicUser = await this.usersService.getPublicUser(room.player2.login);

		if (!player1 || !player2)
			throw new NotFoundException('Game room players not found');

		return {
			id: room.id,
			player1: player1,
			player2: player2,
		};
	}

	async addMatchToHistory(p1Login: string, p1Score: number, p2Login: string, p2Score: number)
	{
		try
		{
			const player1 = await this.usersService.getUser(p1Login);
			if (!player1)
				throw new NotFoundException('Player 1 not found');

			const player2 = await this.usersService.getUser(p2Login);
			if (!player2)
				throw new NotFoundException('Player 2 not found');

			await this.prismaService.match.create({
				data: {
					player1Login: p1Login,
					player1Score: p1Score,
					player2Login: p2Login,
					player2Score: p2Score,
				}
			});
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

	endGame(room: IGameRoom, server: Server)
	{
		const player1 = { login: room.player1.login, score: room.gameInstance.player1.score };
		const player2 = { login: room.player2.login, score: room.gameInstance.player2.score };

		room.gameInstance?.stop();
		room.gameInstance = null;

		this.broadcastEvent(room, 'gameEnd', {player1Score: player1.score, player2Score: player2.score}, server, true);
		this.gameRooms = this.gameRooms.filter(r => r.id !== room.id);
		this.addMatchToHistory(player1.login, player1.score, player2.login, player2.score);
	}

	async getPlayerMatches(login: string): Promise<IMatch[]>
	{
		try
		{
			const matches = await this.prismaService.match.findMany({
				where: {
					OR: [
						{ player1Login: login },
						{ player2Login: login },
					]
				},
				orderBy: {
					timestamp: 'desc',
				}
			});

			return matches;
		}
		catch (e)
		{
			errorDispatcher(e);
		}
	}

}
