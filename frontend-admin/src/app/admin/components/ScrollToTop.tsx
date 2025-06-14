'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Fonction pour remonter en haut
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;

          // Vérifier que docHeight est valide
          if (docHeight > 0) {
            // Calculer le pourcentage de scroll
            const scrollPercent = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
            setScrollProgress(scrollPercent);
          }

          // Gérer la visibilité du bouton
          setIsVisible(scrollTop > 300);

          ticking = false;
        });
        ticking = true;
      }
    };

    // Appeler une fois au montage
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Indicateur de progression de scroll */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transition-all duration-300 ease-out shadow-lg"
          style={{ width: `${scrollProgress}%` }}
        ></div>
      </div>

      {/* Bouton de retour en haut */}
      <button
        onClick={scrollToTop}
        className={`scroll-to-top ${isVisible ? 'visible' : ''} ${scrollProgress > 80 ? 'pulse' : ''}`}
        aria-label="Retour en haut"
        title="Retour en haut de la page"
      >
        <ChevronUp size={24} />
      </button>
    </>
  );
};

export default ScrollToTop;
