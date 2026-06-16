import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { initPayment } from "@/lib/konnect";
import {
  ok,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  handleError,
  getBaseUrl,
} from "@/lib/api";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { bookingId } = (await req.json()) as { bookingId: string };

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true, car: true },
    });
    if (!booking) return notFound("Booking not found");
    if (booking.clientId !== user.id) return forbidden();
    if (booking.status !== "PENDING") {
      return badRequest("This booking is not awaiting payment");
    }

    const appUrl = getBaseUrl(req);
    const [firstName, ...rest] = user.name.split(" ");

    const init = await initPayment({
      amountTnd: booking.total,
      orderId: booking.id,
      description: `WowRent booking ${booking.id} — ${booking.car.title}`,
      firstName,
      lastName: rest.join(" ") || firstName,
      email: user.email,
      phone: user.phone ?? undefined,
      successUrl: `${appUrl}/bookings/${booking.id}/complete`,
      failUrl: `${appUrl}/bookings/${booking.id}/pay?failed=1`,
      webhookUrl: `${appUrl}/api/payments/webhook`,
    });

    await prisma.payment.update({
      where: { bookingId: booking.id },
      data: { konnectPaymentRef: init.paymentRef },
    });

    return ok({ payUrl: init.payUrl, mocked: init.mocked });
  } catch (err) {
    return handleError(err);
  }
}
