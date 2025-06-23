'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, X, Search, RefreshCw, User, Building, Phone, MapPin, Loader2, AlertCircle } from 'lucide-react';

// Définition des interfaces pour les types
interface Client {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  userId: number;
}

interface User {
  id: number;
  email: string;
}

interface ClientFormData {
  name: string;
  address: string;
  phoneNumber: string;
  userId: number;
}

interface AjouterClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientAdded: () => void;
  users: User[];
}

interface ModifierClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientUpdated: () => void;
  client: Client | null;
  users: User[];
}

// Composant Modal pour ajouter un client
const AjouterClientModal: React.FC<AjouterClientModalProps> = ({ isOpen, onClose, onClientAdded, users }) => {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    address: '',
    phoneNumber: '',
    userId: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    address?: string;
    phoneNumber?: string;
    userId?: string;
  }>({});

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        address: '',
        phoneNumber: '',
        userId: users.length > 0 ? users[0].id : 0,
      });
      setFormErrors({});
      setError('');
      setSuccess('');
    }
  }, [isOpen, users]);

  const validateForm = (): boolean => {
    const errors: {
      name?: string;
      address?: string;
      phoneNumber?: string;
      userId?: string;
    } = {};

    if (!formData.name.trim()) {
      errors.name = 'Le nom du client est requis';
    }

    if (!formData.address.trim()) {
      errors.address = 'L\'adresse est requise';
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Le numéro de téléphone est requis';
    } else if (!/^[0-9+\s()-]{6,20}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Format de téléphone invalide';
    }

    if (!formData.userId) {
      errors.userId = 'Veuillez sélectionner un responsable';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'userId' ? parseInt(value, 10) : value
    }));
    
    // Supprimer l'erreur pour ce champ s'il y en a une
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la création du client');
      }

      setSuccess('Client ajouté avec succès');
      
      // Notify parent component
      onClientAdded();
      
      // Close modal after 1.5s
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du client';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent h-full w-full z-50 flex items-start justify-end backdrop-blur-md transition-all duration-300 pt-4 pr-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Ajouter un Client</h3>
          <button 
            type="button" 
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-100 hover:text-gray-500 rounded-full p-2 transition-colors duration-200"
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
            {/* Nom du client */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom du client*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Nom de l'entreprise ou du client"
                  value={formData.name}
                  onChange={handleChange}
                  className={`pl-10 pr-4 py-2 w-full border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
            </div>

            {/* Adresse */}
            <div className="space-y-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Adresse*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={18} className="text-gray-400" />
                </div>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  placeholder="Adresse complète du client"
                  value={formData.address}
                  onChange={handleChange}
                  className={`pl-10 pr-4 py-2 w-full border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
            </div>

            {/* Numéro de téléphone */}
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Numéro de téléphone*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Ex: +33 1 23 45 67 89"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`pl-10 pr-4 py-2 w-full border ${formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              {formErrors.phoneNumber && <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumber}</p>}
            </div>

            {/* Responsable */}
            <div className="space-y-2">
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                Responsable*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <select
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  className={`pl-10 pr-4 py-2 w-full border ${formErrors.userId ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="0">Sélectionnez un responsable</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.email.split('@')[0]}
                    </option>
                  ))}
                </select>
              </div>
              {formErrors.userId && <p className="text-red-500 text-xs mt-1">{formErrors.userId}</p>}
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
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                    Ajout en cours...
                  </span>
                ) : 'Ajouter le client'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant Modal pour modifier un client
const ModifierClientModal: React.FC<ModifierClientModalProps> = ({ isOpen, onClose, onClientUpdated, client, users }) => {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    address: '',
    phoneNumber: '',
    userId: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    address?: string;
    phoneNumber?: string;
    userId?: string;
  }>({});

  // Charger les détails du client lorsque le modal s'ouvre
  useEffect(() => {
    if (isOpen && client) {
      setFormData({
        name: client.name,
        address: client.address,
        phoneNumber: client.phoneNumber,
        userId: client.userId,
      });
      setFormErrors({});
      setError('');
      setSuccess('');
    }
  }, [isOpen, client]);

  const validateForm = (): boolean => {
    const errors: {
      name?: string;
      address?: string;
      phoneNumber?: string;
      userId?: string;
    } = {};

    if (!formData.name.trim()) {
      errors.name = 'Le nom du client est requis';
    }

    if (!formData.address.trim()) {
      errors.address = 'L\'adresse est requise';
    }

    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Le numéro de téléphone est requis';
    } else if (!/^[0-9+\s()-]{6,20}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Format de téléphone invalide';
    }

    if (!formData.userId) {
      errors.userId = 'Veuillez sélectionner un responsable';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'userId' ? parseInt(value, 10) : value
    }));
    
    // Supprimer l'erreur pour ce champ s'il y en a une
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!client) return;
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/clients/${client.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la modification du client');
      }

      setSuccess('Client modifié avec succès');
      
      // Notify parent component
      onClientUpdated();
      
      // Close modal after 1.5s
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification du client';
      setError(errorMessage);
      console.error('Erreur:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-transparent h-full w-full z-50 flex items-start justify-end backdrop-blur-md transition-all duration-300 pt-4 pr-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 transform transition-all duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Modifier le Client</h3>
          <button 
            type="button" 
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-100 hover:text-gray-500 rounded-full p-2 transition-colors duration-200"
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
            {/* Nom du client */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom du client*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Nom de l'entreprise ou du client"
                  value={formData.name}
                  onChange={handleChange}
                  className={`pl-10 pr-4 py-2 w-full border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
            </div>

            {/* Adresse */}
            <div className="space-y-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Adresse*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin size={18} className="text-gray-400" />
                </div>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  placeholder="Adresse complète du client"
                  value={formData.address}
                  onChange={handleChange}
                  className={`pl-10 pr-4 py-2 w-full border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
            </div>

            {/* Numéro de téléphone */}
            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Numéro de téléphone*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="Ex: +33 1 23 45 67 89"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`pl-10 pr-4 py-2 w-full border ${formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
              {formErrors.phoneNumber && <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumber}</p>}
            </div>

            {/* Responsable */}
            <div className="space-y-2">
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                Responsable*
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-400" />
                </div>
                <select
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  className={`pl-10 pr-4 py-2 w-full border ${formErrors.userId ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="0">Sélectionnez un responsable</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.email.split('@')[0]}
                    </option>
                  ))}
                </select>
              </div>
              {formErrors.userId && <p className="text-red-500 text-xs mt-1">{formErrors.userId}</p>}
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
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
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
  clientName: string;
}

// Composant de confirmation de suppression
const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, onClose, onConfirm, clientName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent h-full w-full z-50 flex items-start justify-end backdrop-blur-md transition-all duration-300 pt-4 pr-4">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Confirmer la suppression</h3>
          <button 
            type="button" 
            onClick={onClose}
            className="text-gray-400 hover:bg-gray-100 hover:text-gray-500 rounded-full p-2 transition-colors duration-200"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-6 text-gray-700">
            <p>Êtes-vous sûr de vouloir supprimer le client <strong>&quot;{clientName}&quot;</strong> ?</p>
            <p className="mt-2 text-sm text-red-600">Cette action est irréversible.</p>
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

// Composant principal AdminClients
const AdminClients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clients`);
      if (!response.ok) throw new Error('Erreur lors du chargement des clients');
      
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        setClients(data);
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

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);
      if (!response.ok) throw new Error('Erreur lors du chargement des utilisateurs');
      
      const data = await response.json();
      setUsers(data);
    } catch (err: unknown) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchUsers();
  }, []);

  const handleEditClick = (client: Client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_API}/api/clients/${clientToDelete.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la suppression: ${response.status}`);
      }
      
      // Fermer le modal et rafraîchir la liste
      setShowDeleteModal(false);
      fetchClients();
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      console.error('Erreur:', err);
      setShowDeleteModal(false);
    }
  };

  // Filtrage des clients en fonction des termes de recherche
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction pour obtenir le nom d'utilisateur associé
  const getUserEmail = (userId: number): string => {
    const user = users.find(u => u.id === userId);
    return user ? user.email.split('@')[0] : 'Inconnu';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="flex items-center justify-center p-6 rounded-lg shadow-md bg-white">
          <Loader2 size={36} className="animate-spin text-blue-600 mr-2" />
          <p className="text-lg text-gray-700">Chargement des clients...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="flex items-center p-6 rounded-lg shadow-md bg-white">
          <AlertCircle size={36} className="text-red-600 mr-2" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Erreur de chargement</h3>
            <p className="text-gray-700">{error}</p>
            <button 
              onClick={fetchClients}
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <RefreshCw size={18} className="mr-2" />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Clients</h1>
          <p className="mt-2 text-gray-600">Gérez vos clients et leurs informations de contact</p>
        </header>

        <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Ajouter un client
          </button>
        </div>

        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="flex flex-col items-center">
              <Building size={64} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {searchTerm ? 'Aucun client trouvé' : 'Aucun client disponible'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Essayez de modifier vos critères de recherche.'
                  : 'Commencez par ajouter un nouveau client à votre base de données.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                >
                  Réinitialiser la recherche
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coordonnées
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responsable
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 mb-1">
                          <MapPin size={16} className="inline mr-1 text-gray-400" />
                          {client.address.split('\n').map((line, index) => (
                            <span key={index}>
                              {line}
                              {index < client.address.split('\n').length - 1 && <br />}
                            </span>
                          ))}
                        </div>
                        <div className="text-sm text-gray-900">
                          <Phone size={16} className="inline mr-1 text-gray-400" />
                          {client.phoneNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User size={16} className="text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{getUserEmail(client.userId)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEditClick(client)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <span className="sr-only">Modifier</span>
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(client)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <span className="sr-only">Supprimer</span>
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal pour ajouter un client */}
      <AjouterClientModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onClientAdded={fetchClients}
        users={users}
      />
      
      {/* Modal pour modifier un client */}
      <ModifierClientModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        onClientUpdated={fetchClients}
        client={selectedClient}
        users={users}
      />
      
      {/* Modal de confirmation de suppression */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        clientName={clientToDelete?.name || ''}
      />
    </div>
  );
};

export default AdminClients;