'use client';

import { useState, useCallback, useEffect } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuth } from './useAuth';
import { securityManager, validateFormData } from '../utils/security';

interface SecureApiCallState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseSecureApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  validateInput?: boolean;
  sanitizeInput?: boolean;
  enableCsrf?: boolean;
}

export const useSecureApi = <T = any>(options?: UseSecureApiOptions) => {
  const { token, isAuthenticated } = useAuth();
  const [state, setState] = useState<SecureApiCallState<T>>({
    data: null,
    isLoading: false,
    error: null
  });

  // Configuration par défaut
  const config = {
    validateInput: true,
    sanitizeInput: true,
    enableCsrf: true,
    ...options
  };

  // Initialiser le token CSRF au montage du composant
  useEffect(() => {
    if (config.enableCsrf && isAuthenticated) {
      securityManager.fetchCsrfToken().catch(error => {
        console.warn('Impossible de récupérer le token CSRF:', error);
      });
    }
  }, [isAuthenticated, config.enableCsrf]);

  const makeSecureRequest = useCallback(async (
    url: string,
    requestConfig?: AxiosRequestConfig,
    inputData?: Record<string, any>
  ): Promise<T | null> => {
    // Vérification de l'authentification
    if (!isAuthenticated || !token) {
      const errorMsg = 'Non authentifié. Veuillez vous reconnecter.';
      setState({
        data: null,
        isLoading: false,
        error: errorMsg
      });
      config.onError?.(errorMsg);
      return null;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      let processedData = inputData;

      // Validation et sanitisation des données d'entrée
      if (inputData && (config.validateInput || config.sanitizeInput)) {
        const validation = validateFormData(inputData);
        
        if (!validation.isValid) {
          const errorMsg = `Données invalides: ${validation.errors.join(', ')}`;
          setState({
            data: null,
            isLoading: false,
            error: errorMsg
          });
          config.onError?.(errorMsg);
          return null;
        }

        if (config.sanitizeInput) {
          processedData = validation.sanitizedData;
        }
      }

      // Préparer les headers sécurisés
      const baseHeaders: Record<string, string> = {};

      // Copier les headers de config en s'assurant qu'ils sont des strings
      if (requestConfig?.headers) {
        Object.entries(requestConfig.headers).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            baseHeaders[key] = value;
          }
        });
      }

      // Ajouter l'Authorization seulement si le token existe
      if (token) {
        baseHeaders['Authorization'] = `Bearer ${token}`;
      }

      const secureHeaders = securityManager.getSecureHeaders(baseHeaders);

      // Configuration de la requête
      const finalConfig: AxiosRequestConfig = {
        url,
        method: requestConfig?.method || 'GET',
        headers: secureHeaders,
        data: processedData,
        timeout: 30000, // Timeout de 30 secondes
        withCredentials: true, // Pour les cookies CSRF
        ...requestConfig
      };

      // Exécuter la requête
      const response: AxiosResponse<T> = await axios(finalConfig);

      // Extraire et stocker le token CSRF de la réponse si présent
      if (config.enableCsrf) {
        const csrfToken = response.headers['x-csrf-token'] || response.headers['X-CSRF-Token'];
        if (csrfToken) {
          securityManager.setCsrfToken(csrfToken);
        }
      }

      setState({
        data: response.data,
        isLoading: false,
        error: null
      });

      config.onSuccess?.(response.data);
      return response.data;

    } catch (error: any) {
      let errorMessage = 'Une erreur est survenue';

      if (error.response) {
        // Erreur de réponse du serveur
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 400:
            errorMessage = data?.message || 'Données invalides';
            break;
          case 401:
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
            break;
          case 403:
            errorMessage = data?.message || 'Accès refusé. Token CSRF invalide ou manquant.';
            // Tenter de récupérer un nouveau token CSRF
            if (config.enableCsrf) {
              securityManager.fetchCsrfToken();
            }
            break;
          case 429:
            errorMessage = 'Trop de requêtes. Veuillez patienter.';
            break;
          case 500:
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
            break;
          default:
            errorMessage = data?.message || `Erreur ${status}`;
        }
      } else if (error.request) {
        // Erreur de réseau
        errorMessage = 'Erreur de connexion. Vérifiez votre réseau.';
      } else {
        // Autre erreur
        errorMessage = error.message || 'Erreur inconnue';
      }

      setState({
        data: null,
        isLoading: false,
        error: errorMessage
      });

      config.onError?.(errorMessage);
      console.error('Erreur API sécurisée:', error);
      return null;
    }
  }, [token, isAuthenticated, config]);

  // Méthodes spécialisées pour différents types de requêtes
  const get = useCallback((url: string, requestConfig?: AxiosRequestConfig) => {
    return makeSecureRequest(url, { ...requestConfig, method: 'GET' });
  }, [makeSecureRequest]);

  const post = useCallback((url: string, data?: Record<string, any>, requestConfig?: AxiosRequestConfig) => {
    return makeSecureRequest(url, { ...requestConfig, method: 'POST' }, data);
  }, [makeSecureRequest]);

  const put = useCallback((url: string, data?: Record<string, any>, requestConfig?: AxiosRequestConfig) => {
    return makeSecureRequest(url, { ...requestConfig, method: 'PUT' }, data);
  }, [makeSecureRequest]);

  const patch = useCallback((url: string, data?: Record<string, any>, requestConfig?: AxiosRequestConfig) => {
    return makeSecureRequest(url, { ...requestConfig, method: 'PATCH' }, data);
  }, [makeSecureRequest]);

  const del = useCallback((url: string, requestConfig?: AxiosRequestConfig) => {
    return makeSecureRequest(url, { ...requestConfig, method: 'DELETE' });
  }, [makeSecureRequest]);

  // Fonction pour rafraîchir le token CSRF
  const refreshCsrfToken = useCallback(async () => {
    if (config.enableCsrf) {
      return await securityManager.fetchCsrfToken();
    }
    return null;
  }, [config.enableCsrf]);

  // Fonction pour valider des données sans faire de requête
  const validateData = useCallback((data: Record<string, any>) => {
    return validateFormData(data);
  }, []);

  return {
    // État
    ...state,
    
    // Méthodes de requête
    makeSecureRequest,
    get,
    post,
    put,
    patch,
    delete: del,
    
    // Utilitaires
    refreshCsrfToken,
    validateData,
    
    // Informations de sécurité
    hasCsrfToken: !!securityManager.getCsrfToken(),
    securityConfig: config,
  };
};

// Hook spécialisé pour les formulaires sécurisés
export const useSecureForm = <T = any>(options?: UseSecureApiOptions) => {
  const secureApi = useSecureApi<T>(options);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const submitForm = useCallback(async (
    url: string,
    formData: Record<string, any>,
    method: 'POST' | 'PUT' | 'PATCH' = 'POST'
  ) => {
    // Réinitialiser les erreurs
    setFormErrors({});

    // Valider les données
    const validation = secureApi.validateData(formData);
    if (!validation.isValid) {
      const errors: Record<string, string> = {};
      validation.errors.forEach(error => {
        const field = error.split('"')[1] || 'general';
        errors[field] = error;
      });
      setFormErrors(errors);
      return null;
    }

    // Soumettre le formulaire
    switch (method) {
      case 'POST':
        return await secureApi.post(url, formData);
      case 'PUT':
        return await secureApi.put(url, formData);
      case 'PATCH':
        return await secureApi.patch(url, formData);
      default:
        return await secureApi.post(url, formData);
    }
  }, [secureApi]);

  return {
    ...secureApi,
    formErrors,
    setFormErrors,
    submitForm,
  };
};
