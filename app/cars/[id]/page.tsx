import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  formatTND,
  formatDate,
  CATEGORY_LABELS,
  TRANSMISSION_LABELS,
  FUEL_LABELS,
} from "@/lib/format";
import { StarRating } from "@/components/StarRating";
import { BookingWidget } from "@/components/BookingWidget";
import { ContactOwnerButton } from "@/components/ContactOwnerButton";

export default async function CarDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const car = await prisma.car.findUnique({
    where: { id: params.id },
    include: {
      supplier: { include: { user: { select: { id: true, name: true } } } },
      reviews: {
        include: { author: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!car || car.status !== "ACTIVE") notFound();

  const user = await getCurrentUser();
  const reviewCount = car.reviews.length;
  const avgRating =
    reviewCount > 0
      ? car.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount
      : 0;

  const isOwner = user?.id === car.supplier.user.id;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/cars" className="text-sm text-brand-600">
        ← Back to results
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        {/* Left: gallery + details */}
        <div className="lg:col-span-2">
          <Gallery photos={car.photos} title={car.title} />

          <div className="mt-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h1 className="text-2xl font-bold">{car.title}</h1>
                <p className="mt-1 text-gray-600">
                  {car.make} {car.model} · {car.year} · {car.location}
                </p>
              </div>
              <StarRating rating={avgRating} count={reviewCount} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Spec label="Type" value={CATEGORY_LABELS[car.category]} />
              <Spec
                label="Gearbox"
                value={TRANSMISSION_LABELS[car.transmission]}
              />
              <Spec label="Fuel" value={FUEL_LABELS[car.fuel]} />
              <Spec label="Seats" value={`${car.seats}`} />
            </div>

            {car.description && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold">About this car</h2>
                <p className="mt-2 whitespace-pre-line text-gray-700">
                  {car.description}
                </p>
              </div>
            )}

            <div className="mt-6 card p-4">
              <h2 className="text-sm font-semibold text-gray-500">
                Listed by
              </h2>
              <div className="mt-1 flex items-center justify-between">
                <div>
                  <p className="font-medium">{car.supplier.businessName}</p>
                  <p className="text-sm text-gray-500">
                    {car.supplier.type === "AGENCY"
                      ? "Rental agency"
                      : "Private owner"}
                    {car.supplier.verified && " · ✅ Verified"}
                  </p>
                </div>
                {!isOwner && (
                  <ContactOwnerButton
                    carId={car.id}
                    supplierId={car.supplier.user.id}
                    isLoggedIn={Boolean(user)}
                  />
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold">
                Reviews ({reviewCount})
              </h2>
              {reviewCount === 0 ? (
                <p className="mt-2 text-sm text-gray-500">
                  No reviews yet. Reviews appear after completed trips.
                </p>
              ) : (
                <ul className="mt-3 space-y-4">
                  {car.reviews.map((r) => (
                    <li key={r.id} className="card p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{r.author.name}</p>
                        <StarRating rating={r.rating} />
                      </div>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(r.createdAt)}
                      </p>
                      {r.comment && (
                        <p className="mt-2 text-gray-700">{r.comment}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right: booking widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            {isOwner ? (
              <div className="card p-6 text-center text-sm text-gray-600">
                This is your listing.
                <div className="mt-3">
                  <Link
                    href={`/dashboard/cars/${car.id}/edit`}
                    className="btn-secondary w-full"
                  >
                    Edit listing
                  </Link>
                </div>
              </div>
            ) : (
              <BookingWidget
                carId={car.id}
                pricePerDay={car.pricePerDay}
                isLoggedIn={Boolean(user)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function Gallery({ photos, title }: { photos: string[]; title: string }) {
  if (photos.length === 0) {
    return (
      <div className="grid aspect-[16/9] w-full place-items-center rounded-xl bg-gray-100 text-gray-400">
        No photos
      </div>
    );
  }
  return (
    <div className="grid gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photos[0]}
        alt={title}
        className="aspect-[16/9] w-full rounded-xl object-cover"
      />
      {photos.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {photos.slice(1, 5).map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={p}
              alt={`${title} ${i + 2}`}
              className="aspect-square w-full rounded-lg object-cover"
            />
          ))}
        </div>
      )}
    </div>
  );
}
