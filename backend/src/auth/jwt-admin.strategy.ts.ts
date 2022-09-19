// Nest
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { IJwtPayload } from '../interfaces/interfaces';
import { UsersService } from '../users/users.service';
import { PermissionsService } from 'src/permissions/permissions.service';

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'jwt-admin')
{
	constructor(
			private usersService: UsersService,
			private permissionsService: PermissionsService,
	)
	{
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET,
		});
	}

	async validate(payload: IJwtPayload): Promise<IJwtPayload>
	{
		if (!payload)
			throw new HttpException('No payload provided', HttpStatus.UNAUTHORIZED);

		if (payload.need2Fa === true)
		{
			throw new HttpException('You need to connect using two factor authentication', HttpStatus.UNAUTHORIZED);
		}

		const isAdmin = await this.permissionsService.isAdmin(payload.login);
		if (!isAdmin)
		{
			throw new HttpException('You are not an admin', HttpStatus.FORBIDDEN);
		}

		return {login: payload.login, need2Fa: payload.need2Fa};
	}
}

function cookieExtractor(req: Request)
{
	let jwt = null;

	if (req && req.cookies)
		jwt = req.cookies['cockies'];

	return jwt;
}
