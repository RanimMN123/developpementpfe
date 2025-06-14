// src/admin/dto/create-product.dto.ts
import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  price: number;


  @IsNumber()
  stock: number;

  @IsOptional()
  imageUrl?: string; 


  @IsNumber()
  categoryId: number;
}
