import {Controller, Get, Req} from '@nestjs/common';
import {UsersService} from "../users/users.service";
import {AuthService} from "../auth/auth.service";
import {Request} from "express";
import {StatusService} from "./status.service";

@Controller('status')
export class StatusController {

	constructor(
			private authService: AuthService,
			private usersService: UsersService,
			private statusService: StatusService,
	) {}

	@Get('offline')
	async setOffline(@Req() req: Request) {

		await this.statusService.setCurrentUserStatus(req.cookies, false);

		return 'You are now offline';
	}
}
