import { Module } from '@nestjs/common';
import { ImagesController } from './img.controller';
import { ImagesService } from './img.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [ImagesController],
  providers: [ImagesService, PrismaClient],
  exports: [ImagesService],
})
export class ImagesModule {}
