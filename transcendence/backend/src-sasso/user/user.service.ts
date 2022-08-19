// Nest
import { ClientProxy } from '@nestjs/microservices';
import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Cache } from 'cache-manager';

// Transcendence
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import error_dispatcher from '../error-dispatcher/error-dispatcher';
import { MySessionService } from '../session/session.service';
import { ISession, IUser } from '../interfaces/interfaces';

@Injectable()
export class UserService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject('NOTIFY_SERVICE') private client: ClientProxy,
    private auth: AuthService,
    private readonly prisma: PrismaService,
    private sessionService: MySessionService,
  ) {
    this.prisma = new PrismaService();
  }

  async two_factor_activate(id: number): Promise<HttpStatus> {
    try {
      await this.prisma.user.update({
        where: { id: id },
        data: { twoFa: true },
      });
      await this.auth.start_two_factor(id);
      return HttpStatus.ACCEPTED;
    } catch (e) {
      error_dispatcher(e);
    }
  }

  async two_factor_dectivation(idIntra: string): Promise<any> {
    try {
      const user = await this.prisma.user.update({
        where: { idIntra: idIntra },
        data: {
          twoFa: false,
          otpSecret: '',
          otpUrl: '',
        },
      });
      return user;
    } catch (e) {
      error_dispatcher(e);
    }
  }
}
