import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { SecurityService } from '../security/security.service';

@Controller('auth')
export class CsrfController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('csrf-token')
  getCsrfToken(@Res() res: Response) {
    try {
      // Générer un nouveau token CSRF
      const csrfToken = this.securityService.generateCsrfToken();
      
      // Stocker le token dans la session ou un store temporaire
      // Pour simplifier, on va le retourner directement
      
      return res.json({
        csrfToken,
        message: 'Token CSRF généré avec succès'
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Erreur lors de la génération du token CSRF',
        message: error.message
      });
    }
  }
}
