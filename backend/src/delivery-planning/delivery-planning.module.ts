import { Module } from '@nestjs/common';
import { DeliveryPlanningService } from './delivery-planning.service';
import { DeliveryPlanningController } from './delivery-planning.controller';
import { PrismaModule } from '../prisma/PrismaModule';

@Module({
  imports: [PrismaModule],
  controllers: [DeliveryPlanningController],
  providers: [DeliveryPlanningService],
  exports: [DeliveryPlanningService]
})
export class DeliveryPlanningModule {}
