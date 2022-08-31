// Nest
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import fetch from 'node-fetch';
import { hash } from 'bcrypt';

// Transcendence
import { PrismaService } from 'src/prisma/prisma.service';
import { IJwtPayload, IUser } from '../interfaces/interfaces';
import errorDispatcher from '../utils/error-dispatcher';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

// Videos tutorial: https://www.youtube.com/watch?v=KQya9i6czhM
// https://www.youtube.com/watch?v=Yv5tZu5wAU0

@Injectable()
export class AuthService
{
	constructor(
			private prismaService: PrismaService,
			private jwtService: JwtService,
	) {}

	async getUserData(accessToken: string): Promise<any>
	{
		try
		{
			const response = await fetch('https://api.intra.42.fr/v2/me', {
				method: 'GET',
				headers: {Authorization: `Bearer ${accessToken}`},
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

	async getJwtFromCookie(sessionCookie: string): Promise<IJwtPayload>
	{
		// decode jwt cookie
		let jwtPayload = null;
		try
		{
			jwtPayload = await this.jwtService.verifyAsync(sessionCookie);
		}
		catch (e)
		{
			jwtPayload = null;
		}


		if (!jwtPayload || typeof jwtPayload === 'string' || jwtPayload.login === undefined || jwtPayload.twoFactorEnabled === undefined)
			throw new HttpException('Invalid session cookie', HttpStatus.BAD_REQUEST);

		// cast because decode has no type safety (checking types right above)
		return jwtPayload as IJwtPayload;
	}

	async getCurrentJwt(req: Request): Promise<IJwtPayload>
	{
		const sessionCookie = req?.cookies['cockies'] ?? null;

		if (!sessionCookie)
			return null;

		const jwt: IJwtPayload = await this.getJwtFromCookie(sessionCookie);
		return jwt;
	}

}
