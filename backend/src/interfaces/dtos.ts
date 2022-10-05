import {
	IsBoolean,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	MaxLength, Min, Max,
	MinLength, IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class AddFriendDto
{
	@IsString()
	@IsNotEmpty()
	login: string;
}

export class UpdateUserDto
{
	@IsOptional()
	@Transform(({ value }) => value?.trim())
	@MinLength(3)
	@MaxLength(20)
	@IsString()
	username: string;

	@IsOptional()
	@IsString()
	profilePicture: string;
};

export class AddRoomDto
{
	@IsString()
	name: string;

	@IsBoolean()
	is_private: boolean;

	@IsBoolean()
	is_protected: boolean;

	@IsOptional()
	@IsString()
	password: string;
}

export class AddParticipantDto
{
	@IsNumber()
	chatId: number;

	@IsOptional()
	@IsString()
	password: string;
}

export class JoinProfileDto
{
	@IsString()
	login1: string;

	@IsString()
	login2: string;
}

export class WsFirstConnectDto
{
	@IsString()
	@IsNotEmpty()
	cookie: string;
}

export class WsPaddleMoveDto
{
	// number y between 0 and 1
	@IsNumber()
	@IsNotEmpty()
	@Min(0)
	@Max(1)
	y: number;
}

export class WsSpectateDto
{
	@IsString()
	@IsNotEmpty()
	roomId: string;
}

export class BlockUserDto
{
	@IsString()
	@IsNotEmpty()
	login: string;
}


// https://stackoverflow.com/a/68800520
const specialModes = ['bingChilling', 'notChilling'];
type SpecialMode = typeof specialModes[number];

export class SpecialModeDto
{
	@IsString()
	@IsNotEmpty()
	@IsIn(specialModes)
	mode: SpecialMode;
}
