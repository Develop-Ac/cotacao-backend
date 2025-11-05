import { ApiProperty } from '@nestjs/swagger';

export class UpdateLiberadoContagemDto {
  @ApiProperty({
    description: 'Define se a contagem está liberada',
    example: true,
    type: 'boolean'
  })
  liberado_contagem!: boolean;
}