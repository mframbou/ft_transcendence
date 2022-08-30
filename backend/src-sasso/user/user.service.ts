// Nest
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';

// Transcendence
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import ErrorDispatcher from '../error-dispatcher/error-dispatcher';
import { MySessionService } from '../session/session.service';
import { ISession, IUser } from '../interfaces/interfaces';

@Injectable()
export class UserService {
  constructor(
    private auth: AuthService,
    private readonly prisma: PrismaService,
    private sessionService: MySessionService,
  ) {
    this.prisma = new PrismaService();
  }

  ///////////////////////
  ///      SHOWS      ///
  ///////////////////////

  // TODO

  ///////////////////////
  ///  EDIT PROFILE   ///
  ///////////////////////

  async updateShowedName(body) : Promise<any> {
    try {
        let user = await this.prisma.user.update({
            where: {
                idIntra: body.idIntra
            },
            data: {
                userName: body.userName
            },
        });
        user = this.deleteSecrets(user);
        return user;
    } catch (e) {
        ErrorDispatcher(e)
    }
}

async updateAvatar(body) : Promise<any> {
    try {
        let user = await this.prisma.user.update({
            where: {
                idIntra: body.idIntra
            },
            data: {
                img: body.img
            },
        });
        user = this.deleteSecrets(user)
        return user;
    } catch (e) {
        ErrorDispatcher(e)
    }
}

async updatePhone(body): Promise<any> {
    try {
        let user = await this.prisma.user.update( {
            where: {
                idIntra : body.idIntra
            },
            data : {
                tel : body.tel
            },
        });
        user = this.deleteSecrets(user)
        return user;
    } catch (e) {
        ErrorDispatcher(e);
    }
}

async updateMail(body): Promise<any> {
    try {
        let user = await this.prisma.user.update( {
            where: {
                idIntra : body.idIntra
            },
            data : {
                email : body.email
            },
        });
        user = this.deleteSecrets(user)
        return user;
    } catch (e) {
        ErrorDispatcher(e);
    }
}

  ///////////////////////
  ///    PUNISHMENT   ///
  ///////////////////////

  async banUser(body) : Promise<any> {
    try {
        let owner : any = await this.prisma.user.findUnique({
            where:{
                idIntra: body.idIntra
            }
        });
        if (owner.owner)
            throw new HttpException("Not Authorized", HttpStatus.UNAUTHORIZED);
        let user = await this.prisma.user.update({
            where: {
                idIntra : body.idIntra
            },
            data: {
                banned: true
            }
        });
    }catch (e) {
        ErrorDispatcher(e);
    }
}

async unBanUser(body) : Promise<any> {
    try {
        await this.prisma.user.update({
            where: {
                idIntra : body.idIntra
            },
            data: {
                banned: false
            }
        });
    }catch (e) {
        ErrorDispatcher(e);
    }
}

async addUserSiteAdmin(payload : {idIntra : string}) : Promise<void> {
  try {
      await this.prisma.user.update({
          where : {
              idIntra : payload.idIntra
          },
          data : {
              isAdmin : true
          }
      })
  } catch (e) {
      ErrorDispatcher(e)
  }
}

async removeUserSiteAdmin(payload : {idIntra : string}) : Promise<void> {
  try {
      await this.prisma.user.update({
          where : {
              idIntra : payload.idIntra
          },
          data : {
              isAdmin : false
          }
      })
  } catch (e) {
      ErrorDispatcher(e)
  }
}

  ///////////////////////
  ///   MISCELLANEOUS   ///
  ///////////////////////


  deleteSecrets(user : any) : any {
    delete user.twoFa;
    delete user.banned;
    delete user.otpSecret;
    delete user.otpUrl;
    return user;
  }

}
