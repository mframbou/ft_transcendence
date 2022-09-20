import { Module } from '@nestjs/common';
import { ChatGateway } from 'src/websockets/chat.gateway';
import { ChatService } from './chat.service';

@Module({
  providers: [ChatGateway]
})
export class ChatModule {}
