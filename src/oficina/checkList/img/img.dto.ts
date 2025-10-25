import { IsNotEmpty, IsString } from 'class-validator';

export class GetImagesParamDto {
  @IsString()
  @IsNotEmpty()
  id!: string; // ID do checklist (cuid)
}