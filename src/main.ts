import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import helmet from 'helmet';
import * as path from 'path';
import { AppModule } from './app.module';
import metadata from './metadata';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, '../ssl/private-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../ssl/public-cert.pem')),
  };

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
    httpsOptions,
  });

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: true,
    methods: '*',
    allowedHeaders: '*',
    credentials: true,
  });

  app.use(helmet());

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Project Ecom')
    .setDescription('Project for authentication')
    .setVersion('1.0')
    .build();

  await SwaggerModule.loadPluginMetadata(metadata);
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const port = configService.get('PORT');

  await app.listen(port, '0.0.0.0');
  const logger = new Logger('Bootstrap');
  logger.log(`This application is runnning on: ${await app.getUrl()}`);
}

bootstrap();
