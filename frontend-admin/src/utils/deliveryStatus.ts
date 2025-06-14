import { Package, Clock, CheckCircle, Truck, MapPin, Calendar, XCircle } from 'lucide-react';

// Enum des statuts de livraison (correspond au backend)
export enum DeliveryStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  CONFIRMEE = 'CONFIRMEE',
  PRETE = 'PRETE',
  EN_COURS_DE_LIVRAISON = 'EN_COURS_DE_LIVRAISON',
  LIVREE = 'LIVREE',
  REPORTEE = 'REPORTEE',
  ANNULEE = 'ANNULEE'
}

// Configuration des statuts avec couleurs et icônes
export const deliveryStatusConfig = {
  [DeliveryStatus.EN_ATTENTE]: {
    label: 'En attente',
    color: 'bg-gray-100 text-gray-800 border border-gray-200',
    icon: Clock,
    description: 'Livraison en attente de planification'
  },
  [DeliveryStatus.CONFIRMEE]: {
    label: 'Confirmée',
    color: 'bg-blue-100 text-blue-800 border border-blue-200',
    icon: CheckCircle,
    description: 'Livraison confirmée et planifiée'
  },
  [DeliveryStatus.PRETE]: {
    label: 'Prête',
    color: 'bg-purple-100 text-purple-800 border border-purple-200',
    icon: Package,
    description: 'Commande prête pour la livraison'
  },
  [DeliveryStatus.EN_COURS_DE_LIVRAISON]: {
    label: 'En cours de livraison',
    color: 'bg-orange-100 text-orange-800 border border-orange-200',
    icon: Truck,
    description: 'Livraison en cours'
  },
  [DeliveryStatus.LIVREE]: {
    label: 'Livrée',
    color: 'bg-green-100 text-green-800 border border-green-200',
    icon: MapPin,
    description: 'Livraison terminée avec succès'
  },
  [DeliveryStatus.REPORTEE]: {
    label: 'Reportée',
    color: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    icon: Calendar,
    description: 'Livraison reportée à une autre date'
  },
  [DeliveryStatus.ANNULEE]: {
    label: 'Annulée',
    color: 'bg-red-100 text-red-800 border border-red-200',
    icon: XCircle,
    description: 'Livraison annulée'
  }
};

// Fonction pour obtenir la configuration d'un statut
export const getDeliveryStatusConfig = (status: string) => {
  return deliveryStatusConfig[status as DeliveryStatus] || {
    label: status,
    color: 'bg-gray-100 text-gray-800 border border-gray-200',
    icon: Clock,
    description: 'Statut inconnu'
  };
};

// Fonction pour obtenir tous les statuts disponibles
export const getAllDeliveryStatuses = () => {
  return Object.values(DeliveryStatus).map(status => ({
    value: status,
    ...deliveryStatusConfig[status]
  }));
};

// Fonction pour obtenir le badge de statut
export const getDeliveryStatusBadge = (status: string) => {
  const config = getDeliveryStatusConfig(status);
  return {
    className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`,
    label: config.label,
    icon: config.icon
  };
};
