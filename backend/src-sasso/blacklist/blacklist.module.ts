// Nest
import {Module} from '@nestjs/common';

// Transcendence
import { BlacklistController } from './blacklist.controller';
import { BlacklistService } from './blacklist.service';
import { PrismaService } from "../prisma/prisma.service";
import {UserModule} from "../user/user.module";
import {UserService} from "../user/user.service";
import {AuthService} from "../auth/auth.service";
import {AuthModule} from "../auth/auth.module";
import {MySessionService} from "../session/session.service";
import {SessionModule} from "../session/session.module";
import {PermissionModule} from "../permission/permission.module";
import {PermissionService} from "../permission/permission.service";

@Module({
  imports: [UserModule, AuthModule, SessionModule, PermissionModule,],
  controllers: [BlacklistController],
  providers: [BlacklistService, PrismaService, UserService, AuthService, MySessionService, PermissionService]
})
export class BlacklistModule {}
