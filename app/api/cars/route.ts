import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { carSchema } from "@/lib/validations";
import { findCars } from "@/lib/cars";
import { ok, unauthorized, forbidden, handleError } from "@/lib/api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cars = await findCars({
    q: searchParams.get("q") || undefined,
    location: searchParams.get("location") || undefined,
    category: searchParams.get("category") || undefined,
    transmission: searchParams.get("transmission") || undefined,
    minPrice: searchParams.get("minPrice")
      ? Number(searchParams.get("minPrice"))
      : undefined,
    maxPrice: searchParams.get("maxPrice")
      ? Number(searchParams.get("maxPrice"))
      : undefined,
    seats: searchParams.get("seats")
      ? Number(searchParams.get("seats"))
      : undefined,
  });
  return ok({ cars });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!user.supplierProfile) {
      return forbidden("Create a supplier profile before listing a car");
    }

    const data = carSchema.parse(await req.json());

    const car = await prisma.car.create({
      data: {
        supplierId: user.supplierProfile.id,
        title: data.title,
        make: data.make,
        model: data.model,
        year: data.year,
        category: data.category,
        transmission: data.transmission,
        fuel: data.fuel,
        seats: data.seats,
        pricePerDay: data.pricePerDay,
        location: data.location,
        description: data.description || "",
        photos: data.photos,
        status: data.status,
      },
    });

    return ok({ id: car.id });
  } catch (err) {
    return handleError(err);
  }
}
