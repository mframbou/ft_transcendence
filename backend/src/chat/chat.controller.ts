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
import { AddRoomDto } from 'src/interfaces/dtos';
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


    @Get('rooms')
    async getChats(@Req() req: IUserRequest, @Query('name') params?): Promise<any> {

        //console.log("params : " + JSON.stringify(params));
        //const payload = req.jwtPayload;

        let res = await this.chatService.getRooms(params);
        return res;
        //console.log("res chat controler : " + JSON.stringify(res));
        //return (res ? res : new HttpException('bad room id', HttpStatus.BAD_REQUEST));
    }

    // TODO: add permission check
    // return participants of a room based on the room id
    @Post('participants')
    async roomParticipants(@Body() roomName: number, @Req() req: IUserRequest): Promise<any> {
          //const payload = req.jwtPayload;
  
          //return await this.chatService.clearAll();
        if (roomName == null) {
          return new HttpException('bad room id', HttpStatus.BAD_REQUEST);
        }
        console.log("body : " + JSON.stringify(roomName));
    }

    @Get('clearAll')
    async clearAll(@Req() req: IUserRequest): Promise<any> {
          const payload = req.jwtPayload;
  
          return await this.chatService.clearAll();
    }
  
  }