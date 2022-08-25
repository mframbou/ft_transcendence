// Nest
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import fetch from 'node-fetch';

// Transcendence

// Videos tutorial: https://www.youtube.com/watch?v=KQya9i6czhM
// https://www.youtube.com/watch?v=Yv5tZu5wAU0

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async getUser(idIntra: string) : Promise<any> {
    return await this.prismaService.user.findUnique({
      where: {
        idIntra: idIntra,
      },
    });
  }

  async getUsers() : Promise<any> {
    return await this.prismaService.user.findMany();
  }

  async addUser(userData: any) : Promise<any> {
    return await this.prismaService.user.create({
      data: {
        email: userData.email,
        tel: userData.phone,
        img: userData.image_url,
        firstName: userData.first_name,
        lastName: userData.last_name,
        userName: `${userData.login}_${String(Date.now())}`,
        idIntra: userData.login,
        campus: userData.campus[0].name
      },
    });
  }

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

  async updateUserSessionCookie(user: any, sessionCookie: string) : Promise<any> {
    return await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: {
        sessionCookie: sessionCookie,
      },
    });
  }

}
