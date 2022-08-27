import { Injectable, NestMiddleware } from '@nestjs/common';
import { StatusService } from "./status/status.service";
import { Request, Response } from "express";

@Injectable()
export class StatusMiddleware implements NestMiddleware {

  constructor(
      private statusService: StatusService,
  ) {}

  // https://docs.nestjs.com/middleware
  // Used to make user online at every request (so that they don't have to come from login page everytime)
  async use(req: Request, res: Response, next: () => void) {
    // await this.statusService.setCurrentUserStatus(req.cookies, true);
    next();
  }
}
