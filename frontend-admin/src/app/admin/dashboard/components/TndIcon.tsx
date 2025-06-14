import React from 'react';

interface TndIconProps {
  size?: number;
  className?: string;
}

const TndIcon: React.FC<TndIconProps> = ({ size = 24, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Cercle principal représentant une pièce */}
      <circle cx="12" cy="12" r="10" />
      
      {/* Lettres TND stylisées */}
      <g transform="translate(12, 12)">
        {/* T */}
        <path d="M-6 -4 L-2 -4 M-4 -4 L-4 2" strokeWidth="1.5" />
        
        {/* N */}
        <path d="M-1 -4 L-1 2 M-1 -4 L2 2 M2 -4 L2 2" strokeWidth="1.5" />
        
        {/* D */}
        <path d="M3.5 -4 L3.5 2 M3.5 -4 C5.5 -4 6.5 -2 6.5 -1 C6.5 0 5.5 2 3.5 2" strokeWidth="1.5" />
      </g>
      
      {/* Lignes décoratives pour représenter la valeur */}
      <path d="M6 6 L18 6" strokeWidth="1" opacity="0.6" />
      <path d="M6 18 L18 18" strokeWidth="1" opacity="0.6" />
    </svg>
  );
};

export default TndIcon;
