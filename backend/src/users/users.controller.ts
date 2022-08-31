import { Body, Controller, Get, NotFoundException, Param, Post, Req, UseGuards } from '@nestjs/common';
import { IJwtPayload, IPublicUser, IUserRequest } from '../interfaces/interfaces';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { Request } from 'express';
import { UpdateUserDto } from './updateUser.dto';
import { JwtTwoFactorAuthGuard } from '../auth/jwt-two-factor-auth.guard';

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
	async getCurrentUser(@Req() req: IUserRequest): Promise<IPublicUser>
	{
		// const { login: userLogin, twoFactorEnabled: userTwoFactorEnabled } = req.user;
		const payload: IJwtPayload = req.jwtPayload;


		const user = await this.usersService.getPublicUser(payload.login);

		if (!user)
			throw new NotFoundException(`Cannot find current user in database`);

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
			if (updateValues.username.length === 0)
				throw new NotFoundException(`Username cannot be empty`);
			else if (updateValues.username.length > 20)
				throw new NotFoundException(`Username cannot be longer than 20 characters`);
		}

		if (updateValues.profilePicture)
		{
			// check if image png, jpg or gif
			if (!updateValues.profilePicture.match(/^data:image\/(png|jpg|gif|jpeg);base64,/))
				throw new NotFoundException(`Profile picture must be a png, jpg or gif`);
		}

		const updatedUser = await this.usersService.updateUser(payload.login, updateValues);

		return updatedUser;
	}


}