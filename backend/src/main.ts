import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
// import * as fs from 'fs';

async function bootstrap() {

  // const httpsOptions = {
  //   cert: fs.readFileSync('/etc/ssl/certs/transcendence.crt'),
  //   key: fs.readFileSync('/etc/ssl/private/transcendence.key'),
  // }

  const app = await NestFactory.create(AppModule, {
    // httpsOptions,
  });
  app.use(cookieParser()); // To allow to get cookies
  await app.listen(3000);
}

bootstrap();
