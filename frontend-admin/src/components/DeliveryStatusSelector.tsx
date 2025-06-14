'use client';

import React, { useState } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import { getAllDeliveryStatuses, DeliveryStatus } from '../utils/deliveryStatus';

interface DeliveryStatusSelectorProps {
  currentStatus: string;
  onStatusChange: (status: DeliveryStatus) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

const DeliveryStatusSelector: React.FC<DeliveryStatusSelectorProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DeliveryStatus>(currentStatus as DeliveryStatus);
  const [isLoading, setIsLoading] = useState(false);

  const statuses = getAllDeliveryStatuses();
  const currentConfig = statuses.find(s => s.value === currentStatus);

  const handleSave = async () => {
    if (selectedStatus === currentStatus) {
      setIsEditing(false);
      return;
    }

    try {
      setIsLoading(true);
      await onStatusChange(selectedStatus);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      // Remettre l'ancien statut en cas d'erreur
      setSelectedStatus(currentStatus as DeliveryStatus);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedStatus(currentStatus as DeliveryStatus);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as DeliveryStatus)}
          disabled={isLoading}
          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
          title="Sauvegarder"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
          ) : (
            <Check size={16} />
          )}
        </button>
        
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors disabled:opacity-50"
          title="Annuler"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentConfig?.color || 'bg-gray-100 text-gray-800'}`}>
        {currentConfig && <currentConfig.icon size={14} className="mr-1" />}
        {currentConfig?.label || currentStatus}
      </span>
      
      {!disabled && (
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="Modifier le statut"
        >
          <ChevronDown size={14} />
        </button>
      )}
    </div>
  );
};

export default DeliveryStatusSelector;
