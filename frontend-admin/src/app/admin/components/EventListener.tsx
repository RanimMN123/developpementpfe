'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const EventListener = () => {
  const router = useRouter();

  useEffect(() => {
    // Fonction pour gérer tous les événements d'ouverture de modals
    const handleOpenAddOrderModal = () => {
      console.log('🎯 Event received: open-add-order-modal');
      // Naviguer vers la page des commandes si on n'y est pas déjà
      if (!window.location.pathname.includes('/admin/commandes')) {
        router.push('/admin/commandes');
        // Attendre que la page se charge puis dispatcher l'événement
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('open-add-order-modal'));
        }, 500);
      }
    };

    const handleOpenAddProductModal = () => {
      console.log('🎯 Event received: open-add-product-modal');
      // Naviguer vers la page des produits si on n'y est pas déjà
      if (!window.location.pathname.includes('/admin/produits')) {
        router.push('/admin/produits');
        // Attendre que la page se charge puis dispatcher l'événement
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('open-add-product-modal'));
        }, 500);
      }
    };

    const handleOpenAddClientModal = () => {
      console.log('🎯 Event received: open-add-client-modal');
      // Naviguer vers la page des clients si on n'y est pas déjà
      if (!window.location.pathname.includes('/admin/clients')) {
        router.push('/admin/clients');
        // Attendre que la page se charge puis dispatcher l'événement
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('open-add-client-modal'));
        }, 500);
      }
    };

    const handleOpenAddCategoryModal = () => {
      console.log('🎯 Event received: open-add-category-modal');
      // Naviguer vers la page des catégories si on n'y est pas déjà
      if (!window.location.pathname.includes('/admin/categories')) {
        router.push('/admin/categories');
        // Attendre que la page se charge puis dispatcher l'événement
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('open-add-category-modal'));
        }, 500);
      }
    };

    const handleOpenAddUserModal = () => {
      console.log('🎯 Event received: open-add-user-modal');
      // Naviguer vers la page des users si on n'y est pas déjà
      if (!window.location.pathname.includes('/admin/users')) {
        router.push('/admin/users');
        // Attendre que la page se charge puis dispatcher l'événement
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('open-add-user-modal'));
        }, 500);
      }
    };

    // Ajouter les écouteurs d'événements
    window.addEventListener('open-add-order-modal', handleOpenAddOrderModal);
    window.addEventListener('open-add-product-modal', handleOpenAddProductModal);
    window.addEventListener('open-add-client-modal', handleOpenAddClientModal);
    window.addEventListener('open-add-category-modal', handleOpenAddCategoryModal);
    window.addEventListener('open-add-user-modal', handleOpenAddUserModal);

    // Fonction de nettoyage
    return () => {
      window.removeEventListener('open-add-order-modal', handleOpenAddOrderModal);
      window.removeEventListener('open-add-product-modal', handleOpenAddProductModal);
      window.removeEventListener('open-add-client-modal', handleOpenAddClientModal);
      window.removeEventListener('open-add-category-modal', handleOpenAddCategoryModal);
      window.removeEventListener('open-add-user-modal', handleOpenAddUserModal);
    };
  }, [router]);

  // Ce composant ne rend rien
  return null;
};

export default EventListener;
