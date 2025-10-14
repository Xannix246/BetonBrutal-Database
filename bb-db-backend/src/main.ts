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

  app.enableCors({
    origin: ['http://26.220.176.177:3001', 'http://localhost:3001'],
    credentials: true, // важно для передачи cookie / session
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
