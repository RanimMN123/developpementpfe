'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

interface PageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function PageLayout({
  title,
  description,
  children,
  actions,
  onRefresh,
  isLoading = false
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm px-[5%]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-blue-600 truncate transition-colors duration-300 hover:text-blue-700">
                {title}
              </h1>
              {description && (
                <p className="mt-1 text-sm text-gray-500">
                  {description}
                </p>
              )}
            </div>
            
            {/* Actions Section */}
            <div className="flex items-center gap-3">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  aria-label="Actualiser"
                >
                  <RefreshCw 
                    size={16} 
                    className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} 
                  />
                  Actualiser
                </button>
              )}
              {actions}
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}

// Interface pour les props des boutons
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

// Standardized Primary Button Component
export function PrimaryButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  icon,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95 relative overflow-hidden group ${className}`}
      {...props}
    >
      {/* Effet de brillance au hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-out"></span>

      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 relative z-10"></div>
      ) : icon ? (
        <span className="mr-2 relative z-10 transition-transform duration-300 group-hover:rotate-12">{icon}</span>
      ) : null}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

// Standardized Secondary Button Component
export function SecondaryButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  icon,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${className}`}
      {...props}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}

// Interface pour les props du Card
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}

// Standardized Card Component
export function Card({
  children,
  className = '',
  padding = 'p-6',
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white shadow-sm rounded-lg border border-gray-200 ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Standardized Loading State Component
export function LoadingState({ message = 'Chargement...' }: { message?: string }) {
  return (
    <Card className="text-center py-12">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      </div>
    </Card>
  );
}

// Standardized Error State Component
export function ErrorState({ 
  message, 
  onRetry 
}: { 
  message: string; 
  onRetry?: () => void; 
}) {
  return (
    <Card className="text-center py-12">
      <div className="text-red-500 mb-4">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Une erreur est survenue</h3>
      <p className="text-gray-600 mb-4">{message}</p>
      {onRetry && (
        <SecondaryButton onClick={onRetry}>
          Réessayer
        </SecondaryButton>
      )}
    </Card>
  );
}

// Standardized Empty State Component
export function EmptyState({ 
  title, 
  description, 
  action,
  icon 
}: { 
  title: string; 
  description?: string; 
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="text-center py-12">
      {icon && (
        <div className="text-gray-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 mb-4">{description}</p>
      )}
      {action}
    </Card>
  );
}
