import {Controller, Get, NotFoundException, Param, Req} from '@nestjs/common';
import { IPublicUser} from "../interfaces/interfaces";
import { UsersService } from "./users.service";
import { AuthService } from "../auth/auth.service";
import {Request} from "express";

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


}