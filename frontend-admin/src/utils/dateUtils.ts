/**
 * Utilitaires pour la gestion des dates
 */

/**
 * Formate une date en format français
 * @param date - Date à formater (string, Date, ou null)
 * @returns Date formatée en français ou chaîne vide si invalide
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return '';
  }
};

/**
 * Formate une date avec l'heure en format français
 * @param date - Date à formater
 * @returns Date et heure formatées en français
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erreur lors du formatage de la date/heure:', error);
    return '';
  }
};

/**
 * Formate une date pour les inputs HTML (YYYY-MM-DD)
 * @param date - Date à formater
 * @returns Date au format YYYY-MM-DD
 */
export const formatDateForInput = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Erreur lors du formatage de la date pour input:', error);
    return '';
  }
};

/**
 * Vérifie si une date est valide
 * @param date - Date à vérifier
 * @returns true si la date est valide
 */
export const isValidDate = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(dateObj.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * Calcule la différence en jours entre deux dates
 * @param date1 - Première date
 * @param date2 - Deuxième date
 * @returns Différence en jours
 */
export const daysDifference = (date1: string | Date, date2: string | Date): number => {
  try {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    console.error('Erreur lors du calcul de la différence de dates:', error);
    return 0;
  }
};

/**
 * Obtient la date actuelle au format ISO
 * @returns Date actuelle au format ISO
 */
export const getCurrentISODate = (): string => {
  return new Date().toISOString();
};

/**
 * Obtient la date actuelle au format français
 * @returns Date actuelle formatée en français
 */
export const getCurrentFormattedDate = (): string => {
  return formatDate(new Date());
};
