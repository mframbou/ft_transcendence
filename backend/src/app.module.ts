// Nest
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';

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
import { AppGateway } from './app.gateway';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtTwoFactorStrategy } from './auth/jwt-two-factor.strategy';
import { PermissionsService } from './permissions/permissions.service';

@Module({
	controllers: [AppController, AuthController, UsersController, TwoFactorController],
	imports: [
		PrismaModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
		}),
	],
	providers: [AppService, AuthService, UsersService, TwoFactorService, AppGateway, JwtStrategy, JwtTwoFactorStrategy, PermissionsService],
})
export class AppModule
{
}
