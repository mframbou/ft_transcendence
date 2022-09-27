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


    // TODO: better error management (without confusing errorCode)
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
        if (participant.length) {
            return ;
        }

        let room = await this.prisma.chatRoom.findUnique({
            where: {
                id: chatId
            },
        });

        // need to throw correct error
        if (room.is_private && room.hash != password) {
            console.log("incorect password");
            return ;
        }

        await this.prisma.participant.create({
            data: {
                chatRoomId: chatId,
                userId: userId,
                is_admin: false,
                is_moderator: false,
            }
        });
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
                        messages: true,
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

    // ____________ CHAT ROOM  _____________ 


}
