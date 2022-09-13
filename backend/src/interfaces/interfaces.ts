import { Request } from 'express';
import { Status } from '@prisma/client';

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
	losses: number;
	elo: number;
	twoFactorEnabled: boolean;
	otpSecret: string;
	otpUri: string;
	isOwner: boolean;
	isAdmin: boolean;
	onlineStatus: Status;
}

export interface IPublicUser
{
	profilePicture: string;
	username: string;
	login: string;
	campus: string;
	wins: number;
	losses: number;
	elo: number;
	isOwner: boolean;
	isAdmin: boolean;
	onlineStatus: Status;
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

export interface IGamePlayer
{
	clientId: string;
	login: string;
	ready: boolean;
	score: number;
}

export interface IGameRoom
{
	id: string;
	player1: IGamePlayer;
	player2: IGamePlayer;
}

export interface IGameMovePayload
{
	y: number;
}