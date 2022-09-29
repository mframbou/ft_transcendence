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
    Query,
    Req,
    UseGuards,
  } from '@nestjs/common';
  
  // Transcendence
  import { ChatService } from './chat.service';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { JwtTwoFactorAuthGuard } from 'src/auth/jwt-two-factor-auth.guard';
  import { IUserRequest } from 'src/interfaces/interfaces';
  import { AddRoomDto, AddParticipantDto} from 'src/interfaces/dtos';
import { get } from 'http';
  //import { PermissionService } from '../permission/permission.service';
  
  @UseGuards(JwtTwoFactorAuthGuard)
  @Controller('chat')
  export class ChatController {
    constructor(
      //private permissionService: PermissionService,
      private chatService: ChatService,
    ) {}

    @Post('addRoom')
    async addRoom(@Body() room: AddRoomDto , @Req() req: IUserRequest) {
        const payload = req.jwtPayload;
        return await this.chatService.addRoom(payload.login, room.name, room.is_private, room.password);
    }

    @Post('joinRoom')
    async join(@Body() data: AddParticipantDto, @Req() req: IUserRequest) {
        const payload = req.jwtPayload;
        console.log("data in joinRoom (controller): " + JSON.stringify(data));
        return await this.chatService.join(data.chatId, data.userId, data.password);
    }

    @Get('rooms')
    async rooms(@Req() req: IUserRequest, @Query('name') params?): Promise<any> {
        return await this.chatService.rooms(params);
    }

    // dbg
    @Get('clearAll')
    async clearAll(@Req() req: IUserRequest): Promise<any> {
        return await this.chatService.clearAll();
    }
  
  }