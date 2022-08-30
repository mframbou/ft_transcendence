// Nest
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { IJwtPayload } from '../interfaces/interfaces';

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(Strategy, 'jwt-two-factor')
{
	constructor()
	{
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET,
		});
	}

	validate(payload: IJwtPayload): IJwtPayload
	{
		if (!payload)
			throw new HttpException('No payload provided', HttpStatus.UNAUTHORIZED);

		if (payload.twoFactorEnabled === true)
		{
			throw new HttpException('You need to connect using two factor authentication', HttpStatus.UNAUTHORIZED);
		}
		return {login: payload.login, twoFactorEnabled: payload.twoFactorEnabled};
	}
}

function cookieExtractor(req: Request)
{
	let jwt = null;

	if (req && req.cookies)
		jwt = req.cookies['cockies'];

	return jwt;
}
