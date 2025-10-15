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
const class_validator_1 = require("class-validator");
const orcamentoCotacao_service_1 = require("./orcamentoCotacao.service");
class StoreItemDto {
    descricao;
    quantidade;
    valor_unitario;
}
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StoreItemDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], StoreItemDto.prototype, "quantidade", void 0);
__decorate([
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
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], StoreOrcamentoCotacaoDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StoreOrcamentoCotacaoDto.prototype, "fornecedor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StoreOrcamentoCotacaoDto.prototype, "observacao", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], StoreOrcamentoCotacaoDto.prototype, "dados", void 0);
class UpdateSelecionadoDto {
    selecionado;
}
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSelecionadoDto.prototype, "selecionado", void 0);
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
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [StoreOrcamentoCotacaoDto]),
    __metadata("design:returntype", Promise)
], OrcamentoCotacaoController.prototype, "store", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OrcamentoCotacaoController.prototype, "show", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, UpdateSelecionadoDto]),
    __metadata("design:returntype", Promise)
], OrcamentoCotacaoController.prototype, "update", null);
exports.OrcamentoCotacaoController = OrcamentoCotacaoController = __decorate([
    (0, common_1.Controller)('orcamentos-cotacao'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })),
    __metadata("design:paramtypes", [orcamentoCotacao_service_1.OrcamentoCotacaoService])
], OrcamentoCotacaoController);
//# sourceMappingURL=orcamentoCotacao.controller.js.map