import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SecurityService } from '../security.service';

@Injectable()
export class XssProtectionInterceptor implements NestInterceptor {
  private readonly logger = new Logger(XssProtectionInterceptor.name);

  constructor(private readonly securityService: SecurityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Ajouter les headers de sécurité
    this.addSecurityHeaders(response);

    // Valider et sanitiser les données d'entrée
    if (request.body) {
      this.validateAndSanitizeInput(request.body, request);
    }

    if (request.query) {
      this.validateAndSanitizeInput(request.query, request);
    }

    if (request.params) {
      this.validateAndSanitizeInput(request.params, request);
    }

    return next.handle().pipe(
      map((data) => {
        // Sanitiser les données de sortie si nécessaire
        return this.sanitizeOutput(data);
      }),
    );
  }

  private addSecurityHeaders(response: any): void {
    // Protection XSS
    response.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Prévention du sniffing MIME
    response.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Protection contre le clickjacking
    response.setHeader('X-Frame-Options', 'DENY');
    
    // Content Security Policy
    response.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self'; frame-ancestors 'none';"
    );
    
    // Strict Transport Security (HTTPS)
    response.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
    
    // Referrer Policy
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy
    response.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=()'
    );
  }

  private validateAndSanitizeInput(data: any, request: any): void {
    if (!data) return;

    // Détecter les tentatives XSS
    this.detectXssAttempts(data, request);

    // Détecter les tentatives d'injection SQL
    this.detectSqlInjectionAttempts(data, request);

    // Sanitiser les données
    this.sanitizeInputData(data);
  }

  private detectXssAttempts(data: any, request: any): void {
    const checkValue = (value: any, path: string = '') => {
      if (typeof value === 'string') {
        if (this.securityService.detectXss(value)) {
          this.logger.warn(`Tentative XSS détectée`, {
            ip: request.ip,
            userAgent: request.get('User-Agent'),
            path: request.path,
            field: path,
            value: this.securityService.sanitizeForLogging(value),
          });
          
          throw new BadRequestException(
            'Contenu non autorisé détecté. Veuillez vérifier vos données.'
          );
        }
      } else if (typeof value === 'object' && value !== null) {
        for (const key in value) {
          if (Object.prototype.hasOwnProperty.call(value, key)) {
            checkValue(value[key], path ? `${path}.${key}` : key);
          }
        }
      }
    };

    checkValue(data);
  }

  private detectSqlInjectionAttempts(data: any, request: any): void {
    const checkValue = (value: any, path: string = '') => {
      if (typeof value === 'string') {
        if (this.securityService.detectSqlInjection(value)) {
          this.logger.warn(`Tentative d'injection SQL détectée`, {
            ip: request.ip,
            userAgent: request.get('User-Agent'),
            path: request.path,
            field: path,
            value: this.securityService.sanitizeForLogging(value),
          });
          
          throw new BadRequestException(
            'Contenu non autorisé détecté. Veuillez vérifier vos données.'
          );
        }
      } else if (typeof value === 'object' && value !== null) {
        for (const key in value) {
          if (Object.prototype.hasOwnProperty.call(value, key)) {
            checkValue(value[key], path ? `${path}.${key}` : key);
          }
        }
      }
    };

    checkValue(data);
  }

  private sanitizeInputData(data: any): void {
    const sanitizeValue = (obj: any) => {
      if (typeof obj === 'string') {
        return this.securityService.sanitizeString(obj);
      } else if (Array.isArray(obj)) {
        return obj.map(item => sanitizeValue(item));
      } else if (typeof obj === 'object' && obj !== null) {
        const sanitized: any = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            sanitized[key] = sanitizeValue(obj[key]);
          }
        }
        return sanitized;
      }
      return obj;
    };

    // Appliquer la sanitisation en place
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        data[key] = sanitizeValue(data[key]);
      }
    }
  }

  private sanitizeOutput(data: any): any {
    // Sanitiser les données de sortie en excluant les champs de dates
    if (typeof data === 'object' && data !== null) {
      return this.sanitizeObjectExcludingDates(data);
    }
    return data;
  }

  private sanitizeObjectExcludingDates(obj: any, visited = new WeakSet()): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Protection contre les références circulaires
    if (typeof obj === 'object' && visited.has(obj)) {
      return obj; // Retourner l'objet tel quel pour éviter la boucle infinie
    }

    if (Array.isArray(obj)) {
      visited.add(obj);
      return obj.map(item => this.sanitizeObjectExcludingDates(item, visited));
    }

    if (typeof obj === 'object') {
      visited.add(obj);
      const sanitized: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];

          // Exclure les champs de dates de la sanitisation
          if (this.isDateField(key)) {
            sanitized[key] = value; // Garder la valeur originale
          } else if (typeof value === 'string') {
            sanitized[key] = this.securityService.sanitizeString(value);
          } else {
            sanitized[key] = this.sanitizeObjectExcludingDates(value, visited);
          }
        }
      }
      return sanitized;
    }

    return obj;
  }

  private isDateField(fieldName: string): boolean {
    const dateFields = [
      'createdAt', 'updatedAt', 'deletedAt',
      'dateCreation', 'dateModification', 'dateSuppression',
      'deliveryDate', 'deliveryTime', 'deliveryTimeStart', 'deliveryTimeEnd',
      'date', 'time', 'timestamp', 'dateVente', 'dateOuverture', 'dateFermeture'
    ];

    return dateFields.some(field =>
      fieldName.toLowerCase().includes(field.toLowerCase()) ||
      fieldName.toLowerCase().endsWith('date') ||
      fieldName.toLowerCase().endsWith('time') ||
      fieldName.toLowerCase().includes('created') ||
      fieldName.toLowerCase().includes('updated')
    );
  }
}
