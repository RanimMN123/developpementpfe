import { IsInt, IsPositive, IsOptional, IsDateString } from 'class-validator';

export class CreateCaisseSessionDto {
  @IsInt()
  @IsPositive()
  userId: number;

  @IsOptional()
  @IsDateString()
  dateOuverture?: string; // Format ISO string, par défaut maintenant
}
