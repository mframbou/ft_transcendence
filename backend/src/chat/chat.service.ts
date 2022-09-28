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

@Injectable()
export class ChatService {
  constructor(
        private readonly prisma: PrismaService, 
        private readonly usersService: UsersService,
    ) {}

    // cringe -> better if we have map of array where key is roomId and value is array of clients
    // TODO : stop sending userId and use client.login instead -> less optimization but more security as we can't falsify userId
    roomsClients = [];

    async addRoom(login: string, name: string, is_private: boolean, password?: string) {

        const user = await this.usersService.getUser(login);

        console.log("addRoom request from " + JSON.stringify(user));
        console.log("is private : " + is_private);

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
                        include: {
                            user: true
                        }
                    },
                    messages: {
                        include: {
                            sender: true,
                        }
                    },
                }
            });

            console.log("room created: " + JSON.stringify(cur_room));

            // to be removed ( message testing )
            //await this.prisma.message.create({
                //data: {
                    //chatId: cur_room.id,
                    //content: "test message in chat.sercice addRoom",
                    //senderId: cur_room.participants[0].id
                //}
            //});

            console.log("room added: " + JSON.stringify(cur_room));
            console.log('-------------------');

            return HttpStatus.OK;
        }
        catch (e) {
            console.log("e : " + e);
            throw new HttpException('Unknown error', 403);
        }
    }

    async addParticipant(chatId: number, userId: number, password?: string) {

        let participant =  await this.prisma.participant.findMany({
            where: {
                chatRoomId: chatId,
                userId: userId
            },
        });

        // if user is already in the room
        //console.log("participant : ", participant);
        if (participant.length > 0) {
            console.log("user already in room");
            return ;
        }


        let room = await this.prisma.chatRoom.findUnique({
            where: {
                id: chatId
            },
        });

        // need to throw correct error
        //console.log("room : ", room);
        //console.log("password : ", password);
        if (room.is_private && room.hash != password) {
            console.log("incorect password");
            throw new HttpException('Incorrect password', 403);
        }

        await this.prisma.participant.create({
            data: {
                chatRoomId: chatId,
                userId: userId,
                is_admin: false,
                is_moderator: false,
            }
        });
    
        return HttpStatus.OK;
    }


    // need error management
    async addMessage(server: any, client: any, chatId: any, userId: any, content: string) {

        // would be better with findUnique
        let participant =  await this.prisma.participant.findMany({
            where: {
                chatRoomId: chatId,
                userId: userId
            },
            include: {
                user: true 
            }
        });

        if (!participant[0]) {
            console.log("addMessage: can't find participant");
            return ;
        }

        //console.log("participant in addMessage : ", participant[0]);
        //console.log("content : " + content);
        if (content.trim()[0] === '/') {
            console.log("command");
            return await this.command(server, client, chatId, participant[0], content);
        }

            let message = await this.prisma.message.create({
                data: {
                    chatId: chatId,
                    //content: "test message in chat.sercice addMessage",
                    content: content,
                    senderId: participant[0].id
                },
                include: {
                    sender: {
                        include: {
                            user: true
                        }
                    },
                }

            });
        
        // need to make roomsClients a map of array for optimization
        for (let cur of this.roomsClients) {
            if (cur.roomId == chatId) {
                server.to(cur.clientId).emit('receiveMessage', message);
            }
        }
    }

    // add clientId to room when user connect
	async enter(server: any, client: any, payload: any) {
        console.log("enter payload : " + JSON.stringify(payload));
        this.roomsClients.push({user: payload.user, roomId: payload.roomId, clientId: client.id});
        console.log("--------------------------\nroomsClients after enter: ", this.roomsClients);
    }

    // remove clientId when user disconnect
    async leave(server: any, client: any, payload: any) {
        console.log("leave called");
        console.log("client id: ", client.id);
        //this.roomsClients.filter((cur) => cur.roomId === payload.roomId && cur.clientId === client.id);
        this.roomsClients = this.roomsClients.filter((cur) => cur.clientId !== client.id);
        console.log("----------------------\nroomsClients after leave: ", this.roomsClients);
    }

    async findRooms(name?: string) {

        if (name) {
                return await this.prisma.chatRoom.findUnique({
                    where: {
                        name: name
                    },
                    include: {
                        participants: {
                            include: {
                                user: true
                            }
                        },
                        messages: {
                            include: {
                                sender: {
                                    include: {
                                        user: true
                                    }
                                }
                            }
                        },
                    }
                });
        }


        // if name is not provided, returns all rooms
        return await this.prisma.chatRoom.findMany({
            include: {
                participants: {
                    include: {
                        user: true
                    }
                },
                messages: false,
            }
        });
    }

    async clearAll() {
        await this.prisma.message.deleteMany();
        await this.prisma.participant.deleteMany();
        await this.prisma.chatRoom.deleteMany();

        console.log('cleared all chat data');
    }


    async sendStatus(server: any, client: any, chatId: any, content: any) {
        for (let cur of this.roomsClients) {
            if (cur.roomId == chatId) {
                server.to(cur.clientId).emit('receiveMessage', {isStatus: true, content: content});
            }
        }
    }

    // need to make command message stay in db
    async command(server: any, client: any, chatId: any, participant: any, content: string) {

        let command = content.split(' ')[0];
        let args = content.split(' ').slice(1);
        console.log("command : " + command);
        console.log("args : " + args);

        switch (command) {
            case '/kick':
                await this.kick(server, client, chatId, participant, args);
                break;
            //case '/ban':
                //await this.ban(server, chatId, userId, args);
                //break;
            //case '/unban':
                //await this.unban(server, chatId, userId, args);
                //break;
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
                console.log("unknow command");
                break;
        }
    }

    async commandError(server: any, client: any, content: string) {
        server.to(client.id).emit('commandError', content);
    }
    
    async kick(server: any, client: any, chatId: any, participant: any, args: any) {
        if (!participant.is_admin && !participant.is_moderator) {
            this.commandError(server, client, "/kick: You don't have the permission to kick");
            return;
        }

        if (args.length != 1) {
            this.commandError(server, client, "/kick: Invalid number of arguments");
            return;
        }

        for (let arg of args) {
            let user = await this.prisma.user.findUnique({
                where: {
                    login: arg
                }
            });

            if (!user) {
                this.commandError(server, client, "/kick: User " + arg + " not found");
                return ;
            }
            
            console.log("roomsClients before kick: ", this.roomsClients);
            console.log("target login : ", user.login);
            console.log("target roomId : ", chatId);

            for (let cur of this.roomsClients) {
                if (cur.user && cur.user.login == user.login && cur.roomId == chatId) {// && cur.roomId == chatId) {
                    server.to(cur.clientId).emit('kick');
                    this.sendStatus(server, client, chatId, participant.user.login + " kicked " + args[0]);
                } 
            }
        }


    }

}
