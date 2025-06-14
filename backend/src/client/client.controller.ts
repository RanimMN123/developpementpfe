import { Controller, Post, Body, Get, Param, Put, ParseIntPipe, Delete, UseGuards, Request } from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from '../admin/dto/create-client.dto';
import { Client } from '@prisma/client';  // Ajoute cette importation
import { NotFoundException } from '@nestjs/common'; // Importation de NotFoundException
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/clients')  // Le décorateur définissant la route
@UseGuards(JwtAuthGuard)  // Protection par JWT
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post()  // Cette méthode gère les requêtes POST pour ajouter un client
  async create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);  // Appel au service pour créer un client
  }
  @Get()
  async getClients(@Request() req) {
    return this.clientService.findAllByUser(req.user.id); // Récupérer les clients de l'utilisateur connecté
  }
  @Get(':id')
  async getClientById(@Param('id') id: number): Promise<Client> {
    try {
      // Appel de la méthode du service pour récupérer le client
      const client = await this.clientService.findOne(id);
      
      // Vérifier si un client a été trouvé, sinon lancer une exception
      if (!client) {
        throw new NotFoundException(`Client avec l'ID ${id} non trouvé.`);
      }
      
      return client;
    } catch (error) {
      console.error('Erreur dans le contrôleur:', error);
      throw error; // Re-throw l'erreur pour qu'elle soit traitée globalement
    }
  }

  // ✅ Méthode pour mettre à jour un client
  @Put(':id')
  async updateClient(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: Partial<CreateClientDto>,
  ) {
    return this.clientService.update(id, updateClientDto);
  }

  // ✅ Méthode pour supprimer un client
  @Delete(':id')
  async deleteClient(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.delete(id);
  }

  
}  
