'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  FileText,
  PieChart,
  Users,
  ShoppingBag,
  Package,

  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import PageLayout, { PrimaryButton, SecondaryButton } from '../components/PageLayout';
import ScrollToTop from '../components/ScrollToTop';
import TndIcon from '../dashboard/components/TndIcon';

// Interface pour les données de rapport
interface ReportData {
  period: string;
  orders: number;
  revenue: number;
  products: number;
  clients: number;
  growth: {
    orders: number;
    revenue: number;
    products: number;
    clients: number;
  };
}

// Composant pour les cartes de métriques améliorées
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  growth: number;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}> = ({ title, value, growth, icon, color, gradient }) => {
  const isPositive = growth >= 0;

  return (
    <div className="relative overflow-hidden bg-white rounded-lg border border-gray-100 p-4 transition-all duration-300 hover:shadow-lg group">
      {/* Gradient Background */}
      <div className={`absolute inset-0 ${gradient} opacity-3 group-hover:opacity-5 transition-opacity duration-300`}></div>

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
                <ArrowUpRight size={12} className="text-green-500 mr-1" />
              ) : (
                <ArrowDownRight size={12} className="text-red-500 mr-1" />
              )}
              <span className={`text-xs font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(growth)}%
              </span>
            </div>
            <span className="text-xs text-gray-500">vs précédente</span>
          </div>
        </div>

        <div>
          <p className="text-gray-600 text-xs font-medium mb-1">{title}</p>
          <p className="text-lg font-bold text-gray-900 mb-2">{value}</p>

          {/* Mini Chart Simulation */}
          <div className="flex items-end space-x-1 h-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`${gradient} rounded-sm transition-all duration-500`}
                style={{
                  width: '4px',
                  height: `${Math.random() * 100}%`,
                  animationDelay: `${i * 100}ms`
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour les options de rapport
const ReportOption: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, description, icon, onClick }) => {
  return (
    <div
      className="bg-white border border-gray-200 rounded-md p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="text-blue-600 mr-3">
          {icon}
        </div>
        <div>
          <h3 className="text-xs font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 text-xs">{description}</p>
        </div>
      </div>
    </div>
  );
};

const ReportsPage = () => {
  const [reportData, setReportData] = useState<ReportData>({
    period: 'Ce mois',
    orders: 0,
    revenue: 0,
    products: 0,
    clients: 0,
    growth: {
      orders: 0,
      revenue: 0,
      products: 0,
      clients: 0,
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [rawData, setRawData] = useState<{
    commandes: any[];
    produits: any[];
    clients: any[];
  }>({
    commandes: [],
    produits: [],
    clients: []
  });

  // Fonction pour récupérer les vraies données de rapport
  const fetchReportData = async () => {
    try {
      setIsLoading(true);

      // Vérifier le token
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Aucun token d\'authentification trouvé');
        setIsLoading(false);
        return;
      }

      // Récupérer les vraies données depuis l'API
      const [commandesRes, produitsRes, clientsRes] = await Promise.allSettled([
        fetch('http://localhost:3000/orders', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/products/products', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/clients', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      let totalOrders = 0, totalProducts = 0, totalClients = 0, totalRevenue = 0;
      let ordersGrowth = 0, productsGrowth = 0, clientsGrowth = 0, revenueGrowth = 0;

      // Traitement des commandes
      if (commandesRes.status === 'fulfilled' && commandesRes.value.ok) {
        try {
          const commandesData = await commandesRes.value.json();
          console.log('📊 Données commandes (rapports):', commandesData);

          if (Array.isArray(commandesData)) {
            totalOrders = commandesData.length;

            // Calculer le chiffre d'affaires à partir des items
            totalRevenue = commandesData.reduce((sum: number, commande: any) => {
              const commandeTotal = (commande.items || []).reduce((itemSum: number, item: any) => {
                const quantity = parseFloat(item.quantity) || 0;
                const price = parseFloat(item.product?.price) || 0;
                return itemSum + (quantity * price);
              }, 0);
              return sum + commandeTotal;
            }, 0);

            // Calculer la croissance selon la période sélectionnée
            const now = new Date();
            let periodDays = 30; // par défaut

            switch (selectedPeriod) {
              case 'week': periodDays = 7; break;
              case 'month': periodDays = 30; break;
              case 'quarter': periodDays = 90; break;
              case 'year': periodDays = 365; break;
            }

            const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
            const previousPeriodStart = new Date(now.getTime() - 2 * periodDays * 24 * 60 * 60 * 1000);

            const currentPeriodOrders = commandesData.filter(cmd =>
              new Date(cmd.createdAt) >= periodStart
            );

            const previousPeriodOrders = commandesData.filter(cmd => {
              const date = new Date(cmd.createdAt);
              return date >= previousPeriodStart && date < periodStart;
            });

            const currentOrdersCount = currentPeriodOrders.length;
            const previousOrdersCount = previousPeriodOrders.length;

            if (previousOrdersCount > 0) {
              ordersGrowth = ((currentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100;
            }

            const currentRevenue = currentPeriodOrders.reduce((sum: number, cmd: any) => {
              return sum + (cmd.items || []).reduce((itemSum: number, item: any) => {
                const quantity = parseFloat(item.quantity) || 0;
                const price = parseFloat(item.product?.price) || 0;
                return itemSum + (quantity * price);
              }, 0);
            }, 0);

            const previousRevenue = previousPeriodOrders.reduce((sum: number, cmd: any) => {
              return sum + (cmd.items || []).reduce((itemSum: number, item: any) => {
                const quantity = parseFloat(item.quantity) || 0;
                const price = parseFloat(item.product?.price) || 0;
                return itemSum + (quantity * price);
              }, 0);
            }, 0);

            if (previousRevenue > 0) {
              revenueGrowth = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
            }
          }
        } catch (error) {
          console.error('Erreur traitement commandes:', error);
        }
      }

      // Traitement des produits
      if (produitsRes.status === 'fulfilled' && produitsRes.value.ok) {
        try {
          const produitsData = await produitsRes.value.json();
          console.log('📦 Données produits (rapports):', produitsData);

          if (Array.isArray(produitsData)) {
            totalProducts = produitsData.length;

            // Approximation de croissance basée sur les IDs
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
          console.error('Erreur traitement produits:', error);
        }
      }

      // Traitement des clients
      if (clientsRes.status === 'fulfilled' && clientsRes.value.ok) {
        try {
          const clientsData = await clientsRes.value.json();
          console.log('👥 Données clients (rapports):', clientsData);

          if (Array.isArray(clientsData)) {
            totalClients = clientsData.length;

            // Approximation de croissance basée sur les IDs
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
          console.error('Erreur traitement clients:', error);
        }
      }

      // Arrondir les pourcentages
      ordersGrowth = Math.round(ordersGrowth * 10) / 10;
      revenueGrowth = Math.round(revenueGrowth * 10) / 10;
      productsGrowth = Math.round(productsGrowth * 10) / 10;
      clientsGrowth = Math.round(clientsGrowth * 10) / 10;

      console.log('📈 Statistiques rapports calculées:', {
        totalOrders, totalRevenue, totalProducts, totalClients,
        ordersGrowth, revenueGrowth, productsGrowth, clientsGrowth
      });

      // Stocker les données brutes pour les rapports
      let commandesData = [], produitsData = [], clientsData = [];

      if (commandesRes.status === 'fulfilled' && commandesRes.value.ok) {
        try {
          commandesData = await commandesRes.value.clone().json();
        } catch (e) {}
      }

      if (produitsRes.status === 'fulfilled' && produitsRes.value.ok) {
        try {
          produitsData = await produitsRes.value.clone().json();
        } catch (e) {}
      }

      if (clientsRes.status === 'fulfilled' && clientsRes.value.ok) {
        try {
          clientsData = await clientsRes.value.clone().json();
        } catch (e) {}
      }

      setRawData({
        commandes: Array.isArray(commandesData) ? commandesData : [],
        produits: Array.isArray(produitsData) ? produitsData : [],
        clients: Array.isArray(clientsData) ? clientsData : []
      });

      setReportData({
        period: selectedPeriod === 'month' ? 'Ce mois' :
                selectedPeriod === 'week' ? 'Cette semaine' :
                selectedPeriod === 'quarter' ? 'Ce trimestre' : 'Cette année',
        orders: totalOrders,
        revenue: totalRevenue,
        products: totalProducts,
        clients: totalClients,
        growth: {
          orders: ordersGrowth,
          revenue: revenueGrowth,
          products: productsGrowth,
          clients: clientsGrowth,
        }
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);

      // Valeurs par défaut en cas d'erreur
      setReportData({
        period: 'Erreur',
        orders: 0,
        revenue: 0,
        products: 0,
        clients: 0,
        growth: {
          orders: 0,
          revenue: 0,
          products: 0,
          clients: 0,
        }
      });

      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  const handleExportReport = (type: string) => {
    // Créer des données simulées pour l'export
    const data = generateExportData();

    switch (type) {
      case 'excel':
        downloadExcel(data);
        break;
      case 'pdf':
        downloadPDF(data);
        break;
      case 'csv':
        downloadCSV(data);
        break;
      case 'complet':
        downloadCompleteReport(data);
        break;
      default:
        alert(`Export du rapport ${type} en cours...`);
    }
  };

  const handleGenerateReport = (type: string) => {
    setIsLoading(true);

    // Simuler la génération de rapport avec délai
    setTimeout(() => {
      setIsLoading(false);

      switch (type) {
        case 'ventes':
          showSalesReport();
          break;
        case 'produits':
          showProductsReport();
          break;
        case 'clients':
          showClientsReport();
          break;
        case 'financier':
          showFinancialReport();
          break;
        case 'inventaire':
          showInventoryReport();
          break;
        case 'tendances':
          showTrendsReport();
          break;
        default:
          alert(`Rapport ${type} généré avec succès !`);
      }
    }, 2000);
  };

  // Fonctions d'export avec vraies données
  const generateExportData = () => {
    // Générer des données de détail basées sur les vraies commandes
    const details = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Filtrer les commandes pour cette date
      const dayCommandes = rawData.commandes.filter(cmd => {
        const cmdDate = new Date(cmd.createdAt).toISOString().split('T')[0];
        return cmdDate === dateStr;
      });

      // Calculer les vraies métriques pour cette date
      const dayOrders = dayCommandes.length;

      const dayRevenue = dayCommandes.reduce((sum: number, cmd: any) => {
        return sum + (cmd.items || []).reduce((itemSum: number, item: any) => {
          const quantity = parseFloat(item.quantity) || 0;
          const price = parseFloat(item.product?.price) || 0;
          return itemSum + (quantity * price);
        }, 0);
      }, 0);

      // Compter les produits uniques vendus ce jour
      const dayProductIds = new Set();
      dayCommandes.forEach((cmd: any) => {
        (cmd.items || []).forEach((item: any) => {
          if (item.product?.id) {
            dayProductIds.add(item.product.id);
          }
        });
      });
      const dayProducts = dayProductIds.size;

      // Compter les clients uniques ce jour
      const dayClientIds = new Set(dayCommandes.map((cmd: any) => cmd.clientId).filter(Boolean));
      const dayClients = dayClientIds.size;

      details.push({
        date: dateStr,
        orders: dayOrders,
        revenue: Math.round(dayRevenue * 100) / 100, // Arrondir à 2 décimales
        products: dayProducts,
        clients: dayClients
      });
    }

    return {
      period: reportData.period,
      generatedAt: new Date().toISOString(),
      summary: {
        orders: reportData.orders,
        revenue: reportData.revenue,
        products: reportData.products,
        clients: reportData.clients,
        growth: reportData.growth
      },
      details: details, // ✅ Ajout de la propriété manquante
      metadata: {
        description: `Rapport d'analyse pour la période: ${reportData.period}`,
        totalRevenue: formatCurrency(reportData.revenue),
        averageOrderValue: reportData.orders > 0 ? formatCurrency(reportData.revenue / reportData.orders) : '0 TND',
        dataSource: 'API Backend - Données réelles',
        exportedBy: 'Admin Panel',
        version: '2.0'
      }
    };
  };

  const downloadCSV = (data: any) => {
    const csvContent = [
      ['Date', 'Commandes', 'Revenus', 'Produits', 'Clients'],
      ...data.details.map((row: any) => [
        row.date,
        row.orders,
        row.revenue,
        row.products,
        row.clients
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-${selectedPeriod}-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadExcel = (data: any) => {
    // Simuler le téléchargement Excel
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-excel-${selectedPeriod}-${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    alert('Fichier Excel téléchargé ! (Format JSON pour la démo)');
  };

  const downloadPDF = (data: any) => {
    // Créer un contenu HTML pour le PDF
    const htmlContent = `
      <html>
        <head><title>Rapport ${data.period}</title></head>
        <body>
          <h1>Rapport d'Analyse - ${data.period}</h1>
          <h2>Résumé</h2>
          <p>Commandes: ${data.summary.orders}</p>
          <p>Revenus: ${formatCurrency(data.summary.revenue)}</p>
          <p>Produits: ${data.summary.products}</p>
          <p>Clients: ${data.summary.clients}</p>
          <h2>Détails</h2>
          <table border="1">
            <tr><th>Date</th><th>Commandes</th><th>Revenus</th><th>Produits</th><th>Clients</th></tr>
            ${data.details.map((row: any) =>
              `<tr><td>${row.date}</td><td>${row.orders}</td><td>${row.revenue}</td><td>${row.products}</td><td>${row.clients}</td></tr>`
            ).join('')}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-pdf-${selectedPeriod}-${Date.now()}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
    alert('Fichier PDF téléchargé ! (Format HTML pour la démo)');
  };

  const downloadCompleteReport = (data: any) => {
    const completeData = {
      ...data,
      metadata: {
        generatedAt: new Date().toISOString(),
        period: selectedPeriod,
        version: '1.0'
      }
    };

    const jsonData = JSON.stringify(completeData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-complet-${selectedPeriod}-${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Fonctions d'affichage des rapports avec vraies données
  const showSalesReport = () => {
    const avgOrderValue = reportData.orders > 0 ? reportData.revenue / reportData.orders : 0;
    const growthText = reportData.growth.orders >= 0 ? `+${reportData.growth.orders}%` : `${reportData.growth.orders}%`;

    // Analyser les vraies données de ventes
    const topProducts: Record<string, { quantity: number; revenue: number }> = {};
    const clientsWithOrders = new Set();

    rawData.commandes.forEach((cmd: any) => {
      clientsWithOrders.add(cmd.clientId);
      (cmd.items || []).forEach((item: any) => {
        const productName = item.product?.name || 'Produit inconnu';
        const quantity = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.product?.price) || 0;
        const revenue = quantity * price;

        if (!topProducts[productName]) {
          topProducts[productName] = { quantity: 0, revenue: 0 };
        }
        topProducts[productName].quantity += quantity;
        topProducts[productName].revenue += revenue;
      });
    });

    const sortedProducts = Object.entries(topProducts)
      .sort(([,a], [,b]) => b.revenue - a.revenue)
      .slice(0, 3);

    const topProductsText = sortedProducts.map(([name, data]) =>
      `• ${name}: ${data.quantity} unités - ${formatCurrency(data.revenue)}`
    ).join('\n');

    alert(`📊 Rapport des Ventes - ${reportData.period}

✅ Commandes totales: ${reportData.orders.toLocaleString()}
💰 Chiffre d'affaires: ${formatCurrency(reportData.revenue)}
📈 Croissance commandes: ${growthText}
💵 Croissance revenus: ${reportData.growth.revenue >= 0 ? '+' : ''}${reportData.growth.revenue}%
📊 Valeur moyenne par commande: ${formatCurrency(avgOrderValue)}
👥 Clients ayant commandé: ${clientsWithOrders.size}

🏆 Top 3 des produits vendus:
${topProductsText || 'Aucune donnée disponible'}

📈 Données extraites de votre vraie base de données
🔄 Période analysée: ${reportData.period}
📅 Généré le: ${new Date().toLocaleDateString('fr-FR')}`);
  };

  const showProductsReport = () => {
    const growthText = reportData.growth.products >= 0 ? `+${reportData.growth.products}%` : `${reportData.growth.products}%`;

    // Analyser les vraies données des produits
    const productStats: Record<string, { quantity: number; revenue: number; orders: number; price: number }> = {};
    let totalQuantitySold = 0;

    rawData.commandes.forEach((cmd: any) => {
      (cmd.items || []).forEach((item: any) => {
        const productName = item.product?.name || 'Produit inconnu';
        const quantity = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.product?.price) || 0;

        totalQuantitySold += quantity;

        if (!productStats[productName]) {
          productStats[productName] = {
            quantity: 0,
            revenue: 0,
            orders: 0,
            price: price
          };
        }
        productStats[productName].quantity += quantity;
        productStats[productName].revenue += quantity * price;
        productStats[productName].orders += 1;
      });
    });

    const sortedByQuantity = Object.entries(productStats)
      .sort(([,a], [,b]) => b.quantity - a.quantity)
      .slice(0, 3);

    const topProductsText = sortedByQuantity.map(([name, data]) =>
      `• ${name}: ${data.quantity} unités vendues (${data.orders} commandes)`
    ).join('\n');

    const avgPricePerProduct = rawData.produits.length > 0
      ? rawData.produits.reduce((sum: number, p: any) => sum + (parseFloat(p.price) || 0), 0) / rawData.produits.length
      : 0;

    alert(`📦 Analyse des Produits - ${reportData.period}

📊 Total produits au catalogue: ${reportData.products.toLocaleString()}
📈 Croissance catalogue: ${growthText}
📦 Quantité totale vendue: ${totalQuantitySold.toLocaleString()} unités
💰 Prix moyen des produits: ${formatCurrency(avgPricePerProduct)}

🏆 Top 3 des produits les plus vendus:
${topProductsText || 'Aucune vente enregistrée'}

📈 Données extraites de votre vraie base de données
🔄 Période analysée: ${reportData.period}
📅 Généré le: ${new Date().toLocaleDateString('fr-FR')}

💡 Pour gérer les produits, consultez la section "Produits" du menu.`);
  };

  const showClientsReport = () => {
    const growthText = reportData.growth.clients >= 0 ? `+${reportData.growth.clients}%` : `${reportData.growth.clients}%`;

    // Analyser les vraies données des clients
    const clientStats: Record<string, { orders: number; revenue: number; items: number }> = {};
    let totalClientsWithOrders = 0;

    rawData.commandes.forEach((cmd: any) => {
      const clientId = cmd.clientId;
      if (!clientId) return;

      if (!clientStats[clientId]) {
        clientStats[clientId] = {
          orders: 0,
          revenue: 0,
          items: 0
        };
        totalClientsWithOrders++;
      }

      clientStats[clientId].orders += 1;

      const orderRevenue = (cmd.items || []).reduce((sum: number, item: any) => {
        const quantity = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.product?.price) || 0;
        clientStats[clientId].items += quantity;
        return sum + (quantity * price);
      }, 0);

      clientStats[clientId].revenue += orderRevenue;
    });

    const sortedClients = Object.entries(clientStats)
      .sort(([,a], [,b]) => b.revenue - a.revenue)
      .slice(0, 3);

    const topClientsText = sortedClients.map(([clientId, data]: [string, any]) => {
      const client = rawData.clients.find((c: any) => c.id == clientId);
      const clientName = client ? `${client.nom} ${client.prenom}` : `Client #${clientId}`;
      return `• ${clientName}: ${data.orders} commandes - ${formatCurrency(data.revenue)}`;
    }).join('\n');

    const avgOrdersPerClient = totalClientsWithOrders > 0
      ? (reportData.orders / totalClientsWithOrders).toFixed(1)
      : 0;

    const avgRevenuePerClient = totalClientsWithOrders > 0
      ? reportData.revenue / totalClientsWithOrders
      : 0;

    alert(`👥 Rapport Clients - ${reportData.period}

👤 Total clients inscrits: ${reportData.clients.toLocaleString()}
📈 Croissance: ${growthText}
🛒 Clients ayant commandé: ${totalClientsWithOrders}
📊 Commandes moyennes par client: ${avgOrdersPerClient}
💰 Revenus moyens par client: ${formatCurrency(avgRevenuePerClient)}

🏆 Top 3 des meilleurs clients:
${topClientsText || 'Aucune commande enregistrée'}

📈 Données extraites de votre vraie base de données
🔄 Période analysée: ${reportData.period}
📅 Généré le: ${new Date().toLocaleDateString('fr-FR')}

💡 Pour gérer les clients, consultez la section "Clients" du menu.`);
  };

  const showFinancialReport = () => {
    const revenueGrowthText = reportData.growth.revenue >= 0 ? `+${reportData.growth.revenue}%` : `${reportData.growth.revenue}%`;
    const avgOrderValue = reportData.orders > 0 ? reportData.revenue / reportData.orders : 0;

    alert(`💰 Analyse Financière - ${reportData.period}

💵 Chiffre d'affaires total: ${formatCurrency(reportData.revenue)}
📈 Croissance revenus: ${revenueGrowthText}
📊 Nombre de commandes: ${reportData.orders.toLocaleString()}
💳 Valeur moyenne par commande: ${formatCurrency(avgOrderValue)}

📈 Données basées sur vos vraies transactions
🔄 Période analysée: ${reportData.period}
📅 Généré le: ${new Date().toLocaleDateString('fr-FR')}

💡 Pour voir le détail des commandes, consultez la section "Commandes" du menu.`);
  };

  const showInventoryReport = () => {
    const growthText = reportData.growth.products >= 0 ? `+${reportData.growth.products}%` : `${reportData.growth.products}%`;

    alert(`📋 Rapport d'Inventaire - ${reportData.period}

📦 Total produits: ${reportData.products.toLocaleString()}
📈 Évolution: ${growthText}

📈 Données basées sur votre inventaire réel
🔄 Période analysée: ${reportData.period}
📅 Généré le: ${new Date().toLocaleDateString('fr-FR')}

💡 Pour gérer l'inventaire, consultez la section "Produits" du menu.`);
  };

  const showTrendsReport = () => {
    alert(`📊 Analyse des Tendances - ${reportData.period}

📈 Résumé des performances:
• Commandes: ${reportData.growth.orders >= 0 ? '+' : ''}${reportData.growth.orders}%
• Revenus: ${reportData.growth.revenue >= 0 ? '+' : ''}${reportData.growth.revenue}%
• Produits: ${reportData.growth.products >= 0 ? '+' : ''}${reportData.growth.products}%
• Clients: ${reportData.growth.clients >= 0 ? '+' : ''}${reportData.growth.clients}%

📊 Valeur moyenne par commande: ${formatCurrency(reportData.orders > 0 ? reportData.revenue / reportData.orders : 0)}

📈 Données basées sur vos vraies performances
🔄 Période analysée: ${reportData.period}
📅 Généré le: ${new Date().toLocaleDateString('fr-FR')}`);
  };

  return (
    <PageLayout
      title="Rapports et Analyses"
      description="Consultez les rapports détaillés et les analyses de performance"
      actions={
        <div className="flex gap-3">
          <SecondaryButton
            onClick={fetchReportData}
            icon={<RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />}
          >
            Actualiser
          </SecondaryButton>
          <PrimaryButton
            onClick={() => handleExportReport('complet')}
            icon={<Download size={16} />}
          >
            Exporter
          </PrimaryButton>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Sélecteur de période */}
        <div className="bg-white rounded-md border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Période d'analyse</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'week', label: 'Cette semaine' },
              { value: 'month', label: 'Ce mois' },
              { value: 'quarter', label: 'Ce trimestre' },
              { value: 'year', label: 'Cette année' }
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                  selectedPeriod === period.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Commandes"
            value={reportData.orders.toLocaleString()}
            growth={reportData.growth.orders}
            icon={<ShoppingBag size={24} />}
            color="text-blue-600"
            gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <MetricCard
            title="Chiffre d'Affaires"
            value={formatCurrency(reportData.revenue)}
            growth={reportData.growth.revenue}
            icon={<TndIcon size={24} />}
            color="text-green-600"
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          />
          <MetricCard
            title="Produits Vendus"
            value={reportData.products}
            growth={reportData.growth.products}
            icon={<Package size={24} />}
            color="text-purple-600"
            gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
          />
          <MetricCard
            title="Nouveaux Clients"
            value={reportData.clients}
            growth={reportData.growth.clients}
            icon={<Users size={24} />}
            color="text-orange-600"
            gradient="bg-gradient-to-br from-orange-500 to-red-500"
          />
        </div>

        {/* Options de rapports */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <ReportOption
            title="Rapport des Ventes"
            description="Analyse détaillée des ventes par période"
            icon={<BarChart3 size={24} />}
            onClick={() => handleGenerateReport('ventes')}
          />
          <ReportOption
            title="Analyse des Produits"
            description="Performance et popularité des produits"
            icon={<Package size={24} />}
            onClick={() => handleGenerateReport('produits')}
          />
          <ReportOption
            title="Rapport Clients"
            description="Comportement et segmentation clients"
            icon={<Users size={24} />}
            onClick={() => handleGenerateReport('clients')}
          />
          <ReportOption
            title="Analyse Financière"
            description="Revenus, profits et tendances financières"
            icon={<TndIcon size={24} />}
            onClick={() => handleGenerateReport('financier')}
          />
          <ReportOption
            title="Rapport d'Inventaire"
            description="État des stocks et mouvements"
            icon={<FileText size={24} />}
            onClick={() => handleGenerateReport('inventaire')}
          />
          <ReportOption
            title="Tendances du Marché"
            description="Analyse des tendances et prévisions"
            icon={<TrendingUp size={24} />}
            onClick={() => handleGenerateReport('tendances')}
          />
        </div>





        {/* Section d'export */}
        <div className="bg-white rounded-md border border-gray-200 p-4">
          <h3 className="text-xs font-semibold text-gray-900 mb-3">Exporter les Données</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button
              onClick={() => handleExportReport('excel')}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <FileText size={14} className="text-green-600" />
              <span className="text-xs">Excel (.xlsx)</span>
            </button>
            <button
              onClick={() => handleExportReport('pdf')}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <FileText size={14} className="text-red-600" />
              <span className="text-xs">PDF (.pdf)</span>
            </button>
            <button
              onClick={() => handleExportReport('csv')}
              className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <FileText size={14} className="text-blue-600" />
              <span className="text-xs">CSV (.csv)</span>
            </button>
          </div>
        </div>

        {/* Section d'actions rapides */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-md border border-blue-200 p-4">
          <h3 className="text-xs font-semibold text-gray-900 mb-3">Actions Rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              onClick={() => {
                console.log('Dispatching open-add-order-modal event');
                window.dispatchEvent(new CustomEvent('open-add-order-modal'));
              }}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <ShoppingBag size={14} />
              <span className="text-xs">Nouvelle Commande</span>
            </button>
            <button
              onClick={() => {
                console.log('Dispatching open-add-product-modal event');
                window.dispatchEvent(new CustomEvent('open-add-product-modal'));
              }}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Package size={14} />
              <span className="text-xs">Ajouter Produit</span>
            </button>
            <button
              onClick={() => {
                console.log('Dispatching open-add-client-modal event');
                window.dispatchEvent(new CustomEvent('open-add-client-modal'));
              }}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Users size={14} />
              <span className="text-xs">Nouveau Client</span>
            </button>
            <button
              onClick={() => window.location.href = '/admin/dashboard'}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              <BarChart3 size={14} />
              <span className="text-xs">Retour Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Composant de scroll amélioré */}
      <ScrollToTop />
    </PageLayout>
  );
};

export default ReportsPage;
