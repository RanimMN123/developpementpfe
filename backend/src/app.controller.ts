import { Controller, Get, Post, Body, Param, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { CategoryService } from './category/category.service';
import { ProductService } from './admin/product/product.service'; // ✅ Ajout du ProductService

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly categoryService: CategoryService,
    private readonly productService: ProductService, // ✅ Injection du service produit
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  //@Post('test/categories')
  //async createCategory(@Body() data: { name: string }) {
    //return await this.categoryService.createCategory(data);
  //}

  @Get('test/categories')
  async getCategories() {
    return await this.categoryService.getCategories();
  }

  // ✅ Endpoint de test simple
  @Get('test/ping')
  async testPing() {
    return {
      message: 'Backend fonctionne !',
      timestamp: new Date().toISOString(),
      endpoint: '/test/ping'
    };
  }

  // ✅ Endpoint de santé pour la découverte automatique
  @Get('health')
  async healthCheck() {
    return {
      status: 'ok',
      message: 'Backend disponible',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'connected',
        api: 'running'
      }
    };
  }

  // ✅ Nouvelle route pour récupérer les produits d'une catégorie
  @Get('test/categories/:categoryId/products')
  async getProductsByCategory(@Param('categoryId') categoryId: number) {
    return await this.productService.getProductsByCategory(categoryId);
  }

  // ✅ Endpoint spécifique pour Articles avec images correctes
  @Get('articles/categories-with-products')
  async getCategoriesWithProducts(@Req() request: any) {
    try {
      // Récupérer toutes les catégories
      const categories = await this.categoryService.getCategories();

      // Récupérer tous les produits avec leurs images
      const products = await this.productService.getAllProducts();

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
        host = '192.168.100.187:3000'; // IP fixe pour mobile
        console.log('📱 Requête mobile détectée, utilisation IP fixe:', host);
      }

      const baseUrl = `${protocol}://${host}`;

      console.log('🌐 Base URL construite:', baseUrl);

      // Transformer les données pour le mobile avec URLs complètes
      const categoriesWithImages = categories.map(category => {
        // Trouver les produits de cette catégorie
        const categoryProducts = products.filter(product => product.categoryId === category.id);

        // Construire l'URL complète de l'image de catégorie
        let categoryImageUrl: string | null = null;
        if (category.image) {
          // Si l'image commence par 'public/', ajouter le slash
          const imagePath = category.image.startsWith('public/') ? `/${category.image}` : category.image;
          categoryImageUrl = `${baseUrl}${imagePath}`;
        } else if (categoryProducts.length > 0) {
          // Utiliser la première image de produit trouvée
          const productWithImage = categoryProducts.find(p => p.imageUrl);
          if (productWithImage && productWithImage.imageUrl) {
            if (productWithImage.imageUrl.startsWith('http')) {
              categoryImageUrl = productWithImage.imageUrl;
            } else {
              categoryImageUrl = `${baseUrl}${productWithImage.imageUrl}`;
            }
          }
        }

        return {
          id: category.id,
          name: category.name,
          imageUrl: categoryImageUrl, // URL complète
          productsCount: categoryProducts.length
        };
      });

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

      return {
        message: 'Catégories et produits récupérés avec succès',
        data: {
          categories: categoriesWithImages,
          products: transformedProducts
        }
      };
    } catch (error) {
      console.error('Erreur dans getCategoriesWithProducts:', error);
      throw error;
    }
  }
}

 // @Get('test/categories/:id')
//  async getCategory(@Param('id', ParseIntPipe) id: number) {
//    const category = await this.categoryService.getCategory(id);
//    return {
//      message: 'Catégorie récupérée avec succès',
 //     data: category,
 //   };
 // }
//}

    
  //}

//}
 
//}
