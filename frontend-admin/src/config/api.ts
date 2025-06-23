/**
 * Configuration API pour le frontend admin
 * S'adapte automatiquement à l'environnement (développement/Docker/production)
 */

// Détection de l'environnement
const isProduction = process.env.NODE_ENV === 'production';
const isDocker = process.env.NEXT_PUBLIC_API_URL?.includes('backend:');

// Configuration de base
export const API_CONFIG = {
  // URL du backend selon l'environnement
  BASE_URL: process.env.NEXT_PUBLIC_API_URL,
  
  // Timeout pour les requêtes
  TIMEOUT: 30000,
  
  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Endpoints de l'API
export const API_ENDPOINTS = {
  // Authentification
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    CSRF_TOKEN: '/auth/csrf-token',
  },
  
  // Admin
  ADMIN: {
    PROFILE: '/admin/profile',
    CLIENTS: '/admin/clients',
    PRODUCTS: '/admin/products',
    STATS: '/admin/stats',
  },
  
  // Clients (pour les utilisateurs mobiles)
  CLIENTS: '/api/clients',
  
  // Utilisateurs
  USERS: '/users',
  
  // Commandes
  ORDERS: '/orders',
  
  // Fournisseurs
  FOURNISSEURS: '/api/fournisseurs',
  
  // Catégories
  CATEGORIES: '/test/categories',
  
  // Statistiques
  STATS: {
    ADMIN: '/api/admin/stats',
    COMMANDES: '/api/admin/commandes-stats',
    PRODUITS: '/api/admin/produits-stats',
    CLIENTS: '/api/admin/clients-stats',
  },
  
  // Santé
  HEALTH: '/health',
};

// Fonction utilitaire pour construire une URL complète
export const buildApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_CONFIG.BASE_URL}${cleanEndpoint}`;
};

// Fonction pour obtenir les headers avec authentification
export const getAuthHeaders = (): Record<string, string> => {
  const headers = { ...API_CONFIG.DEFAULT_HEADERS };
  
  // Ajouter le token d'authentification si disponible
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Configuration pour les images
export const IMAGE_CONFIG = {
  BASE_URL: API_CONFIG.BASE_URL,
  DEFAULT_IMAGE: 'https://via.placeholder.com/300x200/e5e7eb/6b7280?text=Image+non+disponible',
  PLACEHOLDER: 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Chargement...',
};

// Fonction pour construire une URL d'image
export const buildImageUrl = (imagePath: string): string => {
  if (!imagePath) return IMAGE_CONFIG.DEFAULT_IMAGE;
  if (imagePath.startsWith('http')) return imagePath;
  return `${IMAGE_CONFIG.BASE_URL}${imagePath}`;
};

// Log de la configuration (uniquement en développement)
if (!isProduction) {
  console.log('🔧 Configuration API:', {
    BASE_URL: API_CONFIG.BASE_URL,
    isProduction,
    isDocker,
    environment: process.env.NODE_ENV,
  });
}

export default {
  API_CONFIG,
  API_ENDPOINTS,
  buildApiUrl,
  getAuthHeaders,
  IMAGE_CONFIG,
  buildImageUrl,
};
