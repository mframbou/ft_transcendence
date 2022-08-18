// Nest
import { Controller, Get, Param, UseGuards } from '@nestjs/common';

// Transcendence
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {
  }
}
