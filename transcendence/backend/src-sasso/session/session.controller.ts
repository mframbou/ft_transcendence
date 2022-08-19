// Nest
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  CACHE_MANAGER,
} from '@nestjs/common';
import { Cache } from 'cache-manager';

// Transcendence
import { MySessionService } from './session.service';

@Controller('session')
export class SessionController {
  constructor(
    private readonly SessionService: MySessionService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.SessionService = new MySessionService(this.cacheManager);
  }
}
