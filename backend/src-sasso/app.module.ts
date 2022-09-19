// Nest
import { Module, CacheModule } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

// Transcendence
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { SessionModule } from './session/session.module';
import { MySessionService } from './session/session.service';
import { PermissionModule } from './permission/permission.module';
import {JwtModule} from "@nestjs/jwt";
import { PermissionService } from './permission/permission.service';

@Module({
  controllers: [AppController, AuthController],
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    SessionModule,
    PermissionModule,
    CacheModule.register({
      store: redisStore,
      host: 'rediStatus',
      port: 6379,
    }),
  ],
  providers: [AppService, MySessionService, AuthService, UserService, PermissionService],
})
export class AppModule {}
