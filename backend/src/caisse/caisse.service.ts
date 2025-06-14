import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CaisseService {
  constructor(private prisma: PrismaService) {}

  // Obtenir les ventes du jour pour un utilisateur (8h-18h)
  async getVentesDuJour(userId: number) {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(8, 0, 0, 0); // 8h du matin

    const endOfDay = new Date(today);
    endOfDay.setHours(18, 0, 0, 0); // 18h du soir

    // Récupérer l'utilisateur pour obtenir ses identifiants
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const identifiers = [user.email];
    if (user.name) {
      identifiers.push(user.name);
    }

    // Récupérer les commandes créées aujourd'hui par cet utilisateur
    const orders = await this.prisma.order.findMany({
      where: {
        responsable: {
          in: identifiers,
        },
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return orders;
  }

  // Calculer les statistiques du jour pour un utilisateur basées sur les vraies ventes en caisse
  async getStatistiquesDuJour(userId: number) {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`📊 Calcul statistiques du jour pour utilisateur ${userId}`);

    try {
      // Récupérer toutes les ventes du jour pour cet utilisateur depuis la table CaisseVente
      const ventesAujourdhui = await this.prisma.caisseVente.findMany({
        where: {
          userId: userId,
          dateVente: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        include: {
          order: {
            select: {
              id: true,
              clientName: true,
              status: true
            }
          }
        }
      });

      console.log(`💰 ${ventesAujourdhui.length} ventes trouvées pour aujourd'hui`);

      // Calculer les totaux par méthode de paiement (montant net)
      const totalEspece = ventesAujourdhui
        .filter(vente => vente.methodePaiement === 'ESPECE')
        .reduce((sum, vente) => sum + vente.montant, 0);

      const totalCheque = ventesAujourdhui
        .filter(vente => vente.methodePaiement === 'CHEQUE')
        .reduce((sum, vente) => sum + vente.montant, 0);

      const totalCredit = ventesAujourdhui
        .filter(vente => vente.methodePaiement === 'CREDIT')
        .reduce((sum, vente) => sum + vente.montant, 0);

      const totalTicketResto = ventesAujourdhui
        .filter(vente => vente.methodePaiement === 'TICKET_RESTO')
        .reduce((sum, vente) => sum + vente.montant, 0);

      const totalCarte = ventesAujourdhui
        .filter(vente => vente.methodePaiement === 'CARTE')
        .reduce((sum, vente) => sum + vente.montant, 0);

      // Calculer les totaux généraux
      const venteBrute = ventesAujourdhui.reduce((sum, vente) => sum + (vente.montantBrut || vente.montant), 0);
      const totalReduction = ventesAujourdhui.reduce((sum, vente) => sum + (vente.reduction || 0), 0);
      const venteNette = ventesAujourdhui.reduce((sum, vente) => sum + vente.montant, 0);
      const recetteFinale = venteNette; // Recette finale = vente nette
      const nombreVentes = ventesAujourdhui.length;

      const statistiques = {
        date: today.toISOString().split('T')[0],
        userId: userId,
        nombreCommandes: nombreVentes, // Compatibilité avec l'ancien nom
        nombreVentes: nombreVentes,

        // 🎯 VALEURS AUTOMATIQUES POUR LA CAISSE
        venteBrute: venteBrute,           // Vente brute (avant réduction)
        venteNet: venteNette,             // Vente nette (après réduction) - compatibilité
        venteNette: venteNette,           // Vente nette (après réduction)
        totalReduction: totalReduction,   // Total des réductions
        recetteFinale: recetteFinale,     // Recette finale
        difference: 0,                    // Pas de différence car automatique

        // Totaux par méthode de paiement - SE METTENT À JOUR AUTOMATIQUEMENT
        totalEspece: totalEspece,
        totalCheque: totalCheque,
        totalCredit: totalCredit,
        totalTicketResto: totalTicketResto,
        totalCarte: totalCarte,

        // Détails des ventes
        commandes: ventesAujourdhui.map(vente => ({
          id: vente.orderId,
          clientName: vente.order?.clientName || 'N/A',
          montant: vente.montant,
          montantBrut: vente.montantBrut,
          reduction: vente.reduction,
          methodePaiement: vente.methodePaiement,
          dateVente: vente.dateVente
        }))
      };

      console.log(`📊 Statistiques automatiques calculées:`, {
        nombreVentes,
        venteBrute,
        venteNette,
        totalReduction,
        recetteFinale,
        totalEspece,
        totalCheque,
        totalCredit,
        totalTicketResto,
        totalCarte
      });

      return statistiques;

    } catch (error) {
      console.error('❌ Erreur lors du calcul des statistiques:', error);
      throw new Error('Impossible de calculer les statistiques du jour');
    }
  }

  // Simuler une session active (pour compatibilité)
  async getSessionActive(userId: number) {
    // Retourner null car on n'utilise pas de sessions pour l'instant
    return null;
  }

  // Simuler l'ouverture d'une session (pour compatibilité)
  async ouvrirSession(data: { userId: number }) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    // Simuler une session ouverte
    return {
      id: Date.now(), // ID temporaire
      userId: data.userId,
      dateOuverture: new Date(),
      isActive: true,
      user,
    };
  }

  // Simuler la fermeture d'une session (pour compatibilité)
  async fermerSession(sessionId: number, data: any) {
    // Pour l'instant, juste retourner les statistiques du jour
    // En réalité, on pourrait enregistrer dans une table de logs
    const userId = 1; // À récupérer depuis la session
    const stats = await this.getStatistiquesDuJour(userId);

    return {
      id: sessionId,
      isActive: false,
      dateFermeture: new Date(),
      ...stats,
    };
  }

  // 🎯 NOUVELLES MÉTHODES POUR L'ENREGISTREMENT AUTOMATIQUE

  // Enregistrer une vente automatiquement quand une commande est livrée
  async enregistrerVenteAutomatique(orderId: number, userId: number, montant: number, methodePaiement: string = 'ESPECE') {
    try {
      console.log(`💰 Enregistrement automatique vente: Commande #${orderId}, Montant: ${montant} TND`);

      // Vérifier si la vente n'est pas déjà enregistrée
      const venteExistante = await this.prisma.caisseVente.findUnique({
        where: { orderId: orderId }
      });

      if (venteExistante) {
        console.log(`⚠️ Vente déjà enregistrée pour la commande #${orderId}`);
        return venteExistante;
      }

      // Récupérer les informations de la commande
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { client: true }
      });

      if (!order) {
        throw new Error(`Commande #${orderId} non trouvée`);
      }

      // Créer l'enregistrement de vente
      const venteEnCaisse = await this.prisma.caisseVente.create({
        data: {
          orderId: orderId,
          userId: userId,
          montant: montant,
          methodePaiement: methodePaiement as any, // Cast pour l'enum
          dateVente: new Date(),
          description: `Vente automatique - Commande #${orderId} - Client: ${order.clientName}`,
        }
      });

      console.log(`✅ Vente automatique enregistrée:`, {
        id: venteEnCaisse.id,
        orderId: orderId,
        montant: montant,
        userId: userId
      });

      return venteEnCaisse;

    } catch (error) {
      console.error(`❌ Erreur enregistrement vente automatique pour commande #${orderId}:`, error);
      throw error;
    }
  }

  // Obtenir toutes les ventes en caisse pour un utilisateur
  async getVentesEnCaisse(userId: number, dateDebut?: Date, dateFin?: Date) {
    const whereClause: any = { userId: userId };

    if (dateDebut && dateFin) {
      whereClause.dateVente = {
        gte: dateDebut,
        lte: dateFin
      };
    }

    return await this.prisma.caisseVente.findMany({
      where: whereClause,
      include: {
        order: {
          include: {
            client: true,
            items: {
              include: {
                product: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        dateVente: 'desc'
      }
    });
  }

  // Obtenir les statistiques de caisse incluant les ventes automatiques
  async getStatistiquesAvecVentesAutomatiques(userId: number) {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(8, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(18, 0, 0, 0);

    // Récupérer les ventes en caisse du jour
    const ventesEnCaisse = await this.getVentesEnCaisse(userId, startOfDay, endOfDay);

    // Calculer les totaux par méthode de paiement
    const totaux = ventesEnCaisse.reduce((acc, vente) => {
      switch (vente.methodePaiement) {
        case 'ESPECE':
          acc.totalEspece += vente.montant;
          break;
        case 'CHEQUE':
          acc.totalCheque += vente.montant;
          break;
        case 'CREDIT':
          acc.totalCredit += vente.montant;
          break;
        case 'TICKET_RESTO':
          acc.totalTicketResto += vente.montant;
          break;
        case 'CARTE':
          acc.totalCarte += vente.montant;
          break;
      }
      acc.totalGeneral += vente.montant;
      return acc;
    }, {
      totalEspece: 0,
      totalCheque: 0,
      totalCredit: 0,
      totalTicketResto: 0,
      totalCarte: 0,
      totalGeneral: 0
    });

    return {
      nombreVentes: ventesEnCaisse.length,
      ventesEnCaisse: ventesEnCaisse,
      ...totaux,
      recetteFinale: totaux.totalGeneral,
      dateCalcul: new Date()
    };
  }
}
