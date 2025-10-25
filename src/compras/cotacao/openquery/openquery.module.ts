import { Module } from '@nestjs/common';
import { OpenQueryController } from './openquery.controller';
import { OpenQueryService } from './openquery.service';

@Module({
  controllers: [OpenQueryController],
  providers: [OpenQueryService],
})
export class OpenQueryModule {}
