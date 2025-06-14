import { Controller, Get, Post, Body, Param } from '@nestjs/common';
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
  async getCategoriesWithProducts() {
    try {
      // Récupérer toutes les catégories
      const categories = await this.categoryService.getCategories();

      // Récupérer tous les produits avec leurs images
      const products = await this.productService.getAllProducts();

      // Transformer les données pour le mobile
      const categoriesWithImages = categories.map(category => {
        // Trouver les produits de cette catégorie
        const categoryProducts = products.filter(product => product.categoryId === category.id);

        // Utiliser l'image de la catégorie ou la première image de produit trouvée
        let categoryImage = category.image;
        if (!categoryImage && categoryProducts.length > 0) {
          const productWithImage = categoryProducts.find(p => p.imageUrl);
          if (productWithImage) {
            // Convertir l'URL complète en chemin relatif pour buildImageUrl
            categoryImage = productWithImage.imageUrl?.replace('http://localhost:3000/', '') || null;
          }
        }

        return {
          id: category.id,
          name: category.name,
          image: categoryImage,
          productsCount: categoryProducts.length
        };
      });

      // Transformer les produits pour avoir le bon format d'image
      const transformedProducts = products.map(product => ({
        ...product,
        // Convertir imageUrl en image pour compatibilité mobile
        image: product.imageUrl ? product.imageUrl.replace('http://localhost:3000/', '') : null
      }));

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
