'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    isAuthenticated: false,
    isLoading: true
  });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Vérifier si nous sommes côté client
        if (typeof window === 'undefined') {
          setAuthState({
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
          return;
        }

        const token = localStorage.getItem('token');
        const adminData = localStorage.getItem('adminData');

        if (token && adminData) {
          try {
            // Vérifier si le token n'est pas expiré
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;

            if (payload.exp && payload.exp > currentTime) {
              setAuthState({
                token,
                isAuthenticated: true,
                isLoading: false
              });
            } else {
              // Token expiré
              localStorage.removeItem('token');
              localStorage.removeItem('adminData');
              setAuthState({
                token: null,
                isAuthenticated: false,
                isLoading: false
              });
              router.push('/login');
            }
          } catch (error) {
            // Token invalide
            console.error('Token invalide:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('adminData');
            setAuthState({
              token: null,
              isAuthenticated: false,
              isLoading: false
            });
            router.push('/login');
          }
        } else {
          setAuthState({
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
          router.push('/login');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        setAuthState({
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    checkAuth();

    // Écouter les changements dans le localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'adminData') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminData');
    setAuthState({
      token: null,
      isAuthenticated: false,
      isLoading: false
    });
    router.push('/login');
  };

  const refreshToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthState(prev => ({
        ...prev,
        token
      }));
    }
  };

  return {
    ...authState,
    logout,
    refreshToken
  };
};

export default useAuth;
