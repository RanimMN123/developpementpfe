/**
 * Utilitaires de sécurité pour le frontend admin
 * Protection XSS et gestion CSRF
 */

// Types pour la sécurité
export interface SecurityConfig {
  enableXssProtection: boolean;
  enableCsrfProtection: boolean;
  sanitizeInputs: boolean;
  logSecurityEvents: boolean;
}

// Configuration par défaut
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  enableXssProtection: true,
  enableCsrfProtection: true,
  sanitizeInputs: true,
  logSecurityEvents: true,
};

/**
 * Classe principale pour la gestion de la sécurité
 */
export class SecurityManager {
  private config: SecurityConfig;
  private csrfToken: string | null = null;

  constructor(config: SecurityConfig = DEFAULT_SECURITY_CONFIG) {
    this.config = config;
  }

  /**
   * Sanitise une chaîne de caractères pour prévenir les attaques XSS
   */
  sanitizeString(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    if (!this.config.enableXssProtection) {
      return input;
    }

    // Échapper les caractères dangereux
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
  sanitizeObject(obj: any): any {
    if (!this.config.sanitizeInputs) {
      return obj;
    }

    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Détecte les tentatives XSS dans une chaîne
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
   * Valide les données d'un formulaire
   */
  validateFormData(data: Record<string, any>): {
    isValid: boolean;
    errors: string[];
    sanitizedData: Record<string, any>;
  } {
    const errors: string[] = [];
    const sanitizedData: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Détecter XSS
        if (this.detectXss(value)) {
          errors.push(`Le champ "${key}" contient du contenu non autorisé`);
          this.logSecurityEvent('XSS_ATTEMPT', { field: key, value: value.substring(0, 50) });
        }

        // Sanitiser
        sanitizedData[key] = this.sanitizeString(value);
      } else {
        sanitizedData[key] = this.sanitizeObject(value);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData,
    };
  }

  /**
   * Gestion du token CSRF
   */
  setCsrfToken(token: string): void {
    this.csrfToken = token;
    
    // Stocker dans le localStorage pour persistance
    if (typeof window !== 'undefined') {
      localStorage.setItem('csrf-token', token);
    }
  }

  getCsrfToken(): string | null {
    // Récupérer depuis la mémoire ou le localStorage
    if (this.csrfToken) {
      return this.csrfToken;
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('csrf-token');
      if (stored) {
        this.csrfToken = stored;
        return stored;
      }
    }

    return null;
  }

  /**
   * Récupère le token CSRF depuis le serveur
   */
  async fetchCsrfToken(): Promise<string | null> {
    if (!this.config.enableCsrfProtection) {
      return null;
    }

    try {
      const response = await fetch('http://192.168.100.138:3000/health', {
        method: 'GET',
        credentials: 'include',
      });

      const csrfToken = response.headers.get('X-CSRF-Token');
      if (csrfToken) {
        this.setCsrfToken(csrfToken);
        return csrfToken;
      }

      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      this.logSecurityEvent('CSRF_TOKEN_FETCH_ERROR', { error: errorMessage });
      return null;
    }
  }

  /**
   * Prépare les headers pour une requête sécurisée
   */
  getSecureHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...additionalHeaders,
    };

    // Ajouter le token CSRF si disponible
    const csrfToken = this.getCsrfToken();
    if (csrfToken && this.config.enableCsrfProtection) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    return headers;
  }

  /**
   * Valide une adresse email
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Valide un numéro de téléphone
   */
  validatePhone(phone: string): boolean {
    const phoneRegex = /^[+]?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.length >= 8 && phone.length <= 20;
  }

  /**
   * Valide un nom (lettres, espaces, apostrophes, tirets)
   */
  validateName(name: string): boolean {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    return nameRegex.test(name) && name.length >= 2 && name.length <= 100;
  }

  /**
   * Log des événements de sécurité
   */
  private logSecurityEvent(type: string, details: any): void {
    if (!this.config.logSecurityEvents) {
      return;
    }

    const event = {
      type,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      details,
    };

    console.warn('🚨 Événement de sécurité détecté:', event);

    // En production, envoyer au serveur de logging
    if (process.env.NODE_ENV === 'production') {
      this.sendSecurityEventToServer(event);
    }
  }

  /**
   * Envoie les événements de sécurité au serveur
   */
  private async sendSecurityEventToServer(event: any): Promise<void> {
    try {
      await fetch('http://192.168.100.138:3000/api/security/events', {
        method: 'POST',
        headers: this.getSecureHeaders(),
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'événement de sécurité:', error);
    }
  }
}

// Instance globale du gestionnaire de sécurité
export const securityManager = new SecurityManager();

// Fonctions utilitaires exportées
export const sanitizeString = (input: string): string => securityManager.sanitizeString(input);
export const sanitizeObject = (obj: any): any => securityManager.sanitizeObject(obj);
export const validateFormData = (data: Record<string, any>) => securityManager.validateFormData(data);
export const detectXss = (input: string): boolean => securityManager.detectXss(input);
export const getSecureHeaders = (headers?: Record<string, string>) => securityManager.getSecureHeaders(headers);
export const validateEmail = (email: string): boolean => securityManager.validateEmail(email);
export const validatePhone = (phone: string): boolean => securityManager.validatePhone(phone);
export const validateName = (name: string): boolean => securityManager.validateName(name);

// Hook React pour la sécurité
export const useSecurity = () => {
  return {
    sanitizeString,
    sanitizeObject,
    validateFormData,
    detectXss,
    getSecureHeaders,
    validateEmail,
    validatePhone,
    validateName,
    securityManager,
  };
};
