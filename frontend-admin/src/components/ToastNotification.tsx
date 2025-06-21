'use client';

import React, { useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';

interface ToastNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'success',
  autoClose = true,
  autoCloseDelay = 4000
}) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50 border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700',
          icon: CheckCircle
        };
      case 'error':
        return {
          bgColor: 'bg-red-50 border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          messageColor: 'text-red-700',
          icon: AlertCircle
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50 border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          messageColor: 'text-blue-700',
          icon: Info
        };
      default:
        return {
          bgColor: 'bg-green-50 border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          messageColor: 'text-green-700',
          icon: CheckCircle
        };
    }
  };

  const styles = getTypeStyles();
  const IconComponent = styles.icon;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className={`max-w-sm w-full ${styles.bgColor} border rounded-lg shadow-lg pointer-events-auto`}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <IconComponent className={`h-5 w-5 ${styles.iconColor}`} />
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className={`text-sm font-medium ${styles.titleColor}`}>
                {title}
              </p>
              <p className={`mt-1 text-sm ${styles.messageColor}`}>
                {message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={onClose}
              >
                <span className="sr-only">Fermer</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Barre de progression pour l'auto-close */}
        {autoClose && (
          <div className="h-1 bg-gray-200 rounded-b-lg overflow-hidden">
            <div
              className={`h-full ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{
                animation: `progress-bar ${autoCloseDelay}ms linear`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ToastNotification;
