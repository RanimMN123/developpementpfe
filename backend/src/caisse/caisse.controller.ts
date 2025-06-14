import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CaisseService } from './caisse.service';

@Controller('caisse')
export class CaisseController {
  constructor(private readonly caisseService: CaisseService) {}

  // POST /caisse/ouvrir - Ouvrir une nouvelle session de caisse
  @Post('ouvrir')
  async ouvrirSession(@Body() data: { userId: number }) {
    return this.caisseService.ouvrirSession(data);
  }

  // GET /caisse/session-active/:userId - Obtenir la session active d'un utilisateur
  @Get('session-active/:userId')
  async getSessionActive(@Param('userId', ParseIntPipe) userId: number) {
    return this.caisseService.getSessionActive(userId);
  }

  // PUT /caisse/fermer/:sessionId - Fermer une session de caisse
  @Put('fermer/:sessionId')
  async fermerSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Body() data: any,
  ) {
    return this.caisseService.fermerSession(sessionId, data);
  }

  // GET /caisse/ventes-du-jour/:userId - Obtenir les ventes du jour (sans session)
  @Get('ventes-du-jour/:userId')
  async getVentesDuJour(@Param('userId', ParseIntPipe) userId: number) {
    return this.caisseService.getVentesDuJour(userId);
  }

  // GET /caisse/statistiques-du-jour/:userId - Calculer les statistiques du jour
  @Get('statistiques-du-jour/:userId')
  async getStatistiquesDuJour(@Param('userId', ParseIntPipe) userId: number) {
    return this.caisseService.getStatistiquesDuJour(userId);
  }

  // 🎯 NOUVEAUX ENDPOINTS POUR LES VENTES AUTOMATIQUES

  // GET /caisse/ventes-automatiques/:userId - Obtenir les ventes automatiques
  @Get('ventes-automatiques/:userId')
  async getVentesAutomatiques(@Param('userId', ParseIntPipe) userId: number) {
    return this.caisseService.getVentesEnCaisse(userId);
  }

  // GET /caisse/statistiques-completes/:userId - Statistiques incluant les ventes automatiques
  @Get('statistiques-completes/:userId')
  async getStatistiquesCompletes(@Param('userId', ParseIntPipe) userId: number) {
    return this.caisseService.getStatistiquesAvecVentesAutomatiques(userId);
  }

  // POST /caisse/enregistrer-vente - Enregistrer manuellement une vente
  @Post('enregistrer-vente')
  async enregistrerVenteManuelle(@Body() data: {
    orderId: number;
    userId: number;
    montant: number;
    methodePaiement?: string;
  }) {
    return this.caisseService.enregistrerVenteAutomatique(
      data.orderId,
      data.userId,
      data.montant,
      data.methodePaiement || 'ESPECE'
    );
  }
}
