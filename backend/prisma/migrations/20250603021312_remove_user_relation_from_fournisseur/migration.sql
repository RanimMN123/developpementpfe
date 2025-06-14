/*
  Warnings:

  - You are about to drop the column `userId` on the `Fournisseur` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Fournisseur" DROP CONSTRAINT "Fournisseur_userId_fkey";

-- AlterTable
ALTER TABLE "Fournisseur" DROP COLUMN "userId";
