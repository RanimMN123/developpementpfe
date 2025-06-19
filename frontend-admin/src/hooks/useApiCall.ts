'use client';

import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { useAuth } from './useAuth';
import { securityManager, validateFormData } from '../utils/security';

interface ApiCallState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiCallOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export const useApiCall = <T = any>(options?: UseApiCallOptions) => {
  const { token, isAuthenticated } = useAuth();
  const [state, setState] = useState<ApiCallState<T>>({
    data: null,
    isLoading: false,
    error: null
  });

  const makeRequest = useCallback(async (
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T | null> => {
    if (!isAuthenticated || !token) {
      const errorMsg = 'Non authentifié. Veuillez vous reconnecter.';
      setState({
        data: null,
        isLoading: false,
        error: errorMsg
      });
      options?.onError?.(errorMsg);
      return null;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      // Validation et sanitisation des données si présentes
      let processedData = config?.data;
      if (processedData && typeof processedData === 'object') {
        const validation = validateFormData(processedData);
        if (!validation.isValid) {
          const errorMsg = `Données invalides: ${validation.errors.join(', ')}`;
          setState({
            data: null,
            isLoading: false,
            error: errorMsg
          });
          options?.onError?.(errorMsg);
          return null;
        }
        processedData = validation.sanitizedData;
      }

      // Préparer les headers sécurisés
      const baseHeaders: Record<string, string> = {};

      // Copier les headers de config en s'assurant qu'ils sont des strings
      if (config?.headers) {
        Object.entries(config.headers).forEach(([key, value]) => {
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

      const response = await axios({
        url,
        method: config?.method || 'GET',
        headers: secureHeaders,
        data: processedData,
        withCredentials: true, // Pour les cookies CSRF
        timeout: 30000, // Timeout de 30 secondes
        ...config
      });

      // Extraire et stocker le token CSRF de la réponse si présent
      const csrfToken = response.headers['x-csrf-token'];
      if (csrfToken) {
        securityManager.setCsrfToken(csrfToken);
      }

      setState({
        data: response.data,
        isLoading: false,
        error: null
      });

      options?.onSuccess?.(response.data);
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
            securityManager.fetchCsrfToken();
            break;
          case 404:
            errorMessage = 'Ressource non trouvée.';
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
        errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
      } else {
        // Autre erreur
        errorMessage = error.message || 'Une erreur inattendue est survenue';
      }

      console.error('Erreur API:', error);

      setState({
        data: null,
        isLoading: false,
        error: errorMessage
      });

      options?.onError?.(errorMessage);
      return null;
    }
  }, [token, isAuthenticated, options]);

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    makeRequest,
    reset
  };
};

export default useApiCall;
