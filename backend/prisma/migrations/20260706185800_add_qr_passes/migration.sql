-- CreateEnum
CREATE TYPE "QRPassType" AS ENUM ('VIP', 'ATTENDEE', 'STAFF', 'SPEAKER', 'VENDOR', 'MEDIA');

-- CreateEnum
CREATE TYPE "QRPassStatus" AS ENUM ('ACTIVE', 'SCANNED', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('SUCCESS', 'FAILED_EXPIRED', 'FAILED_REVOKED', 'FAILED_DUPLICATE', 'FAILED_INVALID');

-- CreateTable
CREATE TABLE "QRPass" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "passType" "QRPassType" NOT NULL,
    "status" "QRPassStatus" NOT NULL DEFAULT 'ACTIVE',
    "qrCode" TEXT NOT NULL,
    "passNumber" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastScannedAt" TIMESTAMP(3),
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QRPass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanHistory" (
    "id" TEXT NOT NULL,
    "qrPassId" TEXT NOT NULL,
    "scanLocation" TEXT,
    "scannerName" TEXT,
    "deviceId" TEXT,
    "scanTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scanStatus" "ScanStatus" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PassDeliveryLog" (
    "id" TEXT NOT NULL,
    "qrPassId" TEXT NOT NULL,
    "channel" "CommunicationType" NOT NULL,
    "status" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PassDeliveryLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QRPass_qrCode_key" ON "QRPass"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "QRPass_passNumber_key" ON "QRPass"("passNumber");

-- CreateIndex
CREATE UNIQUE INDEX "QRPass_guestId_eventId_key" ON "QRPass"("guestId", "eventId");

-- AddForeignKey
ALTER TABLE "QRPass" ADD CONSTRAINT "QRPass_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRPass" ADD CONSTRAINT "QRPass_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanHistory" ADD CONSTRAINT "ScanHistory_qrPassId_fkey" FOREIGN KEY ("qrPassId") REFERENCES "QRPass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PassDeliveryLog" ADD CONSTRAINT "PassDeliveryLog_qrPassId_fkey" FOREIGN KEY ("qrPassId") REFERENCES "QRPass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
