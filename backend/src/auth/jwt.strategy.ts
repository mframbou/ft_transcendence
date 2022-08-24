// Nest
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookie_checker]),
      ignoreExpiration: false,
      secretOrKey: process.env.API42_CLIENT_SECRET,
    });
  }

  validate(payload: any) {
    if (!payload)
      throw new HttpException('not autorized', HttpStatus.UNAUTHORIZED);
    return { id: payload.id };
  }
}

const cookie_checker = function (req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['cockies'];
    if (!token) token = req.cookies['cookie2f'];
  }
  return token;
};
