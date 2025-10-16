// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.use(helmet({
    contentSecurityPolicy: false,       // necessário para swagger-ui
    crossOriginEmbedderPolicy: false,   // evita bloqueio de assets
  }));
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) ?? true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // (opcional) prefixo global
  // app.setGlobalPrefix('api');

  // === Swagger only if enabled ===
  if (process.env.SWAGGER_ENABLED === 'true') {
    const config = new DocumentBuilder()
      .setTitle('AC Entregas API')
      .setDescription('Documentação da API de Entregas / Serviços Externos / Admin')
      .setVersion('1.0.0')
      // se usar auth por Bearer em algum endpoint:
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'jwt', // nome do esquema
      )
      // como você usa APP_TOKEN por query/body, exponha um apiKey por query
      .addApiKey(
        { type: 'apiKey', name: 'token', in: 'query', description: 'APP_TOKEN' },
        'appToken', // nome do esquema
      )
      // (opcional) mostre servidores
      .addServer(process.env.PUBLIC_URL ?? 'http://localhost:8000')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'AC Entregas — Swagger',
    });
    // Agora a UI fica em /docs e o JSON em /docs-json
  }

  const port = parseInt(process.env.PORT || '8000', 10);
  await app.listen(port, '0.0.0.0');
  console.log(`API listening on http://localhost:${port}`);
  if (process.env.SWAGGER_ENABLED === 'true') {
    console.log(`Swagger em http://localhost:${port}/docs`);
  }
}
bootstrap();
