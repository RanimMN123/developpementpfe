import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';

@Module({
    imports: [CloudinaryModule],
    controllers: [ProductController],
    providers: [ProductService, PrismaService],  // Ajoute PrismaService
  })
  export class ProductModule {}