import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import * as fs from 'fs';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {

  // const httpsOptions = {
  //   cert: fs.readFileSync('/etc/ssl/certs/transcendence.crt'),
  //   key: fs.readFileSync('/etc/ssl/private/transcendence.key'),
  // }

  const app = await NestFactory.create(AppModule, {
    // httpsOptions,
  });
  app.use(cookieParser()); // To allow to get cookies
  // app.setGlobalPrefix('test');
  await app.listen(3000);
}
bootstrap();
