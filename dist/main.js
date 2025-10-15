"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Minha API')
        .setDescription('Documentação da API de Cotações')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    const doc = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api-docs', app, doc, {
        jsonDocumentUrl: 'api-docs/json',
        swaggerOptions: { persistAuthorization: true },
    });
    await app.listen(process.env.PORT ?? 3000);
    console.log(`Docs: http://localhost:${process.env.PORT ?? 3000}/api-docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map