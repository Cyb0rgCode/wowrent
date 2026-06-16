import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { carSchema } from "@/lib/validations";
import {
  ok,
  unauthorized,
  forbidden,
  notFound,
  handleError,
} from "@/lib/api";

async function loadOwnedCar(carId: string, userId: string) {
  const car = await prisma.car.findUnique({
    where: { id: carId },
    include: { supplier: true },
  });
  if (!car) return { error: "notfound" as const };
  if (car.supplier.userId !== userId) return { error: "forbidden" as const };
  return { car };
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const result = await loadOwnedCar(params.id, user.id);
    if (result.error === "notfound") return notFound("Car not found");
    if (result.error === "forbidden") return forbidden();

    const data = carSchema.partial().parse(await req.json());

    const car = await prisma.car.update({
      where: { id: params.id },
      data: {
        ...data,
        description: data.description ?? undefined,
      },
    });

    return ok({ id: car.id });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const result = await loadOwnedCar(params.id, user.id);
    if (result.error === "notfound") return notFound("Car not found");
    if (result.error === "forbidden") return forbidden();

    // Soft-hide if there are bookings, otherwise hard delete.
    const bookingCount = await prisma.booking.count({
      where: { carId: params.id },
    });
    if (bookingCount > 0) {
      await prisma.car.update({
        where: { id: params.id },
        data: { status: "HIDDEN" },
      });
      return ok({ hidden: true });
    }
    await prisma.car.delete({ where: { id: params.id } });
    return ok({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
