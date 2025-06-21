'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

// Interfaces
interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  categoryId: number;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAction: () => void;
  product?: Product | null;
  mode: 'create' | 'edit';
}

// Composant Modal
const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onProductAction, product, mode }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pré-remplir les champs en mode édition
  useEffect(() => {
    if (product && mode === 'edit') {
      setName(product.name);
      setPrice(product.price.toString());
      setDescription(product.description);
      setCategoryId(product.categoryId.toString());
    } else {
      setName('');
      setPrice('');
      setDescription('');
      setCategoryId('');
    }
  }, [product, mode, isOpen]);

  // Charger les catégories à chaque ouverture du modal
  useEffect(() => {
    if (!isOpen) return;
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
        if (!response.ok) throw new Error('Erreur lors du chargement des catégories');
        const data = await response.json();
        if (Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          throw new Error('Format de données incorrect');
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des catégories';
        setError(errorMessage);
      }
    };
    fetchCategories();
  }, [isOpen]);

  const validateForm = () => {
    if (!name.trim()) return setError('Le nom du produit est requis'), false;
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0)
      return setError('Veuillez saisir un prix valide'), false;
    if (!description.trim()) return setError('La description est requise'), false;
    if (!categoryId) return setError('Veuillez sélectionner une catégorie'), false;
    return true;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    const productData: ProductFormData = {
      name: name.trim(),
      price: parseFloat(price),
      description: description.trim(),
      categoryId: parseInt(categoryId, 10)
    };

    try {
      const url =
        mode === 'create'
          ? `${process.env.NEXT_PUBLIC_API_URL}/admin/products`
          : `${process.env.NEXT_PUBLIC_API_URL}/admin/products/${product?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!response.ok) throw new Error(`Erreur: ${response.status}`);
      await response.json();

      // Appeler la fonction parent qui gère la notification centrée
      onProductAction();

      // Fermer le modal immédiatement
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : `Erreur lors de ${mode === 'create' ? "l'ajout" : 'la modification'} du produit`;
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="flex-1 cursor-pointer" onClick={onClose}></div>
      <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header avec dégradé - Style identique au modal client */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {mode === 'create' ? 'Nouveau produit' : 'Modifier le produit'}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {mode === 'create' ? 'Ajoutez un nouveau produit à votre catalogue' : 'Modifiez les informations du produit'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Contenu du formulaire - Style identique au modal client */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          )}
          {/* La notification de succès est maintenant gérée par le composant parent */}

          <div className="space-y-6">
            {/* Champ d'upload d'image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image du produit
              </label>
              <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors bg-gray-50/50">
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-blue-600 font-medium mb-1">Télécharger une image</p>
                  <p className="text-gray-500 text-sm">ou glisser-déposer</p>
                  <p className="text-gray-400 text-xs mt-1">PNG, JPG, GIF jusqu'à 5MB</p>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom du produit <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/80"
                placeholder="Entrez le nom du produit"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Prix (TND) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/80"
                  placeholder="0.00"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">TND</span>
              </div>
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                id="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/80"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none bg-white/80"
                placeholder="Décrivez votre produit en détail"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white/80 transition-colors"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>

        {/* Footer avec boutons - Style identique au modal client */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading
              ? (mode === 'create' ? 'Ajout en cours...' : 'Modification en cours...')
              : (mode === 'create' ? 'Ajouter le produit' : 'Modifier le produit')}
          </button>
        </div>
      </div>
      <div className="flex-1 cursor-pointer" onClick={onClose}></div>
    </div>
  );
};

export default ProductModal;


