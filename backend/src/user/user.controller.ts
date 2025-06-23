import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  NotFoundException,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  Logger,
  ValidationPipe,
  HttpCode,
  HttpStatus,
  Header,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { LoginDto } from './login.dto';
import { RateLimit, RateLimitGuard } from '../security/guards/rate-limit.guard';
import { XssProtectionInterceptor } from '../security/interceptors/xss-protection.interceptor';
import { CsrfGuard, SkipCsrf } from '../security/guards/csrf.guard';
import { SecureCreateUserDto } from '../security/dto/secure-validation.dto';

@Controller('users')
@UseInterceptors(XssProtectionInterceptor)
@UseGuards(RateLimitGuard, CsrfGuard)
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Get(':id/revenue')
  @SkipCsrf() // Skip CSRF pour les revenus utilisateur
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  async getUserRevenue(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserRevenue(id);
  }

  @Get(':id/orders')
  @SkipCsrf() // Skip CSRF pour les commandes utilisateur
  @Header('Cache-Control', 'no-cache, no-store, must-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  async getOrdersByUser(@Param('id', ParseIntPipe) userId: number) {
    return this.userService.getOrdersByUser(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @SkipCsrf() // Skip CSRF pour la création d'utilisateur (temporaire)
  create(@Body() createUserDto: any) {
    this.logger.log(`Création d'un nouvel utilisateur: ${createUserDto.email}`);
    this.logger.log(`Données reçues:`, JSON.stringify(createUserDto, null, 2));

    // Validation manuelle temporaire
    if (!createUserDto.email || !createUserDto.password || !createUserDto.name) {
      throw new Error('Email, mot de passe et nom sont requis');
    }

    return this.userService.create(createUserDto);
  }

  @Get()
  @SkipCsrf() // Skip CSRF pour la liste des utilisateurs
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @SkipCsrf() // Skip CSRF pour la lecture d'un utilisateur
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }
    return user;
  }



  // Add this method to your UserController class

@Get(':id/clients')
@SkipCsrf() // Skip CSRF pour les clients utilisateur
async getClientsByUser(@Param('id', ParseIntPipe) userId: number) {
  return this.userService.getClientsByUser(userId);
}

  @Put(':id')
  @SkipCsrf() // Skip CSRF pour la modification d'utilisateur
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userService.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }
    return updatedUser;
  }

  @Delete(':id')
  @SkipCsrf() // Skip CSRF pour la suppression d'utilisateur
  async remove(@Param('id', ParseIntPipe) id: number) {
    const deletedUser = await this.userService.remove(id);
    if (!deletedUser) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }
    return { message: `Utilisateur avec l'ID ${id} supprimé` };
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @RateLimit({ windowMs: 60 * 60 * 1000, max: 3, message: 'Trop de créations de compte' })
  async signup(@Body(new ValidationPipe({ transform: true })) dto: SecureCreateUserDto) {
    this.logger.log(`Inscription d'un nouvel utilisateur: ${dto.email}`);
    return this.userService.signup(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @SkipCsrf() // Skip CSRF pour la connexion
  @RateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: 'Trop de tentatives de connexion' })
  async login(@Body(new ValidationPipe({ transform: true })) dto: LoginDto) {
    this.logger.log(`Tentative de connexion: ${dto.email}`);
    return this.userService.login(dto);
  }
}

