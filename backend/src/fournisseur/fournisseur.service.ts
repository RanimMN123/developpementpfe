import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFournisseurDto } from './dto/create-fournisseur.dto';
import { UpdateFournisseurDto } from './dto/update-fournisseur.dto';

@Injectable()
export class FournisseurService {
  constructor(private prisma: PrismaService) {}

  // Créer un nouveau fournisseur
  async create(createFournisseurDto: CreateFournisseurDto) {
    const { nom, adresse, numero, mail } = createFournisseurDto;

    // Vérifier si l'email existe déjà
    const existingFournisseur = await this.prisma.fournisseur.findUnique({
      where: { mail }
    });

    if (existingFournisseur) {
      throw new ConflictException('Un fournisseur avec cet email existe déjà');
    }

    return this.prisma.fournisseur.create({
      data: {
        nom,
        adresse,
        numero,
        mail
      }
    });
  }

  // Récupérer tous les fournisseurs
  async findAll() {
    return this.prisma.fournisseur.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  // Récupérer un fournisseur par ID
  async findOne(id: number) {
    const fournisseur = await this.prisma.fournisseur.findUnique({
      where: { id }
    });

    if (!fournisseur) {
      throw new NotFoundException('Fournisseur non trouvé');
    }

    return fournisseur;
  }

  // Mettre à jour un fournisseur
  async update(id: number, updateFournisseurDto: UpdateFournisseurDto) {
    // Vérifier si le fournisseur existe
    const existingFournisseur = await this.findOne(id);

    // Vérifier si l'email est déjà utilisé par un autre fournisseur
    if (updateFournisseurDto.mail && updateFournisseurDto.mail !== existingFournisseur.mail) {
      const emailExists = await this.prisma.fournisseur.findUnique({
        where: { mail: updateFournisseurDto.mail }
      });

      if (emailExists) {
        throw new ConflictException('Un fournisseur avec cet email existe déjà');
      }
    }

    return this.prisma.fournisseur.update({
      where: { id },
      data: updateFournisseurDto
    });
  }

  // Supprimer un fournisseur
  async remove(id: number) {
    // Vérifier si le fournisseur existe
    await this.findOne(id);

    return this.prisma.fournisseur.delete({
      where: { id }
    });
  }
}
