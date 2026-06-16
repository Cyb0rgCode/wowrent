import { requireSupplier } from "@/lib/auth";
import { CarForm } from "@/components/CarForm";

export const metadata = { title: "List a car — WowRent" };

export default async function NewCarPage() {
  await requireSupplier();
  return (
    <div>
      <h1 className="text-2xl font-bold">List a car</h1>
      <p className="mt-1 text-sm text-gray-600">
        Add the details clients need to book your vehicle.
      </p>
      <div className="mt-6">
        <CarForm />
      </div>
    </div>
  );
}
