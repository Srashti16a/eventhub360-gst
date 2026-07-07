-- CreateEnum
CREATE TYPE "CheckInStatus" AS ENUM ('SUCCESS', 'FLAGGED');

-- CreateEnum
CREATE TYPE "VipTier" AS ENUM ('PLATINUM', 'KEYNOTE', 'GOLD', 'ATTENDEE');

-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "vipTier" "VipTier" NOT NULL DEFAULT 'ATTENDEE';

-- CreateTable
CREATE TABLE "Entrance" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entrance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "entranceId" TEXT NOT NULL,
    "status" "CheckInStatus" NOT NULL,
    "checkedInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "staffId" TEXT,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "assignedEntrance" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Entrance_eventId_name_key" ON "Entrance"("eventId", "name");

-- CreateIndex
CREATE INDEX "CheckIn_guestId_idx" ON "CheckIn"("guestId");

-- CreateIndex
CREATE INDEX "CheckIn_eventId_idx" ON "CheckIn"("eventId");

-- CreateIndex
CREATE INDEX "CheckIn_entranceId_idx" ON "CheckIn"("entranceId");

-- CreateIndex
CREATE INDEX "CheckIn_staffId_idx" ON "CheckIn"("staffId");

-- AddForeignKey
ALTER TABLE "Entrance" ADD CONSTRAINT "Entrance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_entranceId_fkey" FOREIGN KEY ("entranceId") REFERENCES "Entrance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
