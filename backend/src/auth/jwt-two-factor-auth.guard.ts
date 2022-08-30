// Nest
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtTwoFactorAuthGuard extends AuthGuard('jwt-two-factor')
{
	constructor() {
		super({
			property: 'jwtPayload', // property to extract the jwt from (req.jwtPayload, default is 'user')
		});
	}
}
