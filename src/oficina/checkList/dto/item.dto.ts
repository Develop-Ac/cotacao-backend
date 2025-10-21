import { IsString } from 'class-validator';

export class ChecklistItemDto {
  @IsString() item!: string;
  @IsString() status!: string;
}
