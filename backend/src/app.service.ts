import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';  // ✅ Chemin correct selon ta structure

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}  // ✅ Injection de PrismaService

  getHello(): string {
    return 'Hello World!';
  }

  async getProductsByCategory(categoryId: string) {
    return this.prisma.product.findMany({
      where: { categoryId: parseInt(categoryId) },
    });
  }
}
