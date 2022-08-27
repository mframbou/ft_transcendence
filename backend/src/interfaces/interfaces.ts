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
  wins: number;
  loses: number;
  elo: number;
  twoFactorEnabled: boolean;
  otpSecret: string;
  otpUri: string;
  isOwner: boolean;
  isAdmin: boolean;
  isOnline: boolean;
  sessionCookie: string;
}

export interface IPublicUser {
  profilePicture: string;
  userName: string;
  login: string;
  campus: string;
  wins: number;
  loses: number;
  elo: number;
  isOwner: boolean;
  isAdmin: boolean;
  isOnline: boolean;
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