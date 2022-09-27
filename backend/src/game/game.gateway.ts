import { SubscribeMessage, WebSocketGateway, OnGatewayDisconnect, OnGatewayConnection, WebSocketServer } from '@nestjs/websockets';
import { EUserStatus, IJwtPayload, IWebsocketClient, IWsClient } from '../interfaces/interfaces';
import { AuthService } from '../auth/auth.service';
import { WebsocketsService } from '../websockets/websockets.service';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { WsFirstConnectDto, WsPaddleMoveDto, WsSpectateDto } from '../interfaces/dtos';
import { UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../auth/ws-auth.guard';


const NAMESPACE = 'pong';

@WebSocketGateway(3001,{
  cors: {origin: '*'},
  namespace: NAMESPACE,
  transports: ['websocket'],
})
// @UseGuards(JwtTwoFactorAuthGuard)
export class GameGateway implements OnGatewayDisconnect, OnGatewayConnection
{
  constructor(
      private authService: AuthService,
      private websocketsService: WebsocketsService,
      private gameService: GameService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: any, ...args: any[])
  {
    const jwtParam = client.handshake.query.jwt;

    if (typeof jwtParam !== 'string')
    {
      client.disconnect();
      return;
    }

    const jwtPayload: IJwtPayload = await this.authService.getJwtFromCookie(jwtParam);
    if (!jwtPayload)
    {
      client.disconnect();
      return;
    }

    this.websocketsService.addClient({id: client.id, login: jwtPayload.login, namespace: NAMESPACE});
    this.server.to(client.id).emit('confirmFirstConnect', {login: jwtPayload.login});
  }

  // cannot use guard here because guards disconnect and if disconnect this function is called so it's a problem
  async handleDisconnect(client: Socket)
  {
    console.log('disconnect', client.id);
    this.websocketsService.removeClient(client.id);
    this.gameService.handlePlayerDisconnect(client.id);
    this.gameService.handleSpectatorDisconnect(client.id);
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
  async handleOnPaddleMove(client: IWsClient, payload: WsPaddleMoveDto)
  {
    const user = client.transcendenceUser;

    this.gameService.handlePlayerPaddleMove(user, payload);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('startSpectate')
  async startSpectatingMatch(client: IWsClient, payload: WsSpectateDto)
  {
    const user = client.transcendenceUser;

    this.gameService.addSpectator(payload.roomId, user);
  }

}