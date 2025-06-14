import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Patch,
  UseGuards,
  Request,
  UnauthorizedException,
  ParseIntPipe,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateOrderDto } from './dto/createorder.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateOrderStatusDto } from './dto/updateorder-status.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { AdminAuthDto } from './dto/admin-auth.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Route pour créer un admin (pour l'initialisation)
  @Post('create-admin')
  async createAdmin(@Body() body: { email: string; password: string }) {
    try {
      const { email, password } = body;
      const result = await this.adminService.createAdmin(email, password);
      return {
        message: 'Admin créé avec succès',
        admin: {
          id: result.id,
          email: result.email,
          createdAt: result.createdAt
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Route pour obtenir les informations de l'admin connecté (protégée par JWT)
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: ExpressRequest) {
    return {
      message: 'Profil récupéré avec succès',
      admin: req.user,
    };
  }



  @UseGuards(JwtAuthGuard) // Protection par JWT
  // Route pour créer un client
  @Post('clients')
  async createClient(@Body(new ValidationPipe()) dto: CreateClientDto) {
    try {
      const result = await this.adminService.createClient(dto);
      return {
        message: 'Client créé avec succès',
        data: result
      };
    } catch (error) {
      throw error;
    }
  }

  // ======== PRODUITS ========

  // Créer un produit
  @Post('products')
  async createProduct(@Body() createProductDto: CreateProductDto) {
    const { name, description, price, stock, categoryId } = createProductDto;
    const result = await this.adminService.createProduct(name, description, price, stock, categoryId);
    return result;
  }

  // Récupérer tous les produits
  @Get('products')
  async getProducts() {
    const products = await this.adminService.getProducts();
    return products;
  }

  // Route pour récupérer les statistiques du dashboard
  @Get('dashboard')
  getStats() {
    return this.adminService.getDashboardStats();
  }

  // Récupérer un produit par son ID
  @Get('product/:id')
  async getProductById(@Param('id') id: number) {
    const product = await this.adminService.getProductById(id);
    if (!product) {
      throw new Error(`Produit avec l'ID ${id} non trouvé`);
    }
    return product;
  }

  // Mettre à jour un produit
  //@Patch('products/:id')
 // @UseGuards(JwtAuthGuard)
  //async updateProduct(
  //  @Param('id', ParseIntPipe) id: number,
  //  @Body(new ValidationPipe()) updateProductDto: Partial<CreateProductDto>,
  //) {
  //  try {
  //    const { name, description, price, categoryId } = updateProductDto;
  //    const result = await this.adminService.updateProduct(
  //      id,
   //     name,
   //     description,
   //     price,
   //     categoryId,
   //   );
   //   return {
   //     message: 'Produit mis à jour avec succès',
   //     data: result
   //   };
   // } catch (error) {
   //   throw error;
   // }
  //}

  // Supprimer un produit
  @Delete('product/:id')
  async deleteProduct(@Param('id') id: number) {
    const result = await this.adminService.deleteProduct(id);
    if (!result) {
      throw new Error(`Produit avec l'ID ${id} non trouvé`);
    }
    return { message: `Produit avec l'ID ${id} supprimé avec succès` };
  }

  // ======== COMMANDES ========

  // Créer une commande
// @Post('order')
 // async createOrder(@Body() dto: CreateOrderDto) {
 //   const result = await this.adminService.createOrder(dto);
 //   return { message: 'Commande créée avec succès', order: result };
 // }

  // Récupérer toutes les commandes
  //@Get('orders')
 // @UseGuards(JwtAuthGuard)
 // async getAllOrders() {
   // try {
    //  return {
     //   message: 'Commandes récupérées avec succès',
     //   data: orders
     // };
   // } catch (error) {
   //   throw error;
  //  }
 //}

  // Récupérer une commande par ID
  //@Get('orders/:id')
  //@UseGuards(JwtAuthGuard)
//async getOrderById(@Param('id', ParseIntPipe) id: number) {
 //     const order = await this.adminService.getOrderById(id);
     // return {
       // message: 'Commande récupérée avec succès',
       // data: order
     // };
   // } catch (error) {
   //   throw error;
   // }
  //}

  // Mettre à jour le statut d'une commande
  //@Patch('orders/:id/status')
 // @UseGuards(JwtAuthGuard)
 // async updateOrderStatus(
  //  @Param('id', ParseIntPipe) id: number,
  //  @Body(new ValidationPipe()) dto: UpdateOrderStatusDto,
  //) {
  //  try {
  //    const result = await this.adminService.updateOrderStatus(id, dto.status);
  //    return {
  //      message: 'Statut de la commande mis à jour avec succès',
  //      data: result
  //    };
  //  } catch (error) {
  //    throw error;
  //  }
  //}
}
