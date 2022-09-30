import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import ErrorDispatcher from "../error-dispatcher/error-dispatcher";
import { IFollower } from "../../interfaces/interfaces";

@Injectable()
export class FriendsService {
	constructor(
		private readonly prisma: PrismaService,
	) {}

	async addFriend(friend : any) : Promise<void> {
		try {
			let follower = await this.prisma.user.findUnique({
				where : {
					idIntra : friend.userId
				},
				select : {
					userName : true,
					img : true
				}
			})
			await this.prisma.friends.create({
				data: {
					userId: friend.userId,
					friendId: friend.friendId
				}
			})
			let follow : IFollower = {
				userId : friend.userId,
				friendId : friend.friendId,
				img : follower.img,
				userName : follower.userName
			}
		} catch (e) {
			console.log("Friend Service Error:", e)
			ErrorDispatcher(e)
		}
	}

	async removeFriend(friend) :Promise<void> {
	    await this.prisma.friends.deleteMany({
            where: {
                userId: friend.userId,
                friendId: friend.friendId
            },
        })
            .catch(e => ErrorDispatcher(e));
    }

	async showFriends() : Promise<any> {
		try {
			return await this.prisma.friends.findMany();
		} catch(e : any) {
			ErrorDispatcher(e)
		}
	}

}
