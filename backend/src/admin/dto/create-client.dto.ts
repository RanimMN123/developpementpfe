import { IsString, IsInt } from 'class-validator';

export class CreateClientDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  phoneNumber: string;

  @IsInt()
  userId: number;
}
