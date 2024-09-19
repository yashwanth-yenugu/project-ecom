import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import metadata from './metadata';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Project Play')
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
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  await app.listen(port);
  console.log(`App running on ${await app.getUrl()}`);
}
bootstrap();
