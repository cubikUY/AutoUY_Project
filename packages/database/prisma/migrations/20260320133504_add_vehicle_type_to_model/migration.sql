-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "vehicleType" "VehicleType" NOT NULL DEFAULT 'AUTO';

-- CreateIndex
CREATE INDEX "Model_vehicleType_idx" ON "Model"("vehicleType");
