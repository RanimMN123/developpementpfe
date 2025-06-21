'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, X, Search, RefreshCw } from 'lucide-react';

// Définition des interfaces pour les types
interface Category {
  id: number;
  name: string;
}

interface CategoryFormData {
  name: string;
}

interface AjouterCategorieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: (category: Category) => void;
}

interface ModifierCategorieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryUpdated: () => void;
  category: Category | null;
}

// Composant Modal pour ajouter une catégorie
const AjouterCategorieModal: React.FC<AjouterCategorieModalProps> = ({ isOpen, onClose, onCategoryAdded }) => {
  const [name, setName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setName('');
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!name.trim()) {
      setError('Le nom de la catégorie est requis');
      setIsLoading(false);
      return;
    }

    const newCategory: CategoryFormData = {
      name: name.trim()
    };

    try {
      const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      const result = await response.json();
      setSuccess('Catégorie ajoutée avec succès');
      
      // Reset form
      setName('');
      
      // Notify parent component
      if (onCategoryAdded && result) {
        onCategoryAdded(result);
      }
      
      // Close modal after 1.5s
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout de la catégorie';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent h-full w-full z-50 flex items-start justify-end backdrop-blur-md transition-all duration-300 pt-4 pr-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300">
        <div className="flex justify-between items-center p-3 border-b bg-gradient-to-r from-blue-600 to-purple-600">
          <h3 className="text-xl font-semibold text-white">Ajouter une Catégorie</h3>
          <button 
            type="button" 
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 hover:text-white rounded-full p-2 transition-colors duration-200"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
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
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la catégorie
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Entrez le nom de la catégorie"
              />
            </div>
            
            <div className="flex justify-end mt-8 space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Ajout en cours...
                  </span>
                ) : 'Ajouter la catégorie'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Modal pour modifier une catégorie
const ModifierCategorieModal: React.FC<ModifierCategorieModalProps> = ({ isOpen, onClose, onCategoryUpdated, category }) => {
  const [name, setName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Charger les détails de la catégorie lorsque le modal s'ouvre
  useEffect(() => {
    if (isOpen && category) {
      setName(category.name);
      setError('');
      setSuccess('');
    }
  }, [isOpen, category]);

  const handleSubmit = async () => {
    if (!category) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!name.trim()) {
      setError('Le nom de la catégorie est requis');
      setIsLoading(false);
      return;
    }

    const updatedCategory: CategoryFormData = {
      name: name.trim()
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCategory),
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      setSuccess('Catégorie mise à jour avec succès');
      
      // Notify parent component
      if (onCategoryUpdated) {
        onCategoryUpdated();
      }
      
      // Close modal after 1.5s
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification de la catégorie';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 bg-transparent h-full w-full z-50 flex items-start justify-end backdrop-blur-md transition-all duration-300 pt-4 pr-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300">
        <div className="flex justify-between items-center p-3 border-b bg-gradient-to-r from-blue-600 to-purple-600">
          <h3 className="text-xl font-semibold text-white">Modifier la Catégorie</h3>
          <button 
            type="button" 
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 hover:text-white rounded-full p-2 transition-colors duration-200"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
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
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la catégorie
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Entrez le nom de la catégorie"
              />
            </div>
            
            <div className="flex justify-end mt-8 space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Modification en cours...
                  </span>
                ) : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Interface pour les props du modal de confirmation
interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  categoryName: string;
}

// Composant de confirmation de suppression
const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm, categoryName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent h-full w-full z-50 flex items-start justify-end backdrop-blur-md transition-all duration-300 pt-4 pr-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300">
        <div className="flex justify-between items-center p-3 border-b bg-gradient-to-r from-blue-600 to-purple-600">
          <h3 className="text-xl font-semibold text-white">Confirmer la suppression</h3>
          <button 
            type="button" 
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 hover:text-white rounded-full p-2 transition-colors duration-200"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6 text-gray-700">
            <p>Êtes-vous sûr de vouloir supprimer la catégorie <strong>&quot;{categoryName}&quot;</strong> ?</p>
            <p className="mt-2 text-sm text-red-600">Cette action est irréversible et pourrait affecter les produits associés à cette catégorie.</p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
            >
              Confirmer la suppression
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal AdminCategories
const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}/categories');
      if (!response.ok) throw new Error('Erreur lors du chargement des catégories');
      
      const data = await response.json();
      
      if (data && Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        throw new Error('Format de données incorrect');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryAdded = () => {
    // Rafraîchir la liste des catégories
    fetchCategories();
  };

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la suppression: ${response.status}`);
      }
      
      // Fermer le modal et rafraîchir la liste
      setShowDeleteModal(false);
      fetchCategories();
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      console.error('Erreur:', err);
      setShowDeleteModal(false);
    }
  };

  // Filtrage des catégories en fonction des termes de recherche
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement des catégories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Catégories</h1>
          <p className="mt-2 text-gray-600">Gérez les catégories de votre catalogue de produits</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
              <div className="flex flex-1 items-center space-x-4">
                <div className="flex-1 max-w-md relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Rechercher une catégorie..."
                  />
                </div>
                
                <button 
                  onClick={fetchCategories}
                  className="p-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-200"
                  aria-label="Rafraîchir"
                >
                  <RefreshCw size={18} />
                </button>
              </div>

              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg flex items-center transition duration-200 shadow-sm"
              >
                <Plus size={18} className="mr-1.5" />
                Ajouter une catégorie
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom de la catégorie
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {category.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-3 justify-end">
                            <button 
                              onClick={() => handleEditClick(category)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition-colors duration-200" 
                              aria-label="Modifier"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(category)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors duration-200" 
                              aria-label="Supprimer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="text-gray-500 flex flex-col items-center">
                          <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          <p className="text-lg font-medium">Aucune catégorie trouvée</p>
                          <p className="text-sm mt-1">Essayez de modifier vos critères de recherche ou ajoutez une nouvelle catégorie</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              {filteredCategories.length} catégorie(s) trouvée(s)
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour ajouter une catégorie */}
      <AjouterCategorieModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCategoryAdded={handleCategoryAdded}
      />

      {/* Modal pour modifier une catégorie */}
      <ModifierCategorieModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onCategoryUpdated={fetchCategories}
        category={selectedCategory}
      />

      {/* Modal de confirmation de suppression */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        categoryName={categoryToDelete?.name || ''}
      />
    </div>
  );
};

export default AdminCategories;