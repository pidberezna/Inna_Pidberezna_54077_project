import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Rently API')
    .setDescription(
      'API documentation for Rently accommodation booking platform',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('token')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('accommodations', 'Accommodation management')
    .addTag('bookings', 'Booking management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(process.env.API_PORT || 3000);
}
bootstrap();
