-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "groupId" TEXT;

-- CreateTable
CREATE TABLE "GuestGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "primaryGuestId" TEXT,
    "location" TEXT,
    "transportation" TEXT,
    "specialRequirement" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestGroup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Guest" ADD CONSTRAINT "Guest_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "GuestGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
