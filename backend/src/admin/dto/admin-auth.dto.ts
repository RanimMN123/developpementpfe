// admin-auth.dto.ts
import { IsString, IsEmail } from 'class-validator';

export class AdminAuthDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
