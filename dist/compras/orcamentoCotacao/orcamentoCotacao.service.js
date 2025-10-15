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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrcamentoCotacaoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let OrcamentoCotacaoService = class OrcamentoCotacaoService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    parseValor(v) {
        if (typeof v === 'number')
            return v;
        const num = Number((v ?? '').toString().replace(/\./g, '').replace(',', '.'));
        return Number.isFinite(num) ? num : 0;
    }
    async store(payload) {
        return this.prisma.$transaction(async (tx) => {
            const cotacao = await tx.cotacao.findUnique({ where: { id: payload.id } });
            if (!cotacao)
                throw new common_1.NotFoundException('Cotação não encontrada.');
            const orcamentoId = Math.floor(100000 + Math.random() * 900000);
            const data = payload.dados.map((i) => ({
                cotacao_id: payload.id,
                orcamento_id: orcamentoId,
                fornecedor: payload.fornecedor,
                observacao: payload.observacao ?? null,
                descricao: i.descricao,
                quantidade: i.quantidade,
                valor_unitario: this.parseValor(i.valor_unitario),
                selecionado: false,
            }));
            if (data.length) {
                await tx.orcamentoCotacao.createMany({ data });
            }
            return { message: 'Cotação e itens salvos com sucesso.' };
        });
    }
    async getCotacaoComOrcamentos(cotacaoId) {
        const cotacao = await this.prisma.cotacao.findUnique({
            where: { id: cotacaoId },
            include: { orcamentos: true },
        });
        if (!cotacao)
            throw new common_1.NotFoundException('Cotação não encontrada.');
        return cotacao;
    }
    async updateSelecionado(orcamentoCotacaoId, selecionado) {
        const found = await this.prisma.orcamentoCotacao.findUnique({
            where: { id: orcamentoCotacaoId },
        });
        if (!found)
            throw new common_1.NotFoundException('Orçamento de cotação não encontrado.');
        const updated = await this.prisma.orcamentoCotacao.update({
            where: { id: orcamentoCotacaoId },
            data: { selecionado },
        });
        return {
            message: 'Status atualizado com sucesso.',
            orcamento: updated,
        };
    }
};
exports.OrcamentoCotacaoService = OrcamentoCotacaoService;
exports.OrcamentoCotacaoService = OrcamentoCotacaoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrcamentoCotacaoService);
//# sourceMappingURL=orcamentoCotacao.service.js.map