import { IsInt, IsPositive, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';

export enum PaymentMethod {
  ESPECE = 'ESPECE',
  CHEQUE = 'CHEQUE', 
  CREDIT = 'CREDIT',
  TICKET_RESTO = 'TICKET_RESTO'
}

export class CreateCaisseVenteDto {
  @IsInt()
  @IsPositive()
  sessionId: number;

  @IsInt()
  @IsPositive()
  orderId: number;

  @IsNumber()
  @IsPositive()
  montant: number;

  @IsEnum(PaymentMethod)
  methodePaiement: PaymentMethod;

  @IsOptional()
  @IsNumber()
  @Min(0)
  reduction?: number;
}
