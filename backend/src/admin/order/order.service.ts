// service/order.service.ts
import { Injectable, NotFoundException, BadRequestException  } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from '../dto/createorder.dto';
import { UpdateOrderStatusDto } from '../dto/updateorder-status.dto';
import { CaisseService } from '../../caisse/caisse.service';
import { PaymentMethod } from '@prisma/client';
@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly caisseService: CaisseService
  ) {}
  // Méthode pour récupérer toutes les commandes
  //async getAllOrders() {
    //return this.prisma.order.findMany({
      //include: {
        //client: true,   // Include the client details related to the order
        //items: true,    // Include all order items related to the order
      //},
   // });
  //}

  


  async createOrder(dto: CreateOrderDto) {
    const { clientId, responsableId, items } = dto;
  
    // Vérifier que le client existe
    const client = await this.prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      throw new NotFoundException(`Client avec l'ID ${clientId} non trouvé`);
    }

    // Vérifier que l'utilisateur/responsable existe
    const responsable = await this.prisma.user.findUnique({
      where: { id: responsableId }
    });

    if (!responsable) {
      throw new NotFoundException(`Utilisateur avec l'ID ${responsableId} non trouvé`);
    }

    // Vérifier si chaque produit a suffisamment de stock
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Produit avec ID ${item.productId} non trouvé`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour le produit "${product.name}". Stock actuel : ${product.stock}, demandé : ${item.quantity}`
        );
      }
    }
  
    // Créer la commande et mettre à jour le stock dans une transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Créer la commande
      const createdOrder = await tx.order.create({
        data: {
          clientId: clientId,
          clientName: client.name,
          responsable: responsable.name || responsable.email,
          status: 'PENDING',
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          items: true,
        },
      });
  
      // Mettre à jour le stock de chaque produit
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
  
      return createdOrder;
    });
  
    return order;
  }
  

  async getAllCommandes() {
    return await this.prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true, // Inclure les informations du produit pour chaque item
          },
        },
      },
    });
  }


  //async getAllCommandes() {
   // return this.prisma.order.findMany();  // Utilisation de Prisma pour récupérer toutes les commandes
  //}

  async getOrderById(orderId: number) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true, // Include related order items
      },
    });
  }
  async getUserOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { clientId: userId },
      include: {
        items: true, // Include related order items
      },
    });
  }
    // Method to update the status of an order with payment data
    async updateOrderStatus(orderId: number, updateOrderStatusDto: UpdateOrderStatusDto & {
      paymentMethod?: string;
      grossAmount?: number;
      reduction?: number;
      netAmount?: number;
    }) {
      const { status, paymentMethod, grossAmount, reduction, netAmount } = updateOrderStatusDto;

      // Récupérer l'ancienne commande pour comparer les statuts
      const existingOrder = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!existingOrder) {
        throw new NotFoundException('Commande non trouvée');
      }

      // Mettre à jour le statut de la commande
      const updatedOrder = await this.prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // 🎯 ENREGISTREMENT AUTOMATIQUE EN CAISSE
      // Si la commande passe au statut "DELIVERED", l'enregistrer automatiquement en caisse
      if (status === 'DELIVERED' && existingOrder.status !== 'DELIVERED') {
        console.log(`💰 Commande #${orderId} livrée - Enregistrement automatique en caisse`);

        try {
          const paymentData = {
            paymentMethod: paymentMethod || 'ESPECE',
            grossAmount: grossAmount,
            reduction: reduction || 0,
            netAmount: netAmount
          };

          await this.enregistrerVenteEnCaisse(updatedOrder, paymentData);
          console.log(`✅ Vente enregistrée en caisse pour la commande #${orderId}`);
        } catch (error) {
          console.error(`❌ Erreur lors de l'enregistrement en caisse pour la commande #${orderId}:`, error);
          // Ne pas faire échouer la mise à jour du statut si l'enregistrement en caisse échoue
        }
      }

      return updatedOrder;
    }

    // Méthode privée pour enregistrer une vente en caisse avec données de paiement
    private async enregistrerVenteEnCaisse(order: any, paymentData?: {
      paymentMethod?: string;
      grossAmount?: number;
      reduction?: number;
      netAmount?: number;
    }) {
      try {
        // Calculer le montant total de la commande si pas fourni
        const montantCalcule = order.items.reduce((total, item) => {
          return total + (item.quantity * item.product.price);
        }, 0);

        // Utiliser les données de paiement ou les valeurs par défaut
        const montantBrut = paymentData?.grossAmount || montantCalcule;
        const reduction = paymentData?.reduction || 0;
        const montantNet = paymentData?.netAmount || (montantBrut - reduction);

        // Convertir la méthode de paiement en enum PaymentMethod
        let methodePaiement: PaymentMethod = PaymentMethod.ESPECE; // Valeur par défaut
        if (paymentData?.paymentMethod) {
          switch (paymentData.paymentMethod.toUpperCase()) {
            case 'ESPECE':
              methodePaiement = PaymentMethod.ESPECE;
              break;
            case 'CHEQUE':
              methodePaiement = PaymentMethod.CHEQUE;
              break;
            case 'CREDIT':
              methodePaiement = PaymentMethod.CREDIT;
              break;
            case 'TICKET_RESTO':
              methodePaiement = PaymentMethod.TICKET_RESTO;
              break;
            case 'CARTE':
              methodePaiement = PaymentMethod.CARTE;
              break;
            default:
              methodePaiement = PaymentMethod.ESPECE;
          }
        }

        console.log(`💰 Enregistrement vente: Commande #${order.id}`);
        console.log(`   Montant brut: ${montantBrut} TND`);
        console.log(`   Réduction: ${reduction} TND`);
        console.log(`   Montant net: ${montantNet} TND`);
        console.log(`   Méthode: ${methodePaiement}`);

        // Trouver l'utilisateur responsable de la commande
        const responsable = await this.prisma.user.findFirst({
          where: {
            OR: [
              { name: order.responsable },
              { email: order.responsable }
            ]
          }
        });

        if (!responsable) {
          console.warn(`⚠️ Responsable non trouvé pour la commande #${order.id}: ${order.responsable}`);
          return;
        }

        // Créer un enregistrement de vente en caisse avec toutes les données
        const venteEnCaisse = await this.prisma.caisseVente.create({
          data: {
            orderId: order.id,
            userId: responsable.id,
            montant: montantNet, // Montant net après réduction
            montantBrut: montantBrut, // Nouveau champ pour le montant brut
            reduction: reduction, // Nouveau champ pour la réduction
            methodePaiement: methodePaiement, // Enum PaymentMethod correctement typé
            dateVente: new Date(),
            description: `Vente automatique - Commande #${order.id} - Client: ${order.clientName} - ${methodePaiement}`,
          }
        });

        console.log(`✅ Vente enregistrée en caisse:`, {
          id: venteEnCaisse.id,
          orderId: order.id,
          montantBrut: montantBrut,
          reduction: reduction,
          montantNet: montantNet,
          methodePaiement: methodePaiement,
          responsable: responsable.name || responsable.email
        });

        return venteEnCaisse;

      } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement en caisse:', error);
        throw error;
      }
    }
     // Method to delete an order by its ID
  async deleteOrder(orderId: number) {
    // Check if the order exists
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Delete the order
    await this.prisma.order.delete({
      where: { id: orderId },
    });

    return { message: 'Order deleted successfully' };
  }
  // Method to calculate the total cost of an order
  async calculateOrderTotal(orderId: number): Promise<number> {
    // Fetch the order along with its items and related product prices
    const orderWithItems = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,  // Include the product information (e.g., price)
          },
        },
      },
    });

    if (!orderWithItems) {
      throw new Error('Order not found');
    }

    // Calculate the total by summing up the quantity * price for each order item
    const total = orderWithItems.items.reduce((sum, item) => {
      return sum + item.quantity * item.product.price;  // Assuming `price` is a field on your `Product` model
    }, 0);

    return total;
  }


  async getDailyRevenue(range?: string) {
    try {
      // Déterminer la période selon le paramètre range
      let dateFilter = {};
      const now = new Date();

      switch (range) {
        case 'today':
          const startOfDay = new Date(now);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(now);
          endOfDay.setHours(23, 59, 59, 999);
          dateFilter = {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            }
          };
          break;
        case 'week':
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - 7);
          dateFilter = {
            createdAt: {
              gte: startOfWeek,
            }
          };
          break;
        case 'month':
          const startOfMonth = new Date(now);
          startOfMonth.setDate(now.getDate() - 30);
          dateFilter = {
            createdAt: {
              gte: startOfMonth,
            }
          };
          break;
        default:
          // Par défaut, derniers 30 jours
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(now.getDate() - 30);
          dateFilter = {
            createdAt: {
              gte: thirtyDaysAgo,
            }
          };
      }

      const orders = await this.prisma.order.findMany({
        where: dateFilter,
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      const revenueByDay: Record<string, number> = {};

      for (const order of orders) {
        const date = new Date(order.createdAt).toISOString().split('T')[0]; // yyyy-mm-dd

        const total = order.items.reduce((sum, item) => {
          return sum + item.quantity * item.product.price;
        }, 0);

        if (!revenueByDay[date]) {
          revenueByDay[date] = 0;
        }

        revenueByDay[date] += total;
      }

      return Object.entries(revenueByDay).map(([date, total]) => ({
        date,
        total: parseFloat(total.toFixed(2)),
      }));
    } catch (error) {
      console.error('Erreur dans getDailyRevenue:', error);
      return [];
    }
  }

  
}
