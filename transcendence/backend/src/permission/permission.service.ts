// Nest
import { Body, Injectable, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Transcendence
import { PrismaService } from '../prisma/prisma.service';
import error_dispatcher from '../error-dispatcher/error-dispatcher';

@Injectable()
export class PermissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {
    this.prisma = new PrismaService();
  }

  async is_current_user(@Req() req, idIntra: string): Promise<boolean> {
    try {
      const data = await this.jwt.verifyAsync(req.cookies['cockies']);
      return idIntra === data['id'];
    } catch (e: any) {
      return false;
    }
  }

  ///// MISCELLANEOUS SUPREME PERMISSION /////

  async is_administrator(@Req() req): Promise<boolean> {
    try {
      const data = await this.jwt.verifyAsync(req.cookies['cockies']);
      if (!data) return false;
      const user = await this.prisma.user.findUnique({
        where: { idIntra: data['id'] },
      });
      return user.is_admin;
    } catch (e: any) {
      return false;
    }
  }

  async is_owner(@Req() req): Promise<boolean> {
    try {
      const data = await this.jwt.verifyAsync(req.cookies['cockies']);
      if (!data) return false;
      const user = await this.prisma.user.findUnique({
        where: { idIntra: data['id'] },
      });
      return user.owner || user.is_admin;
    } catch (e: any) {
      return false;
    }
  }

  ///// CHAT FUNCTIONS /////

  async is_mod(@Req() req, idChat: number): Promise<boolean> {
    try {
      const data = await this.jwt.verifyAsync(req.cookies['cockies']);
      if (
        await this.prisma.moderator.findUnique({
          where: {
            idIntra_idChat: { idIntra: data['id'], idChat },
          },
        })
      )
        return true;
    } catch (e: any) {
      return false;
    }
  }

  async is_admin(@Req() req, idChat: number): Promise<boolean> {
    try {
      const data = await this.jwt.verifyAsync(req.cookies['cockies']);
      if (
        await this.prisma.admin.findUnique({
          where: {
            idIntra_idChat: { idIntra: data['id'], idChat },
          },
        })
      )
        return true;
    } catch (e: any) {
      return false;
    }
  }
}
