/* Migration: add guest profile related tables */

-- GuestAccommodation
CREATE TABLE "GuestAccommodation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "guestId" TEXT NOT NULL UNIQUE,
  "hotelName" TEXT,
  "roomType" TEXT,
  "roomNumber" TEXT,
  "reservationStatus" TEXT,
  "checkIn" TIMESTAMP(3),
  "checkOut" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  CONSTRAINT "GuestAccommodation_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE
);

-- GuestTransportation
CREATE TABLE "GuestTransportation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "guestId" TEXT NOT NULL UNIQUE,
  "pickupLocation" TEXT,
  "dropLocation" TEXT,
  "vehicle" TEXT,
  "driverName" TEXT,
  "driverPhone" TEXT,
  "pickupTime" TIMESTAMP(3),
  "trackingLink" TEXT,
  "transportationStatus" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  CONSTRAINT "GuestTransportation_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE
);

-- GuestSeating
CREATE TABLE "GuestSeating" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "guestId" TEXT NOT NULL UNIQUE,
  "floor" TEXT,
  "section" TEXT,
  "tableNumber" TEXT,
  "seatNumber" TEXT,
  "seatingMapImage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  CONSTRAINT "GuestSeating_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE
);

-- GuestCommunication
CREATE TYPE "CommunicationType" AS ENUM ('EMAIL','WHATSAPP','SMS','PHONE_CALL');
CREATE TABLE "GuestCommunication" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "guestId" TEXT NOT NULL,
  "communicationType" "CommunicationType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "deliveryStatus" "DeliveryStatus" NOT NULL,
  CONSTRAINT "GuestCommunication_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE
);

-- GuestConciergeNote
CREATE TABLE "GuestConciergeNote" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "guestId" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  CONSTRAINT "GuestConciergeNote_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE
);

-- GuestDietaryPreference
CREATE TABLE "GuestDietaryPreference" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "guestId" TEXT NOT NULL,
  "preference" TEXT NOT NULL,
  CONSTRAINT "GuestDietaryPreference_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE
);

-- GuestSpecialRequest
CREATE TABLE "GuestSpecialRequest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "guestId" TEXT NOT NULL,
  "request" TEXT NOT NULL,
  CONSTRAINT "GuestSpecialRequest_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE CASCADE
);
