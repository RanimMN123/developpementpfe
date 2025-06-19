'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useSecureForm } from '../hooks/useSecureApi';

interface SecureFormProps {
  onSubmit: (data: Record<string, any>) => Promise<any>;
  children: React.ReactNode;
  className?: string;
  showSecurityStatus?: boolean;
  enableCsrfProtection?: boolean;
  validateOnSubmit?: boolean;
  sanitizeOnSubmit?: boolean;
}

interface SecurityStatus {
  isSecure: boolean;
  hasCsrfToken: boolean;
  message: string;
  level: 'success' | 'warning' | 'error';
}

export const SecureForm: React.FC<SecureFormProps> = ({
  onSubmit,
  children,
  className = '',
  showSecurityStatus = true,
  enableCsrfProtection = true,
  validateOnSubmit = true,
  sanitizeOnSubmit = true,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    isSecure: false,
    hasCsrfToken: false,
    message: 'Initialisation...',
    level: 'warning'
  });

  const secureApi = useSecureForm({
    enableCsrf: enableCsrfProtection,
    validateInput: validateOnSubmit,
    sanitizeInput: sanitizeOnSubmit,
    onSuccess: () => {
      setSubmitSuccess(true);
      setSubmitError(null);
      setTimeout(() => setSubmitSuccess(false), 3000);
    },
    onError: (error) => {
      setSubmitError(error);
      setSubmitSuccess(false);
    }
  });

  // Mettre à jour le statut de sécurité
  const updateSecurityStatus = useCallback(() => {
    const hasCsrfToken = secureApi.hasCsrfToken;
    
    if (!enableCsrfProtection) {
      setSecurityStatus({
        isSecure: true,
        hasCsrfToken: false,
        message: 'Formulaire sécurisé (CSRF désactivé)',
        level: 'success'
      });
    } else if (hasCsrfToken) {
      setSecurityStatus({
        isSecure: true,
        hasCsrfToken: true,
        message: 'Formulaire sécurisé avec protection CSRF',
        level: 'success'
      });
    } else {
      setSecurityStatus({
        isSecure: false,
        hasCsrfToken: false,
        message: 'Token CSRF manquant - Récupération en cours...',
        level: 'warning'
      });
    }
  }, [secureApi.hasCsrfToken, enableCsrfProtection]);

  // Initialiser et surveiller le statut de sécurité
  useEffect(() => {
    updateSecurityStatus();
    
    // Tenter de récupérer le token CSRF si nécessaire
    if (enableCsrfProtection && !secureApi.hasCsrfToken) {
      secureApi.refreshCsrfToken().then(() => {
        updateSecurityStatus();
      }).catch(() => {
        setSecurityStatus({
          isSecure: false,
          hasCsrfToken: false,
          message: 'Impossible de récupérer le token CSRF',
          level: 'error'
        });
      });
    }
  }, [enableCsrfProtection, secureApi.hasCsrfToken, secureApi.refreshCsrfToken, updateSecurityStatus]);

  // Gérer la soumission du formulaire
  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Extraire les données du formulaire
      const formData = new FormData(event.currentTarget);
      const data: Record<string, any> = {};
      
      formData.forEach((value, key) => {
        data[key] = value.toString();
      });

      // Vérifier la sécurité avant soumission
      if (enableCsrfProtection && !secureApi.hasCsrfToken) {
        throw new Error('Token CSRF manquant. Veuillez rafraîchir la page.');
      }

      // Appeler la fonction de soumission
      await onSubmit(data);

    } catch (error: any) {
      setSubmitError(error.message || 'Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, enableCsrfProtection, secureApi.hasCsrfToken]);

  // Rendu de l'indicateur de sécurité
  const renderSecurityStatus = () => {
    if (!showSecurityStatus) return null;

    const { level, message, isSecure, hasCsrfToken } = securityStatus;
    
    const getStatusIcon = () => {
      switch (level) {
        case 'success':
          return <Shield size={16} className="text-green-500" />;
        case 'warning':
          return <AlertTriangle size={16} className="text-yellow-500" />;
        case 'error':
          return <AlertTriangle size={16} className="text-red-500" />;
      }
    };

    const getStatusClasses = () => {
      switch (level) {
        case 'success':
          return 'bg-green-50 border-green-200 text-green-800';
        case 'warning':
          return 'bg-yellow-50 border-yellow-200 text-yellow-800';
        case 'error':
          return 'bg-red-50 border-red-200 text-red-800';
      }
    };

    return (
      <div className={`flex items-center space-x-2 p-2 rounded-md border text-xs ${getStatusClasses()}`}>
        {getStatusIcon()}
        <span>{message}</span>
        {enableCsrfProtection && (
          <div className="flex items-center space-x-1 ml-auto">
            <span className="text-xs">CSRF:</span>
            {hasCsrfToken ? (
              <CheckCircle size={12} className="text-green-500" />
            ) : (
              <AlertTriangle size={12} className="text-red-500" />
            )}
          </div>
        )}
      </div>
    );
  };

  // Rendu des messages de statut
  const renderStatusMessages = () => (
    <div className="space-y-2">
      {/* Message d'erreur */}
      {submitError && (
        <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-md text-red-800 text-xs">
          <AlertTriangle size={16} />
          <span>{submitError}</span>
        </div>
      )}

      {/* Message de succès */}
      {submitSuccess && (
        <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-md text-green-800 text-xs">
          <CheckCircle size={16} />
          <span>Formulaire soumis avec succès !</span>
        </div>
      )}

      {/* Erreurs de validation du formulaire */}
      {Object.keys(secureApi.formErrors).length > 0 && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-md text-red-800 text-xs">
          <div className="font-medium mb-1">Erreurs de validation :</div>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(secureApi.formErrors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Indicateur de sécurité */}
      {renderSecurityStatus()}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
        {children}
        
        {/* Bouton de soumission */}
        <div className="flex items-center justify-between pt-3">
          <div className="flex-1">
            {renderStatusMessages()}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || (enableCsrfProtection && !secureApi.hasCsrfToken)}
            className={`ml-4 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isSubmitting || (enableCsrfProtection && !secureApi.hasCsrfToken)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <Loader2 size={16} className="animate-spin" />
                <span>Envoi...</span>
              </div>
            ) : (
              'Soumettre'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecureForm;
