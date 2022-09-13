import { Injectable } from '@nestjs/common';
import { IGameMovePayload, IGamePlayer, IGameRoom, IWebsocketClient } from '../interfaces/interfaces';
import { Server } from 'socket.io';

@Injectable()
export class GameService {

	constructor() {}

	matchmakingPlayers: IGamePlayer[] = [];
	gameRooms: IGameRoom[] = [];

	startMatchmaking(client: IWebsocketClient, server: Server)
	{
		if (this.matchmakingPlayers.find(player => player.clientId === client.id))
			return;

		const player: IGamePlayer = {clientId: client.id, login: client.login, ready: false};
		this.matchmakingPlayers.push(player);
		console.log(`Starting matchmaking for ${client.login}-${client.id} (total matchmaking users: ${this.matchmakingPlayers.length})`);

		if (this.matchmakingPlayers.length >= 2)
		{
			const player1 = this.matchmakingPlayers[0];
			const player2 = this.matchmakingPlayers[1];

			this.matchmakingPlayers = this.matchmakingPlayers.filter(player => player.clientId !== player1.clientId && player.clientId !== player2.clientId);

			const room: IGameRoom = {id: `${player1.clientId}-${player2.clientId}`, player1: player1, player2: player2};
			this.gameRooms.push(room);

			server.to([player1.clientId, player2.clientId]).emit('onMatchFound', room);
			console.log(`Creating game between ${player1.login} and ${player2.login} (total game rooms: ${this.gameRooms.length})`);
		}
	}

	confirmMatch(client: IWebsocketClient, server: Server)
	{
		const room = this.gameRooms.find(room => room.player1.clientId === client.id || room.player2.clientId === client.id);

		if (!room)
			return;

		let player = null;

		if (room.player1.clientId === client.id)
			player = room.player1;
		else if (room.player2.clientId === client.id)
			player = room.player2;
		else
			return;

		player.ready = true;

		console.log(`Player ${player.login} confirmed match (opponent: ${player === room.player1 ? room.player2.login : room.player1.login})`);

		if (room.player1.ready && room.player2.ready)
		{
			server.to(room.player1.clientId).emit('onStartGame', {isPlayer1: true});
			server.to(room.player2.clientId).emit('onStartGame', {isPlayer1: false});
			// server.to([room.player1.clientId, room.player2.clientId]).emit('onStartGame', room);
			server.to([room.player1.clientId, room.player2.clientId]).emit('onScoreChange', {player1Score: 0, player2Score: 0});
			this.resetBall(room, server);
			this.resetPaddles(room, server);
			console.log(`Game between ${room.player1.login} and ${room.player2.login} started`);
		}
	}

	removeGameRoomPlayer(gameRoom: IGameRoom, id: string)
	{
		if (gameRoom.player1.clientId === id)
			gameRoom.player1 = null;
		else if (gameRoom.player2.clientId === id)
			gameRoom.player2 = null;

		if (!gameRoom.player1 || !gameRoom.player2)
		{
			this.gameRooms = this.gameRooms.filter(room => room.id !== gameRoom.id);
			console.log(`Game room ${gameRoom.id} removed because user left (total game rooms: ${this.gameRooms.length})`);
		}
	}

	removeClient(clientId: string)
	{
		this.matchmakingPlayers = this.matchmakingPlayers.filter(player => player.clientId !== clientId);
		this.gameRooms.forEach(gameRoom => this.removeGameRoomPlayer(gameRoom, clientId));
	}

	handlePlayerPaddleMove(client: IWebsocketClient, payload: IGameMovePayload, server: Server)
	{
		const room = this.gameRooms.find(room => room.player1.clientId === client.id || room.player2.clientId === client.id);

		if (!room)
			return;

		let player = null;
		let opponent = null;

		if (room.player1.clientId === client.id)
		{
			player = room.player1;
			opponent = room.player2;
		}
		else if (room.player2.clientId === client.id)
		{
			player = room.player2;
			opponent = room.player1;
		}
		else
			return;

		server.to(opponent.clientId).emit('onOpponentPaddleMove', payload);
	}

	resetPaddles(room: IGameRoom, server: Server)
	{
		server.to([room.player1.clientId, room.player2.clientId]).emit('onResetPaddles');
	}

	resetBall(room: IGameRoom, server: Server)
	{
		const ball = {velocityX: 5, velocityY: Math.random() * 5};

		server.to([room.player1.clientId, room.player2.clientId]).emit('onBallReset', ball);
	}

	getClientGameRoom(client: IWebsocketClient): IGameRoom
	{
		return this.gameRooms.find(room => room.player1.clientId === client.id || room.player2.clientId === client.id);
	}
}
