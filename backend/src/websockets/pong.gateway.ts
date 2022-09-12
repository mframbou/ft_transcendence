import { SubscribeMessage, WebSocketGateway, OnGatewayDisconnect, OnGatewayConnection } from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';
import { IJwtPayload, IWebsocketClient } from '../interfaces/interfaces';
import { AuthService } from '../auth/auth.service';
import { getCookie } from '../utils/utils';
import { WebsocketsService } from './websockets.service';


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

  ) {}

  @SubscribeMessage('first_connect')
  async handleFirstConnect(client: any, payload: any)
  {

    console.log('f irst_connect');
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

    console.log('clientToRemove = ', clientToRemove);
    this.websocketsService.removeClient(client.id);
  }

  @SubscribeMessage('join')
  async handleMessage(client: any, payload: any)
  {
    const user = this.websocketsService.getClient(client.id);

    if (!user)
      return;

    console.log('user = ', user);
    console.log(`${NAMESPACE}-Gateway: ${user.login}: ${payload}`);
  }



  gameUsers: any[] = [];


  @SubscribeMessage('onGameReady')
  async handleOnGameReady(client: any, payload: any)
  {
    const user = this.websocketsService.getClient(client.id);

    console.log('user = ', user);
    console.log(`${NAMESPACE}-Gateway: ${user.login}: ${payload}`);
    if(!this.gameUsers.find(u => u.login === user.login)) {
      console.log(`add ${user} to game`);
      this.gameUsers.push(user);
    }
    else {
      console.log(`user ${user} already in game`);
    }

  }


  // async handleConnection(client: any, ...args: any[])
  // {
  //     console.log(' pongPOUETPOUETPOEUJTIOHWOAFBIUOAEDIF join');
  // }

}