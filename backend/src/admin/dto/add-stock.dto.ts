// src/admin/product/dto/add-stock.dto.ts
import { IsInt, Min } from 'class-validator';

export class AddStockDto {
  @IsInt()
  productId: number;

  @IsInt()
  @Min(1, { message: 'La quantité ajoutée doit être au moins de 1' })
  quantity: number;
}
