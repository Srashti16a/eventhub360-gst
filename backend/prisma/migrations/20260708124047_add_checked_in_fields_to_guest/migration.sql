-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "checkedIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "checkinEntrance" TEXT,
ADD COLUMN     "checkinStatus" TEXT NOT NULL DEFAULT 'SUCCESS',
ADD COLUMN     "checkinTime" TIMESTAMP(3);
