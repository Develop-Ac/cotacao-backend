import { OrcamentoCotacaoService } from './orcamentoCotacao.service';
declare class StoreItemDto {
    descricao: string;
    quantidade: number;
    valor_unitario: any;
}
declare class StoreOrcamentoCotacaoDto {
    id: number;
    fornecedor: string;
    observacao?: string;
    dados: StoreItemDto[];
}
declare class UpdateSelecionadoDto {
    selecionado: boolean;
}
export declare class OrcamentoCotacaoController {
    private readonly service;
    constructor(service: OrcamentoCotacaoService);
    store(dto: StoreOrcamentoCotacaoDto): Promise<{
        message: string;
    }>;
    show(id: number): Promise<{
        orcamentos: {
            id: number;
            cotacao_id: number;
            orcamento_id: number | null;
            descricao: string | null;
            quantidade: number | null;
            valor_unitario: number | null;
            fornecedor: string | null;
            observacao: string | null;
            selecionado: boolean;
        }[];
    } & {
        id: number;
        cotacao_id: number | null;
        orcamento_compra: string | null;
    }>;
    update(id: number, dto: UpdateSelecionadoDto): Promise<{
        message: string;
        orcamento: {
            id: number;
            cotacao_id: number;
            orcamento_id: number | null;
            descricao: string | null;
            quantidade: number | null;
            valor_unitario: number | null;
            fornecedor: string | null;
            observacao: string | null;
            selecionado: boolean;
        };
    }>;
}
export {};
