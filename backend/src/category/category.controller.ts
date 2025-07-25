import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CategoryService } from './category.service';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // Créer une catégorie avec upload d'image
  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './public/images',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(new BadRequestException('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async createCategory(
  @Body('name', new ValidationPipe({ whitelist: true })) name: string,
  @UploadedFile() file?: Express.Multer.File,
) {
  const imagePath = file ? `public/images/${file.filename}` : undefined;

  const result = await this.categoryService.createCategory(name, imagePath);

  return {
    message: 'Catégorie créée avec succès',
    data: result,
  };
}


  // Obtenir toutes les catégories
  @Get()
  async getCategories() {
    const categories = await this.categoryService.getCategories();
    return {
      message: 'Catégories récupérées avec succès',
      data: categories,
    };
  }

  // Obtenir une catégorie par ID
  @Get(':id')
  async getCategory(@Param('id', ParseIntPipe) id: number) {
    const category = await this.categoryService.getCategory(id);
    return {
      message: 'Catégorie récupérée avec succès',
      data: category,
    };
  }

  // Mettre à jour une catégorie (nom et/ou image)
  @Put(':id')
@UseInterceptors(
  FileInterceptor('image', {
    storage: diskStorage({
      destination: './public/images',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new BadRequestException('Seules les images sont autorisées !'), false);
      }
      cb(null, true);
    },
  }),
)
async updateCategory(
  @Param('id', ParseIntPipe) id: number,
  @Body('name') name?: string,
  @UploadedFile() file?: Express.Multer.File,
) {
  const image = file ? `public/images/${file.filename}` : undefined;

  const result = await this.categoryService.updateCategory(id, {
    ...(name && { name }),
    ...(image && { image }),
  });

  return {
    message: 'Catégorie mise à jour avec succès',
    data: result,
  };
}

  // Supprimer une catégorie
  @Delete(':id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    await this.categoryService.deleteCategory(id);
    return {
      message: 'Catégorie supprimée avec succès',
      id,
    };
  }
}
