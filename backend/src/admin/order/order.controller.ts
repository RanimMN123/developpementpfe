// order.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Put, HttpException, HttpStatus } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from '../dto/createorder.dto';
import { UpdateOrderStatusDto } from '../dto/updateorder-status.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async getAllCommandes() {
    return this.orderService.getAllCommandes();  // Appel à la méthode du service pour récupérer toutes les commandes
  }

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.createOrder(createOrderDto);
  }

  @Get('daily-revenue')
async getDailyRevenue() {
  return this.orderService.getDailyRevenue();
}




  //@Get()
  //async findAll() {
   // try {
      // Appel du service pour récupérer toutes les commandes
     // const orders = await this.orderService.getAllOrders();

      // Si aucune commande n'est trouvée, on renvoie une erreur 404
     // if (!orders || orders.length === 0) {
      //  throw new HttpException('Aucune commande trouvée', HttpStatus.NOT_FOUND);
     // }

      //return orders; // Retourne toutes les commandes trouvées
    //} catch (error) {
    //  throw new HttpException('Erreur lors de la récupération des commandes', HttpStatus.INTERNAL_SERVER_ERROR);
    //}
 //
  //}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      throw new HttpException('ID de commande invalide', HttpStatus.BAD_REQUEST);
    }

    const order = await this.orderService.getOrderById(orderId);
    if (!order) {
      throw new HttpException('Commande non trouvée', HttpStatus.NOT_FOUND);
    }

    return order;
  }

  @Get('user/:userId')
  async getUserOrders(@Param('userId') userId: string) {
    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      throw new HttpException('ID utilisateur invalide', HttpStatus.BAD_REQUEST);
    }

    return await this.orderService.getUserOrders(userIdNum);
  }

  // Route PUT pour la mise à jour du statut (compatibilité mobile)
  @Put(':id')
  async updateOrder(
    @Param('id') id: string,
    @Body() updateData: any,
  ) {
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      throw new HttpException('ID de commande invalide', HttpStatus.BAD_REQUEST);
    }

    try {
      console.log('🔄 Mise à jour de la commande via PUT:', { orderId, updateData });

      // Extraire les données de paiement si présentes
      const { status, paymentMethod, grossAmount, reduction, netAmount } = updateData;

      const updateOrderStatusDto = {
        status,
        paymentMethod,
        grossAmount,
        reduction,
        netAmount
      };

      const updatedOrder = await this.orderService.updateOrderStatus(orderId, updateOrderStatusDto);

      console.log('✅ Commande mise à jour avec succès:', updatedOrder);

      return {
        success: true,
        message: 'Commande mise à jour avec succès',
        data: updatedOrder
      };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la commande:', error);
      throw new HttpException(
        error.message || 'Erreur lors de la mise à jour de la commande',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      throw new HttpException('ID de commande invalide', HttpStatus.BAD_REQUEST);
    }

    try {
      console.log('🔄 Mise à jour du statut de la commande:', { orderId, newStatus: updateOrderStatusDto.status });

      const updatedOrder = await this.orderService.updateOrderStatus(orderId, updateOrderStatusDto);

      console.log('✅ Statut mis à jour avec succès:', updatedOrder);

      return {
        success: true,
        message: 'Statut de la commande mis à jour avec succès',
        data: updatedOrder
      };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut:', error);
      throw new HttpException(
        error.message || 'Erreur lors de la mise à jour du statut de la commande',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      throw new HttpException('ID de commande invalide', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.orderService.deleteOrder(orderId);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la suppression de la commande',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get(':id/total')
  async getOrderTotal(@Param('id') id: string) {
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      throw new HttpException('ID de commande invalide', HttpStatus.BAD_REQUEST);
    }

    try {
      const total = await this.orderService.calculateOrderTotal(orderId);
      return { total };
    } catch (error) {
      throw new HttpException(
        'Erreur lors du calcul du total de la commande',
        HttpStatus.BAD_REQUEST
      );
    }
  }

}