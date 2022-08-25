import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UserService {
	constructor(private prismaService: PrismaService) {}

	async getUser(login: string) : Promise<any> {
		return await this.prismaService.user.findUnique({
			where: {
				login: login,
			},
		});
	}

	async getUsers() : Promise<any> {
		return await this.prismaService.user.findMany();
	}

	async addUser(userData: any) : Promise<any> {
		return await this.prismaService.user.create({
			data: {
				email: userData.email,
				phone: userData.phone,
				profilePicture: userData.image_url,
				firstName: userData.first_name,
				lastName: userData.last_name,
				userName: `${userData.login}_${String(Date.now())}`,
				login: userData.login,
				campus: userData.campus[0].name
			},
		});
	}

}
