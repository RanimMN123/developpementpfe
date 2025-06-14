import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PrismaModule } from '../prisma/PrismaModule'; // Correction de la casse
import { ClientService } from '../client/client.service'; // ✅ Importer ClientService
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';  // Correct import path
@Module({
  imports: [
    PrismaModule, // Module Prisma
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey', // Utiliser la variable d'environnement pour la clé secrète
      signOptions: { expiresIn: '1d' }, // Expiration du token JWT
    }),
  ],
  controllers: [AdminController],
  providers: [
    AdminService, // Assurez-vous que AdminService est bien injecté ici
    ClientService,
    PrismaService],
  exports: [AdminService], // ✅ Exporter AdminService pour l'utiliser dans d'autres modules
})
export class AdminModule {}
