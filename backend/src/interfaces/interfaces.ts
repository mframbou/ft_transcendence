export interface ISession {
  status: 'in-game' | 'online' | 'offline';
  socketId: string;
}

export interface IUser {
  id: number;
  email: string;
  phone: string;
  profilePicture: string;
  firstName: string;
  lastName: string;
  userName: string;
  login: string;
  campus: string;
  win: number;
  loses: number;
  elo: number;
  twoFactorEnabled: boolean;
  otpSecret: string;
  otpUrl: string;
  isOwner: boolean;
  isAdmin: boolean;
  isOnline: boolean;
  sessionCookie: string;
}

// export interface IUser {
//   id: number;
//   email: string;
//   tel: string;
//   img: string;
//   firstName: string;
//   lastName: string;
//   userName: string;
//   idIntra: string;
//   campus: string;
//   twoFa?: boolean;
//   otpSecret?: string;
//   otpUrl?: string;
//   win: number;
//   loses: number;
//   rank: number;
//   badge: any;
//   chat: any;
//   admin: any;
//   participant: any;
//   userFriends: any;
//   blocked: any;
//   blockedBy: any;
//   moderators: any;
//   status?: string;
// }

export interface IBasicUserInfo {
  id: number;
  idIntra: string;
  img: string;
  userName: string;
}

export interface IAdmin {
  idIntra: string;
  idChat: number;
}
