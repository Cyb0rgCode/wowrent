import { findCars, type CarFilters } from "@/lib/cars";
import { CarCard } from "@/components/CarCard";
import { CarFiltersBar } from "@/components/CarFiltersBar";
import { getDict } from "@/lib/i18n/server";

export const metadata = { title: "Browse cars — wowRent" };

function parseFilters(searchParams: Record<string, string | undefined>): CarFilters {
  return {
    q: searchParams.q || undefined,
    location: searchParams.location || undefined,
    category: searchParams.category || undefined,
    transmission: searchParams.transmission || undefined,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    seats: searchParams.seats ? Number(searchParams.seats) : undefined,
  };
}

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const filters = parseFilters(searchParams);
  const cars = await findCars(filters);
  const t = getDict();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">{t.cars.title}</h1>
      <p className="mt-1 text-sm text-gray-600">
        {cars.length}{" "}
        {cars.length === 1 ? t.cars.carsAvailableOne : t.cars.carsAvailableMany}
      </p>

      <div className="mt-6">
        <CarFiltersBar initial={filters} />
      </div>

      {cars.length === 0 ? (
        <div className="card mt-8 p-10 text-center text-gray-500">
          {t.cars.noMatch}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}
