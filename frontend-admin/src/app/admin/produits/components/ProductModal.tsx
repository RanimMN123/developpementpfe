'use client';

import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/Modal';
import { Package, Save, X } from 'lucide-react';

interface Product {
  id?: number;
  nom: string;
  description: string;
  prix: number;
  stock: number;
  categorieId: number;
  image?: string;
}

interface Category {
  id: number;
  nom: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'>) => Promise<void>;
  product?: Product | null;
  categories: Category[];
  isLoading?: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  categories,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    nom: '',
    description: '',
    prix: 0,
    stock: 0,
    categorieId: 0,
    image: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialiser le formulaire quand le produit change
  useEffect(() => {
    if (product) {
      setFormData({
        nom: product.nom || '',
        description: product.description || '',
        prix: product.prix || 0,
        stock: product.stock || 0,
        categorieId: product.categorieId || 0,
        image: product.image || ''
      });
    } else {
      setFormData({
        nom: '',
        description: '',
        prix: 0,
        stock: 0,
        categorieId: categories.length > 0 ? categories[0].id : 0,
        image: ''
      });
    }
    setErrors({});
  }, [product, categories, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'prix' || name === 'stock' || name === 'categorieId' 
        ? parseFloat(value) || 0 
        : value
    }));

    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (formData.prix <= 0) {
      newErrors.prix = 'Le prix doit être supérieur à 0';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'Le stock ne peut pas être négatif';
    }

    if (formData.categorieId <= 0) {
      newErrors.categorieId = 'Veuillez sélectionner une catégorie';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      nom: '',
      description: '',
      prix: 0,
      stock: 0,
      categorieId: 0,
      image: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={product ? 'Modifier le produit' : 'Ajouter un produit'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Nom du produit */}
        <div className="space-y-1">
          <label htmlFor="nom" className="block text-xs font-medium text-gray-700">
            Nom du produit *
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleInputChange}
            className={`w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              errors.nom ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nom du produit"
          />
          {errors.nom && <p className="mt-1 text-xs text-red-600">{errors.nom}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label htmlFor="description" className="block text-xs font-medium text-gray-700">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={2}
            className={`w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Description du produit"
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
        </div>

        {/* Prix et Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="prix" className="block text-xs font-medium text-gray-700">
              Prix (TND) *
            </label>
            <input
              type="number"
              id="prix"
              name="prix"
              value={formData.prix}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className={`w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.prix ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.prix && <p className="mt-1 text-xs text-red-600">{errors.prix}</p>}
          </div>

          <div className="space-y-1">
            <label htmlFor="stock" className="block text-xs font-medium text-gray-700">
              Stock *
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              min="0"
              className={`w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                errors.stock ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0"
            />
            {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock}</p>}
          </div>
        </div>

        {/* Catégorie */}
        <div className="space-y-1">
          <label htmlFor="categorieId" className="block text-xs font-medium text-gray-700">
            Catégorie *
          </label>
          <select
            id="categorieId"
            name="categorieId"
            value={formData.categorieId}
            onChange={handleInputChange}
            className={`w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
              errors.categorieId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value={0}>Sélectionnez une catégorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nom}
              </option>
            ))}
          </select>
          {errors.categorieId && <p className="mt-1 text-xs text-red-600">{errors.categorieId}</p>}
        </div>

        {/* Image URL */}
        <div className="space-y-1">
          <label htmlFor="image" className="block text-xs font-medium text-gray-700">
            URL de l'image
          </label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="https://exemple.com/image.jpg"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-200 mt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                Sauvegarde...
              </div>
            ) : (
              <>
                <Save size={12} className="mr-1" />
                {product ? 'Modifier' : 'Ajouter'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;
