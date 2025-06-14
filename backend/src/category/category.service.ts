import { Body, Controller, Post, Put, Param, UseInterceptors, UploadedFile, ParseIntPipe, UsePipes, ValidationPipe, BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(name: string, imagePath?: string) {
    return this.prisma.category.create({
      data: {
        name,
        image: imagePath || null,
      },
    });
  }

  async getCategories() {
    return this.prisma.category.findMany();
  }

  async getCategory(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async updateCategory(id: number, data: { name?: string; image?: string }) {
    await this.getCategory(id); // Vérifie que la catégorie existe avant de mettre à jour

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }


  async deleteCategory(id: number) {
    // Vérifier que la catégorie existe avant suppression
    await this.getCategory(id);
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
