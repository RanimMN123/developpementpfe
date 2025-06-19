// backend/src/stats/stats.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as dayjs from 'dayjs';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  // Statistiques générales
  async getStats() {
    const commandes = await this.prisma.order.count();
    const produits = await this.prisma.product.count();
    const clients = await this.prisma.client.count();
    const categories = await this.prisma.category.count();

    return { commandes, produits, clients, categories };
  }

  // Statistiques de commandes groupées par date
  async getCommandesStats(range?: string) {
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
          const startOfWeek = dayjs().startOf('week').toDate();
          dateFilter = {
            createdAt: {
              gte: startOfWeek,
            }
          };
          break;
        case 'month':
          const startOfMonth = dayjs().startOf('month').toDate();
          dateFilter = {
            createdAt: {
              gte: startOfMonth,
            }
          };
          break;
        default:
          // Par défaut, derniers 30 jours
          const thirtyDaysAgo = dayjs().subtract(30, 'day').toDate();
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

      const groupedStats: Record<string, { count: number; amount: number }> = {};

      orders.forEach(order => {
        const date = dayjs(order.createdAt).format('YYYY-MM-DD');
        const amount = order.items.reduce((sum, item) => {
          return sum + (item.quantity * item.product.price);
        }, 0);

        if (!groupedStats[date]) {
          groupedStats[date] = { count: 0, amount: 0 };
        }

        groupedStats[date].count += 1;
        groupedStats[date].amount += amount;
      });

      return Object.entries(groupedStats).map(([date, stats]) => ({
        date,
        count: stats.count,
        amount: Math.round(stats.amount * 100) / 100, // Arrondir à 2 décimales
      }));
    } catch (error) {
      console.error('Erreur dans getCommandesStats:', error);
      return [];
    }
  }

  // Statistiques de produits groupés par date
  async getProduitsStats(range?: string) {
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
          const startOfWeek = dayjs().startOf('week').toDate();
          dateFilter = {
            createdAt: {
              gte: startOfWeek,
            }
          };
          break;
        case 'month':
          const startOfMonth = dayjs().startOf('month').toDate();
          dateFilter = {
            createdAt: {
              gte: startOfMonth,
            }
          };
          break;
        default:
          // Par défaut, derniers 30 jours
          const thirtyDaysAgo = dayjs().subtract(30, 'day').toDate();
          dateFilter = {
            createdAt: {
              gte: thirtyDaysAgo,
            }
          };
      }

      const products = await this.prisma.product.findMany({
        where: dateFilter,
      });

      const groupedStats: Record<string, number> = {};

      products.forEach(product => {
        const date = dayjs(product.createdAt).format('YYYY-MM-DD');
        groupedStats[date] = (groupedStats[date] || 0) + 1;
      });

      return Object.entries(groupedStats).map(([date, count]) => ({
        date,
        count,
      }));
    } catch (error) {
      console.error('Erreur dans getProduitsStats:', error);
      return [];
    }
  }

  // Statistiques de clients groupés par date
  async getClientsStats(range?: string) {
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
          const startOfWeek = dayjs().startOf('week').toDate();
          dateFilter = {
            createdAt: {
              gte: startOfWeek,
            }
          };
          break;
        case 'month':
          const startOfMonth = dayjs().startOf('month').toDate();
          dateFilter = {
            createdAt: {
              gte: startOfMonth,
            }
          };
          break;
        default:
          // Par défaut, derniers 30 jours
          const thirtyDaysAgo = dayjs().subtract(30, 'day').toDate();
          dateFilter = {
            createdAt: {
              gte: thirtyDaysAgo,
            }
          };
      }

      const clients = await this.prisma.client.findMany({
        where: dateFilter,
      });

      const groupedStats: Record<string, number> = {};

      clients.forEach(client => {
        const date = dayjs(client.createdAt).format('YYYY-MM-DD');
        groupedStats[date] = (groupedStats[date] || 0) + 1;
      });

      return Object.entries(groupedStats).map(([date, count]) => ({
        date,
        count,
      }));
    } catch (error) {
      console.error('Erreur dans getClientsStats:', error);
      return [];
    }
  }
}
