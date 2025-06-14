'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Minus, Check } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
}

interface Client {
  id: number;
  name: string;
}

interface OrderItem {
  productId: number;
  quantity: number;
}

interface AjouterCommandeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderAdded: () => void;
  clients: Client[];
  products: Product[];
}

const AjouterCommandeModal: React.FC<AjouterCommandeModalProps> = ({
  isOpen,
  onClose,
  onOrderAdded,
  clients,
  products
}) => {
  const [formData, setFormData] = useState({
    clientId: clients.length > 0 ? clients[0].id : 0,
    status: 'en attente',
    items: [] as OrderItem[]
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({
    clientId: '',
    items: ''
  });

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        clientId: clients.length > 0 ? clients[0].id : 0,
        status: 'en attente',
        items: []
      });
      setFormErrors({ clientId: '', items: '' });
      setError('');
      setSuccess('');
    }
  }, [isOpen, clients]);

  const validateForm = (): boolean => {
    const errors = {
      clientId: '',
      items: ''
    };

    let isValid = true;

    if (!formData.clientId) {
      errors.clientId = 'Veuillez sélectionner un client';
      isValid = false;
    }

    if (formData.items.length === 0) {
      errors.items = 'Veuillez ajouter au moins un produit';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const clientId = parseInt(e.target.value, 10);
    setFormData(prev => ({
      ...prev,
      clientId
    }));

    if (formErrors.clientId) {
      setFormErrors(prev => ({ ...prev, clientId: '' }));
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      status: e.target.value
    }));
  };

  const handleAddProduct = (productId: number) => {
    setFormData(prev => {
      const existingItem = prev.items.find(item => item.productId === productId);

      if (existingItem) {
        return {
          ...prev,
          items: prev.items.map(item =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      } else {
        return {
          ...prev,
          items: [...prev.items, { productId, quantity: 1 }]
        };
      }
    });

    if (formErrors.items) {
      setFormErrors(prev => ({ ...prev, items: '' }));
    }
  };

  const handleRemoveProduct = (productId: number) => {
    setFormData(prev => {
      const existingItem = prev.items.find(item => item.productId === productId);

      if (!existingItem) return prev;

      if (existingItem.quantity > 1) {
        return {
          ...prev,
          items: prev.items.map(item =>
            item.productId === productId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
        };
      } else {
        return {
          ...prev,
          items: prev.items.filter(item => item.productId !== productId)
        };
      }
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création de la commande');
      }

      setSuccess('Commande créée avec succès');
      onOrderAdded();

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la commande';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getProductById = (id: number) => {
    return products.find(product => product.id === id);
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const product = getProductById(item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  if (!isOpen) return null;

  console.log('🎯 AddCommand Modal rendering with timestamp:', Date.now());

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      {/* Arrière-plan flou montrant le contenu de la page */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-md"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
      ></div>

      {/* Formulaire centré au milieu */}
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 z-10"
        style={{
          position: 'relative',
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          width: '100%',
          maxWidth: '32rem',
          zIndex: 10
        }}
      >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Créer une nouvelle commande</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:bg-gray-100 hover:text-gray-500 rounded-full p-2 transition"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>

        {/* Contenu du formulaire simple comme le formulaire produit */}
        <div className="p-6">
          {/* Messages d'erreur et succès simples */}
          {error && (
            <div className="mb-5 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-5 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
              <p className="text-green-700 font-medium text-sm">{success}</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Sélection du client */}
            <div>
              <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
                Client*
              </label>
              <select
                id="clientId"
                name="clientId"
                value={formData.clientId}
                onChange={handleClientChange}
                className={`w-full px-4 py-3 border ${formErrors.clientId ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {clients.length === 0 ? (
                  <option value="0">Aucun client disponible</option>
                ) : (
                  <>
                    <option value="0">Sélectionnez un client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {formErrors.clientId && <p className="mt-1 text-sm text-red-600">{formErrors.clientId}</p>}
            </div>

            {/* Statut de la commande */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleStatusChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en attente">En attente</option>
                <option value="en cours">En cours</option>
                <option value="livrée">Livrée</option>
                <option value="annulée">Annulée</option>
              </select>
            </div>

            {/* Liste des produits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produits*
              </label>
              {formErrors.items && <p className="mt-1 text-sm text-red-600">{formErrors.items}</p>}

              <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-60 overflow-y-auto">
                {products.map(product => (
                  <div key={product.id} className="p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-500">{product.description}</p>
                      <p className="text-sm font-medium mt-1">{product.price} TND</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product.id)}
                        className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                        disabled={!formData.items.some(item => item.productId === product.id)}
                      >
                        <Minus size={18} />
                      </button>
                      <span className="text-gray-700 w-6 text-center">
                        {formData.items.find(item => item.productId === product.id)?.quantity || 0}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddProduct(product.id)}
                        className="p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                      >
                        <span className="text-lg font-bold">+</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Récapitulatif simple */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Récapitulatif de la commande</h4>

              {formData.items.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucun produit sélectionné</p>
              ) : (
                <div className="space-y-3">
                  {formData.items.map(item => {
                    const product = getProductById(item.productId);
                    if (!product) return null;

                    return (
                      <div key={item.productId} className="flex justify-between text-sm">
                        <span>
                          {product.name} × {item.quantity}
                        </span>
                        <span className="font-medium">
                          {product.price * item.quantity} TND
                        </span>
                      </div>
                    );
                  })}

                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{calculateTotal()} TND</span>
                  </div>
                </div>
              )}
            </div>

            {/* Boutons d'action simples */}
            <div className="flex justify-end mt-8 space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-5 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                    Création en cours...
                  </span>
                ) : (
                  <>
                    <Check className="-ml-1 mr-2 h-4 w-4" />
                    Créer la commande
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AjouterCommandeModal;