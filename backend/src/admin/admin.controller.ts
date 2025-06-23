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
  Req,
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
import { SkipCsrf } from '../security/guards/csrf.guard';
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

  // Route pour récupérer tous les clients (admin seulement)
  @Get('clients')
  @UseGuards(JwtAuthGuard)
  @SkipCsrf()
  async getAllClients() {
    try {
      const clients = await this.adminService.getAllClients();
      return clients;
    } catch (error) {
      throw error;
    }
  }

  // ======== PRODUITS ========
  // Endpoint déplacé vers ProductController pour éviter les conflits

  // Récupérer tous les produits (avec URLs d'images corrigées pour mobile)
  @Get('products')
  @SkipCsrf()
  async getProducts(@Req() request: any) {
    const products = await this.adminService.getProducts();

    // Construire l'URL de base à partir de la requête (avec IP fixe pour mobile)
    const protocol = request.protocol || 'http';
    const requestHost = request.get('host');

    // Forcer l'IP correcte pour les requêtes mobiles
    let host = requestHost || 'localhost:3000';

    // Si la requête vient du mobile (détection par User-Agent ou autre), utiliser l'IP fixe
    const userAgent = request.get('user-agent') || '';
    const isMobileRequest = userAgent.includes('Expo') || userAgent.includes('ReactNative') ||
                           requestHost?.includes('192.168') || requestHost?.includes('10.0') ||
                           requestHost?.includes('172.16');

    if (isMobileRequest) {
      host = '192.168.100.187:3000'; // IP fixe pour mobile actuelle
      console.log('📱 Requête mobile détectée sur /admin/products, utilisation IP fixe:', host);
    }

    const baseUrl = `${protocol}://${host}`;
    console.log('🌐 Base URL pour produits:', baseUrl);

    // Transformer les produits avec URLs complètes
    const transformedProducts = products.map(product => {
      let productImageUrl: string | null = null;
      if (product.imageUrl) {
        if (product.imageUrl.startsWith('http')) {
          productImageUrl = product.imageUrl;
        } else {
          productImageUrl = `${baseUrl}${product.imageUrl}`;
        }
      }

      return {
        ...product,
        imageUrl: productImageUrl // URL complète
      };
    });

    return transformedProducts;
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
