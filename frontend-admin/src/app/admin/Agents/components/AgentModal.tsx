'use client';

import React, { useState, useEffect } from 'react';
import { User, Save, Mail, Phone, MapPin, Shield, Eye, EyeOff, X } from 'lucide-react';
import { Agent } from '../../../../types/agent';

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agent: Omit<Agent, 'id'>) => Promise<void>;
  agent?: Agent | null;
  isLoading?: boolean;
}

const AgentModal: React.FC<AgentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  agent,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Omit<Agent, 'id'>>({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    adresse: '',
    dateCreation: new Date().toISOString(),
    statut: 'actif',
    role: 'agent'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  // Rôles disponibles (conformes à la validation backend : lettres et underscores seulement)
  const availableRoles = [
    'agent',
    'superviseur',
    'manager',
    'administrateur',
    'commercial'
  ];

  // Labels d'affichage pour les rôles
  const roleLabels: Record<string, string> = {
    'agent': 'Agent Commercial',
    'superviseur': 'Superviseur',
    'manager': 'Manager',
    'administrateur': 'Administrateur',
    'commercial': 'Commercial'
  };

  // Statuts disponibles
  const availableStatuts = [
    { value: 'actif', label: 'Actif' },
    { value: 'inactif', label: 'Inactif' },
    { value: 'suspendu', label: 'Suspendu' }
  ];

  // Initialiser le formulaire quand l'agent change
  useEffect(() => {
    if (agent) {
      setFormData({
        nom: agent.nom || '',
        prenom: agent.prenom || '',
        email: agent.email || '',
        password: '', // Ne pas pré-remplir le mot de passe en mode édition
        telephone: agent.telephone || '',
        adresse: agent.adresse || '',
        dateCreation: agent.dateCreation || new Date().toISOString(),
        statut: agent.statut || 'actif',
        role: agent.role || 'agent'
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        telephone: '',
        adresse: '',
        dateCreation: new Date().toISOString(),
        statut: 'actif',
        role: 'Agent Commercial'
      });
    }
    setErrors({});
    setShowPassword(false);
  }, [agent, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    // Validation du nom
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    // Validation du prénom
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }

    // Validation de l'email
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Validation du mot de passe (seulement en mode création)
    if (!agent && !formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password) {
      // Validation stricte selon le backend : 8 caractères minimum avec majuscule, minuscule, chiffre et caractère spécial
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères avec une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)';
      }
    }

    // Validation du téléphone (optionnel mais format si fourni)
    if (formData.telephone && !/^[\d\s\+\-\(\)]+$/.test(formData.telephone)) {
      newErrors.telephone = 'Format de téléphone invalide';
    }

    // Validation du rôle
    if (!formData.role) {
      newErrors.role = 'Le rôle est requis';
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
      // En mode édition, ne pas envoyer le mot de passe s'il est vide
      const dataToSend = { ...formData };
      if (agent && !dataToSend.password) {
        delete dataToSend.password;
      }

      await onSave(dataToSend);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      password: '',
      telephone: '',
      adresse: '',
      dateCreation: new Date().toISOString(),
      statut: 'actif',
      role: 'agent'
    });
    setErrors({});
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent h-full w-full z-50 flex items-start justify-end backdrop-blur-md transition-all duration-300 pt-4 pr-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            {agent ? 'Modifier l\'agent' : 'Ajouter un agent'}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Formulaire avec scroll optimisé */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
             style={{ scrollbarWidth: 'thin' }}>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Nom et Prénom */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="prenom" className="block text-xs font-medium text-gray-700">
                    Prénom*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <User size={14} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="prenom"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      className={`pl-7 pr-3 py-1.5 w-full text-sm border ${
                        errors.prenom ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Prénom"
                    />
                  </div>
                  {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="nom" className="block text-xs font-medium text-gray-700">
                    Nom*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <User size={14} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      className={`pl-7 pr-3 py-1.5 w-full text-sm border ${
                        errors.nom ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Nom de famille"
                    />
                  </div>
                  {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="block text-xs font-medium text-gray-700">
                  Adresse email*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Mail size={14} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-7 pr-3 py-1.5 w-full text-sm border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="agent@exemple.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Mot de passe */}
              <div className="space-y-1">
                <label htmlFor="password" className="block text-xs font-medium text-gray-700">
                  Mot de passe {!agent && '*'}
                  {agent && <span className="text-gray-500 text-xs">(laisser vide pour ne pas modifier)</span>}
                  {!agent && <span className="text-gray-500 text-xs"> - 8 caractères min avec majuscule, minuscule, chiffre et @$!%*?&</span>}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Shield size={14} className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-7 pr-9 py-1.5 w-full text-sm border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent`}
                    placeholder={agent ? 'Nouveau mot de passe (optionnel)' : 'Min 8 caractères: Aa1@'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Téléphone */}
              <div className="space-y-1">
                <label htmlFor="telephone" className="block text-xs font-medium text-gray-700">
                  Numéro de téléphone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <Phone size={14} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    className={`pl-7 pr-3 py-1.5 w-full text-sm border ${
                      errors.telephone ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="+216 XX XXX XXX"
                  />
                </div>
                {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
              </div>

              {/* Adresse */}
              <div className="space-y-1">
                <label htmlFor="adresse" className="block text-xs font-medium text-gray-700">
                  Adresse
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <MapPin size={14} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="adresse"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    className="pl-7 pr-3 py-1.5 w-full text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Adresse complète"
                  />
                </div>
              </div>

              {/* Rôle et Statut */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="role" className="block text-xs font-medium text-gray-700">
                    Rôle et fonction*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Shield size={14} className="text-gray-400" />
                    </div>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      className={`pl-7 pr-3 py-1.5 w-full text-sm border ${
                        errors.role ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent`}
                    >
                      {availableRoles.map((role) => (
                        <option key={role} value={role}>
                          {roleLabels[role] || role}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                </div>

                <div className="space-y-1">
                  <label htmlFor="statut" className="block text-xs font-medium text-gray-700">
                    Statut*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Shield size={14} className="text-gray-400" />
                    </div>
                    <select
                      id="statut"
                      name="statut"
                      value={formData.statut}
                      onChange={handleInputChange}
                      className={`pl-7 pr-3 py-1.5 w-full text-sm border ${
                        errors.statut ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent`}
                    >
                      {availableStatuts.map((statut) => (
                        <option key={statut.value} value={statut.value}>
                          {statut.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.statut && <p className="text-red-500 text-xs mt-1">{errors.statut}</p>}
                </div>
              </div>

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
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-blue-600 border border-transparent rounded-md text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                >
                  {isLoading ? (
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
      </div>
    </div>
  );
};

export default AgentModal;
