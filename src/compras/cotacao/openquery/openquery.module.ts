import { Module } from '@nestjs/common';
import { OpenQueryController } from './openquery.controller';
import { ConsultaOpenqueryService } from './openquery.service';
import { HttpModule } from '@nestjs/axios';
import { OpenQueryModule } from 'src/shared/database/openquery/openquery.module';

@Module({
  imports: [HttpModule, OpenQueryModule], 
  controllers: [OpenQueryController],
  providers: [ConsultaOpenqueryService],
})
export class OpenQueryHttpModule {}
