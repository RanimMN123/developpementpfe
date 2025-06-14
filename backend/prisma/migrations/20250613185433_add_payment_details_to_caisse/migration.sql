-- AlterTable
ALTER TABLE "caisse_ventes" ADD COLUMN     "montantBrut" DOUBLE PRECISION,
ADD COLUMN     "reduction" DOUBLE PRECISION DEFAULT 0;
