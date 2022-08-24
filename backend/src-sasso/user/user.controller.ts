// Nest
import { JwtService } from '@nestjs/jwt';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

// Transcendence
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionService } from '../permission/permission.service';
import error_dispatcher from '../error-dispatcher/error-dispatcher';

@Controller('users')
export class UserController {
  constructor(
    private jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('activate/2fa/:id')
  async two_factore_activation(
    @Param('id') id: string,
    @Req() req,
  ): Promise<HttpStatus> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: Number(id) },
      });
      if (await this.permissionService.is_current_user(req, user.idIntra))
        return await this.userService.two_factor_activate(Number(id));
      else throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
    } catch (e: any) {
      error_dispatcher(e);
    }
  }

  @Post('deactivate/2fa/:id')
  async two_factor_dectivation(
    @Param('id') idIntra: string,
    @Req() req,
  ): Promise<any> {
    try {
      if (
        (await this.permissionService.is_administrator(req)) ||
        (await this.permissionService.is_current_user(req, idIntra))
      ) {
        return await this.userService.two_factor_dectivation(idIntra);
      } else {
        throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
      }
    } catch (e: any) {
      error_dispatcher(e);
    }
  }
}
