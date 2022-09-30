import { ConsoleLogger, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersController } from 'src/users/users.controller';
import { IChatUser, IChatRoom, IWebsocketClient } from '../interfaces/interfaces';
import { Server } from 'socket.io';
import { subscribeOn } from 'rxjs';
import { RouterModule } from '@nestjs/core';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { connect, sensitiveHeaders } from 'http2';
import errorDispatcher from 'src/utils/error-dispatcher';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { disconnect } from 'process';

@Injectable()
export class ChatService {
  constructor(
        private readonly prisma: PrismaService, 
        private readonly usersService: UsersService,
    ) {}

    // roomsclients store the client id of each user in each room
    // cringe -> better if we have map of array where key is roomId and value is array of clients
    // TODO : stop sending userId and use client.login instead -> less optimization but more security as we can't falsify userId
    roomsClients = [];

    // enter/leave update roomsClients
	async enter(server: any, client: any, payload: any) {
        console.log("enter");
        let cur_room = await this.prisma.chatRoom.findUnique({
            where: { id: payload.roomId },
        });

        if (cur_room.banned.find((cur) => cur == client.login)) {
            this.sendError(server, client, "You are banned from this room");
            return ;
        }
        this.roomsClients.push({user: payload.user, roomId: payload.roomId, clientId: client.id});
    }

    async leave(server: any, client: any, payload: any) {
        console.log("leave");
        this.roomsClients = this.roomsClients.filter((cur) => cur.clientId !== client.id);
    }

    // utils function to send stuff to client in a room (if client provided send only to him)
    async sendTo(server: any, chatId: any, trigger: string, content: any, client?: any) {
        if (client) {
            server.to(client.id).emit(trigger, content);
        } else {
            for (let cur of this.roomsClients) {
                if (chatId == cur.roomId) {
                    server.to(cur.clientId).emit(trigger, content);
                }
            }
        }
    }

    async sendError(server: any, client: any, content: string) {
        server.to(client.id).emit('commandError', content);
    }

    async sendStatus(server: any, client: any, participant: any, chatId: any, content: any) {

        try {
            let message = await this.prisma.message.create({
                data: {
                    chatId: chatId,
                    content: content,
                    senderId: participant.user.id,
                    isStatus: true
                },
            });

            this.sendTo(server, chatId, 'receiveMessage', {isStatus: true, content: content});
        }
        catch (e) {
            // should send error only to the client who emit the command
            this.sendError(server, client, "Unknown error");
            return ; 
        }
    }


    async addRoom(login: string, name: string, is_private: boolean, password?: string) {

        const user = await this.usersService.getUser(login);

        if (await this.prisma.chatRoom.findUnique({where: {name: name}})) {
            throw new HttpException('Room already exist with this name', 403);
        }

        if (is_private && password.length < 4) {
            throw new HttpException('Passord is too short', 403);
        }

        try {
            let cur_room = await this.prisma.chatRoom.create({
                data: {
                    name: name,
                    is_private: is_private,
                    hash: password,
                    participants: {
                        create: [{
                            is_admin: true,
                            is_moderator: false,
                            userId: user.id
                        }]
                    },
                },
                include: {
                    participants: {
                        include: { user: true }
                    },
                    messages: {
                        include: { sender: true }
                    },
                }
            });

            console.log("room created: " + JSON.stringify(cur_room));

            return HttpStatus.OK;
        }
        catch (e) {
            throw new HttpException('Unknown error', 403);
        }
    }

    async join(chatId: number, userId: number, password?: string) {

        let participant = await this.prisma.participant.findMany({
            where: {
                chatId: chatId,
                userId: userId
            },
        });

        if (participant.length > 0) // already in room
            return;

        let current_room = await this.prisma.chatRoom.findUnique({
            where: { id: chatId },
        });

        // need to encrypt password :)
        if (current_room.is_private && current_room.hash != password) {
            throw new HttpException('Incorrect password', 403);
        }

        // create participant for user in room
        try {
            await this.prisma.participant.create({
                data: {
                    chatId: chatId,
                    userId: userId,
                    is_admin: false,
                    is_moderator: false,
                }
            });
        } catch (e) {
            throw new HttpException('Unknown error', 403);
        }
    
        return HttpStatus.OK;
    }


    // need error management
    async handleMessage(server: any, client: any, chatId: any, userId: any, content: string) {

        // would be better with findUnique
        let participant =  await this.prisma.participant.findMany({
            where: {
                chatId: chatId,
                userId: userId
            },
            include: { user: true }
        });

        if (!participant[0]) {
            this.sendError(server, client, "You are not in this room");
            return ;
        }

        if (content.trim()[0] === '/') {
            console.log("command");
            return await this.command(server, client, participant[0], chatId, content);
        }

        try {
            let message = await this.prisma.message.create({
                data: {
                    chatId: chatId,
                    content: content,
                    //senderId: participant[0].id
                    senderId: userId
                },
                //include: { sender: { include: { user: true } } }
                include: { sender: true }
            });
            console.log("message created: " + JSON.stringify(message));
            this.sendTo(server, chatId, 'receiveMessage', message);
        }
        catch (e) {
            this.sendError(server, client, "Unknown error");
            return ; 
        }
    }

    // need to make command message stay in db
    async command(server: any, client: any, participant: any, chatId: any, content: string) {

        let command = content.split(' ')[0];
        let args = content.split(' ').slice(1);
        console.log("command : " + command);
        console.log("args : " + args);

        switch (command) {
            case '/kick':
                await this.kick(server, client, participant, chatId, args);
                break;
            case '/ban':
                await this.ban(server, client, participant, chatId, args);
                break;
            case '/unban':
                await this.unban(server, client, participant, chatId, args);
                break;
            //case '/mute':
                //await this.mute(server, chatId, userId, args);
                //break;
            //case '/unmute':
                //await this.unmute(server, chatId, userId, args);
                //break;
            //case '/promote':
                //await this.promote(server, chatId, userId, args);
                //break;
            //case '/demote':
                //await this.demote(server, chatId, userId, args);
                //break;
            default:
                this.sendError(server, client, "Unknown command");
                break;
        }
    }

    
    async kick(server: any, client: any, participant: any, chatId: any, args: any) {
        if (!participant.is_admin && !participant.is_moderator) {
            this.sendError(server, client, "kick: You don't have the permission to kick");
            return;
        }

        if (args.length != 1) {
            this.sendError(server, client, "Usage: /kick <login>");
            return;
        }

        let target = await this.prisma.user.findUnique({
            where: { login: args[0] }
        });

        if (!target) {
            this.sendError(server, client, "kick: User " + args[0] + " not found");
            return ;
        }
            
        // find clientId of target and send him kick
        for (let cur of this.roomsClients) {
            if (cur.user && cur.user.login == target.login && cur.roomId == chatId) {
                server.to(cur.clientId).emit('kick');
            } 
        }
        this.sendStatus(server, client, participant, chatId, participant.user.login + " kicked " + args[0]);
        
        // remove target from roomsclients
        this.roomsClients = this.roomsClients.filter((cur) => cur.user.login !== target.login || cur.roomId !== chatId);
    }

    async unban(server: any, client: any, participant: any, chatId: any, args: any) {
        if (args.length != 1) {
            this.sendError(server, client, "Usage: /unban <login>");
        }

        let cur_user = await this.prisma.user.findMany({where: { login: args[0] } })
        if (!cur_user) {
            this.sendError(server, client, "unban: User " + args[0] + " not found");
            return ;
        }

        let cur_room = await this.prisma.chatRoom.findUnique({
            where: { id: chatId },
        });

        if (!cur_room) {
            this.sendError(server, client, "unban: Room not found wtf?");
            return;
        }

        if (!cur_room.banned.find((cur) => cur == args[0])) {
            this.sendError(server, client, "unban: " + args[0] + " is not banned");
            return;
        }

        // recreate banned list without target and re-assign it -> very slow but prisma cringe so it's better like this
        const new_banned = cur_room.banned.filter((cur) => cur != args[0]);

        await this.prisma.chatRoom.update({
            where: { id: chatId },
            data: {
                banned: {
                    set: new_banned,
                }
            }
        });

        cur_room = await this.prisma.chatRoom.findUnique({
            where: { id: chatId },
        });

        console.log("cur_room after unban: " + JSON.stringify(cur_room));

        this.sendStatus(server, client, participant, chatId, participant.user.login + " unbanned " + args[0]);
    }

    async ban(server: any, client: any, participant: any, chatId: any, args: any) {
        if (!participant.is_admin) {
            this.sendError(server, client, "ban: You don't have the permission to ban");
            return;
        }

        if (args.length != 1) {
            this.sendError(server, client, "Usage: /ban <login>");
            return;
        }

        let target = await this.prisma.user.findUnique({
            where: { login: args[0] }
        });

        // check if user exist
        if (!target) {
            this.sendError(server, client, "ban: User " + args[0] + " not found");
            return ;
        }

        let target_room = await this.prisma.chatRoom.findUnique({
            where: { id: chatId }
        });

        // check if user is already banned
        if (target_room.banned.find((cur) => args[0] == cur)) {
            this.sendError(server, client, "ban: User " + args[0] + " is already banned");
            return ;
        }

        for (let cur of this.roomsClients) {
            if (cur.user && cur.user.login == target.login && cur.roomId == chatId) {
                server.to(cur.clientId).emit('kick');
            } 
        }
        
        try {
            // delete participant
            const update_participant = await this.prisma.participant.deleteMany({
                where: {
                    chatId: chatId,
                    userId: target.id
                }
            });

            // add user to banned list
            await this.prisma.chatRoom.update({
                where: {
                    id: chatId
                },
                data: {
                    banned: {
                        push: target.login,
                    }
                },
            });
        }
        catch (e) {
            this.sendError(server, client, "Unknown error");
        }

        // remove target from roomsclients
        this.roomsClients = this.roomsClients.filter((cur) => cur.user.login !== target.login || cur.roomId !== chatId);

        this.sendStatus(server, client, participant, chatId, participant.user.login + " banned " + args[0]);

    }

    async rooms(name?: string) {

        // room by name
        if (name) {
                return await this.prisma.chatRoom.findUnique({
                    where: {
                        name: name
                    },
                    include: {
                        participants: { 
                            include: { user: true } 
                        },
                        messages: { 
                            //include: { sender: { include: { user: true } } } 
                            include: { sender: true },
                        },
                    }
                });
        }

        // all rooms
        return await this.prisma.chatRoom.findMany({
            include: {
                participants: { 
                    include: { user: true }
                },
                messages: false,
            }
        });
    }

    // dbg
    async clearAll() {
        await this.prisma.message.deleteMany();
        await this.prisma.participant.deleteMany();
        await this.prisma.chatRoom.deleteMany();

        console.log('cleared all chat data');
    }
}