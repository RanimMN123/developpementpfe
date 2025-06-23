import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SecurityService } from '../security.service';
import 'reflect-metadata';

// Clé pour les métadonnées
export const SKIP_CSRF_KEY = 'skip-csrf';

// Décorateur pour exclure certaines routes de la protection CSRF
export const SkipCsrf = () =>
  (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(SKIP_CSRF_KEY, true, descriptor ? descriptor.value : target);
  };

@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly logger = new Logger(CsrfGuard.name);
  private readonly csrfTokens = new Map<string, { token: string; timestamp: number }>();
  private readonly TOKEN_EXPIRY = 3600000; // 1 heure

  constructor(
    private readonly reflector: Reflector,
    private readonly securityService: SecurityService,
  ) {
    // Nettoyer les tokens expirés toutes les 10 minutes
    setInterval(() => this.cleanExpiredTokens(), 600000);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Vérifier si la route est exclue de la protection CSRF
    const skipCsrf = this.reflector.get(SKIP_CSRF_KEY, context.getHandler()) ||
                     this.reflector.get(SKIP_CSRF_KEY, context.getClass());

    if (skipCsrf) {
      return true;
    }

    // EXEMPTION POUR APPLICATIONS MOBILES
    const userAgent = request.get('User-Agent') || '';
    const isMobileApp = userAgent.includes('okhttp') ||
                       userAgent.includes('Expo') ||
                       userAgent.includes('ReactNative') ||
                       userAgent.includes('Mobile-App');

    if (isMobileApp) {
      this.logger.log('Requête mobile exemptée de CSRF', {
        userAgent,
        ip: request.ip,
        path: request.path,
        method: request.method
      });
      return true;
    }

    // Exclure les méthodes GET, HEAD, OPTIONS
    const method = request.method.toUpperCase();
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      // Générer et envoyer un token CSRF pour les requêtes GET
      this.generateAndSetCsrfToken(request, response);
      return true;
    }

    // Vérifier le token CSRF pour les autres méthodes
    return this.validateCsrfToken(request);
  }

  private generateAndSetCsrfToken(request: any, response: any): void {
    const sessionId = this.getSessionId(request);
    const token = this.securityService.generateCsrfToken();
    
    // Stocker le token avec timestamp
    this.csrfTokens.set(sessionId, {
      token,
      timestamp: Date.now(),
    });

    // Envoyer le token dans les headers de réponse
    response.setHeader('X-CSRF-Token', token);
    
    // Optionnel: envoyer aussi dans un cookie
    response.cookie('csrf-token', token, {
      httpOnly: false, // Accessible en JavaScript pour les requêtes AJAX
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: this.TOKEN_EXPIRY,
    });
  }

  private validateCsrfToken(request: any): boolean {
    const sessionId = this.getSessionId(request);
    const storedTokenData = this.csrfTokens.get(sessionId);

    if (!storedTokenData) {
      this.logger.warn('Token CSRF manquant pour la session', {
        sessionId,
        ip: request.ip,
        userAgent: request.get('User-Agent'),
        path: request.path,
      });
      throw new ForbiddenException('Token CSRF manquant');
    }

    // Vérifier l'expiration du token
    if (Date.now() - storedTokenData.timestamp > this.TOKEN_EXPIRY) {
      this.csrfTokens.delete(sessionId);
      this.logger.warn('Token CSRF expiré', {
        sessionId,
        ip: request.ip,
        path: request.path,
      });
      throw new ForbiddenException('Token CSRF expiré');
    }

    // Récupérer le token depuis les headers ou le body
    const clientToken = this.extractCsrfToken(request);

    if (!clientToken) {
      this.logger.warn('Token CSRF non fourni', {
        sessionId,
        ip: request.ip,
        userAgent: request.get('User-Agent'),
        path: request.path,
      });
      throw new ForbiddenException('Token CSRF requis');
    }

    // Valider le token
    if (!this.securityService.validateCsrfToken(clientToken, storedTokenData.token)) {
      this.logger.warn('Token CSRF invalide', {
        sessionId,
        ip: request.ip,
        userAgent: request.get('User-Agent'),
        path: request.path,
        providedToken: clientToken.substring(0, 8) + '...',
      });
      throw new ForbiddenException('Token CSRF invalide');
    }

    return true;
  }

  private extractCsrfToken(request: any): string | null {
    // Chercher le token dans les headers
    let token = request.get('X-CSRF-Token') || 
                request.get('X-Requested-With-Token') ||
                request.get('csrf-token');

    // Chercher dans le body
    if (!token && request.body) {
      token = request.body._csrf || request.body.csrfToken;
    }

    // Chercher dans les cookies
    if (!token && request.cookies) {
      token = request.cookies['csrf-token'];
    }

    return token;
  }

  private getSessionId(request: any): string {
    // Utiliser l'ID de session ou créer un identifiant basé sur l'IP et User-Agent
    if (request.session && request.session.id) {
      return request.session.id;
    }

    // Fallback: utiliser une combinaison IP + User-Agent
    const ip = request.ip || request.connection.remoteAddress;
    const userAgent = request.get('User-Agent') || 'unknown';
    
    return Buffer.from(`${ip}:${userAgent}`).toString('base64');
  }

  private cleanExpiredTokens(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, tokenData] of this.csrfTokens.entries()) {
      if (now - tokenData.timestamp > this.TOKEN_EXPIRY) {
        this.csrfTokens.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`Nettoyage de ${cleanedCount} tokens CSRF expirés`);
    }
  }

  // Méthode pour obtenir le token CSRF actuel (utile pour les tests)
  getCsrfToken(sessionId: string): string | null {
    const tokenData = this.csrfTokens.get(sessionId);
    return tokenData ? tokenData.token : null;
  }

  // Méthode pour invalider un token CSRF
  invalidateCsrfToken(sessionId: string): void {
    this.csrfTokens.delete(sessionId);
  }
}
