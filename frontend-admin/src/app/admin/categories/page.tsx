'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Loader2, X, ImageIcon, Upload } from 'lucide-react';
import PageLayout, { PrimaryButton, ErrorState } from '../components/PageLayout';
import SearchAndFilter from '../components/SearchAndFilter';
import ScrollToTop from '../components/ScrollToTop';
import SuccessNotification from '../../../components/SuccessNotification';
import { SecureImage, buildImageUrl } from '../../../utils/imageUtils';

// Définition des interfaces
interface Category {
  id: number;
  name: string;
  image?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded?: (category: Category) => void;
  onCategoryUpdated?: () => void;
  category?: Category;
  onConfirm?: () => void;
  categoryName?: string;
  categoryImage?: string;
}



// Composant Modal pour ajouter une catégorie
const AddCategoryModal: React.FC<ModalProps> = ({ isOpen, onClose, onCategoryAdded }) => {
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setImageFile(null);
      setImagePreview('');
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 5MB');
        return;
      }

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Seuls les fichiers JPEG, PNG et WebP sont autorisés');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

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

    try {
      const formData = new FormData();
      formData.append('name', name.trim());

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch('http://localhost:3000/categories', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erreur: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      setSuccess('✅ Catégorie ajoutée avec succès !');

      // Reset form
      setName('');
      setImageFile(null);
      setImagePreview('');

      // Notify parent component
      if (onCategoryAdded && result) {
        onCategoryAdded(result);
      }

      // Close modal after 1s
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err) {
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
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 transform transition-all duration-300">
        <div className="flex justify-between items-center p-3 border-b bg-gradient-to-r from-blue-600 to-purple-600">
          <h3 className="text-lg font-semibold text-white">Ajouter une Catégorie</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 hover:text-white rounded-full p-2 transition-colors duration-200"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-md">
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-3 rounded-md">
              <p className="text-green-700 font-medium text-sm">{success}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la catégorie *
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image de la catégorie
              </label>
              <div className="mt-1 flex justify-center px-4 pt-4 pb-4 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors duration-200">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        className="mx-auto h-24 w-24 object-cover rounded-lg shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                        }}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Supprimer l&apos;image
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-10 w-10 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Télécharger une image</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">ou glisser-déposer</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WebP jusqu&apos;à 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
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
const EditCategoryModal: React.FC<ModalProps> = ({ isOpen, onClose, onCategoryUpdated, category }) => {
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [currentImage, setCurrentImage] = useState<string>('');
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen && category) {
      setName(category.name);
      setCurrentImage(category.image || '');
      setImageFile(null);
      setImagePreview('');
      setRemoveCurrentImage(false);
      setError('');
      setSuccess('');
    }
  }, [isOpen, category]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 5MB');
        return;
      }

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Seuls les fichiers JPEG, PNG et WebP sont autorisés');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

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

    try {
      const formData = new FormData();
      formData.append('name', name.trim());

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (removeCurrentImage) {
        formData.append('removeImage', 'true');
      }

      const response = await fetch(`http://localhost:3000/categories/${category.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erreur: ${response.status} - ${errorData}`);
      }

      setSuccess('✅ Catégorie mise à jour avec succès !');

      if (onCategoryUpdated) {
        onCategoryUpdated();
      }

      // Close modal after 1s
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification de la catégorie';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !category) return null;

  const hasNewImage = imagePreview;
  const hasCurrentImage = currentImage && !removeCurrentImage;
  const displayImage = hasNewImage ? imagePreview : (hasCurrentImage ? `http://localhost:3000/${currentImage}` : null);

  return (
    <div className="fixed inset-0 bg-transparent h-full w-full z-50 flex items-start justify-end backdrop-blur-md transition-all duration-300 pt-4 pr-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 transform transition-all duration-300">
        <div className="flex justify-between items-center p-3 border-b bg-gradient-to-r from-blue-600 to-purple-600">
          <h3 className="text-lg font-semibold text-white">Modifier la Catégorie</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 hover:text-white rounded-full p-2 transition-colors duration-200"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-md">
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-3 rounded-md">
              <p className="text-green-700 font-medium text-sm">{success}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la catégorie *
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image de la catégorie
              </label>
              <div className="mt-1 flex justify-center px-4 pt-4 pb-4 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors duration-200">
                <div className="space-y-1 text-center">
                  {displayImage ? (
                    <div className="space-y-3">
                      <img
                        src={displayImage}
                        alt="Aperçu"
                        className="mx-auto h-24 w-24 object-cover rounded-lg shadow-md"
                      />
                      <div className="flex gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview('');
                            if (currentImage) {
                              setRemoveCurrentImage(true);
                            }
                          }}
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Supprimer l&apos;image
                        </button>
                        <label
                          htmlFor="file-upload-edit"
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                        >
                          Changer l&apos;image
                          <input
                            id="file-upload-edit"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-10 w-10 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload-edit-new"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Télécharger une image</span>
                          <input
                            id="file-upload-edit-new"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">ou glisser-déposer</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, WebP jusqu&apos;à 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
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

// Composant de confirmation de suppression amélioré
const ConfirmDeleteModal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, categoryName, categoryImage }) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!onConfirm) return;
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  const isConfirmValid = confirmText.toLowerCase() === 'supprimer';

  return (
    <div className="fixed inset-0 bg-transparent h-full w-full z-50 flex items-start justify-end backdrop-blur-md transition-all duration-300 pt-4 pr-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 border-2 border-red-100">
        {/* Header avec icône d'alerte */}
        <div className="flex justify-between items-center p-3 border-b bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">⚠️ Suppression définitive</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="text-white hover:bg-white hover:bg-opacity-20 hover:text-white rounded-full p-2 transition-colors duration-200 disabled:opacity-50"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4 text-center">
            {categoryImage && (
              <div className="relative inline-block mb-4">
                <SecureImage
                  src={categoryImage}
                  alt={categoryName || 'Catégorie'}
                  className="mx-auto h-24 w-24 object-cover rounded-lg shadow-md"
                />
                <div className="absolute inset-0 bg-red-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <X className="w-8 h-8 text-red-600" />
                </div>
              </div>
            )}

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-gray-800 font-medium mb-2">
                Vous êtes sur le point de supprimer la catégorie :
              </p>
              <p className="text-base font-bold text-red-700">&quot;{categoryName}&quot;</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-amber-800 text-sm font-medium mb-2">⚠️ Attention :</p>
              <ul className="text-amber-700 text-sm text-left space-y-1">
                <li>• Cette action est <strong>irréversible</strong></li>
                <li>• Tous les produits de cette catégorie seront affectés</li>
                <li>• Les données associées seront perdues définitivement</li>
              </ul>
            </div>

            {/* Champ de confirmation */}
            <div className="text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pour confirmer, tapez <strong>&quot;supprimer&quot;</strong> ci-dessous :
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Tapez 'supprimer' pour confirmer"
                disabled={isDeleting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!isConfirmValid || isDeleting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Suppression...
                </span>
              ) : (
                '🗑️ Supprimer définitivement'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal
const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // États pour les notifications de succès
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/categories');
      if (!response.ok) throw new Error('Erreur lors du chargement des catégories');

      const data = await response.json();

      if (data && Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        throw new Error('Format de données incorrect');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Écouter l'événement personnalisé pour ouvrir le modal d'ajout
  useEffect(() => {
    const handleOpenAddCategoryModal = () => {
      setShowAddModal(true);
    };

    window.addEventListener('open-add-category-modal', handleOpenAddCategoryModal);

    return () => {
      window.removeEventListener('open-add-category-modal', handleOpenAddCategoryModal);
    };
  }, []);

  const handleCategoryAdded = (category: Category) => {
    fetchCategories();
    setShowAddModal(false);

    // Afficher la notification de succès
    setSuccessMessage({
      title: 'Ajout réussi !',
      message: `La catégorie "${category.name}" a été ajoutée avec succès.`
    });
    setShowSuccessNotification(true);
  };

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleCategoryUpdated = () => {
    fetchCategories();
    setShowEditModal(false);
    setSelectedCategory(null);

    // Afficher la notification de succès
    setSuccessMessage({
      title: 'Modification réussie !',
      message: 'La catégorie a été modifiée avec succès.'
    });
    setShowSuccessNotification(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      const response = await fetch(`http://localhost:3000/categories/${categoryToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Erreur lors de la suppression: ${response.status}`);
      }

      // Afficher une notification de succès
      const categoryName = categoryToDelete.name;
      setShowDeleteModal(false);
      setCategoryToDelete(null);

      // Recharger les catégories
      await fetchCategories();

      // Afficher la notification de succès
      setSuccessMessage({
        title: 'Suppression réussie !',
        message: `La catégorie "${categoryName}" a été supprimée avec succès.`
      });
      setShowSuccessNotification(true);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      console.error('Erreur:', err);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  // Filtrer les catégories en fonction du terme de recherche
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageLayout
      title="Catégories"
      description="Gérez vos catégories de produits"
      onRefresh={fetchCategories}
      isLoading={loading}
      actions={
        <PrimaryButton
          onClick={() => setShowAddModal(true)}
          icon={<Plus size={18} />}
        >
          Ajouter une catégorie
        </PrimaryButton>
      }
    >
      {error && (
        <ErrorState
          message={error}
          onRetry={fetchCategories}
        />
      )}

      <SearchAndFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Rechercher une catégorie..."
      />

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <span className="ml-2 text-gray-600">Chargement des catégories...</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-500">
                {filteredCategories.length} catégorie(s) trouvée(s)
              </div>
              <div className="flex gap-2">
                <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-gray-300 rounded-sm"></div>
                    <div className="bg-gray-300 rounded-sm"></div>
                    <div className="bg-gray-300 rounded-sm"></div>
                    <div className="bg-gray-300 rounded-sm"></div>
                  </div>
                  Grille
                </button>
              </div>
            </div>

            {filteredCategories.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-600 text-base font-medium">Aucune catégorie trouvée</p>
                <p className="text-gray-500 text-sm mt-1">
                  {searchTerm ? "Aucune catégorie ne correspond à votre recherche" : "Commencez par ajouter votre première catégorie"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 smooth-scroll">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 overflow-hidden group">
                    <div className="relative">
                      {category.image ? (
                        <SecureImage
                          src={category.image}
                          alt={category.name}
                          className="h-32 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-32 w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                          <div className="text-center">
                            <ImageIcon className="mx-auto h-8 w-8 text-blue-300 mb-1" />
                            <span className="text-blue-400 text-xs font-medium">Aucune image</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditClick(category)}
                            className="p-2 bg-white bg-opacity-90 text-indigo-600 rounded-full shadow-md hover:bg-indigo-50 hover:text-indigo-800 transition-colors duration-200"
                            aria-label="Modifier"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(category)}
                            className="p-2 bg-white bg-opacity-90 text-red-600 rounded-full shadow-md hover:bg-red-50 hover:text-red-800 transition-colors duration-200"
                            aria-label="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800 mb-1">{category.name}</h3>
                          <p className="text-xs text-gray-500">ID: {category.id}</p>
                        </div>
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-sm">
                            {category.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      {/* Modals */}
      <AddCategoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCategoryAdded={handleCategoryAdded}
      />

      <EditCategoryModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCategory(null);
        }}
        onCategoryUpdated={handleCategoryUpdated}
        category={selectedCategory || undefined}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        categoryName={categoryToDelete?.name || ''}
        categoryImage={categoryToDelete?.image}
      />

      {/* Notification de succès */}
      <SuccessNotification
        isOpen={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        title={successMessage.title}
        message={successMessage.message}
      />

      {/* Composant de scroll amélioré */}
      <ScrollToTop />
    </PageLayout>
  );
};

export default CategoriesPage;