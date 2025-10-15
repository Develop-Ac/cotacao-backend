import { PrismaService } from '../../prisma/prisma.service';
export type CreateItemInput = {
    cod: string;
    descricao: string;
    marca?: string | null;
    refFornecedor?: string | null;
    unidade?: string | null;
    quantidade: number;
    valor_unitario?: number;
};
export type CreateCotacaoInput = {
    key: string;
    dados: CreateItemInput[];
};
export type UpdateCotacaoInput = CreateCotacaoInput & {};
export declare class CotacaoService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(): Promise<{
        id: number;
        orcamento_compra: string | null;
    }[]>;
    create(payload: CreateCotacaoInput): Promise<{
        message: string;
        cotacao_id: number;
    }>;
    get(id: number): Promise<{
        itens: {
            id: number;
            cotacao_id: number;
            item_id: number | null;
            cod: string | null;
            descricao: string | null;
            marca: string | null;
            ref_fornecedor: string | null;
            unidade: string | null;
            quantidade: number | null;
            valor_unitario: number | null;
            selecionado: boolean;
        }[];
    } & {
        id: number;
        cotacao_id: number | null;
        orcamento_compra: string | null;
    }>;
    update(id: number, payload: UpdateCotacaoInput): Promise<{
        message: string;
        cotacao_id: number;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
