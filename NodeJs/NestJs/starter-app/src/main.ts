import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const port  = process.env.PORT || 8900;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const options = new DocumentBuilder()
    .setTitle('Starter App')
    .setDescription('The Starter App API description')
    .setVersion('1.0')
    .addTag('starter')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('apidocs', app, document);

  await app.listen(port);

  Logger.log(`Server started on port ${port}`,'BOOTSTRAP');
}
bootstrap();
