// Nest
import { Injectable, CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

// Transcendence
import { ISession } from "../interfaces/interfaces";
import AbstractSessionStorage from './AbstractSessionStorage';
import error_dispatcher from "../error-dispatcher/error-dispatcher";

@Injectable()
export class MySessionService extends AbstractSessionStorage {

	private readonly sessions: Map<string, ISession>;
	constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
		super();
		this.sessions = new Map<string, ISession>();
  }

	async save_current_session(id : string, session : ISession) {
		try {
			await this.cacheManager.set(id, session, {ttl: 0})
		} catch (e) {
			error_dispatcher(e)
		}
	}

	async find_session(userId : string) : Promise<any> {
		try {
			let session: any = await this.cacheManager.get(userId)
			return session;
		} catch (e) {
			error_dispatcher(e)
		}
	}

	async find_every_sessions() : Promise< Map<string, ISession> > {
		try {
			return await this.sessions;
		} catch (e) {
			error_dispatcher(e)
		}
	}
}
