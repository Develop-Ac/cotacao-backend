import { Module } from '@nestjs/common';
import { UtilsController } from './utils.controller';
import { UtilsService } from './utils.service';
import { UtilsRepository } from './utils.repository';

@Module({
  controllers: [UtilsController],
  providers: [UtilsService, UtilsRepository],
  exports: [UtilsService, UtilsRepository],
})
export class UtilsModule {}
