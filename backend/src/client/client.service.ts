import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from '../admin/dto/create-client.dto';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  // Méthode pour créer un client
  async create(createClientDto: CreateClientDto) {
    try {
      // Crée un client dans la base de données en utilisant Prisma
      return await this.prisma.client.create({
        data: {
          name: createClientDto.name,  // Nom du client
          address: createClientDto.address,  // Adresse du client
          phoneNumber: createClientDto.phoneNumber,  // Numéro de téléphone
          user: {
            connect: { id: createClientDto.userId },  // Connecte un utilisateur via l'ID
          },
        },
      });
    } catch (error) {
      // Si une erreur se produit, la loguer et la lancer sous forme d'exception
      console.error('Erreur lors de la création du client :', error);
      throw new Error(`Erreur lors de la création du client : ${error.message}`);
    }
  }
  // Méthode pour modifier un client
  async update(id: number, updateClientDto: Partial<CreateClientDto>) {
    try {
      return await this.prisma.client.update({
        where: { id },
        data: {
          ...(updateClientDto.name && { name: updateClientDto.name }),
          ...(updateClientDto.address && { address: updateClientDto.address }),
          ...(updateClientDto.phoneNumber && { phoneNumber: updateClientDto.phoneNumber }),
          ...(updateClientDto.userId && {
            user: {
              connect: { id: updateClientDto.userId },
            },
          }),
        },
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client :', error);
      throw new Error(`Erreur lors de la mise à jour du client : ${error.message}`);
    }
  }


  

  

  // Méthode pour récupérer un client par son ID
  async findOne(id: number) {
    try {
      return await this.prisma.client.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du client :', error);
      throw new Error(`Erreur lors de la récupération du client : ${error.message}`);
    }
  }

  // Méthode pour récupérer tous les clients
  async findAll() {
    return await this.prisma.client.findMany(); // Assurez-vous que 'client' est bien défini dans Prisma schema
  }

  // Méthode pour récupérer tous les clients d'un utilisateur spécifique
  async findAllByUser(userId: number) {
    return await this.prisma.client.findMany({
      where: { userId: userId }
    });
  }

  // Méthode pour supprimer un client par son ID
  async delete(id: number) {
    try {
      return await this.prisma.client.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du client :', error);
      throw new Error(`Erreur lors de la suppression du client : ${error.message}`);
    }
  }
}
