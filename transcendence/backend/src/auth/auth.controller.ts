/* eslint-disable prefer-const */
// Nest
import { Controller, Get, Res, Query, HttpException, HttpStatus} from '@nestjs/common';
import fetch from 'node-fetch';

// Transcendence
import {PrismaService} from "../prisma/prisma.service";

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
  constructor(private prismaService: PrismaService)
  {
  }

  /////////////////////////
  ///   LOGIN & AUTH   ///
  ////////////////////////

  @Get()
  authRedirect(@Res() res): any {
    return res.redirect(
      `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.API42_CLIENT_ID}&redirect_uri=${encodeURIComponent(urlRedirect)}&response_type=code`,
    );
  }

  // https://api.intra.42.fr/apidoc/guides/web_application_flow
  @Get('middleware')
  getAuthCode(@Query('code') query: string, @Res() res): any {
    return fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: `${process.env.API42_CLIENT_ID}`,
        client_secret: `${process.env.API42_CLIENT_SECRET}`,
        code: query,
        redirect_uri: `${urlRedirect}`,
      }),
    })
      .then((response) => response.json())
      .then(async (data) =>
      {
        const userData = await this.get_token(data.access_token);

        try
        {
          // check if user already exists
          let user = await this.prismaService.user.findUnique({
            where: {
              idIntra: userData.login
            }
          });

          if (user)
          {
            console.log('user ' + userData.login + ' already exists');
          }
          else
          {
            user = await this.prismaService.user.create({
              data: {
                email: userData.email,
                tel: userData.phone,
                img: userData.image_url,
                firstName: userData.first_name,
                lastName: userData.last_name,
                userName: `${userData.login}_${String(Date.now())}`,
                idIntra: userData.login,
                campus: userData.campus[0].name
              }
            });
            console.log("Successfully created user ", user);
          }
          const users = await this.prismaService.user.findMany();
          console.log("Users ", users);
        }
        catch (e)
        {
          console.log("Error creating user ", e);
        }
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
          // console.log("userData", jsonData," --END--");
          // let ret: UserData = {
          //   email: jsonData.email,
          //   tel: jsonData.phone,
          //   img: jsonData.image_url,
          //   firstName: jsonData.first_name,
          //   lastName: jsonData.last_name,
          //   userName: `${jsonData.login}_${String(Date.now())}`,
          //   idIntra: jsonData.login,
          //   campus: jsonData.campus[0].name
          // };
          // return ret;
          return jsonData;
        })

    } catch (e) {
      throw new HttpException(
        "It didn't works " + e.message,
        HttpStatus.CONFLICT,
      );
    }
  }
}
