// Nest
import { Module } from '@nestjs/common';

// Transcendence
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { PrismaModule } from './prisma/prisma.module';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { TwoFactorService } from './two-factor/two-factor.service';
import { TwoFactorController } from './two-factor/two-factor.controller';
import { StatusGateway } from './websockets/status.gateway';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtTwoFactorStrategy } from './auth/jwt-two-factor.strategy';
import { PermissionsService } from './permissions/permissions.service';
import { ChatGateway } from './websockets/chat.gateway';
import { WebsocketsService } from './websockets/websockets.service';

@Module({
	controllers: [AppController, AuthController, UsersController, TwoFactorController],
	imports: [
		PrismaModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
		}),
	],
	providers: [AppService, AuthService, UsersService, TwoFactorService, StatusGateway, JwtStrategy, JwtTwoFactorStrategy, PermissionsService, StatusGateway, ChatGateway, WebsocketsService],
})
export class AppModule
{}
