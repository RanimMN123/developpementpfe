const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Créer un nouveau fournisseur
const createFournisseur = async (req, res) => {
  try {
    const { nomComplet, adresse, telephone, email } = req.body;
    const userId = req.user.id; // ID de l'utilisateur connecté

    // Validation des champs requis
    if (!nomComplet || !adresse || !telephone || !email) {
      return res.status(400).json({
        message: 'Tous les champs sont requis (nomComplet, adresse, telephone, email)'
      });
    }

    // Vérifier si l'email existe déjà
    const existingFournisseur = await prisma.fournisseur.findUnique({
      where: { email }
    });

    if (existingFournisseur) {
      return res.status(400).json({
        message: 'Un fournisseur avec cet email existe déjà'
      });
    }

    // Créer le fournisseur
    const fournisseur = await prisma.fournisseur.create({
      data: {
        nomComplet,
        adresse,
        telephone,
        email,
        userId
      }
    });

    res.status(201).json({
      message: 'Fournisseur créé avec succès',
      fournisseur
    });
  } catch (error) {
    console.error('Erreur lors de la création du fournisseur:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
};

// Récupérer tous les fournisseurs de l'utilisateur connecté
const getFournisseurs = async (req, res) => {
  try {
    const userId = req.user.id;

    const fournisseurs = await prisma.fournisseur.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      message: 'Fournisseurs récupérés avec succès',
      fournisseurs
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des fournisseurs:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
};

// Récupérer un fournisseur par ID
const getFournisseurById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const fournisseur = await prisma.fournisseur.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!fournisseur) {
      return res.status(404).json({
        message: 'Fournisseur non trouvé'
      });
    }

    res.status(200).json({
      message: 'Fournisseur récupéré avec succès',
      fournisseur
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du fournisseur:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
};

// Mettre à jour un fournisseur
const updateFournisseur = async (req, res) => {
  try {
    const { id } = req.params;
    const { nomComplet, adresse, telephone, email } = req.body;
    const userId = req.user.id;

    // Vérifier si le fournisseur existe et appartient à l'utilisateur
    const existingFournisseur = await prisma.fournisseur.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!existingFournisseur) {
      return res.status(404).json({
        message: 'Fournisseur non trouvé'
      });
    }

    // Vérifier si l'email est déjà utilisé par un autre fournisseur
    if (email && email !== existingFournisseur.email) {
      const emailExists = await prisma.fournisseur.findUnique({
        where: { email }
      });

      if (emailExists) {
        return res.status(400).json({
          message: 'Un fournisseur avec cet email existe déjà'
        });
      }
    }

    // Mettre à jour le fournisseur
    const updatedFournisseur = await prisma.fournisseur.update({
      where: { id: parseInt(id) },
      data: {
        nomComplet: nomComplet || existingFournisseur.nomComplet,
        adresse: adresse || existingFournisseur.adresse,
        telephone: telephone || existingFournisseur.telephone,
        email: email || existingFournisseur.email
      }
    });

    res.status(200).json({
      message: 'Fournisseur mis à jour avec succès',
      fournisseur: updatedFournisseur
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du fournisseur:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
};

// Supprimer un fournisseur
const deleteFournisseur = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Vérifier si le fournisseur existe et appartient à l'utilisateur
    const existingFournisseur = await prisma.fournisseur.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!existingFournisseur) {
      return res.status(404).json({
        message: 'Fournisseur non trouvé'
      });
    }

    // Supprimer le fournisseur
    await prisma.fournisseur.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      message: 'Fournisseur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du fournisseur:', error);
    res.status(500).json({
      message: 'Erreur interne du serveur',
      error: error.message
    });
  }
};

module.exports = {
  createFournisseur,
  getFournisseurs,
  getFournisseurById,
  updateFournisseur,
  deleteFournisseur
};
