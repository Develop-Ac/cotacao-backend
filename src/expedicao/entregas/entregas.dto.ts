import { ApiProperty } from '@nestjs/swagger';

export class EntregaView {
  @ApiProperty({ example: 1, description: 'ID da entrega' })
  id!: number;

  @ApiProperty({ example: 'Cliente Exemplo Ltda', description: 'Nome do cliente' })
  cliente!: string;

  @ApiProperty({ example: 'Em andamento', description: 'Status atual da entrega' })
  status!: string;

  @ApiProperty({ example: 123, description: 'ID do entregador', nullable: true })
  id_entregador!: number | null;

  @ApiProperty({ example: 'VENDA-001', description: 'Código da venda' })
  venda!: string;

  @ApiProperty({ example: '2024-11-07T10:00:00Z', description: 'Data de criação da entrega' })
  criado_em!: Date;

  @ApiProperty({ example: '2024-11-07T10:15:00Z', description: 'Data de aceite da entrega', nullable: true })
  aceito_em!: Date | null;

  @ApiProperty({ example: '2024-11-07T11:00:00Z', description: 'Data que ficou disponível para entrega', nullable: true })
  disponivel_para_entrega_em!: Date | null;

  @ApiProperty({ example: '2024-11-07T12:00:00Z', description: 'Data que saiu para entrega', nullable: true })
  saiu_para_entrega_em!: Date | null;

  @ApiProperty({ example: '2024-11-07T14:00:00Z', description: 'Data de finalização da entrega', nullable: true })
  finalizado_em!: Date | null;

  @ApiProperty({ example: '2024-11-07T15:00:00Z', description: 'Data de retorno do entregador', nullable: true })
  retorno_entregador_em!: Date | null;

  @ApiProperty({ example: '2024-11-07T09:30:00Z', description: 'Data de embalagem', nullable: true })
  embalado_em!: Date | null;
}