import { SubscribeMessage, WebSocketGateway, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';
import { IGameMovePayload, IGamePlayer, IJwtPayload, IWebsocketClient } from '../interfaces/interfaces';
import { AuthService } from '../auth/auth.service';
import { getCookie } from '../utils/utils';
import { WebsocketsService } from './websockets.service';
import { Server } from 'socket.io';
import { GameService } from '../game/game.service';


const NAMESPACE = 'pong';

@WebSocketGateway(3001,{
  cors: {origin: '*'},
  namespace: NAMESPACE,
})
// @UseGuards(JwtTwoFactorAuthGuard)
export class PongGateway implements OnGatewayDisconnect
{
  constructor(
      private authService: AuthService,
      private websocketsService: WebsocketsService,
      private gameService: GameService,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('first_connect')
  async handleFirstConnect(client: any, payload: any)
  {
    if (!payload)
    {
      client.disconnect();
      return;
    }

    const jwtPayload: IJwtPayload = await this.authService.getJwtFromCookie(payload);

    this.websocketsService.addClient({id: client.id, login: jwtPayload.login, namespace: NAMESPACE});
  }

  async handleDisconnect(client: any)
  {
    const clientToRemove: IWebsocketClient = this.websocketsService.getClient(client.id);
    if (!clientToRemove)
      return;

    this.websocketsService.removeClient(clientToRemove.id);
    this.gameService.removeClient(clientToRemove.id);
  }

  // @SubscribeMessage('join')
  // async handleMessage(client: any, payload: any)
  // {
  //   const user = this.websocketsService.getClient(client.id);
  //
  //   if (!user)
  //     return;
  //
  //   console.log(`${NAMESPACE}-Gateway: ${user.login}: ${payload}`);
  // }

  gameUsers: any[] = [];
  waitingForConfirmUsers: any[] = [];
  playingUsers: any[] = [];

  matchmakingUsers: any[] = [];
  gameRooms: any[] = [];


  @SubscribeMessage('onStartMatchmaking')
  async handleOnGameReady(client: any, payload: any)
  {
    const user = this.websocketsService.getClient(client.id);

    if (!user)
      return;

    this.gameService.startMatchmaking(user, this.server);

    // if(!this.gameUsers.find(u => u.user.login === user.login && u.client.id === client.id)) {
    //   console.log(`add ${user.login} to game`);
    //   this.gameUsers.push({client: client, user: user});
    // }
    // else {
    //   console.log(`user ${user.login} already in game`);
    // }
    //
    // if (this.gameUsers.length >= 2)
    // {
    //   const player1 = this.gameUsers[0];
    //   const player2 = this.gameUsers[1];
    //
    //   this.gameUsers = this.gameUsers.filter(u => u.user.login !== player1.login && u.user.login !== player2.login);
    //
    //   console.log(`Starting game between ${player1.user.login} and ${player2.user.login}`);
    //
    //   this.server.to(player1.client.id).emit('onMatchFound', '');
    //   this.server.to(player2.client.id).emit('onMatchFound', '');
    //
    //   this.waitingForConfirmUsers.push(player1, player2);
    // }
  }

  @SubscribeMessage('onConfirmMatch')
  async handleOnConfirmMatch(client: any, payload: any)
  {
    const user = this.websocketsService.getClient(client.id);

    if (!user)
      return;

    this.gameService.confirmMatch(user, this.server);

    // const player = this.waitingForConfirmUsers.find(u => u.client.id === client.id);
    //
    // if (!player)
    //   return;
    //
    // this.waitingForConfirmUsers = this.waitingForConfirmUsers.filter(u => u.client.id !== client.id);
    // this.playingUsers.push(player);
    //
    // if (this.playingUsers.length >= 2)
    // {
    //   const player1 = this.playingUsers[0];
    //   const player2 = this.playingUsers[1];
    //
    //   this.playingUsers = this.playingUsers.filter(u => u.user.login !== player1.login && u.user.login !== player2.login);
    //
    //   const isFirstPlayer = Math.random() > 0.5;
    //
    //   this.server.to(player1.client.id).emit('onStartGame', {player: isFirstPlayer ? 1 : 2});
    //   this.server.to(player2.client.id).emit('onStartGame', {player: isFirstPlayer ? 2 : 1});
    // }
  }

  @SubscribeMessage('onPaddleMove')
  async handleOnPaddleMove(client: any, payload: any)
  {
    const user = this.websocketsService.getClient(client.id);

    if (!user)
      return;

    if (!payload || !payload.y)
      return;

    payload = <IGameMovePayload> payload;

    this.gameService.handlePlayerPaddleMove(user, payload, this.server);

    // const player = this.playingUsers.find(u => u.client.id === client.id);
    //
    // if (!player)
    //   return;
    //
    // const opponent = this.playingUsers.find(u => u.client.id !== client.id);
    //
    // if (!opponent)
    //   return;
    //
    //
    // this.server.to(opponent.client.id).emit('onOpponentPaddleMove', {y: payload.y});
  }

  @SubscribeMessage('onPlayerScored')
  async handleOnPlayerScored(client: any, payload: any)
  {
    const user = this.websocketsService.getClient(client.id);

    if (!user)
      return;

    const room = this.gameService.getClientGameRoom(user);

    if (!room)
      return;

    // change score

    const isPlayer1: boolean = room.player1.clientId === user.id;

    if (isPlayer1)
      room.player1.score++;
    else
      room.player2.score++;

    this.server.to([room.player1.clientId, room.player2.clientId]).emit('onScoreChange', {player1Score: room.player1.score, player2Score: room.player2.score});
    this.gameService.resetBall(room, this.server);
  }

  @SubscribeMessage('onOpponentScored')
  async handleOnOpponentScored(client: any, payload: any)
  {
    const user = this.websocketsService.getClient(client.id);

    if (!user)
      return;

    const room = this.gameService.getClientGameRoom(user);

    if (!room)
      return;

    // change score

    const isPlayer1: boolean = room.player1.login === user.login;

    if (isPlayer1)
      room.player2.score++;
    else
      room.player2.score++;

    this.server.to([room.player1.clientId, room.player2.clientId]).emit('onScoreChange', {player1Score: room.player1.score, player2Score: room.player2.score});
    this.gameService.resetBall(room, this.server);
  }

}