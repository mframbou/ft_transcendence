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
import { AddRoomDto } from 'src/interfaces/dtos';

import { NotificationService } from 'src/notification/notification.service';
import { NotificationGateway } from 'src/notification/notification.gateway';

import * as bcrypt from 'bcrypt';
import { objectEnumValues } from '@prisma/client/runtime';

@Injectable()
export class ChatService {
  constructor(
        private readonly prisma: PrismaService, 
        private readonly usersService: UsersService,
        private notificationService: NotificationService,
        private notificationGateway: NotificationGateway
    ) {}

    // roomsclients store the client id of each user in each room
    // cringe -> better if we have map of array where key is chatId and value is array of clients
    // TODO : stop sending userId and use client.login instead -> less optimization but more security as we can't falsify userId
    roomsClients = [];

    // enter/leave update roomsClients
	async enter(server: any, client: any, payload: any) {
        console.log("enter");
        let cur_room = await this.prisma.chatRoom.findUnique({
            where: { id: payload.chatId },
        });

        if (cur_room.banned.find((cur) => cur == client.login)) {
            this.sendError(server, client, "You are banned from this room");
            return ;
        }
        //this.roomsClients.push({user: payload.user, chatId: payload.chatId, clientId: client.id});
        this.roomsClients.push({clientId: client.id, chatId: payload.chatId, login: client.transcendenceUser.login});

    }

    async leave(server: any, client: any, payload: any) {
        this.roomsClients = this.roomsClients.filter((cur) => cur.clientId !== client.id);
    }

    async getRoomName(roomId: any) {
        try {
            return await this.prisma.chatRoom.findUnique({
                where: { id: roomId },
            }).then((room) => room.name);
        } catch (e) {
            throw new HttpException(e, 403);
        }

    }

    // utils function to send stuff to client in a room (if client provided send only to him)
    async sendTo(server: any, room: any, event: string, content: any, client: any, auto: boolean = false) {
        console.log("sendTo roomsclients : ", this.roomsClients);
        if (auto) { // send to himself
            server.to(client.id).emit(event, content);
        } else {
            for (let cur of this.roomsClients) {
                if (room.id == cur.chatId) {
                    server.to(cur.clientId).emit(event, content);
                }
            }
        }

        // need to add check for blocked user
        for (let participant of room.participants) {
            if (this.roomsClients.find((cur) => (cur.login == participant.user.login && cur.chatId == participant.chatId)))
                continue;
            this.notificationGateway.notify(participant.user.login, 'chat', `${room.name}: New Message`, content.content, client.transcendenceUser.login);
        }


    }

    async sendError(server: any, client: any, content: string) {
        server.to(client.id).emit('commandError', content);
    }

    async sendStatus(server: any, client: any, participant: any, room: any, content: any) {

        try {
            let message = await this.prisma.message.create({
                data: {
                    chatId: room.id,
                    content: content,
                    senderId: participant.user.id,
                    isStatus: true
                },
            });

            this.sendTo(server, room, 'receiveMessage', {isStatus: true, content: content}, client);
        }
        catch (e) {
            // should send error only to the client who emit the command
            this.sendError(server, client, "Unknown error");
            return ; 
        }
    }


    //async addRoom(login: string, name: string, is_protected: boolean, password?: string) {
    async addRoom(login: string, room: AddRoomDto) {

        const user = await this.usersService.getUser(login);

        if (room.name == "") {
            throw new HttpException('Enter a room name', 403);
        }

        if (room.is_private && room.is_protected) {
            throw new HttpException('private can\'t be protected', 403);
        }

        if (await this.prisma.chatRoom.findUnique({where: {name: room.name}})) {
            throw new HttpException('Room already exist with this name', 403);
        }

        if (room.is_protected && room.password.length < 4) {
            throw new HttpException('Passord is too short', 403);
        }

        if (room.is_protected) {
            let salt = await bcrypt.genSalt();
            var hash = await bcrypt.hash(room.password, salt);
        }

        try {
            let cur_room = await this.prisma.chatRoom.create({
                data: {
                    name: room.name,
                    is_protected: room.is_protected,
                    is_private: room.is_private,
                    hash: hash,
                    participants: {
                        create: [{
                            is_owner: true,
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

    async join(login: string, chatId: number, password?: string) {
        
        let current_room = await this.prisma.chatRoom.findUnique({
            where: { id: chatId },
        });

        if (!current_room) {
            throw new HttpException('Room does not exist', 403);
        };

        if (current_room.banned.find((cur) => cur == login)) {
            throw new HttpException('You are banned from this room', 403);
        };

        const user = await this.usersService.getUser(login);
        console.log("user in join: ", user);
        const participant = await this.prisma.participant.findMany({
            where: { 
                chatId: chatId,
                userId: user.id
            },
            include: {
                user: true,
            }
        });

        // check if user is already in the room
        if (participant.length > 0)
            return;

        // bcrypt.compare take the salt from the stored hash add it to the password, hash it and compare it to the stored hash
        if (current_room.is_protected && !(await bcrypt.compare(password, current_room.hash))) {
            throw new HttpException('Incorrect password', 403);
        }

        let cur_room = await this.prisma.chatRoom.findUnique({
            where: { id: chatId },
            include: {
                participants: {
                    include: { user: true }
                }
            }
        });

        // create participant for user in room
        try {
            await this.prisma.participant.create({
                data: {
                    chatId: chatId,
                    userId: user.id,
                    is_admin: false,
                    is_moderator: false,
                    entered_hash: password,
                }
            });
        } catch (e) {
            throw new HttpException('Unknown error', 403);
        }


    
        return HttpStatus.OK;
    }

    // need error management
    async handleMessage(server: any, client: any, chatId: any, content: string) {

        try {
            var user = await this.usersService.getUser(client.transcendenceUser.login);

            if (!user) {
                this.sendError(server, client, "Unknown user");
                return ;
            }
        
            // would be better with findUnique
            var participant =  await this.prisma.participant.findMany({
                where: {
                    chatId: chatId,
                    userId: user.id
                },
                include: { user: true }
            });

            console.log("participant: " + Object.keys(participant[0].is_owner)[0]);

            if (!participant[0]) {
                this.sendError(server, client, "You are not in this room");
                return ;
            }

            var room = await this.prisma.chatRoom.findUnique({
                where: { id: chatId },
                include: {
                    participants: {
                        include: { user: true },
                    }
                }
            });

            if (!room) {
                this.sendError(server, client, "Can't find room");
                return;
            }
        }
        catch (e) {
            console.log("handleMessage error: " + e);
            return;
        }
            

        if (content.trim()[0] === '/') {
            console.log("command");
            return await this.command(server, client, participant[0], room, content);
        }

        try {
            let message = await this.prisma.message.create({
                data: {
                    chatId: chatId,
                    content: content,
                    senderId: user.id
                },
                include: { sender: true }
            });
            console.log("message created: " + JSON.stringify(message));
            this.sendTo(server, room, 'receiveMessage', message, client);
        }
        catch (e) {
            console.log("handleMessage error: " + e);
            return;
        }
    }

    // need to make command message stay in db
    async command(server: any, client: any, participant: any, room: any, content: string) {

        let command = content.split(' ')[0];
        let args = content.split(' ').slice(1);
        console.log("command : " + command);
        console.log("args : " + args);

        switch (command) {
            case '/kick':
                await this.kick(server, client, participant, room, args);
                break;
            case '/ban':
                await this.ban(server, client, participant, room, args);
                break;
            case '/unban':
                await this.unban(server, client, participant, room, args);
                break;
            case '/password': // change the password
                await this.password(server, client, participant, room, args);
                break;
            //case '/mute':
                //await this.mute(server, chatId, userId, args);
                //break;
            //case '/unmute':
                //await this.unmute(server, chatId, userId, args);
                //break;
            case '/promote':
                await this.promote(server, client, participant, room, args);
                break;
            case '/invite':
                await this.invite(server, client, participant, room, args);
                break;
            //case '/demote':
                //await this.demote(server, chatId, userId, args);
                //break;
            default:
                this.sendError(server, client, command + ": Unknown command");
                break;
        }
    }
    async remove(server: any, client: any, participant: any, chatId: any, args: any) {
        if (!participant.is_admin) {
            this.sendError(server, client, "remove: You don't have the permission to remove");
            return ;
        }
    }

    async password(server: any, client: any, participant: any, room: any, args: any) {
        if (!participant.is_owner) {
            this.sendError(server, client, "password: You don't have the permission to change the password");
            return ;
        }

        if (args.length != 1) {
            this.sendError(server, client, "Usage: /password <new_password>");
            return ;
        }

        let password = args[0];

        try {
            let cur_room = await this.prisma.chatRoom.update({
                where: { id: room.id },
                data: {
                    is_protected: true,
                    hash: await bcrypt.hash(password, await bcrypt.genSalt()),
                }
            });
            this.sendStatus(server, client, participant, room.id, "New password set");
            this.sendError(server, client, "/!\\ Users already in room can still access it without the password\nto force them to enter the password, remove them");
        }
        catch (e) {
            this.sendError(server, client, "Unknown error");
            return ;
        }
    }

    async invite(server: any, client: any, participant: any, room: any, args: any) {
        if (args.length != 1) {
            this.sendError(server, client, "Usage: /invite <login>");
        }

        try {
            let user = await this.usersService.getUser(args[0]);

            if (!user) {
                this.sendError(server, client, "invite: User " + args[0] + " not found");
                return ;
            }

            let cur_participant = await this.prisma.participant.findMany({
                where: {
                    chatId: room.id,
                    userId: user.id
                }
            });

            if (cur_participant.length > 0) {
                this.sendError(server, client, "invite: User " + args[0] + " is already in the room");
                return ;
            }

            await this.prisma.participant.create({
                data: {
                    chatId: room.id,
                    userId: user.id,
                    is_admin: false,
                    is_moderator: false,
                }
            });

            this.sendStatus(server, client, participant, room, participant.user.login + " invited " + args[0] + " in the room");


            this.notificationGateway.notify(participant.user.login, 'chat', 'Invitation', 'you have been invited to join ' + room.name , client.transcendenceUser.login, 'chat/room/' + room.name);
        }
        catch (e) {
            console.log("invite error: " + e);
            return;
        }


    }
    
    async kick(server: any, client: any, participant: any, room: any, args: any) {
        if (!participant.is_admin && !participant.is_moderator) {
            this.sendError(server, client, "kick: You don't have the permission to kick");
            return;
        }

        if (args.length != 1) {
            this.sendError(server, client, "Usage: /kick <login>");
            return;
        }

        try {
            var target = await this.prisma.user.findUnique({
                where: { login: args[0] }
            });


            const participant_target = await this.prisma.participant.findMany({
                where: {
                    chatId: room.id,
                    userId: target.id

                }
            });

            console.log("participant_target: ", participant_target);
            if (participant_target[0].is_owner) {
                this.sendError(server, client, "kick: You can't kick the owner of the room");
                return;
            }
        }
        catch (e) {
            this.sendError(server, client, "Unknown error");
            return ;
        }


        if (!target) {
            this.sendError(server, client, "kick: User " + args[0] + " not found");
            return ;
        }
            
        // find clientId of target and send him kick
        for (let cur of this.roomsClients) {
            if (cur.login == target.login && cur.chatId == room.id) {
                server.to(cur.clientId).emit('kick');
            } 
        }
        this.sendStatus(server, client, participant, room.id, participant.user.login + " kicked " + args[0]);
        
        // remove target from roomsclients
        this.roomsClients = this.roomsClients.filter((cur) => cur.login !== target.login || cur.chatId !== room.id);
    }

    async unban(server: any, client: any, participant: any, room: any, args: any) {
        if (args.length != 1) {
            this.sendError(server, client, "Usage: /unban <login>");
            return;
        }

        let cur_user = await this.prisma.user.findMany({where: { login: args[0] } })
        if (!cur_user) {
            this.sendError(server, client, "unban: User " + args[0] + " not found");
            return;
        }

        if (!room.banned.find((cur) => cur == args[0])) {
            this.sendError(server, client, "unban: " + args[0] + " is not banned");
            return;
        }

        // recreate banned list without target and re-assign it -> very slow but prisma cringe so it's better like this
        const new_banned = room.filter((cur) => cur != args[0]);

        await this.prisma.chatRoom.update({
            where: { id: room.id },
            data: {
                banned: {
                    set: new_banned,
                }
            }
        });

        this.sendStatus(server, client, participant, room, participant.user.login + " unbanned " + args[0]);
    }

    async ban(server: any, client: any, participant: any, room: any, args: any) {
        if (!participant.is_admin) {
            this.sendError(server, client, "ban: You don't have the permission to ban");
            return;
        }

        if (args.length != 1) {
            this.sendError(server, client, "Usage: /ban <login>");
            return;
        }

        try {
            var target = await this.prisma.user.findUnique({
                where: { login: args[0] }
            });

            const participant_target = await this.prisma.participant.findMany({
                where: {
                    chatId: room.id,
                    userId: target.id
                }
            });

            if (participant_target[0].is_owner) {
                this.sendError(server, client, "ban: You can't ban the owner of the room");
                return;
            }
        }
        catch (e) {
            this.sendError(server, client, "Unknown error");
            return ;
        }

        // check if user exist
        if (!target) {
            this.sendError(server, client, "ban: User " + args[0] + " not found");
            return ;
        }


        // check if user is already banned
        if (room.banned.find((cur) => args[0] == cur)) {
            this.sendError(server, client, "ban: User " + args[0] + " is already banned");
            return ;
        }

        for (let cur of this.roomsClients) {
            if (cur.login == target.login && cur.chatId == room.id) {
                server.to(cur.clientId).emit('kick');
            } 
        }
        
        try {
            // delete participant
            const update_participant = await this.prisma.participant.deleteMany({
                where: {
                    chatId: room.id,
                    userId: target.id
                }
            });

            // add user to banned list
            await this.prisma.chatRoom.update({
                where: {
                    id: room.id
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
        this.roomsClients = this.roomsClients.filter((cur) => cur.login !== target.login || cur.chatId !== room.id);

        this.sendStatus(server, client, participant, room, participant.user.login + " banned " + args[0]);

    }

    async promote(server: any, client: any, participant: any, room: any, args: any) {
        if (!participant.is_admin) {
            this.sendError(server, client, "promote: You don't have the permission to promote");
            return;
        }

        if (args.length != 2 || (args[1] != "admin" && args[1] != "moderator")) {
            this.sendError(server, client, "Usage: /promote <login> <admin/moderator/user>");
            return;
        }

        try {
            var target = await this.prisma.user.findUnique({
                where: { login: args[0] }
            });

            if (!target) {
                this.sendError(server, client, "promote: User " + args[0] + " not found");
                return;
            }
            console.log("target " + JSON.stringify(target));

            const participant_target = await this.prisma.participant.findMany({
                where: {
                    chatId: room.id,
                    userId: target.id
                }
            });

            if (!participant_target[0]) {
                this.sendError(server, client, "promote: User " + args[0] + " is not in this room");
                return ;
            }

            if (participant_target[0].is_owner) {
                this.sendError(server, client, "promote: You can't promote the owner of the room");
                return;
            }

            if (args[1] == "admin") {
                await this.prisma.participant.update({
                    where: {
                        id: participant_target[0].id
                    },
                    data: {
                        is_admin: true,
                        is_moderator: false,
                    }
                });
            } else if (args[1] == "moderator") {
                await this.prisma.participant.update({
                    where: {
                        id: participant_target[0].id
                    },
                    data: {
                        is_admin: false,
                        is_moderator: true,
                    }
                });
            } else {
                await this.prisma.participant.update({
                    where: {
                        id: participant_target[0].id
                    },
                    data: {
                        is_admin: false,
                        is_moderator: false,
                    }
                });
            }

            this.sendStatus(server, client, participant, room, participant.user.login + " is now " + args[1]);
        }
        catch (e) {
            this.sendError(server, client, "Unknown error");
            return ;
        }
    }

    // need to stop sending rooms hash and partitipant.entered_hash
    async rooms(login: string, name?: string) {

        // room by name
        if (name) {
            try {
                var room = await this.prisma.chatRoom.findUnique({
                    where: {
                        name: name
                    },
                    include: {
                        participants: { 
                            include: { user: true } 
                        },
                    }
                });

                if (!room) {
                    throw ("Room not found");
                }

                // if user is in room send him the messages with it
                if (room.participants.find((cur) => cur.user.login == login)) {
                    room = await this.prisma.chatRoom.findUnique({
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

                return room;
            }
            catch (e) {
                console.log("get rooms error: " + e);
            }
        }

        // all rooms
        try {
            let rooms = await this.prisma.chatRoom.findMany({
                include: {
                    participants: { 
                        include: { user: true }
                    },
                    messages: false,
                }
            });
            if (!rooms) {
                throw ("Rooms not found");
            }

            // return room only if it is public or user is in it
            return rooms.filter((cur) => !cur.is_private || cur.participants.find((cur) => cur.user.login == login));
        }
        catch (e) {
            console.log("get rooms error: " + e);
        }
    }

    // dbg
    async clearAll() {
        await this.prisma.message.deleteMany();
        await this.prisma.participant.deleteMany();
        await this.prisma.chatRoom.deleteMany();

        console.log('cleared all chat data');
    }
}