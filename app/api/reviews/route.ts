import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  handleError,
} from "@/lib/api";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { bookingId, rating, comment } = reviewSchema.parse(
      await req.json(),
    );

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: true },
    });
    if (!booking) return notFound("Booking not found");
    if (booking.clientId !== user.id) return forbidden();
    if (booking.status !== "COMPLETED") {
      return badRequest("You can only review completed trips");
    }
    if (booking.review) {
      return badRequest("You already reviewed this trip");
    }

    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        carId: booking.carId,
        authorId: user.id,
        rating,
        comment: comment || "",
      },
    });

    return ok({ id: review.id });
  } catch (err) {
    return handleError(err);
  }
}
