import { IsNumber, IsOptional, Min } from 'class-validator';

export class CloseCaisseSessionDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalEspeceReel?: number; // Montant réel compté en espèces

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalChequeReel?: number; // Montant réel compté en chèques

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalCreditReel?: number; // Montant réel compté en crédit

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalTicketRestoReel?: number; // Montant réel compté en tickets resto
}
