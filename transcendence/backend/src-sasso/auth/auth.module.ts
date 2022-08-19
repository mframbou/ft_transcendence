// Nest
import { CacheModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as redisStore from 'cache-manager-redis-store';

// Transcendence
import { PrismaService } from 'src/prisma/prisma.service';
import { MySessionService } from 'src/session/session.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: {
        expiresIn: '1d',
      },
    }),
    CacheModule.register({
      store: redisStore,
      host: 'rediStatus',
      port: 6379,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy, MySessionService],
  exports: [JwtModule],
})
export class AuthModule {}
