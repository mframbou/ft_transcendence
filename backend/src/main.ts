import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { json } from 'express';

// import * as fs from 'fs';

async function bootstrap()
{

	// const httpsOptions = {
	//   cert: fs.readFileSync('/etc/ssl/certs/transcendence.crt'),
	//   key: fs.readFileSync('/etc/ssl/private/transcendence.key'),
	// }

	const app = await NestFactory.create(AppModule, {
		// httpsOptions,
	});
	app.use(cookieParser()); // To allow to get cookies

	// app.enableCors({
	// 	origin: `http://${process.env.SERVER_NAME}:3001`, // Allow requests from front to back / reverse
	// 	credentials: true, // Allow passing credentials front front to back / reverse
	// }); // To allow cross-origin requests (requests from different origins)

	app.use('/users/update/me', json({limit: '10mb'})); // (default max body size is 1mb I think)
	// app.setGlobalPrefix('/api');

	await app.listen(3000);
}

bootstrap();
