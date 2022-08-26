import {Controller, Get, NotFoundException, Param} from '@nestjs/common';
import { IPublicUser} from "../interfaces/interfaces";
import {UsersService} from "./users.service";

@Controller('users')
export class UsersController
{
	constructor(
			private usersService: UsersService,
	) {}

	@Get()
	async getPublicUsers(): Promise<IPublicUser[]>
	{
		return await this.usersService.getPublicUsers();
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