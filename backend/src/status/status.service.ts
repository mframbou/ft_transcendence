import {Injectable, NotFoundException} from '@nestjs/common';
import {UsersService} from "../users/users.service";
import {AuthService} from "../auth/auth.service";

@Injectable()
export class StatusService {

	constructor(
			private usersService: UsersService,
			private authService: AuthService,
	) {}

	async setCurrentUserStatus(cookies: string[], onlineStatus: boolean) {

		const user = await this.authService.getCurrentUser(cookies);

		if (!user)
			return;
			/*throw new NotFoundException('Session cookie not found');*/

		await this.usersService.setOnlineStatus(user.login, onlineStatus);
	}

}
