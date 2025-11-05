import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateLiberadoContagemDto {
  @ApiProperty({
    description: 'Identificador comum do grupo de contagens',
    example: 'clx1234567890group'
  })
  @IsString()
  @IsNotEmpty()
  contagem_cuid!: string;

  @ApiProperty({
    description: 'Tipo da contagem que está sendo liberada (1 ou 2)',
    example: 1,
    enum: [1, 2]
  })
  @IsIn([1, 2])
  contagem!: number;
}