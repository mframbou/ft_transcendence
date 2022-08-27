// Nest
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { hash } from "bcrypt";

// Transcendence
import { PrismaService } from 'src/prisma/prisma.service';
import { IUser } from "../interfaces/interfaces";
import errorDispatcher from '../utils/error-dispatcher';

// Videos tutorial: https://www.youtube.com/watch?v=KQya9i6czhM
// https://www.youtube.com/watch?v=Yv5tZu5wAU0

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async getUserData(accessToken: string) : Promise<any> {
    try
    {
      const response = await fetch('https://api.intra.42.fr/v2/me', {
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      return await response.json();
    }
    catch (error)
    {
      throw new HttpException(
        'Error while fetching users data ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserFromSessionCookie(sessionCookie: string): Promise<IUser> {
    try
    {
      return await this.prismaService.user.findUnique({
        where: {
          sessionCookie: sessionCookie,
        },
      });
    }
    catch (e)
    {
      errorDispatcher(e);
    }
  }

  async getCurrentUser(cookies: string[]): Promise<IUser>
  {
    const sessionCookie = cookies['transcendence_session'];

    if (!sessionCookie)
      return null;

    const user = await this.getUserFromSessionCookie(sessionCookie);
    return user;
  }

  async updateUserSessionCookie(user: any) : Promise<string> {
    const cookie = await hash(user.login, 10);

    try
    {
      await this.prismaService.user.update({
        where: {
          id: user.id,
        },
        data: {
          sessionCookie: cookie,
        },
      });
    }
    catch (e)
    {
      errorDispatcher(e);
    }

    return cookie;
  }

}
