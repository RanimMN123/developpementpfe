/*
  Warnings:

  - You are about to drop the column `email` on the `Fournisseur` table. All the data in the column will be lost.
  - You are about to drop the column `nomComplet` on the `Fournisseur` table. All the data in the column will be lost.
  - You are about to drop the column `telephone` on the `Fournisseur` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mail]` on the table `Fournisseur` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mail` to the `Fournisseur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nom` to the `Fournisseur` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero` to the `Fournisseur` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Fournisseur_email_key";

-- AlterTable
ALTER TABLE "Fournisseur" DROP COLUMN "email",
DROP COLUMN "nomComplet",
DROP COLUMN "telephone",
ADD COLUMN     "mail" TEXT NOT NULL,
ADD COLUMN     "nom" TEXT NOT NULL,
ADD COLUMN     "numero" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Fournisseur_mail_key" ON "Fournisseur"("mail");
