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
  async getCommandesStats() {
    const stats = await this.prisma.order.groupBy({
      by: ['createdAt'],
      _count: true,
    });

    const groupedStats: Record<string, number> = {};
    stats.forEach(stat => {
      const date = dayjs(stat.createdAt).format('YYYY-MM-DD');
      groupedStats[date] = (groupedStats[date] || 0) + stat._count;
    });

    return Object.entries(groupedStats).map(([date, count]) => ({
      date,
      count,
    }));
  }

  // Statistiques de produits groupés par date
  async getProduitsStats() {
    const stats = await this.prisma.product.groupBy({
      by: ['createdAt'],
      _count: true,
    });

    const groupedStats: Record<string, number> = {};
    stats.forEach(stat => {
      const date = dayjs(stat.createdAt).format('YYYY-MM-DD');
      groupedStats[date] = (groupedStats[date] || 0) + stat._count;
    });

    return Object.entries(groupedStats).map(([date, count]) => ({
      date,
      count,
    }));
  }

  // Statistiques de clients groupés par date
  async getClientsStats() {
    const stats = await this.prisma.client.groupBy({
      by: ['createdAt'],
      _count: true,
    });

    const groupedStats: Record<string, number> = {};
    stats.forEach(stat => {
      const date = dayjs(stat.createdAt).format('YYYY-MM-DD');
      groupedStats[date] = (groupedStats[date] || 0) + stat._count;
    });

    return Object.entries(groupedStats).map(([date, count]) => ({
      date,
      count,
    }));
  }
}
