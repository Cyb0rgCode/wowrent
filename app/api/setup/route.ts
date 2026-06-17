import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const SETUP_KEY = "wowrent-setup-2026";

export const maxDuration = 30;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("secret") !== SETUP_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prisma = new PrismaClient();
  const logs: string[] = [];

  try {
    // 1. Create tables via raw SQL (idempotent with IF NOT EXISTS)
    logs.push("Creating schema...");
    await createSchema(prisma);
    logs.push("Schema ready.");

    // 2. Seed demo data (skip if data exists)
    const userCount = await prisma.user.count().catch(() => 0);
    if (userCount > 0) {
      logs.push(`Database already has ${userCount} users — skipping seed.`);
      return NextResponse.json({ success: true, logs });
    }

    logs.push("Seeding demo data...");
    await seedData(prisma);
    logs.push("Seed complete.");

    return NextResponse.json({ success: true, logs });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logs.push(`ERROR: ${message}`);
    return NextResponse.json({ success: false, logs }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

async function createSchema(prisma: PrismaClient) {
  // Enums
  const enums = [
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN CREATE TYPE "Role" AS ENUM ('CLIENT', 'SUPPLIER', 'ADMIN'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'SupplierType') THEN CREATE TYPE "SupplierType" AS ENUM ('INDIVIDUAL', 'AGENCY'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CarCategory') THEN CREATE TYPE "CarCategory" AS ENUM ('ECONOMY', 'COMPACT', 'SEDAN', 'SUV', 'LUXURY', 'VAN', 'PICKUP'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Transmission') THEN CREATE TYPE "Transmission" AS ENUM ('MANUAL', 'AUTOMATIC'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FuelType') THEN CREATE TYPE "FuelType" AS ENUM ('GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CarStatus') THEN CREATE TYPE "CarStatus" AS ENUM ('ACTIVE', 'HIDDEN'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BookingStatus') THEN CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'); END IF; END $$`,
    `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED'); END IF; END $$`,
  ];
  for (const sql of enums) await prisma.$executeRawUnsafe(sql);

  // Tables
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL, "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL,
      "name" TEXT NOT NULL, "phone" TEXT, "avatarUrl" TEXT,
      "role" "Role" NOT NULL DEFAULT 'CLIENT',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    )`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SupplierProfile" (
      "id" TEXT NOT NULL, "userId" TEXT NOT NULL,
      "type" "SupplierType" NOT NULL DEFAULT 'INDIVIDUAL',
      "businessName" TEXT NOT NULL, "bio" TEXT, "location" TEXT,
      "verified" BOOLEAN NOT NULL DEFAULT false, "konnectWalletId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "SupplierProfile_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "SupplierProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    )`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "SupplierProfile_userId_key" ON "SupplierProfile"("userId")`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Car" (
      "id" TEXT NOT NULL, "supplierId" TEXT NOT NULL,
      "title" TEXT NOT NULL, "make" TEXT NOT NULL, "model" TEXT NOT NULL,
      "year" INTEGER NOT NULL, "category" "CarCategory" NOT NULL,
      "transmission" "Transmission" NOT NULL DEFAULT 'MANUAL',
      "fuel" "FuelType" NOT NULL DEFAULT 'GASOLINE',
      "seats" INTEGER NOT NULL DEFAULT 5, "pricePerDay" DOUBLE PRECISION NOT NULL,
      "currency" TEXT NOT NULL DEFAULT 'TND', "location" TEXT NOT NULL,
      "description" TEXT NOT NULL DEFAULT '', "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "status" "CarStatus" NOT NULL DEFAULT 'ACTIVE',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Car_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "Car_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierProfile"("id") ON DELETE CASCADE
    )`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Car_location_idx" ON "Car"("location")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Car_category_idx" ON "Car"("category")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Car_status_idx" ON "Car"("status")`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Booking" (
      "id" TEXT NOT NULL, "carId" TEXT NOT NULL, "clientId" TEXT NOT NULL,
      "startDate" TIMESTAMP(3) NOT NULL, "endDate" TIMESTAMP(3) NOT NULL,
      "days" INTEGER NOT NULL, "dailyRate" DOUBLE PRECISION NOT NULL,
      "subtotal" DOUBLE PRECISION NOT NULL, "serviceFee" DOUBLE PRECISION NOT NULL,
      "total" DOUBLE PRECISION NOT NULL, "currency" TEXT NOT NULL DEFAULT 'TND',
      "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Booking_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "Booking_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE,
      CONSTRAINT "Booking_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE
    )`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Booking_carId_startDate_endDate_idx" ON "Booking"("carId","startDate","endDate")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Booking_clientId_idx" ON "Booking"("clientId")`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Payment" (
      "id" TEXT NOT NULL, "bookingId" TEXT NOT NULL,
      "konnectPaymentRef" TEXT, "amount" DOUBLE PRECISION NOT NULL,
      "commission" DOUBLE PRECISION NOT NULL, "currency" TEXT NOT NULL DEFAULT 'TND',
      "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE
    )`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Payment_bookingId_key" ON "Payment"("bookingId")`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Review" (
      "id" TEXT NOT NULL, "bookingId" TEXT NOT NULL, "carId" TEXT NOT NULL,
      "authorId" TEXT NOT NULL, "rating" INTEGER NOT NULL,
      "comment" TEXT NOT NULL DEFAULT '',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Review_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE,
      CONSTRAINT "Review_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE,
      CONSTRAINT "Review_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE
    )`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Review_bookingId_key" ON "Review"("bookingId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Review_carId_idx" ON "Review"("carId")`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Conversation" (
      "id" TEXT NOT NULL, "carId" TEXT, "clientId" TEXT NOT NULL,
      "supplierId" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "Conversation_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE SET NULL,
      CONSTRAINT "Conversation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE CASCADE,
      CONSTRAINT "Conversation_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "User"("id") ON DELETE CASCADE
    )`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Conversation_clientId_idx" ON "Conversation"("clientId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Conversation_supplierId_idx" ON "Conversation"("supplierId")`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Conversation_clientId_supplierId_carId_key" ON "Conversation"("clientId","supplierId","carId")`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Message" (
      "id" TEXT NOT NULL, "conversationId" TEXT NOT NULL,
      "senderId" TEXT NOT NULL, "body" TEXT NOT NULL,
      "readAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Message_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE,
      CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE
    )`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Message_conversationId_idx" ON "Message"("conversationId")`);
}

const PHOTOS = {
  golf: [
    "https://images.unsplash.com/photo-1619976215249-0cba7e798bdf?w=1200&q=80",
    "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&q=80",
  ],
  clio: [
    "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=1200&q=80",
    "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=1200&q=80",
  ],
  suv: [
    "https://images.unsplash.com/photo-1622838320197-0f4845354bba?w=1200&q=80",
    "https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?w=1200&q=80",
  ],
  luxury: [
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80",
    "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=1200&q=80",
  ],
  van: [
    "https://images.unsplash.com/photo-1632245889029-e406faaa34cd?w=1200&q=80",
  ],
  pickup: [
    "https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=1200&q=80",
  ],
};

async function seedData(prisma: PrismaClient) {
  const hash = await bcrypt.hash("password123", 10);

  const agency = await prisma.user.create({
    data: {
      name: "Carthage Rent", email: "agency@wowrent.tn",
      phone: "+216 71 000 000", passwordHash: hash, role: "SUPPLIER",
      supplierProfile: {
        create: {
          type: "AGENCY", businessName: "Carthage Rent Agency",
          location: "Tunis", bio: "Professional fleet serving Greater Tunis since 2012.", verified: true,
        },
      },
    },
    include: { supplierProfile: true },
  });

  const owner = await prisma.user.create({
    data: {
      name: "Sami Ben Ali", email: "owner@wowrent.tn",
      phone: "+216 98 111 222", passwordHash: hash, role: "SUPPLIER",
      supplierProfile: {
        create: {
          type: "INDIVIDUAL", businessName: "Sami's Cars",
          location: "Sousse", bio: "Friendly private owner. My cars are clean and well maintained.",
        },
      },
    },
    include: { supplierProfile: true },
  });

  const client = await prisma.user.create({
    data: {
      name: "Rayen Majoul", email: "client@wowrent.tn",
      phone: "+216 22 333 444", passwordHash: hash, role: "CLIENT",
    },
  });

  const agencyId = agency.supplierProfile!.id;
  const ownerId = owner.supplierProfile!.id;

  const carsData = [
    { supplierId: agencyId, title: "Volkswagen Golf 7 — Automatic", make: "Volkswagen", model: "Golf 7", year: 2020, category: "COMPACT" as const, transmission: "AUTOMATIC" as const, fuel: "DIESEL" as const, seats: 5, pricePerDay: 120, location: "Tunis", description: "Comfortable and economical hatchback, perfect for city and highway.", photos: PHOTOS.golf },
    { supplierId: agencyId, title: "Renault Clio 5 — City car", make: "Renault", model: "Clio 5", year: 2021, category: "ECONOMY" as const, transmission: "MANUAL" as const, fuel: "GASOLINE" as const, seats: 5, pricePerDay: 85, location: "Tunis", description: "Compact, easy to park, great fuel economy.", photos: PHOTOS.clio },
    { supplierId: agencyId, title: "Hyundai Tucson — SUV", make: "Hyundai", model: "Tucson", year: 2022, category: "SUV" as const, transmission: "AUTOMATIC" as const, fuel: "DIESEL" as const, seats: 5, pricePerDay: 180, location: "Tunis", description: "Spacious SUV ideal for family trips to the south.", photos: PHOTOS.suv },
    { supplierId: ownerId, title: "Mercedes C-Class — Luxury", make: "Mercedes-Benz", model: "C200", year: 2021, category: "LUXURY" as const, transmission: "AUTOMATIC" as const, fuel: "GASOLINE" as const, seats: 5, pricePerDay: 320, location: "Sousse", description: "Travel in style. Leather seats, premium sound, low mileage.", photos: PHOTOS.luxury },
    { supplierId: ownerId, title: "Dacia Dokker — Van", make: "Dacia", model: "Dokker", year: 2019, category: "VAN" as const, transmission: "MANUAL" as const, fuel: "DIESEL" as const, seats: 7, pricePerDay: 110, location: "Sousse", description: "Seven seats and lots of luggage space for group travel.", photos: PHOTOS.van },
    { supplierId: ownerId, title: "Isuzu D-Max — Pickup", make: "Isuzu", model: "D-Max", year: 2020, category: "PICKUP" as const, transmission: "MANUAL" as const, fuel: "DIESEL" as const, seats: 5, pricePerDay: 150, location: "Sfax", description: "Tough 4x4 pickup for work or desert adventures.", photos: PHOTOS.pickup },
  ];

  const cars = [];
  for (const d of carsData) cars.push(await prisma.car.create({ data: d }));

  const golf = cars[0];
  const past = await prisma.booking.create({
    data: {
      carId: golf.id, clientId: client.id,
      startDate: new Date("2026-05-01"), endDate: new Date("2026-05-04"),
      days: 3, dailyRate: golf.pricePerDay,
      subtotal: golf.pricePerDay * 3, serviceFee: golf.pricePerDay * 3 * 0.1,
      total: golf.pricePerDay * 3 * 1.1, status: "COMPLETED",
      payment: {
        create: {
          amount: golf.pricePerDay * 3 * 1.1, commission: golf.pricePerDay * 3 * 0.1,
          status: "PAID", konnectPaymentRef: "mock_seed_paid",
        },
      },
    },
  });

  await prisma.review.create({
    data: {
      bookingId: past.id, carId: golf.id, authorId: client.id,
      rating: 5, comment: "Excellent car and very smooth pickup with the agency. Highly recommended!",
    },
  });

  await prisma.conversation.create({
    data: {
      clientId: client.id, supplierId: agency.id, carId: golf.id,
      messages: {
        create: [
          { senderId: client.id, body: "Hi, is the Golf available next weekend?" },
          { senderId: agency.id, body: "Hello! Yes it is, pickup is in central Tunis." },
        ],
      },
    },
  });
}
