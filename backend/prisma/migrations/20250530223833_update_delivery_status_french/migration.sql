/*
  Warnings:

  - The values [PLANNED,IN_PROGRESS,DELIVERED,FAILED,CANCELLED,RESCHEDULED] on the enum `DeliveryStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DeliveryStatus_new" AS ENUM ('EN_ATTENTE', 'CONFIRMEE', 'PRETE', 'EN_COURS_DE_LIVRAISON', 'LIVREE', 'REPORTEE', 'ANNULEE');
ALTER TABLE "DeliveryPlanning" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "DeliveryPlanning" ALTER COLUMN "status" TYPE "DeliveryStatus_new" USING ("status"::text::"DeliveryStatus_new");
ALTER TYPE "DeliveryStatus" RENAME TO "DeliveryStatus_old";
ALTER TYPE "DeliveryStatus_new" RENAME TO "DeliveryStatus";
DROP TYPE "DeliveryStatus_old";
ALTER TABLE "DeliveryPlanning" ALTER COLUMN "status" SET DEFAULT 'EN_ATTENTE';
COMMIT;

-- AlterTable
ALTER TABLE "DeliveryPlanning" ALTER COLUMN "status" SET DEFAULT 'EN_ATTENTE';
