// Types partagés pour les agents
export interface Agent {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  telephone?: string;
  adresse?: string;
  dateCreation?: string;
  statut?: 'actif' | 'inactif' | 'suspendu';
  role: string;
  // Statistiques calculées
  totalCommandes?: number;
  totalClients?: number;
  totalRevenue?: number;
}

// Type pour les données du formulaire (sans id)
export type AgentFormData = Omit<Agent, 'id'>;

// Type pour la création d'un agent (avec valeurs par défaut)
export interface CreateAgentData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
  adresse?: string;
  role: string;
  statut?: 'actif' | 'inactif' | 'suspendu';
  dateCreation?: string;
}
