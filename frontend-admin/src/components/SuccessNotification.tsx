'use client';

import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface SuccessNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  isOpen,
  onClose,
  title,
  message,
  autoClose = true,
  autoCloseDelay = 3000
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

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay transparent */}
      <div className="fixed inset-0 bg-transparent backdrop-blur-md transition-opacity duration-300 pointer-events-auto" onClick={onClose}></div>

      {/* Notification positionnée en haut */}
      <div className="flex justify-center pt-8 px-4 pointer-events-none">
        <div className="relative w-full max-w-md transform rounded-2xl bg-white shadow-2xl transition-all duration-300 animate-slide-down pointer-events-auto">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>

          <div className="p-6">
            {/* Success Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>

            {/* Content */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
            </div>

            {/* Action */}
            <div className="flex justify-center">
              <button
                onClick={onClose}
                className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessNotification;
