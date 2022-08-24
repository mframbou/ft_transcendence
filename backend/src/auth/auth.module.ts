// Nest
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

// Transcendence
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService} from "../prisma/prisma.service";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.API42_CLIENT_SECRET,
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService],
  exports: [JwtModule],
})
export class AuthModule {}
