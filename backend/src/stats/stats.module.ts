import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';  // Importer AuthModule ici

@Module({
  imports: [AuthModule],  // Ajout du AuthModule ici pour l'injection de AuthService
  controllers: [StatsController],
  providers: [StatsService, PrismaService],  // Assure-toi que PrismaService est bien inclus
})
export class StatsModule {}
