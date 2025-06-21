'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Shield, Save, X } from 'lucide-react';
import Modal from '../../../../components/Modal';
import { SecureInput, SecureEmailInput, SecurePasswordInput, SecurePhoneInput } from '../../../../components/SecureInput';
import { useSecureForm } from '../../../../hooks/useSecureApi';
import { useSecurity } from '../../../../utils/security';

interface Agent {
  id?: number;
  prenom: string;
  nom: string;
  email: string;
  password?: string;
  telephone: string;
  adresse: string;
  role: string;
  statut: string;
}

interface SecureAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  agent?: Agent | null;
}

const SecureAgentModal: React.FC<SecureAgentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  agent
}) => {
  const { validateFormData } = useSecurity();
  const secureApi = useSecureForm({
    onSuccess: () => {
      onSuccess();
      handleClose();
    },
    onError: (error) => {
      console.error('Erreur lors de la soumission:', error);
    }
  });

  // État du formulaire
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    password: '',
    telephone: '',
    adresse: '',
    role: 'Agent Commercial',
    statut: 'actif'
  });

  // Options disponibles
  const availableRoles = [
    'Agent Commercial',
    'Superviseur',
    'Manager',
    'Directeur Commercial'
  ];

  const availableStatuts = [
    { value: 'actif', label: 'Actif' },
    { value: 'inactif', label: 'Inactif' },
    { value: 'suspendu', label: 'Suspendu' }
  ];

  // Initialiser le formulaire avec les données de l'agent
  useEffect(() => {
    if (agent) {
      setFormData({
        prenom: agent.prenom || '',
        nom: agent.nom || '',
        email: agent.email || '',
        password: '', // Toujours vide pour la modification
        telephone: agent.telephone || '',
        adresse: agent.adresse || '',
        role: agent.role || 'Agent Commercial',
        statut: agent.statut || 'actif'
      });
    } else {
      // Réinitialiser pour un nouvel agent
      setFormData({
        prenom: '',
        nom: '',
        email: '',
        password: '',
        telephone: '',
        adresse: '',
        role: 'Agent Commercial',
        statut: 'actif'
      });
    }
  }, [agent, isOpen]);

  // Gérer les changements de champs
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Gérer la fermeture
  const handleClose = () => {
    setFormData({
      prenom: '',
      nom: '',
      email: '',
      password: '',
      telephone: '',
      adresse: '',
      role: 'Agent Commercial',
      statut: 'actif'
    });
    secureApi.setFormErrors({});
    onClose();
  };

  // Gérer la soumission sécurisée
  const handleSecureSubmit = async (data: Record<string, any>) => {
    // Validation supplémentaire côté client
    const validation = validateFormData(data);
    if (!validation.isValid) {
      console.error('Validation échouée:', validation.errors);
      return null;
    }

    // Préparer les données pour l'API
    const submitData = { ...validation.sanitizedData };
    
    // Supprimer le mot de passe vide pour les modifications
    if (agent && !submitData.password) {
      delete submitData.password;
    }

    // Déterminer l'URL et la méthode
    const url = agent 
      ? `http://192.168.100.138:3000/users/${agent.id}`
      : 'http://192.168.100.138:3000/users/signup';
    
    const method = agent ? 'PUT' : 'POST';

    // Soumettre via l'API sécurisée
    return await secureApi.submitForm(url, submitData, method);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={agent ? 'Modifier l\'agent' : 'Ajouter un agent'}
      size="lg"
    >
      <div className="space-y-4">
        {/* Indicateur de sécurité */}
        {secureApi.hasCsrfToken ? (
          <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-md text-green-800 text-xs">
            <Shield size={16} />
            <span>Formulaire sécurisé avec protection CSRF</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-xs">
            <Shield size={16} />
            <span>Initialisation de la sécurité...</span>
          </div>
        )}

        {/* Formulaire sécurisé */}
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSecureSubmit(formData);
        }} className="space-y-3">
          
          {/* Nom et Prénom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SecureInput
              name="prenom"
              label="Prénom"
              value={formData.prenom}
              onChange={(value) => handleInputChange('prenom', value)}
              placeholder="Prénom"
              required
              error={secureApi.formErrors.prenom}
              maxLength={50}
            />
            
            <SecureInput
              name="nom"
              label="Nom"
              value={formData.nom}
              onChange={(value) => handleInputChange('nom', value)}
              placeholder="Nom de famille"
              required
              error={secureApi.formErrors.nom}
              maxLength={50}
            />
          </div>

          {/* Email */}
          <SecureEmailInput
            name="email"
            label="Adresse email"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            placeholder="agent@exemple.com"
            required
            error={secureApi.formErrors.email}
            maxLength={254}
          />

          {/* Mot de passe */}
          <SecurePasswordInput
            name="password"
            label={agent ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'}
            value={formData.password}
            onChange={(value) => handleInputChange('password', value)}
            placeholder={agent ? 'Laisser vide pour ne pas modifier' : 'Mot de passe sécurisé'}
            required={!agent}
            error={secureApi.formErrors.password}
            maxLength={128}
          />

          {/* Téléphone */}
          <SecurePhoneInput
            name="telephone"
            label="Numéro de téléphone"
            value={formData.telephone}
            onChange={(value) => handleInputChange('telephone', value)}
            placeholder="+216 XX XXX XXX"
            error={secureApi.formErrors.telephone}
            maxLength={20}
          />

          {/* Adresse */}
          <SecureInput
            name="adresse"
            label="Adresse"
            value={formData.adresse}
            onChange={(value) => handleInputChange('adresse', value)}
            placeholder="Adresse complète"
            error={secureApi.formErrors.adresse}
            maxLength={200}
          />

          {/* Rôle et Statut */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="role" className="block text-xs font-medium text-gray-700">
                Rôle et fonction*
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                {availableRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="statut" className="block text-xs font-medium text-gray-700">
                Statut*
              </label>
              <select
                id="statut"
                name="statut"
                value={formData.statut}
                onChange={(e) => handleInputChange('statut', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                {availableStatuts.map((statut) => (
                  <option key={statut.value} value={statut.value}>
                    {statut.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Messages d'erreur globaux */}
          {secureApi.error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-md text-red-800 text-xs">
              {secureApi.error}
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={secureApi.isLoading || (!secureApi.hasCsrfToken)}
              className="px-3 py-1.5 bg-blue-600 border border-transparent rounded-md text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
            >
              {secureApi.isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  Enregistrement...
                </div>
              ) : (
                <>
                  <Save size={12} className="mr-1" />
                  {agent ? 'Modifier' : 'Ajouter'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default SecureAgentModal;
