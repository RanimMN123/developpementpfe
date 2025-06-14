import { IsNotEmpty, IsString, IsInt, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { $Enums } from '@prisma/client';

export class CreateDeliveryPlanningDto {
  @IsInt()
  @IsNotEmpty()
  orderId: number;

  @IsInt()
  @IsNotEmpty()
  clientId: number;

  @IsDateString()
  @IsNotEmpty()
  deliveryDate: string;

  @IsString()
  @IsNotEmpty()
  deliveryTimeStart: string;

  @IsString()
  @IsNotEmpty()
  deliveryTimeEnd: string;

  @IsEnum($Enums.DeliveryStatus)
  @IsOptional()
  status?: $Enums.DeliveryStatus = $Enums.DeliveryStatus.PRETE;

  @IsString()
  @IsOptional()
  notes?: string;
}
