/**
 * Utilitaires pour la gestion des images
 * Construit les URLs d'images correctement selon l'environnement
 */

// Import React pour les hooks
import React from 'react';

// Configuration de base pour les images
const IMAGE_CONFIG = {
  BASE_URL: 'http://localhost:3000', // URL du backend
  DEFAULT_IMAGE: 'https://via.placeholder.com/300x200/e5e7eb/6b7280?text=Image+non+disponible', // Image par défaut
  PLACEHOLDER: 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Chargement...', // Placeholder
};

/**
 * Construit l'URL complète d'une image
 */
export const buildImageUrl = (imagePath: string | null | undefined): string => {
  // Si pas d'image, retourner l'image par défaut
  if (!imagePath) {
    return IMAGE_CONFIG.DEFAULT_IMAGE;
  }

  // Si l'image commence déjà par http, la retourner telle quelle
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // Nettoyer le chemin d'image
  let cleanPath = imagePath.trim();

  // Cas 1: /public/images/filename.jpg (produits)
  if (cleanPath.startsWith('/public/')) {
    return `${IMAGE_CONFIG.BASE_URL}${cleanPath}`;
  }

  // Cas 2: public/images/filename.jpg (catégories)
  if (cleanPath.startsWith('public/')) {
    return `${IMAGE_CONFIG.BASE_URL}/${cleanPath}`;
  }

  // Cas 3: /images/filename.jpg
  if (cleanPath.startsWith('/images/')) {
    return `${IMAGE_CONFIG.BASE_URL}/public${cleanPath}`;
  }

  // Cas 4: images/filename.jpg
  if (cleanPath.startsWith('images/')) {
    return `${IMAGE_CONFIG.BASE_URL}/public/${cleanPath}`;
  }

  // Cas 5: filename.jpg (juste le nom de fichier)
  if (!cleanPath.includes('/')) {
    return `${IMAGE_CONFIG.BASE_URL}/public/images/${cleanPath}`;
  }

  // Cas par défaut: ajouter /public/ si nécessaire
  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }

  return `${IMAGE_CONFIG.BASE_URL}/public${cleanPath}`;
};

/**
 * Construit l'URL d'une image de produit
 */
export const buildProductImageUrl = (product: any): string => {
  return buildImageUrl(product?.image || product?.imageUrl);
};

/**
 * Construit l'URL d'une image de catégorie
 */
export const buildCategoryImageUrl = (category: any): string => {
  return buildImageUrl(category?.image || category?.imageUrl);
};

/**
 * Vérifie si une image existe
 */
export const checkImageExists = async (imageUrl: string): Promise<boolean> => {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Obtient l'URL d'image avec fallback
 */
export const getImageWithFallback = async (imagePath: string | null | undefined): Promise<string> => {
  const imageUrl = buildImageUrl(imagePath);
  
  // Vérifier si l'image existe
  const exists = await checkImageExists(imageUrl);
  
  if (exists) {
    return imageUrl;
  } else {
    // Retourner l'image par défaut si l'image n'existe pas
    return IMAGE_CONFIG.DEFAULT_IMAGE;
  }
};

/**
 * Hook React pour les images avec fallback
 */
export const useImageWithFallback = (imagePath: string | null | undefined) => {
  const [imageUrl, setImageUrl] = React.useState<string>(IMAGE_CONFIG.PLACEHOLDER);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const url = await getImageWithFallback(imagePath);
        setImageUrl(url);
      } catch (error) {
        setHasError(true);
        setImageUrl(IMAGE_CONFIG.DEFAULT_IMAGE);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [imagePath]);

  return { imageUrl, isLoading, hasError };
};

/**
 * Composant Image sécurisé avec fallback
 */
interface SecureImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallback?: string;
  onError?: () => void;
  onLoad?: () => void;
}

export const SecureImage: React.FC<SecureImageProps> = ({
  src,
  alt,
  className = '',
  fallback = IMAGE_CONFIG.DEFAULT_IMAGE,
  onError,
  onLoad,
}) => {
  const [currentSrc, setCurrentSrc] = React.useState<string>(buildImageUrl(src));
  const [hasError, setHasError] = React.useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(fallback);
      onError?.();
    }
  };

  const handleLoad = () => {
    setHasError(false);
    onLoad?.();
  };

  // Mettre à jour l'URL quand src change
  React.useEffect(() => {
    setCurrentSrc(buildImageUrl(src));
    setHasError(false);
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
};

export default {
  buildImageUrl,
  buildProductImageUrl,
  buildCategoryImageUrl,
  checkImageExists,
  getImageWithFallback,
  useImageWithFallback,
  SecureImage,
};
