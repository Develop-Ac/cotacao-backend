import { Module } from '@nestjs/common';
import { EstoqueSaidasController } from './contagem.controller';
import { EstoqueSaidasService } from './contagem.service';
import { EstoqueSaidasRepository } from './contagem.repository';
import { OpenQueryService } from '../../shared/database/openquery/openquery.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [EstoqueSaidasController],
  providers: [
    // Repositório/serviço do feature
    EstoqueSaidasService,
    EstoqueSaidasRepository,

    // Provider do MSSQL (o seu serviço compartilhado)
    OpenQueryService,
  ],
  exports: [EstoqueSaidasService],
})
export class EstoqueSaidasModule {}
