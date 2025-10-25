// src/ordem-servico/dto/os-response.dto.ts
export class OsResponseDto {
  ordem_servico: number;
  dt_emissao: string | null; // ISO
  cli_codigo: number;
  cli_nome: string;
  cpf_cnpj: string | null;
  fone: string | null;
  endereco_completo: string;
}
