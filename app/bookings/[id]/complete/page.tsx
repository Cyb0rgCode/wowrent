import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { finalizeBookingPayment } from "@/lib/payments";
import { formatTND, formatDate } from "@/lib/format";

export default async function CompletePage({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireUser();

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { car: true },
  });
  if (!booking || booking.clientId !== user.id) notFound();

  // Verify against Konnect and finalize (idempotent).
  const result = await finalizeBookingPayment(booking.id);
  const paid = result.status === "PAID";

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div
        className={`mx-auto grid h-16 w-16 place-items-center rounded-full text-3xl ${
          paid ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
        }`}
      >
        {paid ? "✓" : "…"}
      </div>

      <h1 className="mt-5 text-2xl font-bold">
        {paid ? "Booking confirmed!" : "Payment pending"}
      </h1>
      <p className="mt-2 text-gray-600">
        {paid
          ? "Your trip is booked. The owner has been notified."
          : "We haven't received confirmation of your payment yet. If you completed it, refresh in a moment."}
      </p>

      <div className="card mt-6 p-5 text-left">
        <p className="font-semibold">{booking.car.title}</p>
        <p className="text-sm text-gray-500">{booking.car.location}</p>
        <p className="mt-2 text-sm text-gray-600">
          {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
        </p>
        <p className="mt-2 font-semibold">
          Total paid: {formatTND(booking.total)}
        </p>
      </div>

      <div className="mt-6 flex justify-center gap-3">
        <Link href="/trips" className="btn-primary">
          View my trips
        </Link>
        {!paid && (
          <Link href={`/bookings/${booking.id}/pay`} className="btn-secondary">
            Try payment again
          </Link>
        )}
      </div>
    </div>
  );
}
