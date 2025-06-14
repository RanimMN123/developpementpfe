// dto/create-order.dto.ts
import { IsArray, IsInt, IsNotEmpty, IsPositive, Min, ValidateNested, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsInt()
  @IsPositive()
  clientId: number;

  @IsInt()
  @IsPositive()
  responsableId: number;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}