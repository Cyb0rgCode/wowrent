import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  handleError,
} from "@/lib/api";

/**
 * PATCH updates a booking's status. Allowed transitions:
 *  - client cancels their own PENDING/CONFIRMED booking
 *  - supplier marks a CONFIRMED booking COMPLETED (after the rental window)
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { car: { include: { supplier: true } } },
    });
    if (!booking) return notFound("Booking not found");

    const isClient = booking.clientId === user.id;
    const isSupplier = booking.car.supplier.userId === user.id;
    if (!isClient && !isSupplier) return forbidden();

    const { action } = (await req.json()) as { action: string };

    if (action === "cancel") {
      if (!isClient && !isSupplier) return forbidden();
      if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
        return badRequest("This booking can no longer be cancelled");
      }
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED" },
      });
      return ok({ status: "CANCELLED" });
    }

    if (action === "complete") {
      if (!isSupplier) return forbidden("Only the owner can complete a trip");
      if (booking.status !== "CONFIRMED") {
        return badRequest("Only confirmed bookings can be completed");
      }
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "COMPLETED" },
      });
      return ok({ status: "COMPLETED" });
    }

    return badRequest("Unknown action");
  } catch (err) {
    return handleError(err);
  }
}
