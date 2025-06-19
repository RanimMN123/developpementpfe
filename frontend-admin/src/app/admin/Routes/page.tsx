'use client';

import React, { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import { MapPin, Calendar, Filter, Search, RefreshCw, User, MapPinIcon } from 'lucide-react';
import ScrollToTop from '../components/ScrollToTop';
import { apiUtils } from '../../../utils/apiUtils';
import './routes.css';
import '../produits/animations.css';

// Types pour les statuts de livraison (correspond à l'enum Prisma)
type DeliveryStatus =
  | 'PRETE'                // Prête
  | 'EN_COURS_DE_LIVRAISON' // En cours de livraison
  | 'LIVREE'               // Livrée
  | 'REPORTEE'             // Reportée
  | 'ANNULEE';             // Annulée

interface Client {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
}

interface OrderItem {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
  };
}

interface DeliveryPlanning {
  id: number;
  orderId: number;
  deliveryDate: string;
  deliveryTimeStart: string;
  deliveryTimeEnd: string;
  status: DeliveryStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  id: number;
  clientId: number;
  userId?: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  client?: Client;
  user?: User;
  deliveryPlanning?: DeliveryPlanning;
}

export default function RoutesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [deliveryPlannings, setDeliveryPlannings] = useState<DeliveryPlanning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTimeMin, setDeliveryTimeMin] = useState('');
  const [deliveryTimeMax, setDeliveryTimeMax] = useState('');

  // États pour le ticket de commande
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedOrderForTicket, setSelectedOrderForTicket] = useState<Order | null>(null);

  // Récupérer les données
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');

    try {
      // Récupérer les données en parallèle avec apiUtils
      const [ordersData, clientsData, usersData, planningsData] = await Promise.allSettled([
        apiUtils.get('/orders'),
        apiUtils.get('/api/clients'),
        apiUtils.get('/users'),
        apiUtils.get('/delivery-planning')
      ]);

      // Traiter les résultats
      const orders = ordersData.status === 'fulfilled' ? ordersData.value : [];
      const clients = clientsData.status === 'fulfilled' ? clientsData.value : [];
      const users = usersData.status === 'fulfilled' ? usersData.value : [];
      const plannings = planningsData.status === 'fulfilled' ?
        (planningsData.value.data || planningsData.value || []) : [];

      console.log('📊 Données récupérées:', { orders, clients, users, plannings });

      // Associer les planifications aux commandes
      const ordersWithPlannings = Array.isArray(orders) ? orders.map(order => {
        const planning = plannings.find((p: DeliveryPlanning) => p.orderId === order.id);
        return {
          ...order,
          deliveryPlanning: planning
        };
      }) : [];

      setOrders(ordersWithPlannings);
      setClients(Array.isArray(clients) ? clients : []);
      setUsers(Array.isArray(users) ? users : []);
      setDeliveryPlannings(Array.isArray(plannings) ? plannings : []);

    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      setError('Erreur lors de la récupération des données');
    } finally {
      setLoading(false);
    }
  };

  // Fonctions utilitaires
  const getClientInfo = (clientId: number) => {
    return clients.find(client => client.id === clientId);
  };

  const getUserInfo = (userId?: number) => {
    if (!userId) return null;
    return users.find(user => user.id === userId);
  };

  // Affichage des dates comme elles viennent de la base
  const formatDate = (dateString: any) => {
    if (!dateString) return 'Date non disponible';
    return String(dateString); // Convertir en string pour l'affichage
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      // Anciens statuts (compatibilité)
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      'validated': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Validée' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulée' },

      // Nouveaux statuts avec enum OrderStatus
      'PENDING': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En attente' },
      'CONFIRMED': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmée' },
      'PROCESSING': { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'En traitement' },
      'READY': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Prête' },
      'SHIPPED': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Expédiée' },
      'DELIVERED': { bg: 'bg-green-100', text: 'text-green-800', label: 'Livrée' },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800', label: 'Annulée' },
      'RETURNED': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Retournée' }
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Filtrer les commandes - Seulement READY (Prête) et RETURNED (Reportée)
  const filteredOrders = orders.filter(order => {
    // Filtre principal : seulement les commandes prêtes ou reportées
    const isEligibleForPlanning = order.status === 'READY' || order.status === 'RETURNED';

    if (!isEligibleForPlanning) {
      return false;
    }

    const client = getClientInfo(order.clientId);
    const user = getUserInfo(order.userId);

    // Filtre par recherche
    const matchesSearch = searchTerm === '' ||
      order.id.toString().includes(searchTerm) ||
      client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user?.prenom.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtre par statut (maintenant limité aux statuts éligibles)
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    // Filtre par date
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.createdAt);
      const today = new Date();

      switch (dateFilter) {
        case 'today':
          matchesDate = orderDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Trier par date (plus récent en premier)
  const sortedOrders = filteredOrders.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Fonctions de planification
  const openPlanningModal = (order: Order) => {
    setSelectedOrder(order);
    setShowPlanningModal(true);

    // Si une planification existe, pré-remplir les champs
    if (order.deliveryPlanning) {
      const planningDate = new Date(order.deliveryPlanning.deliveryDate);
      setDeliveryDate(planningDate.toISOString().split('T')[0]);
      setDeliveryTimeMin(order.deliveryPlanning.deliveryTimeStart);
      setDeliveryTimeMax(order.deliveryPlanning.deliveryTimeEnd);
    } else {
      // Sinon, définir des valeurs par défaut
      const today = new Date().toISOString().split('T')[0];
      setDeliveryDate(today);
      setDeliveryTimeMin('08:00');
      setDeliveryTimeMax('18:00');
    }
  };

  const closePlanningModal = () => {
    setShowPlanningModal(false);
    setSelectedOrder(null);
    setDeliveryDate('');
    setDeliveryTimeMin('');
    setDeliveryTimeMax('');
  };

  const handlePlanDelivery = async () => {
    if (!selectedOrder || !deliveryDate || !deliveryTimeMin || !deliveryTimeMax) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    if (deliveryTimeMin >= deliveryTimeMax) {
      alert('L\'heure de fin doit être après l\'heure de début');
      return;
    }

    try {
      // Préparer les données de planification
      const planningData = {
        orderId: selectedOrder.id,
        deliveryDate,
        deliveryTimeStart: deliveryTimeMin,
        deliveryTimeEnd: deliveryTimeMax,
        clientId: selectedOrder.clientId,
        status: 'PRETE' as DeliveryStatus
      };

      console.log('📅 Envoi de la planification:', planningData);

      // Appel API pour sauvegarder la planification
      const result = await apiUtils.post('/delivery-planning', planningData);
      console.log('✅ Planification sauvegardée:', result);

      alert(`✅ Livraison planifiée avec succès pour le ${deliveryDate} entre ${deliveryTimeMin} et ${deliveryTimeMax}`);
      closePlanningModal();

      // Recharger les données pour voir les changements
      fetchData();
    } catch (error) {
      console.error('❌ Erreur lors de la planification:', error);
      alert(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur lors de la planification de la livraison'}`);
    }
  };

  // Fonctions pour le ticket de commande
  const openTicketModal = (order: Order) => {
    setSelectedOrderForTicket(order);
    setShowTicketModal(true);
  };

  const closeTicketModal = () => {
    setShowTicketModal(false);
    setSelectedOrderForTicket(null);
  };

  const calculateOrderTotal = (order: Order) => {
    // Calculer le total de la commande (à adapter selon votre structure de données)
    // Pour l'instant, on utilise une valeur fictive
    return Math.random() * 1000 + 50; // Valeur entre 50 et 1050
  };

  // Fonction pour normaliser et afficher les statuts de livraison
  const getDeliveryStatusDisplay = (status: string) => {
    // Normaliser le statut (supprimer espaces, mettre en majuscules)
    const normalizedStatus = status?.toString().trim().toUpperCase();

    switch (normalizedStatus) {
      case 'PRETE':
      case 'READY':
        return {
          label: 'Prête',
          className: 'bg-purple-100 text-purple-800'
        };
      case 'EN_COURS_DE_LIVRAISON':
      case 'EN COURS DE LIVRAISON':
      case 'IN_DELIVERY':
      case 'SHIPPING':
        return {
          label: 'En cours de livraison',
          className: 'bg-orange-100 text-orange-800'
        };
      case 'LIVREE':
      case 'DELIVERED':
        return {
          label: 'Livrée',
          className: 'bg-green-100 text-green-800'
        };
      case 'REPORTEE':
      case 'POSTPONED':
      case 'DELAYED':
        return {
          label: 'Reportée',
          className: 'bg-gray-100 text-gray-800'
        };
      case 'ANNULEE':
      case 'CANCELLED':
        return {
          label: 'Annulée',
          className: 'bg-red-100 text-red-800'
        };
      case 'EN_ATTENTE':
      case 'PENDING':
        return {
          label: 'En attente',
          className: 'bg-blue-100 text-blue-800'
        };
      case 'CONFIRMEE':
      case 'CONFIRMED':
        return {
          label: 'Confirmée',
          className: 'bg-indigo-100 text-indigo-800'
        };
      default:
        console.warn('Statut de livraison non reconnu:', status);
        return {
          label: status || 'Statut inconnu',
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };

  return (
    <PageLayout
      title="Planification de livraison"
      description="Gestion des commandes et planification des tournées"
    >
      <div className="routes-spacing">
        {/* Header avec statistiques colorées - Commandes éligibles pour planification */}
        <div className="routes-grid grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm p-4 text-white stats-card transform transition-all duration-500 hover:shadow-lg routes-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="icon routes-icon-lg text-white" />
              </div>
              <div className="ml-3">
                <p className="label text-blue-100 text-xs font-medium">Commandes Éligibles</p>
                <p className="value text-white text-lg font-bold">
                  {orders.filter(order => order.status === 'READY' || order.status === 'RETURNED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm p-4 text-white stats-card transform transition-all duration-500 hover:shadow-lg routes-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="icon routes-icon-lg text-white" />
              </div>
              <div className="ml-3">
                <p className="label text-green-100 text-xs font-medium">Prêtes</p>
                <p className="value text-white text-lg font-bold">
                  {orders.filter(order => order.status === 'READY').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-sm p-4 text-white stats-card transform transition-all duration-500 hover:shadow-lg routes-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="icon routes-icon-lg text-white" />
              </div>
              <div className="ml-3">
                <p className="label text-purple-100 text-xs font-medium">Reportées</p>
                <p className="value text-white text-lg font-bold">
                  {orders.filter(order => order.status === 'RETURNED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-sm p-4 text-white stats-card transform transition-all duration-500 hover:shadow-lg routes-fade-in">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <RefreshCw className="icon routes-icon-lg text-white" />
              </div>
              <div className="ml-3">
                <p className="label text-orange-100 text-xs font-medium">Planifiées</p>
                <p className="value text-white text-lg font-bold">
                  {orders.filter(order =>
                    (order.status === 'READY' || order.status === 'RETURNED') &&
                    order.deliveryPlanning
                  ).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg border border-gray-200 filters-container routes-slide-up">
          <div className="flex flex-col sm:flex-row routes-grid">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 routes-icon-sm" />
                <input
                  type="text"
                  placeholder="Rechercher par ID, nom client, nom utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="filter-input pl-10 pr-4 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent routes-transition"
                />
              </div>
            </div>

            {/* Filtre par statut - Seulement les statuts éligibles pour planification */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent routes-transition"
              >
                <option value="all">Tous les statuts</option>
                <option value="READY">Prête</option>
                <option value="RETURNED">Reportée</option>
              </select>
            </div>

            {/* Filtre par date */}
            <div className="sm:w-48">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="filter-select w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent routes-transition"
              >
                <option value="all">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>

            {/* Bouton actualiser */}
            <button
              onClick={fetchData}
              disabled={loading}
              className="filter-button bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2 routes-transition"
            >
              <RefreshCw className={`routes-icon-sm ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {/* Tableau des commandes */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden transform transition-all duration-500 hover:shadow-xl hover:border-blue-200">
          <div className="overflow-x-auto table-scroll smooth-scroll momentum-scroll scroll-fade relative">
            <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-lg font-semibold text-slate-700">
                  Commandes à livrer
                </h3>
                <p className="text-slate-500 text-sm">
                  {sortedOrders.length} commande{sortedOrders.length > 1 ? 's' : ''} éligible{sortedOrders.length > 1 ? 's' : ''} pour planification
                </p>
              </div>
            </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
              <span className="ml-2 text-gray-500">Chargement des commandes...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-red-600 font-medium">{error}</p>
                <button
                  onClick={fetchData}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune commande trouvée</p>
              </div>
            </div>
          ) : (
            <table className="routes-table min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      Commande
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      Créée le
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      Adresse de livraison
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      État
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      Livraison prévue
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-blue-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-100">
                  {sortedOrders.map((order, index) => {
                    const client = getClientInfo(order.clientId);

                    return (
                      <tr
                        key={order.id}
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
                          <div className="text-xs font-medium text-gray-900">#{order.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-500">{formatDate(order.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:rotate-2">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-xs font-medium text-gray-900">
                                {client ? client.name : 'Client inconnu'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {client?.phoneNumber || 'Téléphone non disponible'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 mr-1 flex-shrink-0" />
                            <div className="text-xs text-gray-500 max-w-xs truncate" title={client?.address || 'Adresse non disponible'}>
                              {client?.address || 'Adresse non disponible'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.deliveryPlanning ? (
                            <div className="space-y-1">
                              <div className="flex items-center text-green-600">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span className="text-xs font-medium">
                                  {new Date(order.deliveryPlanning.deliveryDate).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {order.deliveryPlanning.deliveryTimeStart} - {order.deliveryPlanning.deliveryTimeEnd}
                              </div>
                              <div className="text-xs">
                                {(() => {
                                  const statusDisplay = getDeliveryStatusDisplay(order.deliveryPlanning.status);
                                  return (
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusDisplay.className}`}>
                                      {statusDisplay.label}
                                    </span>
                                  );
                                })()}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Non planifiée</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => openTicketModal(order)}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50 transition-all duration-300 transform hover:scale-110 hover:rotate-12 hover:shadow-md"
                              title="Voir détails"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openPlanningModal(order)}
                              className={`p-2 rounded-md transition-all duration-300 transform hover:scale-110 hover:shadow-md ${
                                order.deliveryPlanning
                                  ? 'text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 hover:rotate-12'
                                  : 'text-green-600 hover:text-green-900 hover:bg-green-50 hover:rotate-12'
                              }`}
                              title={order.deliveryPlanning ? 'Modifier planification' : 'Planifier livraison'}
                            >
                              <Calendar className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
          )}
          </div>
        </div>
      </div>

      {/* Modal de planification de livraison */}
      {showPlanningModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedOrder?.deliveryPlanning ? 'Modifier la planification' : 'Planifier la livraison'}
                </h3>
                <button
                  onClick={closePlanningModal}
                  className="text-gray-400 hover:bg-gray-100 hover:text-gray-500 rounded-full p-2 transition"
                >
                  ×
                </button>
              </div>

              {/* Contenu */}
              <div className="p-6">
                {/* Informations de la commande */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Commande #{selectedOrder.id}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <span className="font-medium">Client:</span> {getClientInfo(selectedOrder.clientId)?.name || 'Inconnu'}
                    </div>
                    <div>
                      <span className="font-medium">Adresse:</span> {getClientInfo(selectedOrder.clientId)?.address || 'Non disponible'}
                    </div>
                    <div>
                      <span className="font-medium">Téléphone:</span> {getClientInfo(selectedOrder.clientId)?.phoneNumber || 'Non disponible'}
                    </div>
                  </div>
                </div>

                {/* Formulaire de planification */}
                <div className="space-y-4">
                  {/* Date de livraison */}
                  <div>
                    <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Date de livraison*
                    </label>
                    <input
                      type="date"
                      id="deliveryDate"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Créneau horaire */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="timeMin" className="block text-sm font-medium text-gray-700 mb-1">
                        Heure de début*
                      </label>
                      <input
                        type="time"
                        id="timeMin"
                        value={deliveryTimeMin}
                        onChange={(e) => setDeliveryTimeMin(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="timeMax" className="block text-sm font-medium text-gray-700 mb-1">
                        Heure de fin*
                      </label>
                      <input
                        type="time"
                        id="timeMax"
                        value={deliveryTimeMax}
                        onChange={(e) => setDeliveryTimeMax(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Note d'information */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex">
                      <Calendar className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Créneau de livraison</p>
                        <p>Sélectionnez une plage horaire pour la livraison. Le client sera informé de ce créneau.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={closePlanningModal}
                    className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handlePlanDelivery}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    {selectedOrder?.deliveryPlanning ? 'Modifier la planification' : 'Planifier la livraison'}
                  </button>
                </div>
              </div>
            </div>
        </div>
      )}

      {/* Modal de ticket de commande */}
      {showTicketModal && selectedOrderForTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Ticket de Commande #{selectedOrderForTicket.id}
                </h3>
                <button
                  onClick={closeTicketModal}
                  className="text-gray-400 hover:bg-gray-100 hover:text-gray-500 rounded-full p-2 transition"
                >
                  ×
                </button>
              </div>

              {/* Contenu du ticket */}
              <div className="p-6">
                {/* Informations de la commande */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Informations client */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Informations Client
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Nom:</span>
                        <span className="ml-2 text-gray-900">
                          {getClientInfo(selectedOrderForTicket.clientId)?.name || 'Client inconnu'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Téléphone:</span>
                        <span className="ml-2 text-gray-900">
                          {getClientInfo(selectedOrderForTicket.clientId)?.phoneNumber || 'Non disponible'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Adresse:</span>
                        <span className="ml-2 text-gray-900">
                          {getClientInfo(selectedOrderForTicket.clientId)?.address || 'Non disponible'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Informations commande */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Détails Commande
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Date de création:</span>
                        <span className="ml-2 text-gray-900">
                          {formatDate(selectedOrderForTicket.createdAt)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Statut:</span>
                        <span className="ml-2">
                          {getStatusBadge(selectedOrderForTicket.status)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Agent responsable:</span>
                        <span className="ml-2 text-gray-900">
                          {getUserInfo(selectedOrderForTicket.userId)
                            ? `${getUserInfo(selectedOrderForTicket.userId)?.nom} ${getUserInfo(selectedOrderForTicket.userId)?.prenom}`
                            : 'Non assigné'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Planification de livraison */}
                {selectedOrderForTicket.deliveryPlanning && (
                  <div className="bg-purple-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-purple-900 mb-3 flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Planification de Livraison
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Date prévue:</span>
                        <span className="ml-2 text-gray-900">
                          {new Date(selectedOrderForTicket.deliveryPlanning.deliveryDate).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Créneau:</span>
                        <span className="ml-2 text-gray-900">
                          {selectedOrderForTicket.deliveryPlanning.deliveryTimeStart} - {selectedOrderForTicket.deliveryPlanning.deliveryTimeEnd}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Statut livraison:</span>
                        <span className="ml-2">
                          {(() => {
                            const statusDisplay = getDeliveryStatusDisplay(selectedOrderForTicket.deliveryPlanning.status);
                            return (
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusDisplay.className}`}>
                                {statusDisplay.label}
                              </span>
                            );
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Résumé financier */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Résumé Financier</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Montant total:</span>
                      <span className="font-semibold text-gray-900">
                        {calculateOrderTotal(selectedOrderForTicket).toFixed(2)} TND
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Statut paiement:</span>
                      <span className="text-orange-600 font-medium">En attente</span>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={closeTicketModal}
                    className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Imprimer
                  </button>
                </div>
              </div>
            </div>
        </div>
      )}

      {/* Composant de scroll amélioré */}
      <ScrollToTop />
    </PageLayout>
  );
}