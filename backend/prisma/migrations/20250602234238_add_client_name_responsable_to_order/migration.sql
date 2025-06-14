/*
  Warnings:

  - Added the required column `clientName` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsable` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Ajouter les colonnes avec des valeurs par défaut pour les données existantes
ALTER TABLE "Order" ADD COLUMN "clientName" TEXT NOT NULL DEFAULT 'Client Existant';
ALTER TABLE "Order" ADD COLUMN "responsable" TEXT NOT NULL DEFAULT 'Responsable Existant';

-- Supprimer les valeurs par défaut pour les nouvelles insertions
ALTER TABLE "Order" ALTER COLUMN "clientName" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "responsable" DROP DEFAULT;
