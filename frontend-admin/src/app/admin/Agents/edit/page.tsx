'use client';

import React, { useState, useEffect } from 'react';
import {
  Edit,
  Trash2,
  User,
  Mail,
  Lock,
  Calendar,
  AlertCircle,
  Users as UsersIcon,
  X,
  Save
} from 'lucide-react';
import PageLayout, { PrimaryButton, SecondaryButton, LoadingState, ErrorState, EmptyState } from '../../components/PageLayout';
import SearchAndFilter from '../../components/SearchAndFilter';
import SuccessNotification from '../../../../components/SuccessNotification';
import { apiUtils } from '../../../../utils/apiUtils';
import { formatDate as formatDateUtil } from '../../../../utils/dateUtils';
import '../../produits/animations.css';

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

// Composant Modal pour ajouter/modifier un agent
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
                {editMode ? 'Modifier l\'agent' : 'Nouvel agent'}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {editMode ? 'Modifiez les informations de l\'agent' : 'Créez un nouveau compte agent'}
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
            Êtes-vous sûr de vouloir supprimer l&apos;agent <strong>&quot;{userEmail}&quot;</strong> ?
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

export default function EditAgentPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Notification states
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');

      const data = await apiUtils.get('/users');
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des agents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Écouteur d'événement supprimé car le bouton d'ajout n'existe plus

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

  // Handle save user (modification uniquement)
  const handleSaveUser = async (formData: UserFormData) => {
    if (!selectedUser) return; // Seulement pour la modification

    try {
      // Préparer les données à envoyer pour la modification
      const bodyData: Record<string, string> = {};

      // N'envoyer que les champs modifiés
      if (formData.name && formData.name.trim()) {
        bodyData.name = formData.name;
      }
      if (formData.email && formData.email.trim()) {
        bodyData.email = formData.email;
      }
      if (formData.password && formData.password.trim()) {
        bodyData.password = formData.password;
      }

      await apiUtils.put(`/users/${selectedUser.id}`, bodyData);

      await fetchUsers();
      setSelectedUser(null);
      setError(''); // Effacer les erreurs précédentes

      // Afficher la notification de succès
      setSuccessMessage({
        title: '✏️ Modification réussie !',
        message: `Les informations de l'agent "${formData.name}" ont été mises à jour avec succès.`
      });
      setShowSuccessNotification(true);

      // Fermer automatiquement la notification après 4 secondes
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 4000);
    } catch (err) {
      console.error('Erreur:', err);
      throw err;
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await apiUtils.delete(`/users/${userToDelete.id}`);

      await fetchUsers();
      setShowDeleteModal(false);
      const deletedUserName = userToDelete.name || userToDelete.email;
      setUserToDelete(null);
      setError(''); // Effacer les erreurs précédentes

      // Afficher la notification de succès
      setSuccessMessage({
        title: '🗑️ Suppression réussie !',
        message: `L'agent "${deletedUserName}" a été supprimé définitivement de votre équipe.`
      });
      setShowSuccessNotification(true);

      // Fermer automatiquement la notification après 4 secondes
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 4000);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors de la suppression de l\'agent');
    }
  };

  // Utiliser l'utilitaire de date sécurisé
  const formatDate = formatDateUtil;

  // Render table cell (fonction utilitaire pour référence future)
  // const renderCell = (user: User, column: { key: string }) => {
  //   switch (column.key) {
  //     case 'email':
  //       return (
  //         <div className="flex items-center gap-3">
  //           <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
  //             <User size={16} className="text-blue-600" />
  //           </div>
  //           <div>
  //             <div className="font-medium text-gray-900">{user.name || 'Nom non défini'}</div>
  //             <div className="text-sm text-gray-500">{user.email}</div>
  //             <div className="text-xs text-gray-400">ID: {user.id}</div>
  //           </div>
  //         </div>
  //       );
  //     case 'createdAt':
  //       return (
  //         <div className="text-gray-600">
  //           <div className="flex items-center gap-1">
  //             <Calendar size={14} className="text-gray-400" />
  //             {formatDate(user.createdAt)}
  //           </div>
  //         </div>
  //       );
  //     case 'updatedAt':
  //       return (
  //         <div className="text-gray-600">
  //           <div className="flex items-center gap-1">
  //             <Calendar size={14} className="text-gray-400" />
  //             {formatDate(user.updatedAt)}
  //           </div>
  //         </div>
  //       );
  //     case 'actions':
  //       return (
  //         <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
  //           <button
  //             onClick={() => {
  //               setSelectedUser(user);
  //               setShowEditModal(true);
  //             }}
  //             className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
  //             title="Modifier"
  //           >
  //             <Edit size={16} />
  //           </button>
  //           <button
  //             onClick={() => {
  //               setUserToDelete(user);
  //               setShowDeleteModal(true);
  //             }}
  //             className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
  //             title="Supprimer"
  //           >
  //             <Trash2 size={16} />
  //           </button>
  //         </div>
  //       );
  //     default:
  //       return user[column.key as keyof User];
  //   }
  // };

  return (
    <PageLayout
      title="Edit agent"
      description="Gérez les comptes agents du système"
      onRefresh={fetchUsers}
      isLoading={isLoading}
    >
      {error && (
        <ErrorState
          message={error}
          onRetry={fetchUsers}
        />
      )}

      <SearchAndFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Rechercher un agent..."
      />

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
          icon={<UsersIcon size={48} className="mx-auto text-gray-400" />}
          action={null}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden transform transition-all duration-500 hover:shadow-xl hover:border-blue-200">
          <div className="overflow-x-auto table-scroll smooth-scroll momentum-scroll scroll-fade relative">
            {/* Titre du tableau */}
            <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">
                  Gestion des agents
                </h3>
                <p className="text-slate-500 text-xs">
                  {filteredUsers.length} agent{filteredUsers.length > 1 ? 's' : ''} enregistré{filteredUsers.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <table className="min-w-full divide-y divide-blue-100">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Agent commercial
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Adresse email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Date de création
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Dernière modification
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <UsersIcon className="w-12 h-12 text-gray-300 mb-3" />
                        <h3 className="text-base font-medium text-gray-900 mb-2">Aucun agent trouvé</h3>
                        <p className="text-gray-500 text-sm">
                          {searchTerm
                            ? "Aucun agent ne correspond à votre recherche."
                            : "Commencez par ajouter votre premier agent."
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
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
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:rotate-2">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-xs font-medium text-gray-900">{user.name || 'Agent'}</div>
                            <div className="text-xs text-gray-500">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-xs text-gray-900">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-xs text-gray-600">
                          <Calendar size={14} className="text-gray-400 mr-1" />
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-xs text-gray-600">
                          <Calendar size={14} className="text-gray-400 mr-1" />
                          {formatDate(user.updatedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 p-2 rounded-md hover:bg-indigo-50 transition-all duration-300 transform hover:scale-110 hover:rotate-12 hover:shadow-md"
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

      {/* Notification de succès */}
      <SuccessNotification
        isOpen={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        title={successMessage.title}
        message={successMessage.message}
      />
    </PageLayout>
  );
}
