/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { env } from 'process';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { readFileSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.setGlobalPrefix('api');

  app.use((req, res, next) => {
    if (req.url.startsWith('/auth')) return next();

    bodyParser.json()(req, res, next);
  });

  app.enableCors({
    origin: [env.CLIENT_URL, env.MIRROR_URL],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // docs api config
  const config = new DocumentBuilder()
    .setTitle('BBDB api')
    .setDescription('API for Beton Brutal Database')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const customCss = readFileSync(
    join(__dirname, '../assets/styles/swagger-theme.css'),
    'utf8',
  );

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory, {
    customCss,
    customfavIcon: '/assets/icons/favicon.png',
    customCssUrl: '/assets/swagger-theme.css',
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
