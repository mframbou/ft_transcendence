export interface ISession {
  status: 'in-game' | 'online' | 'offline';
  socketId: string;
}

export interface IUserPublic {
  id: number;
  email: string;
  tel: string;
  img: string;
  firstName: string;
  lastName: string;
  userName: string;
  idIntra: string;
  campus: string;
  win: number;
  loses: number;
  rank: number;
}

export interface IUser {
  id: number;
  email: string;
  tel: string;
  img: string;
  firstName: string;
  lastName: string;
  userName: string;
  idIntra: string;
  campus: string;
  twoFa?: boolean;
  otpSecret?: string;
  otpUrl?: string;
  win: number;
  loses: number;
  rank: number;
  badge: any;
  chat: any;
  admin: any;
  participant: any;
  userFriends: any;
  blocked: any;
  blockedBy: any;
  moderators: any;
  status?: string;
}

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
