// Nest
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Transcendence
import { PrismaService } from '../prisma/prisma.service';
import { IChat, IJoinPublicChat, IUser } from '../interfaces/interfaces';
import ErrorDispatcher from '../error-dispatcher/error-dispatcher';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {
    this.prisma = new PrismaService();
  }

  ///////////////////////
  /// BASIC FUNCTIONS ///
  ///////////////////////

  async createChat(chat: any): Promise<any> {
    try {
      let retChat: any;
      if (chat.pwd) {
        const saltRounds = 4.2;
        const hash = await bcrypt.hash(chat.pwd, saltRounds);
        retChat = await this.prisma.chat.create({
          data: {
            idIntra: chat.idIntra,
            name: chat.name,
            types: chat.types,
            pwd: hash,
            participant: {
              create: [
                {
                  idIntra: chat.idIntra,
                },
              ],
            },
            admin: {
              create: [
                {
                  idIntra: chat.idIntra,
                },
              ],
            },
          },
          include: {
            participant: true,
            admin: true,
          },
        });
      } else {
        retChat = await this.prisma.chat.create({
          data: {
            idIntra: chat.idIntra,
            name: chat.name,
            types: chat.types,
            participant: {
              create: [
                {
                  idIntra: chat.idIntra,
                },
              ],
            },
            admin: {
              create: [
                {
                  idIntra: chat.idIntra,
                },
              ],
            },
          },
          include: {
            participant: true,
            admin: true,
          },
        });
      }
      return retChat;
    } catch (e: any) {
      ErrorDispatcher(e);
    }
  }

  async leaveChat(current_user: any): Promise<void> {
    try {
      await this.prisma.participant.deleteMany({
        where: {
          idIntra: current_user.idIntra,
          idChat: current_user.idChat,
        },
      });
    } catch (e: any) {
      ErrorDispatcher(e);
    }
  }

  async addParticipant(participant: any): Promise<void> {
    try {
      const chat = await this.prisma.chat.findUnique({
        where: {
          id: participant.idChat,
        },
      });
      if (chat.banned.find((ban: string) => ban === participant.idIntra))
        throw new HttpException('User banned', HttpStatus.FORBIDDEN);
    } catch (e: any) {
      ErrorDispatcher(e);
    }
  }

  async removeParticipant(participant: any): Promise<void> {
    try {
      const chat = await this.prisma.chat.findUnique({
        where: {
          id: participant.idChat,
        },
      });
      await this.prisma.participant.delete({
        where: {
          idIntra_idChat: {
            idIntra: participant.idIntra,
            idChat: participant.idChat,
          },
        },
      });
    } catch (e: any) {
      ErrorDispatcher(e);
    }
  }

  //////////////////////
  /// ADD PRIVILEGES ///
  //////////////////////

  async addAdmin(admin: any): Promise<void> {
    try {
      await this.prisma.admin.create({
        data: {
          idIntra: admin.idIntra,
          idChat: admin.idChat,
        },
      });
    } catch (e: any) {
      ErrorDispatcher(e);
    }
  }

  async addMod(moderator: any): Promise<void> {
    try {
      await this.prisma.moderator.create({
        data: {
          idIntra: moderator.idIntra,
          idChat: moderator.idChat,
        },
      });
    } catch (e: any) {
      ErrorDispatcher(e);
    }
  }

  //////////////////////
  /// DEL PRIVILEGES ///
  //////////////////////

  async removeAdmin(admin: any): Promise<void> {
    try {
      await this.prisma.admin.deleteMany({
        where: {
          idIntra: admin.idIntra,
          idChat: admin.idChat,
        },
      });
    } catch (e: any) {
      ErrorDispatcher(e);
    }
  }

  async removeMod(moderator: any): Promise<void> {
    try {
      await this.prisma.moderator.deleteMany({
        where: {
          idIntra: moderator.idIntra,
          idChat: moderator.idChat,
        },
      });
    } catch (e: any) {
      ErrorDispatcher(e);
    }
  }

  //////////////////////
  ///   PUNISHMENT   ///
  //////////////////////

  async banUser(banReq: { idIntra: string; idChat: number }): Promise<void> {
    try {
      const chat = await this.prisma.chat.findUnique({
        where: {
          id: banReq.idChat,
        },
      });
      chat.banned.push(banReq.idIntra);
      await this.prisma.chat.update({
        where: {
          id: banReq.idChat,
        },
        data: {
          banned: chat.banned,
        },
      });
      await this.removeParticipant(banReq);
    } catch (e: any) {
      console.log('Error, ', e);
      ErrorDispatcher(e);
    }
  }

  async muteParticipant(payload: {
    idChat: number;
    idIntra: string;
  }): Promise<void> {
    try {
      await this.prisma.participant.update({
        where: {
          idIntra_idChat: payload,
        },
        data: {
          muted: true,
        },
      });
    } catch (e) {
      ErrorDispatcher(e);
    }
  }

  async unmuteParticipant(payload: {
    idChat: number;
    idIntra: string;
  }): Promise<void> {
    try {
      await this.prisma.participant.update({
        where: {
          idIntra_idChat: payload,
        },
        data: {
          muted: false,
        },
      });
    } catch (e) {
      ErrorDispatcher(e);
    }
  }

  ///////////////////////
  ///   SHOWS STUFFS  ///
  ///////////////////////

  async showAdmin(idChat: string): Promise<any> {
    try {
      const num = parseInt(idChat);
      const ret = await this.prisma.admin.findMany({
        where: {
          idChat: num,
        },
      });
      return ret;
    } catch (e: any) {
      ErrorDispatcher(e);
    }
  }

  async showParticipant(idChat: string): Promise<any> {
    const num = parseInt(idChat);
    try {
      const ret = await this.prisma.participant.findMany({
        where: {
          idChat: num,
        },
      });
      const users = await Promise.all(
        ret.map(async (partecipant) => {
          const user = await this.prisma.user.findUnique({
            where: {
              idIntra: partecipant.idIntra,
            },
            select: {
              id: true,
              userName: true,
              idIntra: true,
            },
          });
          if (user) return user;
        }),
      );
      return users;
    } catch (e: any) {
      ErrorDispatcher(e);
    }
  }

  async showUsersChats(idIntra: string): Promise<any> {
    try {
      const ret: any = await this.prisma.participant.findMany({
        where: {
          idIntra: idIntra,
        },

        include: {
          chat: true,
        },
      });
      const vret = await Promise.all(
        ret.map(async (part: any) => {
          const partecipant = await this.prisma.participant.findMany({
            where: {
              idChat: part.chat.id,
            },
            include: {
              user: true,
            },
          });
          part.participant = partecipant;
          return part;
        }),
      );
      return vret;
    } catch (e: any) {
      ErrorDispatcher(e);
    }
  }

  async showChat(idChat: number): Promise<IChat> {
    try {
      const chat: any = await this.prisma.chat.findUnique({
        where: {
          id: idChat,
        },
        include: {
          moderators: true,
          admin: true,
          participant: true,
        },
      });
      chat.participant = await Promise.all(
        chat.participant.map(async (participant: any) => {
          const user = await this.prisma.user.findUnique({
            where: {
              idIntra: participant.idIntra,
            },
            select: {
              id: true,
              idIntra: true,
              img: true,
              userName: true,
            },
          });
          return user;
        }),
      );
      return chat;
    } catch (e: any) {
      ErrorDispatcher(e);
    }
  }

  async showChats(): Promise<any> {
    try {
      const ret: any = await this.prisma.chat.findMany({
        include: {
          admin: true,
          moderators: true,
          participant: true,
        },
      });
      return ret;
    } catch (e: any) {
      ErrorDispatcher(e);
    }
  }

  async showPublic(): Promise<any> {
    try {
      const ret: any = await this.prisma.chat.findMany({
        where: {
          types: 'public',
        },
        include: {
          admin: true,
          moderators: true,
          participant: true,
        },
      });
      return ret;
    } catch (e: any) {
      ErrorDispatcher(e);
    }
  }

  async showPrivate(): Promise<any> {
    try {
      const ret: any = await this.prisma.chat.findMany({
        where: {
          types: 'private',
        },
        include: {
          admin: true,
          moderators: true,
          participant: true,
        },
      });
      return ret;
    } catch (e: any) {
      ErrorDispatcher(e);
    }
  }

  ///////////////////////
  ///  MISCELLANEOUS  ///
  ///////////////////////

  async canUserDeleteChat(idIntra: string, idChat: number): Promise<boolean> {
    try {
      if (
        ['mframbou', 'dsamain', 'oronda', 'sspina'].find(
          (id) => id === idIntra,
        ) != undefined
      )
        return true;
      const res = await this.prisma.chat.findMany({
        where: {
          id: idChat,
          OR: [
            {
              admin: {
                some: {
                  idIntra: idIntra,
                },
              },
            },
            {
              idIntra: idIntra,
            },
          ],
        },
      });
      return res.length > 0;
    } catch (e) {
      return false;
    }
  }

  async checkJoinChat(payload: IJoinPublicChat): Promise<boolean> {
    try {
      const chat = await this.prisma.chat.findMany({
        where: {
          id: payload.idChat,
          participant: {
            none: {
              idIntra: payload.idIntra,
            },
          },
        },
      });
      if (!chat.length) return false;
      if (chat[0].hasOwnProperty('pwd')) {
        if (chat[0].pwd == null) return true;
        if (!payload.hasOwnProperty('pwd')) return false;
        const isMatch: boolean = await bcrypt.compare(payload.pwd, chat[0].pwd);
        if (isMatch) return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  ///////////////////////
  /// DB INTERACTIONS ///
  ///////////////////////

  async emptyChat(): Promise<any> {
    try {
      await this.prisma.admin.deleteMany();
      await this.prisma.participant.deleteMany();
      await this.prisma.chat.deleteMany();
    } catch (e: any) {
      ErrorDispatcher(e);
    }
  }

  async updateChatPwd(payload: { idChat: number; pwd: string }): Promise<void> {
    try {
      const saltRounds = 4.2;
      const hash = await bcrypt.hash(payload.pwd, saltRounds);
      await this.prisma.chat.update({
        where: {
          id: payload.idChat,
        },
        data: {
          pwd: hash,
        },
      });
    } catch (e) {
      ErrorDispatcher(e);
    }
  }

  async deleteChat(idChat: number): Promise<any> {
    try {
      await this.prisma.admin.deleteMany({
        where: {
          idChat: idChat,
        },
      });
      await this.prisma.moderator.deleteMany({
        where: {
          idChat: idChat,
        },
      });
      await this.prisma.participant.deleteMany({
        where: {
          idChat: idChat,
        },
      });
      await this.prisma.chat.delete({
        where: {
          id: idChat,
        },
      });
    } catch (e: any) {
      ErrorDispatcher(e);
    }
  }

}
