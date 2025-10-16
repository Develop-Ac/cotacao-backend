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
exports.UsuarioController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const usuario_service_1 = require("./usuario.service");
class CreateUsuarioDto {
    nome;
    email;
    senha;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Giovana Custodio', maxLength: 255 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateUsuarioDto.prototype, "nome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'giovana.custodio@empresa.com', maxLength: 255 }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateUsuarioDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SenhaF0rte!', minLength: 6, description: 'Mínimo 6 caracteres' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], CreateUsuarioDto.prototype, "senha", void 0);
class UsuarioView {
    usuario_id;
    nome;
    email;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 123 }),
    __metadata("design:type", Number)
], UsuarioView.prototype, "usuario_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Giovana Custodio' }),
    __metadata("design:type", String)
], UsuarioView.prototype, "nome", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'giovana.custodio@empresa.com' }),
    __metadata("design:type", String)
], UsuarioView.prototype, "email", void 0);
let UsuarioController = class UsuarioController {
    usuarioService;
    constructor(usuarioService) {
        this.usuarioService = usuarioService;
    }
    async index() {
        return this.usuarioService.findAll();
    }
    async store(dto) {
        const payload = { nome: dto.nome, email: dto.email, senha: dto.senha };
        return this.usuarioService.create(payload);
    }
    async destroy(id) {
        await this.usuarioService.remove(Number(id));
    }
};
exports.UsuarioController = UsuarioController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lista usuários' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Lista de usuários',
        schema: {
            type: 'array',
            items: { $ref: (0, swagger_1.getSchemaPath)(UsuarioView) },
            example: [
                { usuario_id: 1, nome: 'Giovana Custodio', email: 'giovana.custodio@empresa.com' },
                { usuario_id: 2, nome: 'Carlos Siqueira', email: 'carlos.siqueira@empresa.com' },
            ],
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "index", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cria usuário' }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })),
    (0, swagger_1.ApiBody)({
        description: 'Payload para criação de usuário',
        schema: {
            allOf: [{ $ref: (0, swagger_1.getSchemaPath)(CreateUsuarioDto) }],
            examples: {
                Minimal: {
                    summary: 'Exemplo mínimo',
                    value: {
                        nome: 'Giovana Custodio',
                        email: 'giovana.custodio@empresa.com',
                        senha: 'SenhaF0rte!',
                    },
                },
                Completo: {
                    summary: 'Outro exemplo válido',
                    value: {
                        nome: 'Carlos Siqueira',
                        email: 'carlos.siqueira@empresa.com',
                        senha: 'S3nh@Segura',
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Usuário criado com sucesso',
        schema: {
            $ref: (0, swagger_1.getSchemaPath)(UsuarioView),
            example: {
                usuario_id: 123,
                nome: 'Giovana Custodio',
                email: 'giovana.custodio@empresa.com',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Payload inválido',
        schema: {
            example: {
                statusCode: 400,
                message: ['email must be an email', 'senha must be longer than or equal to 6 characters'],
                error: 'Bad Request',
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateUsuarioDto]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "store", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove usuário por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: '123', description: 'PK usuario_id' }),
    (0, common_1.HttpCode)(204),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Removido com sucesso (no content)' }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Usuário não encontrado',
        schema: { example: { statusCode: 404, message: 'Usuário não encontrado' } },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsuarioController.prototype, "destroy", null);
exports.UsuarioController = UsuarioController = __decorate([
    (0, swagger_1.ApiTags)('Usuários'),
    (0, swagger_1.ApiExtraModels)(CreateUsuarioDto, UsuarioView),
    (0, common_1.Controller)('usuarios'),
    __metadata("design:paramtypes", [usuario_service_1.UsuarioService])
], UsuarioController);
//# sourceMappingURL=usuario.controller.js.map