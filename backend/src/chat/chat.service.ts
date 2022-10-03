import { ConsoleLogger, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { UsersController } from 'src/users/users.controller';
import { IChatUser, IChatRoom, IWebsocketClient, INotification } from '../interfaces/interfaces';
import { Server } from 'socket.io';
import { subscribeOn } from 'rxjs';
import { RouterModule } from '@nestjs/core';

import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { connect, sensitiveHeaders } from 'http2';
import errorDispatcher from 'src/utils/error-dispatcher';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { disconnect } from 'process';
import { ICommand } from 'src/interfaces/interfaces';
import { AddRoomDto } from 'src/interfaces/dtos';


import { NotificationService } from 'src/notification/notification.service';
import { NotificationGateway } from 'src/notification/notification.gateway';

import * as bcrypt from 'bcrypt';
import { objectEnumValues } from '@prisma/client/runtime';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ChatService {
  constructor(
        private readonly prisma: PrismaService, 
        private readonly usersService: UsersService,
        private notificationService: NotificationService,
        private notificationGateway: NotificationGateway
    ) {}

//     export interface ICommand
// {
// 	command: string;
// 	argsCount: [number, number] // [min, max]
// 	usage: string;
// 	description: string;
// 	handler: any;
// 	owner: boolean;	
// 	admin: boolean;	
// 	moderator: boolean;	
// 	user: boolean;	
// }

    commands: ICommand[] = [
        {name: 'kick', handler: this.kick.bind(this), argsCount: [1, 1], usage: '/kick <login>', description: 'Kick user from room', owner: true, admin: true, moderator: true, user: false},
        {name: 'ban', handler: this.ban.bind(this), argsCount: [1, 1], usage: '/ban <login>', description: 'ban user from room', owner: true, admin: true, moderator: false, user: false},
        {name: 'unban', handler: this.unban.bind(this), argsCount: [1, 1], usage: '/unban <login>', description: 'unban user from room', owner: true, admin: true, moderator: false, user: false},
        {name: 'remove', handler: this.remove.bind(this), argsCount: [1, 1], usage: '/remove <login>', description: 'remove a user from the participant list', owner: true, admin: true, moderator: false, user: false},
        {name: 'password', handler: this.password.bind(this), argsCount: [1, 1], usage: '/password <new_password>', description: 'set new_password for the room', owner: true, admin: false, moderator: false, user: false},
        {name: 'promote', handler: this.promote.bind(this), argsCount: [2, 2], usage: '/promote <login> <user/admin/moderator>', description: 'Assign new role to a user', owner: true, admin: true, moderator: false, user: false},
        {name: 'invite', handler: this.invite.bind(this), argsCount: [1, 1], usage: '/invite <login>', description: 'Add a participant in the room', owner: true, admin: true, moderator: true, user: false},
    ]

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
        console.log("enter roomsclients : ", this.roomsClients);
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

    async notify(notif: INotification, target: string) {

        // blocked check here

        this.notificationGateway.notify(notif, target);

    }

    // utils function to send stuff to client in a room (if client provided send only to him)
    async sendTo(server: any, room: any, event: string, content: any, client: any, notify: boolean = false, targetLogin?: any) {
        console.log("sendTo roomsclients : ", this.roomsClients);
        for (let cur of this.roomsClients) {
            if (room.id == cur.chatId && (targetLogin == undefined || targetLogin == cur.login)) {
                server.to(cur.clientId).emit(event, content);
            }
        }

        // need to add check for blocked user + notify targetLogin
        if (notify) {
            for (let participant of room.participants) {
                //if (this.roomsClients.find((cur) => (cur.login == participant.user.login && cur.chatId == participant.chatId)))
                    //continue;
                this.notify({ service: 'chat', 
                              title: `${room.name}`, 
                              content: client.transcendenceUser.login + ": " + content.content, 
                              link: '/chat/' + room.name,
                              senderLogin: client.transcendenceUser.login}, participant.user.login);
            }
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

            console.log("sendStatus message : ", message);

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
            this.sendTo(server, room, 'receiveMessage', message, client, true);
        }
        catch (e) {
            console.log("handleMessage error: " + e);
            return;
        }
    }

    async getUser(login: string) {
        let ret =  await this.usersService.getUser(login);
        if (!ret) throw "User " + login + " not found";
        return ret;
    }

    async getParticipant(user: any, chatId: number) {
        let ret = await this.prisma.participant.findMany({
            where: {
                chatId: chatId,
                userId: user.id
            }
        }).then(res => res[0]);
        if (!ret) throw user.login + " is not in room";
        return ret;
    }

    check_command(command: ICommand, args: string[], server: any, client: any, participant: any) {
        if (args.length < command.argsCount[0] || args.length > command.argsCount[1]) {
            this.sendError(server, client, "Usage: " + command.usage);
            return false;
        }

        if (!((participant.is_admin && command.admin)
                || (participant.is_moderator && command.moderator)
                || (participant.is_owner && command.owner)
                || (command.user))) {
            this.sendError(server, client, "You don't have the right to use this command");
            return false;
        }
        return true;
    }

    // need to make command message stay in db
    async command(server: any, client: any, participant: any, room: any, content: string) {

        let command = content.split(' ')[0].slice(1);
        let args = content.split(' ').slice(1);
        console.log("command : " + command);
        console.log("args : " + args);

        let cur_command = this.commands.find((cur) => cur.name == command);

        if (!cur_command) {
            this.sendError(server, client, command + ": Unknown command");
            return;
        }

        if (!this.check_command(cur_command, args, server, client, participant)) {
            console.log("command error");
            return ;
        }

        cur_command.handler(server, client, participant, room, args);
    }
    async remove(server: any, client: any, participant: any, room: any, args: any) {
        let target = room.participants.find((cur) => cur.user.login == args[0]);
        if (!target) {
            this.sendError(server, client, "remove: User is not in the room");
            return ;
        }
        if (target.is_owner && !participant.is_owner) {
            this.sendError(server, client, "remove: You can't remove the owner");
            return ;
        }

        try {
            await this.prisma.participant.delete({
                where: { id: target.id }
            });
        }
        catch (e) {
            this.sendError(server, client, "Unknown error");
            console.log("remove error: " + e);
            return;
        }
        
        this.sendTo(server, room, 'kick', target, client, true, target.login);
        
        this.sendStatus(server, client, participant, room, client.transcendenceUser.login + " removed " + target.user.login);

        this.notify({ service: 'chat',
                      title: 'Removed',
                      content: 'you have been removed from ' + room.name + ' by ' + participant.user.login,
                      link: '/chat/' + room.name, // maybe link should be optional 'cause it's weird to give a removed participant a link to the room ;)
                      senderLogin: client.transcendenceUser.login}, target.login);
    }

    async password(server: any, client: any, participant: any, room: any, args: any) {
        // need to add check
        let password = args[0];

        try {
            let cur_room = await this.prisma.chatRoom.update({
                where: { id: room.id },
                data: {
                    is_protected: true,
                    hash: await bcrypt.hash(password, await bcrypt.genSalt()),
                }
            });
        }
        catch (e) {
            this.sendError(server, client, "Unknown error");
            console.log("password error: " + e);
            return ;
        }
        
        this.sendStatus(server, client, participant, room, "New password set");
        
        this.sendError(server, client, "/!\\ Users already in room can still access it without the password\nto force them to enter the password, remove them");

    }

    async invite(server: any, client: any, participant: any, room: any, args: any) {
        try {
            var user = await this.getUser(args[0]);
        }
        catch (e) {
            this.sendError(server, client, "invite: " + e);
            return;
        }

        if (room.participants.find((cur) => cur.user.login == user.login)) {
            this.sendError(server, client, "invite: User " + args[0] + " is already in the room");
            return ;
        }
        try {
            await this.prisma.participant.create({
                data: {
                    chatId: room.id,
                    userId: user.id,
                    is_admin: false,
                    is_moderator: false,
                }
            });
        }
        catch (e) {
            this.sendError(server, client, "Unknown error");
            console.log("invite error: " + e);
            return;
        }

        this.sendStatus(server, client, participant, room, participant.user.login + " invited " + args[0] + " in the room");

        //this.notificationGateway.notify(participant.user.login, 'chat', 'Invitation', 'you have been invited to join ' + room.name , client.transcendenceUser.login, 'chat/room/' + room.name);
        this.notify({ service: 'chat', 
                      title: 'Invitation',
                      content: 'you have been invited to join ' + room.name,
                      link: '/chat/' + room.name,
                      senderLogin: client.transcendenceUser.login}, participant.user.login);

    }
    
    async kick(server: any, client: any, participant: any, room: any, args: any) {
        try {
            var target = await this.getUser(args[0]);
            var target_participant = await this.getParticipant(target, room.id);
        }
        catch (e) {
            this.sendError(server, client, "kick: " + e);
            return;
        }

        if (target_participant.is_owner && !participant.is_owner) {
            this.sendError(server, client, "kick: You can't kick the owner");
            return;
        }

        // find clientId of target and send him kick
        this.sendTo(server, room, 'kick', '', client, false, target.login)

        // remove target client id from room
        this.roomsClients = this.roomsClients.filter((cur) => cur.login !== target.login || cur.chatId !== room.id);

        // send command log to all participants
        this.sendStatus(server, client, participant, room, participant.user.login + " kicked " + args[0]);

        this.notify({ service: 'chat',
                      title: 'Kicked',
                      content: 'you have been kicked from ' + room.name + ' by ' + participant.user.login,
                      link: '/chat/' + room.name,
                      senderLogin: client.transcendenceUser.login}, target.login);

    }

    async unban(server: any, client: any, participant: any, room: any, args: any) {

        try {
            var target = await this.getUser(args[0]);
        }
        catch (e) {
            this.sendError(server, client, "unban: " + e);
            return;
        }

        if (!room.banned.find((cur) => cur == args[0])) {
            this.sendError(server, client, "unban: " + args[0] + " is not banned");
            return;
        }

        // recreate banned list without target and re-assign it -> very slow but prisma cringe so it's better like this
        const updated_banned = room.filter((cur) => cur != args[0]);

        try {
            await this.prisma.chatRoom.update({
                where: { id: room.id },
                data: {
                    banned: { set: updated_banned, }
                }
            });
        }
        catch (e) {
            this.sendError(server, client, "Unknown error");
            console.log("unban error: " + e);
            return ;
        }

        this.sendStatus(server, client, participant, room, participant.user.login + " unbanned " + args[0]);

        this.notify({ service: 'chat',
                      title: 'unban',
                      content: 'you have been unbaned from ' + room.name + ' by ' + participant.user.login,
                      link: '/chat/' + room.name,
                      senderLogin: client.transcendenceUser.login}, target.login);
    }

    async ban(server: any, client: any, participant: any, room: any, args: any) {
        try {
            var target = await this.getUser(args[0]);
            var target_participant = await this.getParticipant(target, room.id);
        }
        catch (e) {
            this.sendError(server, client, "ban: " + e);
            return;
        }

        // ! need to remove auto ban ok for owner !
        if (target_participant.is_owner && !participant.is_owner) {
            this.sendError(server, client, "ban: You can't ban the owner");
            return;
        }

        // check if user is already banned
        if (room.banned.find((cur) => args[0] == cur)) {
            this.sendError(server, client, "ban: User " + args[0] + " is already banned");
            return ;
        }

        try {
            // delete participant
            await this.prisma.participant.deleteMany({
                where: {
                    chatId: room.id,
                    userId: target.id
                }
            });

            // add user to banned list
            await this.prisma.chatRoom.update({
                where: { id: room.id },
                data: {
                    banned: { push: target.login, }
                },
            });
        }
        catch (e) {
            this.sendError(server, client, "Unknown error");
            console.log("ban error: ", e);
        }

        this.sendTo(server, room, 'kick', target, client, true, target.login);

        this.roomsClients = this.roomsClients.filter((cur) => cur.login !== target.login || cur.chatId !== room.id);

        this.sendStatus(server, client, participant, room, participant.user.login + " banned " + args[0]);

        this.notify({ service: 'chat',
                      title: 'ban',
                      content: 'you have been baned from ' + room.name + ' by ' + participant.user.login,
                      link: '/chat/' + room.name,
                      senderLogin: client.transcendenceUser.login}, target.login);
    }

    async promote(server: any, client: any, participant: any, room: any, args: any) {
        if ((args[1] != "admin" && args[1] != "moderator" && args[1] != "user")) {
            this.sendError(server, client, "Promote: invalid arg (available role: admin moderator user)");
            return;
        }

        try {
            var target = await this.getUser(args[0]);
            var participant_target = await this.getParticipant(target, room.id);
        }
        catch (e) {
            this.sendError(server, client, "promote: " + e);
            return ;
        }
        if (participant_target.is_owner && !participant.is_owner) {
            this.sendError(server, client, "promote: You can't promote the owner of the room");
            return;
        }
        try {
            await this.prisma.participant.update({
                where: {
                    id: participant_target.id
                },
                data: {
                    is_admin: (args[1] == "admin") ? true : false,
                    is_moderator: (args[1] == "moderator") ? true : false,
                }
            });
        }
        catch (e) {
            this.sendError(server, client, "Unknown error");
            console.log("promote error: " + e);
            return ;
        }

        this.sendStatus(server, client, participant, room, participant.user.login + " is now " + args[1]);

        this.notify({ service: 'chat',
                      title: 'promote',
                      content: participant.user.login + " set you're new role in " + room.name + " to " + args[1],
                      link: '/chat/' + room.name,
                      senderLogin: client.transcendenceUser.login}, target.login);
    }

    // need to stop sending rooms hash and partitipant.entered_hash
    async rooms(login: string, name?: string) {
        // room by name
        if (name) {
            try {
                let room = await this.prisma.chatRoom.findUnique({
                    where: {
                        name: name
                    },
                    include: {
                        participants: { 
                            include: { user: true } 
                        },
                    }
                });

                if (!room)
                    throw new NotFoundException("Room not found");

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
        try
        {
            const rooms = await this.prisma.chatRoom.findMany({
                include: {
                    participants: {
                        include: { user: true }
                    },
                    messages: false,
                }
            });

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