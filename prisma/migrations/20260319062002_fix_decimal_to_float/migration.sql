/*
  Warnings:

  - You are about to alter the column `yield` on the `production` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "production" ADD COLUMN     "machine" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "shift" TEXT,
ALTER COLUMN "yield" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "profit" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "totalCost" SET DATA TYPE DOUBLE PRECISION;
