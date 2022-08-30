/* eslint-disable prefer-const */
// Nest
import {Controller, Get, Res, Query, Req} from '@nestjs/common';
import fetch from 'node-fetch';

// Transcendence
import {AuthService} from "./auth.service";
import {UsersService} from "../users/users.service";

const callbackUrl42 = `http://${process.env.SERVER_NAME}:3000/auth/42/callback`;
const sessionCookieName = 'transcendence_session';
const homePageFrontend = `http://${process.env.SERVER_NAME}:3001/home`;
const cookieDuration = 1000 * 60 * 60 * 24 * 30; // 30 days

@Controller('auth')
export class AuthController {
  constructor(
      private authService: AuthService,
      private usersService: UsersService,
  )
  {}

  /////////////////////////
  ///   LOGIN & AUTH   ///
  ////////////////////////

  @Get('42')
  async authRedirect42(@Req() req, @Res() res) {

    // If users already has a session redirect to home
    const user = await this.authService.getCurrentUser(req.cookies);

    if (user)
    {
      console.log("User already logged in: ", user.login);
      await this.usersService.setOnlineStatus(user.login, true);
      return res.redirect(homePageFrontend);
    }

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
        client_id: process.env.API42_CLIENT_ID,
        client_secret: process.env.API42_CLIENT_SECRET,
        code: code,
        redirect_uri: callbackUrl42,
      }),
    })

    response = await response.json();

    const userData = await this.authService.getUserData(response.access_token);
    let user = await this.usersService.getUser(userData.login);
    let message: string;

    if (!user)
    {
      user = await this.usersService.addUser(userData);
      message=  `Successfully added user ${user.login} to the database`;
    }
    else
    {
      message = `User ${user.login} already exists in the database`;
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#parameters
    const users = JSON.stringify(await this.usersService.getUsers(), null, 4);

    message += `\nUsers list: ${users}`;

    console.log(message);

    const cookieHash = await this.authService.updateUserSessionCookie(user);

    // add cookie to response
    res.cookie(sessionCookieName, cookieHash, {
      httpOnly: true,
      sameSite: 'Strict',
      maxAge: cookieDuration,
    });

    console.log("Created cookie for users " + user.login);

    return res.redirect(homePageFrontend);
  }

}
