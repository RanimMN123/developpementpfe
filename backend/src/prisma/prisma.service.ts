
import { Injectable, OnModuleInit, OnModuleDestroy, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  // Cette méthode est exécutée lorsqu'un module est initialisé
  async onModuleInit() {
    await this.$connect(); // Connexion à la base de données au démarrage
    console.log('Prisma connected to database');
  }

  // Cette méthode est exécutée lorsque le module est détruit
  async onModuleDestroy() {
    await this.$disconnect(); // Déconnexion propre de la base de données lorsque le module est détruit
    console.log('Prisma disconnected from database');
  }

  
  // méthode pour vérifier la connexion à la base de données :
  async checkConnection() {
    try {
      await this.$queryRaw`SELECT 1`; // Vérifie la connexion en effectuant une requête simple
      console.log('Database connection is active');
    } catch (error) {
      console.error('Database connection error', error);
    }
  }
}
