import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';
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

	@IsOptional()
	@IsString()
	password: string;
}