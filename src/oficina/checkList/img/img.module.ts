import { Module } from '@nestjs/common';
import { ImagesController } from './img.controller';
import { ImagesService } from './img.service';
import { ImagesRepository } from './img.repository';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [ImagesController],
  providers: [
    ImagesService,
    ImagesRepository,
    { provide: PrismaClient, useValue: new PrismaClient() },
  ],
  exports: [ImagesService, ImagesRepository],
})
export class ImagesModule {}
