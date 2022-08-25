/* eslint-disable prefer-const */
// Nest
import {Controller, Get, Res, Query, Req} from '@nestjs/common';
import fetch from 'node-fetch';
import { hash, compare } from 'bcrypt';

// Transcendence
import {AuthService} from "./auth.service";

interface UserData {
  idIntra: string;
  userName: string;
  firstName: string;
  lastName: string;
  img: string;
  campus: string;
}

const callbackUrl42 = `http://${process.env.SERVER_NAME}:3000/auth/42/callback`;

@Controller('auth')
export class AuthController {
  constructor(
      private authService: AuthService,
  )
  {}

  /////////////////////////
  ///   LOGIN & AUTH   ///
  ////////////////////////

  @Get('42')
  authRedirect42(@Res() res) {
    return res.redirect(
      `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.API42_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl42)}&response_type=code`,
    );
  }

  // https://api.intra.42.fr/apidoc/guides/web_application_flow
  @Get('42/callback')
  async authCallback42(@Query('code') code: string, @Res() res, @Req() req): Promise<any> {
    let response = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: `${process.env.API42_CLIENT_ID}`,
        client_secret: `${process.env.API42_CLIENT_SECRET}`,
        code: code,
        redirect_uri: callbackUrl42,
      }),
    })

    response = await response.json();

    const userData = await this.authService.getUserData(response.access_token);
    let user = await this.authService.getUser(userData.login);
    let message: string;

    if (!user)
    {
      user = await this.authService.addUser(userData);
      message=  `Successfully added user ${user.idIntra} to the database`;
    }
    else
    {
      message = `User ${user.idIntra} already exists in the database`;
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#parameters
    const users = JSON.stringify(await this.authService.getUsers(), null, 4);

    message += `\nUsers list: ${users}`;

    console.log(message);

    const cookieHash = await hash('test', 10);
    console.log("Hash is ", cookieHash);
    console.log("Comparison result is ", await compare('test1', cookieHash));

    return res.redirect(`http://${process.env.SERVER_NAME}:3001/home`);
  }

}
