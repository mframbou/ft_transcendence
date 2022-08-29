import {Body, Controller, Get, NotFoundException, Param, Post, Req} from '@nestjs/common';
import { IPublicUser} from "../interfaces/interfaces";
import { UsersService } from "./users.service";
import { AuthService } from "../auth/auth.service";
import {Request} from "express";
import { UpdateUserDto } from './updateUser.dto'

@Controller('users')
export class UsersController
{
	constructor(
			private usersService: UsersService,
			private authService: AuthService,
	) {}

	@Get()
	async getPublicUsers(): Promise<IPublicUser[]>
	{
		return await this.usersService.getPublicUsers();
	}

	// Put 'me' before ':login' for priority
	@Get('me')
	async getCurrentUser(@Req() req: Request): Promise<IPublicUser>
	{
		const user = await this.authService.getCurrentUser(req.cookies);

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
	async updateCurrentUser(@Req() req: Request, @Body() updateValues: UpdateUserDto): Promise<IPublicUser>
	{
		const currentUser = await this.authService.getCurrentUser(req.cookies);

		if (!currentUser)
			throw new NotFoundException(`Cannot find current user in database`);

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

		const updatedUser = await this.usersService.updateUser(currentUser.login, updateValues);

		return updatedUser;
	}


}