import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayDisconnect,
  OnGatewayConnection,
  WebSocketServer,
  WsException
} from '@nestjs/websockets';
import { EUserStatus, IJwtPayload, IWebsocketClient, IWsClient } from '../interfaces/interfaces';
import { AuthService } from '../auth/auth.service';
import { WebsocketsService } from '../websockets/websockets.service';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import {
  SpecialModeDto,
  WsAcceptDuelDto,
  WsDuelDto,
  WsFirstConnectDto,
  WsPaddleMoveDto,
  WsSpectateDto
} from '../interfaces/dtos';
import { UseFilters, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../auth/ws-auth.guard';
import { PermissionsService } from '../permissions/permissions.service';
import { DuelService } from '../duel/duel.service';
import errorDispatcher from '../utils/error-dispatcher';

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
      private permissionsService: PermissionsService,
      private duelService: DuelService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: any, ...args: any[])
  {
    const jwtPayload = await this.websocketsService.getFirstConnectionJwt(client);

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

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('enableSpecialMode')
  async enableSpecialMode(client: IWsClient, payload: SpecialModeDto)
  {
    const user = client.transcendenceUser;

    if (payload.mode === 'bingChilling' && await this.permissionsService.isOwner(user.login))
    {
      this.gameService.enableBingChilling(user.id);
    }
    else if (payload.mode === 'notChilling' && (user.login === 'tac' || user.login === 'palmi' || user.login === 'yoshi' || user.login === 'mel' || user.login === 'mframbou'))
    {
      this.gameService.enableNotChilling(user.id);
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('disableSpecialMode')
  async disableSpecialMode(client: IWsClient, payload: SpecialModeDto)
  {
    const user = client.transcendenceUser;

    if (payload.mode === 'bingChilling')
    {
      this.gameService.disableBingChilling(user.id);
    }
    else if (payload.mode === 'notChilling')
    {
      this.gameService.disableNotChilling(user.id);
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('startDuel')
  async startDuel(client: IWsClient, payload: WsDuelDto)
  {
    const user = client.transcendenceUser;

    const opponents = this.websocketsService.getClientsByLogin(payload.login, NAMESPACE);

    if (opponents.length === 0)
    {
      console.log(`No opponents found for ${user.login} to duel`);
      throw new WsException('Player not found');
    }

    try
    {
      await this.duelService.createDuel(user, opponents, this.server);
      console.log(`${user.login} sent a duel request to ${payload.login}`);
    }
    catch (e)
    {
      errorDispatcher(e, true);
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('acceptDuel')
  async acceptDuel(client: IWsClient, payload: WsAcceptDuelDto)
  {
    const user = client.transcendenceUser;

    try
    {
      await this.duelService.acceptDuel(user.id, payload.clientId, this.server);
    }
    catch (e)
    {
      errorDispatcher(e, true);
    }
  }

}