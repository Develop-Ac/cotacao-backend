import { PrismaService } from '../../prisma/prisma.service';
type StoreItemInput = {
    descricao: string;
    quantidade: number;
    valor_unitario: string | number;
};
export type StoreOrcamentoCotacaoInput = {
    id: number;
    fornecedor: string;
    observacao?: string | null;
    dados: StoreItemInput[];
};
export declare class OrcamentoCotacaoService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private parseValor;
    store(payload: StoreOrcamentoCotacaoInput): Promise<{
        message: string;
    }>;
    getCotacaoComOrcamentos(cotacaoId: number): Promise<{
        orcamentos: {
            id: number;
            cotacao_id: number;
            descricao: string | null;
            quantidade: number | null;
            valor_unitario: number | null;
            selecionado: boolean;
            orcamento_id: number | null;
            fornecedor: string | null;
            observacao: string | null;
        }[];
    } & {
        id: number;
        cotacao_id: number | null;
        orcamento_compra: string | null;
    }>;
    updateSelecionado(orcamentoCotacaoId: number, selecionado: boolean): Promise<{
        message: string;
        orcamento: {
            id: number;
            cotacao_id: number;
            descricao: string | null;
            quantidade: number | null;
            valor_unitario: number | null;
            selecionado: boolean;
            orcamento_id: number | null;
            fornecedor: string | null;
            observacao: string | null;
        };
    }>;
}
export {};
