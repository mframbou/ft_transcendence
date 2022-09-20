import { ConsoleLogger, Injectable } from '@nestjs/common';
import { UsersController } from 'src/users/users.controller';
import { IChatUser, IChatRoom, IWebsocketClient } from '../interfaces/interfaces';
import { Server } from 'socket.io';


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
    }

}
