'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Loader2, Filter, ArrowUp, ArrowDown, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import PageLayout, { PrimaryButton, ErrorState } from '../components/PageLayout';
import SuccessNotification from '../../../components/SuccessNotification';
import SearchAndFilter from '../components/SearchAndFilter';
import ScrollToTop from '../components/ScrollToTop';
import { SecureImage, buildImageUrl } from '../../../utils/imageUtils';
import './animations.css';


// Composant modal de confirmation de suppression
interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  produitName: string;
  isDeleting: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm, produitName, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-30 overflow-y-auto h-full w-full z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-300"
    style={{backgroundColor:'rgba(0,0,0,0.1'}}>
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-gray-800">Confirmer la suppression</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-100 hover:text-gray-900 rounded-full p-2 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center mb-4 text-amber-500">
            <AlertCircle size={20} className="mr-2" />
            <p className="font-medium text-sm">Cette action est irréversible</p>
          </div>

          <p className="text-gray-700 mb-4 text-sm">
            Êtes-vous sûr de vouloir supprimer le produit <span className="font-semibold">"{produitName}"</span> ?
          </p>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
              disabled={isDeleting}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-colors"
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Suppression...
                </span>
              ) : 'Supprimer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant AjouterProduitModal amélioré avec upload d'image
interface AjouterProduitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded?: (product: any) => void;
  editMode?: boolean;
  produit?: any;
}

const AjouterProduitModal: React.FC<AjouterProduitModalProps> = ({ isOpen, onClose, onProductAdded, editMode = false, produit = null }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialiser les valeurs si on est en mode édition
  useEffect(() => {
    if (editMode && produit) {
      setName(produit.name || '');
      setPrice(produit.price ? produit.price.toString() : '');
      setDescription(produit.description || '');
      setCategoryId(produit.categoryId ? produit.categoryId.toString() : '');
      setStock(produit.stock !== undefined ? produit.stock.toString() : '0');
      setImagePreview(produit.imageUrl || null);
    } else if (!editMode) {
      // Reset le formulaire si on n'est pas en mode édition
      setName('');
      setPrice('');
      setDescription('');
      setCategoryId('');
      setStock('0');
      setSelectedImage(null);
      setImagePreview(null);
    }
  }, [editMode, produit, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:3000/categories');
        if (!response.ok) throw new Error('Erreur lors du chargement des catégories');

        const data = await response.json();
        if (Array.isArray(data.data)) {
          setCategories(data.data);
        } else {
          throw new Error('Format de données incorrect');
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des catégories');
        console.error('Erreur:', err);
      }
    };

    fetchCategories();
  }, [isOpen]);

  // Gestion de la sélection d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.match(/\/(jpg|jpeg|png|gif)$/)) {
        setError('Seuls les fichiers image (JPG, JPEG, PNG, GIF) sont autorisés');
        return;
      }

      // Vérifier la taille du fichier (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('La taille du fichier ne doit pas dépasser 5MB');
        return;
      }

      setSelectedImage(file);

      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  // Supprimer l'image sélectionnée
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(editMode && produit ? produit.imageUrl : null);
    // Reset l'input file
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!name.trim()) {
      setError('Le nom du produit est requis');
      setIsLoading(false);
      return;
    }

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setError('Veuillez saisir un prix valide');
      setIsLoading(false);
      return;
    }

    if (!description.trim()) {
      setError('La description est requise');
      setIsLoading(false);
      return;
    }

    if (!categoryId) {
      setError('Veuillez sélectionner une catégorie');
      setIsLoading(false);
      return;
    }

    if (stock === '' || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
      setError('Veuillez saisir un stock valide (nombre entier positif)');
      setIsLoading(false);
      return;
    }

    try {
      let url = 'http://localhost:3000/products';
      let method = 'POST';

      // Si on est en mode édition, on fait une requête PUT
      if (editMode && produit) {
        url = `http://localhost:3000/products/${produit.id}`;
        method = 'PUT';
      }

      // Créer un FormData pour l'upload de fichier
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('price', price);
      formData.append('description', description.trim());
      formData.append('categoryId', categoryId);
      formData.append('stock', stock);

      // Ajouter l'image si elle est sélectionnée
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch(url, {
        method,
        body: formData, // Pas de Content-Type header pour FormData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erreur: ${response.status}`);
      }

      const result = await response.json();
      setSuccess(editMode ? 'Produit modifié avec succès' : 'Produit ajouté avec succès');

      // Reset form
      if (!editMode) {
        setName('');
        setPrice('');
        setDescription('');
        setCategoryId('');
        setStock('0');
        setSelectedImage(null);
        setImagePreview(null);
      }

      // Notify parent component
      if (onProductAdded) {
        onProductAdded(result);
      }

      // Close modal after 1.5s
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);

    } catch (err: any) {
      setError(err.message || `Erreur lors de ${editMode ? 'la modification' : "l'ajout"} du produit`);
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent h-full w-full z-50 flex items-start justify-end backdrop-blur-md transition-all duration-300 pt-4 pr-4">
      <div className="relative bg-white rounded-xl shadow-2xl w-[500px] transform transition-all duration-300">
        <div className="flex justify-between items-center p-3 border-b bg-gradient-to-r from-blue-600 to-purple-600">
          <h3 className="text-lg font-bold text-white">
            {editMode ? 'Modifier le Produit' : 'Ajouter un Produit'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white bg-transparent hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-3">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-3 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {/* Upload d'image */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Image du produit
              </label>
              <div className="mt-1 flex justify-center px-3 pt-3 pb-3 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <SecureImage
                        src={imagePreview}
                        alt="Aperçu"
                        className="mx-auto h-16 w-16 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="flex text-xs text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Télécharger</span>
                          <input
                            id="image-upload"
                            name="image-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF (5MB max)
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                Nom du produit
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                placeholder="Entrez le nom du produit"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="price" className="block text-xs font-medium text-gray-700 mb-1">
                  Prix (TND)
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="stock" className="block text-xs font-medium text-gray-700 mb-1">
                  Stock
                </label>
                <input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                placeholder="Entrez la description du produit"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-xs font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <div className="relative">
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-colors text-sm"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((categorie) => (
                    <option key={categorie.id} value={categorie.id}>
                      {categorie.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-3 py-2 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <Loader2 size={14} className="animate-spin mr-1" />
                    {editMode ? 'Modification...' : 'Ajout...'}
                  </span>
                ) : (editMode ? 'Modifier' : 'Ajouter')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant principal
const AdminProduits = () => {
  const [produits, setProduits] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentProduit, setCurrentProduit] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // États pour les notifications de succès
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const fetchProduits = async () => {
    setIsLoading(true);
    try {
      // Charger les produits
      const produitsRes = await fetch('http://localhost:3000/admin/products');
      if (!produitsRes.ok) throw new Error('Erreur lors du chargement des produits');
      const produitsData = await produitsRes.json();
      setProduits(produitsData);

      // Charger les catégories
      const categoriesRes = await fetch('http://localhost:3000/categories');
      if (!categoriesRes.ok) throw new Error('Erreur lors du chargement des catégories');
      const categoriesData = await categoriesRes.json();

      if (categoriesData && Array.isArray(categoriesData.data)) {
        setCategories(categoriesData.data);
      } else {
        setError('Format de catégories incorrect');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  // Écouter l'événement personnalisé pour ouvrir le modal d'ajout
  useEffect(() => {
    const handleOpenAddProductModal = () => {
      setShowModal(true);
    };

    window.addEventListener('open-add-product-modal', handleOpenAddProductModal);

    return () => {
      window.removeEventListener('open-add-product-modal', handleOpenAddProductModal);
    };
  }, []);

  // Fonction pour formater le prix
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(price);
  };

  // Fonction pour trier les produits
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Ouvrir le modal de modification
  const handleEditClick = (produit: any) => {
    setCurrentProduit(produit);
    setShowEditModal(true);
  };

  // Ouvrir le modal de suppression
  const handleDeleteClick = (produit: any) => {
    setCurrentProduit(produit);
    setShowDeleteModal(true);
  };

  // Confirmer la suppression
  const handleConfirmDelete = async () => {
    if (!currentProduit) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:3000/admin/product/${currentProduit!.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      // Mettre à jour la liste des produits
      fetchProduits();

      // Fermer le modal
      setShowDeleteModal(false);
      setCurrentProduit(null);

      // Afficher la notification de succès
      setSuccessMessage({
        title: 'Suppression réussie !',
        message: 'Le produit a été supprimé avec succès.'
      });
      setShowSuccessNotification(true);

    } catch (err: any) {
      setError(`Erreur lors de la suppression: ${err.message}`);
      console.error('Erreur:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Appliquer les filtres et le tri aux produits
  const filteredAndSortedProducts = [...produits]
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.categoryId === parseInt(selectedCategory);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortField === 'price') {
        return sortDirection === 'asc'
          ? a.price - b.price
          : b.price - a.price;
      } else if (sortField === 'stock') {
        return sortDirection === 'asc'
          ? a.stock - b.stock
          : b.stock - a.stock;
      }
      return 0;
    });

  // Fonction appelée après l'ajout ou la modification d'un produit
  const handleProductAction = (isEdit = false) => {
    // Rafraîchir la liste des produits
    fetchProduits();
    setShowModal(false);
    setShowEditModal(false);

    // Afficher la notification de succès
    setSuccessMessage({
      title: isEdit ? 'Modification réussie !' : 'Ajout réussi !',
      message: isEdit ? 'Le produit a été modifié avec succès.' : 'Le produit a été ajouté avec succès.'
    });
    setShowSuccessNotification(true);
  };

  // Rendu pour l'état de chargement
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <Loader2 size={48} className="animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Chargement des produits...</p>
      </div>
    );
  }

  // Rendu en cas d'erreur et pas de produits
  if (error && !produits.length) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-red-800">Une erreur est survenue</h3>
              <p className="mt-2 text-red-700">{error}</p>
              <button
                onClick={fetchProduits}
                className="mt-4 bg-red-100 text-red-800 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageLayout
      title="Produits"
      description="Gérez votre catalogue de produits"
      onRefresh={fetchProduits}
      isLoading={isLoading}
      actions={
        <PrimaryButton
          onClick={() => setShowModal(true)}
          icon={<Plus size={18} />}
        >
          Ajouter un produit
        </PrimaryButton>
      }
    >
      {error && (
        <ErrorState
          message={error}
          onRetry={fetchProduits}
        />
      )}

      {/* Statistiques - Tailles très réduites */}
      <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-md shadow-sm p-2 text-white stat-card transform transition-all duration-500 hover:shadow-lg animate-slide-in-left">
          <div className="flex items-center">
            <div>
              <div className="text-sm font-bold animate-scale-in">{produits.length}</div>
              <div className="text-blue-100 text-xs">Total des produits</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-md shadow-sm p-2 text-white stat-card transform transition-all duration-500 hover:shadow-lg animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center">
            <div>
              <div className="text-sm font-bold animate-scale-in" style={{ animationDelay: '200ms' }}>
                {produits.filter(p => p.stock > 10).length}
              </div>
              <div className="text-green-100 text-xs">En stock</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-md shadow-sm p-2 text-white stat-card transform transition-all duration-500 hover:shadow-lg animate-slide-in-right" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center">
            <div>
              <div className="text-sm font-bold animate-scale-in" style={{ animationDelay: '400ms' }}>
                {produits.filter(p => p.stock === 0).length}
              </div>
              <div className="text-red-100 text-xs">Rupture de stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <SearchAndFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Rechercher un produit..."
        filterValue={selectedCategory}
        onFilterChange={setSelectedCategory}
        filterOptions={categories.map(cat => ({ value: cat.id, label: cat.name }))}
        filterLabel="Toutes les catégories"
      />

      {/* Tableau des produits */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden transform transition-all duration-500 hover:shadow-xl hover:border-blue-200">
        <div className="overflow-x-auto table-scroll smooth-scroll momentum-scroll scroll-fade relative">
          {/* Titre du tableau */}
          <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">
                Catalogue des produits
              </h3>
              <p className="text-slate-500 text-xs">
                {filteredAndSortedProducts.length} produit{filteredAndSortedProducts.length > 1 ? 's' : ''} disponible{filteredAndSortedProducts.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <table className="min-w-full divide-y divide-blue-100">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Image
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100 transition-all duration-300 hover:scale-105"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    <span className="transition-colors duration-300 hover:text-blue-800">Nom du produit</span>
                    {sortField === 'name' && (
                      <div className="animate-bounce">
                        {sortDirection === 'asc' ? <ArrowUp size={16} className="text-blue-800" /> : <ArrowDown size={16} className="text-blue-800" />}
                      </div>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100 transition-all duration-300 hover:scale-105"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center gap-1">
                    <span className="transition-colors duration-300 hover:text-blue-800">Prix unitaire</span>
                    {sortField === 'price' && (
                      <div className="animate-bounce">
                        {sortDirection === 'asc' ? <ArrowUp size={16} className="text-blue-800" /> : <ArrowDown size={16} className="text-blue-800" />}
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Catégorie
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider cursor-pointer hover:bg-blue-100 transition-all duration-300 hover:scale-105"
                  onClick={() => handleSort('stock')}
                >
                  <div className="flex items-center gap-1">
                    <span className="transition-colors duration-300 hover:text-blue-800">Stock disponible</span>
                    {sortField === 'stock' && (
                      <div className="animate-bounce">
                        {sortDirection === 'asc' ? <ArrowUp size={16} className="text-blue-800" /> : <ArrowDown size={16} className="text-blue-800" />}
                      </div>
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-blue-100">
              {filteredAndSortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-5V4" />
                      </svg>
                      <h3 className="text-base font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
                      <p className="text-gray-500 text-sm">
                        {searchTerm || selectedCategory
                          ? "Aucun produit ne correspond à vos critères de recherche."
                          : "Commencez par ajouter votre premier produit."
                        }
                      </p>
                      {searchTerm || selectedCategory ? (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedCategory('');
                          }}
                          className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Effacer les filtres
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedProducts.map((produit, index) => (
                  <tr
                    key={produit.id}
                    className={`transition-all duration-300 transform hover:scale-[1.01] animate-fade-in-up cursor-pointer ${
                      index % 2 === 0
                        ? 'bg-white hover:bg-blue-50'
                        : 'bg-blue-50/30 hover:bg-blue-100/50'
                    } hover:shadow-sm border-l-4 border-l-transparent hover:border-l-blue-400`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {produit.imageUrl ? (
                          <SecureImage
                            src={produit.imageUrl}
                            alt={produit.name}
                            className="h-10 w-10 rounded-lg object-cover transition-all duration-300 hover:scale-110 hover:shadow-lg hover:rotate-2"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center transition-all duration-300 hover:bg-gray-300 hover:scale-110">
                            <ImageIcon className="h-5 w-5 text-gray-400 transition-colors duration-300" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-medium text-gray-900">{produit.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-900 font-medium">
                        {formatPrice(produit.price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 transition-all duration-300 hover:bg-blue-200 hover:scale-105 hover:shadow-sm">
                        {categories.find(cat => cat.id === produit.categoryId)?.name || 'Non définie'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-xs font-medium ${
                        produit.stock === 0
                          ? 'text-red-600'
                          : produit.stock <= 10
                            ? 'text-yellow-600'
                            : 'text-green-600'
                      }`}>
                        {produit.stock} {produit.stock <= 1 ? 'unité' : 'unités'}
                      </div>
                      {produit.stock === 0 && (
                        <div className="text-xs text-red-500 animate-pulse">Rupture de stock</div>
                      )}
                      {produit.stock > 0 && produit.stock <= 10 && (
                        <div className="text-xs text-yellow-500 animate-bounce">Stock faible</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate" title={produit.description}>
                        {produit.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(produit)}
                          className="text-indigo-600 hover:text-indigo-900 p-2 rounded-md hover:bg-indigo-50 transition-all duration-300 transform hover:scale-110 hover:rotate-12 hover:shadow-md"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(produit)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50 transition-all duration-300 transform hover:scale-110 hover:-rotate-12 hover:shadow-md"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modaux */}
      <AjouterProduitModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onProductAdded={() => handleProductAction(false)}
        editMode={false}
      />

      <AjouterProduitModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setCurrentProduit(null);
        }}
        onProductAdded={() => handleProductAction(true)}
        editMode={true}
        produit={currentProduit}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCurrentProduit(null);
        }}
        onConfirm={handleConfirmDelete}
        produitName={currentProduit?.name || ''}
        isDeleting={isDeleting}
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

export default AdminProduits;