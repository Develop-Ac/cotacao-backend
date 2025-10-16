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
exports.OrcamentoCotacaoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const orcamentoCotacao_service_1 = require("./orcamentoCotacao.service");
class StoreItemDto {
    descricao;
    quantidade;
    valor_unitario;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Lâmpada LED H7 Ultra' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StoreItemDto.prototype, "descricao", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4, minimum: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], StoreItemDto.prototype, "quantidade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ examples: ['129,90', 129.9], description: 'Pode ser string com vírgula ou número' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], StoreItemDto.prototype, "valor_unitario", void 0);
class StoreOrcamentoCotacaoDto {
    id;
    fornecedor;
    observacao;
    dados;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 101, description: 'cotacao_id' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], StoreOrcamentoCotacaoDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Fornecedor X' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StoreOrcamentoCotacaoDto.prototype, "fornecedor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Prazo de entrega 7 dias', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StoreOrcamentoCotacaoDto.prototype, "observacao", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [StoreItemDto] }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], StoreOrcamentoCotacaoDto.prototype, "dados", void 0);
class UpdateSelecionadoDto {
    selecionado;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: true }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSelecionadoDto.prototype, "selecionado", void 0);
class OrcamentoItemView {
    descricao;
    quantidade;
    valor_unitario;
    total_item;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Lâmpada LED H7 Ultra' }),
    __metadata("design:type", String)
], OrcamentoItemView.prototype, "descricao", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 4 }),
    __metadata("design:type", Number)
], OrcamentoItemView.prototype, "quantidade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 129.9 }),
    __metadata("design:type", Number)
], OrcamentoItemView.prototype, "valor_unitario", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 519.6 }),
    __metadata("design:type", Number)
], OrcamentoItemView.prototype, "total_item", void 0);
class OrcamentoView {
    id;
    fornecedor;
    observacao;
    selecionado;
    dados;
    total;
    criadoEm;
    atualizadoEm;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 555 }),
    __metadata("design:type", Number)
], OrcamentoView.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Fornecedor X' }),
    __metadata("design:type", String)
], OrcamentoView.prototype, "fornecedor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Prazo de entrega 7 dias', required: false }),
    __metadata("design:type", String)
], OrcamentoView.prototype, "observacao", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: false }),
    __metadata("design:type", Boolean)
], OrcamentoView.prototype, "selecionado", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [OrcamentoItemView] }),
    __metadata("design:type", Array)
], OrcamentoView.prototype, "dados", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 519.6 }),
    __metadata("design:type", Number)
], OrcamentoView.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-10-15T12:10:00.000Z' }),
    __metadata("design:type", String)
], OrcamentoView.prototype, "criadoEm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-10-15T12:10:00.000Z' }),
    __metadata("design:type", String)
], OrcamentoView.prototype, "atualizadoEm", void 0);
class CotacaoComOrcamentosView {
    id;
    key;
    orcamentos;
    criadoEm;
    atualizadoEm;
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 101 }),
    __metadata("design:type", Number)
], CotacaoComOrcamentosView.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'ORC-2025-001234' }),
    __metadata("design:type", String)
], CotacaoComOrcamentosView.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [OrcamentoView] }),
    __metadata("design:type", Array)
], CotacaoComOrcamentosView.prototype, "orcamentos", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-10-15T12:00:00.000Z' }),
    __metadata("design:type", String)
], CotacaoComOrcamentosView.prototype, "criadoEm", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2025-10-15T12:45:00.000Z' }),
    __metadata("design:type", String)
], CotacaoComOrcamentosView.prototype, "atualizadoEm", void 0);
let OrcamentoCotacaoController = class OrcamentoCotacaoController {
    service;
    constructor(service) {
        this.service = service;
    }
    async store(dto) {
        return this.service.store(dto);
    }
    async show(id) {
        return this.service.getCotacaoComOrcamentos(id);
    }
    async update(id, dto) {
        return this.service.updateSelecionado(id, dto.selecionado);
    }
};
exports.OrcamentoCotacaoController = OrcamentoCotacaoController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Cria um orçamento para uma cotação existente' }),
    (0, swagger_1.ApiBody)({
        description: 'Dados do orçamento',
        schema: { allOf: [{ $ref: (0, swagger_1.getSchemaPath)(StoreOrcamentoCotacaoDto) }] },
        examples: {
            Minimo: {
                summary: 'Exemplo mínimo',
                value: {
                    id: 101,
                    fornecedor: 'Fornecedor X',
                    dados: [
                        { descricao: 'Lâmpada LED H7 Ultra', quantidade: 4, valor_unitario: '129,90' }
                    ]
                },
            },
            Completo: {
                summary: 'Exemplo completo',
                value: {
                    id: 101,
                    fornecedor: 'Fornecedor Y',
                    observacao: 'Entrega em 7 dias • Garantia 6 meses',
                    dados: [
                        { descricao: 'Lâmpada LED H7 Ultra', quantidade: 4, valor_unitario: 129.9 },
                        { descricao: 'Kit Palheta Silicone 26"', quantidade: 2, valor_unitario: 89.9 }
                    ]
                },
            },
        },
    }),
    (0, swagger_1.ApiCreatedResponse)({
        description: 'Orçamento criado',
        schema: {
            $ref: (0, swagger_1.getSchemaPath)(OrcamentoView),
            example: {
                id: 555,
                fornecedor: 'Fornecedor X',
                observacao: 'Entrega em 7 dias',
                selecionado: false,
                dados: [
                    { descricao: 'Lâmpada LED H7 Ultra', quantidade: 4, valor_unitario: 129.9, total_item: 519.6 }
                ],
                total: 519.6,
                criadoEm: '2025-10-15T12:10:00.000Z',
                atualizadoEm: '2025-10-15T12:10:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Payload inválido',
        schema: {
            example: {
                statusCode: 400,
                message: ['id must be an integer number', 'dados must be an array'],
                error: 'Bad Request',
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [StoreOrcamentoCotacaoDto]),
    __metadata("design:returntype", Promise)
], OrcamentoCotacaoController.prototype, "store", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtém a cotação com seus orçamentos' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 101, description: 'cotacao_id' }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Cotação encontrada',
        schema: {
            $ref: (0, swagger_1.getSchemaPath)(CotacaoComOrcamentosView),
            example: {
                id: 101,
                key: 'ORC-2025-001234',
                orcamentos: [
                    {
                        id: 555,
                        fornecedor: 'Fornecedor X',
                        observacao: 'Entrega em 7 dias',
                        selecionado: false,
                        dados: [
                            { descricao: 'Lâmpada LED H7 Ultra', quantidade: 4, valor_unitario: 129.9, total_item: 519.6 },
                            { descricao: 'Kit Palheta Silicone 26"', quantidade: 2, valor_unitario: 89.9, total_item: 179.8 }
                        ],
                        total: 699.4,
                        criadoEm: '2025-10-15T12:10:00.000Z',
                        atualizadoEm: '2025-10-15T12:10:00.000Z',
                    }
                ],
                criadoEm: '2025-10-15T12:00:00.000Z',
                atualizadoEm: '2025-10-15T12:45:00.000Z'
            },
        },
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrcamentoCotacaoController.prototype, "show", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualiza flag "selecionado" de um orçamento' }),
    (0, swagger_1.ApiParam)({ name: 'id', example: 555, description: 'orçamento_id' }),
    (0, swagger_1.ApiBody)({
        description: 'Definição da flag selecionado',
        schema: { allOf: [{ $ref: (0, swagger_1.getSchemaPath)(UpdateSelecionadoDto) }] },
        examples: {
            Selecionar: { value: { selecionado: true } },
            Desmarcar: { value: { selecionado: false } },
        },
    }),
    (0, swagger_1.ApiOkResponse)({
        description: 'Orçamento atualizado',
        schema: {
            $ref: (0, swagger_1.getSchemaPath)(OrcamentoView),
            example: {
                id: 555,
                fornecedor: 'Fornecedor X',
                observacao: 'Entrega em 7 dias',
                selecionado: true,
                dados: [
                    { descricao: 'Lâmpada LED H7 Ultra', quantidade: 4, valor_unitario: 129.9, total_item: 519.6 }
                ],
                total: 519.6,
                criadoEm: '2025-10-15T12:10:00.000Z',
                atualizadoEm: '2025-10-15T12:20:00.000Z',
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Orçamento não encontrado',
        schema: { example: { statusCode: 404, message: 'Orçamento não encontrado' } },
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, UpdateSelecionadoDto]),
    __metadata("design:returntype", Promise)
], OrcamentoCotacaoController.prototype, "update", null);
exports.OrcamentoCotacaoController = OrcamentoCotacaoController = __decorate([
    (0, swagger_1.ApiTags)('Orçamentos da Cotação'),
    (0, swagger_1.ApiExtraModels)(StoreItemDto, StoreOrcamentoCotacaoDto, UpdateSelecionadoDto, OrcamentoItemView, OrcamentoView, CotacaoComOrcamentosView),
    (0, common_1.Controller)('orcamentos-cotacao'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })),
    __metadata("design:paramtypes", [orcamentoCotacao_service_1.OrcamentoCotacaoService])
], OrcamentoCotacaoController);
//# sourceMappingURL=orcamentoCotacao.controller.js.map