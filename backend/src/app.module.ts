// Nest
import {MiddlewareConsumer, Module, RequestMethod} from '@nestjs/common';

// Transcendence
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {AuthService} from './auth/auth.service';
import {AuthController} from './auth/auth.controller';
import {PrismaModule} from "./prisma/prisma.module";
import {UsersService} from './users/users.service';
import {UsersController} from './users/users.controller';
import {TwoFactorService} from './two-factor/two-factor.service';
import {TwoFactorController} from './two-factor/two-factor.controller';
import {StatusController} from './status/status.controller';
import {StatusService} from './status/status.service';
import {StatusMiddleware} from "./status.middleware";

@Module({
  controllers: [AppController, AuthController, UsersController, TwoFactorController, StatusController],
  imports: [
    PrismaModule,
  ],
  providers: [AppService, AuthService, UsersService, TwoFactorService, StatusService],
})
export class AppModule {
  // https://docs.nestjs.com/middleware
  configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(StatusMiddleware)
        .exclude('/status/offline')
        .forRoutes('*')
  }
}
