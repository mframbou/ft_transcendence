// Nest
import { Injectable, CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { GeneratedSecret } from 'speakeasy';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

// Transcendence
import { PrismaService } from '../prisma/prisma.service';

// Videos tutorial: https://www.youtube.com/watch?v=KQya9i6czhM
// https://www.youtube.com/watch?v=Yv5tZu5wAU0

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async start_two_factor(id: number): Promise<any> {
    const otp = await this.prisma.user.findUnique({
      where: { id: id },
      select: { otpSecret: true },
    });
    if (otp.otpSecret === '') {
      const secret: GeneratedSecret = speakeasy.generateSecret();
      await this.prisma.user.update({
        where: { id: id },
        data: {
          otpSecret: secret.base32,
          otpUrl: secret.otpauth_url,
        },
      });
    }
  }

  // https://github.com/speakeasyjs/speakeasy
  async completed_two_factor(body: any): Promise<string> {
    const secret: { otpUrl: string; twoFa: boolean } =
      await this.prisma.user.findUnique({
        where: { id: body.id },
        select: { twoFa: true, otpUrl: true },
      });

    if (!secret.twoFa) return;
    return await qrcode.toDataURL(secret.otpUrl);
  }

  async check_two_factor(body: any, res: Response): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: body.id },
      select: { idIntra: true, otpSecret: true },
    });
    const verified = speakeasy.totp.verify({
      secret: user.otpSecret,
      encoding: 'base32',
      token: body.totp,
    });
    if (verified) {
      res.clearCookie('cookie2f');
      const jwt = await this.jwt.signAsync({ id: user.idIntra });
      res.cookie('cockies', jwt, { httpOnly: true });
      return true;
    } else {
      res.clearCookie('cookie2f');
      return false;
    }
  }
}
