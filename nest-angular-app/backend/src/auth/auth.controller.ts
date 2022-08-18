/* eslint-disable prefer-const */
// Nest
import {
  Controller,
  Get,
  Res,
  Query,
  Req,
  UseGuards,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as redisStore from 'cache-manager-redis-store';
import fetch from 'node-fetch';
import { Request, Response } from 'express';
import { caching } from 'cache-manager';

// Transcendence
import { PrismaService } from '../prisma/prisma.service';
import { IUser } from '../interfaces/interfaces';
import { MySessionService } from '../session/session.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';

interface UserData {
  idIntra: string;
  userName: string;
  firstName: string;
  lastName: string;
  img: string;
  campus: string;
}

const urlRedirect = `http://${process.env.HOST}/api/auth/middleware/`;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly prisma: PrismaService,
    private jwt: JwtService,
    private authService: AuthService,
    private sessionService: MySessionService,
  ) {
    this.prisma = new PrismaService();
    this.sessionService = new MySessionService(
      caching({
        store: redisStore,
        host: 'rediStatus',
        port: 6379,
        ttl: 0,
      }),
    );
  }

  /////////////////////////
  ///   LOGIN & AUTH   ///
  ////////////////////////

  // https://api.intra.42.fr/apidoc/guides/web_application_flow
  @Get('middleware')
  getAuthCode(@Query('code') query: string, @Res() res): any {
    return fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: `${process.env.CLIENT_ID}`,
        client_secret: `${process.env.CLIENT_SECRET}`,
        code: query,
        redirect_uri: `${urlRedirect}`,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        this.get_token(data.access_token, res);
      });
  }

  private get_token(token: string, @Res() res): any {
    let first = false;
    try {
      return fetch('https://api.intra.42.fr/v2/me', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => response.json())
        .then((jsonData) => {
          let ret: UserData = {
            idIntra: jsonData.login,
            userName: `${jsonData.login}_${String(Date.now())}`,
            firstName: jsonData.first_name,
            lastName: jsonData.last_name,
            img: jsonData.image_url,
            campus: jsonData.campus[0].name,
          };
          return ret;
        })
        .then(async (ret) => {
          let user;
          try {
            user = await this.prisma.user.findUnique({
              where: { idIntra: ret.idIntra },
            });
          } catch (e) {
            if (this.is_administrator(ret.idIntra)) ret.owner = true;
            first = true;
            user = await this.prisma.user.create({
              data: ret,
            });
          }
          let session: any = await this.sessionService.find_session(
            user.idIntra,
          );
          if (session && session.status !== 'offline') {
            res.redirect('/login');
          } else if (user.banned) res.redirect('/login');
          else if (user.twoFa === true) {
            const jwt = await this.jwt.signAsync({ id: user.idIntra });
            res.cookie('cookie2f', jwt, { httpOnly: true });
            res.redirect(`/2fa/${user.id}`);
          } else {
            const jwt = await this.jwt.signAsync({ id: user.idIntra });
            res.cookie('cockies', jwt, { httpOnly: true });
            first ? res.redirect('/') : res.redirect('/login');
          }
        });
    } catch (e) {
      throw new HttpException(
        "It didn't works " + e.message,
        HttpStatus.CONFLICT,
      );
    }
  }

  // (it's my (= sspina) uid, it's okay but important to not leak the secrect)
  @Get()
  authRedirect(@Res() res): any {
    return res.redirect(
      `https://api.intra.42.fr/oauth/authorize?client_id=9ff20d31a6e021e5a2010628c4c7bc1604fd35f5284b13662bdf431c3d77bbb8&redirect_uri=${urlRedirect}&response_type=code`,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/logout')
  async logout(@Res() res: Response) {
    res.clearCookie('cockies');
    res.redirect('/');
  }

  //////////////////
  /// TWO FACTOR ///
  //////////////////

  @UseGuards(JwtAuthGuard)
  @Post('start_two_factor')
  async start_two_factor(@Body() body): Promise<any> {
    await this.authService.start_two_factor(body.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa')
  async completed_two_factor(@Body() body): Promise<any> {
    let a = await this.authService.completed_two_factor(body);
    return { QRcode: a };
  }

  @UseGuards(JwtAuthGuard)
  @Post('check_two_factor')
  async check_two_factor(@Body() body, @Res() res: Response): Promise<any> {
    this.authService.check_two_factor(body, res).then((e) => {
      e ? res.redirect('/login') : res.redirect('/login');
      return e;
    });
  }

  //////////////////
  ///   UTILITY  ///
  //////////////////

  @UseGuards(JwtAuthGuard)
  @Get('/user')
  async user(@Req() req: Request) {
    const data = await this.jwt.verifyAsync(req.cookies['cockies']);

    const user: IUser = await this.prisma.user.findUnique({
      where: {
        idIntra: data['id'],
      },
      include: {
        badge: true,
        chat: true,
        admin: true,
        participant: true,
        userFriends: true,
        blocked: true,
        blockedBy: true,
        moderators: true,
      },
    });
    user.userFriends = await Promise.all(
      user.userFriends.map(async (friend) => {
        return await this.prisma.user.findUnique({
          where: {
            idIntra: friend.friendId,
          },
          select: {
            email: true,
            tel: true,
            img: true,
            firstName: true,
            lastName: true,
            userName: true,
            idIntra: true,
            campus: true,
            win: true,
            loses: true,
            rank: true,
            badge: true,
          },
        });
      }),
    );
    return user;
  }

  is_administrator(idIntra: string) {
    return (
      idIntra === 'mframbou' ||
      idIntra === 'dsamain' ||
      idIntra === 'oronda' ||
      idIntra === 'sspina'
    );
  }
}
