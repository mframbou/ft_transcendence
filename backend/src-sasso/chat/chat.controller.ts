// Nest
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Req,
    UseGuards,
  } from '@nestjs/common';
  
  // Transcendence
  import { ChatService } from './chat.service';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { PermissionService } from '../permission/permission.service';
  
  @Controller('chat')
  export class ChatController {
    constructor(
      private permissionService: PermissionService,
      private chatService: ChatService,
    ) {}
  
    ///////////////////////
    /// BASIC FUNCTIONS ///
    ///////////////////////
  
    @UseGuards(JwtAuthGuard)
    @Post('addparticipant')
    async addParticipant(@Body() participant: any, @Req() req): Promise<void> {
      if (
        (await this.permissionService.is_administrator(req)) ||
        (await this.permissionService.is_admin(req, Number(participant.idChat)))
      )
        await this.chatService.addParticipant(participant);
      else throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
    }
  
    @UseGuards(JwtAuthGuard)
    @Delete('removeparticipant')
    async removeParticipant(@Body() participant: any, @Req() req): Promise<void> {
      if (
        (await this.permissionService.not_immune_user(participant)) &&
        ((await this.permissionService.is_administrator(req)) ||
          (await this.permissionService.is_admin(
            req,
            Number(participant.idChat),
          )) ||
          (await this.permissionService.is_mod(req, Number(participant.idChat))))
      )
        await this.chatService.removeParticipant(participant);
      else throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
    }
  
    @UseGuards(JwtAuthGuard)
    @Post('leavechat')
    async leaveChat(@Body() me: any): Promise<void> {
      await this.chatService.leaveChat(me);
    }
  
    //////////////////////
    /// ADD PRIVILEGES ///
    //////////////////////
  
    @UseGuards(JwtAuthGuard)
    @Post('addadmin')
    async addAdmin(@Body() admin: any, @Req() req): Promise<void> {
      if (
        (await this.permissionService.is_administrator(req)) ||
        (await this.permissionService.is_admin(req, admin.idChat))
      )
        await this.chatService.addAdmin(admin);
      else throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
    }
  
    @UseGuards(JwtAuthGuard)
    @Post('addmod')
    async addMod(@Body() moderator: any, @Req() req): Promise<void> {
      if (
        (await this.permissionService.is_administrator(req)) ||
        (await this.permissionService.is_admin(req, moderator.idChat))
      )
        await this.chatService.addMod(moderator);
      else throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
    }
  
    //////////////////////
    /// DEL PRIVILEGES ///
    //////////////////////
  
    @UseGuards(JwtAuthGuard)
    @Delete('removeadmin')
    async removeAdmin(@Body() admin: any, @Req() req): Promise<void> {
      if (await this.permissionService.is_administrator(req))
        await this.chatService.removeAdmin(admin);
      else throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
    }
  
    @UseGuards(JwtAuthGuard)
    @Delete('removemod')
    async removeMod(@Body() moderator: any, @Req() req): Promise<void> {
      if (
        (await this.permissionService.is_administrator(req)) ||
        (await this.permissionService.is_admin(req, moderator.idChat))
      )
        await this.chatService.removeMod(moderator);
      else throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
    }
  
    //////////////////////
    ///   PUNISHMENT   ///
    //////////////////////
  
    @UseGuards(JwtAuthGuard)
    @Post('banUser')
    async banUser(@Body() banReq: any, @Req() req): Promise<void> {
      if (
        (await this.permissionService.not_immune_user(banReq)) &&
        ((await this.permissionService.is_administrator(req)) ||
          (await this.permissionService.is_admin(req, Number(banReq.idChat))) ||
          (await this.permissionService.is_mod(req, Number(banReq.idChat))))
      )
        await this.chatService.banUser(banReq);
      else throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
    }
  
    @UseGuards(JwtAuthGuard)
    @Post('muteParticipant')
    async muteParticipant(@Body() muteReq: any, @Req() req): Promise<void> {
      if (
        (await this.permissionService.not_immune_user(muteReq)) &&
        ((await this.permissionService.is_administrator(req)) ||
          (await this.permissionService.is_admin(req, Number(muteReq.idChat))) ||
          (await this.permissionService.is_mod(req, Number(muteReq.idChat)))) &&
        (await this.permissionService.not_immune_user(muteReq))
      )
        await this.chatService.muteParticipant(muteReq);
      else throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
    }
  
    @UseGuards(JwtAuthGuard)
    @Post('unmuteParticipant')
    async unmuteParticipant(@Body() unMuteReq: any, @Req() req): Promise<void> {
      if (
        (await this.permissionService.not_immune_user(unMuteReq)) &&
        ((await this.permissionService.is_administrator(req)) ||
          (await this.permissionService.is_mod(req, Number(unMuteReq.idChat))) ||
          (await this.permissionService.is_admin(req, Number(unMuteReq.idChat))))
      )
        await this.chatService.unmuteParticipant(unMuteReq);
      else throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
    }
  
    ///////////////////////
    ///  CHAT SEARCHES  ///
    ///////////////////////
  
    @UseGuards(JwtAuthGuard)
    @Get('show/:id')
    async showChatPerUser(@Param('id') id: string, @Req() req): Promise<any> {
      if (await this.permissionService.is_current_user(req, id))
        return await this.chatService.showUsersChats(id);
      else throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
    }
  
    @UseGuards(JwtAuthGuard)
    @Get('show')
    async showChat(@Req() req): Promise<any> {
      if (await this.permissionService.is_administrator(req))
        return await this.chatService.showChats();
      else throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
    }
  
    @UseGuards(JwtAuthGuard)
    @Get('public')
    async showPublic(): Promise<any> {
      return await this.chatService.showPublic();
    }
  
    @UseGuards(JwtAuthGuard)
    @Get('private')
    async showPrivate(@Req() req): Promise<any> {
      if (await this.permissionService.is_administrator(req))
        return await this.chatService.showPrivate();
      else throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
    }
  
    ///////////////////////
    /// DB INTERACTIONS ///
    ///////////////////////
  
    @UseGuards(JwtAuthGuard)
    @Post('updatePwd')
    async updateChatPwd(
      @Body() body: { idChat: number; pwd: string },
      @Req() req,
    ): Promise<void> {
      if (
        (await this.permissionService.is_administrator(req)) ||
        (await this.permissionService.is_admin(req, body.idChat))
      )
        await this.chatService.updateChatPwd(body);
      else throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
    }
  
    @UseGuards(JwtAuthGuard)
    @Delete('delete')
    async deleteChat(@Body() body: any, @Req() req): Promise<any> {
      if (
        (await this.permissionService.is_administrator(req)) ||
        (await this.permissionService.is_admin(req, Number(body.id)))
      )
        return await this.chatService.deleteChat(Number(body.id));
      else throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
    }
  
    @UseGuards(JwtAuthGuard)
    @Delete('emptyChats')
    async emptyChat(@Req() req): Promise<any> {
      if (await this.permissionService.is_owner(req))
        return await this.chatService.emptyChat();
      else throw new HttpException('Not Authorized', HttpStatus.UNAUTHORIZED);
    }
  }