'use client';

import React, { useState } from 'react';
import PageLayout from '../components/PageLayout';
import DeliveryStatusBadge from '../../../components/DeliveryStatusBadge';
import DeliveryStatusSelector from '../../../components/DeliveryStatusSelector';
import { getAllDeliveryStatuses, DeliveryStatus } from '../../../utils/deliveryStatus';
import { Package, Calendar, Clock, MapPin, User } from 'lucide-react';

// Interface pour une livraison
interface Delivery {
  id: number;
  orderId: number;
  clientName: string;
  address: string;
  scheduledDate: string; // Date de livraison prévue (manuelle)
  createdAt?: string;    // Date de création de la commande (automatique)
  status: DeliveryStatus;
  driverName?: string;
}

// Données d'exemple
const mockDeliveries: Delivery[] = [
  {
    id: 1,
    orderId: 1001,
    clientName: 'Ahmed Ben Ali',
    address: 'Avenue Habib Bourguiba, Tunis',
    createdAt: '2025-06-14T08:30:00.000Z',
    scheduledDate: '2024-01-15',
    status: DeliveryStatus.EN_ATTENTE,
    driverName: 'Mohamed Trabelsi'
  },
  {
    id: 2,
    orderId: 1002,
    clientName: 'Fatma Khelifi',
    address: 'Rue de la République, Sfax',
    createdAt: '2025-06-14T09:15:00.000Z',
    scheduledDate: '2024-01-15',
    status: DeliveryStatus.CONFIRMEE,
    driverName: 'Ali Mansouri'
  },
  {
    id: 3,
    orderId: 1003,
    clientName: 'Karim Bouazizi',
    address: 'Boulevard 14 Janvier, Sousse',
    createdAt: '2025-06-14T10:45:00.000Z',
    scheduledDate: '2024-01-16',
    status: DeliveryStatus.PRETE,
    driverName: 'Sami Gharbi'
  },
  {
    id: 4,
    orderId: 1004,
    clientName: 'Leila Hamdi',
    address: 'Avenue de la Liberté, Monastir',
    createdAt: '2025-06-14T11:20:00.000Z',
    scheduledDate: '2024-01-16',
    status: DeliveryStatus.EN_COURS_DE_LIVRAISON,
    driverName: 'Nabil Jemli'
  },
  {
    id: 5,
    orderId: 1005,
    clientName: 'Youssef Mejri',
    address: 'Rue Farhat Hached, Gabès',
    createdAt: '2025-06-13T16:30:00.000Z',
    scheduledDate: '2024-01-14',
    status: DeliveryStatus.LIVREE,
    driverName: 'Hedi Sassi'
  },
  {
    id: 6,
    orderId: 1006,
    clientName: 'Amina Dridi',
    address: 'Avenue Taieb Mhiri, Kairouan',
    createdAt: '2025-06-14T14:10:00.000Z',
    scheduledDate: '2024-01-17',
    status: DeliveryStatus.REPORTEE,
    driverName: 'Rami Ouali'
  },
  {
    id: 7,
    orderId: 1007,
    clientName: 'Slim Benaissa',
    address: 'Rue Ibn Khaldoun, Bizerte',
    createdAt: '2025-06-14T15:45:00.000Z',
    scheduledDate: '2024-01-15',
    status: DeliveryStatus.ANNULEE
  }
];

const LivraisonsPage: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries);
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour mettre à jour le statut d'une livraison
  const handleStatusChange = async (deliveryId: number, newStatus: DeliveryStatus) => {
    try {
      setIsLoading(true);
      
      // Simulation d'un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour localement
      setDeliveries(prev => prev.map(delivery => 
        delivery.id === deliveryId 
          ? { ...delivery, status: newStatus }
          : delivery
      ));

      console.log(`Statut de la livraison ${deliveryId} mis à jour vers: ${newStatus}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Statistiques des statuts
  const statusStats = getAllDeliveryStatuses().map(status => ({
    ...status,
    count: deliveries.filter(d => d.status === status.value).length
  }));

  return (
    <PageLayout
      title="Gestion des Livraisons"
      description="Suivez et gérez les livraisons avec les nouveaux statuts français"
      isLoading={isLoading}
    >
      {/* Statistiques des statuts */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {statusStats.map((stat) => (
          <div key={stat.value} className="bg-white rounded-lg shadow p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
              </div>
              <stat.icon size={24} className="text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Tableau des livraisons */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Liste des Livraisons</h3>
          <p className="text-sm text-gray-500">Cliquez sur un statut pour le modifier</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commande
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créé le
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livraison prévue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livreur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        #{delivery.orderId}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{delivery.clientName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <MapPin size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{delivery.address}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-500">
                        {delivery.createdAt ? new Date(delivery.createdAt).toLocaleDateString('fr-FR') : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {new Date(delivery.scheduledDate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {delivery.driverName || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DeliveryStatusSelector
                      currentStatus={delivery.status}
                      onStatusChange={(newStatus) => handleStatusChange(delivery.id, newStatus)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Légende des statuts */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Légende des Statuts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getAllDeliveryStatuses().map((status) => (
            <div key={status.value} className="flex items-start space-x-3">
              <DeliveryStatusBadge status={status.value} />
              <div>
                <p className="text-sm font-medium text-gray-900">{status.label}</p>
                <p className="text-xs text-gray-500">{status.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

export default LivraisonsPage;
