/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.use((req, res, next) => {
    if (req.url.startsWith('/auth')) return next();

    bodyParser.json()(req, res, next);
  });

  app.enableCors({ origin: '*' });
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
