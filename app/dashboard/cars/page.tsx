import Link from "next/link";
import { requireSupplier } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTND } from "@/lib/format";
import { DeleteCarButton } from "@/components/DeleteCarButton";
import { getDict } from "@/lib/i18n/server";

export const metadata = { title: "My cars — wowRent" };

export default async function MyCarsPage() {
  const t = getDict();
  const user = await requireSupplier();
  const cars = await prisma.car.findMany({
    where: { supplierId: user.supplierProfile!.id },
    include: { _count: { select: { bookings: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.dashboardCars.title}</h1>
        <Link href="/dashboard/cars/new" className="btn-primary">
          {t.dashboardCars.listCar}
        </Link>
      </div>

      {cars.length === 0 ? (
        <div className="card mt-6 p-10 text-center text-gray-500">
          {t.dashboardCars.empty}
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {cars.map((car) => (
            <li key={car.id} className="card flex items-center gap-4 p-4">
              {car.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={car.photos[0]}
                  alt={car.title}
                  className="h-16 w-24 rounded-lg object-cover"
                />
              ) : (
                <div className="grid h-16 w-24 place-items-center rounded-lg bg-gray-100 text-xs text-gray-400">
                  {t.dashboardCars.noPhoto}
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium">{car.title}</p>
                <p className="text-sm text-gray-500">
                  {t.labels.category[
                    car.category as keyof typeof t.labels.category
                  ] ?? car.category}{" "}
                  · {formatTND(car.pricePerDay)}
                  {t.dashboardCars.perDay} · {car._count.bookings}{" "}
                  {t.dashboardCars.bookings}
                </p>
              </div>
              <span
                className={`badge ${
                  car.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {car.status === "ACTIVE"
                  ? t.dashboardCars.statusActive
                  : t.dashboardCars.statusHidden}
              </span>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/cars/${car.id}/edit`}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  {t.dashboardCars.edit}
                </Link>
                <DeleteCarButton carId={car.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
