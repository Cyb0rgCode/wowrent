import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { bookingSchema } from "@/lib/validations";
import { isCarAvailable, quotePrice } from "@/lib/availability";
import { ok, badRequest, unauthorized, notFound, handleError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { carId, startDate, endDate } = bookingSchema.parse(await req.json());
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return badRequest("Invalid dates");
    }
    if (end <= start) return badRequest("Return date must be after pick-up");
    if (start < new Date(new Date().toDateString())) {
      return badRequest("Pick-up date cannot be in the past");
    }

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car || car.status !== "ACTIVE") return notFound("Car not available");

    const owner = await prisma.supplierProfile.findUnique({
      where: { id: car.supplierId },
      select: { userId: true },
    });
    if (owner?.userId === user.id) {
      return badRequest("You cannot book your own car");
    }

    if (!(await isCarAvailable(carId, start, end))) {
      return badRequest("This car is already booked for the selected dates");
    }

    const quote = quotePrice(car.pricePerDay, start, end);

    const booking = await prisma.booking.create({
      data: {
        carId,
        clientId: user.id,
        startDate: start,
        endDate: end,
        days: quote.days,
        dailyRate: quote.dailyRate,
        subtotal: quote.subtotal,
        serviceFee: quote.serviceFee,
        total: quote.total,
        currency: car.currency,
        status: "PENDING",
        payment: {
          create: {
            amount: quote.total,
            commission: quote.serviceFee,
            currency: car.currency,
            status: "PENDING",
          },
        },
      },
    });

    return ok({ id: booking.id });
  } catch (err) {
    return handleError(err);
  }
}
