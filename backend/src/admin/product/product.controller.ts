// product.controller.ts
import { Controller, Get, Post, Param, Body, Put, Delete, ParseIntPipe, UploadedFile,
  UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Controller('products')
export class ProductController {
    constructor(
      private readonly productService: ProductService,
      private readonly cloudinaryService: CloudinaryService
    ) {}  // Injecte les services
   // ======== PRODUITS ========

  // Créer un produit
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/images',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createProductDto: CreateProductDto,
  ) {
    // Convertir les valeurs reçues (toujours en string avec multipart) en leurs types réels
    const name = createProductDto.name;
    const description = createProductDto.description;
    const price = Number(createProductDto.price);
    const stock = Number(createProductDto.stock);
    const categoryId = Number(createProductDto.categoryId);
  
    if (
      !name ||
      !description ||
      isNaN(price) ||
      isNaN(stock) ||
      isNaN(categoryId)
    ) {
      throw new BadRequestException('Les champs doivent être correctement remplis.');
    }

    // Garder l'ancien système ET ajouter Cloudinary
    const localImageUrl = file ? `/public/images/${file.filename}` : null;

    // Essayer d'uploader vers Cloudinary (sans casser si ça échoue)
    let cloudinaryUrl = null;
    if (file) {
      try {
        cloudinaryUrl = await this.cloudinaryService.uploadImage(file, 'products');
        console.log('✅ Image uploadée vers Cloudinary:', cloudinaryUrl);
      } catch (error) {
        console.log('⚠️ Échec Cloudinary, utilisation locale:', error.message);
      }
    }

    // Utiliser Cloudinary si disponible, sinon l'ancien système
    const finalImageUrl = cloudinaryUrl || localImageUrl;

    return this.productService.create(name, description, price, stock, categoryId, finalImageUrl ?? undefined);

  }
  
 

  // Récupérer tous les produits
  @Get('products')
  async getProducts() {
    const products = await this.productService.getAllProducts();
    return products;
  }

  // Récupérer un produit par son ID
  @Get('product/:id')
  async getProductById(@Param('id') id: number) {
    const product = await this.productService.getProductById(id);
    if (!product) {
      throw new Error(`Produit avec l'ID ${id} non trouvé`);
    }
    return product;
  }



  // Marque la méthode comme 'async'
  //@Get()
  //async findAll() {
  //  return await this.productService.findAll();  // Utilisation de await dans une fonction async

  //}
  // src/admin/product/product.controller.ts
  @Get('category/:categoryId')
  getProductsByCategory(@Param('categoryId') categoryId: string) {
    // Category ID est maintenant typé correctement
    console.log(categoryId); // Affichera la valeur du paramètre
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/images',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any, // ou CreateProductDto si adapté
  ) {
    const name = body.name;
    const description = body.description;
    const price = body.price ? Number(body.price) : undefined;
    const stock = body.stock ? Number(body.stock) : undefined;
    const categoryId = body.categoryId ? Number(body.categoryId) : undefined;
  
    const imageUrl = file ? `/public/images/${file.filename}` : undefined;
  
    const updateData: any = {
      ...(name && { name }),
      ...(description && { description }),
      ...(price !== undefined && { price }),
      ...(stock !== undefined && { stock }),
      ...(categoryId !== undefined && { categoryId }),
      ...(imageUrl && { imageUrl }),
    };
  
    const result = await this.productService.update(id, updateData);
  
    return {
      message: 'Produit mis à jour avec succès',
      data: result,
    };
  }
  

  @Delete(':id')
async deleteProduct(@Param('id', ParseIntPipe) id: number) {
  try {
    await this.productService.deleteProduct(id);
    return {
      message: 'Produit supprimé avec succès',
      id,
    };
  } catch (error) {
    throw error;
  }
}








  // Obtenir le stock d’un produit
//@Get(':id/stock')
//async getStock(@Param('id') id: number) {
  //return this.productService.getStock(+id);
//}

// Ajouter du stock (ex: lors d’une livraison)
//@Post(':id/stock')
//async addStock(
  //@Param('id') id: number,
  //@Body('quantity') quantity: number
//) {
  //return this.productService.addStock(+id, quantity);
//}




// Lire le stock actuel
//async getStock(id: number) {
 // const product = await this.prisma.product.findUnique({
 //   where: { id },
 //   select: { stock: true },
 // });
//
 // if (!product) throw new NotFoundException('Produit introuvable');
 // return { stock: product.stock };
//}

// Ajouter une quantité au stock existant
//async addStock(id: number, quantity: number) {
//  const product = await this.prisma.product.findUnique({ where: { id } });

 // if (!product) throw new NotFoundException('Produit introuvable');

  //return this.prisma.product.update({
  //  where: { id },
  //  data: {
  //    stock: product.stock + quantity,
  //  },
  //});
//}


 // @Put(':id/stock')
 // async updateStock(
 //   @Param('id') id: number,
 //   @Body('stock') stock: number,
//  ) {
 //   return this.productService.updateStock(id, stock);
 // }
  


}