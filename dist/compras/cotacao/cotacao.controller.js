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
exports.CotacaoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const cotacao_service_1 = require("./cotacao.service");
class ItemDto {
    cod;
    descricao;
    marca;
    refFornecedor;
    unidade;
    quantidade;
    valor_unitario;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'HLX-2016-BP' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ItemDto.prototype, "cod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Grade frontal Hilux Black Piano 2016/2020' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ItemDto.prototype, "descricao", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ACRART', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ItemDto.prototype, "marca", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AR-7789', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ItemDto.prototype, "refFornecedor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PC', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ItemDto.prototype, "unidade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2, minimum: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ItemDto.prototype, "quantidade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 499.9, required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ItemDto.prototype, "valor_unitario", void 0);
class CreateCotacaoDto {
    key;
    dados;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ORC-2025-001234' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCotacaoDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ItemDto] }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateCotacaoDto.prototype, "dados", void 0);
class UpdateCotacaoDto extends CreateCotacaoDto {
}
class CotacaoItemView {
    cod;
    descricao;
    marca;
    refFornecedor;
    unidade;
    quantidade;
    valor_unitario;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'HLX-2016-BP' }),
    __metadata("design:type", String)
], CotacaoItemView.prototype, "cod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Grade frontal Hilux Black Piano 2016/2020' }),
    __metadata("design:type", String)
], CotacaoItemView.prototype, "descricao", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ACRART', required: false }),
    __metadata("design:type", String)
], CotacaoItemView.prototype, "marca", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'AR-7789', required: false }),
    __metadata("design:type", String)
], CotacaoItemView.prototype, "refFornecedor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'PC', required: false }),
    __metadata("design:type", String)
], CotacaoItemView.prototype, "unidade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2 }),
    __metadata("design:type", Number)
], CotacaoItemView.prototype, "quantidade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 499.9, required: false }),
    __metadata("design:type", Number)
], CotacaoItemView.prototype, "valor_unitario", void 0);
class CotacaoView {
    id;
    key;
    dados;
    criadoEm;
    atualizadoEm;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 101 }),
    __metadata("design:type", Number)
], CotacaoView.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ORC-2025-001234' }),
    __metadata("design:type", String)
], CotacaoView.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [CotacaoItemView] }),
    __metadata("design:type", Array)
], CotacaoView.prototype, "dados", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-10-15T12:00:00.000Z' }),
    __metadata("design:type", String)
], CotacaoView.prototype, "criadoEm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-10-15T12:00:00.000Z' }),
    __metadata("design:type", String)
], CotacaoView.prototype, "atualizadoEm", void 0);
let CotacaoController = class CotacaoController {
    service;
    constructor(service) {
        this.service = service;
    }
    async index() {
        return this.service.list();
    }
    async store(dto) {
        return this.service.create(dto);
    }
    async show(id) {
        return this.service.get(id);
    }
    async update(id, dto) {
        return this.service.update(id, dto);
    }
    async destroy(id) {
        return this.service.remove(id);
    }
};
exports.CotacaoController = CotacaoController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lista cotações' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Lista de cotações',
        schema: {
            type: 'array',
            items: { $ref: (0, swagger_1.getSchemaPath)(CotacaoView) },
            example: [
                {
                    id: 101,
                    key: 'ORC-2025-001234',
                    dados: [
                        {
                            cod: 'HLX-2016-BP',
                            descricao: 'Grade frontal Hilux Black Piano 2016/2020',
                            marca: 'ACRART',
                            refFornecedor: 'AR-7789',
                            unidade: 'PC',
                            quantidade: 2,
                            valor_unitario: 499.9
                        }
                    ],
                    criadoEm: '2025-10-15T12:00:00.000Z',
                    atualizadoEm: '2025-10-15T12:00:00.000Z'
                },
                {
                    id: 102,
                    key: 'ORC-2025-001235',
                    dados: [],
                    criadoEm: '2025-10-15T12:30:00.000Z',
                    atualizadoEm: '2025-10-15T12:30:00.000Z'
                }
            ],
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CotacaoController.prototype, "index", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cria cotação' }),
    (0, swagger_1.ApiBody)({
        description: 'Payload para criação de cotação',
        schema: { allOf: [{ $ref: (0, swagger_1.getSchemaPath)(CreateCotacaoDto) }] },
        examples: {
            Minimal: {
                summary: 'Exemplo mínimo',
                value: {
                    key: 'ORC-2025-001234',
                    dados: [
                        {
                            cod: 'HLX-2016-BP',
                            descricao: 'Grade frontal Hilux Black Piano 2016/2020',
                            quantidade: 2
                        }
                    ]
                },
            },
            Completo: {
                summary: 'Exemplo completo',
                value: {
                    key: 'ORC-2025-001234',
                    dados: [
                        {
                            cod: 'HLX-2016-BP',
                            descricao: 'Grade frontal Hilux Black Piano 2016/2020',
                            marca: 'ACRART',
                            refFornecedor: 'AR-7789',
                            unidade: 'PC',
                            quantidade: 2,
                            valor_unitario: 499.9
                        },
                        {
                            cod: 'LED-H7-U',
                            descricao: 'Lâmpada LED H7 Ultra',
                            marca: 'OSRAM',
                            unidade: 'PC',
                            quantidade: 4,
                            valor_unitario: 129.9
                        }
                    ]
                },
            },
        },
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Cotação criada',
        schema: {
            $ref: (0, swagger_1.getSchemaPath)(CotacaoView),
            example: {
                id: 101,
                key: 'ORC-2025-001234',
                dados: [
                    {
                        cod: 'HLX-2016-BP',
                        descricao: 'Grade frontal Hilux Black Piano 2016/2020',
                        marca: 'ACRART',
                        refFornecedor: 'AR-7789',
                        unidade: 'PC',
                        quantidade: 2,
                        valor_unitario: 499.9
                    }
                ],
                criadoEm: '2025-10-15T12:00:00.000Z',
                atualizadoEm: '2025-10-15T12:00:00.000Z'
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Payload inválido',
        schema: {
            example: {
                statusCode: 400,
                message: ['dados must be an array', 'key should not be empty'],
                error: 'Bad Request',
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateCotacaoDto]),
    __metadata("design:returntype", Promise)
], CotacaoController.prototype, "store", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtém cotação por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 101 }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Cotação encontrada',
        schema: {
            $ref: (0, swagger_1.getSchemaPath)(CotacaoView),
            example: {
                id: 101,
                key: 'ORC-2025-001234',
                dados: [
                    {
                        cod: 'HLX-2016-BP',
                        descricao: 'Grade frontal Hilux Black Piano 2016/2020',
                        marca: 'ACRART',
                        refFornecedor: 'AR-7789',
                        unidade: 'PC',
                        quantidade: 2,
                        valor_unitario: 499.9
                    }
                ],
                criadoEm: '2025-10-15T12:00:00.000Z',
                atualizadoEm: '2025-10-15T12:00:00.000Z'
            },
        },
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CotacaoController.prototype, "show", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualiza cotação' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 101 }),
    (0, swagger_1.ApiBody)({
        description: 'Payload para atualização (mesma estrutura do create)',
        schema: { allOf: [{ $ref: (0, swagger_1.getSchemaPath)(UpdateCotacaoDto) }] },
        examples: {
            AjusteQuantidade: {
                value: {
                    key: 'ORC-2025-001234',
                    dados: [
                        { cod: 'HLX-2016-BP', descricao: 'Grade frontal Hilux Black Piano 2016/2020', quantidade: 3 }
                    ]
                }
            },
            AtualizacaoCompleta: {
                value: {
                    key: 'ORC-2025-001234',
                    dados: [
                        {
                            cod: 'LED-H7-U',
                            descricao: 'Lâmpada LED H7 Ultra',
                            marca: 'OSRAM',
                            unidade: 'PC',
                            quantidade: 6,
                            valor_unitario: 129.9
                        }
                    ]
                }
            }
        },
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Cotação atualizada',
        schema: {
            $ref: (0, swagger_1.getSchemaPath)(CotacaoView),
            example: {
                id: 101,
                key: 'ORC-2025-001234',
                dados: [
                    {
                        cod: 'HLX-2016-BP',
                        descricao: 'Grade frontal Hilux Black Piano 2016/2020',
                        marca: 'ACRART',
                        refFornecedor: 'AR-7789',
                        unidade: 'PC',
                        quantidade: 3,
                        valor_unitario: 499.9
                    }
                ],
                criadoEm: '2025-10-15T12:00:00.000Z',
                atualizadoEm: '2025-10-15T12:45:00.000Z'
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Cotação não encontrada',
        schema: { example: { statusCode: 404, message: 'Cotação não encontrada' } },
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, UpdateCotacaoDto]),
    __metadata("design:returntype", Promise)
], CotacaoController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove cotação por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 101 }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Removida com sucesso (No Content)' }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Cotação não encontrada',
        schema: { example: { statusCode: 404, message: 'Cotação não encontrada' } },
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CotacaoController.prototype, "destroy", null);
exports.CotacaoController = CotacaoController = __decorate([
    (0, swagger_1.ApiTags)('Cotações'),
    (0, swagger_1.ApiExtraModels)(ItemDto, CreateCotacaoDto, UpdateCotacaoDto, CotacaoItemView, CotacaoView),
    (0, common_1.Controller)('cotacoes'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })),
    __metadata("design:paramtypes", [cotacao_service_1.CotacaoService])
], CotacaoController);
//# sourceMappingURL=cotacao.controller.js.map