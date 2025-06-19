import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
  Logger,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RateLimit, RateLimitGuard } from '../security/guards/rate-limit.guard';
import { XssProtectionInterceptor } from '../security/interceptors/xss-protection.interceptor';
import { SkipCsrf } from '../security/guards/csrf.guard';
import { IsEmail, IsString, IsNotEmpty, Length } from 'class-validator';

// DTO sécurisé pour la connexion
class SecureLoginDto {
  @IsEmail({}, { message: 'Format d\'email invalide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  @Length(5, 254, { message: 'L\'email doit contenir entre 5 et 254 caractères' })
  email: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @Length(1, 128, { message: 'Le mot de passe ne doit pas dépasser 128 caractères' })
  password: string;
}

@Controller('auth')
@UseInterceptors(XssProtectionInterceptor)
@UseGuards(RateLimitGuard)
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @SkipCsrf() // Skip CSRF pour la connexion (utilise rate limiting à la place)
  @RateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Trop de tentatives de connexion' })
  async login(@Body(new ValidationPipe({ transform: true })) loginDto: SecureLoginDto) {
    const { email, password } = loginDto;

    this.logger.log(`Tentative de connexion pour: ${email}`);

    try {
      const admin = await this.authService.validateAdmin(email, password);

      if (!admin) {
        this.logger.warn(`Échec de connexion pour: ${email}`);
        throw new UnauthorizedException('Identifiants invalides');
      }

      this.logger.log(`Connexion réussie pour: ${email}`);
      return this.authService.login(admin);
    } catch (error) {
      this.logger.error(`Erreur lors de la connexion pour ${email}:`, error.message);
      throw new UnauthorizedException('Identifiants invalides');
    }
  }
}
