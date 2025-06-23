import { Injectable } from '@nestjs/common';

@Injectable()
export class SecurityService {
  
  /**
   * Sanitise une chaîne de caractères pour prévenir les attaques XSS
   */
  sanitizeString(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Ne pas encoder les URLs d'images (chemins vers /public/images/ ou http://localhost:3000/public/images/)
    if (input.includes('/public/images/') || input.includes('public/images/')) {
      // Pour les URLs d'images, on fait juste un nettoyage minimal sans encoder les slashes
      return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/`/g, '&#96;');
    }

    // Ne pas encoder les dates ISO (format: YYYY-MM-DDTHH:mm:ss.sssZ ou YYYY-MM-DD HH:mm:ss)
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,  // ISO format
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,              // SQL datetime format
      /^\d{4}-\d{2}-\d{2}$/,                                 // Date only format
    ];

    if (datePatterns.some(pattern => pattern.test(input))) {
      // Pour les dates, on fait juste un nettoyage minimal
      return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/`/g, '&#96;');
    }

    // Échapper les caractères dangereux pour les autres strings
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/\\/g, '&#x5C;')
      .replace(/`/g, '&#96;')
      .replace(/=/g, '&#x3D;');
  }

  /**
   * Sanitise un objet récursivement
   */
  sanitizeObject(obj: any, parentKey: string = '', visited = new WeakSet()): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Éviter la récursion infinie
    if (typeof obj === 'object' && visited.has(obj)) {
      return obj;
    }

    if (typeof obj === 'string') {
      // Ne pas sanitiser les URLs, images, dates, et mots de passe hashés
      if (this.shouldSkipSanitization(parentKey, obj)) {
        return obj;
      }
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      visited.add(obj);
      const result = obj.map(item => this.sanitizeObject(item, parentKey, visited));
      visited.delete(obj);
      return result;
    }

    if (typeof obj === 'object') {
      visited.add(obj);
      const sanitized: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitized[key] = this.sanitizeObject(obj[key], key, visited);
        }
      }
      visited.delete(obj);
      return sanitized;
    }

    return obj;
  }

  /**
   * Détermine si un champ doit être exclu de la sanitisation
   */
  private shouldSkipSanitization(key: string, value: any): boolean {
    // Exclure les champs d'images et URLs
    const imageFields = ['image', 'imageUrl', 'avatar', 'photo', 'picture', 'url', 'href', 'src'];
    if (imageFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      return true;
    }

    // Exclure les champs de dates
    const dateFields = ['date', 'createdAt', 'updatedAt', 'timestamp', 'time'];
    if (dateFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      return true;
    }

    // Exclure les mots de passe hashés
    if (key.toLowerCase().includes('password') && typeof value === 'string' && value.startsWith('$2b$')) {
      return true;
    }

    // Exclure les valeurs qui ressemblent à des URLs
    if (typeof value === 'string' && (
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('/public/') ||
      value.startsWith('/images/') ||
      value.includes('localhost:3000')
    )) {
      return true;
    }

    return false;
  }

  /**
   * Valide et nettoie les noms de fichiers
   */
  sanitizeFileName(fileName: string): string {
    if (!fileName) return '';
    
    // Supprimer les caractères dangereux
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .replace(/\.{2,}/g, '.')
      .substring(0, 255);
  }

  /**
   * Valide les types MIME autorisés pour les uploads
   */
  isAllowedMimeType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimeType);
  }

  /**
   * Génère un token CSRF
   */
  generateCsrfToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }



  /**
   * Valide un token CSRF
   */
  validateCsrfToken(token: string, sessionToken: string): boolean {
    return token === sessionToken && token.length === 32;
  }

  /**
   * Valide les headers de sécurité
   */
  validateSecurityHeaders(headers: any): boolean {
    // Vérifier la présence des headers de sécurité requis
    const requiredHeaders = ['user-agent', 'accept'];
    
    for (const header of requiredHeaders) {
      if (!headers[header]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Détecte les tentatives d'injection SQL basiques
   */
  detectSqlInjection(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(--|\/\*|\*\/|;|'|")/,
      /(\bOR\b|\bAND\b).*(\b=\b|\b<\b|\b>\b)/i,
      /(UNION.*SELECT)/i,
      /(EXEC.*xp_)/i,
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Détecte les tentatives XSS
   */
  detectXss(input: string): boolean {
    if (!input || typeof input !== 'string') {
      return false;
    }

    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]+src[^>]*>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      /expression\s*\(/gi,
      /vbscript:/gi,
      /data:text\/html/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Valide la force d'un mot de passe
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!password || password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Génère un salt pour le hashage des mots de passe
   */
  generateSalt(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Valide une adresse email
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Nettoie les données d'entrée pour les logs
   */
  sanitizeForLogging(data: any): any {
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      
      for (const field of sensitiveFields) {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      }
      
      return sanitized;
    }
    
    return data;
  }
}
