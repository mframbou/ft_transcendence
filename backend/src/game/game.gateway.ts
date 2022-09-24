import { SubscribeMessage, WebSocketGateway, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { IJwtPayload, IWebsocketClient, IWsClient } from '../interfaces/interfaces';
import { AuthService } from '../auth/auth.service';
import { WebsocketsService } from '../websockets/websockets.service';
import { Server } from 'socket.io';
import { GameService } from './game.service';
import { WsFirstConnectDto, WsPaddleMoveDto } from '../interfaces/dtos';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../auth/ws-auth.guard';


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
  async handleFirstConnect(client: any, payload: WsFirstConnectDto)
  {
    const jwtPayload: IJwtPayload = await this.authService.getJwtFromCookie(payload.cookie);
    if (!jwtPayload)
    {
      client.disconnect();
      return;
    }

    this.websocketsService.addClient({id: client.id, login: jwtPayload.login, namespace: NAMESPACE});
  }

  // cannot use guard here because guards disconnect and if disconnect this function is called so it's a problem
  async handleDisconnect(client: IWsClient)
  {
    this.websocketsService.removeClient(client.id);
    this.gameService.handleDisconnect(client.id);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('startMatchmaking')
  async handleOnGameReady(client: IWsClient, payload: any)
  {
    const user = client.transcendenceUser;

    this.gameService.startMatchmaking(user, this.server);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('confirmMatch')
  async handleOnConfirmMatch(client: IWsClient, payload: any)
  {
    const user = client.transcendenceUser;

    this.gameService.confirmMatch(user, this.server);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('paddleMove')
  async handleOnPaddleMove(client: any, payload: WsPaddleMoveDto)
  {
    const user = client.transcendenceUser;

    this.gameService.handlePlayerPaddleMove(user, payload, this.server);
  }

}