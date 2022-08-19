// Nest
import { CacheModule, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

// Transcendence
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { PermissionModule } from '../permission/permission.module';
import { PermissionService } from '../permission/permission.service';

@Module({
  imports: [AuthModule, PermissionModule],
  controllers: [UserController],
  providers: [UserService, PrismaService, AuthService, PermissionService],
  exports: [UserService],
})
export class UserModule {}
