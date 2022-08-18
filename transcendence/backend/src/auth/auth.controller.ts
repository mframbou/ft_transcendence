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
import fetch from 'node-fetch';
import { Request, Response } from 'express';

// Transcendence
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

const urlRedirect = 'http://localhost:3000/auth/middleware';

@Controller('auth')
export class AuthController {
  constructor(
    private jwt: JwtService,
    private authService: AuthService,
  ) {
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
      .then(async (data) =>
      {
        let userData = await this.get_token(data.access_token);
        res.send(userData);
      });
  }

  private get_token(token: string): any {
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
      `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(urlRedirect)}&response_type=code`,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/logout')
  async logout(@Res() res: Response) {
    res.clearCookie('cockies');
    res.redirect('/');
  }

}
