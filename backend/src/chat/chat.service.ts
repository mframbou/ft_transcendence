import { ConsoleLogger, Injectable } from '@nestjs/common';
import { UsersController } from 'src/users/users.controller';
import { IChatUser, IChatRoom, IWebsocketClient } from '../interfaces/interfaces';
import { Server } from 'socket.io';
import { subscribeOn } from 'rxjs';
import { RouterModule } from '@nestjs/core';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatService {
  constructor(
        private readonly prisma: PrismaService, 
        private readonly usersService: UsersService,
    ) {}

    chatRooms: IChatRoom[] = [];
    cur_id: number = 0;


    async addRoom(login: string, name: string, is_private: boolean, password?: string) {
        const user = await this.usersService.getUser(login);
        console.log("user in create room : " + JSON.stringify(user));


        await this.prisma.chatRoom.create({
            data: {
                name: name,
                //participents: {
                    //create: {
                        //is_admin: true,
                        //is_moderator: false,
                        //user: {
                            //connect: {
                                //login: login,
                            //}
                        //}
                    //}
                //},
                //participents: {
                    //create: {
                        //user: login, // to be change to user
                        //is_admin: true,
                        //is_moderator: false,
                    //}
                //}
            }
        });
        console.log("user in create room : " + JSON.stringify(user));

        return true;
    }

    async getChatRooms() {
        const chatRooms = await this.prisma.chatRoom.findMany();
        console.log("get chatRooms : " + JSON.stringify(chatRooms));

        return chatRooms;
    }

    async joinRoom(client: IWebsocketClient, server: Server, data: any) { 

        let cur_room: IChatRoom = this.chatRooms.find(room => room.id == data.room_id);
        if (cur_room == null) {
            console.log("Room " + data.room_id + " not found");
        }

        cur_room.users = [...cur_room.users, {clientId: client.id, login: client.login, is_admin: false, is_moderator: false}];

        server.to(client.id).emit('joinedRoom', data);
    }

	//this.chatService.getChatRooms(user, this.server, payload);
    async sendRooms(client: IWebsocketClient, server: Server, data: any) {
        let roomsIds: number[] = this.chatRooms.map(room => room.id);
        server.to(client.id).emit('onRoomsList', roomsIds);



        //await Promise.all(this.chatRooms.map(room => room.id)).then(async (value) => {
            //console.log("promise value : " + value);
            //server.to(client.id).emit('onRoomsList', value);

        //} );

        //console.log(roomsIds);
        //server.to(client.id).emit('onRoomsList', 'roomlist');
    }


    // ____________ CHAT ROOM  _____________ 


}
