// Nest
import { Controller, Get, Param, UseGuards } from '@nestjs/common';

// Transcendence
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import ErrorDispatcher from './error-dispatcher/error-dispatcher';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {
    this.prisma = new PrismaService();
  }

  // https://www.youtube.com/watch?v=2n3xS89TJMI
  @UseGuards(JwtAuthGuard)
  @Get('users/:id')
  async findOne(@Param('id') id: string): Promise<any> {
    try {
      return await this.prisma.user.findUnique({
        where: {
          idIntra: id,
        },
      });
    } catch (e) {
      ErrorDispatcher(e);
    }
  }
}
