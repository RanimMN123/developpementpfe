'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Building,
  Phone,
  MapPin,
  User,
  X,
  Save,
  AlertCircle,
  Mail
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import PageLayout, { PrimaryButton, SecondaryButton, Card, LoadingState, ErrorState, EmptyState } from '../components/PageLayout';
import SearchAndFilter from '../components/SearchAndFilter';
import SuccessNotification from '../../../components/SuccessNotification';
import ScrollToTop from '../components/ScrollToTop';
import './fournisseurs.css';

// Interfaces
interface Fournisseur {
  id: number;
  nom: string;
  adresse: string;
  numero: string;
  mail: string;
}

interface FournisseurFormData {
  nom: string;
  adresse: string;
  numero: string;
  mail: string;
}

// Composant Modal pour ajouter/modifier un fournisseur
const FournisseurModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (data: FournisseurFormData) => Promise<void>;
  fournisseur?: Fournisseur | null;
}> = ({ open, onClose, onSave, fournisseur }) => {
  const [formData, setFormData] = useState<FournisseurFormData>({
    nom: '',
    adresse: '',
    numero: '',
    mail: ''
  });
  const [errors, setErrors] = useState<Partial<FournisseurFormData>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (fournisseur) {
        setFormData({
          nom: fournisseur.nom,
          adresse: fournisseur.adresse,
          numero: fournisseur.numero,
          mail: fournisseur.mail
        });
      } else {
        setFormData({
          nom: '',
          adresse: '',
          numero: '',
          mail: ''
        });
      }
      setErrors({});
    }
  }, [open, fournisseur]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FournisseurFormData> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.adresse.trim()) {
      newErrors.adresse = 'L\'adresse est requise';
    }

    if (!formData.numero.trim()) {
      newErrors.numero = 'Le numéro de téléphone est requis';
    }

    if (!formData.mail.trim()) {
      newErrors.mail = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.mail)) {
      newErrors.mail = 'L\'email n\'est pas valide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: keyof FournisseurFormData) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-start justify-end z-50 pt-4 pr-4">
      <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {fournisseur ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
              </h2>
              <p className="text-green-100 text-sm mt-1">
                {fournisseur ? 'Modifiez les informations du fournisseur' : 'Ajoutez un nouveau fournisseur à votre base'}
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
              <Building size={20} className="text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">Informations générales</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={handleFieldChange('nom')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.nom ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Entrez le nom du fournisseur"
                />
                {errors.nom && (
                  <p className="text-red-500 text-sm mt-1">{errors.nom}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={formData.numero}
                  onChange={handleFieldChange('numero')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.numero ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Entrez le numéro de téléphone"
                />
                {errors.numero && (
                  <p className="text-red-500 text-sm mt-1">{errors.numero}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.mail}
                  onChange={handleFieldChange('mail')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.mail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Entrez l'email du fournisseur"
                />
                {errors.mail && (
                  <p className="text-red-500 text-sm mt-1">{errors.mail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={20} className="text-teal-600" />
              <h3 className="text-lg font-semibold text-gray-800">Adresse</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse complète
              </label>
              <textarea
                value={formData.adresse}
                onChange={handleFieldChange('adresse')}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.adresse ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Entrez l'adresse complète"
              />
              {errors.adresse && (
                <p className="text-red-500 text-sm mt-1">{errors.adresse}</p>
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
    </div>
  );
};

// Composant de confirmation de suppression
const DeleteConfirmModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fournisseurName: string;
}> = ({ open, onClose, onConfirm, fournisseurName }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="flex-1 cursor-pointer" onClick={onClose}></div>
      <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
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
            Êtes-vous sûr de vouloir supprimer le fournisseur <strong>"{fournisseurName}"</strong> ?
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

export default function FournisseursPage() {
  const router = useRouter();
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [filteredFournisseurs, setFilteredFournisseurs] = useState<Fournisseur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState<Fournisseur | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fournisseurToDelete, setFournisseurToDelete] = useState<Fournisseur | null>(null);

  // États pour les notifications de succès
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

  // Fetch data
  const fetchFournisseurs = async () => {
    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fournisseurs`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des fournisseurs');
      }

      const data = await response.json();
      setFournisseurs(data.fournisseurs || data);
      setFilteredFournisseurs(data.fournisseurs || data);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des fournisseurs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  // Écouter l'événement personnalisé pour ouvrir le modal d'ajout
  useEffect(() => {
    const handleOpenAddFournisseurModal = () => {
      setSelectedFournisseur(null);
      setShowModal(true);
    };

    window.addEventListener('open-add-fournisseur-modal', handleOpenAddFournisseurModal);

    return () => {
      window.removeEventListener('open-add-fournisseur-modal', handleOpenAddFournisseurModal);
    };
  }, []);

  // Filter fournisseurs based on search
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFournisseurs(fournisseurs);
    } else {
      const filtered = fournisseurs.filter(fournisseur =>
        fournisseur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fournisseur.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fournisseur.numero.includes(searchTerm) ||
        fournisseur.mail.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFournisseurs(filtered);
    }
  }, [searchTerm, fournisseurs]);



  // Handle save fournisseur
  const handleSaveFournisseur = async (formData: FournisseurFormData) => {
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = selectedFournisseur
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/fournisseurs/${selectedFournisseur.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/fournisseurs`;

      const method = selectedFournisseur ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erreur de réponse:', response.status, errorData);
        throw new Error(`Erreur lors de la sauvegarde: ${response.status} - ${errorData}`);
      }

      await fetchFournisseurs();
      setSelectedFournisseur(null);

      // Afficher la notification de succès
      setSuccessMessage({
        title: selectedFournisseur ? 'Modification réussie !' : 'Ajout réussi !',
        message: selectedFournisseur ? 'Le fournisseur a été modifié avec succès.' : 'Le fournisseur a été ajouté avec succès.'
      });
      setShowSuccessNotification(true);
    } catch (err) {
      console.error('Erreur:', err);
      throw err;
    }
  };

  // Handle delete fournisseur
  const handleDeleteFournisseur = async () => {
    if (!fournisseurToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fournisseurs/${fournisseurToDelete.id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      await fetchFournisseurs();
      setShowDeleteModal(false);
      setFournisseurToDelete(null);

      // Afficher la notification de succès
      setSuccessMessage({
        title: 'Suppression réussie !',
        message: 'Le fournisseur a été supprimé avec succès.'
      });
      setShowSuccessNotification(true);
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  // Handle edit fournisseur
  const handleEditFournisseur = (fournisseur: Fournisseur) => {
    setSelectedFournisseur(fournisseur);
    setShowModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirmation = (fournisseur: Fournisseur) => {
    setFournisseurToDelete(fournisseur);
    setShowDeleteModal(true);
  };

  if (isLoading) {
    return (
      <PageLayout title="Fournisseurs">
        <LoadingState />
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Fournisseurs">
        <ErrorState message={error} onRetry={fetchFournisseurs} />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Fournisseurs">
      {/* Search and Filter */}
      <SearchAndFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Rechercher par nom, adresse, téléphone ou email..."
      />

      {/* Add Button */}
      <div className="mb-6">
        <PrimaryButton
          onClick={() => {
            setSelectedFournisseur(null);
            setShowModal(true);
          }}
          icon={<Plus size={16} />}
        >
          Ajouter un fournisseur
        </PrimaryButton>
      </div>

      {/* Fournisseurs List */}
      {filteredFournisseurs.length === 0 ? (
        <EmptyState
          title="Aucun fournisseur trouvé"
          description={searchTerm ? "Aucun fournisseur ne correspond à votre recherche." : "Commencez par ajouter votre premier fournisseur."}
          action={
            !searchTerm ? (
              <PrimaryButton
                onClick={() => {
                  setSelectedFournisseur(null);
                  setShowModal(true);
                }}
                icon={<Plus size={16} />}
              >
                Ajouter un fournisseur
              </PrimaryButton>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFournisseurs.map((fournisseur) => (
            <Card key={fournisseur.id} className="fournisseur-card">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                      <Building size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {fournisseur.nom}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Fournisseur
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditFournisseur(fournisseur)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteConfirmation(fournisseur)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600">{fournisseur.numero}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={16} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 truncate">{fournisseur.mail}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 line-clamp-2">{fournisseur.adresse}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <FournisseurModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedFournisseur(null);
        }}
        onSave={handleSaveFournisseur}
        fournisseur={selectedFournisseur}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setFournisseurToDelete(null);
        }}
        onConfirm={handleDeleteFournisseur}
        fournisseurName={fournisseurToDelete?.nom || ''}
      />

      {/* Success Notification */}
      <SuccessNotification
        isOpen={showSuccessNotification}
        title={successMessage.title}
        message={successMessage.message}
        onClose={() => setShowSuccessNotification(false)}
      />

      {/* Scroll to Top */}
      <ScrollToTop />
    </PageLayout>
  );
}
