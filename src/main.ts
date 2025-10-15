// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // (opcional) prefixo global
  // app.setGlobalPrefix('api');

  // validação global (bom pro Swagger + DTOs)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  // Config Swagger
  const config = new DocumentBuilder()
    .setTitle('Minha API')
    .setDescription('Documentação da API de Cotações')
    .setVersion('1.0.0')
    .addBearerAuth() // se usar JWT (Authorization: Bearer)
    // .addServer('http://localhost:3000') // opcional
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, doc, {
    jsonDocumentUrl: 'api-docs/json', // GET JSON cru
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Docs: http://localhost:${process.env.PORT ?? 3000}/api-docs`);
}
bootstrap();
