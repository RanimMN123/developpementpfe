// src/admin/product/product.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  // ✅ Créer un produit avec image
  async create(
    name: string,
    description: string,
    price: number,
    stock: number,
    categoryId: number,
    imageUrl?: string,
  ) {
    return this.prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        imageUrl,
        category: {
          connect: { id: categoryId },
        },
      },
    });
  }

  // ✅ Mettre à jour un produit (y compris image)
  async update(
    id: number,
    data: {
      name?: string;
      description?: string;
      price?: number;
      stock?: number;
      imageUrl?: string;
      categoryId?: number;
    },
  ) {
    // Vérifie si le produit existe
    await this.prisma.product.findUniqueOrThrow({ where: { id } });
  
    // On extrait categoryId du reste
    const { categoryId, ...restData } = data;
  
    return this.prisma.product.update({
      where: { id },
      data: {
        ...restData,
        ...(categoryId && {
          category: { connect: { id: categoryId } },
        }),
      },
    });
  }
  

  
  

  // ✅ Mise à jour du stock uniquement
  async updateStock(id: number, stock: number) {
    return this.prisma.product.update({
      where: { id },
      data: { stock },
    });
  }

  // ✅ Récupérer tous les produits avec catégories
  async getAllProducts() {
    return this.prisma.product.findMany({
      include: {
        category: true,
      },
    });
  }

  // ✅ Récupérer un seul produit
  async getProductById(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  // ✅ Supprimer un produit
  async deleteProduct(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  // ✅ Produits par catégorie sans détails
  async getProductsByCategory(categoryId: number) {
    return this.prisma.product.findMany({
      where: {
        categoryId: Number(categoryId),
      },
    });
  }

  // ✅ Produits par catégorie avec détails
  async findByCategory(categoryId: number) {
    return this.prisma.product.findMany({
      where: { categoryId },
      include: { category: true },
    });
  }
}
