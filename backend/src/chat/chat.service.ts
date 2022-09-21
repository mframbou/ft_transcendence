import { ConsoleLogger, Injectable } from '@nestjs/common';
import { UsersController } from 'src/users/users.controller';
import { IChatUser, IChatRoom, IWebsocketClient } from '../interfaces/interfaces';
import { Server } from 'socket.io';
import { subscribeOn } from 'rxjs';
import { RouterModule } from '@nestjs/core';


@Injectable()
export class ChatService {
    constructor() {}

    chatRooms: IChatRoom[] = [];
    cur_id: number = 0;

    async createRoom(client: IWebsocketClient, server: Server, data: any){ //, data: any) {
        let user: IChatUser = {clientId: client.id, login: client.login, is_admin: true, is_moderator: true} ;
        const chatRoom: IChatRoom = {
            id: this.cur_id++,
            name: data.name,
            users: [{clientId: client.id, login: client.login, is_admin: true, is_moderator: true}],
            is_private: false,
            password: data.password
        };

        this.chatRooms.push(chatRoom);
        console.log("Creating chat room " + chatRoom.name + " for " + client.login + "-" + client.id + " (total chat rooms: " + this.chatRooms.length + ")");

        server.to(client.id).emit('onRoomCreated', chatRoom.id);
        this.sendRooms(client, server, data);
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
