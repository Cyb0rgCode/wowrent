import Link from "next/link";
import { formatTND } from "@/lib/format";
import { getDict } from "@/lib/i18n/server";
import { StarRating } from "./StarRating";

export type CarCardData = {
  id: string;
  title: string;
  category: string;
  location: string;
  pricePerDay: number;
  photos: string[];
  transmission: string;
  seats: number;
  avgRating: number;
  reviewCount: number;
  supplierName: string;
  supplierType: string;
};

export function CarCard({ car }: { car: CarCardData }) {
  const cover = car.photos[0];
  const t = getDict();
  return (
    <Link
      href={`/cars/${car.id}`}
      className="card group overflow-hidden transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={car.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-gray-400">
            {t.carCard.noPhoto}
          </div>
        )}
        <span className="badge absolute left-3 top-3 bg-white/90 text-gray-800 shadow">
          {t.labels.category[car.category as keyof typeof t.labels.category] ??
            car.category}
        </span>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{car.title}</h3>
        </div>
        <p className="text-sm text-gray-500">{car.location}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>
            {car.seats} {t.carCard.seats}
          </span>
          <span>·</span>
          <span>
            {t.labels.transmission[
              car.transmission as keyof typeof t.labels.transmission
            ] ?? car.transmission}
          </span>
          <span>·</span>
          <span className="truncate">{car.supplierName}</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <StarRating rating={car.avgRating} count={car.reviewCount} size="sm" />
          <p className="text-sm">
            <span className="text-base font-bold text-gray-900">
              {formatTND(car.pricePerDay)}
            </span>
            <span className="text-gray-500"> {t.carCard.perDay}</span>
          </p>
        </div>
      </div>
    </Link>
  );
}
