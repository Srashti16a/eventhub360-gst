-- CreateEnum
CREATE TYPE "TransportationStatus" AS ENUM ('SCHEDULED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "FleetActivityLog" DROP CONSTRAINT IF EXISTS "FleetActivityLog_driverId_fkey";

-- DropForeignKey
ALTER TABLE "FleetAssignment" DROP CONSTRAINT IF EXISTS "FleetAssignment_driverId_fkey";

-- DropForeignKey
ALTER TABLE "GuestAccommodation" DROP CONSTRAINT IF EXISTS "GuestAccommodation_guestId_fkey";

-- DropForeignKey
ALTER TABLE "GuestCommunication" DROP CONSTRAINT IF EXISTS "GuestCommunication_guestId_fkey";

-- DropForeignKey
ALTER TABLE "GuestConciergeNote" DROP CONSTRAINT IF EXISTS "GuestConciergeNote_guestId_fkey";

-- DropForeignKey
ALTER TABLE "GuestDietaryPreference" DROP CONSTRAINT IF EXISTS "GuestDietaryPreference_guestId_fkey";

-- DropForeignKey
ALTER TABLE "GuestSeating" DROP CONSTRAINT IF EXISTS "GuestSeating_guestId_fkey";

-- DropForeignKey
ALTER TABLE "GuestSpecialRequest" DROP CONSTRAINT IF EXISTS "GuestSpecialRequest_guestId_fkey";

-- DropForeignKey
ALTER TABLE "GuestTransportation" DROP CONSTRAINT IF EXISTS "GuestTransportation_guestId_fkey";

-- DropForeignKey
ALTER TABLE "TransferSchedule" DROP CONSTRAINT IF EXISTS "TransferSchedule_driverId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT IF EXISTS "Vehicle_driverId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "FleetAssignment_eventId_vehicleId_driverId_key";

-- AlterTable
ALTER TABLE "FleetActivityLog" DROP COLUMN IF EXISTS "driverId";

-- AlterTable
ALTER TABLE "FleetAssignment" DROP COLUMN IF EXISTS "driverId";

-- AlterTable
ALTER TABLE "GuestAccommodation" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "GuestSeating" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "GuestTransportation" DROP COLUMN IF EXISTS "transportationStatus";
ALTER TABLE "GuestTransportation" ADD COLUMN "transportationStatus" "TransportationStatus";
ALTER TABLE "GuestTransportation" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TransferSchedule" DROP COLUMN IF EXISTS "driverId";

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN IF EXISTS "driverId";

-- DropTable
DROP TABLE IF EXISTS "Driver";

-- DropTable
DROP TABLE IF EXISTS "magic_links";

-- AddForeignKey
ALTER TABLE "GuestAccommodation" ADD CONSTRAINT "GuestAccommodation_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestTransportation" ADD CONSTRAINT "GuestTransportation_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestSeating" ADD CONSTRAINT "GuestSeating_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestCommunication" ADD CONSTRAINT "GuestCommunication_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestConciergeNote" ADD CONSTRAINT "GuestConciergeNote_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestDietaryPreference" ADD CONSTRAINT "GuestDietaryPreference_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestSpecialRequest" ADD CONSTRAINT "GuestSpecialRequest_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
