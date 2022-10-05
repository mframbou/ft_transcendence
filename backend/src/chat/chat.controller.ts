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
  import { AddRoomDto, AddParticipantDto, JoinProfileDto} from 'src/interfaces/dtos';
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
        //return await this.chatService.addRoom(payload.login, room.name, room.is_private, room.password);
        return await this.chatService.addRoom(payload.login, room);
    }

    @Post('joinRoom')
    async join(@Body() data: AddParticipantDto, @Req() req: IUserRequest) {
        const payload = req.jwtPayload;
        console.log("join payload: ", payload);
        console.log("data in joinRoom (controller): " + JSON.stringify(data));
        return await this.chatService.join(payload.login, data.chatId, data.password);
    }

    @Post('joinProfileChat')
    async joinProfileChat(@Body() data: JoinProfileDto, @Req() req: IUserRequest) {
        const payload = req.jwtPayload;
        console.log("join payload: ", payload);
        console.log("data in joinRoom (controller): " + JSON.stringify(data));
        return await this.chatService.joinProfileChat(data.login1, data.login2);
    }


    @Get('rooms')
    async rooms(@Req() req: IUserRequest, @Query('name') params?): Promise<any> {
        const payload = req.jwtPayload;

        return await this.chatService.rooms(payload.login, params);
    }

    // dbg
    @Get('clearAll')
    async clearAll(@Req() req: IUserRequest): Promise<any> {
        return await this.chatService.clearAll();
    }
  
  }