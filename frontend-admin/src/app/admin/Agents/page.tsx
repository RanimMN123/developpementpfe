'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  UserCheck,
  AlertCircle,
  Search,
  Filter,
  Eye,
  UserPlus
} from 'lucide-react';
import PageLayout from '../components/PageLayout';
import SuccessNotification from '../../../components/SuccessNotification';

import AgentModal from './components/AgentModal';
import ScrollToTop from '../components/ScrollToTop';
import { Agent } from '../../../types/agent';
import { apiUtils } from '../../../utils/apiUtils';



const AgentsPage = () => {
  // États principaux
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // États pour la recherche et les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // États pour les modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // États pour les notifications de succès
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

  // Charger les agents au montage du composant
  useEffect(() => {
    fetchAgents();
  }, []);

  // Fonction pour récupérer les agents (users du backend)
  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Récupérer les users du backend
      const usersResponse = await fetch('http://localhost:3000/users', {
        headers,
      });

      if (!usersResponse.ok) {
        throw new Error('Erreur lors du chargement des agents');
      }

      const usersData = await usersResponse.json();
      console.log('📊 Données users récupérées:', usersData.length, 'utilisateurs');

      // Transformer les users en agents et calculer leurs statistiques
      const agentsWithStats = await Promise.all(
        usersData.map(async (user: { id: number; name?: string; nom?: string; prenom?: string; email: string; telephone?: string; adresse?: string; createdAt?: string; role?: string }) => {
          // Récupérer les statistiques pour chaque agent avec les bons endpoints selon votre backend
          const [commandesRes, clientsRes] = await Promise.allSettled([
            fetch(`http://localhost:3000/users/${user.id}/orders`, { headers }),
            fetch(`http://localhost:3000/users/${user.id}/clients`, { headers })
          ]);

          let totalCommandes = 0;
          let totalClients = 0;
          let totalRevenue = 0;

          // Traiter les commandes selon votre structure backend
          if (commandesRes.status === 'fulfilled' && commandesRes.value.ok) {
            try {
              const commandesData = await commandesRes.value.json();
              console.log(`📦 Commandes pour user ${user.id}:`, commandesData);
              totalCommandes = Array.isArray(commandesData) ? commandesData.length : 0;

              // Calculer le revenu total selon votre structure backend
              // Le UserService retourne déjà le total calculé pour chaque commande
              totalRevenue = Array.isArray(commandesData)
                ? commandesData.reduce((sum, cmd) => sum + (cmd.total || 0), 0)
                : 0;
            } catch (error) {
              console.error('Erreur traitement commandes:', error);
            }
          } else {
            console.error(`❌ Erreur commandes pour user ${user.id}:`, commandesRes);
          }

          // Traiter les clients
          if (clientsRes.status === 'fulfilled' && clientsRes.value.ok) {
            try {
              const clientsData = await clientsRes.value.json();
              console.log(`👥 Clients pour user ${user.id}:`, clientsData);
              totalClients = Array.isArray(clientsData) ? clientsData.length : 0;
            } catch (error) {
              console.error('Erreur traitement clients:', error);
            }
          } else {
            console.error(`❌ Erreur clients pour user ${user.id}:`, clientsRes);
          }

          return {
            id: user.id,
            nom: user.name || user.nom || 'Agent',
            prenom: user.prenom || 'Commercial',
            email: user.email,
            telephone: user.telephone || '',
            adresse: user.adresse || '',
            dateCreation: user.createdAt || new Date().toISOString(),
            statut: 'actif' as const, // Par défaut actif
            role: user.role || 'Agent Commercial',
            totalCommandes,
            totalClients,
            totalRevenue
          };
        })
      );

      setAgents(agentsWithStats);
      console.log('✅ Liste des agents mise à jour:', agentsWithStats.length, 'agents');
    } catch (err) {
      console.error('❌ Erreur lors du chargement des agents:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des agents');
      setAgents([]); // Pas de données de démonstration
    } finally {
      setIsLoading(false);
    }
  };



  // Fonction de suppression supprimée - seule la visualisation est conservée

  // Fonction pour ajouter un agent
  const handleAddAgent = async (agentData: Omit<Agent, 'id'>) => {
    try {
      setIsSaving(true);

      // Préparer les données selon le SecureCreateUserDto avec validation
      const dataToSend = {
        name: `${agentData.prenom} ${agentData.nom}`,
        email: agentData.email,
        password: agentData.password,
        telephone: agentData.telephone || undefined, // undefined au lieu de chaîne vide
        adresse: agentData.adresse || undefined,     // undefined au lieu de chaîne vide
        role: agentData.role
      };

      console.log('📤 Données envoyées au backend:', dataToSend);
      console.log('📤 Rôle spécifique:', dataToSend.role);
      console.log('📤 Type du rôle:', typeof dataToSend.role);

      const result = await apiUtils.post('/users', dataToSend);
      console.log('✅ Agent créé:', result);

      if (!result) {
        throw new Error('Erreur lors de la création de l\'agent');
      }

      // Attendre un peu avant de recharger pour laisser le temps à la base de données
      console.log('🔄 Rechargement de la liste des agents...');
      await new Promise(resolve => setTimeout(resolve, 500)); // 500ms de délai
      await fetchAgents();
      setShowAddModal(false);
      setError(''); // Effacer les erreurs précédentes

      // Afficher la notification de succès
      setSuccessMessage({
        title: '✅ Agent ajouté !',
        message: `L'agent ${agentData.prenom} ${agentData.nom} a été créé avec succès et ajouté à votre équipe.`
      });
      setShowSuccessNotification(true);

      // Fermer automatiquement la notification après 4 secondes
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 4000);
    } catch (err) {
      console.error('Erreur:', err);
      throw new Error(err instanceof Error ? err.message : 'Erreur lors de la création de l\'agent');
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction de modification supprimée - seule la visualisation est conservée

  // Fonctions utilitaires supprimées car seule la visualisation est conservée

  // Filtrer les agents
  const filteredAgents = agents.filter(agent => {
    const matchesSearch =
      agent.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (agent.telephone && agent.telephone.includes(searchTerm));

    const matchesStatus = statusFilter === 'all' || agent.statut === statusFilter;
    const matchesRole = roleFilter === 'all' || agent.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Obtenir les rôles uniques pour le filtre
  const uniqueRoles = [...new Set(agents.map(agent => agent.role))];

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (statut?: string) => {
    const statusConfig = {
      actif: 'bg-green-100 text-green-800 border border-green-200',
      inactif: 'bg-gray-100 text-gray-800 border border-gray-200',
      suspendu: 'bg-red-100 text-red-800 border border-red-200'
    };

    // Valeur par défaut si statut est undefined
    const currentStatut = statut || 'inactif';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[currentStatut as keyof typeof statusConfig] || statusConfig.inactif}`}>
        {currentStatut.charAt(0).toUpperCase() + currentStatut.slice(1)}
      </span>
    );
  };

  // Affichage des dates comme elles viennent de la base
  const formatDate = (dateString?: any) => {
    if (!dateString) return 'Non définie';
    return String(dateString); // Convertir en string pour l'affichage
  };

  return (
    <PageLayout
      title="Liste des Agents"
      description="Gérez votre équipe d'agents commerciaux"
      onRefresh={fetchAgents}
      isLoading={isLoading}
      actions={
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <UserPlus size={16} className="mr-2" />
          Ajouter un agent
        </button>
      }
    >
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">{agents.length}</div>
              <div className="text-blue-100 text-xs font-medium">Total agents</div>
            </div>
            <div>
              <User className="w-5 h-5 text-blue-100" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">
                {agents.filter(a => a.statut === 'actif').length}
              </div>
              <div className="text-green-100 text-xs font-medium">Agents actifs</div>
            </div>
            <div>
              <UserCheck className="w-5 h-5 text-green-100" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-sm p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">
                {uniqueRoles.length}
              </div>
              <div className="text-purple-100 text-xs font-medium">Rôles différents</div>
            </div>
            <div>
              <Shield className="w-5 h-5 text-purple-100" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg shadow-sm p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold">
                {agents.reduce((sum, a) => sum + (a.totalRevenue || 0), 0).toLocaleString()}
              </div>
              <div className="text-amber-100 text-xs font-medium">Revenus totaux (TND)</div>
            </div>
            <div>
              <UserPlus className="w-5 h-5 text-amber-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="mb-4 bg-white rounded-lg shadow-sm border p-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Recherche */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Rechercher un agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtre par statut */}
          <div className="relative">
            <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
              <option value="suspendu">Suspendu</option>
            </select>
          </div>

          {/* Filtre par rôle */}
          <div className="relative">
            <Shield className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">Tous les rôles</option>
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des agents */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden transform transition-all duration-500 hover:shadow-xl hover:border-blue-200">
        <div className="overflow-x-auto table-scroll smooth-scroll momentum-scroll">
          {/* Titre du tableau */}
          <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 px-4 py-3 border-b border-slate-200">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">
                Équipe commerciale
              </h3>
              <p className="text-slate-500 text-xs">
                {filteredAgents.length} agent{filteredAgents.length > 1 ? 's' : ''} dans votre équipe
              </p>
            </div>
          </div>
          <table className="min-w-full divide-y divide-blue-100">
            <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Agent commercial
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Informations de contact
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Rôle et fonction
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  État du compte
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Date d&apos;embauche
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-blue-100">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <User className="w-16 h-16 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun agent trouvé</h3>
                      <p className="text-gray-500">
                        {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                          ? "Aucun agent ne correspond à vos critères de recherche."
                          : "Commencez par ajouter votre premier agent."
                        }
                      </p>
                      {(searchTerm || statusFilter !== 'all' || roleFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('all');
                            setRoleFilter('all');
                          }}
                          className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Effacer les filtres
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent, index) => (
                  <tr
                    key={agent.id}
                    className={`transition-all duration-300 transform hover:scale-[1.01] cursor-pointer ${
                      index % 2 === 0
                        ? 'bg-white hover:bg-blue-50'
                        : 'bg-blue-50/30 hover:bg-blue-100/50'
                    } hover:shadow-sm border-l-4 border-l-transparent hover:border-l-blue-400`}
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-xs font-medium text-gray-900">
                            {agent.prenom} {agent.nom}
                          </div>
                          <div className="text-xs text-gray-500">ID: {agent.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900">
                        <div className="flex items-center mb-1">
                          <Mail className="h-3 w-3 text-gray-400 mr-1" />
                          {agent.email}
                        </div>
                        {agent.telephone && (
                          <div className="flex items-center mb-1">
                            <Phone className="h-3 w-3 text-gray-400 mr-1" />
                            {agent.telephone}
                          </div>
                        )}
                        {agent.adresse && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                            {agent.adresse}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900 font-medium">{agent.role}</div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {getStatusBadge(agent.statut)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900">
                        <div className="flex items-center mb-1">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                            {agent.totalCommandes || 0} cmd
                          </span>
                        </div>
                        <div className="flex items-center mb-1">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-1">
                            {agent.totalClients || 0} clients
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {(agent.totalRevenue || 0).toLocaleString()} TND
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center text-xs text-gray-900">
                        <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                        {formatDate(agent.dateCreation)}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right text-xs font-medium">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => window.open(`/admin/Agents/${agent.id}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900 p-1.5 rounded-md hover:bg-blue-50 transition-all duration-300 transform hover:scale-110 hover:rotate-12 hover:shadow-md"
                          title="Voir les détails de l'agent"
                        >
                          <Eye size={14} />
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

      {/* Notification de succès */}
      <SuccessNotification
        isOpen={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        title={successMessage.title}
        message={successMessage.message}
      />

      {/* Modal d'ajout d'agent */}
      <AgentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddAgent}
        isLoading={isSaving}
      />

      {/* Modals de modification et suppression supprimés - seule la visualisation est conservée */}

      {/* Composant de scroll amélioré */}
      <ScrollToTop />
    </PageLayout>
  );
};

export default AgentsPage;
