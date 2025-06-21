'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  ShoppingCart,
  Users,

  Package,
  BarChart3,
  PieChart,
  Activity,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart as RechartsAreaChart,
  BarChart as RechartsBarChart,
  Bar
} from 'recharts';
import PageLayout from '../../components/PageLayout';
import TndIcon from '../../dashboard/components/TndIcon';
import { apiUtils } from '../../../../utils/apiUtils';

// Interfaces
interface Agent {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  dateCreation: string;
  role: string;
}

// Interface OrderItem (non utilisée actuellement mais gardée pour référence future)
// interface OrderItem {
//   id: number;
//   orderId: number;
//   productId: number;
//   quantity: number;
//   product?: {
//     id: number;
//     name: string;
//     price: number;
//     description: string;
//     stock: number;
//     imageUrl: string | null;
//     createdAt: string;
//     categoryId: number;
//   };
// }

interface Commande {
  id: number;
  status: string;
  createdAt: string;
  total: number; // Le UserService retourne déjà le total calculé
}

interface Client {
  id: number;
  name: string;
  address: string;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

interface AgentStats {
  totalCommandes: number;
  totalClients: number;
  totalRevenue: number;
  averageOrderValue: number;
  recentCommandes: Commande[];
  recentClients: Client[];
  monthlyRevenue: { month: string; revenue: number }[];
}

const AgentDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;

  // États
  const [agent, setAgent] = useState<Agent | null>(null);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [allCommandes, setAllCommandes] = useState<Commande[]>([]); // Toutes les commandes pour les graphiques
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // États pour les options de graphique
  const [chartPeriod, setChartPeriod] = useState<'day' | 'month' | 'year'>('month');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');
  const [showValues, setShowValues] = useState(true);

  // Charger les données de l'agent
  const fetchAgentDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      // Récupérer les informations de l'agent (user)
      const userData = await apiUtils.get(`/users/${agentId}`);

      const agentData: Agent = {
        id: userData.id,
        nom: userData.name || userData.nom || 'Agent',
        prenom: userData.prenom || 'Commercial',
        email: userData.email,
        telephone: userData.telephone || '',
        adresse: userData.adresse || '',
        dateCreation: userData.createdAt || new Date().toISOString(),
        role: userData.role || 'Agent Commercial'
      };

      setAgent(agentData);

      // Récupérer les statistiques détaillées avec les bons endpoints selon votre backend
      console.log(`🔍 Récupération des données pour l'agent ${agentId}`);

      let commandes: Commande[] = [];
      let clients: Client[] = [];

      try {
        // Récupérer les commandes
        const commandesData = await apiUtils.get(`/users/${agentId}/orders`);
        console.log(`📦 Commandes récupérées pour l'agent ${agentId}:`, commandesData);
        commandes = Array.isArray(commandesData) ? commandesData : [];
      } catch (error) {
        console.error('Erreur récupération commandes:', error);
      }

      try {
        // Récupérer les clients
        const clientsData = await apiUtils.get(`/users/${agentId}/clients`);
        console.log(`👥 Clients récupérés pour l'agent ${agentId}:`, clientsData);
        clients = Array.isArray(clientsData) ? clientsData : [];
      } catch (error) {
        console.error('Erreur récupération clients:', error);
      }

      // ✅ Calculer les statistiques SEULEMENT des commandes livrées
      // Le UserService retourne déjà le total calculé pour chaque commande
      const commandesLivrees = commandes.filter(cmd => cmd.status === 'DELIVERED');
      const totalRevenue = commandesLivrees.reduce((sum, cmd) => sum + (cmd.total || 0), 0);
      const averageOrderValue = commandesLivrees.length > 0 ? totalRevenue / commandesLivrees.length : 0;

      // Calculer les revenus mensuels des 6 derniers mois
      const monthlyRevenue = calculateMonthlyRevenue(commandes);

      // Trier les commandes et clients par date (plus récents en premier)
      const recentCommandes = commandes
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      const recentClients = clients.slice(0, 10);

      const statsData: AgentStats = {
        totalCommandes: commandes.length,
        totalClients: clients.length,
        totalRevenue,
        averageOrderValue,
        recentCommandes,
        recentClients,
        monthlyRevenue
      };

      setStats(statsData);
      setAllCommandes(commandes); // Stocker toutes les commandes pour les graphiques
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des détails de l\'utilisateur');
    } finally {
      setIsLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    if (agentId) {
      fetchAgentDetails();
    }
  }, [agentId, fetchAgentDetails]);

  // Calculer les revenus selon la période choisie
  const calculateRevenueByPeriod = (commandes: Commande[], period: 'day' | 'month' | 'year') => {
    const revenueData: { [key: string]: number } = {};
    const periods = [];

    // Toujours générer les périodes, même sans commandes

    if (period === 'day') {
      // Générer les 30 derniers jours
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayKey = date.toISOString().slice(0, 10); // YYYY-MM-DD
        const dayName = date.toString().slice(0, 10);
        periods.push({ key: dayKey, name: dayName });
        revenueData[dayKey] = 0;
      }
    } else if (period === 'month') {
      // Générer les 12 derniers mois
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
        const monthName = date.toString().slice(0, 7);
        periods.push({ key: monthKey, name: monthName });
        revenueData[monthKey] = 0;
      }
    } else if (period === 'year') {
      // Générer les 5 dernières années
      for (let i = 4; i >= 0; i--) {
        const date = new Date();
        date.setFullYear(date.getFullYear() - i);
        const yearKey = date.getFullYear().toString();
        const yearName = yearKey;
        periods.push({ key: yearKey, name: yearName });
        revenueData[yearKey] = 0;
      }
    }

    // ✅ Calculer les revenus par période (SEULEMENT commandes livrées)
    if (commandes && commandes.length > 0) {
      commandes
        .filter(commande => commande.status === 'DELIVERED') // ✅ SEULEMENT les commandes livrées
        .forEach(commande => {
          let periodKey: string;

          // Extraire la partie de date selon la période
          if (!commande.createdAt) {
            console.warn('Date manquante ignorée pour la commande:', commande.id);
            return; // Ignorer cette commande si pas de date
          }

          const dateStr = String(commande.createdAt);

          if (period === 'day') {
            periodKey = dateStr.slice(0, 10); // YYYY-MM-DD
          } else if (period === 'month') {
            periodKey = dateStr.slice(0, 7); // YYYY-MM
          } else if (period === 'year') {
            periodKey = dateStr.slice(0, 4); // YYYY
          } else {
            periodKey = dateStr.slice(0, 10); // Par défaut jour
          }

          if (Object.prototype.hasOwnProperty.call(revenueData, periodKey)) {
            // Le UserService retourne déjà le total calculé
            revenueData[periodKey] += commande.total || 0;
          }
        });
    }

    return periods.map(period => ({
      period: period.name,
      revenue: revenueData[period.key]
    }));
  };

  // Calculer les revenus mensuels (fonction de compatibilité)
  const calculateMonthlyRevenue = (commandes: Commande[]) => {
    return calculateRevenueByPeriod(commandes, 'month').map(item => ({
      month: item.period,
      revenue: item.revenue
    }));
  };

  // Fonctions utilitaires
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  // Affichage des dates comme elles viennent de la base
  const formatDate = (dateString: any) => {
    if (!dateString) return 'Date non disponible';
    return String(dateString); // Convertir en string pour l'affichage
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig: Record<string, string> = {
      'PENDING': 'bg-amber-100 text-amber-800 border border-amber-200',
      'PROCESSING': 'bg-blue-100 text-blue-800 border border-blue-200',
      'DELIVERED': 'bg-green-100 text-green-800 border border-green-200',
      'CANCELLED': 'bg-red-100 text-red-800 border border-red-200',
      'en attente': 'bg-amber-100 text-amber-800 border border-amber-200',
      'en cours': 'bg-blue-100 text-blue-800 border border-blue-200',
      'livrée': 'bg-green-100 text-green-800 border border-green-200',
      'annulée': 'bg-red-100 text-red-800 border border-red-200'
    };

    const normalizedStatus = statut.toLowerCase();
    const colorClass = statusConfig[statut] || statusConfig[normalizedStatus] || 'bg-gray-100 text-gray-800 border border-gray-200';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {statut}
      </span>
    );
  };

  // Composant Tooltip personnalisé
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded border border-gray-200">
          <p className="font-semibold text-gray-700">{label}</p>
          <p className="text-blue-600 font-medium">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Composant pour le graphique en barres (Recharts)
  const BarChart: React.FC<{ data: Array<{ period: string; revenue: number }> }> = ({ data }) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex flex-col items-center justify-center text-gray-500">
          <BarChart3 className="w-12 h-12 mb-2 text-gray-300" />
          <p>Aucune période disponible</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="period"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `${value}TND`}
          />
          <Tooltip content={<CustomTooltip />} />
          {showValues && (
            <Legend
              wrapperStyle={{ paddingTop: 10 }}
              formatter={() => <span className="text-gray-700">Revenus</span>}
            />
          )}
          <Bar
            dataKey="revenue"
            name="Revenus"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
        </RechartsBarChart>
      </ResponsiveContainer>
    );
  };

  // Composant pour le graphique en ligne (Recharts)
  const LineChart: React.FC<{ data: Array<{ period: string; revenue: number }> }> = ({ data }) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex flex-col items-center justify-center text-gray-500">
          <Activity className="w-12 h-12 mb-2 text-gray-300" />
          <p>Aucune période disponible</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="period"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `${value}TND`}
          />
          <Tooltip content={<CustomTooltip />} />
          {showValues && (
            <Legend
              wrapperStyle={{ paddingTop: 10 }}
              formatter={() => <span className="text-gray-700">Revenus</span>}
            />
          )}
          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenus"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 3 }}
            activeDot={{ r: 6, fill: '#3b82f6' }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    );
  };

  // Composant pour le graphique en aires (Recharts)
  const AreaChart: React.FC<{ data: Array<{ period: string; revenue: number }> }> = ({ data }) => {
    if (!data || data.length === 0) {
      return (
        <div className="h-64 flex flex-col items-center justify-center text-gray-500">
          <PieChart className="w-12 h-12 mb-2 text-gray-300" />
          <p>Aucune période disponible</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsAreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="period"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `${value}TND`}
          />
          <Tooltip content={<CustomTooltip />} />
          {showValues && (
            <Legend
              wrapperStyle={{ paddingTop: 10 }}
              formatter={() => <span className="text-gray-700">Revenus</span>}
            />
          )}
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenus"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    );
  };

  if (isLoading) {
    return (
      <PageLayout title="Chargement..." description="Chargement des détails de l'agent">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </PageLayout>
    );
  }

  if (error || !agent) {
    return (
      <PageLayout title="Erreur" description="Impossible de charger les détails de l'agent">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-red-700">{error || 'Utilisateur non trouvé'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-red-100 text-red-800 px-4 py-2 rounded-md hover:bg-red-200 transition-colors"
          >
            Retour
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`${agent?.prenom || 'Agent'} ${agent?.nom || 'Commercial'}`}
      description="Détails et statistiques de l'agent"
      actions={
        <button
          onClick={() => {
            console.log('Bouton retour cliqué');
            router.push('/admin/Agents');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={16} />
          Retour
        </button>
      }
    >
      {/* Informations de l'agent */}
      <div className="bg-white rounded-lg shadow-sm border p-3 mb-4">
        <div className="flex items-start">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {agent.prenom} {agent.nom}
            </h2>
            <p className="text-gray-600 mb-2 text-sm">{agent.role}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Mail size={14} />
                <span>{agent.email}</span>
              </div>
              {agent.telephone && (
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Phone size={14} />
                  <span>{agent.telephone}</span>
                </div>
              )}
              {agent.adresse && (
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <MapPin size={14} />
                  <span>{agent.adresse}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Calendar size={14} />
                <span>Créé le {formatDate(agent.dateCreation)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm p-3 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold">{stats.totalCommandes}</div>
                  <div className="text-blue-100 text-xs font-medium">Commandes totales</div>
                </div>
                <div>
                  <ShoppingCart className="w-5 h-5 text-blue-100" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm p-3 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold">{stats.totalClients}</div>
                  <div className="text-green-100 text-xs font-medium">Clients gérés</div>
                </div>
                <div>
                  <Users className="w-5 h-5 text-green-100" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-sm p-3 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">{formatCurrency(stats.totalRevenue)}</div>
                  <div className="text-purple-100 text-xs font-medium">Chiffre d&apos;affaires</div>
                </div>
                <div>
                  <TndIcon className="w-5 h-5 text-purple-100" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg shadow-sm p-3 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">{formatCurrency(stats.averageOrderValue)}</div>
                  <div className="text-amber-100 text-xs font-medium">Panier moyen</div>
                </div>
                <div>
                  <TrendingUp className="w-5 h-5 text-amber-100" />
                </div>
              </div>
            </div>
          </div>

          {/* Graphique des revenus avec options - Style Dashboard */}
          <div className="relative overflow-hidden bg-white rounded-lg shadow-sm border border-gray-100 p-4 group transition-all duration-300 mb-4">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-20"></div>

            <div className="relative z-10">
              {/* Header avec options */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg shadow-sm">
                    {chartType === 'bar' && <BarChart3 className="text-white" size={16} />}
                    {chartType === 'line' && <TrendingUp className="text-white" size={16} />}
                    {chartType === 'area' && <Activity className="text-white" size={16} />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center">
                      Évolution des revenus
                    </h2>
                    <div className="text-gray-600 text-xs mt-1 flex items-center">
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mr-2"></div>
                      <span>
                        {chartPeriod === 'day' && 'Analyse quotidienne (30 derniers jours)'}
                        {chartPeriod === 'month' && 'Analyse mensuelle (12 derniers mois)'}
                        {chartPeriod === 'year' && 'Analyse annuelle (5 dernières années)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Options de personnalisation - Style Dashboard */}
                <div className="flex flex-col sm:flex-row gap-1 mt-2 sm:mt-0">
                  {/* Sélecteur de période */}
                  <select
                    value={chartPeriod}
                    onChange={(e) => setChartPeriod(e.target.value as 'day' | 'month' | 'year')}
                    className="px-2 py-1 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="day">30 jours</option>
                    <option value="month">12 mois</option>
                    <option value="year">5 années</option>
                  </select>

                  {/* Sélecteur de type de graphique */}
                  <div className="relative">
                    <button
                      className="flex items-center justify-between gap-1 px-2 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        // Cycle through chart types
                        const types: ('bar' | 'line' | 'area')[] = ['bar', 'line', 'area'];
                        const currentIndex = types.indexOf(chartType);
                        const nextIndex = (currentIndex + 1) % types.length;
                        setChartType(types[nextIndex]);
                      }}
                    >
                      {chartType === 'bar' && <BarChart3 size={14} />}
                      {chartType === 'line' && <TrendingUp size={14} />}
                      {chartType === 'area' && <Activity size={14} />}
                      <span>
                        {chartType === 'bar' && 'Barres'}
                        {chartType === 'line' && 'Ligne'}
                        {chartType === 'area' && 'Aires'}
                      </span>
                      <ChevronDown size={12} />
                    </button>
                  </div>

                  {/* Option pour afficher/masquer les valeurs */}
                  <button
                    onClick={() => setShowValues(!showValues)}
                    className={`flex items-center gap-1 px-2 py-1 text-sm border rounded-md transition-colors ${
                      showValues
                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <TndIcon size={14} />
                    <span>Valeurs</span>
                  </button>

                  {/* Bouton d'actualisation */}
                  <button
                    className="flex items-center gap-1 px-2 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw size={14} />
                    <span className="hidden sm:inline">Actualiser</span>
                  </button>
                </div>
              </div>

              {/* Graphique - Style Dashboard */}
              <div className="relative mt-4">
                <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                  {stats ? (() => {
                    // Utiliser toutes les commandes pour le graphique
                    const chartData = calculateRevenueByPeriod(allCommandes || [], chartPeriod);

                    if (chartType === 'bar') {
                      return <BarChart data={chartData} />;
                    } else if (chartType === 'line') {
                      return <LineChart data={chartData} />;
                    } else {
                      return <AreaChart data={chartData} />;
                    }
                  })() : (
                    <div className="h-48 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Commandes récentes et Clients récents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Commandes récentes */}
            <div className="bg-white rounded-lg shadow-sm border p-3">
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4 text-green-600" />
                <h3 className="text-sm font-semibold text-gray-900">Commandes récentes</h3>
              </div>
              <div className="space-y-2">
                {stats.recentCommandes.length > 0 ? (
                  stats.recentCommandes.map((commande) => (
                    <div key={commande.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">Commande #{commande.id}</div>
                        <div className="text-xs text-gray-500">{formatDate(commande.createdAt)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 text-sm">{formatCurrency(commande.total)}</div>
                        {getStatusBadge(commande.status)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-3 text-sm">Aucune commande trouvée</p>
                )}
              </div>
            </div>

            {/* Clients récents */}
            <div className="bg-white rounded-lg shadow-sm border p-3">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-gray-900">Clients gérés</h3>
              </div>
              <div className="space-y-2">
                {stats.recentClients.length > 0 ? (
                  stats.recentClients.map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{client.name}</div>
                        <div className="text-xs text-gray-600">{client.address}</div>
                        {client.phoneNumber && (
                          <div className="text-xs text-gray-500">{client.phoneNumber}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">ID: {client.id}</div>
                        <div className="text-xs text-gray-400">{formatDate(client.createdAt)}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-3 text-sm">Aucun client trouvé</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
};

export default AgentDetailPage;
