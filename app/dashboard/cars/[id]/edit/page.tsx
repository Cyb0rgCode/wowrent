import { notFound } from "next/navigation";
import { requireSupplier } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CarForm } from "@/components/CarForm";
import { getDict } from "@/lib/i18n/server";

export const metadata = { title: "Edit car — wowRent" };

export default async function EditCarPage({
  params,
}: {
  params: { id: string };
}) {
  const t = getDict();
  const user = await requireSupplier();
  const car = await prisma.car.findUnique({ where: { id: params.id } });
  if (!car || car.supplierId !== user.supplierProfile!.id) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold">{t.dashboardCars.editTitle}</h1>
      <div className="mt-6">
        <CarForm
          initial={{
            id: car.id,
            title: car.title,
            make: car.make,
            model: car.model,
            year: car.year,
            category: car.category,
            transmission: car.transmission,
            fuel: car.fuel,
            seats: car.seats,
            pricePerDay: car.pricePerDay,
            location: car.location,
            description: car.description,
            photos: car.photos,
            status: car.status,
          }}
        />
      </div>
    </div>
  );
}
