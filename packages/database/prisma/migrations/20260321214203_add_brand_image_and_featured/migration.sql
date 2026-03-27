-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Brand_isFeatured_idx" ON "Brand"("isFeatured");
