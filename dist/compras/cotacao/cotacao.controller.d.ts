import { CotacaoService } from './cotacao.service';
declare class ItemDto {
    cod: string;
    descricao: string;
    marca?: string;
    refFornecedor?: string;
    unidade?: string;
    quantidade: number;
    valor_unitario?: number;
}
declare class CreateCotacaoDto {
    key: string;
    dados: ItemDto[];
}
declare class UpdateCotacaoDto extends CreateCotacaoDto {
}
export declare class CotacaoController {
    private readonly service;
    constructor(service: CotacaoService);
    index(): Promise<{
        id: number;
        orcamento_compra: string | null;
    }[]>;
    store(dto: CreateCotacaoDto): Promise<{
        message: string;
        cotacao_id: number;
    }>;
    show(id: number): Promise<{
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
    update(id: number, dto: UpdateCotacaoDto): Promise<{
        message: string;
        cotacao_id: number;
    }>;
    destroy(id: number): Promise<{
        message: string;
    }>;
}
export {};
