'use client';

import React from 'react';
import { getDeliveryStatusBadge } from '../utils/deliveryStatus';

interface DeliveryStatusBadgeProps {
  status: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DeliveryStatusBadge: React.FC<DeliveryStatusBadgeProps> = ({
  status,
  showIcon = true,
  size = 'md',
  className = ''
}) => {
  const badge = getDeliveryStatusBadge(status);
  const Icon = badge.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <span className={`${badge.className} ${sizeClasses[size]} ${className}`}>
      {showIcon && <Icon size={iconSizes[size]} className="mr-1" />}
      {badge.label}
    </span>
  );
};

export default DeliveryStatusBadge;
