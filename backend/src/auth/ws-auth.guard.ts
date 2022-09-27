import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { WebsocketsService } from '../websockets/websockets.service';
import { Socket } from 'socket.io';
import { IWsClient } from '../interfaces/interfaces';

@Injectable()
export class WsAuthGuard implements CanActivate {

  constructor(
      private websocketsService: WebsocketsService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const client: IWsClient = context.switchToWs().getClient();
    const user = this.websocketsService.getClient(client.id);

    if (!user)
    {
      console.log(`User ${client.id} not found in websocketsService`);
      client.disconnect();
      return false;
    }

    client.transcendenceUser = user;
    return true;
  }
}
