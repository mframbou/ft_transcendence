import {
	Body,
	Controller,
	Get,
	NotFoundException,
	Param,
	Post,
	Req,
	UnprocessableEntityException,
	UseGuards
} from '@nestjs/common';
import { IJwtPayload, IPublicUser, ISelfUser, IUserRequest } from '../interfaces/interfaces';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { UpdateUserDto } from './updateUser.dto';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';
import * as Jimp from 'jimp';
import { Buffer } from 'buffer';

@UseGuards(JwtTwoFactorAuthGuard)
@Controller('users')
export class UsersController
{
	constructor(
			private usersService: UsersService,
			private authService: AuthService,
	)
	{}

	@Get()
	async getPublicUsers(): Promise<IPublicUser[]>
	{
		return await this.usersService.getPublicUsers();
	}

	// Put 'me' before ':login' for priority
	// jwt payload is stored under request.user (https://stackoverflow.com/questions/61724011/nestjs-nodejs-passport-jwt-stock-current-user
	@Get('me')
	async getCurrentUser(@Req() req: IUserRequest): Promise<ISelfUser>
	{
		// const { login: userLogin, twoFactorEnabled: userTwoFactorEnabled } = req.user;
		const payload: IJwtPayload = req.jwtPayload;

		const user = await this.usersService.getSelfUser(payload.login);

		if (!user)
		{
			throw new NotFoundException(`Cannot find current user in database`);
		}

		return user;
	}

	@Get(':login')
	async getPublicUser(@Param('login') login: string): Promise<IPublicUser>
	{
		const user = await this.usersService.getPublicUser(login);

		if (!user)
			throw new NotFoundException(`User ${login} does not exists`);

		return user;
	}


	// Max body size is 10mb (see main.ts)
	@Post('update/me')
	async updateCurrentUser(@Req() req: IUserRequest, @Body() updateValues: UpdateUserDto): Promise<IPublicUser>
	{
		const payload: IJwtPayload = req.jwtPayload;

		if (updateValues.username)
		{
			updateValues.username = updateValues.username.trim();
			if (updateValues.username.length < 3)
				throw new UnprocessableEntityException(`Usename must be at least 3 characters long`);
			else if (updateValues.username.length > 20)
				throw new UnprocessableEntityException(`Username cannot be longer than 20 characters`);
		}

		if (updateValues.profilePicture)
		{
			// https://github.com/oliver-moran/jimp/issues/231
			// https://www.npmjs.com/package/jimp
			let buf = Buffer.from(updateValues.profilePicture.replace(/^data:image\/(png|jpg|gif|jpeg);base64,/, ''), 'base64');
			try
			{
				const res = await Jimp.read(buf);
				if (res.bitmap.width === 0 || res.bitmap.height === 0)
					throw new Error();
			}
			catch (e)
			{
				console.log('invalid image provided');
				throw new UnprocessableEntityException('Invalid image provided');
			}
		}

		const updatedUser = await this.usersService.updateUser(payload.login, updateValues);

		return updatedUser;
	}


}