// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';

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

  app.use(bodyParser.json({ limit: '25mb' }));
  app.use(bodyParser.urlencoded({ limit: '25mb', extended: true }));

  // (opcional) prefixo global
  // app.setGlobalPrefix('api');

  // === Swagger only if enabled ===
  if (process.env.SWAGGER_ENABLED === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Intranet AC Acessórios API')
      .setDescription(`
        API do sistema de intranet da AC Acessórios

        ## Módulos principais:
        - **Sistema**: Health check e informações gerais
        - **Auth**: Autenticação de usuários
        - **Usuários**: Gerenciamento de usuários do sistema
        - **Estoque**: Consulta de movimentações de estoque
        - **Compras**: Cotações, pedidos e fornecedores
        - **Oficina**: Checklists, ordens de serviço e uploads
        - **Upload de Arquivos**: Gerenciamento de imagens no S3/MinIO
        - **Utilitários**: Ferramentas auxiliares e consultas ao banco

        ## Autenticação:
        A API utiliza tokens de acesso que podem ser enviados via query parameter \`token\` ou header \`Authorization: Bearer <token>\`.
      `)
      .setVersion('2.0.0')
      .setContact('AC Acessórios - TI', 'https://acacessorios.com.br', 'ti@acacessorios.com.br')
      .setLicense('Proprietário', '')
      // se usar auth por Bearer em algum endpoint:
      .addBearerAuth(
        { 
          type: 'http', 
          scheme: 'bearer', 
          bearerFormat: 'JWT',
          description: 'Token JWT para autenticação'
        },
        'jwt', // nome do esquema
      )
      // como você usa APP_TOKEN por query/body, exponha um apiKey por query
      .addApiKey(
        { 
          type: 'apiKey', 
          name: 'token', 
          in: 'query', 
          description: 'TOKEN de acesso da aplicação enviado via query parameter'
        },
        'appToken', // nome do esquema
      )
      // (opcional) mostre servidores
      .addServer(process.env.PUBLIC_URL ?? 'http://localhost:8000', 'Servidor de Desenvolvimento')
      .addServer('https://intranetbackend.acacessorios.local', 'Servidor de Produção')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
      deepScanRoutes: true,
    });
    
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true,
      },
      customSiteTitle: 'Intranet AC Acessórios — API Documentation',
      customfavIcon: '/favicon.ico',
      customJs: [
        'https://unpkg.com/swagger-ui-themes@3.0.1/themes/3.x/theme-material.css',
      ],
      customCssUrl: [
        'https://unpkg.com/swagger-ui-themes@3.0.1/themes/3.x/theme-material.css',
      ],
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
