const express = require('express');
const router = express.Router();
const {
  createFournisseur,
  getFournisseurs,
  getFournisseurById,
  updateFournisseur,
  deleteFournisseur
} = require('../controllers/fournisseurController');
const { authenticateToken } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les fournisseurs
router.post('/', createFournisseur);           // POST /api/fournisseurs - Créer un fournisseur
router.get('/', getFournisseurs);              // GET /api/fournisseurs - Récupérer tous les fournisseurs
router.get('/:id', getFournisseurById);        // GET /api/fournisseurs/:id - Récupérer un fournisseur par ID
router.put('/:id', updateFournisseur);         // PUT /api/fournisseurs/:id - Mettre à jour un fournisseur
router.delete('/:id', deleteFournisseur);      // DELETE /api/fournisseurs/:id - Supprimer un fournisseur

module.exports = router;
