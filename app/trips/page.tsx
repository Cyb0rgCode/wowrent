import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatTND, formatDate, STATUS_BADGE } from "@/lib/format";
import { getDict } from "@/lib/i18n/server";
import { TripActions } from "@/components/TripActions";

export const metadata = { title: "My trips — wowRent" };

export default async function TripsPage() {
  const user = await requireUser();
  const t = getDict();

  const bookings = await prisma.booking.findMany({
    where: { clientId: user.id },
    include: { car: true, review: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">{t.trips.title}</h1>

      {bookings.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-gray-500">
          {t.trips.empty}
          <div className="mt-3">
            <Link href="/cars" className="btn-primary">
              {t.trips.browseCars}
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
                      {t.trips.noPhoto}
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
                      {t.labels.status[
                        b.status as keyof typeof t.labels.status
                      ] ?? b.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    {formatDate(b.startDate)} → {formatDate(b.endDate)} ·{" "}
                    {b.days} {b.days === 1 ? t.trips.day : t.trips.days}
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
