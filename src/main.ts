import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ResponseTimeInterceptor } from './interceptors/response-time.interceptor';
import metadata from './metadata';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);

  // Enable compression
  app.use(compression());

  app.enableCors();
  app.use(helmet());

  // Add global response time interceptor
  app.useGlobalInterceptors(new ResponseTimeInterceptor());

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

  // Cleanup on application shutdown
  process.on('SIGINT', async () => {
    await prismaService.cleanUp();
    process.exit(0);
  });

  await app.listen(port, '0.0.0.0');
  const logger = new Logger('Bootstrap');
  logger.log(`This application is runnning on: ${await app.getUrl()}`);
}

bootstrap();
