import { Module } from '@nestjs/common';
import { ChecklistsController } from './checkList.controller';
import { ChecklistsService } from './checkList.service';

@Module({
  controllers: [ChecklistsController],
  providers: [ChecklistsService],
})
export class ChecklistsModule {}
