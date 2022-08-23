/* eslint-disable prefer-const */
// Nest
import { Controller, Get, Res, Query} from '@nestjs/common';
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

const urlRedirect = 'http://localhost:3000/auth/middleware';

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
  authRedirect(@Query('hostname') hostname: string, @Res() res): any {
    let redirectUrl = `http://${hostname}:3000/auth/middleware`;
    return res.redirect(
      `https://api.intra.42.fr/oauth/authorize?client_id=${process.env.API42_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code`,
    );
  }

  // https://api.intra.42.fr/apidoc/guides/web_application_flow
  @Get('middleware')
  async getAuthCode(@Query('code') query: string, @Res() res): Promise<any> {

    let response = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: `${process.env.API42_CLIENT_ID}`,
        client_secret: `${process.env.API42_CLIENT_SECRET}`,
        code: query,
        // redirect_uri: `${urlRedirect}`,
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
    res.send(message);





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
