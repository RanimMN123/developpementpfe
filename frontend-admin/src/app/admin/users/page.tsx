'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  User,
  Mail,
  Lock,
  Calendar,
  AlertCircle,
  Users as UsersIcon,
  X,
  Save,
  CheckCircle
} from 'lucide-react';
import PageLayout, { PrimaryButton, SecondaryButton, LoadingState, ErrorState, EmptyState } from '../components/PageLayout';
import SearchAndFilter from '../components/SearchAndFilter';
import ScrollToTop from '../components/ScrollToTop';
import './users.css';

// Interfaces
interface User {
  id: number;
  name: string | null;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Composant Modal pour ajouter/modifier un utilisateur
const UserModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => Promise<void>;
  user?: User | null;
  editMode?: boolean;
}> = ({ open, onClose, onSave, user, editMode = false }) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (user && editMode) {
        setFormData({
          name: user.name || '',
          email: user.email,
          password: '',
          confirmPassword: ''
        });
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
      }
      setErrors({});
    }
  }, [open, user, editMode]);

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    // Validation nom
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    }

    // Validation email
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Validation mot de passe (requis seulement pour création ou si rempli en édition)
    if (!editMode || formData.password) {
      if (!formData.password) {
        newErrors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      }

      // Validation confirmation mot de passe
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: keyof UserFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {editMode ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {editMode ? 'Modifiez les informations de l\'utilisateur' : 'Créez un nouveau compte utilisateur'}
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
          {/* En-tête du formulaire */}
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-blue-600" />
            </div>
          </div>

          {/* Champ Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={handleFieldChange('name')}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Nom et prénom"
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Champ Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={16} className="text-gray-400" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={handleFieldChange('email')}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="exemple@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Champ Mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {editMode ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-gray-400" />
              </div>
              <input
                type="password"
                value={formData.password}
                onChange={handleFieldChange('password')}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder={editMode ? 'Laissez vide pour ne pas changer' : 'Minimum 6 caractères'}
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Champ Confirmation mot de passe */}
          {(!editMode || formData.password) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleFieldChange('confirmPassword')}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Répétez le mot de passe"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          )}
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
            {saving ? (editMode ? 'Modification...' : 'Création...') : (editMode ? 'Modifier' : 'Créer')}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

// Composant de confirmation de suppression
const DeleteConfirmModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail: string;
}> = ({ open, onClose, onConfirm, userEmail }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
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
            Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>"{userEmail}"</strong> ?
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
    </div>
  );
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:3000/users', {
        headers,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des utilisateurs');
      }

      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Écouter l'événement personnalisé pour ouvrir le modal d'ajout
  useEffect(() => {
    const handleOpenAddUserModal = () => {
      setSelectedUser(null);
      setShowModal(true);
    };

    window.addEventListener('open-add-user-modal', handleOpenAddUserModal);

    return () => {
      window.removeEventListener('open-add-user-modal', handleOpenAddUserModal);
    };
  }, []);

  // Filter users based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Handle save user
  const handleSaveUser = async (formData: UserFormData) => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = selectedUser
        ? `http://localhost:3000/users/${selectedUser.id}`
        : 'http://localhost:3000/users';

      const method = selectedUser ? 'PUT' : 'POST';

      // Préparer les données à envoyer
      const bodyData: any = {};

      // Pour la création, tous les champs sont requis
      if (!selectedUser) {
        bodyData.name = formData.name;
        bodyData.email = formData.email;
        bodyData.password = formData.password;
      } else {
        // Pour la modification, n'envoyer que les champs modifiés
        if (formData.name && formData.name.trim()) {
          bodyData.name = formData.name;
        }
        if (formData.email && formData.email.trim()) {
          bodyData.email = formData.email;
        }
        if (formData.password && formData.password.trim()) {
          bodyData.password = formData.password;
        }
      }

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde');
      }

      await fetchUsers();
      setSelectedUser(null);
    } catch (err) {
      console.error('Erreur:', err);
      throw err;
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:3000/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      await fetchUsers();
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la suppression de l\'utilisateur');
    }
  };

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Ces fonctions ne sont plus nécessaires car nous utilisons un tableau personnalisé identique aux clients

  return (
    <PageLayout
      title="Edit agent"
      description="Gérez les comptes agents du système"
      onRefresh={fetchUsers}
      isLoading={isLoading}
      actions={
        <PrimaryButton
          onClick={() => {
            setSelectedUser(null);
            setShowModal(true);
          }}
          icon={<Plus size={18} className="icon-animate" />}
          className="animate-button-pulse"
        >
          Ajouter un agent
        </PrimaryButton>
      }
    >
      {error && (
        <ErrorState
          message={error}
          onRetry={fetchUsers}
        />
      )}

      <div className="animate-slide-in-left">
        <SearchAndFilter
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Rechercher un agent..."
        />
      </div>

      {isLoading ? (
        <LoadingState message="Chargement des agents..." />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="Aucun agent trouvé"
          description={
            searchTerm
              ? 'Aucun agent ne correspond à votre recherche.'
              : 'Vous n\'avez pas encore d\'agents.'
          }
          icon={<UsersIcon size={48} className="mx-auto text-gray-400 animate-bounce-in" />}
          action={
            !searchTerm && (
              <PrimaryButton
                onClick={() => {
                  setSelectedUser(null);
                  setShowModal(true);
                }}
                icon={<Plus size={16} className="icon-animate" />}
                className="animate-scale-in"
              >
                Ajouter votre premier agent
              </PrimaryButton>
            )
          }
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden transform transition-all duration-500 hover:shadow-md">
          <div className="overflow-x-auto table-scroll smooth-scroll momentum-scroll scroll-fade relative">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de création
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière mise à jour
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <UsersIcon size={48} className="text-gray-300 mb-3 animate-bounce-in" />
                        <p className="text-gray-500 text-sm">
                          Aucun agent trouvé
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-all duration-300 transform hover:scale-[1.01] animate-fade-in-up cursor-pointer"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both'
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:rotate-2">
                            <User size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name || 'Agent'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar size={14} className="text-gray-400" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar size={14} className="text-gray-400" />
                          {formatDate(user.updatedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-all duration-300 transform hover:scale-110 hover:rotate-12 hover:shadow-md"
                            title="Modifier"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setUserToDelete(user);
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
      <UserModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
        user={selectedUser}
        editMode={false}
      />

      <UserModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveUser}
        user={selectedUser}
        editMode={true}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteUser}
        userEmail={userToDelete?.email || ''}
      />

      {/* Composant de scroll amélioré */}
      <ScrollToTop />
    </PageLayout>
  );
}
