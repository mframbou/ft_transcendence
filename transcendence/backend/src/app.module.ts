// Nest
import { Module, CacheModule } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

// Transcendence
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import {ConfigModule} from "@nestjs/config";

@Module({
  controllers: [AppController, AuthController],
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
  ],
  providers: [AppService, AuthService],
})
export class AppModule {}
