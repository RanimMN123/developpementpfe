export const SecurityConfig = {
  // Configuration JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    issuer: process.env.JWT_ISSUER || 'your-app-name',
    audience: process.env.JWT_AUDIENCE || 'your-app-users',
  },

  // Configuration CORS
  cors: {
    allowedOrigins: [
      'http://localhost:3001',
      'http://192.168.100.138:8083',
      'http://192.168.100.138:3000',
      'http://192.168.100.44:8083',
      'http://192.168.100.44:3000',
      'http://192.168.100.114:8083',
      'http://192.168.100.114:3000',
      'http://192.168.100.228:8083',
      'http://192.168.100.228:3000',
      'http://192.168.161.210:3000',
    ],
    allowedMethods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-CSRF-Token',
      'csrf-token',
    ],
    credentials: true,
    maxAge: 86400, // 24 heures
  },

  // Configuration Rate Limiting
  rateLimit: {
    // Limites par défaut
    default: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requêtes par fenêtre
      message: 'Trop de requêtes, veuillez réessayer plus tard',
    },
    
    // Limites spécifiques par endpoint
    endpoints: {
      '/auth/login': {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 tentatives
        message: 'Trop de tentatives de connexion',
      },
      '/users/signup': {
        windowMs: 60 * 60 * 1000, // 1 heure
        max: 3, // 3 créations de compte
        message: 'Trop de créations de compte',
      },
      '/users/login': {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 tentatives
        message: 'Trop de tentatives de connexion',
      },
      '/admin/create-admin': {
        windowMs: 60 * 60 * 1000, // 1 heure
        max: 1, // 1 seule création d'admin
        message: 'Création d\'admin limitée',
      },
    },
  },

  // Configuration CSRF
  csrf: {
    tokenExpiry: 3600000, // 1 heure
    cookieName: 'csrf-token',
    headerName: 'X-CSRF-Token',
    cookieOptions: {
      httpOnly: false, // Accessible en JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    },
  },

  // Configuration des uploads de fichiers
  fileUpload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ],
    allowedExtensions: [
      '.jpg',
      '.jpeg',
      '.png',
      '.gif',
      '.webp',
      '.svg',
    ],
    uploadPath: './public/images',
  },

  // Configuration des mots de passe
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  },

  // Headers de sécurité
  securityHeaders: {
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' https:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },

  // Configuration de validation
  validation: {
    // Longueurs maximales pour les champs texte
    maxLengths: {
      name: 100,
      email: 254,
      address: 200,
      phone: 20,
      description: 1000,
      comment: 500,
    },
    
    // Patterns de validation
    patterns: {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[+]?[\d\s\-\(\)]+$/,
      name: /^[a-zA-ZÀ-ÿ\s'-]+$/,
      alphanumeric: /^[a-zA-Z0-9]+$/,
      slug: /^[a-z0-9-]+$/,
    },
  },

  // Configuration de logging de sécurité
  logging: {
    logSecurityEvents: true,
    logFailedAttempts: true,
    logSuspiciousActivity: true,
    sensitiveFields: [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'csrf',
    ],
  },

  // Configuration de session
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
  },

  // Environnement
  environment: {
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test',
  },

  // Configuration de nettoyage automatique
  cleanup: {
    // Intervalle de nettoyage des tokens expirés (5 minutes)
    tokenCleanupInterval: 5 * 60 * 1000,
    
    // Intervalle de nettoyage des compteurs de rate limiting (5 minutes)
    rateLimitCleanupInterval: 5 * 60 * 1000,
    
    // Intervalle de nettoyage des logs (1 heure)
    logCleanupInterval: 60 * 60 * 1000,
  },
};

// Validation de la configuration
export function validateSecurityConfig(): void {
  const errors: string[] = [];

  // Vérifier la clé JWT
  if (SecurityConfig.jwt.secret === 'your-super-secret-jwt-key-change-in-production') {
    errors.push('JWT secret must be changed in production');
  }

  if (SecurityConfig.jwt.secret.length < 32) {
    errors.push('JWT secret should be at least 32 characters long');
  }

  // Vérifier la configuration CORS en production
  if (SecurityConfig.environment.isProduction) {
    const hasLocalhostOrigin = SecurityConfig.cors.allowedOrigins.some(
      origin => origin.includes('localhost')
    );
    
    if (hasLocalhostOrigin) {
      errors.push('Localhost origins should not be allowed in production');
    }
  }

  // Vérifier les limites de rate limiting
  if (SecurityConfig.rateLimit.default.max > 1000) {
    errors.push('Default rate limit seems too high');
  }

  if (errors.length > 0) {
    throw new Error(`Security configuration errors:\n${errors.join('\n')}`);
  }
}

export default SecurityConfig;
