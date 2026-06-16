import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatTND, formatDate, STATUS_BADGE } from "@/lib/format";
import { TripActions } from "@/components/TripActions";

export const metadata = { title: "My trips — WowRent" };

export default async function TripsPage() {
  const user = await requireUser();

  const bookings = await prisma.booking.findMany({
    where: { clientId: user.id },
    include: { car: true, review: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">My trips</h1>

      {bookings.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-gray-500">
          You haven&apos;t booked any cars yet.
          <div className="mt-3">
            <Link href="/cars" className="btn-primary">
              Browse cars
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {bookings.map((b) => (
            <li key={b.id} className="card overflow-hidden">
              <div className="flex flex-col gap-4 p-4 sm:flex-row">
                <Link href={`/cars/${b.carId}`} className="shrink-0">
                  {b.car.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={b.car.photos[0]}
                      alt={b.car.title}
                      className="h-28 w-full rounded-lg object-cover sm:w-44"
                    />
                  ) : (
                    <div className="grid h-28 w-full place-items-center rounded-lg bg-gray-100 text-xs text-gray-400 sm:w-44">
                      No photo
                    </div>
                  )}
                </Link>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/cars/${b.carId}`}
                        className="font-semibold hover:underline"
                      >
                        {b.car.title}
                      </Link>
                      <p className="text-sm text-gray-500">{b.car.location}</p>
                    </div>
                    <span className={`badge ${STATUS_BADGE[b.status]}`}>
                      {b.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    {formatDate(b.startDate)} → {formatDate(b.endDate)} ·{" "}
                    {b.days} {b.days === 1 ? "day" : "days"}
                  </p>
                  <p className="text-sm font-semibold">
                    {formatTND(b.total)}
                  </p>

                  <div className="mt-3">
                    <TripActions
                      bookingId={b.id}
                      status={b.status}
                      hasReview={Boolean(b.review)}
                      carId={b.carId}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
