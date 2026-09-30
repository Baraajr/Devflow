import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Label } from './entities/label.entity';
import { LabelsController } from './label.controller';
import { LabelsService } from './label.service';

@Module({
  imports: [TypeOrmModule.forFeature([Label])],
  controllers: [LabelsController],
  providers: [LabelsService],
  exports: [LabelsService],
})
export class LabelsModule {}
