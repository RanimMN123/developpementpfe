import { Module } from '@nestjs/common';
import { FournisseurController } from './fournisseur.controller';
import { FournisseurService } from './fournisseur.service';
import { PrismaModule } from '../prisma/PrismaModule';

@Module({
  imports: [PrismaModule],
  controllers: [FournisseurController],
  providers: [FournisseurService],
  exports: [FournisseurService],
})
export class FournisseurModule {}
