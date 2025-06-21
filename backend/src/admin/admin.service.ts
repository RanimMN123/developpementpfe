// src/admin/admin.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';  // Vérifie le bon chemin
import axios from "axios";
import * as bcrypt from 'bcrypt';

import { CreateClientDto } from './dto/create-client.dto'; // Assure-toi que ce DTO existe
import { CreateOrderDto } from './dto/createorder.dto'
import { AdminAuthDto } from './dto/admin-auth.dto';
@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async createClient(dto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        name: dto.name,
        address: dto.address,
        phoneNumber: dto.phoneNumber,
        user: {
          connect: { id: dto.userId },
        },
      },
    });
  }

  // Méthode pour récupérer tous les clients (admin seulement)
  async getAllClients() {
    return this.prisma.client.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
  async findByEmail(email: string) {
    return this.prisma.admin.findUnique({ where: { email } });
  }

  async createAdmin(email: string, password: string) {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await this.findByEmail(email);
    if (existingAdmin) {
      throw new Error('Un admin avec cet email existe déjà');
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'admin
    return this.prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
      },
    });
  }


  async getDashboardStats() {
    const response = await axios.get("/api/admin/stats");
    return response.data;
  }


  async createProduct(name: string, description: string, price: number, stock: number, categoryId: number) {
    return this.prisma.product.create({
      data: {
        name,
        description,
        price, // price doit être un nombre
        stock,
        category: {
          connect: { id: categoryId },
        },
      },
    });
  }
  async getProducts() {
    return this.prisma.product.findMany();  // Utilisation de Prisma pour récupérer tous les produits
  }
  async getProductById(id: number) {
    return this.prisma.product.findUnique({
      where: { id },  // Utilise l'id pour récupérer le produit spécifique
    });
  }
  async deleteProduct(id: number) {
    return this.prisma.product.delete({
      where: { id },  // Utilise l'id pour supprimer le produit spécifique
    });
  }
  //async createOrder(dto: CreateOrderDto) {
    //try {
      // Créer une commande dans la base de données en utilisant Prisma
      //const order = await this.prisma.order.create({
       // data: {
       //  clientId: dto.clientId,
         //productId: dto.productId,
          //quantity: dto.quantity,
          //totalPrice: dto.totalPrice,
          //orderDate: dto.orderDate,
        //},
      //});
      //return order;
    //} catch (error) {
    //  throw new Error(`Erreur lors de la création de la commande: ${error.message}`);
    //}
 // }
}
