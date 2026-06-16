import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatTND, formatDate } from "@/lib/format";
import { PayButton } from "@/components/PayButton";

export default async function PayPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { failed?: string };
}) {
  const user = await requireUser();

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { car: true, payment: true },
  });
  if (!booking) notFound();
  if (booking.clientId !== user.id) notFound();

  if (booking.status === "CONFIRMED") {
    redirect(`/bookings/${booking.id}/complete`);
  }
  if (booking.status === "CANCELLED") {
    return (
      <Centered>
        <h1 className="text-xl font-bold">Booking cancelled</h1>
        <p className="mt-2 text-gray-600">This booking was cancelled.</p>
        <Link href="/cars" className="btn-primary mt-4">
          Find another car
        </Link>
      </Centered>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold">Confirm and pay</h1>

      {searchParams.failed && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Your payment didn&apos;t go through. You can try again below.
        </p>
      )}

      <div className="card mt-6 overflow-hidden">
        <div className="flex gap-4 border-b border-gray-100 p-4">
          {booking.car.photos[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={booking.car.photos[0]}
              alt={booking.car.title}
              className="h-20 w-28 rounded-lg object-cover"
            />
          ) : (
            <div className="grid h-20 w-28 place-items-center rounded-lg bg-gray-100 text-xs text-gray-400">
              No photo
            </div>
          )}
          <div>
            <p className="font-semibold">{booking.car.title}</p>
            <p className="text-sm text-gray-500">{booking.car.location}</p>
            <p className="mt-1 text-sm text-gray-600">
              {formatDate(booking.startDate)} → {formatDate(booking.endDate)}
            </p>
          </div>
        </div>

        <div className="space-y-1 p-4 text-sm">
          <Row
            label={`${formatTND(booking.dailyRate)} × ${booking.days} ${
              booking.days === 1 ? "day" : "days"
            }`}
            value={formatTND(booking.subtotal)}
          />
          <Row label="Service fee" value={formatTND(booking.serviceFee)} />
          <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{formatTND(booking.total)}</span>
          </div>
        </div>

        <div className="border-t border-gray-100 p-4">
          <PayButton bookingId={booking.id} />
          <p className="mt-3 text-center text-xs text-gray-400">
            You&apos;ll be redirected to Konnect to pay securely in TND.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-gray-600">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">{children}</div>
  );
}
