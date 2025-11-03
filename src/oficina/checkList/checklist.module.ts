import { Module } from '@nestjs/common';
import { ChecklistsController } from './checkList.controller';
import { ChecklistsService } from './checkList.service';
import { ChecklistRepository } from './checkList.repository';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ChecklistsController],
  providers: [ChecklistsService, ChecklistRepository],
  exports: [ChecklistsService, ChecklistRepository],
})
export class ChecklistsModule {}
