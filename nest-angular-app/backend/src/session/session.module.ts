// Nest
import { CacheModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

// Transcendence
import { MySessionService } from './session.service';
import { SessionController } from './session.controller';

@Module({
	imports: [CacheModule.register({
		store: redisStore,
		host: 'rediStatus',
		port: 6379
	})],
    controllers: [SessionController],
    providers: [MySessionService]
})

export class SessionModule {}
