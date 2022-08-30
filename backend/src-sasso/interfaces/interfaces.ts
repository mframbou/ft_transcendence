//////////////////////////////////
///           USERS            ///
//////////////////////////////////

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

//////////////////////////////////
///           ADMIN            ///
//////////////////////////////////

export interface IAdmin {
  idIntra: string;
  idChat: number;
}

//////////////////////////////////
///           CHAT             ///
//////////////////////////////////

export interface IChat {
  id: number;
  name: string;
  types: string;
  readUntil?: number;
  msg: IMessage[];
  admin: IAdmin[];
  participant: IParticipant[];
}

export interface IMessage {
  timestamp: number;
  sender: string;
  idChat: string;
  userName: string;
  msgBody: string;
}

export interface IJoinPublicChat {
  idIntra: string;
  idChat: number;
  pwd?: string;
}

export interface IParticipant {
  idIntra: string;
  idChat: number;
}

//////////////////////////////////
///          FRIENDS           ///
//////////////////////////////////

export interface IFollower {
	friendId        : string;
	userId          : string;        
	img             : string;
  userName        : string;
}

//////////////////////////////////
///       MISCELLANEOUS        ///
//////////////////////////////////

export interface ISession {
  status: 'in-game' | 'online' | 'offline';
  socketId: string;
}

// TO DO (POSSIBLY): Achievement, Games(Delphin coff coff)
