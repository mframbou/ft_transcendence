import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { json } from 'express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap()
{
	const app = await NestFactory.create(AppModule);

	app.use(cookieParser()); // To allow to get cookies
	app.useGlobalPipes(new ValidationPipe({ transform: true }));
	app.use('/users/update/me', json({limit: '10mb'})); // (default max body size is 1mb I think)

	// Allow json in body (for post)
	app.use(json());

	await app.listen(3000);
}

bootstrap();
