"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const login_service_1 = require("./login.service");
class LoginDto {
    email;
    senha;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'usuario@empresa.com' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SenhaF0rte!' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "senha", void 0);
class LoginResponseView {
    access_token;
    expires_in;
    user;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }),
    __metadata("design:type", String)
], LoginResponseView.prototype, "access_token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3600, description: 'Validade do token em segundos' }),
    __metadata("design:type", Number)
], LoginResponseView.prototype, "expires_in", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: { usuario_id: 123, nome: 'Giovana Custodio', email: 'usuario@empresa.com' },
    }),
    __metadata("design:type", Object)
], LoginResponseView.prototype, "user", void 0);
let LoginController = class LoginController {
    loginService;
    constructor(loginService) {
        this.loginService = loginService;
    }
    async login(dto) {
        return this.loginService.login(dto.email, dto.senha);
    }
};
exports.LoginController = LoginController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Autentica o usuário e retorna o token' }),
    (0, swagger_1.ApiConsumes)('application/json'),
    (0, swagger_1.ApiBody)({
        description: 'Credenciais de acesso',
        schema: { allOf: [{ $ref: (0, swagger_1.getSchemaPath)(LoginDto) }] },
        examples: {
            Valido: {
                summary: 'Exemplo válido',
                value: { email: 'usuario@empresa.com', senha: 'SenhaF0rte!' },
            },
            EmailInvalido: {
                summary: 'Email inválido',
                value: { email: 'usuario@empresa', senha: 'qualquer' },
            },
            CamposVazios: {
                summary: 'Campos vazios',
                value: { email: '', senha: '' },
            },
        },
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Login bem-sucedido',
        schema: {
            $ref: (0, swagger_1.getSchemaPath)(LoginResponseView),
            example: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                expires_in: 3600,
                user: {
                    usuario_id: 123,
                    nome: 'Giovana Custodio',
                    email: 'usuario@empresa.com',
                },
            },
        },
    }),
    (0, swagger_1.ApiBadRequestResponse)({
        description: 'Payload inválido (validação)',
        schema: {
            example: {
                statusCode: 400,
                message: [
                    'email must be an email',
                    'email should not be empty',
                    'senha should not be empty',
                ],
                error: 'Bad Request',
            },
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({
        description: 'Credenciais incorretas',
        schema: {
            example: {
                statusCode: 401,
                message: 'Email ou senha inválidos',
                error: 'Unauthorized',
            },
        },
    }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", Promise)
], LoginController.prototype, "login", null);
exports.LoginController = LoginController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, swagger_1.ApiExtraModels)(LoginDto, LoginResponseView),
    (0, common_1.Controller)('login'),
    __metadata("design:paramtypes", [login_service_1.LoginService])
], LoginController);
//# sourceMappingURL=login.controller.js.map