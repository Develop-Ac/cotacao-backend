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
exports.CotacaoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CotacaoService = class CotacaoService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        return this.prisma.cotacao.findMany({
            select: { id: true, orcamento_compra: true },
            orderBy: { id: 'desc' },
        });
    }
    async create(payload) {
        return this.prisma.$transaction(async (tx) => {
            const cotacao = await tx.cotacao.create({
                data: { orcamento_compra: payload.key },
            });
            if (payload.dados?.length) {
                const itemsData = payload.dados.map((i) => ({
                    cotacao_id: cotacao.id,
                    cod: i.cod,
                    descricao: i.descricao,
                    marca: i.marca ?? null,
                    ref_fornecedor: i.refFornecedor ?? null,
                    unidade: i.unidade ?? null,
                    quantidade: i.quantidade,
                    valor_unitario: i.valor_unitario ?? 0,
                    selecionado: false,
                    item_id: null,
                }));
                await tx.itemCotacao.createMany({ data: itemsData });
            }
            return { message: 'Cotação e itens salvos com sucesso.', cotacao_id: cotacao.id };
        });
    }
    async get(id) {
        const cotacao = await this.prisma.cotacao.findUnique({
            where: { id },
            include: { itens: true },
        });
        if (!cotacao)
            throw new common_1.NotFoundException('Cotação não encontrada.');
        return cotacao;
    }
    async update(id, payload) {
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.cotacao.findUnique({ where: { id } });
            if (!existing)
                throw new common_1.NotFoundException('Cotação não encontrada.');
            await tx.cotacao.update({
                where: { id },
                data: { orcamento_compra: payload.key },
            });
            await tx.itemCotacao.deleteMany({ where: { cotacao_id: id } });
            if (payload.dados?.length) {
                const itemsData = payload.dados.map((i) => ({
                    cotacao_id: id,
                    cod: i.cod,
                    descricao: i.descricao,
                    marca: i.marca ?? null,
                    ref_fornecedor: i.refFornecedor ?? null,
                    unidade: i.unidade ?? null,
                    quantidade: i.quantidade,
                    valor_unitario: i.valor_unitario ?? 0,
                    selecionado: false,
                    item_id: null,
                }));
                await tx.itemCotacao.createMany({ data: itemsData });
            }
            return { message: 'Cotação atualizada com sucesso.', cotacao_id: id };
        });
    }
    async remove(id) {
        return this.prisma.$transaction(async (tx) => {
            const found = await tx.cotacao.findUnique({ where: { id } });
            if (!found)
                throw new common_1.NotFoundException('Cotação não encontrada.');
            await tx.itemCotacao.deleteMany({ where: { cotacao_id: id } });
            await tx.cotacao.delete({ where: { id } });
            return { message: 'Cotação e itens associados removidos com sucesso.' };
        });
    }
};
exports.CotacaoService = CotacaoService;
exports.CotacaoService = CotacaoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CotacaoService);
//# sourceMappingURL=cotacao.service.js.map