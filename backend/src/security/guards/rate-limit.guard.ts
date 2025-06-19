import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import 'reflect-metadata';

// Interface pour la configuration du rate limiting
interface RateLimitConfig {
  windowMs: number; // Fenêtre de temps en millisecondes
  max: number; // Nombre maximum de requêtes
  message?: string; // Message d'erreur personnalisé
}

// Clés pour les métadonnées
export const RATE_LIMIT_KEY = 'rate-limit';
export const SKIP_RATE_LIMIT_KEY = 'skip-rate-limit';

// Décorateur pour configurer le rate limiting
export const RateLimit = (config: RateLimitConfig) =>
  (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(RATE_LIMIT_KEY, config, descriptor ? descriptor.value : target);
  };

// Décorateur pour exclure certaines routes du rate limiting
export const SkipRateLimit = () =>
  (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(SKIP_RATE_LIMIT_KEY, true, descriptor ? descriptor.value : target);
  };

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly requests = new Map<string, { count: number; resetTime: number }>();

  // Configuration par défaut
  private readonly defaultConfig: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes par fenêtre
    message: 'Trop de requêtes, veuillez réessayer plus tard',
  };

  // Configurations spécifiques par endpoint
  private readonly endpointConfigs: Map<string, RateLimitConfig> = new Map([
    ['/auth/login', { windowMs: 15 * 60 * 1000, max: 5, message: 'Trop de tentatives de connexion' }],
    ['/users/signup', { windowMs: 60 * 60 * 1000, max: 3, message: 'Trop de créations de compte' }],
    ['/users/login', { windowMs: 15 * 60 * 1000, max: 5, message: 'Trop de tentatives de connexion' }],
    ['/admin/create-admin', { windowMs: 60 * 60 * 1000, max: 1, message: 'Création d\'admin limitée' }],
  ]);

  constructor(private readonly reflector: Reflector) {
    // Nettoyer les compteurs expirés toutes les 5 minutes
    setInterval(() => this.cleanExpiredEntries(), 5 * 60 * 1000);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Vérifier si la route est exclue du rate limiting
    const skipRateLimit = this.reflector.get(SKIP_RATE_LIMIT_KEY, context.getHandler()) ||
                          this.reflector.get(SKIP_RATE_LIMIT_KEY, context.getClass());

    if (skipRateLimit) {
      return true;
    }

    // CONFIGURATION SPÉCIALE POUR APPLICATIONS MOBILES
    const userAgent = request.get('User-Agent') || '';
    const isMobileApp = userAgent.includes('okhttp') ||
                       userAgent.includes('Expo') ||
                       userAgent.includes('ReactNative') ||
                       userAgent.includes('Mobile-App');

    // Obtenir la configuration pour cette route
    const routeConfig = this.reflector.get(RATE_LIMIT_KEY, context.getHandler()) ||
                       this.reflector.get(RATE_LIMIT_KEY, context.getClass());

    let config = routeConfig ||
                 this.endpointConfigs.get(request.path) ||
                 this.defaultConfig;

    // Augmenter les limites pour les applications mobiles
    if (isMobileApp) {
      config = {
        ...config,
        max: config.max * 3, // Triple la limite pour mobile
        windowMs: config.windowMs / 2, // Réduit la fenêtre de temps
        message: 'Limite atteinte pour application mobile, veuillez patienter'
      };

      this.logger.log('Rate limiting adapté pour mobile', {
        originalMax: (routeConfig || this.endpointConfigs.get(request.path) || this.defaultConfig).max,
        newMax: config.max,
        userAgent,
        path: request.path
      });
    }

    // Identifier l'utilisateur (IP + User-Agent pour plus de précision)
    const identifier = this.getClientIdentifier(request);

    // Vérifier et mettre à jour le compteur
    const isAllowed = this.checkRateLimit(identifier, config);

    // Ajouter les headers de rate limiting
    this.addRateLimitHeaders(response, identifier, config);

    if (!isAllowed) {
      this.logger.warn('Rate limit dépassé', {
        identifier,
        path: request.path,
        method: request.method,
        ip: request.ip,
        userAgent: request.get('User-Agent'),
      });

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: config.message || this.defaultConfig.message,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getClientIdentifier(request: any): string {
    // Utiliser l'ID utilisateur si disponible (pour les utilisateurs authentifiés)
    if (request.user && request.user.id) {
      return `user:${request.user.id}`;
    }

    // Sinon utiliser IP + User-Agent
    const ip = request.ip || request.connection.remoteAddress || 'unknown';
    const userAgent = request.get('User-Agent') || 'unknown';
    
    return `ip:${ip}:${Buffer.from(userAgent).toString('base64').substring(0, 20)}`;
  }

  private checkRateLimit(identifier: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Obtenir ou créer l'entrée pour cet identifiant
    let entry = this.requests.get(identifier);

    if (!entry || entry.resetTime <= now) {
      // Créer une nouvelle entrée ou réinitialiser
      entry = {
        count: 1,
        resetTime: now + config.windowMs,
      };
      this.requests.set(identifier, entry);
      return true;
    }

    // Incrémenter le compteur
    entry.count++;

    // Vérifier si la limite est dépassée
    return entry.count <= config.max;
  }

  private addRateLimitHeaders(response: any, identifier: string, config: RateLimitConfig): void {
    const entry = this.requests.get(identifier);
    
    if (entry) {
      const remaining = Math.max(0, config.max - entry.count);
      const resetTime = Math.ceil(entry.resetTime / 1000);

      response.setHeader('X-RateLimit-Limit', config.max);
      response.setHeader('X-RateLimit-Remaining', remaining);
      response.setHeader('X-RateLimit-Reset', resetTime);
      response.setHeader('X-RateLimit-Window', config.windowMs / 1000);
    }
  }

  private cleanExpiredEntries(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [identifier, entry] of this.requests.entries()) {
      if (entry.resetTime <= now) {
        this.requests.delete(identifier);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`Nettoyage de ${cleanedCount} entrées de rate limiting expirées`);
    }
  }

  // Méthodes utilitaires pour les tests et la gestion

  /**
   * Obtenir les statistiques actuelles pour un identifiant
   */
  getStats(identifier: string): { count: number; resetTime: number } | null {
    return this.requests.get(identifier) || null;
  }

  /**
   * Réinitialiser le compteur pour un identifiant
   */
  resetCounter(identifier: string): void {
    this.requests.delete(identifier);
  }

  /**
   * Obtenir le nombre total d'entrées actives
   */
  getActiveEntriesCount(): number {
    return this.requests.size;
  }

  /**
   * Vider tous les compteurs (utile pour les tests)
   */
  clearAll(): void {
    this.requests.clear();
  }
}
