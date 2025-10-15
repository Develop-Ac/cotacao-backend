"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const helmet_1 = __importDefault(require("helmet"));
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.use((0, helmet_1.default)());
    app.enableCors({
        origin: process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) ?? true,
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    });
    if (process.env.SWAGGER_ENABLED === 'true') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('AC Entregas API')
            .setDescription('Documentação da API de Entregas / Serviços Externos / Admin')
            .setVersion('1.0.0')
            .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'jwt')
            .addApiKey({ type: 'apiKey', name: 'token', in: 'query', description: 'APP_TOKEN' }, 'appToken')
            .addServer(process.env.PUBLIC_URL ?? 'http://localhost:3000')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
            customSiteTitle: 'AC Entregas — Swagger',
        });
    }
    const port = parseInt(process.env.PORT || '3000', 10);
    await app.listen(port, '0.0.0.0');
    console.log(`API listening on http://localhost:${port}`);
    if (process.env.SWAGGER_ENABLED === 'true') {
        console.log(`Swagger em http://localhost:${port}/docs`);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map