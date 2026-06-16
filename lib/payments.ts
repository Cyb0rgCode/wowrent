import "server-only";
import { prisma } from "./prisma";
import { getPaymentStatus } from "./konnect";

export type FinalizeResult = {
  status: "PAID" | "PENDING" | "FAILED" | "NOT_FOUND";
};

/**
 * Verifies a booking's payment against Konnect and updates the booking +
 * payment records accordingly. Idempotent: safe to call from both the return
 * page and the webhook.
 */
export async function finalizeBookingPayment(
  bookingId: string,
): Promise<FinalizeResult> {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
    include: { booking: true },
  });
  if (!payment) return { status: "NOT_FOUND" };
  if (payment.status === "PAID") return { status: "PAID" };
  if (!payment.konnectPaymentRef) return { status: "PENDING" };

  const result = await getPaymentStatus(payment.konnectPaymentRef);

  if (result.completed) {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "PAID" },
      }),
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
      }),
    ]);
    return { status: "PAID" };
  }

  if (result.status === "failed") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });
    return { status: "FAILED" };
  }

  return { status: "PENDING" };
}
