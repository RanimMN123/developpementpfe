-- AlterTable
ALTER TABLE "Client" 
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Ajout de la colonne "updatedAt" avec une valeur par défaut
ADD COLUMN "userId" INTEGER NOT NULL DEFAULT 1;  -- Ajout de la colonne "userId" avec une valeur par défaut (1 ou une valeur valide qui existe déjà dans "User")

-- Créer la table "User"
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,  -- Création de la colonne "id" en tant que clé primaire auto-incrémentée
    "email" TEXT NOT NULL,  -- Création de la colonne "email"
    "password" TEXT NOT NULL,  -- Création de la colonne "password"
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Création de la colonne "createdAt" avec une valeur par défaut
    "updatedAt" TIMESTAMP(3) NOT NULL,  -- Création de la colonne "updatedAt"
    
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")  -- Définition de la contrainte primaire sur "id"
);

-- Créer l'index unique sur "email" (assurer que les emails soient uniques)
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Ajouter la clé étrangère pour la relation avec "User" dans la table "Client"
ALTER TABLE "Client" 
ADD CONSTRAINT "Client_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id")  -- Créer la clé étrangère sur "userId" faisant référence à "id" dans "User"
ON DELETE RESTRICT  -- Si un utilisateur est supprimé, la suppression est empêchée si des clients y sont associés
ON UPDATE CASCADE;  -- Si l'ID d'un utilisateur est modifié, cette modification est propagée dans la table "Client"
