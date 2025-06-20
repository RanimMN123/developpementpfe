'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  ShoppingBag,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import PageLayout from '../components/PageLayout';
import CommandesChart from './components/CommandesChart';
import ProductStatsChart from './components/ProductStatsChart';
import ClientStatsChart from './components/ClientStatsChart';
import DailyRevenueChart from './components/RevenueStatsChart';

import ScrollToTop from '../components/ScrollToTop';
import TndIcon from './components/TndIcon';
import './dashboard.css';

// Interface pour les statistiques
interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalClients: number;
  ordersGrowth: number;
  revenueGrowth: number;
  productsGrowth: number;
  clientsGrowth: number;
}

// Composant pour les cartes de statistiques améliorées
const StatCard: React.FC<{
  title: string;
  value: string | number;
  growth: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  gradient: string;
}> = ({ title, value, growth, icon, bgColor, borderColor, gradient }) => {
  const isPositive = growth >= 0;

  return (
    <div className={`stat-card relative overflow-hidden ${bgColor} ${borderColor} border rounded-xl p-4 transition-all duration-300 hover:shadow-xl hover:scale-102 group animate-fade-in-scale`}>
      {/* Gradient Background */}
      <div className={`absolute inset-0 ${gradient} opacity-3 group-hover:opacity-8 transition-opacity duration-300`}></div>

      {/* Decorative Elements - Réduits */}
      <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-6 -translate-y-6">
        <div className={`w-full h-full ${gradient} opacity-5 rounded-full`}></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={`${gradient} p-2 rounded-lg shadow-md`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center">
              {isPositive ? (
                <ArrowUpRight size={14} className="text-green-500 mr-1" />
              ) : (
                <ArrowDownRight size={14} className="text-red-500 mr-1" />
              )}
              <span className={`text-xs font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(growth)}%
              </span>
            </div>
            <span className="text-xs text-gray-500">vs mois dernier</span>
          </div>
        </div>

        <div>
          <p className="text-gray-600 text-xs font-medium mb-1">{title}</p>
          <p className="text-xl font-bold text-gray-900 mb-2">{value}</p>

          {/* Progress Bar - Plus fine */}
          <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
            <div
              className={`${gradient} h-1 rounded-full transition-all duration-1000 ease-out animate-progress-fill`}
              style={{ width: `${Math.min(Math.abs(growth) * 2, 100)}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Performance</span>
            <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? 'Excellent' : 'En baisse'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour les widgets rapides améliorés
const QuickActionCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  onClick: () => void;
}> = ({ title, description, icon, gradient, onClick }) => {
  return (
    <div
      className="quick-action-card relative overflow-hidden bg-white border border-gray-100 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-102 hover:-translate-y-1 group animate-slide-in-up"
      onClick={onClick}
    >
      {/* Gradient Background on Hover */}
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

      {/* Decorative Circle - Réduit */}
      <div className="absolute -top-2 -right-2 w-10 h-10 bg-gray-50 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>

      <div className="relative z-10">
        <div className="flex items-start space-x-3">
          <div className={`${gradient} p-2 rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-gray-800 transition-colors">
              {title}
            </h3>
            <p className="text-gray-600 text-xs leading-relaxed group-hover:text-gray-700 transition-colors">
              {description}
            </p>
          </div>
        </div>

        {/* Action Indicator - Simplifié */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <div className={`w-1.5 h-1.5 ${gradient} rounded-full animate-pulse-glow`}></div>
            <span className="text-xs text-gray-500 font-medium">Action rapide</span>
          </div>
          <div className="transform group-hover:translate-x-1 transition-transform duration-300">
            <ArrowUpRight size={14} className="text-gray-400 group-hover:text-gray-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalClients: 0,
    ordersGrowth: 0,
    revenueGrowth: 0,
    productsGrowth: 0,
    clientsGrowth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour récupérer les statistiques réelles
  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);

      // Vérifier le token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Aucun token d\'authentification trouvé');
        setIsLoading(false);
        return;
      }

      // Récupérer les vraies statistiques depuis l'API
      // Utilisons les endpoints existants et calculons les statistiques
      const [commandesRes, produitsRes, clientsRes] = await Promise.allSettled([
        // Liste des commandes
        fetch('http://localhost:3000/orders', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        // Liste des produits
        fetch('http://localhost:3000/products/products', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        // Liste des clients
        fetch('http://localhost:3000/api/clients', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Traiter les résultats et calculer les vraies statistiques
      let totalOrders = 0, totalProducts = 0, totalClients = 0, totalRevenue = 0;
      let ordersGrowth = 0, productsGrowth = 0, clientsGrowth = 0, revenueGrowth = 0;

      // Commandes
      if (commandesRes.status === 'fulfilled' && commandesRes.value.ok) {
        try {
          const commandesData = await commandesRes.value.json();
          console.log('📊 Données commandes reçues:', commandesData);
          console.log('📊 Type des données commandes:', typeof commandesData);
          console.log('📊 Est-ce un tableau?', Array.isArray(commandesData));

        if (Array.isArray(commandesData)) {
          totalOrders = commandesData.length;

          // ✅ Calculer le chiffre d'affaires total SEULEMENT des commandes livrées
          totalRevenue = commandesData
            .filter(commande => commande.status === 'DELIVERED')
            .reduce((sum, commande) => {
              // Calculer le total de cette commande à partir de ses items
              const commandeTotal = (commande.items || []).reduce((itemSum: number, item: any) => {
                const quantity = parseFloat(item.quantity) || 0;
                const price = parseFloat(item.product?.price) || 0;
                const itemTotal = quantity * price;
                console.log(`💰 Item ${item.id}: ${quantity} x ${price} = ${itemTotal}`);
                return itemSum + itemTotal;
              }, 0);

              console.log(`💰 Commande livrée ${commande.id}: ${commandeTotal} TND (${commande.items?.length || 0} items)`);
              return sum + commandeTotal;
            }, 0);
          console.log('💰 Chiffre d\'affaires total calculé:', totalRevenue, 'TND');

          // Calculer la croissance des commandes (30 derniers jours vs 30 jours précédents)
          const now = new Date();
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

          const recentOrders = commandesData.filter(cmd =>
            new Date(cmd.createdAt) >= thirtyDaysAgo
          ).length;

          const previousOrders = commandesData.filter(cmd => {
            const date = new Date(cmd.createdAt);
            return date >= sixtyDaysAgo && date < thirtyDaysAgo;
          }).length;

          if (previousOrders > 0) {
            ordersGrowth = ((recentOrders - previousOrders) / previousOrders) * 100;
          }

          // ✅ Calculer la croissance du chiffre d'affaires (SEULEMENT commandes livrées)
          const recentRevenue = commandesData
            .filter(cmd => new Date(cmd.createdAt) >= thirtyDaysAgo && cmd.status === 'DELIVERED')
            .reduce((sum: number, cmd: any) => {
              return sum + (cmd.items || []).reduce((itemSum: number, item: any) => {
                const quantity = parseFloat(item.quantity) || 0;
                const price = parseFloat(item.product?.price) || 0;
                return itemSum + (quantity * price);
              }, 0);
            }, 0);

          const previousRevenue = commandesData
            .filter(cmd => {
              const date = new Date(cmd.createdAt);
              return date >= sixtyDaysAgo && date < thirtyDaysAgo;
            })
            .reduce((sum: number, cmd: any) => {
              return sum + (cmd.items || []).reduce((itemSum: number, item: any) => {
                const quantity = parseFloat(item.quantity) || 0;
                const price = parseFloat(item.product?.price) || 0;
                return itemSum + (quantity * price);
              }, 0);
            }, 0);

          if (previousRevenue > 0) {
            revenueGrowth = ((recentRevenue - previousRevenue) / previousRevenue) * 100;
          }
        }
        } catch (error) {
          console.error('Erreur lors du traitement des données commandes:', error);
        }
      } else {
        console.log('❌ Impossible de récupérer les données commandes');
        if (commandesRes.status === 'fulfilled') {
          console.log('❌ Status de la réponse commandes:', commandesRes.value.status);
          console.log('❌ Texte de la réponse commandes:', await commandesRes.value.text());
        } else {
          console.log('❌ Erreur de requête commandes:', commandesRes.reason);
        }
      }

      // Produits
      if (produitsRes.status === 'fulfilled' && produitsRes.value.ok) {
        try {
          const produitsData = await produitsRes.value.json();
          console.log('📦 Données produits reçues:', produitsData);
          console.log('📦 Type des données produits:', typeof produitsData);
          console.log('📦 Est-ce un tableau?', Array.isArray(produitsData));

          if (Array.isArray(produitsData)) {
            totalProducts = produitsData.length;

            // Calculer la croissance des produits (approximation basée sur les IDs)
            if (produitsData.length > 0) {
              const recentProducts = produitsData.filter(prod =>
                prod.id > Math.max(0, Math.max(...produitsData.map(p => p.id)) - 10)
              ).length;

              if (totalProducts > recentProducts) {
                productsGrowth = (recentProducts / (totalProducts - recentProducts)) * 100;
              }
            }
          }
        } catch (error) {
          console.error('Erreur lors du traitement des données produits:', error);
        }
      } else {
        console.log('❌ Impossible de récupérer les données produits');
      }

      // Clients
      if (clientsRes.status === 'fulfilled' && clientsRes.value.ok) {
        try {
          const clientsData = await clientsRes.value.json();
          console.log('👥 Données clients reçues:', clientsData);
          console.log('👥 Type des données clients:', typeof clientsData);
          console.log('👥 Est-ce un tableau?', Array.isArray(clientsData));

          if (Array.isArray(clientsData)) {
            totalClients = clientsData.length;

            // Calculer la croissance des clients (approximation basée sur les IDs)
            if (clientsData.length > 0) {
              const recentClients = clientsData.filter(client =>
                client.id > Math.max(0, Math.max(...clientsData.map(c => c.id)) - 5)
              ).length;

              if (totalClients > recentClients) {
                clientsGrowth = (recentClients / (totalClients - recentClients)) * 100;
              }
            }
          }
        } catch (error) {
          console.error('Erreur lors du traitement des données clients:', error);
        }
      } else {
        console.log('❌ Impossible de récupérer les données clients');
      }

      // Arrondir les pourcentages de croissance
      ordersGrowth = Math.round(ordersGrowth * 10) / 10;
      revenueGrowth = Math.round(revenueGrowth * 10) / 10;
      productsGrowth = Math.round(productsGrowth * 10) / 10;
      clientsGrowth = Math.round(clientsGrowth * 10) / 10;

      console.log('📈 Statistiques finales calculées:', {
        totalOrders,
        totalRevenue,
        totalProducts,
        totalClients,
        ordersGrowth,
        revenueGrowth,
        productsGrowth,
        clientsGrowth,
      });

      console.log('🔄 Mise à jour de l\'état avec les nouvelles statistiques...');

      setStats({
        totalOrders,
        totalRevenue,
        totalProducts,
        totalClients,
        ordersGrowth,
        revenueGrowth,
        productsGrowth,
        clientsGrowth,
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);

      // En cas d'erreur, utiliser des valeurs par défaut
      setStats({
        totalOrders: 0,
        totalRevenue: 0,
        totalProducts: 0,
        totalClients: 0,
        ordersGrowth: 0,
        revenueGrowth: 0,
        productsGrowth: 0,
        clientsGrowth: 0,
      });

      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  const handleQuickAction = (action: string) => {
    // Dispatcher l'événement personnalisé pour ouvrir les modals
    console.log('Dashboard quick action:', action);

    switch (action) {
      case 'add-order':
        console.log('Dispatching open-add-order-modal event from dashboard');
        window.dispatchEvent(new CustomEvent('open-add-order-modal'));
        break;
      case 'add-product':
        console.log('Dispatching open-add-product-modal event from dashboard');
        window.dispatchEvent(new CustomEvent('open-add-product-modal'));
        break;
      case 'add-client':
        console.log('Dispatching open-add-client-modal event from dashboard');
        window.dispatchEvent(new CustomEvent('open-add-client-modal'));
        break;
      case 'view-reports':
        // Naviguer vers les rapports
        window.location.href = '/admin/reports';
        break;
    }
  };

  return (
    <PageLayout
      title="Tableau de bord"
      description="Vue d'ensemble des statistiques et métriques importantes"
      actions={
        <button
          onClick={fetchDashboardStats}
          className="dashboard-button flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm font-medium"
          disabled={isLoading}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      }
    >
      <div className="space-y-6">

        {/* Cartes de statistiques principales - Compactes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="grid-item-1">
            <StatCard
              title="Total Commandes"
              value={stats.totalOrders.toLocaleString()}
              growth={stats.ordersGrowth}
              icon={<ShoppingBag size={24} />}
              color="text-blue-600"
              bgColor="bg-white"
              borderColor="border-blue-100"
              gradient="bg-gradient-to-br from-blue-500 to-blue-600"
            />
          </div>
          <div className="grid-item-2">
            <StatCard
              title="Chiffre d'Affaires"
              value={formatCurrency(stats.totalRevenue)}
              growth={stats.revenueGrowth}
              icon={<TndIcon size={24} />}
              color="text-green-600"
              bgColor="bg-white"
              borderColor="border-green-100"
              gradient="bg-gradient-to-br from-green-500 to-emerald-600"
            />
          </div>
          <div className="grid-item-3">
            <StatCard
              title="Produits"
              value={stats.totalProducts}
              growth={stats.productsGrowth}
              icon={<Package size={24} />}
              color="text-purple-600"
              bgColor="bg-white"
              borderColor="border-purple-100"
              gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
            />
          </div>
          <div className="grid-item-4">
            <StatCard
              title="Clients"
              value={stats.totalClients}
              growth={stats.clientsGrowth}
              icon={<Users size={24} />}
              color="text-orange-600"
              bgColor="bg-white"
              borderColor="border-orange-100"
              gradient="bg-gradient-to-br from-orange-500 to-red-500"
            />
          </div>
        </div>

        {/* Actions rapides - Compactes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="grid-item-5">
            <QuickActionCard
              title="Nouvelle Commande"
              description="Créer une commande rapidement"
              icon={<ShoppingBag size={20} />}
              color="text-blue-600"
              gradient="bg-gradient-to-br from-blue-500 to-blue-600"
              onClick={() => {
                console.log('🚀 Dashboard: Clicking Nouvelle Commande');
                handleQuickAction('add-order');
              }}
            />
          </div>
          <div className="grid-item-6">
            <QuickActionCard
              title="Ajouter Produit"
              description="Ajouter un nouveau produit"
              icon={<Package size={20} />}
              color="text-green-600"
              gradient="bg-gradient-to-br from-green-500 to-emerald-600"
              onClick={() => {
                console.log('🚀 Dashboard: Clicking Ajouter Produit');
                handleQuickAction('add-product');
              }}
            />
          </div>
          <div className="grid-item-7">
            <QuickActionCard
              title="Nouveau Client"
              description="Enregistrer un client"
              icon={<Users size={20} />}
              color="text-purple-600"
              gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
              onClick={() => {
                console.log('🚀 Dashboard: Clicking Nouveau Client');
                handleQuickAction('add-client');
              }}
            />
          </div>
          <div className="grid-item-8">
            <QuickActionCard
              title="Voir Rapports"
              description="Consulter les analyses"
              icon={<BarChart3 size={20} />}
              color="text-orange-600"
              gradient="bg-gradient-to-br from-orange-500 to-red-500"
              onClick={() => {
                console.log('🚀 Dashboard: Clicking Voir Rapports');
                handleQuickAction('view-reports');
              }}
            />
          </div>
        </div>

        {/* Graphiques en grille - Compacts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="xl:col-span-2 chart-container animate-slide-in-up">
            <CommandesChart />
          </div>
        </div>

        <div className="chart-grid-symmetric lg:chart-grid-symmetric">
          <div className="chart-item-symmetric animate-slide-in-left">
            <div className="chart-container">
              <ProductStatsChart />
            </div>
          </div>
          <div className="chart-item-symmetric animate-slide-in-right">
            <div className="chart-container">
              <ClientStatsChart />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1">
          <div className="chart-container animate-fade-in-scale">
            <DailyRevenueChart />
          </div>
        </div>
      </div>

      {/* Composant de scroll amélioré */}
      <ScrollToTop />
    </PageLayout>
  );
};

export default Dashboard;
