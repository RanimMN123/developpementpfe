import { IsString, IsEmail, IsNotEmpty, Length } from 'class-validator';

export class CreateFournisseurDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  nom: string;

  @IsString()
  @IsNotEmpty()
  @Length(5, 200)
  adresse: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  numero: string;

  @IsEmail()
  @IsNotEmpty()
  mail: string;
}
