'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Building,
  MapPin,
  User,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import PageLayout, { PrimaryButton, SecondaryButton, LoadingState, ErrorState, EmptyState } from '../components/PageLayout';
import SearchAndFilter from '../components/SearchAndFilter';
import SuccessNotification from '../../../components/SuccessNotification';
import ScrollToTop from '../components/ScrollToTop';
import './clients.css';

// Interfaces
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

interface ClientFormErrors {
  name?: string;
  address?: string;
  phoneNumber?: string;
  userId?: string;
}

// Composant Modal pour ajouter/modifier un client
const ClientModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (data: ClientFormData) => Promise<void>;
  client?: Client | null;
  users: User[];
}> = ({ open, onClose, onSave, client, users }) => {
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    address: '',
    phoneNumber: '',
    userId: 0
  });
  const [errors, setErrors] = useState<ClientFormErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (client) {
        setFormData({
          name: client.name,
          address: client.address,
          phoneNumber: client.phoneNumber,
          userId: client.userId
        });
      } else {
        setFormData({
          name: '',
          address: '',
          phoneNumber: '',
          userId: 0
        });
      }
      setErrors({});
    }
  }, [open, client]);

  const validateForm = (): boolean => {
    const newErrors: ClientFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom du client est requis';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'L\'adresse est requise';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Le numéro de téléphone est requis';
    }

    if (!formData.userId || formData.userId === 0) {
      newErrors.userId = 'Veuillez sélectionner un responsable';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: keyof ClientFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = field === 'userId' ? parseInt(event.target.value) : event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="flex-1 cursor-pointer" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {client ? 'Modifier le client' : 'Nouveau client'}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {client ? 'Modifiez les informations du client' : 'Ajoutez un nouveau client à votre base'}
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

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Informations générales */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building size={20} className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">Informations générales</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du client
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleFieldChange('name')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Entrez le nom du client"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleFieldChange('phoneNumber')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Entrez le numéro de téléphone"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">Adresse</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse complète
              </label>
              <textarea
                value={formData.address}
                onChange={handleFieldChange('address')}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Entrez l'adresse complète"
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Responsable */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User size={20} className="text-amber-600" />
              <h3 className="text-lg font-semibold text-gray-800">Responsable</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sélectionner un responsable
              </label>
              <select
                value={formData.userId}
                onChange={handleFieldChange('userId')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.userId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value={0}>Choisissez un responsable</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email.split('@')[0]}
                  </option>
                ))}
              </select>
              {errors.userId && (
                <p className="text-red-500 text-sm mt-1">{errors.userId}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
          <SecondaryButton onClick={onClose}>
            Annuler
          </SecondaryButton>
          <PrimaryButton
            onClick={handleSubmit}
            disabled={saving}
            loading={saving}
            icon={<Save size={16} />}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </PrimaryButton>
        </div>
      </div>
      <div className="flex-1 cursor-pointer" onClick={onClose}></div>
    </div>
  );
};

// Composant de confirmation de suppression
const DeleteConfirmModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clientName: string;
}> = ({ open, onClose, onConfirm, clientName }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="flex-1 cursor-pointer" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Confirmer la suppression</h3>
            </div>
          </div>

          <p className="text-gray-600 mb-6">
            Êtes-vous sûr de vouloir supprimer le client <strong>&quot;{clientName}&quot;</strong> ?
            <br />
            <span className="text-red-600 text-sm">Cette action est irréversible.</span>
          </p>

          <div className="flex justify-end gap-3">
            <SecondaryButton onClick={onClose}>
              Annuler
            </SecondaryButton>
            <PrimaryButton
              onClick={onConfirm}
              icon={<Trash2 size={16} />}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Supprimer
            </PrimaryButton>
          </div>
        </div>
      </div>
      <div className="flex-1 cursor-pointer" onClick={onClose}></div>
    </div>
  );
};

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // États pour les notifications de succès
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

  // Fetch data
  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:3000/api/clients', {
        headers,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des clients');
      }

      const data = await response.json();
      setClients(data);
      setFilteredClients(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des clients');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:3000/users', {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs:', err);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchUsers();
  }, []);

  // Écouter l'événement personnalisé pour ouvrir le modal d'ajout
  useEffect(() => {
    const handleOpenAddClientModal = () => {
      setSelectedClient(null);
      setShowModal(true);
    };

    window.addEventListener('open-add-client-modal', handleOpenAddClientModal);

    return () => {
      window.removeEventListener('open-add-client-modal', handleOpenAddClientModal);
    };
  }, []);

  // Filter clients based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phoneNumber.includes(searchTerm)
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  // Get user name by ID
  const getUserName = (userId: number): string => {
    const user = users.find(u => u.id === userId);
    return user ? user.email.split('@')[0] : 'Inconnu';
  };

  // Handle save client
  const handleSaveClient = async (formData: ClientFormData) => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = selectedClient
        ? `http://localhost:3000/api/clients/${selectedClient.id}`
        : 'http://localhost:3000/api/clients';

      const method = selectedClient ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      await fetchClients();
      setSelectedClient(null);

      // Afficher la notification de succès
      setSuccessMessage({
        title: selectedClient ? 'Modification réussie !' : 'Ajout réussi !',
        message: selectedClient ? 'Le client a été modifié avec succès.' : 'Le client a été ajouté avec succès.'
      });
      setShowSuccessNotification(true);
    } catch (err) {
      console.error('Erreur:', err);
      throw err;
    }
  };

  // Handle delete client
  const handleDeleteClient = async () => {
    if (!clientToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:3000/api/clients/${clientToDelete.id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      await fetchClients();
      setShowDeleteModal(false);
      setClientToDelete(null);

      // Afficher la notification de succès
      setSuccessMessage({
        title: 'Suppression réussie !',
        message: 'Le client a été supprimé avec succès.'
      });
      setShowSuccessNotification(true);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la suppression du client');
    }
  };

  // Navigate to client details
  const navigateToClientDetails = (clientId: number) => {
    router.push(`/admin/clients/${clientId}`);
  };

  // Ces fonctions ne sont plus nécessaires car nous utilisons un tableau personnalisé

  return (
    <PageLayout
      title="Clients"
      description="Gérez vos clients et leurs informations"
      onRefresh={fetchClients}
      isLoading={isLoading}
      actions={
        <PrimaryButton
          onClick={() => {
            setSelectedClient(null);
            setShowModal(true);
          }}
          icon={<Plus size={18} className="icon-animate" />}
          className="animate-button-pulse"
        >
          Ajouter un client
        </PrimaryButton>
      }
    >
      {error && (
        <ErrorState
          message={error}
          onRetry={fetchClients}
        />
      )}

      <div className="animate-slide-in-left">
        <SearchAndFilter
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Rechercher un client..."
        />
      </div>

      {isLoading ? (
        <LoadingState message="Chargement des clients..." />
      ) : filteredClients.length === 0 ? (
        <EmptyState
          title="Aucun client trouvé"
          description={
            searchTerm
              ? 'Aucun client ne correspond à votre recherche.'
              : 'Vous n\'avez pas encore ajouté de clients.'
          }
          icon={<Building size={48} className="mx-auto text-gray-400 animate-bounce-in" />}
          action={
            !searchTerm && (
              <PrimaryButton
                onClick={() => {
                  setSelectedClient(null);
                  setShowModal(true);
                }}
                icon={<Plus size={16} className="icon-animate" />}
                className="animate-scale-in"
              >
                Ajouter votre premier client
              </PrimaryButton>
            )
          }
        />
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden transform transition-all duration-500 hover:shadow-xl hover:border-blue-200">
          <div className="overflow-x-auto table-scroll smooth-scroll momentum-scroll scroll-fade relative">
            {/* Titre du tableau */}
            <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">
                  Portefeuille clients
                </h3>
                <p className="text-slate-500 text-xs">
                  {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''} dans votre portefeuille
                </p>
              </div>
            </div>
            <table className="min-w-full divide-y divide-blue-100">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Entreprise cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Adresse de livraison
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Contact téléphonique
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Agent responsable
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-100">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <Building size={48} className="text-gray-300 mb-3 animate-bounce-in" />
                        <p className="text-gray-500 text-sm">
                          Aucun client trouvé
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client, index) => (
                    <tr
                      key={client.id}
                      className={`transition-all duration-300 transform hover:scale-[1.01] animate-fade-in-up cursor-pointer ${
                        index % 2 === 0
                          ? 'bg-white hover:bg-blue-50'
                          : 'bg-blue-50/30 hover:bg-blue-100/50'
                      } hover:shadow-sm border-l-4 border-l-transparent hover:border-l-blue-400`}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both'
                      }}
                      onClick={() => navigateToClientDetails(client.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:rotate-2">
                            <Building size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-900">{client.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-gray-600 max-w-xs truncate" title={client.address}>
                          {client.address.length > 50
                            ? `${client.address.substring(0, 50)}...`
                            : client.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-900">{client.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 transition-all duration-300 hover:bg-blue-200 hover:scale-105 hover:shadow-sm">
                          <User size={12} className="mr-1" />
                          {getUserName(client.userId)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              setShowModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-all duration-300 transform hover:scale-110 hover:rotate-12 hover:shadow-md"
                            title="Modifier"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setClientToDelete(client);
                              setShowDeleteModal(true);
                            }}
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
      )}

      {/* Modals */}
      <ClientModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedClient(null);
        }}
        onSave={handleSaveClient}
        client={selectedClient}
        users={users}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setClientToDelete(null);
        }}
        onConfirm={handleDeleteClient}
        clientName={clientToDelete?.name || ''}
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
}
