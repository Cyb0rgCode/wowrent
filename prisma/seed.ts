import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PHOTOS = {
  golf: [
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80",
    "https://images.unsplash.com/photo-1542362567-b07e54358753?w=1200&q=80",
  ],
  clio: [
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=80",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&q=80",
  ],
  suv: [
    "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1200&q=80",
    "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200&q=80",
  ],
  luxury: [
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1200&q=80",
    "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=1200&q=80",
  ],
  van: [
    "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200&q=80",
  ],
  pickup: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
  ],
};

async function main() {
  console.log("Seeding WowRent…");

  // Clean slate (FK cascade handles dependents).
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.car.deleteMany();
  await prisma.supplierProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const agencyUser = await prisma.user.create({
    data: {
      name: "Carthage Rent",
      email: "agency@wowrent.tn",
      phone: "+216 71 000 000",
      passwordHash,
      role: "SUPPLIER",
      supplierProfile: {
        create: {
          type: "AGENCY",
          businessName: "Carthage Rent Agency",
          location: "Tunis",
          bio: "Professional fleet serving Greater Tunis since 2012.",
          verified: true,
        },
      },
    },
    include: { supplierProfile: true },
  });

  const ownerUser = await prisma.user.create({
    data: {
      name: "Sami Ben Ali",
      email: "owner@wowrent.tn",
      phone: "+216 98 111 222",
      passwordHash,
      role: "SUPPLIER",
      supplierProfile: {
        create: {
          type: "INDIVIDUAL",
          businessName: "Sami's Cars",
          location: "Sousse",
          bio: "Friendly private owner. My cars are clean and well maintained.",
        },
      },
    },
    include: { supplierProfile: true },
  });

  const client = await prisma.user.create({
    data: {
      name: "Rayen Majoul",
      email: "client@wowrent.tn",
      phone: "+216 22 333 444",
      passwordHash,
      role: "CLIENT",
    },
  });

  const agencyId = agencyUser.supplierProfile!.id;
  const ownerId = ownerUser.supplierProfile!.id;

  const carsData = [
    {
      supplierId: agencyId,
      title: "Volkswagen Golf 7 — Automatic",
      make: "Volkswagen",
      model: "Golf 7",
      year: 2020,
      category: "COMPACT" as const,
      transmission: "AUTOMATIC" as const,
      fuel: "DIESEL" as const,
      seats: 5,
      pricePerDay: 120,
      location: "Tunis",
      description:
        "Comfortable and economical hatchback, perfect for city and highway. Full insurance included.",
      photos: PHOTOS.golf,
    },
    {
      supplierId: agencyId,
      title: "Renault Clio 5 — City car",
      make: "Renault",
      model: "Clio 5",
      year: 2021,
      category: "ECONOMY" as const,
      transmission: "MANUAL" as const,
      fuel: "GASOLINE" as const,
      seats: 5,
      pricePerDay: 85,
      location: "Tunis",
      description: "Compact, easy to park, great fuel economy.",
      photos: PHOTOS.clio,
    },
    {
      supplierId: agencyId,
      title: "Hyundai Tucson — SUV",
      make: "Hyundai",
      model: "Tucson",
      year: 2022,
      category: "SUV" as const,
      transmission: "AUTOMATIC" as const,
      fuel: "DIESEL" as const,
      seats: 5,
      pricePerDay: 180,
      location: "Tunis",
      description: "Spacious SUV ideal for family trips to the south.",
      photos: PHOTOS.suv,
    },
    {
      supplierId: ownerId,
      title: "Mercedes C-Class — Luxury",
      make: "Mercedes-Benz",
      model: "C200",
      year: 2021,
      category: "LUXURY" as const,
      transmission: "AUTOMATIC" as const,
      fuel: "GASOLINE" as const,
      seats: 5,
      pricePerDay: 320,
      location: "Sousse",
      description: "Travel in style. Leather seats, premium sound, low mileage.",
      photos: PHOTOS.luxury,
    },
    {
      supplierId: ownerId,
      title: "Dacia Dokker — Van",
      make: "Dacia",
      model: "Dokker",
      year: 2019,
      category: "VAN" as const,
      transmission: "MANUAL" as const,
      fuel: "DIESEL" as const,
      seats: 7,
      pricePerDay: 110,
      location: "Sousse",
      description: "Seven seats and lots of luggage space for group travel.",
      photos: PHOTOS.van,
    },
    {
      supplierId: ownerId,
      title: "Isuzu D-Max — Pickup",
      make: "Isuzu",
      model: "D-Max",
      year: 2020,
      category: "PICKUP" as const,
      transmission: "MANUAL" as const,
      fuel: "DIESEL" as const,
      seats: 5,
      pricePerDay: 150,
      location: "Sfax",
      description: "Tough 4x4 pickup for work or desert adventures.",
      photos: PHOTOS.pickup,
    },
  ];

  const cars = [];
  for (const data of carsData) {
    cars.push(await prisma.car.create({ data }));
  }

  // A completed past booking with a review (for the Golf).
  const golf = cars[0];
  const past = await prisma.booking.create({
    data: {
      carId: golf.id,
      clientId: client.id,
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-05-04"),
      days: 3,
      dailyRate: golf.pricePerDay,
      subtotal: golf.pricePerDay * 3,
      serviceFee: golf.pricePerDay * 3 * 0.1,
      total: golf.pricePerDay * 3 * 1.1,
      status: "COMPLETED",
      payment: {
        create: {
          amount: golf.pricePerDay * 3 * 1.1,
          commission: golf.pricePerDay * 3 * 0.1,
          status: "PAID",
          konnectPaymentRef: "mock_seed_paid",
        },
      },
    },
  });

  await prisma.review.create({
    data: {
      bookingId: past.id,
      carId: golf.id,
      authorId: client.id,
      rating: 5,
      comment:
        "Excellent car and very smooth pickup with the agency. Highly recommended!",
    },
  });

  // An open conversation between the client and the agency.
  const convo = await prisma.conversation.create({
    data: {
      clientId: client.id,
      supplierId: agencyUser.id,
      carId: golf.id,
      messages: {
        create: [
          {
            senderId: client.id,
            body: "Hi, is the Golf available next weekend?",
          },
          {
            senderId: agencyUser.id,
            body: "Hello! Yes it is, pickup is in central Tunis.",
          },
        ],
      },
    },
  });

  console.log("Seed complete.");
  console.log({
    cars: cars.length,
    accounts: {
      agency: "agency@wowrent.tn / password123",
      owner: "owner@wowrent.tn / password123",
      client: "client@wowrent.tn / password123",
    },
    sampleConversation: convo.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
