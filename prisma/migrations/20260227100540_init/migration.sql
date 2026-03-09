/*
  Warnings:

  - You are about to drop the column `pricePerUnit` on the `Dispatch` table. All the data in the column will be lost.
  - You are about to drop the column `revenue` on the `Dispatch` table. All the data in the column will be lost.
  - You are about to drop the column `electricityCost` on the `Production` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedRevenue` on the `Production` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedUnitPrice` on the `Production` table. All the data in the column will be lost.
  - You are about to drop the column `laborCost` on the `Production` table. All the data in the column will be lost.
  - You are about to drop the column `otherCost` on the `Production` table. All the data in the column will be lost.
  - You are about to drop the column `rawMaterialCost` on the `Production` table. All the data in the column will be lost.
  - Added the required column `productionId` to the `Dispatch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellingPrice` to the `Dispatch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalRevenue` to the `Dispatch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `remainingQuantity` to the `Production` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'ACCOUNTANT';
ALTER TYPE "Role" ADD VALUE 'DISPATCH_MANAGER';
ALTER TYPE "Role" ADD VALUE 'INVENTORY_MANAGER';

-- DropIndex
DROP INDEX "Dispatch_createdAt_idx";

-- DropIndex
DROP INDEX "Dispatch_factoryId_idx";

-- DropIndex
DROP INDEX "Dispatch_status_idx";

-- DropIndex
DROP INDEX "Production_createdAt_idx";

-- DropIndex
DROP INDEX "Production_factoryId_idx";

-- DropIndex
DROP INDEX "User_factoryId_idx";

-- AlterTable
ALTER TABLE "Dispatch" DROP COLUMN "pricePerUnit",
DROP COLUMN "revenue",
ADD COLUMN     "productionId" TEXT NOT NULL,
ADD COLUMN     "sellingPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalRevenue" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Production" DROP COLUMN "electricityCost",
DROP COLUMN "estimatedRevenue",
DROP COLUMN "estimatedUnitPrice",
DROP COLUMN "laborCost",
DROP COLUMN "otherCost",
DROP COLUMN "rawMaterialCost",
ADD COLUMN     "remainingQuantity" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "totalCost" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "note" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryLog" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "beforeQty" DOUBLE PRECISION NOT NULL,
    "afterQty" DOUBLE PRECISION NOT NULL,
    "referenceId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "factoryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Dispatch" ADD CONSTRAINT "Dispatch_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLog" ADD CONSTRAINT "InventoryLog_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_factoryId_fkey" FOREIGN KEY ("factoryId") REFERENCES "Factory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
