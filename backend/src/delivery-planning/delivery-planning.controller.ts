import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { DeliveryPlanningService } from './delivery-planning.service';
import { CreateDeliveryPlanningDto } from './dto/create-delivery-planning.dto';
import { $Enums } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('delivery-planning')
@UseGuards(JwtAuthGuard)
export class DeliveryPlanningController {
  constructor(private readonly deliveryPlanningService: DeliveryPlanningService) {}

  @Post()
  async create(@Body() createDeliveryPlanningDto: CreateDeliveryPlanningDto) {
    try {
      console.log('📅 Création de planification de livraison:', createDeliveryPlanningDto);

      const result = await this.deliveryPlanningService.createDeliveryPlanning(createDeliveryPlanningDto);

      console.log('✅ Planification créée avec succès:', result);

      return {
        success: true,
        message: 'Planification de livraison créée avec succès',
        data: result
      };
    } catch (error) {
      console.error('❌ Erreur lors de la création de la planification:', error);
      throw error;
    }
  }

  @Get()
  async findAll() {
    try {
      const plannings = await this.deliveryPlanningService.getDeliveryPlannings();
      return {
        success: true,
        data: plannings
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des planifications:', error);
      throw error;
    }
  }

  @Get('order/:orderId')
  async findByOrderId(@Param('orderId', ParseIntPipe) orderId: number) {
    try {
      const planning = await this.deliveryPlanningService.getDeliveryPlanningByOrderId(orderId);
      return {
        success: true,
        data: planning
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la planification:', error);
      throw error;
    }
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: $Enums.DeliveryStatus
  ) {
    try {
      const result = await this.deliveryPlanningService.updateDeliveryPlanningStatus(id, status);
      return {
        success: true,
        message: 'Statut de planification mis à jour avec succès',
        data: result
      };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.deliveryPlanningService.deleteDeliveryPlanning(id);
      return {
        success: true,
        message: 'Planification supprimée avec succès'
      };
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la planification:', error);
      throw error;
    }
  }
}
