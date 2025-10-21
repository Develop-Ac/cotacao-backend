import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class CreateChecklistPdfDto {
  @ApiPropertyOptional({ description: 'ID do checklist ao qual o PDF pertence' })
  @IsOptional()
  @IsInt()
  checklistId?: number;
}