"use client";

import React, { useEffect, useState } from 'react';
import { Package, User, Calendar, Clock, ChevronDown, ChevronUp, AlertCircle, Truck, Check, Clock3, Plus, X, Printer, Edit, ShoppingCart, Info, Download } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { PrimaryButton } from '../components/PageLayout';
import SearchAndFilter from '../components/SearchAndFilter';
import SuccessNotification from '../../../components/SuccessNotification';
import ScrollToTop from '../components/ScrollToTop';
import './commandes.css';

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
};

type OrderItem = {
  id: number;
  quantity: number;
  product: Product;
};

type DeliveryPlanning = {
  id: number;
  orderId: number;
  deliveryDate: string;
  deliveryTimeStart: string;
  deliveryTimeEnd: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

type Commande = {
  id: number;
  clientId: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  deliveryPlanning?: DeliveryPlanning;
};

// Nouveau type pour le formulaire de création de commande
type CreateOrderItem = {
  productId: number;
  quantity: number;
};

type CreateOrderForm = {
  clientId: number;
  responsableId: number;
  items: CreateOrderItem[];
};

// Type pour les produits dans le sélecteur
type ProductOption = {
  id: number;
  name: string;
  price: number;
};

// Type pour les clients
type ClientOption = {
  id: number;
  name: string;
  address: string;
};

// Type pour les utilisateurs/agents
type UserOption = {
  id: number;
  email: string;
  name?: string;
};

export default function CommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [filteredStatus, setFilteredStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // États pour le drawer d'ajout de commande
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createOrderForm, setCreateOrderForm] = useState<CreateOrderForm>({
    clientId: 0,
    responsableId: 0,
    items: [{ productId: 0, quantity: 1 }]
  });
  const [availableProducts, setAvailableProducts] = useState<ProductOption[]>([]);
  const [availableClients, setAvailableClients] = useState<ClientOption[]>([]);
  const [availableUsers, setAvailableUsers] = useState<UserOption[]>([]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // États pour les notifications de succès
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

  // États pour la modification du statut
  const [editingStatus, setEditingStatus] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusUpdating, setStatusUpdating] = useState(false);

  // États pour le ticket de caisse
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedOrderForTicket, setSelectedOrderForTicket] = useState<Commande | null>(null);

  useEffect(() => {
    fetchCommandes();
    fetchProducts();
    fetchClients();
    fetchUsers();
  }, []);

  // Écouter l'événement personnalisé pour ouvrir le modal d'ajout
  useEffect(() => {
    const handleOpenAddOrderModal = () => {
      setDrawerOpen(true);
    };

    window.addEventListener('open-add-order-modal', handleOpenAddOrderModal);

    return () => {
      window.removeEventListener('open-add-order-modal', handleOpenAddOrderModal);
    };
  }, []);

  const fetchCommandes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Récupérer les commandes et les planifications en parallèle
      const [ordersRes, planningsRes] = await Promise.allSettled([
        fetch('http://localhost:3000/orders'),
        fetch('http://localhost:3000/delivery-planning', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
      ]);

      // Traiter les commandes
      let ordersData = [];
      if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) {
        ordersData = await ordersRes.value.json();
      } else {
        throw new Error('Erreur lors de la récupération des commandes');
      }

      // Traiter les planifications
      let planningsData = [];
      if (planningsRes.status === 'fulfilled' && planningsRes.value.ok) {
        const planningsResponse = await planningsRes.value.json();
        planningsData = planningsResponse.data || planningsResponse || [];
      }

      // Associer les planifications aux commandes
      const commandesWithPlannings = Array.isArray(ordersData) ? ordersData.map(commande => {
        const planning = planningsData.find((p: DeliveryPlanning) => p.orderId === commande.id);
        return {
          ...commande,
          deliveryPlanning: planning
        };
      }) : [];

      setCommandes(commandesWithPlannings);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer la liste des produits disponibles
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/admin/products');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des produits');
      }

      const data: ProductOption[] = await response.json();
      setAvailableProducts(data);
    } catch (err: any) {
      console.error('Erreur lors du chargement des produits:', err.message);
    }
  };

  // Fonction pour récupérer la liste des clients
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/clients', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des clients');
      }

      const data: ClientOption[] = await response.json();
      setAvailableClients(data);
    } catch (err: any) {
      console.error('Erreur lors du chargement des clients:', err.message);
    }
  };

  // Fonction pour récupérer la liste des utilisateurs/agents
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/users', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs');
      }

      const data: UserOption[] = await response.json();
      setAvailableUsers(data);
    } catch (err: any) {
      console.error('Erreur lors du chargement des utilisateurs:', err.message);
    }
  };

  const toggleOrderExpansion = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Définir les statuts disponibles
  const availableStatuses = [
    { value: 'PENDING', label: 'En attente', color: 'bg-amber-100 text-amber-800', icon: <Clock3 size={14} /> },
    { value: 'CONFIRMED', label: 'Confirmée', color: 'bg-blue-100 text-blue-800', icon: <Check size={14} /> },
    { value: 'PROCESSING', label: 'En traitement', color: 'bg-indigo-100 text-indigo-800', icon: <Truck size={14} /> },
    { value: 'READY', label: 'Prête', color: 'bg-purple-100 text-purple-800', icon: <Package size={14} /> },
    { value: 'SHIPPED', label: 'Expédiée', color: 'bg-orange-100 text-orange-800', icon: <Truck size={14} /> },
    { value: 'DELIVERED', label: 'Livrée', color: 'bg-green-100 text-green-800', icon: <Check size={14} /> },
    { value: 'CANCELLED', label: 'Annulée', color: 'bg-red-100 text-red-800', icon: <X size={14} /> },
    { value: 'RETURNED', label: 'Retournée', color: 'bg-gray-100 text-gray-800', icon: <AlertCircle size={14} /> }
  ];

  const getStatusBadge = (status: string) => {
    const statusInfo = availableStatuses.find(s => s.value === status) || {
      value: status,
      label: status,
      color: 'bg-gray-100 text-gray-800',
      icon: <Clock size={14} />
    };

    return (
      <span className={`status-badge inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusInfo.color} smooth-transition`}>
        <span className="mr-1 icon-animate">{statusInfo.icon}</span>
        {statusInfo.label}
      </span>
    );
  };

  // Fonctions pour la modification du statut
  const startEditingStatus = (commandeId: number, currentStatus: string) => {
    setEditingStatus(commandeId);
    setNewStatus(currentStatus);
  };

  const cancelEditingStatus = () => {
    setEditingStatus(null);
    setNewStatus('');
  };

  const updateOrderStatus = async (commandeId: number) => {
    if (!newStatus) return;

    setStatusUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/orders/${commandeId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Erreur lors de la mise à jour du statut');
      }

      // Mettre à jour la commande dans la liste locale
      setCommandes(prev => prev.map(commande =>
        commande.id === commandeId
          ? { ...commande, status: newStatus }
          : commande
      ));

      // Réinitialiser l'état d'édition
      setEditingStatus(null);
      setNewStatus('');

      // Afficher la notification de succès
      setSuccessMessage({
        title: 'Statut mis à jour !',
        message: `Le statut de la commande #${commandeId} a été mis à jour avec succès.`
      });
      setShowSuccessNotification(true);

    } catch (err: any) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      alert(`Erreur: ${err.message}`);
    } finally {
      setStatusUpdating(false);
    }
  };

  // Affichage des dates comme elles viennent de la base
  const formatDate = (dateString: any) => {
    if (!dateString) return 'Date non disponible';
    return String(dateString); // Convertir en string pour l'affichage
  };
  const formatTime = (dateString: any) => {
    if (!dateString) return 'Heure non disponible';
    return String(dateString); // Convertir en string pour l'affichage
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  // Gérer les changements du formulaire d'ajout de commande
  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value) || 0;
    setCreateOrderForm(prev => ({ ...prev, clientId: value }));
  };

  const handleResponsableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value) || 0;
    setCreateOrderForm(prev => ({ ...prev, responsableId: value }));
  };

  const handleProductChange = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = parseInt(e.target.value);
    const newItems = [...createOrderForm.items];
    newItems[index] = { ...newItems[index], productId };
    setCreateOrderForm(prev => ({ ...prev, items: newItems }));
  };

  const handleQuantityChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(e.target.value) || 1;
    const newItems = [...createOrderForm.items];
    newItems[index] = { ...newItems[index], quantity };
    setCreateOrderForm(prev => ({ ...prev, items: newItems }));
  };

  const addProductLine = () => {
    setCreateOrderForm(prev => ({
      ...prev,
      items: [...prev.items, { productId: 0, quantity: 1 }]
    }));
  };

  const removeProductLine = (index: number) => {
    if (createOrderForm.items.length > 1) {
      const newItems = createOrderForm.items.filter((_, i) => i !== index);
      setCreateOrderForm(prev => ({ ...prev, items: newItems }));
    }
  };

  // Calculer le total estimé de la commande
  const calculateEstimatedTotal = () => {
    return createOrderForm.items.reduce((total, item) => {
      const product = availableProducts.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setCreateOrderForm({
      clientId: 0,
      responsableId: 0,
      items: [{ productId: 0, quantity: 1 }]
    });
    setFormError(null);
  };

  // Soumettre le formulaire pour créer une nouvelle commande
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    // Validation de base
    if (createOrderForm.clientId <= 0) {
      setFormError("Veuillez sélectionner un client");
      setFormSubmitting(false);
      return;
    }

    if (createOrderForm.responsableId <= 0) {
      setFormError("Veuillez sélectionner un responsable");
      setFormSubmitting(false);
      return;
    }

    if (createOrderForm.items.some(item => item.productId <= 0)) {
      setFormError("Veuillez sélectionner un produit pour chaque ligne");
      setFormSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createOrderForm),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Erreur lors de la création de la commande');
      }

      // Réinitialiser le formulaire et fermer le drawer
      resetForm();
      setDrawerOpen(false);

      // Rafraîchir la liste des commandes
      await fetchCommandes();

      // Afficher la notification de succès
      setSuccessMessage({
        title: 'Ajout réussi !',
        message: 'La commande a été créée avec succès.'
      });
      setShowSuccessNotification(true);

    } catch (err: any) {
      setFormError(err.message || 'Erreur inconnue');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Fermer le drawer avec confirmation si le formulaire a été modifié
  const handleCloseDrawer = () => {
    const hasData = createOrderForm.clientId > 0 || createOrderForm.responsableId > 0 || createOrderForm.items.some(item => item.productId > 0);

    if (hasData && !formSubmitting) {
      const shouldClose = window.confirm('Vous avez des données non sauvegardées. Voulez-vous vraiment fermer ?');
      if (!shouldClose) return;
    }

    resetForm();
    setDrawerOpen(false);
  };

  // Filtrer les commandes par statut et recherche
  const filteredCommandes = commandes
    .filter(commande =>
      (filteredStatus === 'all' || commande.status.toLowerCase() === filteredStatus) &&
      (searchTerm === '' ||
        commande.id.toString().includes(searchTerm) ||
        commande.clientId.toString().includes(searchTerm))
    );

  // Extraire tous les statuts uniques pour le filtre
  const uniqueStatuses = [...new Set(commandes.map(commande => commande.status.toLowerCase()))];

  // Fonctions pour le ticket de caisse
  const openTicketModal = (commande: Commande) => {
    setSelectedOrderForTicket(commande);
    setShowTicketModal(true);
  };

  const closeTicketModal = () => {
    setShowTicketModal(false);
    setSelectedOrderForTicket(null);
  };

  const generateTicketNumber = () => {
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-6);
    return `TK${timestamp}`;
  };

  const getStatusText = (status: string) => {
    const statusInfo = availableStatuses.find(s => s.value === status);
    return statusInfo ? statusInfo.label : status;
  };

  const saveTicketToFile = (commande: Commande) => {
    const total = commande.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const ticketNumber = generateTicketNumber();

    const ticketContent = `
═══════════════════════════════════════
           TICKET DE CAISSE
═══════════════════════════════════════

Ticket N°: ${ticketNumber}
Date de création: ${commande.createdAt}
Heure: ${commande.createdAt}
Commande N°: ${commande.id}
Client N°: ${commande.clientId}
Statut: ${getStatusText(commande.status)}

${commande.deliveryPlanning ? `
───────────────────────────────────────
            LIVRAISON PRÉVUE
───────────────────────────────────────

Date de livraison: ${commande.deliveryPlanning.deliveryDate}
Créneau horaire: ${commande.deliveryPlanning.deliveryTimeStart} - ${commande.deliveryPlanning.deliveryTimeEnd}
Statut livraison: ${commande.deliveryPlanning.status}
${commande.deliveryPlanning.notes ? `Notes: ${commande.deliveryPlanning.notes}` : ''}
` : ''}

───────────────────────────────────────
                ARTICLES
───────────────────────────────────────

${commande.items.map(item =>
  `${item.product.name}
  ${item.product.description}
  ${item.quantity} x ${formatCurrency(item.product.price)} = ${formatCurrency(item.product.price * item.quantity)}`
).join('\n\n')}

───────────────────────────────────────
SOUS-TOTAL: ${formatCurrency(total)}
TVA (0%): 0.00 TND
TOTAL: ${formatCurrency(total)}
───────────────────────────────────────

═══════════════════════════════════════
        Merci pour votre achat !

Ticket généré le: ${new Date().toLocaleDateString('fr-FR')}
Conservez ce ticket pour tout échange
═══════════════════════════════════════
    `;

    // Créer et télécharger le fichier
    const blob = new Blob([ticketContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-commande-${commande.id}-${ticketNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Afficher notification de succès
    setSuccessMessage({
      title: 'Ticket généré !',
      message: `Le ticket de caisse pour la commande #${commande.id} a été téléchargé.`
    });
    setShowSuccessNotification(true);
  };

  return (
    <PageLayout
      title="Gestion des Commandes"
      description="Consultez et gérez les commandes des clients"
      onRefresh={fetchCommandes}
      isLoading={loading}
      actions={
        <PrimaryButton
          onClick={() => setDrawerOpen(true)}
          icon={<Plus size={16} />}
        >
          Ajouter une commande
        </PrimaryButton>
      }
    >
      {/* Zone de recherche et filtres */}
      <SearchAndFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Rechercher une commande par ID ou client..."
        filterValue={filteredStatus}
        onFilterChange={setFilteredStatus}
        filterOptions={uniqueStatuses.map(status => ({ value: status, label: status }))}
        filterLabel="Tous les statuts"
      />

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-10">
            <div className="flex justify-center items-center">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                <p className="mt-4 text-gray-600 font-medium">Chargement des commandes...</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        ) : filteredCommandes.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-10 text-center">
            <Package size={48} className="mx-auto text-gray-400" />
            <h2 className="mt-4 text-xl font-medium text-gray-900">Aucune commande trouvée</h2>
            <p className="mt-2 text-gray-600">Aucune commande ne correspond à vos critères de recherche</p>
          </div>
        ) : (
          <div>
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden table-scroll smooth-scroll momentum-scroll">
              <div className="pb-2">
                {filteredCommandes.map((commande, index) => {
                  const isExpanded = expandedOrder === commande.id;
                  const total = commande.items.reduce(
                    (sum, item) => sum + item.product.price * item.quantity, 0
                  );
                  const itemCount = commande.items.length; // Nombre de types d'articles différents

                  return (
                    <div
                      key={commande.id}
                      className={`order-item ${index !== 0 ? 'border-t border-gray-200' : ''}`}
                    >
                      <div
                        className="px-4 py-3 cursor-pointer smooth-transition"
                        onClick={() => toggleOrderExpansion(commande.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600">
                              <Package size={16} className="icon-animate" />
                            </span>
                            <div>
                              <h3 className="font-semibold text-sm text-gray-900">
                                Commande #{commande.id}
                              </h3>
                              <div className="flex items-center space-x-3 text-xs text-gray-600">
                                <span className="flex items-center">
                                  <User size={12} className="mr-1 icon-animate" />
                                  Client #{commande.clientId}
                                </span>
                                <span className="flex items-center">
                                  <Calendar size={12} className="mr-1 icon-animate" />
                                  {formatDate(commande.createdAt)}
                                </span>
                                <span className="flex items-center">
                                  <Clock size={12} className="mr-1 icon-animate" />
                                  {formatTime(commande.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(commande.status)}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditingStatus(commande.id, commande.status);
                                }}
                                className="action-button p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                title="Modifier le statut"
                              >
                                <Edit size={12} className="icon-animate" />
                              </button>
                            </div>
                            <div className="text-gray-900 font-semibold text-sm total-animate">
                              {formatCurrency(total)}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {itemCount} article{itemCount > 1 ? 's' : ''}
                            </div>
                            <div className="bg-gray-100 rounded-full p-1">
                              {isExpanded ? (
                                <ChevronUp size={14} className="text-gray-500" />
                              ) : (
                                <ChevronDown size={14} className="text-gray-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="order-details border-t border-gray-200 bg-gray-50 px-4 py-3">
                          <div className="overflow-x-auto table-scroll">
                            <table className="order-table min-w-full divide-y divide-gray-200 bg-white rounded-md overflow-hidden shadow-sm table-loading">
                              <thead>
                                <tr className="bg-gray-50">
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Produit
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-xs">
                                    Description
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Prix unitaire
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Qté
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sous-total
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {commande.items.map((item) => (
                                  <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                                      {item.product.name}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-500 max-w-xs truncate">
                                      {item.product.description}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 text-right">
                                      {formatCurrency(item.product.price)}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 text-center">
                                      <span className="px-2 py-0.5 bg-gray-100 rounded-full font-medium">
                                        {item.quantity}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 text-right">
                                      {formatCurrency(item.product.price * item.quantity)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-gray-50">
                                <tr>
                                  <td colSpan={4} className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900 text-right">
                                    Total
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                                    {formatCurrency(total)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                          {/* Section de modification du statut */}
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-xs font-medium text-gray-900">Statut de la commande</h4>
                              </div>

                              {editingStatus === commande.id ? (
                                <div className="flex items-center space-x-2">
                                  <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                    disabled={statusUpdating}
                                  >
                                    {availableStatuses.map((status) => (
                                      <option key={status.value} value={status.value}>
                                        {status.label}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => updateOrderStatus(commande.id)}
                                    disabled={statusUpdating || !newStatus}
                                    className="action-button px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                  >
                                    {statusUpdating ? (
                                      <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-white mr-1"></div>
                                    ) : (
                                      <Check size={12} className="mr-1 icon-animate" />
                                    )}
                                    {statusUpdating ? 'Mise à jour...' : 'Valider'}
                                  </button>
                                  <button
                                    onClick={cancelEditingStatus}
                                    disabled={statusUpdating}
                                    className="action-button px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-500 disabled:opacity-50"
                                  >
                                    <X size={12} className="icon-animate" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2">
                                  {getStatusBadge(commande.status)}
                                  <button
                                    onClick={() => startEditingStatus(commande.id, commande.status)}
                                    className="action-button px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 flex items-center"
                                  >
                                    <Edit size={12} className="mr-1 icon-animate" />
                                    Modifier
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 flex justify-end space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openTicketModal(commande);
                              }}
                              className="action-button px-3 py-2 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm flex items-center transition-all duration-300 transform hover:scale-105"
                            >
                              <Printer size={12} className="mr-1 icon-animate" />
                              Ticket de caisse
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                saveTicketToFile(commande);
                              }}
                              className="action-button px-3 py-2 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500 shadow-sm flex items-center transition-all duration-300 transform hover:scale-105"
                            >
                              <Download size={12} className="mr-1 icon-animate" />
                              Télécharger
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 px-2 text-sm text-gray-600">
              {filteredCommandes.length} commande{filteredCommandes.length !== 1 ? 's' : ''} trouvée{filteredCommandes.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

      {/* Drawer pour ajouter une commande - DESIGN AMÉLIORÉ */}
      <div className={`fixed inset-0 bg-transparent h-full w-full z-40 flex items-start justify-end backdrop-blur-md transition-all duration-300 pt-4 pr-4 ${drawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div className={`fixed inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl transition-all duration-300 transform ${drawerOpen ? 'translate-x-0' : 'translate-x-full'} overflow-hidden`}>
          <div className="h-full flex flex-col">
            {/* En-tête du drawer avec dégradé */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white bg-opacity-20">
                    <ShoppingCart size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Nouvelle Commande</h2>
                    <p className="text-indigo-100 text-sm">Créer une commande client</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseDrawer}
                  className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 text-white transition-colors"
                  aria-label="Fermer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Contenu du formulaire */}
            <div className="flex-grow overflow-y-auto bg-gray-50">
              <div className="p-6">
                {formError && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start shadow-sm">
                    <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{formError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Section Client */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <User size={18} className="text-indigo-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Informations Client</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
                          Client <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="clientId"
                          value={createOrderForm.clientId}
                          onChange={handleClientChange}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 transition-colors"
                          required
                        >
                          <option value={0}>Sélectionner un client</option>
                          {availableClients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name} - {client.address}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          <Info size={12} className="inline mr-1" />
                          Choisissez le client pour cette commande
                        </p>
                      </div>

                      <div>
                        <label htmlFor="responsableId" className="block text-sm font-medium text-gray-700 mb-2">
                          Agent Responsable <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="responsableId"
                          value={createOrderForm.responsableId}
                          onChange={handleResponsableChange}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 transition-colors"
                          required
                        >
                          <option value={0}>Sélectionner un agent</option>
                          {availableUsers.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name || user.email.split('@')[0]} ({user.email})
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          <Info size={12} className="inline mr-1" />
                          L'agent responsable de cette commande
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section Produits */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Package size={18} className="text-indigo-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Produits</h3>
                      </div>
                      <button
                        type="button"
                        onClick={addProductLine}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                      >
                        <Plus size={14} className="mr-1" />
                        Ajouter un produit
                      </button>
                    </div>

                    <div className="space-y-4">
                      {createOrderForm.items.map((item, index) => {
                        const selectedProduct = availableProducts.find(p => p.id === item.productId);
                        const subtotal = selectedProduct ? selectedProduct.price * item.quantity : 0;

                        return (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start space-x-3">
                              <div className="flex-grow space-y-3">
                                <div>
                                  <label htmlFor={`product-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                                    Produit <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    id={`product-${index}`}
                                    value={item.productId}
                                    onChange={(e) => handleProductChange(index, e)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    required
                                  >
                                    <option value={0}>Sélectionner un produit</option>
                                    {availableProducts.map((product) => (
                                      <option key={product.id} value={product.id}>
                                        {product.name} - {formatCurrency(product.price)}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                                    Quantité <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="number"
                                    id={`quantity-${index}`}
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(index, e)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    min="1"
                                    required
                                  />
                                </div>

                                {subtotal > 0 && (
                                  <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded-md border">
                                    <span className="font-medium">Sous-total: {formatCurrency(subtotal)}</span>
                                  </div>
                                )}
                              </div>

                              {createOrderForm.items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeProductLine(index)}
                                  className="mt-7 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                  aria-label="Supprimer cette ligne"
                                >
                                  <X size={16} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total estimé */}
                    {calculateEstimatedTotal() > 0 && (
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-medium text-gray-900">Total estimé:</span>
                          <span className="text-lg font-bold text-indigo-600">
                            {formatCurrency(calculateEstimatedTotal())}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Boutons d'action */}
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        disabled={formSubmitting}
                        className="flex-1 bg-indigo-600 border border-transparent rounded-md py-3 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        {formSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Création en cours...
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={16} className="mr-2" />
                            Créer la commande
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCloseDrawer}
                        disabled={formSubmitting}
                        className="px-4 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de modification rapide du statut */}
      {editingStatus && (
        <div className="fixed inset-0 bg-transparent h-full w-full z-50 flex items-start justify-end backdrop-blur-md transition-all duration-300 pt-4 pr-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Modifier le statut - Commande #{editingStatus}
              </h3>
            </div>

            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau statut
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={statusUpdating}
                  >
                    {availableStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Aperçu:</span>
                    {newStatus && (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        availableStatuses.find(s => s.value === newStatus)?.color || 'bg-gray-100 text-gray-800'
                      }`}>
                        <span className="mr-1">
                          {availableStatuses.find(s => s.value === newStatus)?.icon}
                        </span>
                        {availableStatuses.find(s => s.value === newStatus)?.label}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={cancelEditingStatus}
                disabled={statusUpdating}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={() => updateOrderStatus(editingStatus)}
                disabled={statusUpdating || !newStatus}
                className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {statusUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-2" />
                    Mettre à jour
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de ticket de caisse */}
      {showTicketModal && selectedOrderForTicket && (
        <div className="fixed inset-0 bg-transparent h-full w-full z-50 flex items-start justify-end backdrop-blur-md transition-all duration-300 pt-4 pr-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Printer className="h-6 w-6 mr-3" />
                  Ticket de Caisse - Commande #{selectedOrderForTicket.id}
                </h3>
                <button
                  onClick={closeTicketModal}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Contenu du ticket */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 font-mono text-sm">
                  {/* En-tête du ticket */}
                  <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
                    <h1 className="text-2xl font-bold mb-2">TICKET DE CAISSE</h1>
                    <div className="text-lg font-semibold">N° {generateTicketNumber()}</div>
                  </div>

                  {/* Informations de la commande */}
                  <div className="grid grid-cols-2 gap-8 mb-6">
                    <div>
                      <h3 className="font-bold text-lg mb-3 border-b border-gray-400">COMMANDE</h3>
                      <div className="space-y-1">
                        <div><strong>N° Commande:</strong> #{selectedOrderForTicket.id}</div>
                        <div><strong>Date:</strong> {selectedOrderForTicket.createdAt}</div>
                        <div><strong>Heure:</strong> {selectedOrderForTicket.createdAt}</div>
                        <div><strong>Statut:</strong> {getStatusText(selectedOrderForTicket.status)}</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-3 border-b border-gray-400">CLIENT</h3>
                      <div className="space-y-1">
                        <div><strong>ID Client:</strong> #{selectedOrderForTicket.clientId}</div>
                        <div><strong>Type:</strong> Client régulier</div>
                      </div>
                    </div>
                  </div>

                  {/* Informations de livraison */}
                  {selectedOrderForTicket.deliveryPlanning && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                      <div>
                        <h3 className="font-bold text-lg mb-3 border-b border-gray-400">LIVRAISON PRÉVUE</h3>
                        <div className="space-y-1">
                          <div><strong>Date:</strong> {selectedOrderForTicket.deliveryPlanning.deliveryDate}</div>
                          <div><strong>Créneau:</strong> {selectedOrderForTicket.deliveryPlanning.deliveryTimeStart} - {selectedOrderForTicket.deliveryPlanning.deliveryTimeEnd}</div>
                          <div><strong>Statut livraison:</strong> {selectedOrderForTicket.deliveryPlanning.status}</div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-3 border-b border-gray-400">NOTES</h3>
                        <div className="space-y-1">
                          <div>{selectedOrderForTicket.deliveryPlanning.notes || 'Aucune note spéciale'}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Articles */}
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-4 border-b border-gray-400">ARTICLES COMMANDÉS</h3>
                    <div className="border border-gray-400">
                      <div className="grid grid-cols-12 gap-2 p-2 bg-gray-100 font-bold border-b border-gray-400">
                        <div className="col-span-5">PRODUIT</div>
                        <div className="col-span-3">DESCRIPTION</div>
                        <div className="col-span-1 text-center">QTÉ</div>
                        <div className="col-span-2 text-right">PRIX UNIT.</div>
                        <div className="col-span-1 text-right">TOTAL</div>
                      </div>
                      {selectedOrderForTicket.items.map((item, index) => (
                        <div key={item.id} className={`grid grid-cols-12 gap-2 p-2 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} border-b border-gray-200`}>
                          <div className="col-span-5 font-semibold">{item.product.name}</div>
                          <div className="col-span-3 text-xs text-gray-600 truncate">{item.product.description}</div>
                          <div className="col-span-1 text-center font-bold">{item.quantity}</div>
                          <div className="col-span-2 text-right">{formatCurrency(item.product.price)}</div>
                          <div className="col-span-1 text-right font-bold">{formatCurrency(item.product.price * item.quantity)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totaux */}
                  <div className="border-t-2 border-gray-800 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-lg">
                        <span>Sous-total:</span>
                        <span>{formatCurrency(selectedOrderForTicket.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0))}</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span>TVA (0%):</span>
                        <span>0.00 TND</span>
                      </div>
                      <div className="flex justify-between text-2xl font-bold border-t border-gray-400 pt-2">
                        <span>TOTAL:</span>
                        <span>{formatCurrency(selectedOrderForTicket.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pied de page */}
                  <div className="text-center mt-8 pt-4 border-t border-gray-400">
                    <div className="text-lg font-bold mb-2">MERCI POUR VOTRE ACHAT !</div>
                    <div className="text-sm text-gray-600">
                      <div>Ticket généré le {new Date().toLocaleDateString('fr-FR')}</div>
                      <div className="mt-2">Conservez ce ticket pour tout échange ou réclamation</div>
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
                    onClick={() => {
                      saveTicketToFile(selectedOrderForTicket);
                      closeTicketModal();
                    }}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Imprimer
                  </button>
                </div>
              </div>
            </div>
        </div>
      )}

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