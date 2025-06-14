import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeliveryPlanningDto } from './dto/create-delivery-planning.dto';
import { $Enums } from '@prisma/client';

@Injectable()
export class DeliveryPlanningService {
  constructor(private prisma: PrismaService) {}

  async createDeliveryPlanning(createDeliveryPlanningDto: CreateDeliveryPlanningDto) {
    const { orderId, clientId, deliveryDate, deliveryTimeStart, deliveryTimeEnd, status, notes } = createDeliveryPlanningDto;

    // Vérifier que la commande existe
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { client: true }
    });

    if (!order) {
      throw new NotFoundException(`Commande avec l'ID ${orderId} non trouvée`);
    }

    // Vérifier que le client correspond
    if (order.clientId !== clientId) {
      throw new BadRequestException('Le client ne correspond pas à la commande');
    }

    // Vérifier qu'il n'y a pas déjà une planification pour cette commande
    const existingPlanning = await this.prisma.deliveryPlanning.findUnique({
      where: { orderId }
    });

    if (existingPlanning) {
      // Mettre à jour la planification existante
      return this.prisma.deliveryPlanning.update({
        where: { orderId },
        data: {
          deliveryDate: new Date(deliveryDate),
          deliveryTimeStart,
          deliveryTimeEnd,
          status: status || $Enums.DeliveryStatus.PRETE,
          notes,
          updatedAt: new Date()
        },
        include: {
          order: {
            include: {
              client: true
            }
          }
        }
      });
    }

    // Créer une nouvelle planification
    return this.prisma.deliveryPlanning.create({
      data: {
        orderId,
        clientId,
        deliveryDate: new Date(deliveryDate),
        deliveryTimeStart,
        deliveryTimeEnd,
        status: status || $Enums.DeliveryStatus.PRETE,
        notes
      },
      include: {
        order: {
          include: {
            client: true
          }
        }
      }
    });
  }

  async getDeliveryPlannings() {
    return this.prisma.deliveryPlanning.findMany({
      include: {
        order: {
          include: {
            client: true,
            items: {
              include: {
                product: true
              }
            }
          }
        }
      },
      orderBy: {
        deliveryDate: 'asc'
      }
    });
  }

  async getDeliveryPlanningByOrderId(orderId: number) {
    return this.prisma.deliveryPlanning.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            client: true
          }
        }
      }
    });
  }

  async updateDeliveryPlanningStatus(id: number, status: $Enums.DeliveryStatus) {
    return this.prisma.deliveryPlanning.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date()
      },
      include: {
        order: {
          include: {
            client: true
          }
        }
      }
    });
  }

  async deleteDeliveryPlanning(id: number) {
    return this.prisma.deliveryPlanning.delete({
      where: { id }
    });
  }
}
