'use client';

import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig } from 'axios';
import { useAuth } from './useAuth';

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
      const response = await axios({
        url,
        method: config?.method || 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...config?.headers
        },
        ...config
      });

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
        switch (error.response.status) {
          case 401:
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
            // Optionnel: déclencher une déconnexion automatique
            break;
          case 403:
            errorMessage = 'Accès non autorisé.';
            break;
          case 404:
            errorMessage = 'Ressource non trouvée.';
            break;
          case 500:
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
            break;
          default:
            errorMessage = error.response.data?.message || 'Erreur de communication avec le serveur';
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
