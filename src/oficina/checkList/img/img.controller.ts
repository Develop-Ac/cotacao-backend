import { Controller, Get, Param } from '@nestjs/common';
import { ImagesService } from './img.service';
import { GetImagesParamDto } from './img.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Controller('img')
export class ImagesController {
  constructor(private readonly service: ImagesService) {}

  @Get(':id')
  async list(@Param('id') idParam: string) {
    // validação leve via class-validator (sem pipes globais)
    const dto = plainToInstance(GetImagesParamDto, { id: idParam });
    const errors = await validate(dto);
    if (errors.length) {
      // formato simples de erro 400
      return {
        statusCode: 400,
        error: 'Bad Request',
        message: 'Parâmetro id é obrigatório.',
        details: errors.map((e) => e.property),
      };
    }

    // consulta serviço
    return this.service.listByChecklistId(dto.id);
  }
}
