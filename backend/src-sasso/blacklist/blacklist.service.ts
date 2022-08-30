// Nest
import { Injectable } from '@nestjs/common';

// Transcendence
import { PrismaService } from "../prisma/prisma.service";
import ErrorDispatcher from "../error-dispatcher/error-dispatcher";

@Injectable()
export class BlacklistService {
	constructor(
	    private readonly prisma: PrismaService) { }

	async addBlock(block : any) : Promise<void> {
		try {
			await this.prisma.blacklist.create({
				data : {
					blockId : block.myIdIntra,
					blockedId : block.blockedIdIntra
				}
			})
		} catch (e : any) { ErrorDispatcher(e) }
	}

	async removeBlock(sblock :any) : Promise<void>{
	    try {
	    	await this.prisma.blacklist.deleteMany({
				where: {
					blockId: sblock.myIdIntra,
					blockedId: sblock.blockedIdIntra
				}
			})
		} catch (e:any) { ErrorDispatcher(e) }
    }

	async showBlocked(userId : string) : Promise<any> {
		const ret = await this.prisma.blacklist.findMany({
			where : {
				blockId : userId,
			}
		})
			.catch((e : any) => ErrorDispatcher(e));
		return ret;
	}
}
