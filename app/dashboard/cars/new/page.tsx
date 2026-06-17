import { requireSupplier } from "@/lib/auth";
import { CarForm } from "@/components/CarForm";
import { getDict } from "@/lib/i18n/server";

export const metadata = { title: "List a car — wowRent" };

export default async function NewCarPage() {
  const t = getDict();
  await requireSupplier();
  return (
    <div>
      <h1 className="text-2xl font-bold">{t.dashboardCars.newTitle}</h1>
      <p className="mt-1 text-sm text-gray-600">
        {t.dashboardCars.newSubtitle}
      </p>
      <div className="mt-6">
        <CarForm />
      </div>
    </div>
  );
}
