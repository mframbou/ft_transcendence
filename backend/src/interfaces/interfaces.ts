import { Request } from 'express';
import { Status } from '@prisma/client';
import ServerSidePong from '../game/pong';
import { User, Friend, BlockedUser, Match } from '@prisma/client';
import { Socket } from 'socket.io';
import internal from 'stream';

export interface ISession
{
	status: 'in-game' | 'online' | 'offline';
	socketId: string;
}

// make interface IUser = User from prisma
export interface IUser extends User
{}

export interface IFriend extends Friend
{}

export interface IBlockedUser extends BlockedUser
{}

export interface IMatchResults
{
	winner: IPublicUser;
	loser: IPublicUser;
	winnerScore: number;
	loserScore: number;
	timestamp: Date;
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
	status: Status;
}


export interface ISelfUser extends IPublicUser
{
	twoFactorEnabled: boolean;
	blockedUsers: IBlockedUser[];
	blockingUsers: IBlockedUser[];
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
	connected: boolean;
	login: string;
	ready: boolean;
}

export interface IGameSpectator
{
	clientId: string;
	login: string;
}

export interface IGameRoom
{
	id: string;
	player1: IGamePlayer;
	player2: IGamePlayer;
	gameInstance?: ServerSidePong;
	spectators?: IGameSpectator[];
}

export interface IPublicGameRoom
{
	id: string;
	player1: IPublicUser;
	player2: IPublicUser;
}

export interface IChatUser {
	clientId: string;
	login: string;
	is_admin: boolean;
	is_moderator: boolean;
}

export interface IChatRoom
{
	id: number;
	name: string;
	users: IChatUser[];
	is_private: boolean;
	password?: string;
}

export interface ICommand
{
	name: string;
	argsCount: [number, number] // [min, max]
	usage: string;
	description: string;
	handler: any;
	owner: boolean;	
	admin: boolean;	
	moderator: boolean;	
	user: boolean;	
}
export interface INotification
{
	service: string;
	title: string;
	content: string;
	link: string;

	senderLogin?: string;
}

export enum EUserStatus
{
	ONLINE = 'ONLINE',
	OFFLINE = 'OFFLINE',
	IN_GAME = 'IN_GAME',
}

export interface IWsClient extends Socket
{
	transcendenceUser: IWebsocketClient;
}

export interface IDuel
{
	sender: IGamePlayer;
	receivers: IGamePlayer[]; // handle case where receiver is logged in on multiple devices
}
