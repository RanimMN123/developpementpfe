//import { Injectable } from '@nestjs/common';
//import { PrismaService } from '../prisma/prisma.service';
//import { CreateProductDto } from './dto/create-product.dto';

//@Injectable()
//export class AdminService {
 // constructor(private prisma: PrismaService) {}

  // Créer un produit
  //async createProduct(name: string, description: string, price: number, categoryId: string) {
  //  try {
 //     const product = await this.prisma.product.create({
  //      data: {
  //        name,
  ///        description,
  //        price,
  //        category: {
  //          connect: { id: Number(categoryId) }, // Conversion de categoryId en nombre
  //        },
  //      },
  //    });
  //    return product;
  //  } catch (error) {
  //    throw new Error(`Erreur lors de la création du produit: ${error.message}`);
  //  }
  //}

  // Récupérer tous les produits
 // async getProducts() {
   // try {
   //   const products = await this.prisma.product.findMany();
   //   return products;
   // } catch (error) {
   //   throw new Error(`Erreur lors de la récupération des produits: ${error.message}`);
   // }
 // }

  // Récupérer un produit par son ID
  //async getProductById(id: string) {
  //  try {
   //   const product = await this.prisma.product.findUnique({
   //     where: { id: Number(id) },  // Conversion de id en nombre
   //   });
   //   return product;
   // } catch (error) {
   //   throw new Error(`Erreur lors de la récupération du produit: ${error.message}`);
   // }
  //}

  // Supprimer un produit
  //async deleteProduct(id: string) {
  ////  try {
  //    await this.prisma.product.delete({
    //    where: { id: Number(id) },  // Conversion de id en nombre
   ////   });
   // } catch (error) {
   //   throw new Error(`Erreur lors de la suppression du produit: ${error.message}`);
   // }
  //}

  // Créer une commande
 // async createOrder(dto: any) {
  //  try {
  //    const order = await this.prisma.order.create({
  //      data: {
  //        user: { connect: { id: Number(dto.userId) } },  // Conversion de userId en nombre
  //        products: {
  //          connect: dto.productIds.map((id: string) => ({ id: Number(id) })), // Conversion de chaque ID en nombre
  //        },
  //      },
  //    });
  //    return order;
  //  } catch (error) {
  //    throw new Error(`Erreur lors de la création de la commande: ${error.message}`);
  //  }
 // }
//}
