// Nest
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import fetch from 'node-fetch';
import {hash} from "bcrypt";

// Transcendence

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
        'Error while fetching user data ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserFromSessionCookie(sessionCookie: string): Promise<any> {
    return await this.prismaService.user.findUnique({
      where: {
        sessionCookie: sessionCookie,
      },
    });
  }

  async updateUserSessionCookie(user: any) : Promise<string> {
    const cookie = await hash(user.login, 10);

    await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        sessionCookie: cookie,
      },
    });

    return cookie;
  }

}
