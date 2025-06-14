// order.module.ts
import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from '../../prisma/PrismaModule';
import { CaisseModule } from '../../caisse/caisse.module';

@Module({
  imports: [PrismaModule, CaisseModule],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService]
})
export class OrderModule {}