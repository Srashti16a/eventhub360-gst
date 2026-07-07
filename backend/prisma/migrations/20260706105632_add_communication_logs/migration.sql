-- CreateEnum
CREATE TYPE "CommunicationChannel" AS ENUM ('EMAIL', 'WHATSAPP', 'SMS');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('DELIVERED', 'SENT', 'FAILED', 'PENDING', 'READ');

-- CreateTable
CREATE TABLE "CommunicationLog" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT,
    "recipientName" TEXT NOT NULL,
    "recipientContact" TEXT NOT NULL,
    "channel" "CommunicationChannel" NOT NULL,
    "status" "DeliveryStatus" NOT NULL,
    "deliveryResult" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL DEFAULT 0,
    "headerInfo" JSONB,
    "payloadData" JSONB,
    "retryHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunicationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteConfiguration" (
    "id" TEXT NOT NULL,
    "channel" "CommunicationChannel" NOT NULL,
    "activeProvider" TEXT NOT NULL,
    "isRerouted" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RouteConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunicationLog_recipientId_idx" ON "CommunicationLog"("recipientId");

-- CreateIndex
CREATE INDEX "CommunicationLog_channel_idx" ON "CommunicationLog"("channel");

-- CreateIndex
CREATE INDEX "CommunicationLog_status_idx" ON "CommunicationLog"("status");

-- CreateIndex
CREATE INDEX "CommunicationLog_createdAt_idx" ON "CommunicationLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RouteConfiguration_channel_key" ON "RouteConfiguration"("channel");

-- AddForeignKey
ALTER TABLE "CommunicationLog" ADD CONSTRAINT "CommunicationLog_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
