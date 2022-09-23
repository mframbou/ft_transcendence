import { SubscribeMessage, WebSocketGateway, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';
import { IGameMovePayload, IGamePlayer, IJwtPayload, IWebsocketClient } from '../interfaces/interfaces';
import { AuthService } from '../auth/auth.service';
import { getCookie } from '../utils/utils';
import { WebsocketsService } from '../websockets/websockets.service';
import { Server } from 'socket.io';
import { GameService } from './game.service';


const NAMESPACE = 'pong';

@WebSocketGateway(3001,{
  cors: {origin: '*'},
  namespace: NAMESPACE,
})
// @UseGuards(JwtTwoFactorAuthGuard)
export class GameGateway implements OnGatewayDisconnect
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
    this.gameService.handleDisconnect(clientToRemove.id);
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
  }

  @SubscribeMessage('onConfirmMatch')
  async handleOnConfirmMatch(client: any, payload: any)
  {
    const user = this.websocketsService.getClient(client.id);

    if (!user)
      return;

    this.gameService.confirmMatch(user, this.server);
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
  }

}