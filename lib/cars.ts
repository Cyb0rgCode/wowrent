import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";
import type { CarCardData } from "@/components/CarCard";

export type CarFilters = {
  q?: string;
  location?: string;
  category?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  seats?: number;
};

export function buildCarWhere(filters: CarFilters): Prisma.CarWhereInput {
  const where: Prisma.CarWhereInput = { status: "ACTIVE" };

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { make: { contains: filters.q, mode: "insensitive" } },
      { model: { contains: filters.q, mode: "insensitive" } },
    ];
  }
  if (filters.location)
    where.location = { contains: filters.location, mode: "insensitive" };
  if (filters.category)
    where.category = filters.category as Prisma.CarWhereInput["category"];
  if (filters.transmission)
    where.transmission =
      filters.transmission as Prisma.CarWhereInput["transmission"];
  if (filters.seats) where.seats = { gte: filters.seats };
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.pricePerDay = {};
    if (filters.minPrice !== undefined) where.pricePerDay.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.pricePerDay.lte = filters.maxPrice;
  }
  return where;
}

/**
 * Loads active cars matching the filters and decorates each with its average
 * rating and review count.
 */
export async function findCars(filters: CarFilters): Promise<CarCardData[]> {
  const cars = await prisma.car.findMany({
    where: buildCarWhere(filters),
    include: {
      supplier: { select: { businessName: true, type: true } },
      reviews: { select: { rating: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return cars.map((car) => toCardData(car));
}

type CarWithExtras = Prisma.CarGetPayload<{
  include: {
    supplier: { select: { businessName: true; type: true } };
    reviews: { select: { rating: true } };
  };
}>;

export function toCardData(car: CarWithExtras): CarCardData {
  const reviewCount = car.reviews.length;
  const avgRating =
    reviewCount > 0
      ? car.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

  return {
    id: car.id,
    title: car.title,
    category: car.category,
    location: car.location,
    pricePerDay: car.pricePerDay,
    photos: car.photos,
    transmission: car.transmission,
    seats: car.seats,
    avgRating,
    reviewCount,
    supplierName: car.supplier.businessName,
    supplierType: car.supplier.type,
  };
}
