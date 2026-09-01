-- DropForeignKey
ALTER TABLE "public"."Order" DROP CONSTRAINT "Order_tableId_fkey";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "guestCount" INTEGER,
ADD COLUMN     "guestName" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
ADD COLUMN     "serviceType" TEXT NOT NULL DEFAULT 'DINE_IN',
ALTER COLUMN "tableId" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;
