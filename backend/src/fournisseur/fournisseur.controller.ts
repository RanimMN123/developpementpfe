import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request,
  ParseIntPipe,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { FournisseurService } from './fournisseur.service';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { UpdateFournisseurDto } from './dto/update-fournisseur.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/fournisseurs')
@UseGuards(JwtAuthGuard)
export class FournisseurController {
  constructor(private readonly fournisseurService: FournisseurService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createFournisseurDto: CreateFournisseurDto) {
    const fournisseur = await this.fournisseurService.create(createFournisseurDto);
    return {
      message: 'Fournisseur créé avec succès',
      fournisseur
    };
  }

  @Get()
  async findAll() {
    const fournisseurs = await this.fournisseurService.findAll();
    return {
      message: 'Fournisseurs récupérés avec succès',
      fournisseurs
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const fournisseur = await this.fournisseurService.findOne(id);
    return {
      message: 'Fournisseur récupéré avec succès',
      fournisseur
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFournisseurDto: UpdateFournisseurDto
  ) {
    const fournisseur = await this.fournisseurService.update(id, updateFournisseurDto);
    return {
      message: 'Fournisseur mis à jour avec succès',
      fournisseur
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.fournisseurService.remove(id);
    return {
      message: 'Fournisseur supprimé avec succès'
    };
  }
}
