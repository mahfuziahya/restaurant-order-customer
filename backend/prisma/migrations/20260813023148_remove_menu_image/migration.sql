/*
  Warnings:

  - You are about to drop the column `image` on the `MenuItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "image";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "serviceType" DROP DEFAULT;
