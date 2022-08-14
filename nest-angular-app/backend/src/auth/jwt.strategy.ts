// Nest
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy ) {
	constructor() {
		super(
			{
				jwtFromRequest : ExtractJwt.fromExtractors([cookie_checker]),
				ignoreExpiration: false,
				secretOrKey: process.env.SECRET,
			}
		)
	}

	validate(payload: any){
		if (!payload)
			throw new HttpException("not autorized", HttpStatus.UNAUTHORIZED)
		return { id: payload.id };
	}
}

var cookie_checker = function (req) {
	var token = null;
	if (req && req.cookies) {
		token = req.cookies['cockies'];
		if (!token)
			token = req.cookies['cookie2f'];
	}
	return token;
}