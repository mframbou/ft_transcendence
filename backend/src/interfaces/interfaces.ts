import {Request} from 'express';

export interface ISession
{
	status: 'in-game' | 'online' | 'offline';
	socketId: string;
}

export interface IUser
{
	id: number;
	email: string;
	phone: string;
	profilePicture: string;
	firstName: string;
	lastName: string;
	username: string;
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
}

export interface IPublicUser
{
	profilePicture: string;
	username: string;
	login: string;
	campus: string;
	wins: number;
	loses: number;
	elo: number;
	isOwner: boolean;
	isAdmin: boolean;
	isOnline: boolean;
}

export interface ISelfUser extends IPublicUser
{
	twoFactorEnabled: boolean;
}

export interface IBasicUserInfo
{
	id: number;
	idIntra: string;
	img: string;
	username: string;
}

export interface IAdmin
{
	idIntra: string;
	idChat: number;
}

export interface IJwtPayload
{
	login: string;
	need2Fa: boolean;
}

export interface IUserRequest extends Request
{
	jwtPayload: IJwtPayload,
}

export interface IWebsocketClient
{
	id: string;
	login: string,
	namespace: string,
}