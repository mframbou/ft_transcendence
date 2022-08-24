/* eslint-disable prefer-const */
// Nest
import {Controller, Get, Res, Query, Req} from '@nestjs/common';
import fetch from 'node-fetch';

// Transcendence
import {AuthService} from "./auth.service";
import {hostname} from "os";

interface UserData {
  idIntra: string;
  userName: string;
  firstName: string;
  lastName: string;
  img: string;
  campus: string;
}

const callbackUrl = `http://${process.env.SERVER_NAME}:3000/auth/middleware`;

@Controller('auth')
export class AuthController {
  constructor(
      private authService: AuthService,
  )
  {}

  /////////////////////////
  ///   LOGIN & AUTH   ///
  ////////////////////////

  @Get()
  authRedirect(@Res() res): any {

    return res.redirect(
      `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.API42_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code`,
    );
  }

  // https://api.intra.42.fr/apidoc/guides/web_application_flow
  @Get('middleware')
  async getAuthCode(@Query('code') code: string, @Res() res, @Req() req): Promise<any> {

    let response = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: `${process.env.API42_CLIENT_ID}`,
        client_secret: `${process.env.API42_CLIENT_SECRET}`,
        code: code,
        redirect_uri: callbackUrl,
      }),
    })

    response = await response.json();

    console.log(response);

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


    return res.redirect(`http://${process.env.SERVER_NAME}:3001/home`);
    // if (redirectUri)
    // {
    //   console.log("Redirecting to " + redirectUri);
    //   return res.redirect(redirectUri);
    // }
    // else
    // {
    //   return res.redirect('/');
    // }



      // .then((response) => response.json())
      // .then(async (data) =>
      // {
      //   const userData = await this.authService.getUserData(data.access_token);
      //
      //   try
      //   {
      //     // check if user already exists
      //     let user = await this.authService.getUser(userData.login);
      //
      //     if (user)
      //     {
      //       // console.log('user ' + userData.login + ' already exists');
      //       res.send('User ' + userData.login + ' already in the database');
      //     }
      //     else
      //     {
      //       user = await this.authService.addUser(userData);
      //       res.send('User ' + user.login + ' was successfully added to the database');
      //       // console.log("Successfully created user ", user);
      //     }
      //     const users = await this.authService.getUsers();
      //     console.log("Users: ", users);
      //   }
      //   catch (e)
      //   {
      //     console.log("Error creating user ", e);
      //   }
      //   // res.send(userData);
      // });
  }

}
