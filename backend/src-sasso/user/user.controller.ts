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

  ///////////////////////
  ///      SHOWS      ///
  ///////////////////////

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async showMe(@Req() req) : Promise<any> {
      const data = await this.jwt.verifyAsync(req.cookies['tshdc']);
      return await this.userService.showProfile(data['id'])
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/:idIntra')
  async showProfile(@Param('idIntra') query : string) : Promise<any> {
     return  await this.userService.showStats(query)
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async showUsers() : Promise<any> {
      return await this.userService.showUsers()
  }

  ///////////////////////
  ///  EDIT PROFILE   ///
  ///////////////////////

  @Post('edit/showedname/')
  async updateShowedName(@Body() body , @Req() req) : Promise<any> {
      if (await this.permissionService.is_current_user(req, body.idIntra))
          return await this.userService.updateShowedName(body)
      else
          throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
  }

  @Post('edit/updateAvatar/')
  async updateAvatar(@Body() body, @Req() req) : Promise<any> {
      if (await this.permissionService.is_current_user(req, body.idIntra))
          return await this.userService.updateAvatar(body)
      else
          throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
  }

  @Post('edit/phone/')
  async updatePhone(@Body() body, @Req() req) : Promise<any> {
      if (await this.permissionService.is_current_user(req, body.idIntra))
          return await this.userService.updatePhone(body);
      else
          throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
  }

  @Post('edit/mail/')
  async updateMail(@Body() body, @Req() req) : Promise<any> {
      if (await this.permissionService.is_current_user(req, body.idIntra))
          return await this.userService.updateMail(body);
      else
          throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
  }

  ///////////////////////
  ///    PUNISHMENT   ///
  ///////////////////////

  @Post('ban')
  async banUser(@Body() body, @Req() req) : Promise<any> {
      if (await this.permissionService.is_administrator(req))
          return await this.userService.banUser(body);
      else
          throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
  }

  @Post('unBan')
  async unBanUser(@Body() body, @Req() req) : Promise<any> {
      if (await this.permissionService.is_administrator(req))
          return await this.userService.unBanUser(body);
      else
          throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
  }

  @Post('addAdmin')
  async addAdmin(@Body() body, @Req() req) : Promise<void> {
      if (await this.permissionService.is_owner(req))
          return await this.userService.addUserSiteAdmin(body)
      else
          throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
  }

  @Post('removeAdmin')
  async removeAdmin(@Body() body, @Req() req) : Promise<void> {
      if (await this.permissionService.is_owner(req))
          return await this.userService.removeUserSiteAdmin(body)
      else
          throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED)
  }

  ///////////////////////
  ///       2FA       ///
  ///////////////////////

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
