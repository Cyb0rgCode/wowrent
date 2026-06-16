import { prisma } from "@/lib/prisma";
import { finalizeBookingPayment } from "@/lib/payments";
import { ok, badRequest } from "@/lib/api";

/**
 * Konnect calls this endpoint (GET with a `payment_ref` query param) when a
 * payment changes state. We look up the matching payment and finalize the
 * booking. Always returns 200 so Konnect does not retry indefinitely.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("payment_ref");
  if (!ref) return badRequest("Missing payment_ref");

  const payment = await prisma.payment.findFirst({
    where: { konnectPaymentRef: ref },
    select: { bookingId: true },
  });
  if (!payment) return ok({ received: true });

  await finalizeBookingPayment(payment.bookingId);
  return ok({ received: true });
}

export async function POST(req: Request) {
  return GET(req);
}
