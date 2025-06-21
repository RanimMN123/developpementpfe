'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { AlertTriangle, Shield, Eye, EyeOff } from 'lucide-react';
import { useSecurity } from '../utils/security';

interface SecureInputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'textarea';
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  validateOnChange?: boolean;
  sanitizeOnChange?: boolean;
  showSecurityIndicator?: boolean;
  maxLength?: number;
  rows?: number; // Pour textarea
}

export const SecureInput: React.FC<SecureInputProps> = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  label,
  required = false,
  disabled = false,
  className = '',
  error,
  validateOnChange = true,
  sanitizeOnChange = true,
  showSecurityIndicator = true,
  maxLength,
  rows = 3,
}) => {
  const { sanitizeString, detectXss, validateEmail, validatePhone, validateName } = useSecurity();
  const [showPassword, setShowPassword] = useState(false);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const [isSecure, setIsSecure] = useState(true);

  // Validation en temps réel
  const validateInput = useCallback((inputValue: string) => {
    if (!validateOnChange || !inputValue) {
      setSecurityWarning(null);
      setIsSecure(true);
      return true;
    }

    // Détecter XSS
    if (detectXss(inputValue)) {
      setSecurityWarning('Contenu potentiellement dangereux détecté');
      setIsSecure(false);
      return false;
    }

    // Validation spécifique par type
    switch (type) {
      case 'email':
        if (!validateEmail(inputValue)) {
          setSecurityWarning('Format d\'email invalide');
          setIsSecure(false);
          return false;
        }
        break;
      case 'tel':
        if (!validatePhone(inputValue)) {
          setSecurityWarning('Format de téléphone invalide');
          setIsSecure(false);
          return false;
        }
        break;
      case 'text':
        if (name.toLowerCase().includes('nom') || name.toLowerCase().includes('name')) {
          if (!validateName(inputValue)) {
            setSecurityWarning('Le nom ne doit contenir que des lettres, espaces, apostrophes et tirets');
            setIsSecure(false);
            return false;
          }
        }
        break;
    }

    setSecurityWarning(null);
    setIsSecure(true);
    return true;
  }, [type, name, validateOnChange, detectXss, validateEmail, validatePhone, validateName]);

  // Gérer les changements de valeur
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let newValue = event.target.value;

    // Limiter la longueur si spécifiée
    if (maxLength && newValue.length > maxLength) {
      newValue = newValue.substring(0, maxLength);
    }

    // Valider
    validateInput(newValue);

    // Sanitiser si activé
    if (sanitizeOnChange && type !== 'password') {
      newValue = sanitizeString(newValue);
    }

    onChange(newValue);
  }, [onChange, sanitizeOnChange, sanitizeString, type, maxLength, validateInput]);

  // Valider à chaque changement de valeur
  useEffect(() => {
    validateInput(value);
  }, [value, validateInput]);

  // Classes CSS pour l'état de sécurité
  const getInputClasses = () => {
    const baseClasses = `w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 ${className}`;
    
    if (error || securityWarning) {
      return `${baseClasses} border-red-500 focus:ring-red-500`;
    }
    
    if (showSecurityIndicator && value && isSecure) {
      return `${baseClasses} border-green-500 focus:ring-green-500`;
    }
    
    return `${baseClasses} border-gray-300 focus:ring-blue-500`;
  };

  // Rendu du champ de saisie
  const renderInput = () => {
    const commonProps = {
      id: name,
      name,
      value,
      onChange: handleChange,
      placeholder,
      required,
      disabled,
      className: getInputClasses(),
      maxLength,
    };

    if (type === 'textarea') {
      return (
        <textarea
          {...commonProps}
          rows={rows}
        />
      );
    }

    return (
      <input
        {...commonProps}
        type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
      />
    );
  };

  return (
    <div className="space-y-1">
      {/* Label */}
      {label && (
        <label htmlFor={name} className="block text-xs font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
          {showSecurityIndicator && value && (
            <span className="ml-2">
              {isSecure ? (
                <Shield size={12} className="inline text-green-500" />
              ) : (
                <AlertTriangle size={12} className="inline text-red-500" />
              )}
            </span>
          )}
        </label>
      )}

      {/* Champ de saisie avec bouton pour mot de passe */}
      <div className="relative">
        {renderInput()}
        
        {/* Bouton pour afficher/masquer le mot de passe */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff size={16} className="text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye size={16} className="text-gray-400 hover:text-gray-600" />
            )}
          </button>
        )}
      </div>

      {/* Compteur de caractères */}
      {maxLength && (
        <div className="text-xs text-gray-500 text-right">
          {value.length}/{maxLength}
        </div>
      )}

      {/* Messages d'erreur et d'avertissement */}
      {(error || securityWarning) && (
        <div className="flex items-center space-x-1 text-xs text-red-600">
          <AlertTriangle size={12} />
          <span>{error || securityWarning}</span>
        </div>
      )}

      {/* Indicateur de sécurité positif */}
      {showSecurityIndicator && value && isSecure && !error && !securityWarning && (
        <div className="flex items-center space-x-1 text-xs text-green-600">
          <Shield size={12} />
          <span>Saisie sécurisée</span>
        </div>
      )}
    </div>
  );
};

// Composant spécialisé pour les emails
export const SecureEmailInput: React.FC<Omit<SecureInputProps, 'type'>> = (props) => (
  <SecureInput {...props} type="email" />
);

// Composant spécialisé pour les mots de passe
export const SecurePasswordInput: React.FC<Omit<SecureInputProps, 'type'>> = (props) => (
  <SecureInput {...props} type="password" />
);

// Composant spécialisé pour les téléphones
export const SecurePhoneInput: React.FC<Omit<SecureInputProps, 'type'>> = (props) => (
  <SecureInput {...props} type="tel" />
);

// Composant spécialisé pour les zones de texte
export const SecureTextarea: React.FC<Omit<SecureInputProps, 'type'>> = (props) => (
  <SecureInput {...props} type="textarea" />
);

export default SecureInput;
