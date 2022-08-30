import { Module} from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { PrismaService } from "../prisma/prisma.service";
import {AuthService} from "../auth/auth.service";
import {PermissionService} from "../permission/permission.service";
import {PermissionModule} from "../permission/permission.module";
import {AuthModule} from "../auth/auth.module";


@Module({
  imports:[PermissionModule,AuthModule],
  controllers: [FriendsController],
  providers: [FriendsService, PrismaService, AuthService, PermissionService]
})
export class FriendsModule {}
