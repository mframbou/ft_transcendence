// Nest
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

// Transcendence
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserModule } from '../user/user.module';
import { PermissionService } from '../permission/permission.service';
import { PermissionModule } from '../permission/permission.module';

@Module({
  imports: [
    PermissionModule,
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: {
        expiresIn: '7days',
      },
    }),
    UserModule,
  ],
  controllers: [ChatController],
  providers: [ChatService, PrismaService, PermissionService],
})
export class ChatModule {}
