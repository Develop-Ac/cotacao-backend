import { Module } from '@nestjs/common';
import { EntregasController } from './entregas.controller';
import { EntregasService } from './entregas.service';
import { EntregasRepository } from './entregas.repository';
import { PostgresModule } from '../../shared/database/postgres/postgres.module';

@Module({
  imports: [PostgresModule],
  controllers: [EntregasController],
  providers: [EntregasService, EntregasRepository],
  exports: [EntregasService, EntregasRepository],
})
export class EntregasModule {}