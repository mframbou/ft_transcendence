import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway({
  // To avoid 'access to XMLHttpRequest at 'http://med:3000/socket.io/?EIO=4&transport=polling&t=OBWHsJr' from origin 'http://med:3001' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.'
  cors: {origin: '*'}
})
export class AppGateway {

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    console.log("received msg: ", payload);
    return 'Hello world!';
  }

  @SubscribeMessage('connection')
  handleConnect(client: any, payload: any): string {
    console.log("received connect: ", client.id);
    // console.log("client: ", client);
    return 'Hello world!';
  }


}
