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
import { StatusGateway } from './status/status.gateway';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtTwoFactorStrategy } from './auth/jwt-two-factor.strategy';
import { PermissionsService } from './permissions/permissions.service';
import { ChatGateway } from './chat/chat.gateway';
import { WebsocketsService } from './websockets/websockets.service';
import { GameGateway } from './game/game.gateway';
import { GameService } from './game/game.service';
import { StatusService } from './status/status.service';
import { AdminController } from './admin/admin.controller';
import { JwtAdminStrategy } from './auth/jwt-admin.strategy.ts';
import { FriendsController } from './friends/friends.controller';
import { FriendsService } from './friends/friends.service';
import { ChatService } from './chat/chat.service';
import { ChatController } from './chat/chat.controller';
import { GameController } from './game/game.controller';
import { BlacklistController } from './blacklist/blacklist.controller';
import { BlacklistService } from './blacklist/blacklist.service';
import { NotificationService } from './notification/notification.service';
import { NotificationGateway } from './notification/notification.gateway';

@Module({
	controllers: [AppController, AuthController, UsersController, TwoFactorController, AdminController, FriendsController, ChatController, GameController, BlacklistController],
	imports: [
		PrismaModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
		}),
	],
	providers: [AppService, AuthService, UsersService, TwoFactorService, StatusGateway, JwtStrategy, JwtTwoFactorStrategy, JwtAdminStrategy, PermissionsService, ChatGateway, WebsocketsService, GameGateway, GameService, StatusService, FriendsService, ChatService, BlacklistService, NotificationService, NotificationService, NotificationGateway],
})
export class AppModule
{}
