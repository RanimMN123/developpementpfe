-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('ESPECE', 'CHEQUE', 'CREDIT', 'TICKET_RESTO', 'CARTE');

-- CreateTable
CREATE TABLE "caisse_ventes" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "methodePaiement" "PaymentMethod" NOT NULL DEFAULT 'ESPECE',
    "dateVente" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caisse_ventes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "caisse_ventes_orderId_key" ON "caisse_ventes"("orderId");

-- AddForeignKey
ALTER TABLE "caisse_ventes" ADD CONSTRAINT "caisse_ventes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caisse_ventes" ADD CONSTRAINT "caisse_ventes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
